-- Media client glue.
-- The camera UI shows a "Capture requires media provider configuration" state
-- unless a provider is configured via Config.Media + convars. When that is
-- wired, this is where the actual screenshot capture would happen:
--
-- TODO (camera capture):
--   exports['screenshot-basic']:requestScreenshotUpload(url, field, function(data)
--       -- data contains the uploaded URL; forward via 'saveMedia' NUI callback
--   end)
--
-- Today this module only exposes a `RequestCameraCapture` NUI callback that
-- returns a clean disabled-state response so the UI never shows a fake success.

RegisterNUICallback('requestCameraCapture', function(_, cb)
    cb({
        ok = false,
        code = 'CAMERA_NOT_CONFIGURED',
        message = 'Camera capture requires a media provider configured in config/media.lua and server convars.',
    })
end)
