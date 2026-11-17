# Tasks

## 1. Project record

- [x] 1.1 Add `AGENTS.md` and `edda/` (index, vision, workflow) and verify `edda/index.md` links every record file
- [x] 1.2 Record the agent-decides-form tenet, the principles-as-intent rule, and the Linear pointer in place of a roadmap, and verify no Linear issue data is copied into edda

## 2. OpenSpec

- [x] 2.1 Run `openspec init --tools agents` and verify `openspec/` and `.agents/skills/` exist
- [x] 2.2 Upgrade OpenSpec to the latest release (2.1.0), run `openspec update`, and verify `openspec version` reports 2.1.0
- [x] 2.3 Add the approval gates and agnostic constraint to `openspec/config.yaml` and verify `openspec instructions proposal --change cla-1-initialize-clare --json` returns them as rules
- [x] 2.4 Write this retroactive change and verify `openspec validate cla-1-initialize-clare` passes

## 3. History

- [x] 3.1 Reset `main` to a single empty commit, rebase this branch onto it with `LICENSE` added, and verify `git diff` between the old `main` and this branch's `LICENSE` is empty

## Workflow follow-up

- After the owner approves the PR, archive this change in the same PR (`openspec archive cla-1-initialize-clare`), then squash-merge.
- After the merge, fold the empty root commit into the squashed commit, force-push `main`, and verify `git log main` shows one commit.
