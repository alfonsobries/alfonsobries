# Private Line — plan de implementación

Integrar el número privado de privacynumber.io en la app móvil (`app/`) con backend en
`api/`, buscando la experiencia más cercana posible a "tener el número en el teléfono":
leer y mandar SMS en tiempo real, ver y atender llamadas entrantes, hacer llamadas
salientes, buzón de voz con transcripción, y administración de la línea.

Este documento es autosuficiente: incluye el extracto relevante de la API del proveedor
para que cualquier sesión futura pueda ejecutar el plan sin re-investigar.

> **Repo público.** Nunca commitear: el número real, `sk_live_…`, el signing secret de
> webhooks, ni capturas con contenido real. El número nunca se hardcodea: el backend lo
> obtiene de `GET /v1/numbers` y lo expone al app en su payload.

---

## 1. Lo que la API permite (y lo que no)

Fuente: <https://privacynumber.io/api/> (revisada 2026-08-20).

- Base: `https://api.privacynumber.io/v1/`, JSON, timestamps ISO-8601.
- Auth: `Authorization: Bearer sk_live_…` (solo servidor; `pk_live_…` existe pero está
  "reserved; not yet used by any endpoint" → **no hay SDK de cliente ni tokens WebRTC**).
- Versionado: header `PrivacyNumber-Version: 2026-04-01` (pinear siempre).
- Idempotencia: header `Idempotency-Key: <uuid>` (dedup 24 h) en mutaciones.
- Rate limit: 100 req/min por key (token bucket).
- Sin sandbox/test mode documentado → todo se prueba contra la línea real (hay costo por
  SMS/llamada; los tests automatizados siempre con HTTP fake, nunca contra el proveedor).

### Endpoints

| Recurso | Método y path |
|---|---|
| Numbers | `GET /v1/numbers`, `GET /v1/numbers/available`, `POST /v1/numbers`, `GET/PATCH/DELETE /v1/numbers/{id}` |
| Calls | `POST /v1/calls`, `GET /v1/calls`, `GET /v1/calls/{id}`, `POST /v1/calls/{id}/hangup` |
| SMS | `POST /v1/sms`, `GET /v1/sms`, `GET /v1/sms/{id}` |
| Voicemails | `GET /v1/voicemails`, `GET /v1/voicemails/{id}`, `DELETE /v1/voicemails/{id}` |
| AI | `GET/PATCH /v1/numbers/{id}/ai` |
| Account | `GET /v1/account`, `GET /v1/account/usage` |
| Webhooks | `POST/GET /v1/webhook_endpoints`, `DELETE /v1/webhook_endpoints/{id}` |

Paginación cursor-based forward-only, `limit` máx 100.

### Objetos (campos confirmados)

- **Number**: `id, object, number, display, country, type, tier, tier_pattern, status,
  billing_period, renews_at, auto_renew, addons, ai_enabled, metadata, created_at`.
  `PATCH` acepta `auto_renew`, `webhook_url`, `addons`, `on_off` (objeto; aparenta ser el
  horario on/off de la línea — confirmar en el spike S4).
- **Call**: `id, object, from, from_e164, to, direction, status, started_at, answered_at,
  ended_at, duration_sec, recording_url, cost_usd`.
- **SMS**: `id, object, from, from_e164, to, body, media_urls, direction, segments,
  status, failure_code, created_at, delivered_at, cost_usd`. Hasta 1,600 chars
  (auto-segmentado), MMS "in supported regions", envío programado (scheduled delivery).
- **Voicemail**: transcripción y traducción automáticas, resumen IA opcional con
  sentimiento. **Las URLs de audio pre-firmadas expiran en 1 hora** → hay que archivar
  el audio a S3 propio inmediatamente al recibir el evento.

### Ejemplos literales

```bash
# Llamada saliente
curl https://api.privacynumber.io/v1/calls \
  -H "Authorization: Bearer sk_live_…" \
  -d '{"from": "num_8a4c2f1e9b3d", "to": "+33612345678", "callerid_mask": "rotate"}'
# → {"id":"call_2k7m9p3w8x4t","status":"ringing","direction":"outbound",...}

# SMS saliente
curl https://api.privacynumber.io/v1/sms \
  -H "Idempotency-Key: 9b3d4a7c-…" \
  -d '{"from": "num_8a4c2f1e9b3d", "to": "+33612345678", "body": "…"}'
# → {"id":"sms_4n2v8j1q6h7y","segments":1,"cost_usd":0.012}
```

