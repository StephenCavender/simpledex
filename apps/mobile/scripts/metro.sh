#!/usr/bin/env bash
# Starts Metro and copies its output to apps/mobile/.metro.log so agents can read it.
# `script` keeps Metro attached to a terminal, so its keyboard shortcuts still work.
set -euo pipefail
cd "$(dirname "$0")/.."
exec script -qfec "expo start --dev-client $*" .metro.log
