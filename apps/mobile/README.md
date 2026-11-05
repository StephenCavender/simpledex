# SimpleDex mobile

The iOS and Android app: Expo SDK 58, Expo Router, and Uniwind, styled from `@simpledex/tokens` (ADR-0003, ADR-0004).

## Setup

Create `apps/mobile/.env.local` pointing at the dev Convex deployment (the `CONVEX_URL` in `packages/backend/.env.local`):

```sh
EXPO_PUBLIC_CONVEX_URL=https://<dev-deployment>.convex.cloud
```

`@simpledex/env/native` validates it at startup.

## Development build

The app uses native modules that Expo Go doesn't include, so it runs in a development build. Build one with the EAS `development` profile:

```sh
bunx eas-cli build --profile development --platform android
bunx eas-cli build --profile development --platform ios   # iOS simulator build
```

Install the build on the emulator or simulator, then start Metro from the repo root:

```sh
bun run dev:mobile
```

The development build loads its JavaScript from Metro, so it uses the Convex URL in `.env.local`.

### iPhone

Physical iPhones need the `development-device` profile and an active Apple Developer membership:

```sh
bunx eas-cli device:create                                         # once per iPhone: register it for internal builds
bunx eas-cli build --profile development-device --platform ios     # signs in to Apple and manages certificates
```

Install the build from the QR code on its EAS build page and turn on Developer Mode (Settings → Privacy & Security). The iPhone must reach Metro: put it on the same Wi-Fi and allow port 8081 through the firewall, or start Metro with `--tunnel`.

### Android emulator (Linux)

With the Android SDK in `~/Android/Sdk` (`ANDROID_HOME`, with `emulator` and `platform-tools` on `PATH`) and an AVD named `pixel`:

```sh
emulator -avd pixel &                                 # boot the emulator
bunx eas-cli build:run -p android --latest            # install the latest dev build
bun run dev:mobile                                    # then press `a` to open it
```

`eas build:run` needs `build-tools` installed (it uses `aapt`).

## Build profiles

`eas.json` has three build profiles. Builds run on EAS when you start them from your machine; there's no CI.

| Profile                             | For                                           | Convex deployment | Update channel |
| ----------------------------------- | --------------------------------------------- | ----------------- | -------------- |
| `development`, `development-device` | Dev builds that load JS from Metro            | dev               | none           |
| `preview`                           | Internal builds to share (Android APK)        | dev               | `preview`      |
| `production`                        | Store builds, version number auto-incremented | prod              | `production`   |

Profiles read `EXPO_PUBLIC_CONVEX_URL` from an EAS environment, not from `.env.local`. `development` and `preview` use the `development` environment (the dev deployment), so test builds never touch production data. `production` uses the `production` environment (`adept-labrador-868`). To check or change the values:

```sh
bunx eas-cli env:list --environment development
bunx eas-cli env:update --environment production --variable-name EXPO_PUBLIC_CONVEX_URL --value https://<deployment>.convex.cloud
```

## Releasing

Run these from `apps/mobile`.

### Preview build

```sh
bunx eas-cli build --profile preview --platform android   # APK: install from the build page's link or QR code
bunx eas-cli build --profile preview --platform ios       # needs an Apple Developer membership and registered devices (`eas device:create`)
```

### Production build and store submission

```sh
bunx eas-cli build --profile production --platform all
bunx eas-cli submit --profile production --platform ios       # to TestFlight
bunx eas-cli submit --profile production --platform android   # to Play internal testing, as a draft release
```

Submission needs the store accounts (#15):

- **iOS**: the first `eas submit` signs in with your Apple ID and creates the App Store Connect app. Afterwards, add its `ascAppId` to `submit.production.ios` in `eas.json` so later submissions don't prompt.
- **Android**: Google Play only accepts API uploads once the app exists in the Play Console and one build has been uploaded by hand. Upload the first production `.aab` in the Play Console, then put a Google service account key with release permissions at `apps/mobile/google-service-account.json` (gitignored) for `eas submit`. Releases stay drafts (`releaseStatus` in `eas.json`) until the app's first review is done.

### JS-only fixes with EAS Update

When a fix changes only JavaScript or assets, publish it as an update instead of a new build:

```sh
bunx eas-cli update --channel production --environment production --message "Fix …"
bunx eas-cli update --channel preview --environment development --message "Try …"
```

`--environment` must match the channel's builds, or the update bundles the wrong Convex URL. Installed builds download the update at the next launch and apply it on the launch after.

Builds and updates are matched by a fingerprint of the native project (`runtimeVersion: { policy: "fingerprint" }` in `app.json`). An update only reaches builds with the same native code, so after adding or upgrading a native module you need a new build; the update won't apply to older ones. `bunx expo-updates fingerprint:generate --platform ios` (or `android`) prints the current fingerprint.

## Checks

- `bun run check-types`: generates Uniwind's types, then runs `tsc`
- `bun run test`: jest-expo
- `bunx expo-doctor`: Expo dependency and config checks
