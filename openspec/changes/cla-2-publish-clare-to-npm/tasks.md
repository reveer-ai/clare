# Tasks

## 1. Package

- [x] 1.1 Add `package.json` (`name: clareai`, `version: 0.1.0`, `type: module`, `bin.clare`, `files`, `engines.node >= 22`, MIT, `repository.url` for `reveer-ai/clare`, `test` script) and verify `npm pkg get name version bin repository` shows those values
- [x] 1.2 Add `skills/clare/SKILL.md` with exactly the frontmatter and body in design.md and verify its frontmatter has only `name` and `description`

## 2. CLI and `init`

- [x] 2.1 Add `bin/clare.js` with `--help`, `--version`, usage on no or unknown command, and verify with `node --test` cases for each exit code and output
- [x] 2.2 Implement `init` (install into `.agents/skills/`, leave other entries alone, replace clare's folders on rerun) and verify `node --test` covers the fresh project, other skills untouched, and stale or edited skill scenarios from `specs/skill-install`
- [x] 2.3 Implement the Claude Code link (relative symlink, junction on Windows, replace an existing link, warn and skip a real folder, warn on failure) and verify `node --test` covers each link scenario from `specs/skill-install`
- [x] 2.4 Write `README.md` (what clare is, `npx clareai init`, the Claude Code link, the warning about the unrelated `clare` package) and verify the documented command works in a scratch directory through `npm pack` and `npx ./clareai-0.1.0.tgz init`
- [x] 2.5 Verify `npm pack --dry-run` lists only `package.json`, `LICENSE`, `README.md`, `bin/` and `skills/`

## 3. Release workflow

- [x] 3.1 Add `.github/workflows/release.yml` with the `test` job (PRs and pushes to `main`: Node 24, `npm test`, `npm pack --dry-run`) and verify it passes on this PR
- [x] 3.2 Add the `release` job (push to `main` only, `id-token: write`, `contents: write`, `concurrency: release`, npm updated to latest; publish if missing and not lower than `latest`, then tag and release if missing) and verify its decision logic by running it locally with stubbed npm results for the bumped, unchanged, lower-version and tag-missing cases from `specs/release`
- [x] 3.3 Verify with `gh secret list` that the repo has no npm token secret

## 4. Project record

- [x] 4.1 Update `edda/vision.md` "What it ships as" (package `clareai`, command `clare`, `npx clareai init`, `.agents/skills/` plus the Claude Code link, and the fact that Claude Code reads only `.claude/skills/`) and verify `edda/index.md` still describes it accurately
- [x] 4.2 Add releasing to `edda/workflow.md` (bump `version` in the PR that should ship, what the workflow does, trusted publishing with direct publish) and verify no Linear or spec content is copied into it

## Workflow follow-up

- After the owner approves the PR: `openspec archive cla-2-publish-clare-to-npm` on the branch, commit and push.
- Owner, before merge: `npm login`, publish the bootstrap `0.0.1` by hand from the branch (set `version` to `0.0.1` locally, don't commit it), then set up trusted publishing with direct publish allowed (`npm trust github clareai --file release.yml --repo reveer-ai/clare --allow-publish`, or the npmjs.com form).
- Squash-merge within 2 days of setting up trusted publishing. Then verify `clareai@0.1.0` is `latest` with provenance, tag `v0.1.0` and its GitHub release exist, and `npx clareai@0.1.0 init` works in a scratch project.
- Owner deprecates `0.0.1` (`npm deprecate clareai@0.0.1 "bootstrap release, use 0.1.0+"`). Mark CLA-2 Done in Linear.
