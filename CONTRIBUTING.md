# Contributing

Thanks for helping improve README Guide. This guide explains how to report a problem, suggest a change, or send a pull request.

[繁體中文版](CONTRIBUTING.zh-TW.md)

## Ways to help

- The checker got it wrong: it flagged a README that is fine, or missed a real problem.
- A check rule, a template, the rules for AI, or the guide content is wrong, out of date, or missing a common case.
- There is a typo, an awkward translation, or one thing called by two names.
- You need a project type that is not covered yet, such as a command-line tool, a package, or a mobile app.

To report a problem, suggest a change, or ask a question, choose the matching form on [GitHub Issues](https://github.com/hsiangfeng/readme-guide/issues).

## Before you start

For typos, wording improvements, and clear bug fixes, you can open a pull request right away.

For larger changes like the ones below, please open an issue first so we can agree on the direction before you spend time building it:

- Adding or removing a check rule, or changing a check rule between "error" and "warning".
- Changing the block order in the eight-block structure, an official heading, or the required sections of a project type.
- Adding a new project type.

## Run it locally

You need Node.js 22 or later and pnpm 10. (If you plan to send a pull request, fork this repository first and clone your fork instead.)

```bash
git clone https://github.com/hsiangfeng/readme-guide.git
cd readme-guide
pnpm install
pnpm dev
```

Open http://localhost:3000 in your browser; once you see the home page, it is running.

## Where to make the change

| What you want to change | Change it here | Keep in mind |
| ---- | ---- | ---- |
| Rules: block order, official headings, required sections, and check rule text | `rules/` | This is the single source of truth. The checker, the rules for AI, and the website all read from here, so never hardcode block order, headings, or required sections elsewhere. See `rules/README.md` for field details |
| Checker logic | `lint/src/checks/` | Every check rule needs both a passing and a failing test; do not add any dependencies. The checker is published to npm as `readme-guide`; packing copies `rules/` into the package, so never commit a copy under `lint/` |
| Templates | `templates/zh-TW/`, `templates/en/` | Update both languages together, line for line; when checked with the matching `--type`, a template may only report blanks still to fill in (`STR015`) |
| Guide content for each block | `site/content/guide/` | See `site/content/guide/README.md` for the file format |
| Rules for AI | `skills/readme-guide/` | Keep `SKILL.md` concise; put detailed rules in `references/`. The website serves these files word for word, so they must work without the rest of this repository: point to readme-guide.com URLs and the npm checker, not to repository paths |
| Website | `site/` | Block order, headings, and rule counts are computed from `rules/`, never hardcoded |

## Before you send it

```bash
pnpm verify
```

Make sure it passes before opening a pull request. It runs the linter, the type check, the website and checker tests, checks both READMEs, then builds the site and checks the output. The automated check on your pull request runs the same command.

## Writing conventions

- Use Taiwan Mandarin terms in Traditional Chinese, for example 專案, 程式碼, 資料夾, 儲存庫, 套件管理工具.
- Update Traditional Chinese and English together. If you only write one language, that is fine—just note which one still needs updating in the pull request.
- Write "AI" or "AI tool", never a specific vendor or product name. This guide is not tied to any single tool.
- Use the shared sample project "Corner Breakfast" for all examples, with `example.com` and `localhost` for URLs, and never include real names or email addresses.
- Never put real keys, tokens, or passwords in any file.

## Send a pull request

1. Fork this repository and create a new branch from `main`.
2. Make your changes and run `pnpm verify` as described under "Before you send it".
3. Open a pull request and fill out the template: explain what changed, why, and link the related issue if there is one.

Keep each pull request focused on one thing—it is easier to review and gets merged sooner.

## License

By contributing, you agree that your work will be released under this project's [MIT License](LICENSE).
