# The checker

`GUIDE/lint/bin/readme-guide.mjs` checks a README against `rules/`. It needs Node.js 22 or later and has no dependencies, so there is nothing to install.

## Command

```bash
node GUIDE/lint/bin/readme-guide.mjs check PROJECT/README.md --type TYPE --lang LANG --json
```

| Option | Meaning |
| --- | --- |
| `--type` | `web-app`, `course-example`, `portfolio` or `backend-api`. Without it the checker guesses and says why. Always pass it once you know the type. |
| `--lang` | `zh-TW` or `en`: language of the messages only. Without it, the messages follow the README's language. |
| `--project` | The project folder to compare with. Defaults to the folder the README is in. |
| `--json` | Machine-readable output. Use it while fixing. |

Exit code: `1` when there is at least one error, `0` when there are only warnings or nothing, `2` when the options or the file path are wrong.

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
- The full explanation of any rule is in `rules/rules.json` under the same `ruleId`.

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
