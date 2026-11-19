# Design

## Context

The repo has no package and no CI yet. Its `.agents/skills/` holds OpenSpec's tooling for working on clare, not clare's product. `github.com/reveer-ai/clare` is public, and `main` has no branch protection. Assistants find skills in different places:

| Assistant | Reads project skills from |
|---|---|
| Codex, Copilot, Cursor, Gemini CLI, Cline and others | `.agents/skills/` (the shared convention) |
| Claude Code | `.claude/skills/` only. Its skills docs never mention `.agents`, and this repo's `.agents/skills/` skills don't load in Claude Code. It does follow a skill folder that is a symlink. |

npm's trusted publishing lets a GitHub Actions workflow publish with a short-lived identity token instead of a stored npm token. These are the constraints from npm's docs (checked 2026-11-18):

- It needs npm 11.5.1 or later, Node 22.14 or later, a GitHub-hosted runner, `id-token: write`, and a `repository.url` in `package.json` that matches the repo exactly.
- The package has to exist on npm before a trusted publisher can be set up for it.
- A new trusted publisher setup expires unless the workflow publishes successfully through it within 2 days.
- Setups created after Sep 3, 2026 allow only `npm stage publish` by default, and a staged version goes live only after a maintainer approves it with 2FA. Plain `npm publish` has to be allowed explicitly.
- Provenance attestations are generated automatically when the repo and package are public.

See proposal.md for motivation.

## Goals / Non-Goals

**Goals:**
- One command puts clare's skills where the project's assistants will find them.
- The package depends on no assistant. The Claude Code link adds reach and nothing relies on it.
- Running `init` again is the way to update.
- Merging a version bump to `main` releases it with no manual step, and every release has a matching git tag and GitHub release.
- No long-lived npm token exists anywhere.

**Non-Goals:**
- Any working skill content. The skill stays TBD until the `/clare` work.
- Removing skills that a later version drops, uninstalling, or user-level installs (`~/.agents/skills/`).
- Pre-release or dist-tag channels (`next`, `beta`), changelogs beyond GitHub's generated release notes, and branch protection.

## Decisions

**Package `clare-ai`, command `clare`.** In `package.json`, `bin` maps `clare` to `bin/clare.js`. Because the package has one bin, `npx clare-ai init` runs it without a global install. *Alternative:* a scoped name such as `@reveer/clare`. Rejected because the owner chose `clare-ai`.

**Plain JavaScript, Node built-ins only.** ESM, no dependencies, no build step, and `engines.node >= 22` for users (the oldest Node LTS still supported). Tests use `node --test`. A small CLI doesn't need a framework, and having no dependencies keeps installs fast and the supply chain empty.

**What's in the package.** `files` lists `bin/`, `skills/` and `README.md`. npm adds `package.json` and `LICENSE` itself. clare's skills live at `skills/<name>/` in the repo, separate from the repo's own `.agents/skills/`. *Alternative:* author the skills in `.agents/skills/` so the repo uses them on itself. Rejected because it would mix the product with the repo's dev tooling, and clare doesn't apply to its own repo yet.

**CLI surface.** The commands are `clare init`, `clare --help` and `clare --version`. Running with no command or an unknown one prints usage and exits 1. `init` acts on the current working directory. *Alternative:* look for the git root. Rejected because it guesses, while the current directory is predictable and matches how other `init` commands work.

