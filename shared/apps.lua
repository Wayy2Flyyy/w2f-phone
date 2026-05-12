local AppsShared = W2FPhone.Apps

-- Returns the full registry: built-in Config.Apps plus enabled Config.CustomApps,
-- already merged into the same shape.
function AppsShared.GetRegistry()
    local list = {}
    if type(Config.Apps) == 'table' then
        for _, app in ipairs(Config.Apps) do list[#list + 1] = app end
    end

    if type(Config.CustomApps) == 'table' then
        local order = (#list)
        for id, def in pairs(Config.CustomApps) do
            if def and def.enabled then
                order = order + 1
                list[#list + 1] = {
                    id = id,
                    label = def.label or id,
                    icon = def.icon or 'star',
                    color = def.color or '#4f46e5',
                    order = def.order or order,
                    route = def.route or id,
                    defaultVisible = def.defaultVisible ~= false,
                    canDisable = def.canInstall ~= false,
                    requiresJob = def.requiresJob and true or false,
                    jobs = def.jobs,
                    requiresItem = def.requiresItem,
                    onOpenEvent = def.onOpenEvent,
                    custom = true,
                }
            end
        end
    end

    table.sort(list, function(a, b)
        return (a.order or 999) < (b.order or 999)
    end)
    return list
end

function AppsShared.GetById(id)
    for _, app in ipairs(AppsShared.GetRegistry()) do
        if app.id == id then return app end
    end
    return nil
end

-- Returns true iff a player with this job + (server-resolved) flag context can see an app.
function AppsShared.IsVisibleForJob(app, jobName)
    if not app then return false end
    if app.configFlag and Config.Phone[app.configFlag] == false then return false end
    if app.requiresJob then
        if not jobName or not app.jobs then return false end
        for _, j in ipairs(app.jobs) do
            if j == jobName then return true end
        end
        return false
    end
    return true
end
