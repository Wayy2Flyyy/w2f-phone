-- Client side glue: relays server -> NUI push events, ensures focus cleanup,
-- and exposes a tiny export surface for sibling W2F resources that want to drop
-- phone notifications without coupling to internal modules.

local Core = W2FPhone.ClientCore

local function pushNui(action, data)
    SendNUIMessage({ action = action, data = data })
end

-- Server -> client push events ------------------------------------------------

RegisterNetEvent('w2f-phone:client:notification', function(payload)
    if not payload then return end
    pushNui('phone:notification', payload)
end)

RegisterNetEvent('w2f-phone:client:messageReceived', function(payload)
    if not payload then return end
    pushNui('phone:messageReceived', payload)
end)

RegisterNetEvent('w2f-phone:client:callIncoming', function(payload)
    pushNui('phone:callIncoming', payload)
end)

RegisterNetEvent('w2f-phone:client:callOutgoing', function(payload)
    pushNui('phone:callOutgoing', payload)
end)

RegisterNetEvent('w2f-phone:client:callAccepted', function(payload)
    pushNui('phone:callAccepted', payload)
end)

RegisterNetEvent('w2f-phone:client:callDeclined', function(payload)
    pushNui('phone:callDeclined', payload)
end)

RegisterNetEvent('w2f-phone:client:callEnded', function(payload)
    pushNui('phone:callEnded', payload)
end)

RegisterNetEvent('w2f-phone:client:shareReceived', function(payload)
    pushNui('phone:shareReceived', payload)
end)

RegisterNetEvent('w2f-phone:client:updateAppData', function(payload)
    pushNui('phone:updateAppData', payload)
end)

-- Public exports --------------------------------------------------------------
exports('Open', function() if W2FPhone.OpenPhone then W2FPhone.OpenPhone() end end)
exports('Close', function() if W2FPhone.ClosePhone then W2FPhone.ClosePhone(false) end end)
exports('IsOpen', function() return Core.IsOpen() end)
