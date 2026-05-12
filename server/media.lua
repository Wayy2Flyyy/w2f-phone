local Media = W2FPhone.Media
local Utils = W2FPhone.Utils

local function rowToMedia(r)
    return {
        id = r.id,
        type = r.media_type,
        url = r.url,
        thumbnail = r.thumbnail,
        metadata = Utils.SafeJsonDecode(r.metadata, {}),
        createdAt = r.created_at,
    }
end

function Media.List(phoneId)
    if not phoneId then return {} end
    local rows = MySQL.query.await(
        [[SELECT * FROM w2f_phone_media
          WHERE phone_id = ?
          ORDER BY created_at DESC LIMIT ?]],
        { phoneId, Config.Security.MaxMediaPerPhone or 250 }
    ) or {}
    local out = {}
    for i, r in ipairs(rows) do out[i] = rowToMedia(r) end
    return out
end

-- Provider abstraction. We never trust the client URL blindly; if the configured
-- provider rejects external URLs (Config.Media.AllowExternalUrls == false), we
-- only accept urls produced by our trusted upload path. Today this stub validates
-- size/type and persists. Real uploads will be wired client-side via Config.Media
-- (see client/media.lua TODO).
function Media.Save(phoneId, citizenid, body)
    if not Config.Media or not Config.Media.Enabled then
        return { ok = false, code = 'MEDIA_DISABLED' }
    end
    local mediaType = body.type
    if mediaType ~= 'photo' and mediaType ~= 'video' then
        return { ok = false, code = 'BAD_TYPE' }
    end
    if mediaType == 'video' and not Config.Media.AllowVideos then
        return { ok = false, code = 'VIDEO_DISABLED' }
    end
    if mediaType == 'photo' and not Config.Media.AllowPhotos then
        return { ok = false, code = 'PHOTO_DISABLED' }
    end
    local url = Utils.Trim(body.url or '')
    if type(url) ~= 'string' or #url == 0 or #url > 512 then
        return { ok = false, code = 'BAD_URL' }
    end
    if not Config.Media.AllowExternalUrls then
        -- Trust convention: accept only https URLs produced by our configured providers.
        if not url:match('^https://') then
            return { ok = false, code = 'EXTERNAL_BLOCKED' }
        end
    end

    local id = MySQL.insert.await(
        [[INSERT INTO w2f_phone_media (phone_id, citizenid, media_type, url, thumbnail, metadata, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)]],
        {
            phoneId, citizenid, mediaType, url,
            type(body.thumbnail) == 'string' and Utils.Truncate(body.thumbnail, 512) or nil,
            Utils.SafeJsonEncode(body.metadata or {}, '{}'),
            os.time(),
        }
    )
    return { ok = true, data = { id = id } }
end
