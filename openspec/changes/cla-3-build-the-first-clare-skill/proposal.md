# Proposal

Implements Linear issue **CLA-3** (Build the first clare skill).

## Why

clare installs, but its only skill is a placeholder that does nothing. This change makes clare do its job for the "now" scope in `edda/vision.md`: explain one subject, now, in a form that gets it across faster than text.

## What Changes

- Add the skill **`clare-explain`**. Its name follows a `clare-` prefix, so later skills can sit beside it as `clare-*`. The user runs it with a subject, as `/clare-explain <subject>` or the assistant's equivalent.
- **The subject** is whatever the user passes. With no argument, it is the subject the conversation makes obvious, such as the change just made or the code being discussed. If nothing is obvious, the skill asks instead of guessing.
- **The output is one self-contained HTML file.** It holds everything it needs, so it opens straight from disk with nothing to install or fetch. Inside that one page the agent can use whatever gets the concept across: a diagram, an interactive control, a step-through, a few slides, flashcards. Text is the last resort.
- **The agent decides the form.** The skill states clare's principles as working guidance for the agent's judgment. It doesn't map kinds of subjects to formats.
- **Each page names what it explains**: the subject and the sources it drew on, such as files, so a reader can check it.
- **The file goes in `.clare/` at the project root**, named after the subject (for example `.clare/auth-flow.html`). Explaining the same subject again replaces that file. When it's written, the skill gives the user the path. clare doesn't change `.gitignore`, so each project decides whether to commit its views.
- **Remove the placeholder skill `clare`.** Projects that installed `0.1.0` have `.agents/skills/clare/`, and possibly a `.claude/skills/clare` link. `clare init` removes those, so an update leaves no dead skill behind.
- Release as `0.2.0`.

## Capabilities

### New Capabilities

- `explain`: how clare explains a subject: choosing the subject, what the generated page must be and contain, and where it's written.

### Modified Capabilities

- `skill-install`: the placeholder-skill requirement goes away, the scenarios that name the `clare` skill name `clare-explain` instead, and `init` removes skills clare no longer ships (folder and Claude Code link).

## Impact

- `skills/clare/` is replaced by `skills/clare-explain/SKILL.md`, plus any supporting files the design calls for. Everything stays plain Markdown and HTML, with no assistant-specific tools or formats.
- `bin/clare.js` and its tests: removing retired skills on `init`. That removal still touches only clare's own folders.
- `package.json` version goes to `0.2.0`. `README.md` loses its "not usable yet" note and gains how to use the skill.
- `edda/vision.md`: the command becomes `/clare-explain <subject>`, and it records what a view is on disk and where it goes. `edda/index.md` drops that open decision.
