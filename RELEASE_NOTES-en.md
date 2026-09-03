# Release notes — killmutants.io

🌍 🇬🇧 English (this file) · 🇫🇷 [Français](RELEASE_NOTES-fr.md)

What changed on killmutants.io, one section per `release/*` tag, in plain language. This is
not a commit log: it says what a reader would notice. The technical record is the
repository's own history.

## Unreleased

## release/2026-09-03T09-40-33Z — September 3, 2026

### 🙌 Improvements

- The home page header no longer shows a second GitHub link — the hero already has its own
  prominent "Star on GitHub" button pointing at the same place.

### 🐛 Fixes

- Restored the header's original GitHub-before-language order on desktop, after the previous
  release's mobile tab-order fix had changed it there too as a side effect.
- Fixed the hero tagline ("Mutation testing for .NET · Coming soon") crowding against the
  header on medium-width browser windows, and dropped its icon.

## release/2026-09-03T06-48-42Z — September 3, 2026

### 🐛 Fixes

- Fixed the header on short mobile screens, where the hero tagline ("Mutation testing for
  .NET · Coming soon") could overlap the navigation bar above it.
- On narrow phones, GitHub now sits on its own centered row below the language selector,
  instead of both being squeezed onto the same line as the KillMutants mark.
- Fixed a keyboard-navigation issue where tabbing through the header didn't follow the
  order things appear on screen.
- Header links (GitHub, the language selector) now get the same violet glow on hover as
  every other link on the site.

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
