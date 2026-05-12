local Core = {}
W2FPhone.ClientCore = Core

-- Cached open state so apps that re-query don't trigger a server roundtrip.
local State = {
    isOpen = false,
    bootstrap = nil, -- last server bootstrap payload
}

function Core.IsOpen() return State.isOpen end
function Core.SetOpen(v) State.isOpen = v == true end
function Core.GetBootstrap() return State.bootstrap end
function Core.SetBootstrap(payload) State.bootstrap = payload end

function Core.CanOpenContextually()
    local ped = PlayerPedId()
    if IsEntityDead(ped) and Config.Phone.CloseOnDeath then return false, 'dead' end
    if not Config.Phone.AllowInVehicle and IsPedInAnyVehicle(ped, false) then return false, 'in_vehicle' end
    if not Config.Phone.AllowWhileSwimming and IsPedSwimming(ped) then return false, 'swimming' end
    if not Config.Phone.AllowWhileCuffed and IsPedCuffed(ped) then return false, 'cuffed' end
    return true
end

function Core.DebugPrint(...)
    if Config and Config.Phone and Config.Phone.Debug then
        print('^5[W2F-Phone][client]^7', ...)
    end
end
