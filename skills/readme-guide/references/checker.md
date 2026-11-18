# The checker

The checker is the `readme-guide` package on npm. It checks a README against the README Guide rules. It needs Node.js 22 or later and has no dependencies; `npx` downloads it into the npm cache, so nothing is added to the user's project.

## Command

```bash
npx --yes readme-guide@latest check PROJECT/README.md --type TYPE --lang LANG --json
```

- `--yes` skips npx's "Ok to proceed?" question, so the command never waits for input.
- `@latest` makes npx check for the newest version instead of reusing an older one it may have cached.

| Option | Meaning |
| --- | --- |
| `--type` | `web-app`, `course-example`, `portfolio` or `backend-api`. Without it the checker guesses and says why. Always pass it once you know the type. |
| `--lang` | `zh-TW` or `en`: language of the messages only. Without it, the messages follow the README's language. |
| `--project` | The project folder to compare with. Defaults to the folder the README is in. |
| `--json` | Machine-readable output. Use it while fixing. |

Exit code: `1` when there is at least one error, `0` when there are only warnings or nothing, `2` when the options or the file path are wrong (or, for `explain`, the rule ID is unknown).

## JSON output

```json
{
  "file": "README.md",
  "projectDir": "/path/to/project",
  "type": { "id": "web-app", "name": "Web app", "source": "option", "evidence": [] },
  "language": { "output": "en", "readme": "en", "source": "option" },
  "projectFilesFound": true,
  "skippedRules": [],
  "summary": { "errors": 1, "warnings": 2 },
  "problems": [
    {
      "ruleId": "CMD004",
      "severity": "error",
      "line": 42,
      "column": 1,
      "block": { "slug": "install", "number": "05", "name": "Getting started" },
      "message": "This uses npm, but the project uses pnpm (see pnpm-lock.yaml)",
      "title": "Commands use the project's package manager",
      "fix": "Switch the commands to the project's package manager…",
      "needsProject": true
    }
  ]
}
```

- `line` and `column` are `null` for problems about something missing (a section, a variable).
- `block` is `null` when the problem sits in a section that is not one of the eight blocks.
- `skippedRules` lists rules that compare against project files. They are skipped when the folder contains nothing but Markdown files. If you see it non-empty while working on a real project, you passed the wrong `--project`.
- For the full explanation of a rule, use `explain` with its `ruleId` (next section).

## Looking up one rule

```bash
npx --yes readme-guide@latest explain CMD004 --lang LANG
```

It prints the rule's block, severity, status (implemented or planned), description, how to fix it, and a before-and-after example. Add `--json` for the same fields as JSON. IDs are not case-sensitive. An unknown ID exits with `2` and lists similar IDs.

Use this instead of fetching the full rule list (`rules.json`, about 118 KB).

## When the checker cannot run

Typical causes: Node.js older than 22 (`node --version`), no `npx`, no network, or a registry the machine cannot reach. Do not pretend it ran and do not write a result you did not see. Instead:

1. Review the README yourself against the writing rules in the guide.
2. Tell the user plainly that the checker did not run and why (quote the error).
3. Give them the command to run it themselves in the project folder: `npx readme-guide@latest check README.md`.

## Fix loop

1. Run with `--json`.
2. Fix every error, using `fix` and the rule's `description`. Prefer fixing the README; fix a project file only when the user agrees it is the file that is wrong (for example an outdated `engines` field).
3. Run again. Repeat until `summary.errors` is `0`.
4. Review each warning. Fix it, or keep it and write down why.
5. Run once without `--json` and quote the last line (for example `✔ No problems found (0 errors, 0 warnings)`) in the report.

Things that are never acceptable fixes:

- Deleting a true fact, a section the type requires, or a working command to make a message go away.
- Renaming a heading to something the checker does not recognize.
- Replacing a missing fact with a plausible guess.
- Switching `--type` to a type the project is not, to escape required sections.

## Warnings you may keep

A warning can stay when the user has a reason. Typical cases:

| Rule | Acceptable reason to keep |
| --- | --- |
| `STR014` (description too long) | The user wants that exact wording; mention that 60 Chinese characters / 120 English characters is the guide's limit. |
| `STR004` (no status) | The user refuses to state one. |
| `IMG005` (no screenshot or live link) | The project has no screens yet and the user will add them later. List it under "Still to do". |
| `CMD012` (tests not mentioned) | The tests only run in CI and the user does not want them in the README. |
| `TYPE-PF002` (no design decisions) | The user has nothing they want to explain. |
| `STR016` (listed folder not found) | The folder is created at build time or ignored by git in a way the checker cannot see; say which one. |

Always tell the user which warnings remain and why.
