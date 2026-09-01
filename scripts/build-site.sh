#!/usr/bin/env bash
# Build the site and stamp it: generate what the /version page needs, build, then
# copy version.json beside the built site so it is also servable on its own at
# /version.json (same approach as justdummies.io).
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

"${root}/scripts/generate-version.sh"
node "${root}/scripts/generate-release-note.mjs"

pnpm --filter @killmutants/web build

cp "${root}/apps/web/src/generated/version.json" "${root}/dist/version.json"
