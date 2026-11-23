---
name: readme-guide
description: Write, rewrite or check a project's README.md with the README Guide — eight fixed blocks in a fixed order, four project types (web app, course example, portfolio, backend API), facts taken from the project's own files, anything unknown asked of the user instead of invented, and a checker run until no errors remain. Use when the user asks to write, create, rewrite, improve, translate or review a README.
---

# README Guide

Write a README that people scan quickly and that AI reads accurately: one fixed structure, every fact verified against the project, nothing invented.

## Where things are

Everything you need is next to this file or on readme-guide.com. You never need the README Guide repository itself.

- **References** (`discovery.md`, `project-types.md`, `blocks.md`, `checker.md`): in `references/` next to this file. If you read this guide from the web and it is not on disk, fetch a reference when a step points to it: `https://readme-guide.com/skill/references/<name>.md`.
- **Templates:** `https://readme-guide.com/templates/<lang>/<type>.md`, where `<lang>` is `zh-TW` or `en`, for example `https://readme-guide.com/templates/en/backend-api.md`. Fetch only the one you will use.
- **Rule data:** small JSON files at `https://readme-guide.com/rules/<file>`. The templates already follow them; fetch one only when a step needs it.

| File | What it holds |
| --- | --- |
| `blocks.json` | The eight blocks and **their order** (array order). |
| `headings.json` | Official heading for every section in Traditional Chinese and English, accepted alternatives, and which block each belongs to. |
| `project-types.json` | For each type: required sections, optional sections, type-specific sections. |
| `conventions.json` | Template blank syntax (`{{FILL: …}}` / `{{請填：…}}`), one-line description length, status wording. |

- **One rule in full** (block, severity, explanation, fix, example): `npx --yes readme-guide@latest explain RULE_ID --lang LANG`. The complete rule list, `rules.json`, is large (about 118 KB); do not fetch it.
- **The checker:** the `readme-guide` package on npm, run with `npx` (step 5). It needs Node.js 22 or later.

**How to fetch:** get the raw file, for example `curl -fsSL https://readme-guide.com/templates/en/web-app.md`, and read all of it. Do not use a web tool that returns a summary: the exact headings, IDs and order matter. Do not clone the README Guide repository, and leave no file from this guide in the user's project folder. If you must save a fetched file, put it in a temporary folder outside the project and delete it when you are done.

Always use the rule IDs and block names from these files and from the checker when you talk about a rule. Do not invent your own names for them.

## Non-negotiable rules

1. **Never invent facts.** Live URLs, test accounts, screenshots, versions, features, team roles, course units, dates, licenses, contact details and numbers come from the project files or from the user. If neither has it, ask; if the user does not know, leave that part out.
2. **Never write a command you have not verified in the project.** The package manager must match the lock file (`CMD004`), every `run` target must exist in `package.json` `scripts` (`CMD005`), the Node.js version must match `engines` / `.nvmrc` (`VER002`). If you can run a command safely (install, test, build), run it; if not, at least confirm it exists.
3. **Never paste a real secret** (`ENV004`). Example values are obviously fake: `your-api-key`, `change-me`.
4. **Never leave template text behind.** No `{{FILL: description}}` / `{{請填：說明}}` blanks (`STR015`; to mention the syntax itself, write it with only an ellipsis, `{{FILL: …}}`, which the checker skips), no leftover template reminders or placeholder images (`STR010`, `IMG004`). Delete optional parts that do not apply instead of leaving them empty (`STR009`).
5. **Never add personal data the user did not give you.** Do not copy names or emails from git history or config into the README; ask how the author wants to be credited.
6. **Never choose a license for the user, and never create a `LICENSE` file yourself.** Explain the options and let the user decide.
7. **Do not write to AI inside the README** (`AIR005`), and do not write "as mentioned above" (`AIR001`). Every section must make sense on its own.
8. If a README already exists, read it first, keep what is still true after you verify it, and tell the user what you changed.

## Workflow

### 1. Read the project

Read before you write or ask anything. See `references/discovery.md` for the full checklist; at minimum:

