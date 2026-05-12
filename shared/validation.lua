local Validation = W2FPhone.Validation
local Utils = W2FPhone.Utils

local function lenCap(s, cap)
    return type(s) == 'string' and #s > 0 and #s <= cap
end

function Validation.ContactName(name)
    return lenCap(name, Config.Security.MaxContactNameLen)
end

function Validation.PhoneNumber(num)
    if type(num) ~= 'string' or num == '' then return false end
    if #num > Config.Security.MaxPhoneNumberLen then return false end
    return num:match('^[%d%-%s]+$') ~= nil
end

function Validation.Message(text)
    return type(text) == 'string'
        and #text > 0
        and #text <= Config.Security.MaxMessageLen
end

function Validation.NoteTitle(title)
    return lenCap(title, Config.Security.MaxNoteTitleLen)
end

function Validation.NoteBody(body)
    if type(body) ~= 'string' then return false end
    return #body <= Config.Security.MaxNoteBodyLen
end

function Validation.DeviceName(name)
    return lenCap(name, Config.Security.MaxDeviceNameLen)
end

function Validation.SearchQuery(q)
    if type(q) ~= 'string' then return false end
    return #q <= Config.Security.MaxSearchQueryLen
end

-- Settings keys the server is willing to persist. Anything else is silently dropped.
Validation.AllowedSettingsKeys = {
    theme = 'string',
    wallpaper = 'string',
    deviceName = 'string',
    notificationsEnabled = 'boolean',
    soundEnabled = 'boolean',
    vibrationEnabled = 'boolean',
    hiddenApps = 'table',
    visibleApps = 'table',
    dockApps = 'table',
    lockEnabled = 'boolean',
}

function Validation.SanitizeSettings(input)
    if type(input) ~= 'table' then return {} end
    local out = {}
    for k, v in pairs(input) do
        local expected = Validation.AllowedSettingsKeys[k]
        if expected and type(v) == expected then
            if expected == 'string' then
                out[k] = Utils.Truncate(Utils.Sanitize(v), 128)
            elseif expected == 'table' then
                local arr = {}
                for _, item in ipairs(v) do
                    if type(item) == 'string' then
                        arr[#arr + 1] = Utils.Truncate(Utils.Sanitize(item), 32)
                    end
                end
                out[k] = arr
            else
                out[k] = v
            end
        end
    end
    return out
end
