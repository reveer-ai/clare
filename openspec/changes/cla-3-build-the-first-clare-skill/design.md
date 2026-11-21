# Design

## Context

The package ships one placeholder skill, `skills/clare/SKILL.md`. `clare init` copies every folder under `skills/` into `.agents/skills/` and, when `.claude/` exists, links each one into `.claude/skills/`. It replaces clare's folders in full but never removes one the package no longer ships (CLA-2 accepted this "while there is one skill").

A skill is a Markdown file that the assistant loads into its context. Assistants choose a skill from its `name` and `description`, then follow the body. So the skill's text is the whole product here: there is no code to run when it's used.

See proposal.md for motivation and scope.

## Goals / Non-Goals

**Goals:**
- A skill short enough that every line in it matters, readable by any assistant.
- Pages that open anywhere, from disk, with no setup and no network.
- The page reaches the user: checked, opened where possible, path given.
- Updating a `0.1.0` project to `0.2.0` replaces the placeholder in place.

**Non-Goals:**
- Keeping pages current, linking them to each other, or an index of them. That's the "later" scope.
- Scripts, templates, CSS or other helper files shipped with the skill.
- An automated check of page quality in clare's own tests. It's judged by using it (see Verification).

## Decisions

**The skill keeps the name `clare`: one file, `skills/clare/SKILL.md`.** The user runs `/clare <subject>`. While there's one skill, the product's name is the clearest command, and clare splits into more specific skills as more are added (owner, PR review). *Alternative:* `clare-explain`, with a `clare-` prefix for later skills. It was implemented first and rejected in review. Frontmatter uses only the Agent Skills standard fields, `name` and `description`. *Alternative:* a skill folder with reference files or an HTML starter template. Rejected because a template would decide the page's shape for the agent, which goes against "prompts, doesn't instruct", and every extra file is more for the agent to read.

**The description is written for being picked.** It says what the skill does: it gets a subject across as effectively and efficiently as possible, as a single visual HTML page. It says when to use it: when the user invokes clare or asks for it by name, or asks for something to be explained, shown, "clared" or otherwise got across. This matters most for assistants that pick skills only from the description, with no slash command.

**The body has six parts, in the order the agent works:**

1. **Subject.** Use the argument if there is one. With no argument, infer the one specific thing the user means from the recent conversation, such as the change just made or the code being discussed, but only if you're confident. Never explain the whole session. If you aren't confident, ask one short question, and offer your best guess if you have one. The wording names no threshold. "Confident" is the agent's call, and this is the line to tune as the owner uses clare.
2. **Points to weigh.** The principles from `edda/vision.md` rephrased as questions to the agent, such as: what does the reader most need to understand? Could they see it or try it instead of reading it? Would someone who only glances at the top get the main point? Which words can go? These guide the agent's judgment. There's no list of forms, no subject-to-form mapping and no layout advice.
3. **The page's fixed requirements.** It's one HTML file. All CSS, JavaScript, SVG and images are inline, and it makes no network requests, so it works offline and still works years later. It names what it explains: the subject, plus the sources it drew on, such as file paths or a commit. These are the only rules the skill sets about the page, because they're what make a page portable and checkable.
4. **Write it.** Write `clare/<slug>.html` at the project root, creating `clare/` if needed. `<slug>` is a short kebab-case name for the subject. Explaining the same subject again reuses the slug and replaces the file. Don't touch `.gitignore`.
5. **Check it.** Before handing the page over, the agent checks it: everything on it is true to the sources, nothing reaches the network, and the page renders and its interactive parts work. The skill names what to check, not how, because the means differ by assistant (a browser, a headless run, or careful reading). If the agent couldn't check something, it says so.
6. **Hand it over.** Open the page with the operating system's open command (`open` on macOS, `xdg-open` on Linux, `start` on Windows) if the agent can run commands, and give the path either way.

