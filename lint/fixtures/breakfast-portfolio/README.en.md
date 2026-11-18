# Corner Breakfast Online Ordering (Portfolio)

A mobile ordering page I built for Corner Breakfast: customers order first and pick up at the shop.

Status: completed

## Demo

[Corner Breakfast online ordering](https://example.com/breakfast-order/)

## Screenshots

![Order page: category tabs at the top, dishes and prices below](docs/images/order-page.png)

## Features

- [x] Browse the menu and prices by category
- [x] Pick a pickup time and place the order

## My Role

- Built entirely by me, including the screen design and front-end code

## Tech Stack

- Vue 3
- Vite 6

## Design Decisions

- Cart totals are calculated in one function: the screens only display them, so a wrong total means checking one place; I gave up adding totals inside each component

## Getting Started

### Requirements

- Node.js 22 or later
- pnpm 10

### Installation

```bash
git clone https://github.com/zaocan/breakfast-portfolio.git
cd breakfast-portfolio
pnpm install
cp .env.example .env
pnpm dev
```

Open http://localhost:5173 in your browser; once you see the menu, it is running.

## Environment Variables

| Name | Required | Purpose | Where to get it |
| ---- | ---- | ---- | ---- |
| `VITE_API_BASE_URL` | Yes | Address of the ordering API | Where the ordering API runs |

## Project Structure

```text
src/     Pages, components and cart totals
public/  Static files served without bundling
docs/    Screenshots used in this README
```

## Author

是 Ray 不是 Array | hello@example.com

## License

MIT; see [LICENSE](LICENSE) for the full text.
