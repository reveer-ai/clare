---
name: clare-explain
description: clare's explain skill. Explains a subject as a single visual HTML page, in whatever form gets it across fastest, with as little reading as possible. Use when the user runs clare-explain, asks clare to explain something, or asks for something to be explained, shown or "clared".
---

# clare-explain

Explain one subject as a single HTML page that gets it across faster than text would.

## 1. The subject

If the user gave a subject, explain that.

If not, work out the one specific thing they mean from the recent conversation, such as the change you just made or the code you've been discussing. Go ahead only if you're confident. Never explain the whole session.

If you aren't confident, ask one short question about what to explain, with your best guess if you have one. Write nothing until they answer.

## 2. Points to weigh

How to present the subject is your call. Before you decide, weigh:

- What does the reader most need to understand, and what can be left out?
- What form would get this subject across fastest? Don't reach for the same one every time.
- Could they see it or try it, instead of reading about it?
- If they stopped after the first screen, would they leave with the main point?
- Does every word earn its place? Which ones can go?
- Have you read what the page draws on, and does it stay true to it?

## 3. What the page must be

- One HTML file, with all CSS, JavaScript, SVG and images inline.
- No network requests: no CDNs, web fonts, remote images or fetches. It has to open from disk, offline, years from now.
- It names what it explains: the subject, and the sources it drew on, such as file paths or a commit.

Everything else about the page is up to you.

## 4. Where it goes

Write it to `clare/<slug>.html` at the project root: the repository root, or the working directory outside a repository. Create `clare/` if it isn't there. `<slug>` is a short kebab-case name for the subject, such as `auth-flow`. If `clare/` already has a page for this subject, reuse its slug and replace that file.

Don't change `.gitignore` or any other file in `clare/`.

When it's written, tell the user the path.
