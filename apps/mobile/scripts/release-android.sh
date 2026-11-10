#!/usr/bin/env bash
# Publishes an Android APK as a GitHub Release for sideloading.
#
#   ./scripts/release-android.sh             # build with the `production-apk` profile on EAS, then publish it
#   ./scripts/release-android.sh <build-id>  # publish an existing finished `production-apk` build
#
# The APK is attached as `simpledex.apk`, so
# https://github.com/StephenCavender/simpledex/releases/latest/download/simpledex.apk
# always serves the newest release. The release is tagged at the build's commit,
# which must already be on GitHub.
set -euo pipefail
cd "$(dirname "$0")/.."

PROFILE="production-apk"

if [[ $# -gt 1 ]]; then
  echo "usage: $0 [build-id]" >&2
  exit 1
fi

if [[ $# -eq 1 ]]; then
  build=$(bunx eas-cli build:view "$1" --json)
else
  build=$(bunx eas-cli build --profile "$PROFILE" --platform android --non-interactive --wait --json | jq '.[0]')
fi

field() { jq -r "$1 // empty" <<<"$build"; }

status=$(field .status)
profile=$(field .buildProfile)
if [[ "$status" != "FINISHED" || "$profile" != "$PROFILE" ]]; then
  echo "Build $(field .id) is $status on profile '$profile'; need a FINISHED '$PROFILE' build." >&2
  exit 1
fi

version=$(field .appVersion)
build_number=$(field .appBuildVersion)
commit=$(field .gitCommitHash)
url=$(field .artifacts.applicationArchiveUrl)
tag="android-v${version}-build.${build_number}"

workdir=$(mktemp -d)
trap 'rm -rf "$workdir"' EXIT
apk="$workdir/simpledex.apk"
curl -fsSL "$url" -o "$apk"
sha=$(sha256sum "$apk" | cut -d' ' -f1)

notes="SimpleDex ${version} (build ${build_number}) for Android.

Install instructions: https://mkt.simpledex.cavender.dev/android

SHA-256 of \`simpledex.apk\`: \`${sha}\`"

gh release create "$tag" "$apk" \
  --target "$commit" \
  --title "SimpleDex ${version} for Android (build ${build_number})" \
  --notes "$notes" \
  --latest

echo "Published $tag"
