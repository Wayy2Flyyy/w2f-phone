-- Single source of truth for every w2f-phone:server:* ox_lib callback.
-- Each handler:
--   1. Resolves the player + active phone via Security.
--   2. Applies per-action cooldowns + validation.
--   3. Defers to the matching W2FPhone.<Module> implementation.
--   4. Returns { ok = bool, data?, code?, message? } so the NUI gets a stable shape.

local Core = W2FPhone.Core
local Security = W2FPhone.Security
local Audit = W2FPhone.Audit
local Constants = W2FPhone.Constants

local function fail(code, message)
    return { ok = false, code = code or 'UNKNOWN', message = message }
end

local function ok(data)
    return { ok = true, data = data }
end

-- Resolves + asserts. Returns: ok, src, phoneId, citizenid, errCode
local function resolve(src)
    if not src or src <= 0 then return false, src, nil, nil, 'NO_SRC' end
    local pid, num, owner, isStolen = Security.ResolveActivePhone(src)
    if not pid then return false, src, nil, Core.GetCitizenId(src), 'NO_PHONE' end
    Core.RegisterOnlinePlayer(src)
    return true, src, pid, Core.GetCitizenId(src), nil, num, owner, isStolen
end

local function guard(action, body, src)
    if not Security.CheckCooldown(src, action) then
        Audit.SecurityReject(src, action, 'cooldown', { body = body })
        return false, fail('COOLDOWN', 'Slow down.')
    end
    local good, _, phoneId, citizenid, err = resolve(src)
    if not good then
        Audit.SecurityReject(src, action, err or 'no_phone', { body = body })
        return false, fail(err or 'NO_PHONE')
    end
    return true, nil, phoneId, citizenid
end

-- Bootstrap --------------------------------------------------------------------

lib.callback.register('w2f-phone:server:getPhoneData', function(src, body)
    local data, err = W2FPhone.BuildBootstrap(src, body and body.slot or nil)
    if not data then return fail(err or 'BOOTSTRAP_FAILED') end
    return ok(data)
end)

-- Contacts ---------------------------------------------------------------------

lib.callback.register('w2f-phone:server:getContacts', function(src, body)
    local good, errRes, phoneId = guard('getContacts', body, src)
    if not good then return errRes end
    return ok(W2FPhone.Contacts.List(phoneId, body and body.search))
end)

lib.callback.register('w2f-phone:server:addContact', function(src, body)
    local good, errRes, phoneId, citizenid = guard('addContact', body, src)
    if not good then return errRes end
    return W2FPhone.Contacts.Add(phoneId, citizenid, body or {})
end)

lib.callback.register('w2f-phone:server:updateContact', function(src, body)
    local good, errRes, phoneId, citizenid = guard('updateContact', body, src)
    if not good then return errRes end
    return W2FPhone.Contacts.Update(phoneId, citizenid, body or {})
end)

lib.callback.register('w2f-phone:server:deleteContact', function(src, body)
    local good, errRes, phoneId, citizenid = guard('deleteContact', body, src)
    if not good then return errRes end
    return W2FPhone.Contacts.Delete(phoneId, citizenid, body and body.id)
end)

lib.callback.register('w2f-phone:server:toggleFavouriteContact', function(src, body)
    local good, errRes, phoneId = guard('toggleFavouriteContact', body, src)
    if not good then return errRes end
    return W2FPhone.Contacts.ToggleFavourite(phoneId, body and body.id)
end)

lib.callback.register('w2f-phone:server:blockContact', function(src, body)
    local good, errRes, phoneId, citizenid = guard('blockContact', body, src)
    if not good then return errRes end
    return W2FPhone.Contacts.ToggleBlocked(phoneId, citizenid, body and body.id, body and body.blocked)
end)

-- Messages ---------------------------------------------------------------------

lib.callback.register('w2f-phone:server:getConversations', function(src, body)
    local good, errRes, phoneId, citizenid = guard('getConversations', body, src)
    if not good then return errRes end
    local _, number = Security.ResolveActivePhone(src)
    return ok(W2FPhone.Messages.GetConversations(phoneId, number))
end)

lib.callback.register('w2f-phone:server:getMessages', function(src, body)
    local good, errRes, phoneId = guard('getMessages', body, src)
    if not good then return errRes end
    local _, number = Security.ResolveActivePhone(src)
    return ok(W2FPhone.Messages.GetMessages(phoneId, number, body and body.otherNumber, body and body.limit))
end)

