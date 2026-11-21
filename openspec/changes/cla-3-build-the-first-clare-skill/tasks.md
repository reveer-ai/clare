# Tasks

The first pass built the skill as `clare-explain`, with retired-skill cleanup in `init`. The owner's PR review renamed it `clare` and added checking, opening and brevity, so the tasks below describe the change as revised.

## 1. The skill

- [ ] 1.1 Rewrite `skills/clare/SKILL.md` as the real skill: frontmatter with only `name: clare` and a description written to be picked (design.md), and a short body in the five parts from design.md (subject, points to weigh, the page's fixed requirements, check it, hand it over), plus the line that what the agent says to the user follows the same principles. Verify by reading it against `specs/explain`: it asks when the subject isn't clear, never covers the whole session, checks the page, opens it where it can, keeps messages brief, and has no rule assigning a form, layout or template to a kind of subject. Then check it against the principles in `edda/vision.md`.
- [ ] 1.2 Verify `skills/` holds only `clare/`
- [x] 1.3 Add a test that every packaged `SKILL.md` has only `name` and `description` in its frontmatter and that `name` matches its folder, and verify it passes with `npm test`

## 2. `init`

- [ ] 2.1 Keep `bin/clare.js` as it is on `main`, and drop the placeholder-description assertion from the CLI tests. Verify `npm test` passes
- [ ] 2.2 Verify `npm pack --dry-run` lists `skills/clare/SKILL.md` and no other skill

## 3. Release and docs

- [x] 3.1 Set `version` to `0.2.0` in `package.json` and verify `node bin/clare.js --version` prints `0.2.0`
- [ ] 3.2 Update `README.md`: drop "Not usable yet" and add a short Use section (run `/clare <subject>` or ask for clare by name, pages land in `clare/`). Verify it matches the skill's behavior, and that updating a `0.1.0` install with `npx ./clare-ai-0.2.0.tgz init` in a scratch directory replaces the placeholder in place

## 4. Project record

- [ ] 4.1 Update `edda/vision.md`: add what a view is on disk (one self-contained HTML file in `clare/` at the project root), that the skill prompts the agent's judgment instead of prescribing forms, and that the principles cover what the agent says to the user too. The scope keeps `/clare <subject>`. Verify nothing in it restates the skill's wording
- [x] 4.2 Remove the open decision from `edda/index.md` and verify the index still describes `vision.md` accurately

## 5. Try it

- [ ] 5.1 In a scratch git project with `0.2.0` installed from the packed tarball, run the skill in Claude Code and in at least one `.agents/skills/` assistant (such as Codex) on: (a) an explicit subject, (b) no argument right after one clear change, (c) no argument in a mixed conversation. Verify (a) and (b) each write `clare/<slug>.html` at the repo root, check the page, try to open it and report the path briefly, and (c) asks one short question before writing anything
- [ ] 5.2 Open each page from disk with the network off and verify it displays and works fully, and names its subject and sources. Note the results from 5.1 and 5.2 in the PR, including anything that suggests tuning the skill

## Workflow follow-up

- After the owner approves the PR: `openspec archive cla-3-build-the-first-clare-skill` on the branch, commit, push, then squash-merge. Merging releases `0.2.0`.
