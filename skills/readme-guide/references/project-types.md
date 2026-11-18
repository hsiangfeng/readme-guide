# The four project types

The skeleton and the headings are the same for all four. License is never required by type: it is required when the project has a `LICENSE` file or a license in `package.json` (`LIC001`), and internal projects may leave it out. What changes is which sections are required and which extra sections a type adds. The authoritative lists are in `rules/project-types.json`; this file explains them.

## How to tell them apart

| Type | Strong signals | Weak signals |
| --- | --- | --- |
| `web-app` | Front-end framework (Vue, React, Svelte, Next, Nuxt…), pages, a deploy target | Default when nothing else fits |
| `course-example` | User says it is for a class; `start`/`finish` folders or branches; lesson numbers in folder names | Comments written for learners, very small scope |
| `portfolio` | User says it is for job hunting or showing clients | Personal project with a polished UI — **not enough on its own, ask** |
| `backend-api` | Server framework (Express, Fastify, Koa, NestJS, Hono…) and no front end; database migrations; OpenAPI setup | `curl` examples in existing docs |

The checker guesses the type too (from section headings and dependencies) and prints what it based the guess on. Pass `--type` once you know.

## web-app — Web app

- **Required:** Features, Tech Stack, Getting Started with Requirements and Installation, Author.
- **Expected:** Demo and/or Screenshots (warning `IMG005` without either), Environment Variables when there is a `.env.example`, License for public projects (`LIC001`).
- **Write more about:** what the reader sees first (live link and screenshots near the top); a read-only test account or "sign up to try it"; a warning that front-end variables such as `VITE_*` are public.
- **Write less about:** exact patch versions of every package; CI details (link to them instead).

## course-example — Course example

- **Required:** Learning Objectives, Tech Stack, Getting Started with Requirements and Installation, Usage, Project Structure, Author. License for public projects (`LIC001`); students need to know whether they may reuse the code.
- **Type-specific:** Course Unit (warning `TYPE-CS002` if the course and unit are not named anywhere), Starter and Solution.
- **Write more about:** what the student will be able to do afterwards; which lesson it belongs to and which tool versions the lesson used; how to switch between starter and solution; what each step should produce ("you should now see…"); whether students may reuse the code (license).
- **Write less about:** alternatives ("you could also use yarn") — give one way only; contribution process and roadmap; explanations that belong in the lesson itself.
- **Usage** here means "open this file, run this, look for that result".

## portfolio — Portfolio

- **Required:** Screenshots, Features, Tech Stack, Getting Started with Requirements and Installation, Author. License for public projects (`LIC001`).
- **Type-specific:** My Role (`TYPE-PF001`), Design Decisions (`TYPE-PF002`).
- **Write more about:** the one-liner, demo and screenshots at the very top (the reader is often an interviewer with little time); in a team project exactly which features, pages or APIs the user built, ideally linking pull requests; one or two decisions and their trade-offs; a concrete problem and how it was solved; honest known limitations.
- **Write less about:** popularity badges (`IMG007`); long setup instructions (keep them, but short).
- If the user used AI tools while building, and wants to mention it, write "AI-assisted tools" — no product names.

## backend-api — Backend API

- **Required:** API Documentation (reported by `TYPE-API001` if its location is not given anywhere), Features (as an endpoint overview), Tech Stack, Getting Started with Requirements and Installation, Usage, Environment Variables, Project Structure, Author. License for public projects (`LIC001`).
- **Type-specific:** Database Setup (error `TYPE-API002` when the project has migrations or an ORM but the README has no setup commands), a request example (warning `TYPE-API003`).
- **Write more about:** where the API documentation is (local URL and online URL); a short table of main endpoints (method, path, purpose, login required); how authentication works and how to get a test token; one complete request in a ```bash block and its response in a separate ```json block; database type and version, then create / migrate / seed commands, one code block each; every environment variable, marked required or optional.
- **Write less about:** screenshots (not needed); the full specification of every endpoint (link to the docs).

## Section order for type-specific sections

Every section belongs to a block (`rules/headings.json`), and blocks keep their order. In practice:

- API Documentation sits with Demo and Screenshots.
- Learning Objectives, Course Unit and My Role sit with Features.
- Design Decisions sits with Tech Stack.
- Database Setup, Starter and Solution, and Usage sit with Getting Started — **before** Environment Variables.
