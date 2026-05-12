local Vehicles = W2FPhone.Vehicles
local Utils = W2FPhone.Utils

-- Safe-fallback vehicle lookup. If the configured table doesn't exist we return
-- an empty list instead of throwing - other servers may use a custom schema.
function Vehicles.ListForCitizen(citizenid)
    if not citizenid then return {} end

    local cfg = Config.Vehicles
    local sql = ('SELECT * FROM `%s` WHERE `%s` = ? LIMIT 200'):format(cfg.Table, cfg.CitizenColumn)

    local ok, rows = pcall(function()
        return MySQL.query.await(sql, { citizenid })
    end)
    if not ok or not rows then return {} end

    local out = {}
    for i, r in ipairs(rows) do
        local meta = r.mods and Utils.SafeJsonDecode(r.mods, {}) or {}
        local fuel = meta[cfg.FuelMetadataKey] or meta.fuelLevel or r.fuel or nil
        local engine = meta[cfg.EngineMetadataKey] or r.engine or nil
        out[i] = {
            plate = r[cfg.PlateColumn],
            model = r[cfg.ModelColumn],
            garage = r[cfg.GarageColumn],
            state = r[cfg.StateColumn],
            fuel = type(fuel) == 'number' and fuel or nil,
            engine = type(engine) == 'number' and engine or nil,
        }
    end
    return out
end
