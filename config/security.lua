Config.Security = {
    -- Length caps. Server validates against these for every write op.
    MaxContactNameLen = 64,
    MaxPhoneNumberLen = 16,
    MaxMessageLen = 500,
    MaxNoteTitleLen = 80,
    MaxNoteBodyLen = 4000,
    MaxDeviceNameLen = 32,
    MaxSearchQueryLen = 64,

    -- Hard caps. These cannot be raised by clients.
    MaxContactsPerPhone = 200,
    MaxNotesPerPhone = 100,
    MaxMediaPerPhone = 250,
    MaxNotificationsPerPhone = 50,

    -- Login/access flags.
    AllowAdminReset = true,
    LogFailedAccessAttempts = true,
    LogStolenPhoneAccess = true,
    LogPanicPresses = true,

    -- Cooldown bucket size (entries) before pruning.
    CooldownMapSoftCap = 1024,
}
