-- App registry. The visibility rules here are enforced server-side and mirrored
-- on the client; clients NEVER decide which apps appear.
Config.Apps = {
    {
        id = 'phone', label = 'Phone', icon = 'phone', color = '#22c55e',
        order = 1, route = 'phone', defaultVisible = true, canDisable = false,
        supportsBadge = true, supportsNotifications = true,
    },
    {
        id = 'messages', label = 'Messages', icon = 'messages', color = '#3b82f6',
        order = 2, route = 'messages', defaultVisible = true, canDisable = false,
        supportsBadge = true, supportsNotifications = true,
    },
    {
        id = 'contacts', label = 'Contacts', icon = 'contacts', color = '#0ea5e9',
        order = 3, route = 'contacts', defaultVisible = true, canDisable = false,
        supportsBadge = false, supportsNotifications = false,
    },
    {
        id = 'bank', label = 'Bank', icon = 'bank', color = '#eab308',
        order = 4, route = 'bank', defaultVisible = true, canDisable = true,
        configFlag = 'EnableBankApp',
    },
    {
        id = 'vehicles', label = 'Vehicles', icon = 'car', color = '#f97316',
        order = 5, route = 'vehicles', defaultVisible = true, canDisable = true,
        configFlag = 'EnableVehiclesApp',
    },
    {
        id = 'gallery', label = 'Gallery', icon = 'image', color = '#a855f7',
        order = 6, route = 'gallery', defaultVisible = true, canDisable = true,
    },
    {
        id = 'camera', label = 'Camera', icon = 'camera', color = '#e5e7eb',
        order = 7, route = 'camera', defaultVisible = true, canDisable = true,
        foundation = true,
    },
    {
        id = 'notes', label = 'Notes', icon = 'note', color = '#f59e0b',
        order = 8, route = 'notes', defaultVisible = true, canDisable = true,
    },
    {
        id = 'share', label = 'W2F Share', icon = 'share', color = '#06b6d4',
        order = 9, route = 'share', defaultVisible = true, canDisable = true,
    },
    {
        id = 'appstore', label = 'App Store', icon = 'store', color = '#60a5fa',
        order = 10, route = 'appstore', defaultVisible = true, canDisable = true,
    },
    {
        id = 'settings', label = 'Settings', icon = 'cog', color = '#9ca3af',
        order = 11, route = 'settings', defaultVisible = true, canDisable = false,
    },
    {
        id = 'police', label = 'Police', icon = 'shield', color = '#1d4ed8',
        order = 12, route = 'police', defaultVisible = false, canDisable = true,
        configFlag = 'EnablePoliceApp',
        requiresJob = true,
        jobs = { 'police', 'sheriff', 'state', 'lspd', 'bcso' },
    },
}

Config.Dock = { 'phone', 'messages', 'contacts', 'settings' }

-- Example custom-app entry per the brief. Disabled by default; admins enable here.
Config.CustomApps = {
    racing = {
        enabled = false,
        label = 'Racing',
        icon = 'flag',
        color = '#ff4d5e',
        route = 'racing',
        requiresJob = false,
        requiresItem = nil,
        defaultVisible = false,
        canInstall = true,
        onOpenEvent = 'w2f-dragcar:client:openPhoneApp',
    },
}
