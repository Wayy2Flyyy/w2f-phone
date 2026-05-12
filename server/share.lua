local Share = W2FPhone.Share
local Utils = W2FPhone.Utils
local Core = W2FPhone.Core
local Audit = W2FPhone.Audit
local Constants = W2FPhone.Constants

local KINDS = {
    contact   = true,
    number    = true,
    location  = true,
    vehicle   = true, -- foundation
    invoice   = true, -- foundation
    media     = true, -- foundation
}

-- Sanitize the share payload by kind so we never forward arbitrary client tables.
local function sanitizePayload(kind, raw)
    if type(raw) ~= 'table' then return nil end
    if kind == 'contact' then
        return {
            name = Utils.Truncate(Utils.Sanitize(raw.name or ''), 64),
            number = Utils.Truncate(Utils.Sanitize(raw.number or ''), 16),
        }
    elseif kind == 'number' then
        return { number = Utils.Truncate(Utils.Sanitize(raw.number or ''), 16) }
    elseif kind == 'location' then
        local lat, lng = tonumber(raw.lat), tonumber(raw.lng)
        if not lat or not lng then return nil end
        return { lat = lat, lng = lng, label = Utils.Truncate(Utils.Sanitize(raw.label or ''), 80) }
    elseif kind == 'vehicle' then
        return {
            plate = Utils.Truncate(Utils.Sanitize(raw.plate or ''), 12),
            model = Utils.Truncate(Utils.Sanitize(raw.model or ''), 32),
        }
    elseif kind == 'invoice' then
        return {
            amount = tonumber(raw.amount) or 0,
            label = Utils.Truncate(Utils.Sanitize(raw.label or ''), 80),
        }
    elseif kind == 'media' then
        return { url = Utils.Truncate(Utils.Sanitize(raw.url or ''), 512) }
    end
    return nil
end

function Share.Send(src, phoneId, citizenid, body)
    local kind = body.kind
    if not kind or not KINDS[kind] then
        return { ok = false, code = 'BAD_KIND' }
    end
    local target = Utils.Trim(body.targetNumber or '')
    if target == '' or not W2FPhone.Validation.PhoneNumber(target) then
        return { ok = false, code = 'BAD_TARGET' }
    end
    local payload = sanitizePayload(kind, body.payload)
    if not payload then return { ok = false, code = 'BAD_PAYLOAD' } end

    local recvSrc = Core.GetSourceByPhoneNumber(target)

    Audit.Write(phoneId, citizenid, Constants.AuditActions.SHARE_SENT,
        ('share %s -> %s'):format(kind, target), { kind = kind })

    if recvSrc then
        local _, myNumber = W2FPhone.Security.ResolveActivePhone(src)
        TriggerClientEvent('w2f-phone:client:shareReceived', recvSrc, {
            kind = kind,
            payload = payload,
            from = myNumber,
            preview = (function()
                if kind == 'contact' then return ('%s — %s'):format(payload.name or '?', payload.number or '?') end
                if kind == 'number' then return payload.number end
                if kind == 'location' then return payload.label ~= '' and payload.label or 'Pinned location' end
                if kind == 'vehicle' then return ('%s (%s)'):format(payload.model, payload.plate) end
                if kind == 'invoice' then return ('Invoice $%s'):format(payload.amount) end
                return kind
            end)(),
            createdAt = os.time(),
        })
        return { ok = true, data = { delivered = true } }
    end
    return { ok = true, data = { delivered = false, reason = 'OFFLINE' } }
end
