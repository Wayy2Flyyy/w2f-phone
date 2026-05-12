local Utils = W2FPhone.Utils

function Utils.IsString(v) return type(v) == 'string' end
function Utils.IsNumber(v) return type(v) == 'number' end
function Utils.IsTable(v)  return type(v) == 'table'  end

function Utils.Trim(s)
    if type(s) ~= 'string' then return s end
    return (s:gsub('^%s*(.-)%s*$', '%1'))
end

function Utils.Clamp(n, lo, hi)
    if n < lo then return lo end
    if n > hi then return hi end
    return n
end

function Utils.ShallowCopy(t)
    if type(t) ~= 'table' then return t end
    local out = {}
    for k, v in pairs(t) do out[k] = v end
    return out
end

function Utils.SafeJsonDecode(str, fallback)
    if type(str) ~= 'string' or str == '' then return fallback end
    local ok, decoded = pcall(json.decode, str)
    if ok and decoded ~= nil then return decoded end
    return fallback
end

function Utils.SafeJsonEncode(value, fallback)
    if value == nil then return fallback end
    local ok, encoded = pcall(json.encode, value)
    if ok then return encoded end
    return fallback
end

function Utils.GenerateUid(prefix)
    -- Lua 5.4 random; only used for IDs that aren't security-critical.
    local p = prefix or 'id'
    return string.format('%s_%08x_%04x', p, math.random(0, 0xffffffff), math.random(0, 0xffff))
end

-- Truncate string safely without breaking utf-8 mid-sequence on simple ascii input.
function Utils.Truncate(s, max)
    if type(s) ~= 'string' then return s end
    if #s <= max then return s end
    return s:sub(1, max)
end

-- Strip basic control bytes that should not flow into the DB/UI.
function Utils.Sanitize(s)
    if type(s) ~= 'string' then return s end
    return (s:gsub('[%c]', ''))
end
