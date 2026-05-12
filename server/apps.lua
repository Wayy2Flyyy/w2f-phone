-- Server-side app helpers. The actual server callback that returns visible apps
-- lives in callbacks.lua (`getAvailableApps`); this module is the place to
-- attach per-app permission logic that other modules can call.

local AppsServer = {}
W2FPhone.AppsServer = AppsServer

function AppsServer.IsAppAllowed(src, appId)
    local pd = W2FPhone.Core.GetPlayerData(src)
    local jobName = pd and pd.job and (pd.job.name or pd.job.type) or nil
    for _, app in ipairs(W2FPhone.Apps.GetRegistry()) do
        if app.id == appId then
            return W2FPhone.Apps.IsVisibleForJob(app, jobName)
        end
    end
    return false
end

-- Friendly export for sibling resources that want to gate phone features.
exports('IsAppAllowed', function(src, appId)
    return AppsServer.IsAppAllowed(src, appId)
end)
