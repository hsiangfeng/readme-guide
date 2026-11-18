# readme-guide

Checks a README against the [README Guide](https://readme-guide.com): eight blocks in a fixed order, commands and versions that match the project, nothing left unfinished. Zero dependencies; needs Node.js 22 or later.

[繁體中文說明](https://readme-guide.com/zh-tw/)

## Usage

```bash
npx readme-guide@latest check README.md
```

The checker compares the README with the files in its folder (`package.json`, the lock file, `.env.example`, `LICENSE` and so on). Every problem comes with a rule ID, a line number and how to fix it.

To look up one rule in full:

```bash
npx readme-guide@latest explain CMD004
```

## Options

| Option | What it does |
| --- | --- |
| `--type <type>` | Project type: `web-app`, `course-example`, `portfolio` or `backend-api`. Detected when omitted. |
| `--lang <lang>` | Output language: `zh-TW` or `en`. Same as the README when omitted. |
| `--project <folder>` | Project folder to compare against. Defaults to the README's folder. |
| `--json` | Print JSON for AI or other tools to read. |
| `-h`, `--help` | Show the help. |

`explain` accepts only `--lang` and `--json`.

## Exit codes

| Code | Meaning |
| --- | --- |
| `0` | No errors (there may be warnings). |
| `1` | At least one error. |
| `2` | Bad options, a missing file, or an unknown rule ID. |

## Learn more

The rules, templates and the guide for AI are on [readme-guide.com](https://readme-guide.com) ([繁體中文](https://readme-guide.com/zh-tw/)).

## License

[MIT](https://github.com/hsiangfeng/readme-guide/blob/main/LICENSE)
