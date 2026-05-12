# w2f-phone

Premium Qbox smartphone OS for the **W2F QBX Refined** package. Item-bound
unique phones, full Lua server/client with `oxmysql` persistence, and a
Vite + React + TypeScript NUI. No CDN icon imports, no faked backend success,
no ESX bridge.

This resource ships as the **direct NPWD replacement** for this server.
The `phone` item in `ox_inventory` already points at it, and `server.cfg`
already stops `npwd` / `qbx_npwd` and the `[npwd-apps]` folder.

---

## Features

- **Item-bound phones** via `ox_inventory` metadata
  (`phoneId`, `phoneNumber`, `ownerCitizenId`, `deviceName`, `locked`,
  `simId`, `createdAt`). Steal the item, keep the data.
- **Server-side phone number generation** with retry-on-collision and a
  unique index on `phone_number`.
- **Lock screen, home screen, app grid, dock**, notification banners,
  notification center, polished status bar and home indicator.
- **Apps**: Contacts (CRUD + favourites + block list), Messages (live push),
  Phone (keypad + history + state machine), Bank (Qbox money read-only),
  Vehicles (citizen-scoped, safe-fallback), Police (MDT/Status/Panic
  guarded by job + duty + `w2f-police` presence), Notes (CRUD + pin),
  Gallery, Camera (foundation), W2F Share, App Store, Settings.
- **Audit logging** across device creation, opens, sends, calls, settings
  changes, panic, police-app opens, stolen-device access, security rejects.
- **Security**: parameterized SQL, per-action cooldowns, ownership checks
  on every callback, sanitized settings whitelist, sanitized share
  payloads, and no client trust for `citizenid`, `phoneId`,
  `phoneNumber`, money, job, vehicles or DB IDs.
- **Browser preview mode**: `npm run dev` renders the UI with mock data,
  no FiveM APIs required.

---

## Dependencies

| Resource       | Notes                                                  |
| -------------- | ------------------------------------------------------ |
| `qbx_core`     | Player data, money, job, citizenid (via `GetPlayer`).  |
| `ox_lib`       | Server callbacks + helpers.                            |
| `ox_inventory` | `phone` item + metadata persistence.                   |
| `oxmysql`      | All persistence.                                       |
| `ox_target`    | Optional. Unused today but reserved for future apps.   |
| `w2f-police`   | Optional. MDT / Status / Panic shortcuts are guarded   |
|                | with `GetResourceState('w2f-police') == 'started'`.    |

---

## Install / server.cfg order

The W2F Refined package's `server.cfg` already does the right thing:

```cfg
ensure ox_lib
ensure qbx_core
ensure ox_target
ensure [ox]
ensure [qbx]
ensure [w2f]      # contains w2f-phone

# Replaced by w2f-phone:
stop npwd
stop qbx_npwd
# (the previous "ensure [npwd-apps]" line has been removed)
```

If you want an explicit ensure line instead of relying on `[w2f]`:

```cfg
ensure w2f-phone
```

---

## ox_inventory item

Already patched in `resources/[ox]/ox_inventory/data/items.lua`:

```lua
['phone'] = {
    label = 'Phone',
    weight = 350,
    stack = false,
    close = true,
    description = 'A personal smartphone.',
    client = {
        event = 'w2f-phone:client:usePhone',
    },
},
```

First use of the item assigns `metadata.phoneId` + `metadata.phoneNumber`
and inserts a row into `w2f_phone_devices`. Steal the item, the
identity follows it.

---

## Database

Tables auto-create on resource start via `server/database.lua`:

| Table                       | Purpose                                |
| --------------------------- | -------------------------------------- |
| `w2f_phone_devices`         | One row per physical phone item        |
| `w2f_phone_users`           | Per-citizen settings + installed apps  |
| `w2f_phone_contacts`        | Phone-scoped contact book              |
| `w2f_phone_messages`        | Threaded by conversation_id            |
| `w2f_phone_calls`           | Call history + state machine ledger    |
| `w2f_phone_notifications`   | Persisted banners                      |
| `w2f_phone_notes`           | Notes app                              |
| `w2f_phone_media`           | Photo/video metadata records           |
| `w2f_phone_audit_logs`      | All sensitive actions                  |

