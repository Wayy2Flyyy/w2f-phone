local Contacts = W2FPhone.Contacts
local Validation = W2FPhone.Validation
local Utils = W2FPhone.Utils
local Audit = W2FPhone.Audit
local Constants = W2FPhone.Constants

local function rowToContact(r)
    return {
        id = r.id,
        name = r.contact_name,
        number = r.phone_number,
        avatar = r.avatar,
        favourite = r.favourite == 1,
        blocked = r.blocked == 1,
        notes = r.notes,
        createdAt = r.created_at,
        updatedAt = r.updated_at,
    }
end

function Contacts.List(phoneId, search)
    if not phoneId then return {} end
    if search and Validation.SearchQuery(search) and #search > 0 then
        local like = '%' .. search .. '%'
        local rows = MySQL.query.await(
            [[SELECT * FROM w2f_phone_contacts
              WHERE phone_id = ? AND (contact_name LIKE ? OR phone_number LIKE ?)
              ORDER BY favourite DESC, contact_name ASC LIMIT 500]],
            { phoneId, like, like }
        ) or {}
        local out = {}
        for i, r in ipairs(rows) do out[i] = rowToContact(r) end
        return out
    end
    local rows = MySQL.query.await(
        [[SELECT * FROM w2f_phone_contacts
          WHERE phone_id = ?
          ORDER BY favourite DESC, contact_name ASC LIMIT 500]],
        { phoneId }
    ) or {}
    local out = {}
    for i, r in ipairs(rows) do out[i] = rowToContact(r) end
    return out
end

local function findByNumber(phoneId, number)
    return MySQL.single.await(
        'SELECT id FROM w2f_phone_contacts WHERE phone_id = ? AND phone_number = ? LIMIT 1',
        { phoneId, number }
    )
end

function Contacts.Add(phoneId, citizenid, body)
    local name = Utils.Sanitize(Utils.Trim(body.name or ''))
    local number = Utils.Sanitize(Utils.Trim(body.number or ''))
    if not Validation.ContactName(name) then
        return { ok = false, code = 'BAD_NAME' }
    end
    if not Validation.PhoneNumber(number) then
        return { ok = false, code = 'BAD_NUMBER' }
    end

    -- Cap.
    local count = MySQL.scalar.await(
        'SELECT COUNT(*) FROM w2f_phone_contacts WHERE phone_id = ?',
        { phoneId }
    ) or 0
    if count >= Config.Security.MaxContactsPerPhone then
        return { ok = false, code = 'CAP_REACHED' }
    end

    -- Duplicates.
    if findByNumber(phoneId, number) then
        return { ok = false, code = 'DUPLICATE' }
    end

    local now = os.time()
    local id = MySQL.insert.await(
        [[INSERT INTO w2f_phone_contacts
          (phone_id, owner_citizenid, contact_name, phone_number, avatar, favourite, blocked, notes, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)]],
        {
            phoneId, citizenid, name, number,
            Utils.Truncate(Utils.Sanitize(body.avatar or ''), 64),
            body.favourite and 1 or 0,
            body.blocked and 1 or 0,
            Utils.Truncate(Utils.Sanitize(body.notes or ''), 255),
            now, now,
        }
    )
    Audit.Write(phoneId, citizenid, Constants.AuditActions.CONTACT_ADDED,
        'contact added', { id = id, name = name, number = number })
    return { ok = true, data = { id = id } }
end

function Contacts.Update(phoneId, citizenid, body)
    local id = tonumber(body.id)
    if not id then return { ok = false, code = 'BAD_ID' } end

    -- Ownership.
    local row = MySQL.single.await(
        'SELECT * FROM w2f_phone_contacts WHERE id = ? AND phone_id = ? LIMIT 1',
        { id, phoneId }
    )
    if not row then return { ok = false, code = 'NOT_FOUND' } end

    local name = Utils.Sanitize(Utils.Trim(body.name or row.contact_name))
    local number = Utils.Sanitize(Utils.Trim(body.number or row.phone_number))
    if not Validation.ContactName(name) then return { ok = false, code = 'BAD_NAME' } end
    if not Validation.PhoneNumber(number) then return { ok = false, code = 'BAD_NUMBER' } end

    -- Duplicate after rename.
    if number ~= row.phone_number then
        if findByNumber(phoneId, number) then
            return { ok = false, code = 'DUPLICATE' }
        end
    end

    MySQL.update.await(
        [[UPDATE w2f_phone_contacts
          SET contact_name = ?, phone_number = ?, avatar = ?, notes = ?, updated_at = ?
          WHERE id = ? AND phone_id = ?]],
        {
            name, number,
            Utils.Truncate(Utils.Sanitize(body.avatar or row.avatar or ''), 64),
            Utils.Truncate(Utils.Sanitize(body.notes or row.notes or ''), 255),
            os.time(),
            id, phoneId,
        }
    )
    return { ok = true }
end

function Contacts.Delete(phoneId, citizenid, id)
    id = tonumber(id)
    if not id then return { ok = false, code = 'BAD_ID' } end
    local affected = MySQL.update.await(
        'DELETE FROM w2f_phone_contacts WHERE id = ? AND phone_id = ?',
        { id, phoneId }
    )
    if affected and affected > 0 then
        Audit.Write(phoneId, citizenid, Constants.AuditActions.CONTACT_DELETED,
            'contact deleted', { id = id })
        return { ok = true }
    end
    return { ok = false, code = 'NOT_FOUND' }
end

function Contacts.ToggleFavourite(phoneId, id)
    id = tonumber(id)
    if not id then return { ok = false, code = 'BAD_ID' } end
    local row = MySQL.single.await(
        'SELECT favourite FROM w2f_phone_contacts WHERE id = ? AND phone_id = ? LIMIT 1',
        { id, phoneId }
    )
    if not row then return { ok = false, code = 'NOT_FOUND' } end
    local new = (row.favourite == 1) and 0 or 1
    MySQL.update.await(
        'UPDATE w2f_phone_contacts SET favourite = ?, updated_at = ? WHERE id = ? AND phone_id = ?',
        { new, os.time(), id, phoneId }
    )
    return { ok = true, data = { favourite = new == 1 } }
end

function Contacts.ToggleBlocked(phoneId, citizenid, id, blocked)
    id = tonumber(id)
    if not id then return { ok = false, code = 'BAD_ID' } end
    local val = blocked == true and 1 or 0
    local affected = MySQL.update.await(
        'UPDATE w2f_phone_contacts SET blocked = ?, updated_at = ? WHERE id = ? AND phone_id = ?',
        { val, os.time(), id, phoneId }
    )
    if affected and affected > 0 then
        Audit.Write(phoneId, citizenid, Constants.AuditActions.CONTACT_BLOCKED,
            ('contact %s'):format(val == 1 and 'blocked' or 'unblocked'),
            { id = id, blocked = val == 1 })
        return { ok = true, data = { blocked = val == 1 } }
    end
    return { ok = false, code = 'NOT_FOUND' }
end

-- Helper for messages.lua to honour the per-phone block list.
function Contacts.IsBlocked(phoneId, number)
    if not phoneId or not number then return false end
    local r = MySQL.single.await(
        'SELECT blocked FROM w2f_phone_contacts WHERE phone_id = ? AND phone_number = ? LIMIT 1',
        { phoneId, number }
    )
    return r and r.blocked == 1
end
