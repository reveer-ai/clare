# clare

clare explains a subject in whatever form gets it across fastest: an interactive page, a few slides, a diagram, an image, a set of flashcards. Paragraphs are a last resort.

It ships as a set of skills that any coding assistant can use.

## Install

In your project:

```sh
npx clare-ai init
```

Note the package name: it's **`clare-ai`**. The `clare` package on npm is unrelated, so `npx clare init` won't run this.

`init` copies clare's skills into `.agents/skills/`, the folder that Codex, Copilot, Cursor, Gemini CLI and others read. It changes only clare's own folders there.

Claude Code reads only `.claude/skills/`. If your project has a `.claude/` folder, `init` also links `.claude/skills/<skill>` to the copy in `.agents/skills/`, so there's still one copy. If you add `.claude/` later, run `init` again.

To update, run the latest version:

```sh
npx clare-ai@latest init
```

This replaces clare's skill folders, including any edits you made to them.

## Use

Ask your assistant to explain something:

```
/clare <subject>
```

Or ask for clare by name, such as "use clare to explain the auth flow". With no subject, clare explains what you've just been working on if that's clear, and asks if it isn't.

Each explanation is one self-contained HTML file in `clare/` at the project root, such as `clare/auth-flow.html`. clare opens it for you when your assistant can run commands. It works from disk, offline. clare doesn't change your `.gitignore`, so you decide whether to commit them.

## License

MIT
