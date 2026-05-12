-- W2F Phone shared boot: expose a single global namespace for every module to attach to.
-- Loaded BEFORE every other shared/client/server file in this resource.
W2FPhone = W2FPhone or {
    Core = {},
    Utils = {},
    Validation = {},
    Apps = {},
    Constants = {},
    Database = {},
    Security = {},
    Audit = {},
    Contacts = {},
    Messages = {},
    Calls = {},
    Banking = {},
    Vehicles = {},
    Notes = {},
    Notifications = {},
    Media = {},
    Share = {},
}
