local Notifications = W2FPhone.Notifications
local Utils = W2FPhone.Utils
local Core = W2FPhone.Core
local Security = W2FPhone.Security

local function rowToNotif(r)
    return {
        id = r.id,
        app = r.app,
        title = r.title,
        message = r.message,
        data = Utils.SafeJsonDecode(r.data, {}),
        read = r.read_state == 1,
        createdAt = r.created_at,
    }
end

function Notifications.List(phoneId)
    if not phoneId then return {} end
    local rows = MySQL.query.await(
        [[SELECT * FROM w2f_phone_notifications
          WHERE phone_id = ?
          ORDER BY created_at DESC LIMIT ?]],
        { phoneId, Config.Phone.MaxNotifications or 50 }
    ) or {}
    local out = {}
    for i, r in ipairs(rows) do out[i] = rowToNotif(r) end
    return out
end

function Notifications.MarkRead(phoneId, id)
    id = tonumber(id)
    if not id then return { ok = false, code = 'BAD_ID' } end
    MySQL.update.await(
        'UPDATE w2f_phone_notifications SET read_state = 1 WHERE id = ? AND phone_id = ?',
        { id, phoneId }
    )
    return { ok = true }
end

function Notifications.ClearAll(phoneId)
    MySQL.update.await(
        'DELETE FROM w2f_phone_notifications WHERE phone_id = ?',
        { phoneId }
    )
    return { ok = true }
end

-- Internal helper used by messages.lua / calls.lua / share.lua to enqueue + push.
-- Accepts either recipientSrc OR phoneId; resolves the missing one.
function Notifications.Push(params)
    if not Config.Phone.UseNotifications then return end
    local recvSrc = params.recipientSrc
    local phoneId = params.phoneId
    local citizenid

    if recvSrc and not phoneId then
        phoneId = select(1, Security.ResolveActivePhone(recvSrc))
        citizenid = Core.GetCitizenId(recvSrc)
    elseif phoneId and not recvSrc then
        recvSrc = Core.GetSourceByPhoneId(phoneId)
    end
    if not phoneId then return end

    local id
    if Config.Notifications and Config.Notifications.StoreInDatabase ~= false then
        id = MySQL.insert.await(
            [[INSERT INTO w2f_phone_notifications (phone_id, citizenid, app, title, message, data, read_state, created_at)
              VALUES (?, ?, ?, ?, ?, ?, 0, ?)]],
            {
                phoneId, citizenid,
                params.app or 'system',
                Utils.Truncate(Utils.Sanitize(params.title or 'Notification'), 120),
                Utils.Sanitize(params.message or ''),
                Utils.SafeJsonEncode(params.data or {}, '{}'),
                os.time(),
            }
        )
    end

    if recvSrc then
        TriggerClientEvent('w2f-phone:client:notification', recvSrc, {
            id = id,
            app = params.app,
            title = params.title,
            message = params.message,
            data = params.data,
            createdAt = os.time(),
        })
    end
end

-- Public export so any sibling W2F resource can push a notification by citizenid.
exports('PushNotificationByCitizenId', function(citizenid, payload)
    if not citizenid or type(payload) ~= 'table' then return end
    local src = Core.GetSourceByCitizenId(citizenid)
    if not src then return end
    Notifications.Push({
        recipientSrc = src,
        app = payload.app or 'system',
        title = payload.title,
        message = payload.message,
        data = payload.data,
    })
end)
