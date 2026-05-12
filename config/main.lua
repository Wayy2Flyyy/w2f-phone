-- Main W2F-Phone config. Edit safely.
Config = Config or {}

Config.Phone = {
    Debug = true,

    Command = 'phone',
    Item = 'phone',
    RequireItem = true,

    -- Unique phone bound to the physical ox_inventory item slot/metadata.
    ItemBoundData = true,
    AllowStolenPhones = true,
    RequireUnlockForStolenPhone = true,
    BindNumberToItem = true,

    CloseOnDeath = true,
    AllowInVehicle = true,
    AllowWhileCuffed = false,
    AllowWhileSwimming = false,

    DefaultTheme = 'dark',
    DefaultWallpaper = 'w2f_default',

    UsePhoneNumber = true,
    NumberPrefix = '555',
    NumberLength = 7, -- digits AFTER the prefix

    UseSounds = true,
    UseAnimations = true,
    UseNotifications = true,

    MaxContacts = 200,
    MaxMessageLength = 500,
    MaxNotifications = 50,
    MaxNotes = 100,

    EnablePoliceApp = true,
    EnableBankApp = true,
    EnableVehiclesApp = true,

    -- Browser mock-mode toggle is consumed by the React UI from the same Config.
    MockInBrowser = true,
}

-- Police integration (safe-guarded by resource state at runtime).
Config.Police = {
    Resource = 'w2f-police',
    PoliceJobs = { 'lspd', 'bcso', 'sast', 'sapr' },
    RequireOnDutyForPanic = true,
    RequireOnDutyForMdt = false,
    OpenMdtEvent = 'w2f-police:client:openMDT',
    OpenStatusEvent = 'w2f-police:client:openStatus',
    PanicEvent = 'w2f-police:server:panic',
}

-- Vehicles app (Qbox-style table; if your schema differs, this is the only place to adjust).
Config.Vehicles = {
    Table = 'player_vehicles',
    CitizenColumn = 'citizenid',
    PlateColumn = 'plate',
    GarageColumn = 'garage',
    StateColumn = 'state', -- 0=out, 1=garaged, 2=impound (Qbx standard)
    ModelColumn = 'vehicle',
    FuelMetadataKey = 'fuel',
    EngineMetadataKey = 'engineHealth',
}

-- Cooldowns (ms) used by the security layer. Drop these only if you understand the risk.
Config.Cooldowns = {
    sendMessage = 750,
    startCall = 1500,
    sharePayload = 1500,
    saveSettings = 500,
    triggerPolicePanic = 5000,
    addContact = 500,
    saveMedia = 1500,
    createNote = 500,
}
