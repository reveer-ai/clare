# Proposal

Implements Linear issue **CLA-3** (Build the first clare skill).

## Why

clare installs, but its only skill is a placeholder that does nothing. This change makes clare do its job for the "now" scope in `edda/vision.md`: explain one subject, now, in a form that gets it across faster than text.

## What Changes

- **The placeholder skill `clare` becomes the real one.** It keeps the name, so the user runs it as `/clare <subject>` or the assistant's equivalent. It's one skill for now. clare splits into more specific skills as more are added (owner, PR review).
- **The subject** is whatever the user passes. With no argument, the agent infers it from the conversation, but only when it's confident which one thing the user means, such as the change just made or the code being discussed. It never falls back to explaining the whole session. If it isn't confident, it asks. How confident is confident enough will need tuning with use.
- **The output is one self-contained HTML file.** It holds everything it needs, so it opens straight from disk with nothing to install or fetch.
- **The skill prompts, it doesn't instruct.** It gives the agent a few points to weigh when deciding how to present the subject, drawn from clare's principles: show rather than tell, use as few words as possible, put the main point first, name what the page explains so it can be checked. It doesn't tell the agent how to build the page or which form to use for which kind of subject. The agent decides that.
- **The agent checks the page before handing it over**: that it's true to its sources, self-contained, and works.
- **The file goes in `clare/` at the project root**, named after the subject (for example `clare/auth-flow.html`). Explaining the same subject again replaces that file. When it's written, the agent opens it for the user with the operating system's open command where it can, and gives the path. clare doesn't change `.gitignore`, so each project decides whether to commit its views.
- **What the agent says to the user follows clare's principles too**: brief, main point first.
- Release as `0.2.0`. Because the name stays `clare`, `npx clare-ai@latest init` replaces the placeholder in place, and there's nothing left over to clean up.

## Capabilities

### New Capabilities

- `explain`: how clare explains a subject: choosing the subject, what the generated page must be, checking it, where it's written and how it reaches the user.

### Modified Capabilities

- `skill-install`: the placeholder-skill requirement goes away. The skill's own requirements move to `explain`.

## Impact

- `skills/clare/SKILL.md` is rewritten as the real skill. Everything stays plain Markdown, with no assistant-specific tools or formats.
- `bin/clare.js` is unchanged. Its tests stop expecting the placeholder's description, and a new test checks the shape of every packaged skill.
- `package.json` version goes to `0.2.0`. `README.md` loses its "not usable yet" note and gains how to use the skill.
- `edda/vision.md` records what a view is on disk and where it goes, and that clare's principles cover what the agent says, not just the page. `edda/index.md` drops the open decision about where a view goes.
