# Proposal

Implements Linear issue **CLA-1** (Initialize clare). Written after the fact: the work was done before OpenSpec existed in the repo, so this change records it.

## Why

Clare's product work needs a foundation first. That means a durable project record any agent can pick up from, a spec-driven way to propose and land changes, and a clean repository history that starts with this setup.

## What Changes

- Add the edda project record (`AGENTS.md`, `edda/`). It records Clare's vision and the project workflow: Linear tracking, OpenSpec changes, approval gates, branch and PR naming.
- Initialize OpenSpec (latest release, 2.1.0) with the `spec-driven` schema. Its skills go in the assistant-agnostic `.agents/skills/`, and `openspec/config.yaml` carries the owner's approval rules.
- Make this change the first commit on `main`. `LICENSE` moves into this PR, `main` is reset to a single empty commit, and that commit is folded into the squash-merge afterwards.

## Capabilities

### New Capabilities

None. This is repository tooling and documentation. Clare has no product behavior yet, so the change sets `skip_specs: true`.

### Modified Capabilities

None.

## Impact

- New files: `AGENTS.md`, `edda/`, `openspec/`, `.agents/skills/`, `LICENSE` (moved from the initial commit).
- `main` history is rewritten twice: before review (to one empty commit) and after merge (to the single squashed commit). Anyone with an existing clone of `main` has to reset it.
- Contributors need the OpenSpec CLI installed globally to work on changes.
