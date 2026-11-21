# What clare is

Stated by the project owner on 2026-11-17. This is the product definition; work should trace back to it.

The name is always written lowercase, **clare**, even at the start of a sentence and in skill metadata (owner, 2026-11-18). The npm package is `clare-ai`.

clare explains a subject in whatever form gets it across fastest: an interactive page, a few slides, a diagram, an image, a set of flashcards. Paragraphs are a last resort.

## Why

Most explanations arrive as walls of text, and AI has made that worse. People take in a picture, a demo or a few well-chosen slides far faster than an essay. clare picks the right form for the subject and builds it.

## How it works

You give clare a subject: an idea, a change, a system, a codebase. clare decides what the reader needs to understand and what form shows it best, then generates that form.

**The agent decides the form.** This is a core tenet. clare relies on the coding assistant's own judgment about each subject. It does not route subjects to formats by rule. The owner's examples of how that judgment might come out (a process as a step-through, a system as an interactive map, a comparison as a side-by-side view, facts to remember as flashcards, an argument as a few slides) are illustrations only. Neither the skills nor this record should turn them into a lookup table.

## What a view is

Each explanation clare generates is a **view**: one self-contained HTML file, with everything it needs inline and nothing fetched, so it opens from disk and keeps working. Views go in `clare/` at the project root (the repository root, or the working directory outside one), one file per subject. clare leaves `.gitignore` alone, so each project decides whether to commit them. (Owner, 2026-11-20, CLA-3.)

The skill that makes a view prompts the agent's judgment rather than instructing it. It gives the agent points to weigh, drawn from the principles below, and sets only the rules that keep a view portable and checkable. It never says how to build a page or which form suits which kind of subject. (CLA-3.)

## Principles

1. **Choose the form for the subject.** Don't default to one format.
2. **Show, don't tell.** If it can be seen or tried, don't describe it.
3. **Use as few words as possible.** Every sentence has to earn its place.
4. **Get the important part in first.** A reader who stops early still leaves with the main point.
5. **Stay true to the source.** Each view names what it explains, so it can be checked and kept current.

These are the owner's intent for how clare behaves. clare's skills will turn them into working guidance for the agent. Once a skill does, that skill holds the operative wording and changes are made there. This section stays as the intent the skill is checked against, and it is not copied into or kept in sync with the skill text.

## What it ships as

An **npm package containing a set of skills** that coding assistants pick up and use. It is assistant-agnostic: it must work with most coding assistants, not only Claude. Nothing in it may depend on one vendor's tools or formats. (Decided 2026-11-17; a Claude Code plugin was considered and rejected for this reason.)

The package is `clare-ai`, because the npm name `clare` belongs to an unrelated package. Its command is `clare`. A project installs clare with `npx clare-ai init`, which copies clare's skills into `.agents/skills/`, the shared location that Codex, Copilot, Cursor, Gemini CLI and others read. It touches only clare's own folders there. Running it again (`npx clare-ai@latest init`) is how a project updates.

Claude Code reads only `.claude/skills/`, never `.agents/skills/`. So when a project has a `.claude/` folder, `init` also links `.claude/skills/<skill>` to the `.agents/skills/` copy: one copy, which Claude Code finds too. That link is the package's only assistant-specific path, and nothing depends on it. (Decided 2026-11-18, CLA-2. Copying into `.claude/skills/` was rejected because two copies drift apart.)

## Scope

- **Now:** `/clare-explain <subject>` (or the assistant's equivalent): explain one thing, now. Skill names take a `clare-` prefix, so later skills sit beside it as `clare-*`.
- **Later:** explain a whole repository, part by part, and keep those views current.