lib.callback.register('w2f-phone:server:sendMessage', function(src, body)
    local good, errRes, phoneId, citizenid = guard('sendMessage', body, src)
    if not good then return errRes end
    local _, number = Security.ResolveActivePhone(src)
    return W2FPhone.Messages.Send(src, phoneId, citizenid, number, body or {})
end)

lib.callback.register('w2f-phone:server:markConversationRead', function(src, body)
    local good, errRes, phoneId = guard('markConversationRead', body, src)
    if not good then return errRes end
    local _, number = Security.ResolveActivePhone(src)
    return W2FPhone.Messages.MarkRead(phoneId, number, body and body.otherNumber)
end)

-- Calls ------------------------------------------------------------------------

lib.callback.register('w2f-phone:server:getCallHistory', function(src, body)
    local good, errRes, phoneId = guard('getCallHistory', body, src)
    if not good then return errRes end
    local _, number = Security.ResolveActivePhone(src)
    return ok(W2FPhone.Calls.History(phoneId, number, body and body.limit))
end)

lib.callback.register('w2f-phone:server:startCall', function(src, body)
    local good, errRes, phoneId, citizenid = guard('startCall', body, src)
    if not good then return errRes end
    local _, number = Security.ResolveActivePhone(src)
    return W2FPhone.Calls.Start(src, phoneId, citizenid, number, body or {})
end)

lib.callback.register('w2f-phone:server:acceptCall', function(src, body)
    local good, errRes, phoneId = guard('acceptCall', body, src)
    if not good then return errRes end
    return W2FPhone.Calls.Accept(src, phoneId, body and body.callId)
end)

lib.callback.register('w2f-phone:server:declineCall', function(src, body)
    local good, errRes, phoneId = guard('declineCall', body, src)
    if not good then return errRes end
    return W2FPhone.Calls.Decline(src, phoneId, body and body.callId)
end)

lib.callback.register('w2f-phone:server:endCall', function(src, body)
    local good, errRes, phoneId = guard('endCall', body, src)
    if not good then return errRes end
    return W2FPhone.Calls.End(src, phoneId, body and body.callId)
end)

-- Banking ----------------------------------------------------------------------

lib.callback.register('w2f-phone:server:getBankData', function(src, body)
    local good, errRes = guard('getBankData', body, src)
    if not good then return errRes end
    return ok(W2FPhone.Banking.Snapshot(src))
end)

-- Vehicles ---------------------------------------------------------------------

lib.callback.register('w2f-phone:server:getVehicles', function(src, body)
    local good, errRes, phoneId, citizenid = guard('getVehicles', body, src)
    if not good then return errRes end
    return ok(W2FPhone.Vehicles.ListForCitizen(citizenid))
end)

-- Notifications ----------------------------------------------------------------

lib.callback.register('w2f-phone:server:getNotifications', function(src, body)
    local good, errRes, phoneId = guard('getNotifications', body, src)
    if not good then return errRes end
    return ok(W2FPhone.Notifications.List(phoneId))
end)

lib.callback.register('w2f-phone:server:markNotificationRead', function(src, body)
    local good, errRes, phoneId = guard('markNotificationRead', body, src)
    if not good then return errRes end
    return W2FPhone.Notifications.MarkRead(phoneId, body and body.id)
end)

lib.callback.register('w2f-phone:server:clearNotifications', function(src, body)
    local good, errRes, phoneId = guard('clearNotifications', body, src)
    if not good then return errRes end
    return W2FPhone.Notifications.ClearAll(phoneId)
end)

-- Notes ------------------------------------------------------------------------

lib.callback.register('w2f-phone:server:getNotes', function(src, body)
    local good, errRes, phoneId = guard('getNotes', body, src)
    if not good then return errRes end
    return ok(W2FPhone.Notes.List(phoneId, body and body.search))
end)

lib.callback.register('w2f-phone:server:createNote', function(src, body)
    local good, errRes, phoneId, citizenid = guard('createNote', body, src)
    if not good then return errRes end
    return W2FPhone.Notes.Create(phoneId, citizenid, body or {})
end)

lib.callback.register('w2f-phone:server:updateNote', function(src, body)
    local good, errRes, phoneId, citizenid = guard('updateNote', body, src)
    if not good then return errRes end
    return W2FPhone.Notes.Update(phoneId, citizenid, body or {})
end)

lib.callback.register('w2f-phone:server:deleteNote', function(src, body)
    local good, errRes, phoneId, citizenid = guard('deleteNote', body, src)
    if not good then return errRes end
    return W2FPhone.Notes.Delete(phoneId, citizenid, body and body.id)
end)

-- Media ------------------------------------------------------------------------

