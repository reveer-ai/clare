# What Clare is

Stated by the project owner on 2026-11-17. This is the product definition; work should trace back to it.

Clare explains a subject in whatever form gets it across fastest: an interactive page, a few slides, a diagram, an image, a set of flashcards. Paragraphs are a last resort.

## Why

Most explanations arrive as walls of text, and AI has made that worse. People take in a picture, a demo or a few well-chosen slides far faster than an essay. Clare picks the right form for the subject and builds it.

## How it works

You give Clare a subject: an idea, a change, a system, a codebase. Clare decides what the reader needs to understand and what form shows it best, then generates that form.

| Subject shape | Form |
|---|---|
| A process | Diagram or step-through |
| A system | Interactive map |
| A comparison | Table or side-by-side view |
| Facts to remember | Flashcards or quiz |
| An argument | A few slides |

## Principles

1. **Choose the form for the subject.** Don't default to one format.
2. **Show, don't tell.** If it can be seen or tried, don't describe it.
3. **Use as few words as possible.** Every sentence has to earn its place.
4. **Get the important part in first.** A reader who stops early still leaves with the main point.
5. **Stay true to the source.** Each view names what it explains, so it can be checked and kept current.

## What it ships as

An **npm package containing a set of skills** that coding assistants pick up and use. It is assistant-agnostic: it must work with most coding assistants, not only Claude. Nothing in it may depend on one vendor's tools or formats. (Decided 2026-11-17; a Claude Code plugin was considered and rejected for this reason.)

## Scope

- **Now:** `/clare <subject>` (or the assistant's equivalent): explain one thing, now.
- **Later:** explain a whole repository, part by part, and keep those views current.