Indexes are created for `phone_id`, `conversation_id`, `phone_number`,
`citizenid`, `created_at`, etc.

---

## Commands

| Command  | Notes                                                            |
| -------- | ---------------------------------------------------------------- |
| `/phone` | Opens the phone if `Config.Phone.RequireItem` is satisfied.      |

The phone also opens automatically when the `phone` item is used in
inventory.

---

## Unique phone metadata

The brief's `Config.Phone.ItemBoundData = true` is on by default. Concretely:

- `phoneId`/`phoneNumber` are written to `ox_inventory` metadata on the
  slot the player used (`SetMetadata`). Stolen phones keep both.
- `current_holder_citizenid` is updated server-side on every open, so the
  live "online source for number X" map stays accurate even after theft.
- `AllowStolenPhones`, `RequireUnlockForStolenPhone`,
  `BindNumberToItem` are all configurable in `config/main.lua`.

---

## NUI callbacks (client → server)

Implemented in `client/nui.lua`. Each is a thin proxy to the matching
`w2f-phone:server:<name>` ox_lib callback:

```
closePhone, getPhoneData, customAppOpen, requestCameraCapture,
getContacts, addContact, updateContact, deleteContact,
toggleFavouriteContact, blockContact,
getConversations, getMessages, sendMessage, markConversationRead,
getCallHistory, startCall, acceptCall, declineCall, endCall,
getBankData, getVehicles,
getNotifications, markNotificationRead, clearNotifications,
getNotes, createNote, updateNote, deleteNote,
getMedia, saveMedia,
sharePayload,
saveSettings, getAvailableApps,
openPoliceMdt, openPoliceStatus, triggerPolicePanic
```

Server callbacks are whitelisted in `shared/constants.lua` so the proxy
cannot be extended client-side.

## NUI messages (server → UI)

```
phone:open, phone:close,
phone:notification, phone:messageReceived,
phone:callIncoming, phone:callOutgoing, phone:callAccepted,
phone:callDeclined, phone:callEnded,
phone:updateSettings, phone:updateAppData,
phone:shareReceived
```

---

## Apps

| App         | Status         |
| ----------- | -------------- |
| Phone       | Full (state machine + history; voice transport is the foundation hook described below) |
| Messages    | Full           |
| Contacts    | Full           |
| Bank        | Full (read-only Qbox snapshot) |
| Vehicles    | Full (citizen-scoped query, safe fallback) |
| Police      | Full (job/duty/`w2f-police` guarded) |
| Notes       | Full           |
| Gallery     | Full read; capture is foundation |
| Camera      | Foundation (see Media provider setup) |
| W2F Share   | Number / Contact / Location full; Vehicle / Invoice / Media kinds wired but require sibling resources |
| App Store   | Foundation (visibility today; install/uninstall reserved) |
| Settings    | Full           |

---

## Media provider setup

The brief disallows hardcoded provider keys. Configure via convars in
`server.cfg`:

```cfg
set w2f_phone_fivemanage_api_key ""
set w2f_phone_lb_upload_endpoint ""
set w2f_phone_custom_upload_endpoint ""
```

`config/media.lua` selects the active provider. The Camera app surfaces a
clear "capture requires a media provider configured" state until a
provider is wired up - it never fakes a success.

---

## Voice / video calls

Calls have a real state machine, real database history, and real NUI push
events for both ends - but voice transport itself is **foundation only**.
The pma-voice integration points are clearly labelled `TODO` in
`server/calls.lua` and `client/calls.lua` so anyone replacing the call
audio layer knows exactly where to plug in. The `speaker_enabled` and
`video_enabled` flags persist today; they will be honoured by the real
transport once it's wired in.

---

## Security notes

- All SQL is parameterized. No string concatenation with user input.
- Every server callback resolves the player's active phone via
  `Security.ResolveActivePhone` and asserts ownership before doing work.
