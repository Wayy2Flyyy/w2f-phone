-- Custom app event dispatcher.
-- When a user opens a custom app (Config.CustomApps[id].onOpenEvent), the UI
-- posts NUI->client `customAppOpen` which fires the configured client event.
-- This lets sibling resources (e.g. w2f-dragcar) hook into the phone cleanly.

RegisterNUICallback('customAppOpen', function(body, cb)
    local id = body and body.id
    if not id or type(id) ~= 'string' then
        cb({ ok = false, code = 'BAD_ID' }); return
    end
    local def = Config.CustomApps and Config.CustomApps[id]
    if not def or not def.enabled then
        cb({ ok = false, code = 'NOT_ENABLED' }); return
    end
    if def.onOpenEvent and def.onOpenEvent ~= '' then
        TriggerEvent(def.onOpenEvent, { source = 'w2f-phone' })
    end
    cb({ ok = true })
end)
