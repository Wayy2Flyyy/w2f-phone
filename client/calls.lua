-- Calls foundation. The UI emits incoming/outgoing/active overlays via NUI
-- messages dispatched in client/main.lua. This module is the placeholder for
-- future pma-voice integration.
--
-- TODO: when voice transport is implemented, listen to:
--   - 'w2f-phone:client:callAccepted' -> add caller to a pma-voice radio channel
--     scoped to this call (or use voice.exports.MumbleAddPlayerVoiceTarget).
--   - 'w2f-phone:client:callEnded'    -> remove from channel.
-- Speaker mode flag from the server event already lives in the payload; we
-- will respect it when wiring proximity. NEVER fake voice here.

-- Hooks for siblings that want to know about call state changes.
exports('OnCallEvent', function(handler)
    if type(handler) ~= 'function' then return end
    AddEventHandler('w2f-phone:client:callIncoming', function(p) handler('incoming', p) end)
    AddEventHandler('w2f-phone:client:callOutgoing', function(p) handler('outgoing', p) end)
    AddEventHandler('w2f-phone:client:callAccepted', function(p) handler('accepted', p) end)
    AddEventHandler('w2f-phone:client:callDeclined', function(p) handler('declined', p) end)
    AddEventHandler('w2f-phone:client:callEnded',    function(p) handler('ended', p) end)
end)
