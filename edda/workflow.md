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

## Branches and PRs

- Branch name: the issue's `gitBranchName` from Linear (e.g. `cla-1-initialize-clare`).
- PR title: `<issue id>: <description>` (e.g. `CLA-1: Initialize clare`).
- PRs go to `main` on `github.com/reveer-ai/clare`.

## Where the roadmap lives

In Linear, not here: [team clare](https://linear.app/reveer/team/CLA). Issues, their order, status and blockers are the source of truth there, so edda doesn't copy them.
