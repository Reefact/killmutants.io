#!/usr/bin/env bash
# Stamp the build with what it is: version.json.
#
# It answers "which release is live" — a release/* tag is the unit of publication
# (same convention as justdummies.io). Written by the build, from git, before the
# site is built, into src/generated/ so the /version page can import it. Not
# committed: it changes on every build by construction (see .gitignore).
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
generated="${root}/apps/web/src/generated"
mkdir -p "${generated}"

# --points-at rather than `git describe`: a release is the tag on THIS commit, never
# the nearest one behind it.
release="$(git -C "${root}" tag --points-at HEAD 2> /dev/null | grep '^release/' | head -1 || true)"
commit="$(git -C "${root}" rev-parse HEAD 2> /dev/null || true)"

# CI checks out a tag as a detached HEAD, which does not always leave a local tag
# ref behind — GITHUB_REF_NAME is the second source for the same fact.
ci_release=""
case "${GITHUB_REF_TYPE:-}:${GITHUB_REF_NAME:-}" in
  tag:release/*) ci_release="${GITHUB_REF_NAME}" ;;
esac

if [ -z "${release}" ] && [ -n "${ci_release}" ]; then
  release="${ci_release}"
  echo "  ! no local tag ref, so the release name comes from GITHUB_REF_NAME" >&2
elif [ -n "${release}" ] && [ -n "${ci_release}" ] && [ "${release}" != "${ci_release}" ]; then
  echo "generate-version: HEAD carries ${release}, but this run is for ${ci_release}." >&2
  echo "  Refusing to guess which one is being published." >&2
  exit 1
fi

if [ -z "${commit}" ]; then
  echo "  ! no git metadata here, so version.json cannot name a commit" >&2
fi

json_or_null() {
  if [ -z "$1" ]; then printf 'null'; else printf '"%s"' "$1"; fi
}

cat > "${generated}/version.json" <<JSON
{
  "release": $(json_or_null "${release}"),
  "commit": $(json_or_null "${commit}"),
  "built": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
JSON

echo "  apps/web/src/generated/version.json  (release: ${release:-none}, commit: ${commit:0:7})"
