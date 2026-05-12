local DB = W2FPhone.Database

local READY = false

local SCHEMA = {
    -- Devices: one row per physical phone item; phoneId & number are item-bound.
    [[
        CREATE TABLE IF NOT EXISTS `w2f_phone_devices` (
            `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
            `phone_id` VARCHAR(48) NOT NULL,
            `phone_number` VARCHAR(24) NOT NULL,
            `owner_citizenid` VARCHAR(64) DEFAULT NULL,
            `current_holder_citizenid` VARCHAR(64) DEFAULT NULL,
            `device_name` VARCHAR(64) NOT NULL DEFAULT 'W2F Phone',
            `locked` TINYINT(1) NOT NULL DEFAULT 0,
            `pin_hash` VARCHAR(128) DEFAULT NULL,
            `metadata` LONGTEXT NULL,
            `created_at` BIGINT NOT NULL,
            `updated_at` BIGINT NOT NULL,
            PRIMARY KEY (`id`),
            UNIQUE KEY `uniq_phone_id` (`phone_id`),
            UNIQUE KEY `uniq_phone_number` (`phone_number`),
            KEY `idx_owner` (`owner_citizenid`),
            KEY `idx_holder` (`current_holder_citizenid`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ]],

    [[
        CREATE TABLE IF NOT EXISTS `w2f_phone_users` (
            `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
            `citizenid` VARCHAR(64) NOT NULL,
            `default_phone_id` VARCHAR(48) DEFAULT NULL,
            `settings` LONGTEXT NULL,
            `installed_apps` LONGTEXT NULL,
            `created_at` BIGINT NOT NULL,
            `updated_at` BIGINT NOT NULL,
            PRIMARY KEY (`id`),
            UNIQUE KEY `uniq_citizenid` (`citizenid`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ]],

    [[
        CREATE TABLE IF NOT EXISTS `w2f_phone_contacts` (
            `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
            `phone_id` VARCHAR(48) NOT NULL,
            `owner_citizenid` VARCHAR(64) DEFAULT NULL,
            `contact_name` VARCHAR(80) NOT NULL,
            `phone_number` VARCHAR(24) NOT NULL,
            `avatar` VARCHAR(64) DEFAULT NULL,
            `favourite` TINYINT(1) NOT NULL DEFAULT 0,
            `blocked` TINYINT(1) NOT NULL DEFAULT 0,
            `notes` VARCHAR(255) DEFAULT NULL,
            `created_at` BIGINT NOT NULL,
            `updated_at` BIGINT NOT NULL,
            PRIMARY KEY (`id`),
            KEY `idx_phone` (`phone_id`),
            KEY `idx_phone_number` (`phone_id`,`phone_number`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ]],

    [[
        CREATE TABLE IF NOT EXISTS `w2f_phone_messages` (
            `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
            `conversation_id` VARCHAR(64) NOT NULL,
            `sender_phone_id` VARCHAR(48) DEFAULT NULL,
            `sender_citizenid` VARCHAR(64) DEFAULT NULL,
            `sender_number` VARCHAR(24) NOT NULL,
            `receiver_number` VARCHAR(24) NOT NULL,
            `message` TEXT NOT NULL,
            `attachments` LONGTEXT NULL,
            `read_state` TINYINT(1) NOT NULL DEFAULT 0,
            `created_at` BIGINT NOT NULL,
            PRIMARY KEY (`id`),
            KEY `idx_conv` (`conversation_id`),
            KEY `idx_recv` (`receiver_number`),
            KEY `idx_sender_phone` (`sender_phone_id`),
            KEY `idx_created` (`created_at`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ]],

    [[
        CREATE TABLE IF NOT EXISTS `w2f_phone_calls` (
            `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
            `caller_phone_id` VARCHAR(48) DEFAULT NULL,
            `caller_number` VARCHAR(24) NOT NULL,
            `receiver_number` VARCHAR(24) NOT NULL,
            `call_type` VARCHAR(16) NOT NULL DEFAULT 'voice',
            `call_state` VARCHAR(16) NOT NULL DEFAULT 'outgoing',
            `duration` INT UNSIGNED NOT NULL DEFAULT 0,
            `speaker_enabled` TINYINT(1) NOT NULL DEFAULT 0,
            `video_enabled` TINYINT(1) NOT NULL DEFAULT 0,
            `created_at` BIGINT NOT NULL,
            PRIMARY KEY (`id`),
            KEY `idx_caller_phone` (`caller_phone_id`),
            KEY `idx_caller_number` (`caller_number`),
            KEY `idx_receiver` (`receiver_number`),
            KEY `idx_created` (`created_at`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ]],

    [[
        CREATE TABLE IF NOT EXISTS `w2f_phone_notifications` (
            `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
            `phone_id` VARCHAR(48) NOT NULL,
            `citizenid` VARCHAR(64) DEFAULT NULL,
            `app` VARCHAR(32) NOT NULL,
            `title` VARCHAR(120) NOT NULL,
            `message` TEXT NULL,
            `data` LONGTEXT NULL,
            `read_state` TINYINT(1) NOT NULL DEFAULT 0,
            `created_at` BIGINT NOT NULL,
            PRIMARY KEY (`id`),
            KEY `idx_phone` (`phone_id`),
            KEY `idx_unread` (`phone_id`,`read_state`),
            KEY `idx_created` (`created_at`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ]],

    [[
        CREATE TABLE IF NOT EXISTS `w2f_phone_notes` (
            `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
            `phone_id` VARCHAR(48) NOT NULL,
            `citizenid` VARCHAR(64) DEFAULT NULL,
            `title` VARCHAR(120) NOT NULL,
            `body` TEXT NULL,
            `pinned` TINYINT(1) NOT NULL DEFAULT 0,
            `created_at` BIGINT NOT NULL,
            `updated_at` BIGINT NOT NULL,
            PRIMARY KEY (`id`),
            KEY `idx_phone` (`phone_id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ]],

    [[
        CREATE TABLE IF NOT EXISTS `w2f_phone_media` (
            `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
            `phone_id` VARCHAR(48) NOT NULL,
            `citizenid` VARCHAR(64) DEFAULT NULL,
            `media_type` VARCHAR(16) NOT NULL DEFAULT 'photo',
            `url` VARCHAR(512) NOT NULL,
            `thumbnail` VARCHAR(512) DEFAULT NULL,
            `metadata` LONGTEXT NULL,
            `created_at` BIGINT NOT NULL,
            PRIMARY KEY (`id`),
            KEY `idx_phone` (`phone_id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ]],

    [[
        CREATE TABLE IF NOT EXISTS `w2f_phone_audit_logs` (
            `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
            `phone_id` VARCHAR(48) DEFAULT NULL,
            `citizenid` VARCHAR(64) DEFAULT NULL,
            `action` VARCHAR(48) NOT NULL,
            `message` VARCHAR(255) DEFAULT NULL,
            `metadata` LONGTEXT NULL,
            `created_at` BIGINT NOT NULL,
            PRIMARY KEY (`id`),
            KEY `idx_phone` (`phone_id`),
            KEY `idx_action` (`action`),
            KEY `idx_created` (`created_at`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ]],
}

local function runSchema()
    for _, ddl in ipairs(SCHEMA) do
        local ok, err = pcall(function()
            MySQL.query.await(ddl)
        end)
        if not ok then
            print(('^1[W2F-Phone][DB] Failed schema query: %s^7'):format(err))
        end
    end
end

CreateThread(function()
    -- Wait one tick so oxmysql is fully ready.
    Wait(0)
    runSchema()
    READY = true
    print('^2[W2F-Phone][DB] Schema ready.^7')
end)

function DB.Ready()
    return READY
end

-- Phone number generator: 555-XXXXXXX (configurable). Retries on duplicates.
local function buildNumber()
    local prefix = Config.Phone.NumberPrefix or '555'
    local len = math.max(4, Config.Phone.NumberLength or 7)
    local digits = ''
    for _ = 1, len do
        digits = digits .. tostring(math.random(0, 9))
    end
    return prefix .. '-' .. digits
end

function DB.GenerateUniqueNumber()
    for _ = 1, 25 do
        local candidate = buildNumber()
        local existing = MySQL.scalar.await(
            'SELECT id FROM w2f_phone_devices WHERE phone_number = ?',
            { candidate }
        )
        if not existing then return candidate end
    end
    -- Extremely unlikely fallback: append timestamp suffix.
    return buildNumber() .. tostring(os.time() % 100)
end

-- Convenience accessors -------------------------------------------------------

function DB.FindDeviceByPhoneId(phoneId)
    if not phoneId then return nil end
    return MySQL.single.await(
        'SELECT * FROM w2f_phone_devices WHERE phone_id = ? LIMIT 1',
        { phoneId }
    )
end

function DB.FindDeviceByNumber(number)
    if not number then return nil end
    return MySQL.single.await(
        'SELECT * FROM w2f_phone_devices WHERE phone_number = ? LIMIT 1',
        { number }
    )
end

function DB.InsertDevice(row)
    local now = os.time()
    return MySQL.insert.await(
        [[INSERT INTO w2f_phone_devices
          (phone_id, phone_number, owner_citizenid, current_holder_citizenid,
           device_name, locked, metadata, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)]],
        {
            row.phone_id,
            row.phone_number,
            row.owner_citizenid,
            row.current_holder_citizenid,
            row.device_name or 'W2F Phone',
            row.locked and 1 or 0,
            W2FPhone.Utils.SafeJsonEncode(row.metadata or {}, '{}'),
            now,
            now,
        }
    )
end

function DB.UpdateDeviceHolder(phoneId, citizenid)
    MySQL.update.await(
        'UPDATE w2f_phone_devices SET current_holder_citizenid = ?, updated_at = ? WHERE phone_id = ?',
        { citizenid, os.time(), phoneId }
    )
end

function DB.UpdateDeviceName(phoneId, name)
    MySQL.update.await(
        'UPDATE w2f_phone_devices SET device_name = ?, updated_at = ? WHERE phone_id = ?',
        { name, os.time(), phoneId }
    )
end

function DB.UpsertUser(citizenid, defaultPhoneId)
    local now = os.time()
    MySQL.query.await(
        [[INSERT INTO w2f_phone_users (citizenid, default_phone_id, settings, installed_apps, created_at, updated_at)
          VALUES (?, ?, '{}', '[]', ?, ?)
          ON DUPLICATE KEY UPDATE
            default_phone_id = COALESCE(VALUES(default_phone_id), default_phone_id),
            updated_at = VALUES(updated_at)]],
        { citizenid, defaultPhoneId, now, now }
    )
end

function DB.GetUser(citizenid)
    return MySQL.single.await(
        'SELECT * FROM w2f_phone_users WHERE citizenid = ? LIMIT 1',
        { citizenid }
    )
end

function DB.SaveUserSettings(citizenid, settings)
    MySQL.update.await(
        'UPDATE w2f_phone_users SET settings = ?, updated_at = ? WHERE citizenid = ?',
        { W2FPhone.Utils.SafeJsonEncode(settings or {}, '{}'), os.time(), citizenid }
    )
end
