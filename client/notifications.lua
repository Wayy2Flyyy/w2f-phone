-- Phone notifications client surface.
-- Other W2F resources can `exports['w2f-phone']:Notify(target, payload)` to
-- show a banner without knowing anything about the React layer. The server
-- module is the source of truth; this is the client mirror.

RegisterNetEvent('w2f-phone:client:notify', function(payload)
    if not payload then return end
    SendNUIMessage({ action = 'phone:notification', data = payload })
end)

exports('LocalNotify', function(payload)
    SendNUIMessage({ action = 'phone:notification', data = payload or {} })
end)
