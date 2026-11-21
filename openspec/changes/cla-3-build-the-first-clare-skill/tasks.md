# Tasks

## 1. The skill

- [ ] 1.1 Write `skills/clare-explain/SKILL.md`: frontmatter with only `name` and a description written to be picked (design.md), and a short body in the four parts from design.md (subject, points to weigh, the page's fixed requirements, where it goes). Verify by reading it against `specs/explain`: it asks when the subject isn't clear, never covers the whole session, and has no rule assigning a form, layout or template to a kind of subject. Then check it against the principles in `edda/vision.md`.
- [ ] 1.2 Delete `skills/clare/` and verify `skills/` holds only `clare-explain/`
- [ ] 1.3 Add a test that every packaged `SKILL.md` has only `name` and `description` in its frontmatter and that `name` matches its folder, and verify it passes with `npm test`

## 2. `init` removes retired skills

- [ ] 2.1 Point the existing CLI tests at `clare-explain` instead of `clare`, and verify `npm test` passes
- [ ] 2.2 Add `retiredSkills = ['clare']` to `bin/clare.js`. Before installing, remove `.agents/skills/<name>/` and a `.claude/skills/<name>` symlink, print `removed <path>` for each, and leave a real folder alone. Verify with `node --test` cases for the three "Remove retired skills" scenarios in `specs/skill-install`, plus "other skills untouched" still passing
- [ ] 2.3 Verify `npm pack --dry-run` lists `skills/clare-explain/SKILL.md` and no `skills/clare/`

## 3. Release and docs

- [ ] 3.1 Set `version` to `0.2.0` in `package.json` and verify `node bin/clare.js --version` prints `0.2.0`
- [ ] 3.2 Update `README.md`: drop "Not usable yet" and add a short Use section (run `/clare-explain <subject>` or ask for clare by name, pages land in `clare/`). Verify it matches the skill's behavior and the install steps still work through `npm pack` and `npx ./clare-ai-0.2.0.tgz init` in a scratch directory

## 4. Project record

- [ ] 4.1 Update `edda/vision.md`: the scope's command becomes `/clare-explain <subject>`, and add what a view is on disk (one self-contained HTML file in `clare/` at the project root) and that the skill prompts the agent's judgment instead of prescribing forms. Verify nothing in it restates the skill's wording
- [ ] 4.2 Remove the open decision from `edda/index.md` and verify the index still describes `vision.md` accurately

## 5. Try it

- [ ] 5.1 In a scratch git project with `0.2.0` installed from the packed tarball, run the skill in Claude Code and in at least one `.agents/skills/` assistant (such as Codex) on: (a) an explicit subject, (b) no argument right after one clear change, (c) no argument in a mixed conversation. Verify (a) and (b) each write `clare/<slug>.html` at the repo root and report the path, and (c) asks before writing anything
- [ ] 5.2 Open each page from disk with the network off and verify it displays and works fully, and names its subject and sources. Note the results from 5.1 and 5.2 in the PR, including anything that suggests tuning the skill

## Workflow follow-up

- After the owner approves the PR: `openspec archive cla-3-build-the-first-clare-skill` on the branch, commit, push, then squash-merge. Merging releases `0.2.0`.
