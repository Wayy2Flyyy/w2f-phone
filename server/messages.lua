local Messages = W2FPhone.Messages
local Utils = W2FPhone.Utils
local Core = W2FPhone.Core
local Validation = W2FPhone.Validation
local Audit = W2FPhone.Audit
local Constants = W2FPhone.Constants

-- Convert a raw DB row to wire shape.
local function rowToMessage(r)
    return {
        id = r.id,
        conversationId = r.conversation_id,
        senderPhoneId = r.sender_phone_id,
        senderNumber = r.sender_number,
        receiverNumber = r.receiver_number,
        message = r.message,
        attachments = Utils.SafeJsonDecode(r.attachments, {}),
        read = r.read_state == 1,
        createdAt = r.created_at,
    }
end

function Messages.GetConversations(phoneId, myNumber)
    if not myNumber then return {} end
    -- Group by counterparty, get the latest message + unread count.
    local rows = MySQL.query.await(
        [[SELECT
              CASE WHEN sender_number = ? THEN receiver_number ELSE sender_number END AS other_number,
              MAX(created_at) AS last_at,
              SUM(CASE WHEN receiver_number = ? AND read_state = 0 THEN 1 ELSE 0 END) AS unread
          FROM w2f_phone_messages
          WHERE sender_number = ? OR receiver_number = ?
          GROUP BY other_number
          ORDER BY last_at DESC
          LIMIT 100]],
        { myNumber, myNumber, myNumber, myNumber }
    ) or {}

    local out = {}
    for i, r in ipairs(rows) do
        -- Latest message body (one extra query per conv; cap at 100 conversations).
        local last = MySQL.single.await(
            [[SELECT message, sender_number, created_at
              FROM w2f_phone_messages
              WHERE ((sender_number = ? AND receiver_number = ?) OR (sender_number = ? AND receiver_number = ?))
              ORDER BY created_at DESC LIMIT 1]],
            { myNumber, r.other_number, r.other_number, myNumber }
        )
        -- Resolve a display name from contacts if present.
        local contact = MySQL.single.await(
            'SELECT contact_name FROM w2f_phone_contacts WHERE phone_id = ? AND phone_number = ? LIMIT 1',
            { phoneId, r.other_number }
        )
        out[i] = {
            otherNumber = r.other_number,
            displayName = contact and contact.contact_name or r.other_number,
            lastMessage = last and last.message or '',
            lastFromMe = last and last.sender_number == myNumber,
            lastAt = last and last.created_at or r.last_at,
            unread = tonumber(r.unread) or 0,
        }
    end
    return out
end

function Messages.GetMessages(phoneId, myNumber, otherNumber, limit)
    if not myNumber or not otherNumber then return {} end
    limit = tonumber(limit) or 200
    if limit > 500 then limit = 500 end
    local rows = MySQL.query.await(
        [[SELECT * FROM w2f_phone_messages
          WHERE (sender_number = ? AND receiver_number = ?)
             OR (sender_number = ? AND receiver_number = ?)
          ORDER BY created_at ASC
          LIMIT ?]],
        { myNumber, otherNumber, otherNumber, myNumber, limit }
    ) or {}
    local out = {}
    for i, r in ipairs(rows) do out[i] = rowToMessage(r) end
    return out
end

function Messages.Send(src, phoneId, citizenid, myNumber, body)
    local receiver = Utils.Sanitize(Utils.Trim(body.receiver or ''))
    local message = Utils.Sanitize(body.message or '')
    if not Validation.PhoneNumber(receiver) then return { ok = false, code = 'BAD_RECEIVER' } end
    if not Validation.Message(message) then return { ok = false, code = 'BAD_MESSAGE' } end
    if receiver == myNumber then return { ok = false, code = 'SELF' } end

    -- Block list.
    if W2FPhone.Contacts.IsBlocked(phoneId, receiver) then
        return { ok = false, code = 'BLOCKED' }
    end

    local convId = W2FPhone.Core.ConversationId(myNumber, receiver)
    local now = os.time()
    local id = MySQL.insert.await(
        [[INSERT INTO w2f_phone_messages
          (conversation_id, sender_phone_id, sender_citizenid, sender_number, receiver_number,
           message, attachments, read_state, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)]],
        {
            convId, phoneId, citizenid, myNumber, receiver, message,
            Utils.SafeJsonEncode(body.attachments or {}, '[]'),
            now,
        }
    )

    Audit.Write(phoneId, citizenid, Constants.AuditActions.MESSAGE_SENT,
        'message sent', { id = id, to = receiver, len = #message })

    -- Live push to recipient if online.
    local recvSrc = Core.GetSourceByPhoneNumber(receiver)
    if recvSrc then
        local payload = {
            id = id,
            conversationId = convId,
            senderNumber = myNumber,
            receiverNumber = receiver,
            message = message,
            attachments = body.attachments or {},
            createdAt = now,
        }
        TriggerClientEvent('w2f-phone:client:messageReceived', recvSrc, payload)
        -- Generate a notification record + banner.
        W2FPhone.Notifications.Push({
            phoneId = nil, -- resolved via recipient citizenid below
            recipientSrc = recvSrc,
            app = 'messages',
            title = ('Message from %s'):format(myNumber),
            message = #message > 80 and (message:sub(1, 80) .. '...') or message,
            data = { from = myNumber, conversationId = convId },
        })
    end

    return {
        ok = true,
        data = {
            id = id,
            conversationId = convId,
            senderNumber = myNumber,
            receiverNumber = receiver,
            message = message,
            attachments = body.attachments or {},
            createdAt = now,
        },
    }
end

function Messages.MarkRead(phoneId, myNumber, otherNumber)
    if not myNumber or not otherNumber then return { ok = false, code = 'BAD_ARGS' } end
    MySQL.update.await(
        [[UPDATE w2f_phone_messages SET read_state = 1
          WHERE receiver_number = ? AND sender_number = ? AND read_state = 0]],
        { myNumber, otherNumber }
    )
    return { ok = true }
end
