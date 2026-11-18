# The eight blocks

Each block below is keyed by its slug from `rules/blocks.json`. **The order of the blocks and the official headings come from `rules/blocks.json` and `rules/headings.json`; if this file ever disagrees, the JSON wins.** Examples use a sample project, "Corner Breakfast" (Traditional Chinese name 巷口早餐店｜線上點餐, folder `breakfast-order`), a web page where customers order on their phone and pick up at the shop. Every rule in `rules/rules.json` also has a before-and-after `example` from the same project.

The blocks answer three reader questions in turn: *What is it?* → *How do I run it?* → *How do I change it, and may I use it?*

---

## `title` — Title and one-line description

**Why:** readers decide in seconds whether to keep reading; AI uses the first lines as the project summary.

**Write:**

- Line 1: `# Project name`, the only top-level heading in the file (`STR002`). If the display name differs a lot from the repository name, add the repository name in brackets: `# Corner Breakfast (breakfast-order)`.
- Next line: one plain sentence — what it does and for whom (`STR003`). No `>` quote, at most 60 Chinese characters or 120 English characters (`STR014`).
- Then a status line starting with `Status:` / `狀態：` (`STR004`).
- Optional: up to three badges about quality (build, coverage, license) right under the title, never star/fork/issue counts (`IMG007`).

**Good:**

```markdown
# Corner Breakfast

A web page where customers order breakfast on their phone and pick it up at the shop.

Status: maintained
```

```markdown
# 巷口早餐店｜線上點餐

讓客人用手機先點餐、到店直接取餐的網頁。

狀態：維護中
```

**Bad:** badges or a banner image above the title; the description in a `>` quote; a paragraph that tells the whole story; a note to the template user ("this template is not absolute").

---

## `demo` — Demo and screenshots

**Why:** the fastest way to show what the project is. Text must carry the key information too, because some readers (and AI) cannot see images.

**Write:**

- Demo: a link whose text says where it goes — `[Corner Breakfast live demo (GitHub Pages)](https://…)` — never "click here" (`LNK004`).
- Screenshots: one to three images stored in the repository and linked by relative path (`IMG003`), each with alt text describing what the reader should notice (`IMG001`, `IMG002`), and one sentence below each image with its key point.
- Backend API: the API Documentation section goes here — local URL and online URL (`TYPE-API001`).
- Web apps and portfolios need at least one screenshot or live link (`IMG005`).

**Good:**

```markdown
![Order page: categories at the top, dishes with prices below, cart button bottom right](docs/images/order-page.png)

Dishes are grouped into egg crepes, toast and drinks; tapping one adds it to the cart.
```

**Bad:** `![](…)`; alt text `screenshot.png`, `image 1`, `Image of the page`; `fakeimg.pl` or other placeholder images (`IMG004`); information only visible inside an image.

---

## `features` — Features

**Why:** answers "what can it do?" in words that people and AI can search.

**Write:**

- Three to eight items, each starting with a verb ("Browse the menu by category").
- Use checkboxes if you want to show what is done and what is not: `- [x] Order online`, `- [ ] Pay online (not yet)`.
- A read-only test account, if the user wants to share one — as a list, never inside a `bash` block (`CMD008`).
- Known limitations.
- Course example: Learning Objectives and Course Unit go here (`TYPE-CS002`). Portfolio: My Role goes here (`TYPE-PF001`). Backend API: an endpoint table (method, path, purpose, login required).

**Bad:** a list that ends with `...` (`STR010`); emoji as bullet points; features that are only shown in screenshots.

---

## `tech` — Tech stack

**Why:** lets readers judge whether the stack fits them; interviewers read it closely.

**Write:** main frameworks and services with **major** versions only ("Vue 3", "Vite 6", "PostgreSQL 16"). Take them from `package.json`, not from memory. Portfolio: Design Decisions goes here — one or two choices and why (`TYPE-PF002`).