One line applies throughout: what the agent says to the user (the question about the subject, the report at the end) follows the same principles. That means few words and the main point first. The page is the explanation, so the message doesn't repeat it.

*Alternative for 3:* allow pinned CDN libraries (charts, diagram renderers). Rejected because a page that needs the network breaks offline and when a CDN goes away, and the agent can draw what it needs with inline SVG, CSS and plain JavaScript.

**Opening the page uses the OS's own command, not an assistant feature.** `open`, `xdg-open` and `start` are plain shell commands, so this stays assistant-agnostic. An agent that can't run commands, or is sandboxed so the command fails, still gives the path. *Alternative:* leave opening to the user. That was the first draft's non-goal, and the owner reversed it in review.

**Project root is the repository root, or the working directory outside a repository.** It's where the agent would put any other project file, and a predictable place to find pages. *Alternative:* the current directory every time. Rejected because explaining from a subfolder would scatter `clare/` folders across the repo.

**The skill text is the operative wording of the principles.** As `edda/vision.md` says, once a skill turns the principles into guidance, the skill holds that wording. The vision isn't copied in. The skill is written fresh and checked against it.

**No retired-skill cleanup in this change.** Keeping the name `clare` means `init` replaces the placeholder folder and its link in place, and no skill is dropped. The `clare-explain` draft needed a hard-coded `retiredSkills` list in `init` to remove the placeholder. That list was dropped with the rename rather than shipped empty. A later change that drops or renames a skill adds the cleanup it needs: that list, or a manifest of installed skills if the set changes often.

**Version `0.2.0`.** A minor bump for new behavior, following `edda/workflow.md`. Merging releases it.

**Record and docs.**
- `edda/vision.md`: a short section says what a view is on disk (one self-contained HTML file in `clare/` at the project root), and that the skill prompts the agent's judgment instead of prescribing forms. The principles section says they cover what the agent says to the user too. The scope's `/clare <subject>` stays.
- `edda/index.md` drops the open decision.
- `README.md` drops "Not usable yet" and adds a short Use section: run `/clare <subject>` or ask for clare by name, and find pages in `clare/`.

## Verification

- **CLI tests** (`test/cli.test.js`): they no longer expect the placeholder's description. Everything else about `init` is unchanged and still covered.
- **Skill shape test:** every packaged `SKILL.md` has only `name` and `description` in its frontmatter, and `name` matches its folder.
- **Trying it**, by hand, before asking for PR approval: in a scratch project, run the skill in Claude Code and in at least one `.agents/skills/` assistant (such as Codex) on (a) an explicit subject, (b) no argument right after a clear change, and (c) no argument in a mixed conversation, which should ask. Check that each page opens from disk with the network off and names its subject and sources, that the agent checked it and tried to open it, and that its messages are brief. Note the results in the PR.

## Risks / Trade-offs

- [The agent explains the whole session or guesses wrong when there's no argument] → The skill says to ask unless it's confident, and never to explain the whole session. Tuning that line is expected (proposal).
- [Points without instructions produce uneven pages] → Accepted for now, by the owner's choice. Use will show which points need sharpening.
- [Checking costs time] → The skill asks for a check, not a procedure. The agent scales it to the page.
- [Opening fails, or pops a window the user didn't expect] → The path is always given. Opening is what the user ran clare for, so a window is expected.
- [Slugs drift: the same subject phrased differently gets a new file] → Accepted. Duplicates are easy to delete, and keeping pages current is the later scope.
- [No-network rule limits rich visuals] → Inline SVG, CSS and JavaScript cover diagrams, step-throughs and interactive controls. Revisit if a real subject needs more.
- [`clare/` at the root collides with an existing folder of that name] → The skill writes only `<slug>.html` files into it and never deletes anything there.

## Migration Plan

Projects update with `npx clare-ai@latest init`, which replaces the placeholder in `.agents/skills/clare/` (the `.claude/skills/clare` link already points there). Rollback is `npx clare-ai@0.1.0 init`, which puts the placeholder back.
