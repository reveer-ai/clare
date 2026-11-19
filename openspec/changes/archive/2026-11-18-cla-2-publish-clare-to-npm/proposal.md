# Proposal

Implements Linear issue **CLA-2** (Publish clare to npm).

## Why

clare ships as an npm package of skills (see `edda/vision.md`), but nothing can be installed yet. Shipping the package and its install command now, with one placeholder skill, proves the delivery path before any real skill content depends on it.

## What Changes

- Add the npm package **`clareai`**, whose command is **`clare`**. The name `clare` on npm belongs to an unrelated package, so you run it without installing as `npx clareai init`. Once installed, the command is `clare`.
- Add **`clare init`**. It installs clare's skills into the current project's `.agents/skills/` and creates that directory if needed. `.agents/skills/` is the shared location that Codex, Copilot, Cursor, Gemini CLI and others read.
- Claude Code reads only `.claude/skills/`, so when the project has a `.claude/` directory, `clare init` also links `.claude/skills/<skill>` to the copy in `.agents/skills/`. There is one copy, and Claude Code finds it too.
- Add one placeholder skill, `clare`, whose content and metadata both say it is TBD.
- Publish the first version to npm.
- Release automatically from then on. A GitHub Actions workflow runs on every push to `main`. If `package.json` has a version that isn't on npm yet, it runs the tests, publishes that version, tags the commit `v<version>` in git, and creates a GitHub release. A push that doesn't bump the version, such as a record-only change, publishes nothing. A PR that should ship bumps the version itself.

## Capabilities

### New Capabilities

- `skill-install`: how `clare init` puts clare's skills into a project: where they go, what it touches and leaves alone, the Claude Code link, and what happens when it runs again.
- `release`: how a version of clare gets released: which pushes to `main` publish, how versions map to git tags and GitHub releases, and what happens when a version is already out.

### Modified Capabilities

None.

## Impact

- New files: `package.json`, `bin/clare.js`, `skills/clare/SKILL.md`, `README.md`, tests, and a workflow in `.github/workflows/`. The package files are separate from the repo's own `.agents/skills/`, which holds OpenSpec's tooling and isn't part of the package.
- The npm name `clareai` gets registered under the owner's npm account. npm's trusted publishing, which lets the workflow publish without a stored token, can only be set up once the package exists. So the owner publishes a bootstrap `0.0.1` by hand, then links the package to the workflow on npmjs.com, and `0.1.0` is the first release through the workflow. The owner isn't logged in to npm on this machine yet.
- The workflow can create tags and releases on `github.com/reveer-ai/clare`.
- `edda/workflow.md` gains how releases work (bump the version in the PR). `edda/vision.md` gains how clare is installed and the fact that Claude Code doesn't read `.agents/skills/`.
