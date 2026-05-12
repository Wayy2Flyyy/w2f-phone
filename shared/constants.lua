W2FPhone.Constants = {
    Resource = 'w2f-phone',

    CallStates = {
        Incoming = 'incoming',
        Outgoing = 'outgoing',
        Active   = 'active',
        Missed   = 'missed',
        Declined = 'declined',
        Ended    = 'ended',
    },

    CallTypes = {
        Voice = 'voice',
        Video = 'video',
    },

    MediaTypes = {
        Photo = 'photo',
        Video = 'video',
    },

    -- Whitelisted NUI->server callback names. The server callbacks layer registers
    -- exactly these; everything outside this list is rejected by security.lua.
    ServerCallbacks = {
        'getPhoneData',
        'getContacts', 'addContact', 'updateContact', 'deleteContact',
        'toggleFavouriteContact', 'blockContact',
        'getConversations', 'getMessages', 'sendMessage', 'markConversationRead',
        'getCallHistory', 'startCall', 'acceptCall', 'declineCall', 'endCall',
        'getBankData', 'getVehicles',
        'getNotifications', 'markNotificationRead', 'clearNotifications',
        'getNotes', 'createNote', 'updateNote', 'deleteNote',
        'getMedia', 'saveMedia',
        'sharePayload',
        'saveSettings', 'getAvailableApps',
        'openPoliceMdt', 'openPoliceStatus', 'triggerPolicePanic',
    },

    AuditActions = {
        DEVICE_CREATED        = 'device_created',
        DEVICE_OPENED         = 'device_opened',
        DEVICE_STOLEN_ACCESS  = 'device_stolen_access',
        CONTACT_ADDED         = 'contact_added',
        CONTACT_DELETED       = 'contact_deleted',
        CONTACT_BLOCKED       = 'contact_blocked',
        MESSAGE_SENT          = 'message_sent',
        CALL_STARTED          = 'call_started',
        CALL_ENDED            = 'call_ended',
        SETTINGS_CHANGED      = 'settings_changed',
        NOTE_CREATED          = 'note_created',
        NOTE_DELETED          = 'note_deleted',
        POLICE_APP_OPENED     = 'police_app_opened',
        PANIC_TRIGGERED       = 'panic_triggered',
        PHONE_UNLOCKED        = 'phone_unlocked',
        SHARE_SENT            = 'share_sent',
        ADMIN_RESET           = 'admin_reset',
        SECURITY_REJECT       = 'security_reject',
    },
}