**Bad:** every package with patch versions (`Axios v0.24.0`), which goes stale on the next update.

---

## `install` — Getting started

**Why:** the part most often followed step by step, by people and by AI. Every command must work as written.

**Write:**

- `### Requirements` (required): runtime and tools with concrete versions that match `engines`, `.nvmrc` and `packageManager` (`VER002`, `VER007`). Never "latest version" or "16 or above..." (`VER005`).
- `### Installation` (required): one code block with one command per line — clone, `cd`, install, `cp .env.example .env` (`ENV008`), start — followed by one sentence saying which URL to open and what success looks like. If a step needs explanation, split it into numbered steps instead.
- Commands in fenced blocks with a language (`CMD002`), one package manager only — the one the lock file says (`CMD004`) — and only scripts that exist (`CMD005`). No `$` prompts (`CMD003`), no full-width characters (`CMD010`), no explanations or URLs inside the block (`CMD008`).
- `### Running Tests` when the project has tests (`CMD012`).
- Backend API: Installation stops before the start command. Database Setup comes next, with the commands that create the tables and load sample data, one per line (`TYPE-API002`). Usage then starts the server and shows one request and its response in separate blocks (`TYPE-API003`). Pasted top to bottom, that order works; starting the server before the tables exist does not. Course example: Starter and Solution, and Usage ("open this file, run this, you should see…").

**Good:**

````markdown
### Installation

```bash
git clone https://github.com/zaocan/breakfast-order.git
cd breakfast-order
pnpm install
cp .env.example .env
pnpm dev
```

Open http://localhost:5173 in your browser; once you see the menu, it is running.
````

**Bad:** `npm run serve` in a pnpm project with no `serve` script; `http://localhost:8080/` inside a `bash` block; "install the relevant packages".

---

## `env` — Environment variables

**Why:** without them the project does not start, and guessing values is where people and AI get stuck.

**Write:** one table with four columns — name, required, purpose, where to get it — listing every variable in `.env.example` (`ENV001`, `ENV002`). An extra column with a fake example value is fine. For front-end projects, note that `VITE_` / `NEXT_PUBLIC_` variables end up in the page and must not hold secrets.

```markdown
| Name | Required | Purpose | Where to get it |
| ---- | ---- | ---- | ---- |
| `VITE_API_BASE_URL` | Yes | Address of the ordering API | Where the ordering API runs |
```

**Bad:** a real key or token (`ENV004`); variables listed twice in different places; a name that does not match `.env.example`.

---

## `structure` — Project structure

**Why:** tells someone who wants to change the code where things live.

**Write:** only the one or two levels that matter, in a ```text block, with one short note each — especially things you cannot tell from the names ("`src/api/` holds every call to the backend; components never call fetch directly"). Only folders and files that exist (`STR016` checks the top level). Write each entry as `name/  note`, or as a tree with `├──` / `└──`.

**Bad:** generic folder lists copied from a template (`views`, `controllers`, `modules`) that do not exist in this project.

---

## `license` — Author, contact and license

**Why:** "who made this, how do I reach them, and may I use it?" Without a license, others legally may not reuse the code. Public projects state a license; internal or private projects may leave the License section out, but Author is always required.

**Write, in this order:**

- `## Contributing` (optional): whether pull requests are welcome, where to ask questions.
- `## Author`: how the user wants to be credited, and contact links they gave you. Team projects: members and what each did. Internal projects: the owning team and where to ask questions (alternatives such as "Owners", "Maintainers" or "Support" are recognized), not personal contact details.
- `## Acknowledgments` (optional).
- `## License` — public projects only, always the last section (`STR008`): the license name and a link to `LICENSE`, matching the `LICENSE` file and `package.json` (`LIC001`, `LIC002`, `LIC003`). If the project is public but not open: "All rights reserved." Internal projects: leave this section out.

**Bad:** author and license under one heading; a license name that differs from the `LICENSE` file; personal contact details the user did not provide.
