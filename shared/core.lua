-- Shared helpers safe on both client and server. Server-only Qbox glue lives in server/core.lua.
local Utils = W2FPhone.Utils

function W2FPhone.Core.FormatPhoneNumber(raw)
    if type(raw) ~= 'string' then return raw end
    local digits = raw:gsub('%D', '')
    if #digits <= 3 then return digits end
    return digits:sub(1, 3) .. '-' .. digits:sub(4)
end

function W2FPhone.Core.NormalizePhoneNumber(raw)
    if type(raw) ~= 'string' then return nil end
    return (raw:gsub('%D', ''))
end

function W2FPhone.Core.ConversationId(numberA, numberB)
    if not numberA or not numberB then return nil end
    local a, b = tostring(numberA), tostring(numberB)
    if a < b then return a .. ':' .. b end
    return b .. ':' .. a
end

function W2FPhone.Core.NowSeconds()
    return os.time()
end

function W2FPhone.Core.DebugPrint(...)
    if not Config or not Config.Phone or not Config.Phone.Debug then return end
    print('^5[W2F-Phone][debug]^7', ...)
end