`callerid_mask` acepta al menos `rotate` / `hide` / número propio.

Error envelope:

```json
{"error": {"type": "invalid_request_error", "code": "parameter_missing",
           "message": "…", "param": "country", "request_id": "req_…"}}
```

### Webhooks

- Alta con `POST /v1/webhook_endpoints`; entrega con reintentos y backoff exponencial.
- Firma: header `X-PrivacyNumber-Signature: t=<ts>,v1=<hex>`; `v1` es HMAC-SHA256 de
  `<ts>.<raw_body>` con el signing secret del endpoint. Rechazar si `|now - ts| > 5 min`.
  Comparación en tiempo constante (`hash_equals`).
- Eventos: `number.activated|renewed|paused|released`, `call.initiated|answered|completed|recorded`,
  `sms.received|sent|delivered|failed`, `voicemail.created`, `ai.pickup`,
  `account.balance_low`.

### La limitante central: el audio

El producto entrega el audio de llamadas **solo en su panel web** ("No app. Just a
browser… Two-way HD calls over data"). La API v1 **no expone ningún canal de audio**
para clientes: ni SIP, ni WebRTC tokens, ni forwarding configurable. Consecuencias:

- **SMS**: experiencia 100% real, sin recortes (recibir, enviar, MMS, programados,
  estado de entrega).
- **Llamadas entrantes**: no se pueden contestar con audio dentro de la app vía API. Lo
  máximo alcanzable por API: enterarse en tiempo real (webhook → push tipo llamada),
  ver quién llama, decidir (dejar sonar → buzón / AI pickup, colgar, responder con SMS),
  y a los segundos recibir el voicemail transcrito.
- **Llamadas salientes**: `POST /v1/calls` existe, pero la doc no dice a dónde conecta
  el audio del lado propio → **spike S1 obligatorio** antes de diseñar esa pantalla.
- **La escotilla para audio real**: el panel web del proveedor embebido en un WebView
  autenticado dentro de la app (spike S2). Si funciona, la app tiene llamadas en vivo
  de verdad; si no, el fallback queda documentado en §8.

---

## 2. Arquitectura

**Todo pasa por `api/` (Laravel). La app jamás habla con privacynumber.io.**

```
privacynumber.io ── webhooks (HMAC) ──▶ api/ Laravel ── Reverb (privado) ──▶ app/
                ◀── REST (sk_live) ────  │
                                         ├── Expo push (llamada entrante, SMS, voicemail)
                                         ├── DB propia = fuente de verdad de la UI
                                         ├── S3 (audio de voicemails/grabaciones archivado)
                                         └── Scheduler: reconciliación por polling
```

Razones:

- `sk_live_…` nunca sale del servidor (no hay key de cliente utilizable).
- La DB propia es la fuente de verdad de la UI → historial instantáneo, búsqueda,
  cache offline, y cero dependencia del rate limit del proveedor al navegar.
- **Webhooks + reconciliación**: los webhooks dan el tiempo real; un comando programado
  (cada 5 min) pagina `GET /v1/sms|calls|voicemails` y sana lo que un webhook perdido
  dejó fuera. Con ambos, ningún SMS se pierde en silencio.
- Tiempo real hacia la app con la infraestructura ya existente: Reverb + canal privado,
  con fallback a polling (patrón ya establecido: `createEcho()` devuelve `null` si no
  hay Reverb configurado).

**Visibilidad**: la línea es de Alfonso. Guard `$request->user()->isAlfonso()` (agregar
helper en `User` junto a `isFamilyMember()`); ni Saida ni los kids ven la línea. Si un
día se comparte, es cambiar un guard.

**Naming**: namespace `line` en todo (rutas `api.line.*`, modelos `Line*`, carpeta
`components/line/`). `phone-reports`/`PhoneReport` (family time) y
`chat-messages`/`ChatMessage` (chat IA) ya están ocupados — no tocarlos.

---

## 3. Spikes previos (hacer antes de construir, en este orden)

- **S1 — ¿A dónde va el audio de `POST /v1/calls`?** Con el sk_live real, crear una
  llamada del número propio a un celular de prueba y observar: ¿suena el destino?, ¿de
  dónde sale el audio del lado propio (panel web abierto, callback, nada)?, ¿qué
  reporta `GET /v1/calls/{id}`? El resultado decide la pantalla de llamada saliente
  (§6.5). Si la doc no alcanza, preguntar a soporte (`/contact/`) por: mecanismo de
  audio de outbound, planes para `pk_live_`/WebRTC/SIP, y forwarding.
- **S2 — Panel web en WebView.** Probar el panel del proveedor logueado dentro de
  `react-native-webview` con `mediaCapturePermissionGrantType="grant"`,
  `allowsInlineMediaPlayback`, y permiso de micrófono en iOS. Verificar: login persiste
  (cookies), `getUserMedia` funciona, una llamada de ida y vuelta se oye bien. Resultado
  decide la fase 4.
- **S3 — Webhooks en dev.** El endpoint necesita URL pública. En prod es el API de
  alfonsobries.com; en dev, túnel (p. ej. `cloudflared tunnel` o Expose) apuntando al
  Laravel local, y registrar un `webhook_endpoint` temporal para el túnel (borrarlo al
  terminar). Documentar el flujo en `commands.md` si resulta no trivial.
- **S4 — Contrato real de la API.** Con el key real: `GET /v1/numbers` (capturar el
  `num_id` y el shape exacto), `GET /v1/numbers/{id}/ai` (campos reales del config IA),
  y confirmar qué es `on_off`. Guardar los shapes en los tests como fixtures.

---

## 4. Backend (`api/`)

### 4.1 Config y env

- `api/.env` (+ `.env.example` + actualizar `.agents/env.md`):
  `PRIVACYNUMBER_API_KEY`, `PRIVACYNUMBER_WEBHOOK_SECRET`, y opcional
  `PRIVACYNUMBER_BASE_URL` (default al real, para fakes en tests).
- `api/config/services.php`: bloque `privacynumber` con key, secret, base URL y la
  versión pineada `2026-04-01` como constante del cliente.

### 4.2 Cliente del proveedor

`api/app/Services/Line/PrivacyNumberClient.php`:

- `Http::baseUrl(...)->withToken(...)->withHeaders(['PrivacyNumber-Version' => …])`,
  `retry()` con backoff para 429/5xx (respetando el rate limit), timeout corto.
- Métodos tipados: `numbers()`, `number(string $id)`, `updateNumber(...)`,
  `sendSms(...)` (genera `Idempotency-Key`), `listSms(?string $cursor)`,
  `createCall(...)`, `hangup(...)`, `listCalls(...)`, `voicemails(...)`,
  `deleteVoicemail(...)`, `aiConfig(...)`, `updateAiConfig(...)`, `account()`, `usage()`.
- Error envelope → excepción propia `PrivacyNumberException` con `type/code/param/request_id`;
  los controllers la traducen a respuesta con mensaje traducible y siempre `report($e)`
  cuando no es error del usuario.
- Paginación cursor: helper generador que itera páginas completas.

### 4.3 Esquema de datos (migraciones nuevas, proyecto sin DB de producción → crear limpias)

- `line_contacts`: `id, e164 (unique), name nullable, notes nullable, blocked bool,
  favorite bool, timestamps`. Un contacto se autocrea la primera vez que aparece un
  número desconocido.
- `line_messages`: `id, provider_id (unique, nullable hasta confirmar), contact_id FK,
  direction enum(in|out), body text, media_urls json nullable, segments, status
  enum(queued|sent|delivered|failed|received), failure_code nullable, cost_usd decimal
  nullable, scheduled_at nullable, provider_created_at, delivered_at nullable, read_at
  nullable, timestamps`. Index `(contact_id, provider_created_at)`.
- `line_calls`: `id, provider_id unique, contact_id FK, direction, status
  enum(ringing|answered|completed|missed|voicemail|failed), started_at, answered_at
  nullable, ended_at nullable, duration_sec, recording_path nullable (S3 propio),
  cost_usd nullable, seen_at nullable, timestamps`.
- `line_voicemails`: `id, provider_id unique, call_id FK nullable, contact_id FK,
  audio_path (S3 propio), transcript text nullable, translation text nullable, summary
  text nullable, sentiment nullable, duration_sec nullable, heard_at nullable, timestamps`.
- `line_events`: `id, provider_event_id unique, type, payload json, processed_at
  nullable, timestamps` — idempotencia de webhooks + debugging. El unique es lo que
  hace inofensivos los reintentos del proveedor.
- `line_numbers` (una fila, pero tabla igual): `provider_id, e164, display, status,
  billing_period, renews_at, auto_renew, ai_enabled, ai_config json, synced_at`.

Modelos `LineContact`, `LineMessage`, `LineCall`, `LineVoicemail`, `LineNumber` con
factories realistas (números mexicanos plausibles, cuerpos en español — nunca el número
real) y recursos Nova para cada uno.

### 4.4 Webhook receiver

- Ruta pública `POST /line/webhook` → `LineWebhookController` (fuera del grupo sanctum),
  con middleware `VerifyPrivacyNumberSignature`: lee el **raw body**, parsea
  `X-PrivacyNumber-Signature`, valida ventana de 5 min y `hash_equals` del HMAC.
- El controller solo: valida firma → inserta en `line_events` (ignora duplicado por
  unique) → `dispatch(ProcessLineEvent::class)` → `200` inmediato. Nada de trabajo
  pesado en el request.
- `ProcessLineEvent` (job, queue via Horizon) rutea por `type`:
  - `sms.received` → upsert `LineMessage` (in) + autocrear contacto → broadcast
    `LineMessageReceived` → push `LineMessageNotification` (con detección de OTP, §7).
  - `sms.sent|delivered|failed` → actualizar status del mensaje → broadcast update.
  - `call.initiated` (inbound) → crear `LineCall(ringing)` → broadcast `LineCallRinging`
    → push tipo llamada (time-sensitive, §6.4).
  - `call.answered|completed` → actualizar; si terminó sin `answered_at` → `missed` +
    push "Llamada perdida".
  - `call.recorded` → job `ArchiveLineAudio` (descarga `recording_url` a S3 **ya**, por
    la expiración de 1 h) → guardar `recording_path`.
  - `voicemail.created` → `GET /v1/voicemails/{id}` → `ArchiveLineAudio` + guardar
    transcript/translation/summary → broadcast + push con snippet del transcript.
  - `ai.pickup` → marcar la llamada como atendida por IA (estado visible en UI).
  - `number.paused|released` → **alarma**: notificación Telegram a Alfonso (canal ya
    instalado) + push. Perder el número es el peor escenario.
  - `account.balance_low` → Telegram + push.

### 4.5 Reconciliación y estado de la línea

- Comando `line:sync` en el scheduler cada 5 min: pagina `listSms`/`listCalls`/
  `voicemails` desde el último `provider_created_at` conocido y upsertea lo que falte
  (mismos handlers que los eventos, sin notificaciones duplicadas: solo notifica lo que
  no existía y es reciente).
- Comando `line:sync-number` diario: refresca `line_numbers` (status, `renews_at`,
  `auto_renew`, config IA) y usage/costos de `GET /v1/account/usage` para la pantalla
  de administración. Si `renews_at` está a ≤7 días y `auto_renew` off → Telegram.

### 4.6 API para la app (rutas `api.line.*`, todas bajo sanctum + guard `isAlfonso()`)

- `GET line/overview` → `api.line.overview`: número (display + e164), status, renews_at,
  ai_enabled, contadores no leídos, usage del mes. Payload de una pantalla.
- `GET line/threads` → `api.line.threads.index`: contactos con último mensaje/llamada,
  unread count. `GET line/threads/{contact}` → mensajes paginados (y marca `read_at`).
- `POST line/messages` → `api.line.messages.store`: `{to, body, scheduled_at?}` →
  crea `LineMessage(queued)` local, llama `sendSms` con `Idempotency-Key` derivada del
  id local (el replay del offline queue no duplica), responde el mensaje creado; el
  webhook `sms.sent|delivered` lo va actualizando.
- `GET line/calls` → `api.line.calls.index` (historial con contacto y voicemail
  embebidos). `POST line/calls` → `api.line.calls.store` (`{to, callerid_mask}`) según
  resultado de S1. `POST line/calls/{call}/hangup` → `api.line.calls.hangup`.
- `GET line/voicemails/{voicemail}/audio` → `api.line.voicemails.audio`: stream/redirect
  firmado del S3 propio (mismo patrón de auth de assets que ya usa `authImageHeaders()`).
- `PATCH line/contacts/{contact}` → `api.line.contacts.update` (nombre, notas, blocked,
  favorite). Bloqueado = se guarda todo igual pero sin broadcast-push (el registro queda).
- `GET/PATCH line/settings` → `api.line.settings.*`: config IA del número
  (`ai_enabled`, campos según S4), `auto_renew`, horario `on_off`.
- Broadcasting: canal privado `line` en `routes/channels.php`, autorizado solo para
  Alfonso. Eventos `ShouldBroadcast` con `broadcastWith()` = mismo payload que la API.

### 4.7 Tests (Pest, `it()`)

- Firma de webhook: válida pasa, HMAC inválido 403, timestamp viejo 403, replay del
  mismo `provider_event_id` no duplica filas.
- Cada tipo de evento produce el estado correcto (fixtures de S4 + `Http::fake`).
- `PrivacyNumberClient`: headers (versión, idempotencia), retry en 429, mapeo del error
  envelope.
- Autorización: Saida y kids reciben 403 en todas las rutas `line.*`.
- Envío: replay con misma idempotency key no crea segundo mensaje.
- Detección de OTP (§7) con casos reales (código 4-8 dígitos, formatos "G-123456", etc.).
- `line:sync` sana un mensaje que no llegó por webhook sin re-notificar los viejos.

---

## 5. App (`app/`) — estructura

Siguiendo el patrón por capas del repo:

- **Cliente API**: `app/src/api/line.ts` — tipos TS a mano espejo de los payloads +
  `fetchLineOverview`, `fetchThreads`, `fetchThread`, `sendLineMessage`, `fetchCalls`,
  `placeCall`, `hangupCall`, `updateLineContact`, `fetchLineSettings`,
  `updateLineSettings`. Después de agregar rutas: `pnpm routes:generate` y commitear
  `ziggy.gen.*`.
- **Pantallas** (`app/src/app/(app)/line/`): `index.tsx` (hub: número + hilos +
  no-leídos), `thread.tsx`, `calls.tsx`, `voicemail.tsx`, `dialer.tsx`, `contact.tsx`,
  `settings.tsx`, `incoming.tsx` (modal full-screen de llamada entrante). Entrada desde
  Home con `ActionTile` (misma jerarquía que las demás utilidades; no es tab nuevo —
  los `NativeTabs` actuales quedan).
- **Componentes**: `app/src/components/line/` — `ThreadList`, `ThreadListItem`,
  `MessageBubble`, `MessageComposer`, `SegmentCounter`, `OtpMessage`, `CallLogItem`,
  `VoicemailPlayer`, `TranscriptCard`, `Keypad`, `IncomingCallCard`, `LineStatusCard`.
  Todo con primitivas de `components/ui/` y tokens; nada de colores sueltos.
- **Tiempo real**: `app/src/hooks/use-line-channel.ts` — calca
  `use-conversation-channel.ts`: canal privado `line`, eventos de mensaje/llamada/
  voicemail; si `createEcho()` da `null`, polling con `refresh` en foco.
- **Offline** (clasificación del guía `offline.md`):
  - Historial (hilos, llamadas, voicemails ya archivados): *cache-first* con
    `useCachedResource` + `cacheKeys` nuevos.
  - Enviar SMS: *registra offline y sincroniza* — `defineOfflineMutation('line.send', …)`
    con `dedupeKey`; el mensaje aparece como `queued` con su pill, igual que iMessage
    sin señal. La idempotency key server-side hace el replay seguro.
  - Llamar: *necesita red y lo dice* (botón deshabilitado con `OfflinePill`).
- **Formato**: helper compartido `formatPhone` (`app/src/lib/…`) usando
  `libphonenumber-js` (dep JS pura, OTA-safe) para mostrar E.164 bonito; fechas con los
  helpers de fecha existentes.
- **Copy**: en el idioma del resto de la UI de la app (inglés, consistente con lo
  existente; la app no tiene i18n y este plan no lo introduce).

### 6. Las cuatro experiencias clave

**6.1 Mensajes (la joya — aquí no hay recortes).** Lista de hilos estilo Mensajes
(avatar/inicial, nombre o número formateado, preview, hora, badge no leído). Hilo con
burbujas in/out, estados por mensaje (reloj `queued` → ✓ `sent` → ✓✓ `delivered` → ⚠
`failed` con retry), MMS como imágenes (`expo-image` con headers auth), envío programado
("enviar a las 9:00"), contador de segmentos discreto cuando pasa de 1 (cada segmento
cuesta), auto-scroll, y los mensajes entrantes aterrizando en vivo por Reverb.

**6.2 Llamada entrante — el "timbre".** Webhook `call.initiated` → push **time-sensitive**
(`interruptionLevel: 'timeSensitive'`, sonido) "📞 {contacto} está llamando" + si la app
está abierta, Reverb dispara el modal `incoming.tsx` full-screen: nombre/número grande,
y las acciones que la API sí permite — **Colgar** (`hangup`), **Dejar que conteste el
buzón/IA** (no hacer nada; si `ai.pickup` llega, la UI lo dice), y **Responder con SMS**
(quick replies "No puedo contestar, ¿todo bien?" → manda SMS real, como iOS). Cuando la
llamada termina: si hubo voicemail, en segundos llega la notificación con el transcript
— el flujo real es "no contesté, pero ya leí lo que querían antes de desbloquear el
teléfono", que es *mejor* que un buzón normal.

**6.3 Buzón y grabaciones.** `voicemail.tsx`: lista con play inline
(`react-native-track-player`, ya instalado — sin cambio nativo), transcript completo,
traducción si aplica, resumen IA y sentimiento como chips. Audio servido del S3 propio
(nunca la URL del proveedor, que ya expiró).

**6.4 Llamada saliente.** `dialer.tsx`: keypad + selector de contacto reciente +
selector de caller ID (número propio / `rotate` / `hide`). El comportamiento post-`POST
/v1/calls` lo define S1; la pantalla muestra el estado en vivo (`ringing → answered →
completed`, duración, costo) vía Reverb. Si S1 revela que el audio requiere el panel
(probable), esta pantalla en fase 3 crea la llamada y la fase 4 le añade el audio.

---

## 7. Detalles "experiencia de número real" (el catálogo de extras)

- **OTPs de primera clase.** Regex server-side al recibir SMS (códigos 4-8 dígitos,
  formatos tipo `G-123456`); si es OTP, el push dice "Código: 482917 — {remitente}" y la
  burbuja en el hilo se renderiza como `OtpMessage` con botón **Copiar código**
  (`expo-clipboard`, JS-safe). Es EL caso de uso #1 de un número privado.
- **Responder desde la notificación.** Categoría de `expo-notifications` con acción de
  text input en el push de SMS → la respuesta se manda sin abrir la app (el handler
  llama `sendLineMessage`). JS-only, OTA-safe.
- **Deep links.** Todo push lleva `data.url` (`alfonsobries://line/thread?contact=…`,
  `…/incoming`, `…/voicemail`) — patrón ya usado por `IllustrationReadyNotification`.
- **Apple Watch gratis.** Los pushes se espejan solos al Watch ya emparejado; el
  transcript del voicemail en la muñeca sin trabajo extra.
- **No leídos reales.** Badge count del app icon = mensajes no leídos + llamadas
  perdidas no vistas (`setBadgeCountAsync` al sincronizar).
- **Bloqueados.** `blocked` en el contacto: se registra todo, no suena nada.
- **Búsqueda.** Input de búsqueda server-side sobre `line_messages.body` y contactos.
- **Costos visibles.** `settings.tsx` muestra gasto del mes (usage), costo por mensaje/
  llamada en el detalle, y saldo bajo → alerta. Sin sorpresas de prepago.
- **Vida del número.** `LineStatusCard`: status, renovación, auto-renew toggle. Alarmas
  Telegram+push en `number.paused|released` y renovación próxima sin auto-renew —
  perder el número es perder el 2FA de todo lo que se registró con él.
- **Screening IA configurable.** `settings.tsx` expone el config de
  `/v1/numbers/{id}/ai` (auto-pickup, rings, idiomas) — el "asistente que contesta" es
  parte de la experiencia premium del número.
- **Horario de la línea.** Si S4 confirma que `on_off` es schedule, exponerlo ("no
  timbrar de 22:00 a 8:00"; los SMS siempre entran).
- **Export.** Comando `line:export` (JSON a S3) mensual — el historial es de Alfonso,
  no del proveedor.
- **Opcional (bump nativo, fase 4):** `expo-contacts` para resolver nombres contra los
  contactos del iPhone, y Communication Notifications (avatar del remitente en el push)
  — solo si la fase 4 sucede, para amortizar el rebuild.

---

## 8. Audio en vivo (fase condicionada a spikes)

Si S2 confirma que el panel funciona en WebView:

- `react-native-webview` (nuevo módulo nativo) + `NSMicrophoneUsageDescription` →
  **bump `runtimeVersion` a 1.15.0** en el mismo cambio + rebuild local
  (`eas build --local`) e instalar; no hay App Store de por medio.
- Pantalla `line/live.tsx`: WebView al panel, cookies persistentes, mic granted. Se
  llega desde `incoming.tsx` ("Contestar en panel") y desde `dialer.tsx`. No es un
  iframe vergonzante: es la única puerta de audio que el proveedor ofrece, envuelta en
  la app con nuestra navegación.
- Batch del bump: en el mismo rebuild van `expo-contacts` y Communication Notifications
  si se quieren (§7).

Si S2 falla (panel bloquea WebView/getUserMedia): fallback = botón "Abrir panel" con
`expo-web-browser` (`openAuthSessionAsync` mantiene sesión) — un tap y estás en la
llamada; y dejar por escrito la respuesta de soporte sobre WebRTC/SIP para revisitar.

---

## 9. Fases y entregas

Cada fase = rama + commits incrementales + PR draft (convenciones de `core.md`). Antes
de cada push: `composer fix && composer analyse && composer test` en `api/`,
`pnpm typecheck && pnpm lint` en `app/`. No se mergea nada sin que Alfonso lo pruebe.

> **Regla de Alfonso para este desarrollo: no pushear nada sin su OK explícito.** Antes
> de cada push, revisar el diff completo: cero rastro del número real, de `sk_live_…` o
> del webhook secret (el repo es público).

| Fase | Contenido | Nativo |
|---|---|---|
| 0 | Spikes S1-S4 (resultados anotados en este doc, sección §10) | No |
| 1 | Backend completo: client, migraciones, webhooks+HMAC, jobs, sync, eventos, push, Telegram, Nova, rutas `api.line.*`, tests | No |
| 2 | App SMS: hilos, burbujas, composer, offline queue, Reverb, OTP, quick reply, badges, `routes:generate` | No (OTA) |
| 3 | Llamadas + buzón: incoming modal, call log, voicemail player, dialer según S1, settings (IA, renovación, usage) | No (OTA) |
| 4 | Audio en vivo (WebView) + extras nativos batcheados | **Sí — bump 1.15.0 + rebuild** |
| 5 | Pulido: búsqueda, export, scheduled send UI, bloqueados, revisión de estados vacíos/error de todas las pantallas | No |

Criterio de done por pantalla (no negociable): estados vacío/cargando/error/offline
resueltos, dark mode con tokens, targets táctiles y labels de accesibilidad, sin N+1 en
los endpoints que la alimentan (verificar eager loading), y listas largas con
`FlatList`/virtualización.

## 10. Resultados de spikes (llenar al ejecutar)

- S1 (audio outbound): _pendiente_
- S2 (panel en WebView): _pendiente_
- S3 (túnel webhooks dev): _pendiente_
- S4 (shapes reales: number, ai config, `on_off`): _pendiente_

## 11. Riesgos conocidos

- **Sin sandbox**: cada prueba real cuesta dinero y usa la línea real. Tests siempre
  con fakes; pruebas manuales puntuales y anotadas.
- **Outbound calls sin documentar** (S1) — la pantalla de dialer no se diseña en
  detalle hasta tener la respuesta.
- **URLs de audio expiran en 1 h** — el archivado a S3 es parte del handler del evento,
  no un "luego".
- **MMS "in supported regions"** — confirmar si aplica a números MX; si no, la UI
  esconde el attach (no un botón que falla).
- **Rate limit 100/min** — la reconciliación pagina con calma; la UI nunca le pega al
  proveedor directo.
- **Dependencia total del proveedor** — mitigada con DB propia + export mensual: si el
  servicio muere, el historial sobrevive.