- `package.json` (name, description, `scripts`, `engines`, `packageManager`, `license`, dependencies), the lock file, `.nvmrc` / `.node-version` / `.tool-versions`
- `.env.example` (or `.env.sample`, `.env.template`) — never `.env` itself
- The top one or two folder levels, framework config files, database folders (`prisma/`, `migrations/`)
- The existing README and other docs, `LICENSE`, image files that could serve as screenshots
- `git remote -v` for the clone URL and repository name

Write down each fact with the file it came from. You will need that list at the end.

Also decide whether the project is **public** (meant for others to read or reuse) or **internal** (a company or private project). Signals: a `LICENSE` file; `license` in `package.json` (`UNLICENSED` means internal, a license name such as `MIT` means public; `ISC` alone is npm's default and proves nothing); `"private": true` (only blocks publishing to npm, so it is weak on its own); the remote URL (a company Git server or a private repository points to internal). If the signals disagree or are missing, ask in plain words, for example: "Will people outside your team read this, or is it only for internal use?"

- **Internal:** leave out the License section. Under Author, name the owning team and where to ask questions (a team channel, an issue tracker); do not add personal contact details. If the live URL only works on the company network, keep it and say so ("reachable only from the office network").
- **Public without any license:** tell the user "Without a license, others may not legally use this code," offer choices (for example MIT, another license they name, or "All rights reserved"), and wait. Do not decide for them and do not add a `LICENSE` file yourself.
- **Public with a license:** the License section is required (`LIC001`) and must match the `LICENSE` file and `package.json` (`LIC002`).

### 2. Decide the project type

One of `web-app`, `course-example`, `portfolio`, `backend-api` (definitions in `project-types.json`, differences in `references/project-types.md`). Use the signals in that reference. **If you are not sure, ask the user**, offering the four types in plain words. Do not guess between portfolio and web app: only the user knows whether the project is meant to show an employer.

### 3. List what you could not find, then ask

Before writing, make a list of everything the README needs that the project files do not tell you. Typical items:

- Live URL, and whether it is still online
- A read-only test account (only if the user wants to share one)
- Screenshots: which image files to use, or whether the user will add them
- Whether the project is public or internal, if the files do not make it clear; for a public project with no license, which license (the user chooses)
- Project status: completed, maintained, practice project, no longer maintained
- The version of a database or other service the project needs, when no file states it
- How the author wants to be credited and contacted (for an internal project: the owning team and where to ask)
- Portfolio: "My Role" (what the user personally built) and "Design Decisions" (why)
- Course example: course name and unit, learning objectives, starter/solution branches
- Backend API: where the API documentation lives, how the database is created

Keep this list to yourself and ask **one question per message**. Wait for the answer before you ask the next one. Do not send the whole list as one long numbered message: the user has to answer everything at once, and an early answer often makes later questions unnecessary.

- **Order:** first the questions whose answer changes the other questions (project type, public or internal), then what the README cannot do without, optional items last.
- **One decision per message:** what you found, the question, one line on why it matters, and your suggestion if you have one. Say if it is optional. Do not pack two questions into one message ("Which URLs? And should I mention the login?" is two).
- **Say how many are left:** with the first question, tell the user roughly how many questions you have, so they know how long this will take.
- **Update the list after each answer:** drop the questions it settled or made unnecessary, and never ask again what the user already told you.
- If the user asks to see all the questions at once, list them.

If the user cannot answer an optional item, drop that part of the README. If they cannot answer something the README needs (for example how to get a test database running), explain what will be missing and offer concrete choices. Full question wording: `references/discovery.md`.

### 4. Write from the template

- **Language:** write in the user's language. Templates exist for Traditional Chinese (`zh-TW`) and English (`en`). For any other language, use the English template, keep its official English headings (the checker recognizes only those two languages), write the content in the user's language, and tell the user why the headings are in English.
- Fetch the template for the language and type, `https://readme-guide.com/templates/<lang>/<type>.md`, and write the README from it.
- Keep the official headings and their order. Replace every blank with verified content; delete optional sections that do not apply.
- Follow the per-block guidance in `references/blocks.md`: what each block is for, what to write, and good and bad examples.

### 5. Run the checker and fix

Run from anywhere (use absolute paths if unsure):

```bash
npx --yes readme-guide@latest check PROJECT/README.md --type TYPE --lang LANG --json
```

`PROJECT` is the user's project folder (the checker compares the README with the files there). `LANG` is `zh-TW` or `en` and only changes the language of the messages. `npx` keeps the package in the npm cache; it adds nothing to the project. Details of the JSON and the loop: `references/checker.md`.

1. Fix every **error**, then run again. Repeat until `summary.errors` is `0`. Never "fix" an error by deleting true information or by renaming a heading to dodge a rule.
2. Go through every **warning**. Fix it if the warning is right. If you judge it does not apply (for example a long description the user insists on), keep it and note the reason for the user.
3. If `skippedRules` is not empty, the checker found no project files and skipped the comparisons; tell the user those checks did not run.
4. Finish with one run without `--json` and include its last line in your report.

If the checker cannot run (no Node.js 22 or later, no `npx`, no network, the registry is blocked), do not pretend it ran and do not invent its output. Review the README yourself against "Writing rules at a glance" below, then tell the user that the checker did not run, why, and how to run it themselves: `npx readme-guide@latest check README.md` in the project folder.

### 6. Report to the user

Give the user three short lists, then the checker result:

1. **From the project files** — each fact with the file it came from (`package.json` → scripts, `.nvmrc` → Node.js 22…).
2. **From your answers** — what the user told you.
3. **Still to do** — things left out for lack of information that the user may want to add later (for example screenshots), with where they would go.

Then: the final checker summary line, and each remaining warning with your reason for keeping it. If the checker did not run, say so here instead.

## Writing rules at a glance

Each line names the rule ID it follows. For the full text of a rule, run `npx --yes readme-guide@latest explain RULE_ID`.

- Line 1 is `# Project name`, the only top-level heading (`STR002`); the next line is one plain sentence on what it does and for whom (`STR003`, `STR014`); then a status line (`STR004`).
- Every section the type requires is present under its official heading (`STR006`), in block order (`STR007`), with the license last (`STR008`). No empty sections (`STR009`); no skipped heading levels (`STR005`).
- Every image has alt text that says what the image shows (`IMG001`, `IMG002`), points to a real file (`IMG003`), and is not a placeholder (`IMG004`). Web apps and portfolios show at least one screenshot or a live link (`IMG005`). No star/fork/issue badges (`IMG007`).
- Commands sit in code blocks with a language (`CMD002`), with no `$` prompt in front (`CMD003`), contain only commands — no explanations, logins or browser URLs (`CMD008`), and no full-width characters (`CMD010`). If the project has tests, say how to run them (`CMD012`).
- Requirements give concrete versions that match the project (`VER002`, `VER005`, `VER007`).
- With a `.env.example`: an Environment Variables section with a four-column table — name, required, purpose, where to get it — listing every variable (`ENV001`, `ENV002`), and a setup step that creates `.env` (`ENV008`).
- Project Structure lists only folders and files that exist (`STR016`).
- Relative links resolve (`LNK001`); link text says where it goes, never "click here" (`LNK004`).
- Public projects with a `LICENSE` file or a license in `package.json` have a License section (`LIC001`) that agrees with both (`LIC002`); a named open license comes with a `LICENSE` file (`LIC003`). Internal projects may leave the License section out.
- Type-specific: API documentation location (`TYPE-API001`), database setup (`TYPE-API002`), a request example (`TYPE-API003`); portfolio "My Role" and "Design Decisions" (`TYPE-PF001`, `TYPE-PF002`); course unit (`TYPE-CS002`).
- Rules whose status is planned (`explain` shows the status) are not checked yet, but follow them anyway.

## References

- `references/discovery.md` — what to read in the project, which block each fact feeds, and the questions to ask.
- `references/project-types.md` — how the four types differ and how to tell them apart.
- `references/blocks.md` — each block: why it exists, what to write, good and bad examples.
- `references/checker.md` — checker options, JSON fields, the fix loop, and how to handle warnings.
