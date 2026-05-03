# Friendly Words API

[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/RickBr0wn/friendly-words-api/blob/main/CONTRIBUTING.md)

A Netlify Functions v2 serverless API that returns random friendly word pairs. Perfect for generating readable file names, usernames, or project identifiers. Word lists are sourced from [Glitch's friendly-words](https://github.com/glitchdotcom/friendly-words) (MIT licensed) and bundled locally, so no runtime npm dependency.

**Live endpoint:** `https://friendly-words-api.netlify.app`

---

## API Reference

### `GET /`

Returns a single random word pair.

### Response

```json
{
  "predicate": "accepting",
  "object": "river",
  "phrase": "accepting river"
}
```

### Query Parameters

| Parameter   | Type   | Default | Description                                                                                |
| ----------- | ------ | ------- | ------------------------------------------------------------------------------------------ |
| `count`     | number | `1`     | Number of word pairs to return (capped at 10). When `count > 1` the response is an array. |
| `separator` | string | ` `     | Character(s) placed between the predicate and object in `phrase`.                          |

### Examples

#### Single pair (default)

```http
GET /
```

```json
{ "predicate": "brave", "object": "mountain", "phrase": "brave mountain" }
```

#### Multiple pairs

```http
GET /?count=3
```

```json
[
  { "predicate": "brave", "object": "mountain", "phrase": "brave mountain" },
  { "predicate": "clear", "object": "ocean", "phrase": "clear ocean" },
  { "predicate": "daring", "object": "forest", "phrase": "daring forest" }
]
```

#### Slug-style output

```http
GET /?separator=-
```

```json
{ "predicate": "swift", "object": "river", "phrase": "swift-river" }
```

#### Multiple slug-style pairs

```http
GET /?count=5&separator=-
```

```json
[
  { "predicate": "swift", "object": "river", "phrase": "swift-river" },
  { "predicate": "bright", "object": "canyon", "phrase": "bright-canyon" }
]
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 20
- [Netlify CLI](https://docs.netlify.com/cli/get-started/) (`npm i -g netlify-cli`)

### Install

```bash
git clone https://github.com/RickBr0wn/friendly-words-api
cd friendly-words-api
npm install
```

### Run locally

```bash
npm run dev
```

The Netlify CLI starts a local dev server at `http://localhost:8888`. The function is hot-reloaded on save.

---

## Scripts

| Script                 | Description                              |
| ---------------------- | ---------------------------------------- |
| `npm run dev`          | Start local dev server via Netlify CLI   |
| `npm run typecheck`    | Run TypeScript type checking (no emit)   |
| `npm run lint`         | Lint `netlify/` with ESLint              |
| `npm run lint:fix`     | Auto-fix lint issues                     |
| `npm run format`       | Format all files with Prettier           |
| `npm run format:check` | Check formatting without writing changes |

---

## Project Structure

```text
friendly-words-api/
├── netlify/
│   └── functions/
│       └── friendly-words.ts   # Serverless function handler
├── data/
│   ├── predicates.json         # 1454 adjectives/verbs (bundled from Glitch)
│   └── objects.json            # 3072 nouns (bundled from Glitch)
├── eslint.config.js            # ESLint 9 flat config
├── netlify.toml                # Netlify build & function config
├── tsconfig.json               # TypeScript config (type-check only, noEmit)
└── package.json
```

---

## Built With

- [TypeScript](https://www.typescriptlang.org) — strict type checking
- [Netlify Functions v2](https://docs.netlify.com/functions/overview/) — serverless, Web Standard `Request`/`Response` API
- [esbuild](https://esbuild.github.io) — bundler (via Netlify's build system)
- [ESLint 9](https://eslint.org) — flat config linting
- [Prettier 3](https://prettier.io) — code formatting
- Word data: [glitchdotcom/friendly-words](https://github.com/glitchdotcom/friendly-words) (MIT)

---

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## Author

**Rick Brown** — [RickBr0wn](https://github.com/RickBr0wn)

## License

MIT — see [LICENSE](LICENSE)
