# clare

clare explains a subject in whatever form gets it across fastest: an interactive page, a few slides, a diagram, an image, a set of flashcards. Paragraphs are a last resort.

It ships as a set of skills that any coding assistant can use.

> **Not usable yet.** The only skill so far is a placeholder that does nothing.

## Install

In your project:

```sh
npx clareai init
```

Note the package name: it's **`clareai`**. The `clare` package on npm is unrelated, so `npx clare init` won't run this.

`init` copies clare's skills into `.agents/skills/`, the folder that Codex, Copilot, Cursor, Gemini CLI and others read. It changes only clare's own folders there.

Claude Code reads only `.claude/skills/`. If your project has a `.claude/` folder, `init` also links `.claude/skills/<skill>` to the copy in `.agents/skills/`, so there's still one copy. If you add `.claude/` later, run `init` again.

To update, run the latest version:

```sh
npx clareai@latest init
```

This replaces clare's skill folders, including any edits you made to them.

## License

MIT