lib.callback.register('w2f-phone:server:getMedia', function(src, body)
    local good, errRes, phoneId = guard('getMedia', body, src)
    if not good then return errRes end
    return ok(W2FPhone.Media.List(phoneId))
end)

lib.callback.register('w2f-phone:server:saveMedia', function(src, body)
    local good, errRes, phoneId, citizenid = guard('saveMedia', body, src)
    if not good then return errRes end
    return W2FPhone.Media.Save(phoneId, citizenid, body or {})
end)

-- Share ------------------------------------------------------------------------

lib.callback.register('w2f-phone:server:sharePayload', function(src, body)
    local good, errRes, phoneId, citizenid = guard('sharePayload', body, src)
    if not good then return errRes end
    return W2FPhone.Share.Send(src, phoneId, citizenid, body or {})
end)

-- Settings ---------------------------------------------------------------------

lib.callback.register('w2f-phone:server:saveSettings', function(src, body)
    local good, errRes, phoneId, citizenid = guard('saveSettings', body, src)
    if not good then return errRes end
    local sanitized = W2FPhone.Validation.SanitizeSettings(body and body.settings or {})
    W2FPhone.Database.SaveUserSettings(citizenid, sanitized)
    if sanitized.deviceName and W2FPhone.Validation.DeviceName(sanitized.deviceName) then
        W2FPhone.Database.UpdateDeviceName(phoneId, sanitized.deviceName)
    end
    Audit.Write(phoneId, citizenid, Constants.AuditActions.SETTINGS_CHANGED,
        'settings saved', { keys = (function() local k = {}; for kk in pairs(sanitized) do k[#k+1] = kk end return k end)() })
    return ok(sanitized)
end)

lib.callback.register('w2f-phone:server:getAvailableApps', function(src, body)
    local good, errRes = guard('getAvailableApps', body, src)
    if not good then return errRes end
    local pd = Core.GetPlayerData(src)
    local jobName = pd and pd.job and (pd.job.name or pd.job.type) or nil
    local visible = {}
    for _, app in ipairs(W2FPhone.Apps.GetRegistry()) do
        if W2FPhone.Apps.IsVisibleForJob(app, jobName) then
            visible[#visible + 1] = app
        end
    end
    return ok(visible)
end)

-- Police -----------------------------------------------------------------------

local function policeGuard(src, action)
    if not Core.IsPolice(src) then
        Audit.SecurityReject(src, action, 'not_police')
        return fail('NOT_POLICE', 'Police access required.')
    end
    return nil
end

lib.callback.register('w2f-phone:server:openPoliceMdt', function(src)
    local errRes = policeGuard(src, 'openPoliceMdt'); if errRes then return errRes end
    local phoneId = select(2, Security.AssertOwnsPhone(src, nil))
    Audit.Write(phoneId, Core.GetCitizenId(src), Constants.AuditActions.POLICE_APP_OPENED,
        'opened MDT', {})
    if GetResourceState(Config.Police.Resource) == 'started' then
        TriggerClientEvent(Config.Police.OpenMdtEvent, src)
        return ok({ launched = true })
    end
    return ok({ launched = false, reason = 'NO_W2F_POLICE' })
end)

lib.callback.register('w2f-phone:server:openPoliceStatus', function(src)
    local errRes = policeGuard(src, 'openPoliceStatus'); if errRes then return errRes end
    if GetResourceState(Config.Police.Resource) == 'started' then
        TriggerClientEvent(Config.Police.OpenStatusEvent, src)
        return ok({ launched = true })
    end
    return ok({ launched = false, reason = 'NO_W2F_POLICE' })
end)

lib.callback.register('w2f-phone:server:triggerPolicePanic', function(src, body)
    local errRes = policeGuard(src, 'triggerPolicePanic'); if errRes then return errRes end
    if not Security.CheckCooldown(src, 'triggerPolicePanic') then
        return fail('COOLDOWN', 'Panic on cooldown.')
    end
    if Config.Police.RequireOnDutyForPanic then
        local job = Core.GetJob(src)
        if not job or not job.onduty then return fail('OFF_DUTY', 'Must be on duty.') end
    end
    local phoneId = select(2, Security.AssertOwnsPhone(src, nil))
    Audit.Write(phoneId, Core.GetCitizenId(src), Constants.AuditActions.PANIC_TRIGGERED,
        'panic pressed', { src = src })
    if GetResourceState(Config.Police.Resource) == 'started' then
        TriggerEvent(Config.Police.PanicEvent, src, body or {})
        return ok({ dispatched = true })
    end
    return ok({ dispatched = false, reason = 'NO_W2F_POLICE' })
end)

print('^2[W2F-Phone] Server callbacks registered.^7')
