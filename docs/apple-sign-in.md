# Sign in with Apple

The mobile app (`app/`) authenticates with **Sign in with Apple**. The flow is a
native token exchange:

1. The app gets an Apple **identity token** (a signed JWT) via
   `expo-apple-authentication`.
2. It POSTs the token to the API at `POST /api/auth/apple`.
3. The API verifies the token against Apple's public keys, finds-or-creates the
   user by their Apple id, and returns a **Sanctum** bearer token.
4. The app stores that token in the device keychain (`expo-secure-store`) and
   sends it as `Authorization: Bearer <token>` on every request.

Because the API only *verifies* tokens Apple already signed, most of the setup is
about telling Apple which app is allowed to sign in. For the iOS build you only
need the two steps in [Minimum setup](#minimum-setup).

## Minimum setup (iOS only)

This is all that's required for the current iOS app.

### 1. Enable the capability on your App ID

1. Go to the [Apple Developer portal](https://developer.apple.com/account) →
   **Certificates, Identifiers & Profiles** → **Identifiers**.
2. Open (or create) the App ID for the bundle identifier `com.alfonsobries.app`.
3. Enable the **Sign In with Apple** capability and save.

The app already declares the entitlement — `app.json` sets
`ios.usesAppleSignIn: true` and loads the `expo-apple-authentication` plugin — so
a fresh native build (`expo prebuild` / EAS build) picks it up automatically.

The provisioning profile also has to carry the capability. Run one EAS build
**without** frozen credentials so EAS enables it on the App ID and regenerates the
profile:

```bash
cd app && eas build -p ios --local --profile local
```

After that, the frozen `pnpm local:build` reuses the updated profile. Skipping
this step fails the build with *"Provisioning profile … doesn't include the
com.apple.developer.applesignin entitlement"*.

### 2. Point the API at the bundle identifier

The API checks that each identity token was minted for our app by comparing its
`aud` claim to `APPLE_CLIENT_ID`. Set it in `api/.env`:

```dotenv
APPLE_CLIENT_ID=com.alfonsobries.app
```

It defaults to `com.alfonsobries.app`, so if you keep the bundle identifier you
can leave it unset. There is **no client secret or private key** to manage for
the native flow.

That's it — build the iOS app, tap **Sign in with Apple**, and you're in.

## Optional: web / Android (Services ID)

Only needed if you later add a non-iOS sign-in flow. Apple issues those tokens for
a **Services ID** instead of the bundle identifier, so you register it and add it
as a second allowed audience.

1. In **Identifiers**, create a new **Services ID** (e.g. `com.alfonsobries.signin`).
2. Enable **Sign In with Apple** on it and configure its domain and return URL.
3. Add it to `api/.env`:

   ```dotenv
   APPLE_SERVICES_ID=com.alfonsobries.signin
   ```

The API accepts a token whose `aud` matches either `APPLE_CLIENT_ID` or
`APPLE_SERVICES_ID`.

## How it verifies (reference)

`api/app/Services/Apple/AppleTokenVerifier.php`:

- Fetches and caches Apple's JWKS from `https://appleid.apple.com/auth/keys`
  (busting the cache and retrying once if Apple has rotated its signing keys).
- Verifies the JWT signature and expiry with `firebase/php-jwt`.
- Requires `iss` to be `https://appleid.apple.com` and `aud` to be an allowed
  audience (`APPLE_CLIENT_ID` / `APPLE_SERVICES_ID`).
- Returns the Apple user id (`sub`) and email; private-relay emails are flagged.

## Troubleshooting

- **403 "Unexpected token audience"** — the token's `aud` doesn't match
  `APPLE_CLIENT_ID`. Confirm the app's bundle identifier equals the configured
  value.
- **401 "Invalid Apple identity token"** — the token failed signature/expiry
  verification. Make sure the device clock is correct and the app is sending the
  `identityToken` (not the authorization code).
- **Build fails: "Provisioning profile … doesn't include the
  com.apple.developer.applesignin entitlement"** — the profile predates the
  capability. Run `cd app && eas build -p ios --local --profile local` (no
  `--freeze-credentials`) once to enable it on the App ID and regenerate the
  profile, then the frozen build works.
- **The Apple button doesn't appear** — Sign in with Apple only runs on iOS
  devices/simulators (iOS 13+). The login screen shows a note on other platforms.
