# Contributing

## Commit messages

This section adapts the [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/)
specification. The key words MUST, MUST NOT, SHOULD, and MAY are to be
interpreted as described in [BCP 14](https://www.rfc-editor.org/info/bcp14), and
only when they appear in capitals.

### Why

Pull requests here land by rebase, not squash (see `.github/workflows/build.yml`'s
comment on tag-only deploys): every commit on a branch becomes a permanent,
individually readable entry in `main`'s history, read in isolation long after
the PR itself is forgotten.

```
a3f1c2e fix bug
8b41d90 update stuff
1d0e4aa wip
```

This history teaches nothing. Every question forces a diff open.

```
a3f1c2e fix: give header nav links the site's violet hover glow
8b41d90 feat: add a /version page with a build stamp and release notes
1d0e4aa refactor: move the secondary-page banner into Header itself
```

This one answers what a reader would ask without opening a single diff: what
changed, and whether it's worth mentioning in `RELEASE_NOTES-en.md` when the
next release is cut.

### The rule

The rule bears on **each commit**, not on a merge message. A commit travels
alone: it is read in a `git log --oneline`, bisected, or picked apart six
months later. Its message MUST stand on its own.

#### Form

```
<type>[(<scope>)][!]: <description>

[body]

[footers]
```

* The commit MUST begin with a type, optionally followed by a scope and a `!`,
  then a colon and a space.
* Everything written in the message MUST be in English — header, body, and
  footers.
* A commit MUST carry a single type, that of its intention. Two independent
  intentions MUST be two commits: the message forces the split that ought to
  happen.

#### Types

Ordered here with the two most common types first, then the rest
alphabetically. The list is closed.

| Type | When to use |
|---|---|
| `feat` | A new capability, visible to a visitor of the site |
| `fix` | The correction of a defective behaviour |
| `build` | Build tooling, dependencies, deployment configuration |
| `chore` | What touches neither the site's content nor its delivery |
| `ci` | Pipeline configuration |
| `docs` | Documentation only (including `RELEASE_NOTES-*.md`) |
| `perf` | A performance gain, at constant observable behaviour |
| `refactor` | Restructuring, at constant observable behaviour |
| `revert` | The reversal of an earlier commit |
| `style` | Formatting with no semantic effect |
| `test` | Tests only |

The type MUST be lowercase and belong to this table.

#### Scope

The scope MAY be provided; it is never required. This repository has no
per-package release-train tooling that routes commits by scope (unlike
`Reefact/just-dummies`), so there's no closed list to belong to — when given,
it MUST be a single lowercase word (letters, digits, hyphens), naming the area
touched: `fix(header): …`, `docs(release-notes): …`. What genuinely belongs to
no particular area stays unscoped.

#### Description

* It MUST be in the imperative present: `add`, not `added` nor `adds`. The
  description completes one sentence — *If applied, this commit will …* — and
  only the imperative fits it: *…will add the `/version` page*.
* It MUST begin with a lowercase letter and MUST NOT end with a period. The
  header line is not a sentence; it is a title.
* The full header line — type, optional scope, optional `!`, colon and
  description — MUST fit in 72 characters. Beyond that, once the abbreviated
  hash is prefixed, it overflows the 80 columns of a terminal in a
  `git log --oneline`.

#### Body

The body MAY be provided, after a blank line. It explains **why** the change
happens — the bug, the constraint, the trade-off. The *what* is already in the
diff; repeating it is noise.

When that why is not readable from the diff, the body SHOULD be provided.

#### Footers

Footers MAY be provided, after a blank line. Each footer MUST take the form
`Token: value`. The token MUST be words separated by hyphens, **each word
capitalized**: `Co-Authored-By`, `Refs`, `Reverts`. `BREAKING CHANGE` is the
sole exception to this form.

When an issue exists, its number MUST live in a `Refs:` footer (`Refs: #142`),
never in the description.

#### Breaking changes

A breaking change MUST be signalled twice: by a `!` placed just before the
colon, and by a `BREAKING CHANGE:` footer in capitals, describing the
migration.

### Enforcement

`tools/commit-lint/lint-commit-message.sh` is the single source of truth for
these rules, shared by two checks that can never disagree with each other:

* A local `commit-msg` hook (`.githooks/commit-msg`), enabled once per clone
  with:

  ```
  git config core.hooksPath .githooks
  ```

* The `commit-lint` CI check (`.github/workflows/commit-lint.yml`), which lints
  every non-merge commit of a pull request — catching a message that bypassed
  a local hook that was never enabled, or was skipped with `--no-verify`.

A pull request with a non-conforming commit fails CI. Fix it with an
interactive rebase (`git rebase -i`) and force-push the branch — never a merge
commit that papers over the offending one, since it would still be part of
`main`'s permanent history once the PR lands.
