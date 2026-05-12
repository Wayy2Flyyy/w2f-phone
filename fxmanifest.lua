fx_version 'cerulean'
game 'gta5'
lua54 'yes'

name 'w2f-phone'
author 'W2F (wayy2flyyy)'
description 'W2F Phone - Advanced Qbox smartphone OS powered by ox.'
version '1.0.0'

shared_scripts {
    '@ox_lib/init.lua',
    '@qbx_core/modules/lib.lua',

    'w2f_boot_shared.lua',

    'config/main.lua',
    'config/apps.lua',
    'config/notifications.lua',
    'config/themes.lua',
    'config/media.lua',
    'config/security.lua',

    'shared/constants.lua',
    'shared/core.lua',
    'shared/utils.lua',
    'shared/validation.lua',
    'shared/apps.lua',
}

client_scripts {
    'w2f_boot_client.lua',
    'client/core.lua',
    'client/nui.lua',
    'client/item.lua',
    'client/apps.lua',
    'client/notifications.lua',
    'client/calls.lua',
    'client/media.lua',
    'client/share.lua',
    'client/main.lua',
}

server_scripts {
    '@oxmysql/lib/MySQL.lua',
    'w2f_boot_server.lua',
    'server/database.lua',
    'server/security.lua',
    'server/audit.lua',
    'server/core.lua',
    'server/apps.lua',
    'server/contacts.lua',
    'server/messages.lua',
    'server/calls.lua',
    'server/banking.lua',
    'server/vehicles.lua',
    'server/notes.lua',
    'server/notifications.lua',
    'server/media.lua',
    'server/share.lua',
    'server/callbacks.lua',
    'server/main.lua',
}

ui_page 'web/dist/index.html'

files {
    'web/dist/index.html',
    'web/dist/**/*',
}

dependencies {
    'qbx_core',
    'ox_lib',
    'ox_inventory',
    'oxmysql',
}
