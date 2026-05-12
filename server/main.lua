-- Server bootstrap: registers ox_inventory `use` proxy event and the primary
-- "open phone" server callback that initialises item metadata + builds the bootstrap payload.

local Core = W2FPhone.Core
local DB = W2FPhone.Database
local Security = W2FPhone.Security
local Audit = W2FPhone.Audit
local Constants = W2FPhone.Constants

-- ox_inventory will call the item's `client.event` directly on the client.
-- This event is registered as an extra safety net in case server-side use is preferred.
RegisterNetEvent('w2f-phone:server:useItem', function(slot)
    local src = source
    if not Core.HasPhone(src) and Config.Phone.RequireItem then return end
    TriggerClientEvent('w2f-phone:client:usePhone', src, { slot = slot })
end)

-- Build a complete bootstrap payload for the React app's initial render.
local function buildBootstrap(src, slot)
    local can, reason, phoneId, number, owner, isStolen = Security.AssertCanOpen(src)
    if not can then
        -- If the player has the item but no phoneId metadata yet, initialise it.
        if reason == 'NO_PHONE' and Core.HasPhone(src) and Config.Phone.RequireItem then
            local dev = Core.GetOrCreateDeviceFromItem(src, slot)
            if not dev then return nil, 'INIT_FAILED' end
            phoneId  = dev.phone_id
            number   = dev.phone_number
            owner    = dev.owner_citizenid
            isStolen = false
        else
            return nil, reason
        end
    end

    -- Refresh holder + load full device row.
    local device = Core.GetOrCreateDeviceFromItem(src, slot)
    if not device then return nil, 'INIT_FAILED' end
    local user = Core.GetOrCreatePhoneUser(src)
    local player = Core.GetPlayer(src)
    local pd = player and player.PlayerData
    Core.RegisterOnlinePlayer(src)

    -- Resolve visible apps server-side.
    local visibleApps = {}
    for _, app in ipairs(W2FPhone.Apps.GetRegistry()) do
        local visible = W2FPhone.Apps.IsVisibleForJob(app, pd and pd.job and (pd.job.name or pd.job.type) or nil)
        if visible then
            visibleApps[#visibleApps + 1] = {
                id = app.id, label = app.label, icon = app.icon, color = app.color,
                order = app.order, route = app.route,
                supportsBadge = app.supportsBadge == true,
                custom = app.custom == true,
                foundation = app.foundation == true,
            }
        end
    end

    Audit.Write(device.phone_id, pd and pd.citizenid, Constants.AuditActions.DEVICE_OPENED,
        device.is_stolen and 'opened (stolen)' or 'opened', { src = src })

    return {
        device = {
            phoneId     = device.phone_id,
            phoneNumber = device.phone_number,
            deviceName  = device.device_name,
            ownerCitizenId = device.owner_citizenid,
            isStolen    = device.is_stolen,
            locked      = device.locked,
        },
        identity = {
            citizenid = pd and pd.citizenid,
            name = Core.GetCharName(src),
            job = pd and pd.job and {
                name = pd.job.name, label = pd.job.label, grade = pd.job.grade,
                onduty = pd.job.onduty, isboss = pd.job.isboss, type = pd.job.type,
            } or nil,
        },
        money = Core.GetMoney(src),
        apps = visibleApps,
        dock = Config.Dock,
        settings = W2FPhone.Utils.SafeJsonDecode(user and user.settings or '{}', {}),
        installedApps = W2FPhone.Utils.SafeJsonDecode(user and user.installed_apps or '[]', {}),
        themes = Config.Themes,
        wallpapers = Config.Wallpapers,
        config = {
            theme = Config.Phone.DefaultTheme,
            wallpaper = Config.Phone.DefaultWallpaper,
            sounds = Config.Phone.UseSounds,
            animations = Config.Phone.UseAnimations,
            notifications = Config.Phone.UseNotifications,
            policeEnabled = Config.Phone.EnablePoliceApp,
            mediaEnabled = Config.Media and Config.Media.Enabled or false,
            mediaProvider = Config.Media and Config.Media.Provider or 'none',
        },
        serverTime = os.time(),
    }, nil
end

-- Cross-module access for the callbacks layer.
W2FPhone.BuildBootstrap = buildBootstrap

print('^2[W2F-Phone] Server main ready.^7')