**`init` owns only its own skill folders.** For each skill in the package, it replaces `.agents/skills/<name>/` with the packaged copy and creates `.agents/skills/` if needed. Anything else in that directory (for example OpenSpec's skills or `.openspec-target`) is never read or changed. Replacing the folder outright means a rerun leaves exactly the packaged version, so updating is `npx clare-ai@latest init`. It then prints each path it wrote.

**Claude Code link.** Only when `<project>/.claude/` already exists, `init` creates `.claude/skills/` if needed and makes `.claude/skills/<name>` a relative symlink to `../../.agents/skills/<name>`. A relative link keeps working when the project is moved, cloned or committed. On Windows it makes a directory junction, which doesn't need admin rights. If something that isn't a symlink is already at that path, `init` leaves it alone and warns, because it isn't clare's. An existing symlink gets replaced. *Alternatives:* create `.claude/` in every project, rejected because it adds a vendor folder to projects that don't use Claude Code. Copying instead of linking, rejected by the owner because two copies drift apart. This is the package's only assistant-specific path. It is a link, not a second copy, so CLA-1's choice against per-assistant copies still holds.

**Placeholder skill.** `skills/clare/SKILL.md` uses only the standard Agent Skills fields, with no vendor extensions:

```markdown
---
name: clare
description: TBD. Placeholder for clare, which isn't implemented yet. It does nothing.
---

TBD.
```

The description says plainly that it does nothing, so no assistant picks it for real work.

**Metadata.** License MIT, `repository.url` set to `git+https://github.com/reveer-ai/clare.git` (trusted publishing needs it), and a short description. A minimal `README.md` covers what clare is and how to run `npx clare-ai init`, because npm shows it on the package page.

**Versioning: `package.json` is the source of truth, and git tags follow it.** A PR that should ship bumps `version` itself, following semver while clare is on `0.x`: a minor bump for new behavior and a patch bump for fixes. Each released version gets a `v<version>` tag on the `main` commit that released it, plus a GitHub release with generated notes. CI never commits to `main`. *Alternatives:* CI bumps a patch version on every push and commits it back, rejected by the owner. Changesets, rejected because it adds a dependency and an extra PR for each release.

**One workflow, `.github/workflows/release.yml`.** It runs on `pull_request` and on `push` to `main`:

- **`test` job (both triggers):** Node 24 on `ubuntu-latest`, then `npm test` and `npm pack --dry-run`. Running it on PRs means problems show up before merge, at no extra cost.
- **`release` job (push to `main` only, needs `test`):** permissions `id-token: write` and `contents: write`, with `concurrency: release` so two releases never overlap. It updates npm to the latest release, since trusted publishing needs npm 11.5.1 or later, and then:
  1. Read `version` from `package.json`.
  2. If that version isn't on npm: refuse if it's lower than the current `latest` (`npm publish` would otherwise move `latest` backwards), then run `npm publish`. Provenance is added automatically.
  3. If tag `v<version>` doesn't exist: create it on the pushed commit, push it, and create the GitHub release.

Each step checks before it acts, so rerunning a failed run finishes whatever is missing, and a push without a version bump does nothing. *Alternative:* trigger on pushed tags instead of on `main`. Rejected because the owner wants a push to `main` to be what releases.

**Trusted publishing with direct publish, not staged.** The trusted publisher setup allows `npm publish` from `release.yml` in `reveer-ai/clare`. Staged publishing, npm's default for new setups and its recommendation, would make every release wait for the owner's 2FA approval, which breaks "push to `main` releases". Security still rests on short-lived tokens, provenance, and a release path that only runs from `main`. *Alternative:* an npm automation token in a GitHub secret. Rejected because it's a long-lived credential, and npm now limits write tokens.

**First release order.** This sequence fits npm's rule that the package must exist first and the 2-day window, and it puts the first real release through the workflow:

1. After the PR is approved and archived, but before merge, the owner publishes **`0.0.1`** by hand from the PR branch (`npm login`, then `npm publish` with `version` set to `0.0.1` locally, not committed). That creates the `clare-ai` name.
2. The owner sets up the trusted publisher with direct publish allowed, on npmjs.com or with `npx npm@latest trust github clare-ai --file release.yml --repo reveer-ai/clare --allow-publish` (`--allow-publish` needs npm 12 or later). Optionally, they also turn on "require 2FA and disallow tokens" for the package.
3. Squash-merge. The workflow publishes **`0.1.0`** through trusted publishing within the 2-day window, tags `v0.1.0` and creates its release. That proves the whole path in CLA-2.
4. The owner deprecates `0.0.1` (`npm deprecate clare-ai@0.0.1 "bootstrap release, use 0.1.0+"`).

*What happened (2026-11-19):* the package was first bootstrapped as `clareai`, an earlier name. The owner corrected it to `clare-ai` before merge, unpublished `clareai` entirely, and bootstrapped `clare-ai@0.0.1` instead. Two things showed up along the way. npm 11's `npm trust` has no `--allow-publish` flag, so the setup ran through npm 12. And while npm processes a new package, it lists a `0.0.0-stage` placeholder as `latest`, so `scripts/release.js` treats a pre-release `latest` as lower than any release of the same version or above.

*Alternative:* publish `0.1.0` by hand and let CI take over from the next bump. Rejected because the trusted publisher setup would probably expire before that next release, and the workflow's publish path would go untested.

**OpenSpec stays global, not pinned.** CLA-1 left pinning to be revisited here. Pinning it as a dev dependency would give a second source for the version, while `edda/workflow.md` already says to stay on the latest. Keep it global. CI doesn't run OpenSpec.

## Risks / Trade-offs

- [Someone runs `npx clare init` and gets the unrelated `clare` package] → The README and the package description use `npx clare-ai init`.
- [A rerun overwrites local edits to clare's skill folders] → Accepted, since those folders are clare's generated content. `init` lists what it replaced.
- [A later version drops a skill and the old folder stays behind] → Accepted while there is one skill. Revisit when skills are added or removed, possibly with a manifest.
- [The link isn't created: `.claude/` gets added after `init`, a Windows junction fails, or git stores a junction as a plain folder] → `init` warns and still installs to `.agents/skills/`. Running `init` again after adding `.claude/` creates the link.
- [Anyone who can push to `main` can release] → Accepted for a single-maintainer repo. Branch protection is a later choice.
- [A PR forgets to bump the version, so nothing ships] → The workflow's log says it skipped. The bump rule is recorded in `edda/workflow.md`.
- [The trusted publisher setup expires or doesn't match, so publish fails with `ENEEDAUTH`] → Nothing publishes and the run fails visibly. Delete and recreate the setup, then rerun the job.
- [Publishing can't be undone: npm allows unpublishing only briefly, and the version number is spent either way] → `npm pack --dry-run` runs on every PR. To roll back, deprecate the version (`npm deprecate`) and release a fix.
- [`0.0.1` stays on npm forever] → It gets deprecated with a pointer to `0.1.0`.

## Migration Plan

There's nothing to migrate. The release order is in **First release order** above. CLA-2 is Done once `npx clare-ai@0.1.0 init` works in a scratch project and `v0.1.0` exists as a tag and a GitHub release.
