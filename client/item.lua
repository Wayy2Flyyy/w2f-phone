-- Client item entry point. Opens the phone from the ox_inventory `use` event
-- or the `/phone` command, but always defers to the server for bootstrap.

local Core = W2FPhone.ClientCore

local function openPhone(slot)
    local can, why = Core.CanOpenContextually()
    if not can then
        lib.notify({ type = 'error', title = 'Phone', description = ('Cannot open phone right now (%s).'):format(why) })
        return
    end

    if Core.IsOpen() then return end

    local payload = lib.callback.await('w2f-phone:server:getPhoneData', false, { slot = slot })
    if not payload or not payload.ok then
        local code = payload and payload.code or 'UNKNOWN'
        lib.notify({ type = 'error', title = 'Phone', description = ('Unable to open phone (%s).'):format(code) })
        return
    end

    Core.SetBootstrap(payload.data)
    Core.SetOpen(true)

    SetNuiFocus(true, true)
    SendNUIMessage({ action = 'phone:open', data = payload.data })
end
W2FPhone.OpenPhone = openPhone

local function closePhone(silent)
    if not Core.IsOpen() then return end
    Core.SetOpen(false)
    SetNuiFocus(false, false)
    if not silent then
        SendNUIMessage({ action = 'phone:close' })
    end
end
W2FPhone.ClosePhone = closePhone

-- ox_inventory use handler (matches the item's `client.event` field).
RegisterNetEvent('w2f-phone:client:usePhone', function(itemData)
    local slot = itemData and itemData.slot or nil
    openPhone(slot)
end)

-- Slash command. RequireItem gating happens server-side too (defence in depth).
if Config.Phone.Command and Config.Phone.Command ~= '' then
    RegisterCommand(Config.Phone.Command, function()
        if Config.Phone.RequireItem then
            local count = exports.ox_inventory:Search('count', Config.Phone.Item) or 0
            if count <= 0 then
                lib.notify({ type = 'error', title = 'Phone', description = 'You do not have a phone.' })
                return
            end
        end
        openPhone(nil)
    end, false)
end

-- Death handling
AddEventHandler('gameEventTriggered', function(name, args)
    if name == 'CEventNetworkEntityDamage' and Config.Phone.CloseOnDeath then
        local ped = PlayerPedId()
        if IsEntityDead(ped) and Core.IsOpen() then
            closePhone(false)
        end
    end
end)

-- Resource stop cleanup: never leak NUI focus.
AddEventHandler('onResourceStop', function(name)
    if name == GetCurrentResourceName() and Core.IsOpen() then
        SetNuiFocus(false, false)
    end
end)
