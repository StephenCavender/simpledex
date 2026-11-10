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

### Metro

- **Logs:** `dev:mobile` copies Metro's output, including the app's `console` logs and red-box errors, to `apps/mobile/.metro.log`. Strip its colour codes with `sed 's/\x1b\[[0-9;]*m//g'`.
- **One server:** the maintainer usually has Metro running on 8081 in their own terminal. Check with `curl -s localhost:8081/status` and reuse it; stopping it also kills their terminal session.
- **Stale styles:** Uniwind generates styles inside the running Metro. If classes from newly added files render unstyled, restart with `bun run dev:mobile -- --clear`.

### What an agent can check

- **Android:** the emulator below, with screenshots (`adb exec-out screencap -p`) and the accessibility tree (`adb shell uiautomator dump`).
- **iOS:** nothing. There's no iOS simulator on Linux, so iOS-only bugs (iOS 26 header, toolbar and Liquid Glass behaviour) can't be reproduced. State the suspected cause and ask the maintainer to test on their iPhone before changing code, or file it as an issue.

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
emulator -avd pixel -gpu host &                       # boot the emulator (see the GPU note below)
bunx eas-cli build:run -p android --latest            # install the latest dev build
bun run dev:mobile                                    # then press `a` to open it
```

`eas build:run` needs `build-tools` installed (it uses `aapt`).

The default GPU mode (`auto`) picks the `lavapipe` software renderer here, which has crashed the emulator with a segfault in its graphics cleanup. `-gpu host` uses the Intel GPU instead; if that fails, use `-gpu swiftshader_indirect`. If `adb devices` comes up empty mid-session, check `coredumpctl list qemu-system-x86_64` before blaming your own commands.

## Build profiles

`eas.json` has three kinds of build: development (`development` for simulators and emulators, `development-device` for iPhones), `preview`, and `production`. Builds run on EAS when you start them from your machine; there's no CI.

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

- **iOS**: `submit.production.ios.ascAppId` in `eas.json` is the App Store Connect app's Apple ID (the number in its App Store Connect URL), so `eas submit` uploads to it without prompting. It's the earlier SimpleDex app's record, which 3.0.0 continues.
- **Android**: Google Play only accepts API uploads once the app exists in the Play Console and one build has been uploaded by hand. Upload the first production `.aab` in the Play Console, then put a Google service account key with release permissions at `apps/mobile/google-service-account.json` (gitignored) for `eas submit`. Play only accepts draft releases until the app's first review is done, so `releaseStatus` in `eas.json` is `draft`; once the app is approved, change it to `completed` to roll out on submit.

### Android sideload release (GitHub Releases)

Until SimpleDex is on Google Play, Android users install an APK from GitHub Releases, following the marketing site's [`/android`](https://mkt.simpledex.cavender.dev/android) page (#23). Push the commit you're releasing first, then:

```sh
bun run release:android              # builds the `production-apk` profile on EAS, then publishes the release
bun run release:android <build-id>   # publishes an existing finished `production-apk` build instead
```

The script tags the release `android-v<version>-build.<n>` at the build's commit, attaches the APK as `simpledex.apk`, and marks it latest, so `releases/latest/download/simpledex.apk` always serves the newest build. It needs `gh` signed in with write access to the repo, plus `jq` and `curl`.

- `production-apk` is `production` built as an APK: production Convex, the `production` update channel, and the same build number sequence. JS-only fixes reach sideloaded installs through EAS Update like store installs.
- Every APK must be signed with the same EAS-managed keystore, or it won't install over the previous one. Don't reset the Android credentials in EAS.
- Google's developer verification for sideloaded apps may require registering the package name and signing key in the Android developer console once the account is verified.

### Store screenshots

Store screenshots must not show recognisable Pokémon artwork: App Store review rejected the earlier app's screenshots for it. Screenshot mode draws each piece of artwork at 8 points and scales it up inside a circle, so only a soft orb of its colours shows. Start Metro with it, in a development build:

```sh
EXPO_PUBLIC_SCREENSHOT_MODE=1 bun run dev:mobile -- --clear   # --clear, or Metro reuses bundles built without it
```

It has no effect in `preview` or `production` builds. Restart Metro without the variable (and with `--clear`) to get the artwork back.

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
