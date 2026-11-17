# Design

## Context

The repo held only a `LICENSE` in its initial commit. Clare will ship as an npm package of skills that must work with most coding assistants (see `edda/vision.md`). That same constraint shapes how the repo's own tooling is set up. See proposal.md for motivation.

## Goals / Non-Goals

**Goals:**
- Any assistant opening the repo finds the project record and the OpenSpec workflow without vendor-specific setup.
- Each fact has a single source of truth. edda, OpenSpec and Linear each own different facts and don't copy one another.

**Non-Goals:**
- Any Clare package code or skills. That work is CLA-2 onward.
- CI, linting or release automation.

## Decisions

**OpenSpec skills go in `.agents/skills/` only.** That is the universal location, matching Clare's own agnostic constraint. *Alternative:* also generate per-assistant copies (for example `.claude/`). Rejected for now: the copies duplicate content and tie the repo to particular vendors. Some assistants may not show OpenSpec slash commands as a result, and the CLI works without them.

**Each kind of fact has one owner.**

| Fact | Owner |
|---|---|
| Roadmap, issue status, blockers | Linear |
| Behavior contracts | OpenSpec specs |
| Durable context the work doesn't show (vision, workflow, decisions) | edda |

edda links to the others instead of restating them. *Alternative:* a roadmap section in edda. Rejected because it drifts out of sync with Linear.

**Approval rules live in `openspec/config.yaml` as well as edda.** OpenSpec feeds config rules straight into its artifact instructions, so agents get the gates at the moment they apply. edda explains the full workflow. This is a deliberate exception to the single-owner rule: the config is how OpenSpec's own workflows learn the rules.

**No specs for this change (`skip_specs: true`).** Specs describe behavior, and Clare has none yet. Writing requirements about repository layout would invent specs to satisfy validation and duplicate edda.

**Stay on the latest OpenSpec.** The CLI is installed globally with npm and is not pinned in the repo, since there's no `package.json` yet. When CLA-2 adds one, pinning OpenSpec as a dev dependency can be revisited.

**History: this PR becomes `main`'s first commit.** `main` is reset to one empty commit, so the PR can carry everything, `LICENSE` included. After the squash-merge, the empty root is folded in and `main` is force-pushed. *Alternative:* keep the original initial commit. Rejected because the owner wants history to start with this change.

## Risks / Trade-offs

- [Force-pushing `main`] → Done only on the owner's instruction while the repo has no other contributors. Before each push, the old tip is checked to make sure nothing is lost.
- [Global, unpinned OpenSpec drifts between machines] → edda/workflow.md says to stay on the latest and to run `openspec update` after upgrading. Revisit pinning in CLA-2.
- [Approval rules exist in two places] → Accepted. If they change, update both `openspec/config.yaml` and `edda/workflow.md`.
