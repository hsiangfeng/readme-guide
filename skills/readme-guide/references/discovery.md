# Discovery: read the project, then ask

Read everything below that exists before asking the user anything. Keep a list of facts with their source file; the final report needs it.

## What to read and where it goes

Block slugs refer to `rules/blocks.json`.

| Source | Look for | Feeds block |
| --- | --- | --- |
| `package.json` `name`, `description` | Project name, a draft of the one-line description | `title` |
| `git remote -v` | Repository URL and name, for `git clone` and `cd` | `install` |
| `package.json` `dependencies` / `devDependencies` | Main frameworks and their **major** versions | `tech` |
| Framework config (`vite.config.*`, `nuxt.config.*`, `next.config.*`, `nest-cli.json`…) | Framework, dev server port if set | `tech`, `install` |
| Lock file: `pnpm-lock.yaml`, `yarn.lock`, `package-lock.json`, `bun.lock` | **The** package manager. Use only this one in commands. | `install` |
| `package.json` `packageManager` | Package manager version | `install` |
| `.nvmrc`, `.node-version`, `.tool-versions`, `package.json` `engines` / `volta` | Node.js version for Requirements | `install` |
| `package.json` `scripts` | The exact commands for dev, build, test, lint | `install` |
| `.env.example` / `.env.sample` / `.env.template` | Every variable name and any comments. **Never open `.env`.** | `env`, `install` |
| Source code using `process.env.X` / `import.meta.env.X` | What each variable is for, whether the app fails without it | `env` |
| `prisma/`, `migrations/`, `knexfile.*`, `drizzle.config.*`, ORM packages | Database type and setup commands (migrate, seed) | `install` |
| `docker-compose.yml` | Services needed locally (database, cache) | `install` |
| Top one or two folder levels | Folder structure; only folders that exist | `structure` |
| Route files, page components, API controllers | Features in plain words; API endpoint list | `features` |
| OpenAPI / Swagger setup, `/api-docs` routes | Where the API documentation is | `demo` (backend API) |
| Image files (`docs/`, `public/`, `screenshots/`) | Candidate screenshots — confirm with the user before using | `demo` |
| `LICENSE` / `LICENCE` / `COPYING` | License name | `license` |
| `package.json` `license`, `private`; the remote URL | Whether the project is public or internal (see below) | `license`, `title` |
| Existing `README.md` and `docs/` | Facts to keep after verifying, links to keep | all |
| Folders or branches named `start`, `starter`, `finish`, `solution` | Starter and solution versions (course example) | `install` |
| `git log` | Only whether several people worked on it (portfolio "My Role"). Do not copy names or emails. | `features` |

## Public or internal

| Signal | Points to |
| --- | --- |
| A `LICENSE` file with an open license | Public |
| `license` in `package.json` is a license name such as `MIT` or `Apache-2.0` | Public |
| `license` is `UNLICENSED`, or the `LICENSE` file says "All rights reserved" | Internal |
| Remote on a company Git server, or a private repository | Internal |
| `license` is `ISC` with no `LICENSE` file | Nothing: npm fills it in by default |
| `"private": true` | Weak: it only stops publishing to npm |

When the signals agree, say what you concluded and why. When they disagree or are missing, ask.

If a command can be run safely (install, test, build, start for a few seconds), run it and note the real output, for example the local URL the dev server prints. If you cannot run it, say so in the report.

## What the files cannot tell you

Ask about these when the README needs them and you did not find a definite answer:

| Item | Needed for | Ask (adapt to the user's language) |
| --- | --- | --- |
| Project type | everything | "Is this a web app, a course example for students, a portfolio piece for employers, or a backend API?" |
| Project status | `title` | "What is the status: completed, maintained, a practice project, or no longer maintained?" |
| Live URL | `demo` | "Is there a live version? If so, what is the URL, and is it staying online? Can people outside the company network open it?" |
| Test account | `features` or `demo` | "Do you want to share a test account? Only share one that can view but not change data. Otherwise I will leave it out." |
| Screenshots | `demo` | "I found these images: … Can I use them as screenshots? If not, should I leave screenshots out for now?" |
| Public or internal | `license`, `title` | "Will people outside your team read this, or is it only for internal use?" |
| License (public projects only) | `license` | "There is no license, so others may not legally use this code. Do you want to allow reuse (for example MIT), or keep all rights reserved? I will not add a LICENSE file without your answer." |
| Author credit and contact | `license` | Public: "How should the author be credited, and how can people reach you (GitHub, website, email)?" Internal: "Which team owns this, and where should people ask questions (a team channel, an issue tracker)?" |
| Portfolio: My Role | `features` | "Which parts did you build yourself? Features, pages or APIs, as specific as you can." |
| Portfolio: Design Decisions | `tech` | "What is one decision you made on purpose (a framework, a data structure) and why?" |
| Course: unit | `features` | "Which course and which week or unit is this example for?" |
| Course: learning objectives | `features` | "What should a student be able to do after finishing this example?" |
| Versions of services the project needs | `install`, `tech` | "Which PostgreSQL version does this run on?" Ask when a database, cache or other service is required but no file states its version; never guess one. |
| API documentation | `demo` | "Where is the API documentation: a local path such as /api-docs, an online page, or none yet?" |
| Anything contradictory | wherever | "The README says npm but the project has pnpm-lock.yaml. Which one is right?" |

Rules for asking:

- Ask everything in **one message**, numbered, shortest first. Mark which ones are optional.
- Put what you already know next to the question so the user only confirms ("I found MIT in package.json but no LICENSE file — keep MIT?").
- Do not ask what the files already answer.
- If an optional item stays unanswered, leave that part out. Never fill it with a guess, a sample value or a blank.
