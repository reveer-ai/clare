# What Clare is

Stated by the project owner on 2026-11-17. This is the product definition; work should trace back to it.

Clare explains a subject in whatever form gets it across fastest: an interactive page, a few slides, a diagram, an image, a set of flashcards. Paragraphs are a last resort.

## Why

Most explanations arrive as walls of text, and AI has made that worse. People take in a picture, a demo or a few well-chosen slides far faster than an essay. Clare picks the right form for the subject and builds it.

## How it works

You give Clare a subject: an idea, a change, a system, a codebase. Clare decides what the reader needs to understand and what form shows it best, then generates that form.

**The agent decides the form.** This is a core tenet. Clare relies on the coding assistant's own judgment about each subject. It does not route subjects to formats by rule. The owner's examples of how that judgment might come out (a process as a step-through, a system as an interactive map, a comparison as a side-by-side view, facts to remember as flashcards, an argument as a few slides) are illustrations only. Neither the skills nor this record should turn them into a lookup table.

## Principles

1. **Choose the form for the subject.** Don't default to one format.
2. **Show, don't tell.** If it can be seen or tried, don't describe it.
3. **Use as few words as possible.** Every sentence has to earn its place.
4. **Get the important part in first.** A reader who stops early still leaves with the main point.
5. **Stay true to the source.** Each view names what it explains, so it can be checked and kept current.

These are the owner's intent for how Clare behaves. Clare's skills will turn them into working guidance for the agent. Once a skill does, that skill holds the operative wording and changes are made there. This section stays as the intent the skill is checked against, and it is not copied into or kept in sync with the skill text.

## What it ships as

An **npm package containing a set of skills** that coding assistants pick up and use. It is assistant-agnostic: it must work with most coding assistants, not only Claude. Nothing in it may depend on one vendor's tools or formats. (Decided 2026-11-17; a Claude Code plugin was considered and rejected for this reason.)

## Scope

- **Now:** `/clare <subject>` (or the assistant's equivalent): explain one thing, now.
- **Later:** explain a whole repository, part by part, and keep those views current.
