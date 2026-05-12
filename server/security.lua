local Security = W2FPhone.Security
local Cooldowns = {}
local Constants = W2FPhone.Constants

-- Lazy load to avoid circular issues at startup (audit.lua loads before security.lua).
local function audit()
    return W2FPhone.Audit
end

-- Convert ms cooldown to a per-(src,action) gate. Returns false if rate-limited.
function Security.CheckCooldown(src, action)
    if not src then return false end
    local ms = (Config.Cooldowns and Config.Cooldowns[action]) or 0
    if ms <= 0 then return true end
    local key = src .. '::' .. action
    local now = GetGameTimer()
    local last = Cooldowns[key]
    if last and (now - last) < ms then
        return false
    end
    Cooldowns[key] = now
    return true
end

-- Periodic prune so the cooldown map never grows unbounded.
CreateThread(function()
    while true do
        Wait(60 * 1000)
        local cap = (Config.Security and Config.Security.CooldownMapSoftCap) or 1024
        local count = 0
        for _ in pairs(Cooldowns) do count = count + 1 end
        if count > cap then
            Cooldowns = {}
        end
    end
end)

-- Resolve the active phone item slot/metadata for a given source.
-- Returns: phoneId, phoneNumber, ownerCitizenId, isStolen, slot, metadata
function Security.ResolveActivePhone(src)
    local Core = W2FPhone.Core
    local player = Core.GetPlayer(src)
    if not player or not player.PlayerData then return nil end

    local citizenid = player.PlayerData.citizenid
    if not citizenid then return nil end

    if not Config.Phone.RequireItem then
        -- Item-less mode: per-citizen phone (no theft semantics).
        local user = W2FPhone.Database.GetUser(citizenid)
        if user and user.default_phone_id then
            local dev = W2FPhone.Database.FindDeviceByPhoneId(user.default_phone_id)
            if dev then
                return dev.phone_id, dev.phone_number, dev.owner_citizenid, false, nil, dev
            end
        end
        return nil
    end

    -- Item-bound mode: locate first phone item in inventory with metadata.phoneId.
    local items = exports.ox_inventory:Search(src, 'slots', Config.Phone.Item) or {}
    if #items == 0 then return nil end

    local chosen
    for _, it in ipairs(items) do
        if it and it.metadata and it.metadata.phoneId then
            chosen = it; break
        end
    end
    if not chosen then chosen = items[1] end

    local meta = chosen.metadata or {}
    if not meta.phoneId then
        -- Item not yet initialised. Caller (item.lua flow) handles creation.
        return nil, nil, nil, false, chosen.slot, meta
    end

    local owner = meta.ownerCitizenId
    local isStolen = owner ~= nil and owner ~= citizenid
    return meta.phoneId, meta.phoneNumber, owner, isStolen, chosen.slot, meta
end

-- Throw-style guard helper. Returns: ok, phoneId, citizenid, errorCode
function Security.AssertOwnsPhone(src, providedPhoneId)
    local Core = W2FPhone.Core
    local player = Core.GetPlayer(src)
    if not player or not player.PlayerData then
        return false, nil, nil, 'NO_PLAYER'
    end
    local citizenid = player.PlayerData.citizenid

    local phoneId = Security.ResolveActivePhone(src)
    if not phoneId then
        return false, nil, citizenid, 'NO_PHONE'
    end

    if providedPhoneId and providedPhoneId ~= phoneId then
        audit().SecurityReject(src, 'assertOwnsPhone', 'phone_id_mismatch', {
            phoneId = phoneId, claimed = providedPhoneId, citizenid = citizenid,
        })
        return false, nil, citizenid, 'PHONE_MISMATCH'
    end

    return true, phoneId, citizenid, nil
end

-- Validate that this phoneId is allowed to access for this src,
-- and check stolen-phone unlock policy.
function Security.AssertCanOpen(src)
    local Core = W2FPhone.Core
    local player = Core.GetPlayer(src)
    if not player then return false, 'NO_PLAYER' end

    local phoneId, number, owner, isStolen = Security.ResolveActivePhone(src)
    if not phoneId then return false, 'NO_PHONE' end

    if isStolen then
        if not Config.Phone.AllowStolenPhones then
            audit().Write(phoneId, player.PlayerData.citizenid,
                Constants.AuditActions.DEVICE_STOLEN_ACCESS,
                'access denied by config', { src = src })
            return false, 'STOLEN_BLOCKED'
        end
        if Config.Phone.RequireUnlockForStolenPhone then
            audit().Write(phoneId, player.PlayerData.citizenid,
                Constants.AuditActions.DEVICE_STOLEN_ACCESS,
                'stolen access (unlock required)', { src = src })
        end
    end
    return true, nil, phoneId, number, owner, isStolen
end

-- Whitelist gate for callback name -> shared/constants registry.
function Security.IsKnownCallback(name)
    for _, allowed in ipairs(Constants.ServerCallbacks) do
        if allowed == name then return true end
    end
    return false
end
