# Corner Breakfast

A web page where customers order breakfast on their phone and pick it up at the shop.

Status: maintained

## Demo

[Corner Breakfast online ordering](https://zaocan.github.io/breakfast-order/)

## Screenshots

![Order page: category tabs at the top, dishes and prices below, cart button at the bottom right](docs/images/order-page.png)

## Features

- [x] Browse the menu and prices by category
- [x] Add dishes to the cart, pick a pickup time and place the order
- [ ] Pay online (in progress)

## Tech Stack

- Vue 3
- Vite 6
- Vitest 3

## Getting Started

### Requirements

- Node.js 22 or later
- pnpm 10

### Installation

```bash
git clone https://github.com/zaocan/breakfast-order.git
cd breakfast-order
pnpm install
cp .env.example .env
pnpm dev
```

Open http://localhost:5173 in your browser; once you see the menu, it is running.

### Running Tests

```bash
pnpm test
```

## Environment Variables

| Name | Required | Purpose | Where to get it |
| ---- | ---- | ---- | ---- |
| `VITE_API_BASE_URL` | Yes | Address of the ordering API | Where the ordering API runs |
| `VITE_SHOP_PHONE` | No | Shop phone number shown in the footer | Provided by the shop |

## Project Structure

```text
src/     Pages, components and API calls
public/  Files served as they are, without bundling
docs/    Screenshots used in this README
```

## Author

是 Ray 不是 Array | hello@example.com

## License

MIT; see [LICENSE](LICENSE) for the full text.
