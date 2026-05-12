-- Bridge between the React UI (fetchNui POST) and ox_lib server callbacks.
--
-- Every NUI callback here is a thin wrapper: it forwards the body to the matching
-- `w2f-phone:server:<endpoint>` callback. Server endpoints are whitelisted in
-- shared/constants.lua so this list cannot be silently extended by a client edit.

local Core = W2FPhone.ClientCore
local Constants = W2FPhone.Constants

local function registerProxy(name)
    RegisterNUICallback(name, function(body, cb)
        local res = lib.callback.await('w2f-phone:server:' .. name, false, body or {})
        cb(res or { ok = false, code = 'NO_RESPONSE' })
    end)
end

for _, name in ipairs(Constants.ServerCallbacks) do
    registerProxy(name)
end

-- Close phone (no server round-trip required).
RegisterNUICallback('closePhone', function(_, cb)
    if Core.IsOpen() then
        Core.SetOpen(false)
        SetNuiFocus(false, false)
    end
    cb({ ok = true })
end)

-- Allow the UI to ping for the cached bootstrap (used after hot-reload, etc.).
RegisterNUICallback('getCachedBootstrap', function(_, cb)
    cb({ ok = true, data = Core.GetBootstrap() })
end)

-- Listen for ESC inside NUI focus and close (UI also implements this; double safety).
RegisterNUICallback('uiReady', function(_, cb)
    cb({ ok = true })
end)
