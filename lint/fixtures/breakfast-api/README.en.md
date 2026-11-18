# Corner Breakfast Ordering API

The back-end API that serves the menu and orders to the ordering page.

Status: maintained

## API Documentation

- Local: open `http://localhost:3000/api-docs` after starting the server
- Online: [Ordering API docs](https://api.example.com/docs)

## Features

- [x] Look up the menu and prices
- [x] Create orders and check their status
- [ ] Pay online (in progress)

## Tech Stack

- Express 5
- Prisma 6
- PostgreSQL 16

## Getting Started

### Requirements

- Node.js 22 or later
- pnpm 10
- PostgreSQL 16

### Installation

```bash
git clone https://github.com/zaocan/breakfast-api.git
cd breakfast-api
pnpm install
cp .env.example .env
```

## Database Setup

Create the tables and load sample data:

```bash
pnpm db:migrate
pnpm db:seed
```

## Usage

Start the server:

```bash
pnpm dev
```

Send a request:

```bash
curl http://localhost:3000/api/menu
```

A response like this means it is running:

```json
{
  "items": [{ "id": 1, "name": "Ham egg crepe", "price": 45 }]
}
```

## Environment Variables

| Name | Required | Purpose | Where to get it |
| ---- | ---- | ---- | ---- |
| `DATABASE_URL` | Yes | PostgreSQL connection URL | Built from your own database login |
| `PORT` | No | Port the API listens on | Leave empty to use 3000 |

## Project Structure

```text
src/     API routes and order handling
prisma/  Table definitions and sample data
```

## Author

是 Ray 不是 Array | hello@example.com

## License

MIT; see [LICENSE](LICENSE) for the full text.
