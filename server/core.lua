local Core = W2FPhone.Core
local Utils = W2FPhone.Utils
local Constants = W2FPhone.Constants
local DB = W2FPhone.Database

-- Map citizenid -> source for fast online lookups. Kept in sync via events below.
local CitizenSrcMap = {}

local function safeQbxGetPlayer(src)
    -- exports.qbx_core:GetPlayer is Qbox-native. Safe-call so the resource boots
    -- even if qbx_core is starting up at the same time.
    local ok, res = pcall(function()
        return exports.qbx_core:GetPlayer(src)
    end)
    if ok then return res end
    return nil
end

function Core.GetPlayer(src)
    return safeQbxGetPlayer(src)
end

function Core.GetPlayerData(src)
    local p = Core.GetPlayer(src)
    return p and p.PlayerData or nil
end

function Core.GetCitizenId(src)
    local pd = Core.GetPlayerData(src)
    return pd and pd.citizenid or nil
end

function Core.GetCharName(src)
    local pd = Core.GetPlayerData(src)
    if not pd or not pd.charinfo then return 'Unknown' end
    return ('%s %s'):format(pd.charinfo.firstname or '', pd.charinfo.lastname or ''):gsub('^%s+', ''):gsub('%s+$', '')
end

function Core.GetJob(src)
    local pd = Core.GetPlayerData(src)
    return pd and pd.job or nil
end

function Core.GetMoney(src)
    local pd = Core.GetPlayerData(src)
    local money = pd and pd.money or {}
    return {
        cash = tonumber(money.cash) or 0,
        bank = tonumber(money.bank) or 0,
        crypto = tonumber(money.crypto) or 0,
    }
end

function Core.IsPolice(src)
    local job = Core.GetJob(src)
    if not job then return false end
    local jobName = job.name or job.type
    if not jobName then return false end
    for _, j in ipairs(Config.Police.PoliceJobs or {}) do
        if j == jobName then return true end
    end
    return job.type == 'leo'
end

function Core.HasPhone(src)
    if not Config.Phone.RequireItem then return true end
    local count = exports.ox_inventory:Search(src, 'count', Config.Phone.Item)
    return (count or 0) > 0
end

function Core.GetActivePhoneItem(src)
    local items = exports.ox_inventory:Search(src, 'slots', Config.Phone.Item) or {}
    for _, it in ipairs(items) do
        if it and it.metadata and it.metadata.phoneId then return it end
    end
    return items[1]
end

-- Initialise/refresh a phone item: assign phoneId + phoneNumber on first use,
-- update current_holder_citizenid to the player who is opening it.
function Core.GetOrCreateDeviceFromItem(src, slot)
    local player = Core.GetPlayer(src)
    if not player or not player.PlayerData then return nil end
    local citizenid = player.PlayerData.citizenid

    local items = exports.ox_inventory:Search(src, 'slots', Config.Phone.Item) or {}
    local target
    if slot then
        for _, it in ipairs(items) do
            if it and it.slot == slot then target = it; break end
        end
    end
    target = target or Core.GetActivePhoneItem(src)
    if not target then return nil end

    local meta = target.metadata or {}
    local now = os.time()

    if not meta.phoneId then
        local phoneId = Utils.GenerateUid('phn')
        local number = DB.GenerateUniqueNumber()
        local deviceName = ('%s\'s Phone'):format((player.PlayerData.charinfo and player.PlayerData.charinfo.firstname) or 'New')

        DB.InsertDevice({
            phone_id = phoneId,
            phone_number = number,
            owner_citizenid = citizenid,
            current_holder_citizenid = citizenid,
            device_name = deviceName,
            locked = false,
            metadata = { createdBySrc = src },
        })

        DB.UpsertUser(citizenid, phoneId)

        local newMeta = {
            phoneId = phoneId,
            phoneNumber = number,
            ownerCitizenId = citizenid,
            deviceName = deviceName,
            locked = false,
            simId = nil,
            createdAt = now,
        }

        -- Persist on the item. ox_inventory writes broadcast to the client.
        exports.ox_inventory:SetMetadata(src, target.slot, newMeta)

        W2FPhone.Audit.Write(phoneId, citizenid, Constants.AuditActions.DEVICE_CREATED,
            'first-use init', { src = src, deviceName = deviceName })

        return {
            phone_id = phoneId,
            phone_number = number,
            owner_citizenid = citizenid,
            device_name = deviceName,
            locked = false,
            is_stolen = false,
            slot = target.slot,
            metadata = newMeta,
        }
    end

    -- Existing phone: update current holder + persist any drift.
    DB.UpdateDeviceHolder(meta.phoneId, citizenid)
    DB.UpsertUser(citizenid, meta.phoneId)

    local dev = DB.FindDeviceByPhoneId(meta.phoneId)
    local isStolen = (meta.ownerCitizenId ~= nil and meta.ownerCitizenId ~= citizenid)

    return {
        phone_id = meta.phoneId,
        phone_number = meta.phoneNumber or (dev and dev.phone_number),
        owner_citizenid = meta.ownerCitizenId or (dev and dev.owner_citizenid),
        device_name = meta.deviceName or (dev and dev.device_name) or 'W2F Phone',
        locked = (meta.locked == true),
        is_stolen = isStolen,
        slot = target.slot,
        metadata = meta,
    }
end

function Core.GetOrCreatePhoneUser(src)
    local citizenid = Core.GetCitizenId(src)
    if not citizenid then return nil end
    DB.UpsertUser(citizenid, nil)
    return DB.GetUser(citizenid)
end

-- Number/source/phoneId lookup helpers --------------------------------------

function Core.GetPhoneNumberByPhoneId(phoneId)
    local d = DB.FindDeviceByPhoneId(phoneId)
    return d and d.phone_number or nil
end

function Core.GetSourceByPhoneNumber(number)
    if not number then return nil end
    -- Resolve number -> current_holder_citizenid -> online source.
    local d = DB.FindDeviceByNumber(number)
    if not d or not d.current_holder_citizenid then return nil end
    return CitizenSrcMap[d.current_holder_citizenid]
end

function Core.GetSourceByPhoneId(phoneId)
    local d = DB.FindDeviceByPhoneId(phoneId)
    if not d or not d.current_holder_citizenid then return nil end
    return CitizenSrcMap[d.current_holder_citizenid]
end

function Core.GetSourceByCitizenId(citizenid)
    return CitizenSrcMap[citizenid]
end

-- Citizen <-> source map maintenance via Qbox events. Best-effort; we also resync
-- on each phone bootstrap call so a fresh server doesn't lose mappings.
AddEventHandler('QBCore:Server:OnPlayerLoaded', function(player)
    if player and player.PlayerData and player.PlayerData.citizenid then
        CitizenSrcMap[player.PlayerData.citizenid] = player.PlayerData.source
    end
end)

RegisterNetEvent('QBCore:Server:OnPlayerUnload', function(citizenid)
    if citizenid then CitizenSrcMap[citizenid] = nil end
end)

AddEventHandler('playerDropped', function()
    local src = source
    for cid, s in pairs(CitizenSrcMap) do
        if s == src then CitizenSrcMap[cid] = nil end
    end
end)

function Core.RegisterOnlinePlayer(src)
    local cid = Core.GetCitizenId(src)
    if cid then CitizenSrcMap[cid] = src end
end