- Per-action cooldowns live in `config/main.lua` (`Config.Cooldowns`).
- Settings writes are filtered through `Validation.SanitizeSettings`,
  which has a fixed key whitelist with per-key types.
- Police shortcuts validate `Core.IsPolice(src)`, and the panic button
  additionally requires `job.onduty` if
  `Config.Police.RequireOnDutyForPanic` is true.
- Stolen-phone access is auditable via `w2f_phone_audit_logs`.

---

## Browser preview

```
cd resources/[w2f]/w2f-phone/web
npm install
npm run dev
```

Open `http://localhost:5174`. `fetchNui` detects there is no
`GetParentResourceName` and returns the bundled `mockData` instead of
hitting the resource, so every screen renders and clicks safely.

---

## Build steps

```
cd resources/[w2f]/w2f-phone/web
npm install
npm run build
```

This produces `web/dist/index.html` and `web/dist/assets/**` which the
`fxmanifest.lua` declares. Until you build, the placeholder
`web/dist/index.html` shows a "build required" panel so the resource
still starts cleanly.

---

## Testing checklist

- [ ] `npm install` works in `web/`
- [ ] `npm run build` creates `web/dist/index.html`
- [ ] `fxmanifest.lua` loads `web/dist/index.html`
- [ ] Resource starts cleanly (no `script error` lines)
- [ ] All 9 `w2f_phone_*` tables exist after first start
- [ ] Using a `phone` item opens the phone
- [ ] First-use sets `metadata.phoneId` and `metadata.phoneNumber`
- [ ] Same item keeps the same phone number across opens
- [ ] Stolen phone keeps phoneId/phoneNumber if
      `AllowStolenPhones = true`
- [ ] `/phone` opens the phone when the player has the item, and is
      blocked otherwise when `RequireItem = true`
- [ ] `Escape` closes the phone and clears NUI focus
- [ ] Close-button clears NUI focus
- [ ] Lock screen renders and `tap to unlock` works
- [ ] Home + dock + app grid renders
- [ ] Contacts: list/add/edit/delete/favourite/block round-trip
- [ ] Messages: send, live-receive when both online, conv read state
- [ ] Call history loads, start/accept/decline/end transition states
- [ ] Bank shows live Qbox money snapshot
- [ ] Vehicles app loads (or shows empty cleanly)
- [ ] Police app only appears for police jobs
- [ ] Police MDT/Status no-op cleanly when w2f-police is missing
- [ ] Panic respects cooldown + on-duty requirement
- [ ] Notes CRUD works
- [ ] Settings save persists across opens
- [ ] Notifications display in banner stack + Notification Center
- [ ] W2F Share for number/contact/location delivers to online recipient
- [ ] Gallery foundation loads
- [ ] Browser preview works (`npm run dev`)
- [ ] No F8 errors
- [ ] No server nil errors
- [ ] No callback name mismatch
- [ ] No missing file errors
- [ ] No CDN fetch errors (verified - everything is inline SVG)
- [ ] No TypeScript errors (`npm run build` passes `tsc -b`)

---

## Known foundation points (future expansion)

- pma-voice integration in `server/calls.lua` and `client/calls.lua`
  (clearly labelled `TODO`).
- Camera screenshot capture in `client/media.lua` (clearly labelled
  `TODO`, ready for `screenshot-basic` or a custom uploader).
- Video calls: `video_enabled` flag and `call_type = 'video'` are
  already persisted; transport is the foundation hook above.
- SIM profile metadata (`metadata.simId`) is reserved but unused today.
- App Store install / uninstall flow (visibility is server-controlled today).
- Nearby share + direct-share contact targeting.
- Vehicle / invoice / media share kinds (server already accepts them;
  sibling resources need to drive the UX).
- W2F-police integration (`Config.Police.OpenMdtEvent` /
  `OpenStatusEvent` / `PanicEvent`).

---

## Support

Open issues against the W2F QBX Refined package. Provide:

- F8 console snippet (if frontend issue)
- Server console snippet (if backend issue)
- Resource state (`status` command output for `w2f-phone`,
  `ox_inventory`, `qbx_core`)
- Repro steps and the affected app/route
