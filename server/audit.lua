local Audit = W2FPhone.Audit
local Utils = W2FPhone.Utils
local Actions = W2FPhone.Constants.AuditActions

function Audit.Write(phoneId, citizenid, action, message, metadata)
    -- Non-blocking insert. Failures are swallowed deliberately; a broken audit
    -- write must never cascade and crash a user-facing action.
    local payload = Utils.SafeJsonEncode(metadata or {}, '{}')
    MySQL.insert(
        [[INSERT INTO w2f_phone_audit_logs (phone_id, citizenid, action, message, metadata, created_at)
          VALUES (?, ?, ?, ?, ?, ?)]],
        { phoneId, citizenid, action, message, payload, os.time() }
    )
end

function Audit.SecurityReject(src, action, reason, extra)
    Audit.Write(
        (extra and extra.phoneId) or nil,
        (extra and extra.citizenid) or nil,
        Actions.SECURITY_REJECT,
        ('src=%s action=%s reason=%s'):format(tostring(src or '?'), action, reason),
        extra
    )
end

return Audit
