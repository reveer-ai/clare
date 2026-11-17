# How work is done

Set by the project owner on 2026-11-17.

## Tracking: Linear

All work is tracked in Linear, team **clare** (key `CLA`, under the reveer workspace). Every piece of work has an issue before it starts.

## Changes: OpenSpec

Every tangible change is represented as an OpenSpec change in `openspec/` (proposal → design → specs → tasks), and specs are archived into `openspec/specs/` once it lands. The OpenSpec skills live in `.agents/skills/` (the assistant-agnostic location); `openspec/config.yaml` carries the rules below for OpenSpec's own workflows.

Stay on the latest OpenSpec release. The repo was set up with 2.1.0, installed globally with npm (`npm install -g @fission-ai/openspec@latest`). After any upgrade, run `openspec update` to regenerate `.agents/skills/` and commit the result. The generated files don't record the CLI version, so check it with `openspec version`.

## Approval gates

| Step | Who |
|---|---|
| Proposal | Owner approves |
| Design | Owner approves |
| Specs, tasks | No separate approval |
| Start of implementation | Owner initiates; never start on your own |
| Archive | Automatic once the owner approves the PR: archive the change in the same PR, before merge |

Work written before OpenSpec covered it gets a retroactive change that records what was done (CLA-1 is the first).

## Branches and PRs

- Branch name: the issue's `gitBranchName` from Linear (e.g. `cla-1-initialize-clare`).
- PR title: `<issue id>: <description>` (e.g. `CLA-1: Initialize clare`).
- PRs go to `main` on `github.com/reveer-ai/clare` and are always squash-merged.
- After the owner approves a PR, run `openspec archive <change>` on the PR branch, commit and push, then merge. Never merge with the change still under `openspec/changes/`.
- History: `main` starts with CLA-1's squashed commit. That was done once, at setup, by rewriting `main` (the original LICENSE-only commit went away). Don't force-push `main` again unless the owner asks for it. Note that a force-push that replaces a PR's base history closes the PR on GitHub, and it can't be reopened.

## Where the roadmap lives

In Linear, not here: [team clare](https://linear.app/reveer/team/CLA). Issues, their order, status and blockers are the source of truth there, so edda doesn't copy them.
