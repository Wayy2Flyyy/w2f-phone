-- W2F Share client surface.
-- Receiving a share payload from another player surfaces a banner + opens the
-- Share inbox. Sending happens through the standard `sharePayload` NUI->server
-- callback registered in client/nui.lua.

RegisterNetEvent('w2f-phone:client:shareReceived', function(payload)
    if not payload then return end
    SendNUIMessage({ action = 'phone:shareReceived', data = payload })
    -- Also surface a notification banner so it is visible even when the phone is closed.
    SendNUIMessage({
        action = 'phone:notification',
        data = {
            app = 'share',
            title = ('Shared %s'):format(payload.kind or 'item'),
            message = payload.preview or 'A new item has been shared with you.',
            data = payload,
        },
    })
end)
