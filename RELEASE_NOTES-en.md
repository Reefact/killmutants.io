# Release notes — killmutants.io

🌍 🇬🇧 English (this file) · 🇫🇷 [Français](RELEASE_NOTES-fr.md)

What changed on killmutants.io, one section per `release/*` tag, in plain language. This is
not a commit log: it says what a reader would notice. The technical record is the
repository's own history.

## Unreleased

## release/2026-09-02T02-51-56Z — September 2, 2026

### ✨ New

- First version of the site: a "coming soon" announcement page with the KillMutants hero,
  a short pitch, and a link to the tool's GitHub repository.
- The site is now deployed on Cloudflare Workers, reachable at `killmutants.io`.
- Every page now carries a shared header: the KillMutants mark (links back to the home
  page), a link to the tool's GitHub repository, and a language selector.
- Added a `/version` page, showing what this deployment is (release, commit, build time)
  and what the site last shipped — this changelog, in other words.
- The site is now available in French, at `/fr/`.

### 🐛 Fixes

- Fixed the header on narrow phone screens, where the language selector could end up
  overlapping the KillMutants mark instead of sitting below it.
