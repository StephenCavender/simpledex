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

### Android emulator (Linux)

With the Android SDK in `~/Android/Sdk` (`ANDROID_HOME`, with `emulator` and `platform-tools` on `PATH`) and an AVD named `pixel`:

```sh
emulator -avd pixel &                                 # boot the emulator
bunx eas-cli build:run -p android --latest            # install the latest dev build
bun run dev:mobile                                    # then press `a` to open it
```

`eas build:run` needs `build-tools` installed (it uses `aapt`).

## Checks

- `bun run check-types`: generates Uniwind's types, then runs `tsc`
- `bun run test`: jest-expo
- `bunx expo-doctor`: Expo dependency and config checks
