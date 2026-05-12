Config.Notifications = {
    DefaultDurationMs = 4500,
    MaxBannersOnScreen = 3,
    StoreInDatabase = true,
    PruneAfterDays = 14,
    -- Per-app sound config, consumed client-side from the bootstrap payload.
    AppSounds = {
        messages = 'message',
        phone = 'ring',
        bank = 'chime',
        share = 'chime',
    },
}
