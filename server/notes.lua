local Notes = W2FPhone.Notes
local Utils = W2FPhone.Utils
local Validation = W2FPhone.Validation
local Audit = W2FPhone.Audit
local Constants = W2FPhone.Constants

local function rowToNote(r)
    return {
        id = r.id,
        title = r.title,
        body = r.body,
        pinned = r.pinned == 1,
        createdAt = r.created_at,
        updatedAt = r.updated_at,
    }
end

function Notes.List(phoneId, search)
    if not phoneId then return {} end
    if search and Validation.SearchQuery(search) and #search > 0 then
        local like = '%' .. search .. '%'
        local rows = MySQL.query.await(
            [[SELECT * FROM w2f_phone_notes
              WHERE phone_id = ? AND (title LIKE ? OR body LIKE ?)
              ORDER BY pinned DESC, updated_at DESC LIMIT 200]],
            { phoneId, like, like }
        ) or {}
        local out = {}
        for i, r in ipairs(rows) do out[i] = rowToNote(r) end
        return out
    end
    local rows = MySQL.query.await(
        [[SELECT * FROM w2f_phone_notes
          WHERE phone_id = ?
          ORDER BY pinned DESC, updated_at DESC LIMIT 200]],
        { phoneId }
    ) or {}
    local out = {}
    for i, r in ipairs(rows) do out[i] = rowToNote(r) end
    return out
end

function Notes.Create(phoneId, citizenid, body)
    local title = Utils.Sanitize(Utils.Trim(body.title or ''))
    local text = Utils.Sanitize(body.body or '')
    if not Validation.NoteTitle(title) then return { ok = false, code = 'BAD_TITLE' } end
    if not Validation.NoteBody(text) then return { ok = false, code = 'BAD_BODY' } end

    local count = MySQL.scalar.await(
        'SELECT COUNT(*) FROM w2f_phone_notes WHERE phone_id = ?',
        { phoneId }
    ) or 0
    if count >= Config.Security.MaxNotesPerPhone then
        return { ok = false, code = 'CAP_REACHED' }
    end

    local now = os.time()
    local id = MySQL.insert.await(
        [[INSERT INTO w2f_phone_notes (phone_id, citizenid, title, body, pinned, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)]],
        { phoneId, citizenid, title, text, body.pinned and 1 or 0, now, now }
    )
    Audit.Write(phoneId, citizenid, Constants.AuditActions.NOTE_CREATED,
        'note created', { id = id, title = title })
    return { ok = true, data = { id = id } }
end

function Notes.Update(phoneId, citizenid, body)
    local id = tonumber(body.id)
    if not id then return { ok = false, code = 'BAD_ID' } end
    local row = MySQL.single.await(
        'SELECT * FROM w2f_phone_notes WHERE id = ? AND phone_id = ? LIMIT 1',
        { id, phoneId }
    )
    if not row then return { ok = false, code = 'NOT_FOUND' } end

    local title = Utils.Sanitize(Utils.Trim(body.title or row.title))
    local text = Utils.Sanitize(body.body or row.body or '')
    if not Validation.NoteTitle(title) then return { ok = false, code = 'BAD_TITLE' } end
    if not Validation.NoteBody(text) then return { ok = false, code = 'BAD_BODY' } end

    MySQL.update.await(
        'UPDATE w2f_phone_notes SET title = ?, body = ?, pinned = ?, updated_at = ? WHERE id = ? AND phone_id = ?',
        { title, text, (body.pinned == nil and row.pinned or (body.pinned and 1 or 0)), os.time(), id, phoneId }
    )
    return { ok = true }
end

function Notes.Delete(phoneId, citizenid, id)
    id = tonumber(id)
    if not id then return { ok = false, code = 'BAD_ID' } end
    local affected = MySQL.update.await(
        'DELETE FROM w2f_phone_notes WHERE id = ? AND phone_id = ?',
        { id, phoneId }
    )
    if affected and affected > 0 then
        Audit.Write(phoneId, citizenid, Constants.AuditActions.NOTE_DELETED,
            'note deleted', { id = id })
        return { ok = true }
    end
    return { ok = false, code = 'NOT_FOUND' }
end
