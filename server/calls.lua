local Calls = W2FPhone.Calls
local Utils = W2FPhone.Utils
local Core = W2FPhone.Core
local Audit = W2FPhone.Audit
local Constants = W2FPhone.Constants
local States = W2FPhone.Constants.CallStates

-- Active calls (in-memory mirror; DB is source of truth for history).
local Active = {} -- [callId] = { id, callerSrc, receiverSrc, ... }

local function snapshot(call)
    return {
        id = call.id,
        callerNumber = call.caller_number,
        receiverNumber = call.receiver_number,
        state = call.call_state,
        type = call.call_type,
        speaker = call.speaker_enabled == 1 or call.speaker_enabled == true,
        video = call.video_enabled == 1 or call.video_enabled == true,
        createdAt = call.created_at,
        duration = call.duration,
    }
end

function Calls.History(phoneId, myNumber, limit)
    if not myNumber then return {} end
    limit = tonumber(limit) or 50
    if limit > 200 then limit = 200 end
    local rows = MySQL.query.await(
        [[SELECT * FROM w2f_phone_calls
          WHERE caller_number = ? OR receiver_number = ?
          ORDER BY created_at DESC LIMIT ?]],
        { myNumber, myNumber, limit }
    ) or {}
    local out = {}
    for i, r in ipairs(rows) do
        out[i] = snapshot(r)
        out[i].direction = r.caller_number == myNumber and 'out' or 'in'
    end
    return out
end

function Calls.Start(src, phoneId, citizenid, myNumber, body)
    local target = Utils.Sanitize(Utils.Trim(body.target or ''))
    if not W2FPhone.Validation.PhoneNumber(target) then
        return { ok = false, code = 'BAD_TARGET' }
    end
    if target == myNumber then return { ok = false, code = 'SELF' } end

    -- One outgoing call at a time per source.
    for _, c in pairs(Active) do
        if c.callerSrc == src and (c.call_state == States.Outgoing or c.call_state == States.Active) then
            return { ok = false, code = 'BUSY' }
        end
    end

    local recvSrc = Core.GetSourceByPhoneNumber(target)
    local now = os.time()
    local state = recvSrc and States.Outgoing or States.Missed

    local id = MySQL.insert.await(
        [[INSERT INTO w2f_phone_calls
          (caller_phone_id, caller_number, receiver_number, call_type, call_state,
           duration, speaker_enabled, video_enabled, created_at)
          VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?)]],
        {
            phoneId, myNumber, target,
            body.video and Constants.CallTypes.Video or Constants.CallTypes.Voice,
            state,
            body.speaker and 1 or 0,
            body.video and 1 or 0,
            now,
        }
    )

    local call = {
        id = id,
        caller_phone_id = phoneId,
        caller_number = myNumber,
        receiver_number = target,
        call_type = body.video and 'video' or 'voice',
        call_state = state,
        speaker_enabled = body.speaker and 1 or 0,
        video_enabled = body.video and 1 or 0,
        created_at = now,
        callerSrc = src,
        receiverSrc = recvSrc,
        startedAt = GetGameTimer(),
    }
    Active[id] = call

    Audit.Write(phoneId, citizenid, Constants.AuditActions.CALL_STARTED,
        'call initiated', { id = id, to = target, online = recvSrc ~= nil })

    -- Push to caller (always) and to receiver (if online).
    TriggerClientEvent('w2f-phone:client:callOutgoing', src, snapshot(call))
    if recvSrc then
        TriggerClientEvent('w2f-phone:client:callIncoming', recvSrc, snapshot(call))
        -- Surface a notification too.
        W2FPhone.Notifications.Push({
            recipientSrc = recvSrc,
            app = 'phone',
            title = 'Incoming call',
            message = ('From %s'):format(myNumber),
            data = { callId = id, from = myNumber },
        })
    end

    return { ok = true, data = snapshot(call) }
end

local function endCallRow(id, finalState)
    local call = Active[id]
    if not call then return nil end
    local duration = math.max(0, math.floor((GetGameTimer() - (call.startedAt or 0)) / 1000))
    MySQL.update.await(
        'UPDATE w2f_phone_calls SET call_state = ?, duration = ? WHERE id = ?',
        { finalState, duration, id }
    )
    call.call_state = finalState
    call.duration = duration
    return call
end

function Calls.Accept(src, phoneId, callId)
    callId = tonumber(callId)
    local call = Active[callId]
    if not call then return { ok = false, code = 'NOT_FOUND' } end
    if call.receiverSrc ~= src then return { ok = false, code = 'NOT_RECIPIENT' } end

    call.call_state = States.Active
    call.startedAt = GetGameTimer()
    MySQL.update.await(
        'UPDATE w2f_phone_calls SET call_state = ? WHERE id = ?',
        { States.Active, callId }
    )
    -- TODO: pma-voice channel join for caller + receiver here.

    TriggerClientEvent('w2f-phone:client:callAccepted', call.callerSrc, snapshot(call))
    TriggerClientEvent('w2f-phone:client:callAccepted', src, snapshot(call))
    return { ok = true, data = snapshot(call) }
end

function Calls.Decline(src, phoneId, callId)
    callId = tonumber(callId)
    local call = Active[callId]
    if not call then return { ok = false, code = 'NOT_FOUND' } end
    if call.receiverSrc ~= src then return { ok = false, code = 'NOT_RECIPIENT' } end
    endCallRow(callId, States.Declined)
    TriggerClientEvent('w2f-phone:client:callDeclined', call.callerSrc, snapshot(call))
    TriggerClientEvent('w2f-phone:client:callDeclined', src, snapshot(call))
    Active[callId] = nil
    return { ok = true }
end

function Calls.End(src, phoneId, callId)
    callId = tonumber(callId)
    local call = Active[callId]
    if not call then return { ok = false, code = 'NOT_FOUND' } end
    if call.callerSrc ~= src and call.receiverSrc ~= src then return { ok = false, code = 'NOT_PARTICIPANT' } end

    endCallRow(callId, States.Ended)
    -- TODO: pma-voice channel leave here.
    if call.callerSrc then
        TriggerClientEvent('w2f-phone:client:callEnded', call.callerSrc, snapshot(call))
    end
    if call.receiverSrc then
        TriggerClientEvent('w2f-phone:client:callEnded', call.receiverSrc, snapshot(call))
    end

    Audit.Write(phoneId, W2FPhone.Core.GetCitizenId(src), Constants.AuditActions.CALL_ENDED,
        'call ended', { id = callId, duration = call.duration })
    Active[callId] = nil
    return { ok = true }
end

-- Cleanup on dropped players: end any active calls they were in.
AddEventHandler('playerDropped', function()
    local src = source
    for id, c in pairs(Active) do
        if c.callerSrc == src or c.receiverSrc == src then
            endCallRow(id, States.Ended)
            local other = c.callerSrc == src and c.receiverSrc or c.callerSrc
            if other then
                TriggerClientEvent('w2f-phone:client:callEnded', other, snapshot(c))
            end
            Active[id] = nil
        end
    end
end)
