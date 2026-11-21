# Design

## Context

The package ships one placeholder skill, `skills/clare/SKILL.md`. `clare init` copies every folder under `skills/` into `.agents/skills/` and, when `.claude/` exists, links each one into `.claude/skills/`. It never removes anything, so a skill dropped from the package stays installed in projects that had it (CLA-2 accepted this "while there is one skill").

A skill is a Markdown file that the assistant loads into its context. Assistants choose a skill from its `name` and `description`, then follow the body. So the skill's text is the whole product here: there is no code to run when it's used.

See proposal.md for motivation and scope.

## Goals / Non-Goals

**Goals:**
- A skill short enough that every line in it matters, readable by any assistant.
- Pages that open anywhere, from disk, with no setup and no network.
- Updating a `0.1.0` project to `0.2.0` leaves only `clare-explain` installed.

**Non-Goals:**
- Opening the page for the user. Assistants have no common way to do it, so the skill gives the path and stops there.
- Keeping pages current, linking them to each other, or an index of them. That's the "later" scope.
- Scripts, templates, CSS or other helper files shipped with the skill.
- An automated check of page quality. It's judged by using it (see Verification).

## Decisions

**One file: `skills/clare-explain/SKILL.md`.** Frontmatter uses only the Agent Skills standard fields, `name` and `description`, as the placeholder did. The body is short sections the agent reads in order. *Alternative:* a skill folder with reference files or an HTML starter template. Rejected because a template would decide the page's shape for the agent, which goes against "prompts, doesn't instruct", and every extra file is more for the agent to read.

**The description is written for being picked.** It says what the skill does (explains a subject as a single visual HTML page) and when to use it: when the user invokes it, or asks for something to be explained, shown or "clared". This matters most for assistants that pick skills only from the description, with no slash command. The name stays in the description too, so "use clare" matches.

**The body has four parts:**

1. **Subject.** Use the argument if there is one. With no argument, infer the one specific thing the user means from the recent conversation, such as the change just made or the code being discussed, but only if you're confident. Never explain the whole session. If you aren't confident, ask one short question, and offer your best guess if you have one. The wording names no threshold. "Confident" is the agent's call, and this is the line to tune as the owner uses clare.
2. **Points to weigh.** The principles from `edda/vision.md` rephrased as questions to the agent, such as: what does the reader most need to understand? Could they see it or try it instead of reading it? What would they take away if they stopped after the first screen? Which words can go? These guide the agent's judgment. There's no list of forms, no subject-to-form mapping and no layout advice.
3. **The page's fixed requirements.** It's one HTML file. All CSS, JavaScript, SVG and images are inline, and it makes no network requests, so it works offline and still works years later. It names what it explains: the subject, plus the sources it drew on, such as file paths or a commit. These are the only rules the skill sets, because they're what make a page portable and checkable.
4. **Where it goes and what happens after.** Write `clare/<slug>.html` at the project root, creating `clare/` if needed. `<slug>` is a short kebab-case name for the subject. Explaining the same subject again reuses the slug and replaces the file. Then tell the user the path. Don't touch `.gitignore`.

*Alternative for 3:* allow pinned CDN libraries (charts, diagram renderers). Rejected because a page that needs the network breaks offline and when a CDN goes away, and the agent can draw what it needs with inline SVG, CSS and plain JavaScript.

**Project root is the repository root, or the working directory outside a repository.** It's where the agent would put any other project file, and a predictable place to find pages. *Alternative:* the current directory every time. Rejected because explaining from a subfolder would scatter `clare/` folders across the repo.

**The skill text is the operative wording of the principles.** As `edda/vision.md` says, once a skill turns the principles into guidance, the skill holds that wording. The vision isn't copied in. The skill is written fresh and checked against it.

**Retired skills: a hard-coded list in `bin/clare.js`.** `init` gets a `retiredSkills` list, starting as `['clare']`. For each name not in the current package, `init` removes `.agents/skills/<name>/` if it's there, and `.claude/skills/<name>` only if it's a symlink, then prints `removed <path>`. A real folder at `.claude/skills/<name>` is left alone without a warning, because it isn't clare's. This runs before installing. *Alternative:* a manifest file written by `init` that records what it installed, so it can remove anything not in the new package. Rejected for now because it adds a clare-owned file to every project and handles a problem that has come up once. Revisit when the skill set changes often.

**Version `0.2.0`.** A minor bump for new behavior, following `edda/workflow.md`. Merging releases it.

**Record and docs.**
- `edda/vision.md` scope: `/clare <subject>` becomes `/clare-explain <subject>`. A short section says what a view is on disk (one self-contained HTML file in `clare/` at the project root) and that the skill prompts the agent's judgment instead of prescribing forms.
- `edda/index.md` drops the open decision.
- `README.md` drops "Not usable yet" and adds a short Use section: run `/clare-explain <subject>` or ask for clare by name, and find pages in `clare/`.

## Verification

- **CLI tests** (`test/cli.test.js`): the installed skill is `clare-explain`. A `0.1.0` layout (`.agents/skills/clare/` and the `.claude/skills/clare` link) is cleaned up. A real `.claude/skills/clare/` folder is untouched. Other skills are still untouched.
- **Skill shape test:** every packaged `SKILL.md` has only `name` and `description` in its frontmatter, and `name` matches its folder.
- **Trying it**, by hand, before asking for PR approval: in a scratch project, run the skill in Claude Code and in at least one `.agents/skills/` assistant (such as Codex) on (a) an explicit subject, (b) no argument right after a clear change, and (c) no argument in a mixed conversation, which should ask. Check that each page opens from disk with the network off and names its subject and sources. Note the results in the PR.

## Risks / Trade-offs

- [The agent explains the whole session or guesses wrong when there's no argument] → The skill says to ask unless it's confident, and never to explain the whole session. Tuning that line is expected (proposal).
- [Points without instructions produce uneven pages] → Accepted for now, by the owner's choice. Use will show which points need sharpening.
- [Slugs drift: the same subject phrased differently gets a new file] → Accepted. Duplicates are easy to delete, and keeping pages current is the later scope.
- [No-network rule limits rich visuals] → Inline SVG, CSS and JavaScript cover diagrams, step-throughs and interactive controls. Revisit if a real subject needs more.
- [A user had their own skill named `clare` in `.agents/skills/`] → It gets removed on update. Accepted: `clare` is clare's name, and `0.1.0` installed a skill there.
- [`clare/` at the root collides with an existing folder of that name] → The skill writes only `<slug>.html` files into it and never deletes anything there.

## Migration Plan

Projects update with `npx clare-ai@latest init`, which removes the placeholder and installs `clare-explain`. Rollback is `npx clare-ai@0.1.0 init`, which brings the placeholder back (and leaves `clare-explain` installed, since `0.1.0` removes nothing).
