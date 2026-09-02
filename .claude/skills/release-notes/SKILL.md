---
name: release-notes
description: Draft or refresh killmutants.io's own changelog — a visitor-facing account of what changed on the site since the previous release/* tag, kept as the "Unreleased" section of RELEASE_NOTES.md. Use when asked to draft, write, or update release notes, or before tagging a release.
---

# Release notes

**A release note is not a commit log.** The source is the commit history since the previous
`release/*` tag — `git log <previous-release-tag>..HEAD --oneline`, or every commit if there is
no previous tag yet — read and rewritten by hand into product terms. Never paste commit
messages or PR titles verbatim.

**This is the *site's* changelog, not the tool's.** `killmutants.io` and `Reefact/kill-mutants`
are two different products with two different changelogs. What changed on the website (a new
page, a fixed layout bug, a new nav item) goes here. What changed in the mutation-testing tool
itself belongs in that repository's own release notes — never mirrored into this file, and
never shown as if it were a site change.

## Where it lives

One file, at the repository root: `RELEASE_NOTES.md`. Keep-a-Changelog-shaped:

* `## Unreleased` — always present, even when empty. This is where a release is drafted, before
  it has a tag.
* One `## release/<tag> — <Month> <day>, <year>` section per past release, newest first.

## Format

```
## release/<tag> — <Month> <day>, <year>

_<optional one-line theme — omit rather than force one>_

### ✨ New
### 🙌 Improvements
### 🐛 Fixes
```

Rules:

* **Keep only the categories that have content**; delete the empty ones, never print an empty
  heading. If a release genuinely carried nothing a visitor would notice (a dependency bump, a
  build-script fix, a wording tweak in this skill), skip the categories and write one calm
  sentence instead — e.g. *"Internal maintenance only — no visible change on the site."*
  `scripts/generate-release-note.mjs` refuses a release section with neither a summary nor a
  rubric (see the file's own grammar notes), so an empty release still needs that sentence.
* **One bullet, one sentence you could read aloud.** Say what a reader would notice — a new
  page, a fixed bug, a changed layout — not which commit or PR carried it. No PR numbers, no
  commit-type prefixes (`feat`/`fix`/`docs`), no internal filenames unless a reader would
  genuinely care.
* **Collapse, don't enumerate.** Several commits often build one visible thing in stages (a page
  landing, then its header, then a bug in it fixed). Describe the outcome once, not once per
  commit.
* **Invent nothing beyond what the commits state.** If it isn't there, it isn't in the note.
* **Calm, not marketing.** No superlatives the change itself doesn't earn.
* **Links are full `https://github.com/Reefact/killmutants.io/blob/main/...` URLs, never
  relative ones.** This file is read two ways a repository file normally is not: as a file here
  (where a relative link works) and — once the site links out to a specific commit or path from
  a release note — pasted into a page that has no directory of its own.
* **One physical line per paragraph and per bullet.** Let the editor soft-wrap; do not insert a
  newline into the file yourself.

## Before tagging a release

`scripts/generate-release-note.mjs` reads the **newest released section** (never `## Unreleased`)
into `apps/web/src/generated/site-release.json`, which the `/version` page renders. It is
regenerated on every `pnpm build`/`pnpm dev` and is gitignored — nothing to commit for it.

1. Review `git log <previous-release-tag>..HEAD --oneline` (or the whole history, before the
   first release) and refresh `## Unreleased` in `RELEASE_NOTES.md`, following the format above.
2. Once ready to release: compute the tag — `release/$(date -u +%Y-%m-%dT%H-%M-%SZ)`, read once,
   right then — and **retitle `## Unreleased` to that exact tag** — `## release/<tag> — <Month>
   <day>, <year>` — and add a fresh, empty `## Unreleased` above it for next time.
3. Run `node scripts/generate-release-note.mjs` (or `pnpm build`) to check the file still
   parses — it refuses a malformed heading or an empty release with no summary/rubric.
4. Commit `RELEASE_NOTES.md` and hand the maintainer the tag commands, one command per code
   block (never joined with `&&`), so each is a single copy-paste:
   ```
   git tag release/<tag>
   ```
   ```
   git push origin release/<tag>
   ```
   Make clear the tag is the one just computed in step 2, not something to recompute at tag
   time — reading the clock again would produce a different string than the one the note
   already carries.

**Tagging and pushing a tag stay the maintainer's own action.** This skill prepares the release
note; it does not create or push a release tag on its own authority.
