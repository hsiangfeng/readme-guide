# README Guide

A README writing guide for people and AI, with an eight-block structure, four templates, AI rules, and a checker.

Status: maintained

[繁體中文版 README](README.zh-TW.md)

## Demo

[README Guide website](https://readme-guide.com) · [Traditional Chinese website](https://readme-guide.com/zh-tw/)

## Screenshots

![Home page: title and copyable prompt card on the left, terminal preview on the right showing AI reading the guide, asking questions, running the checker, and finishing the README](docs/images/home.png)

## Features

- [x] Eight-block structure: why each block exists, what to write, common mistakes, and fixed examples
- [x] Templates for four project types (web app, course example, portfolio, backend API) in English and Traditional Chinese
- [x] Copy-paste prompt for AI: reads the rules and project files first, asks about anything it cannot find, and runs the checker after writing
- [x] Zero-dependency checker: compares the README against project config files to catch mismatched commands, versions, environment variables, and licenses; runs with one `npx` command and adds nothing to your project
- [x] Machine-readable checker output for AI tools

## Tech Stack

- Nuxt 4
- Vue 3
- Tailwind CSS 4
- Vitest 3
- Node.js 22 (checker, zero dependencies)

## Getting Started

### Requirements

- Node.js 22 or later
- pnpm 10

### Installation

```bash
git clone https://github.com/hsiangfeng/readme-guide.git
cd readme-guide
pnpm install
pnpm dev
```

Open http://localhost:3000 in your browser; once you see the home page, it is running.

### Running Tests

Run the website tests:

```bash
pnpm test
```

Run the checker tests:

```bash
pnpm --filter readme-guide test
```

## Usage

### Let AI Write It

Paste the following prompt into an AI tool that can read files and run commands:

```text
First, run this command and read the whole guide it prints:
curl -fsSL https://readme-guide.com/skill.md

Then inspect my current project against the guide,
and write a README.md for me.

If anything is unclear, ask me first. Don't make it up.
```

### Write from a Template

Templates live in `templates/en/` and `templates/zh-TW/`, with one file for each project type (`web-app.md`, `course-example.md`, `portfolio.md`, `backend-api.md`). Replace every `{{FILL: …}}` blank with your own content and delete any sections you do not need.

### Run the Checker

In your project folder, run (requires Node.js 22 or later):

```bash
npx readme-guide@latest check README.md
```

The exit code is `1` when there are errors, and `0` when there are only warnings or no issues. Add `--type` to specify the project type (`web-app`, `course-example`, `portfolio`, `backend-api`), and `--json` for output formatted for AI to read. To read the full explanation of one rule, such as `CMD004`, run `npx readme-guide@latest explain CMD004`.

## Project Structure

```text
rules/      Single source of truth: block order, headings, required sections, check rules
templates/  README templates for the four project types
skills/     Writing rules for AI
lint/       README checker (published to npm as readme-guide)
site/       Website for readme-guide.com
```

## Contributing

If you find an issue with a rule or something missing from a template, open an issue on [GitHub Issues](https://github.com/hsiangfeng/readme-guide/issues). To change a rule, edit only the data in `rules/` and run the tests afterward; the [contributing guide](CONTRIBUTING.md) has the details.

## Author

是 Ray 不是 Array | [是 Ray 不是 Array blog](https://israynotarray.com/)

## License

MIT; see [LICENSE](LICENSE) for the full text.
