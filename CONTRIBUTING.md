# Contributing to Friendly Words API

First off, thanks for taking the time to contribute!

Please discuss any change you wish to make via a [GitHub issue](https://github.com/RickBr0wn/friendly-words-api/issues) before opening a pull request. This keeps work coordinated and avoids duplicated effort.

## Code of Conduct

This project adheres to the [Contributor Covenant v1.4](http://contributor-covenant.org/version/1/4). By participating you are expected to uphold this standard. Please report unacceptable behavior to [issues@rickbrown.co.uk](mailto:issues@rickbrown.co.uk).

## Development Setup

### Prerequisites

- Node.js ≥ 20 (use `.nvmrc` with `nvm use` to match the project version)
- [Netlify CLI](https://docs.netlify.com/cli/get-started/) — `npm i -g netlify-cli`

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

This starts a local dev server at `http://localhost:8888` via the Netlify CLI. The function reloads automatically on save.

### Verify your changes

```bash
npm run typecheck   # TypeScript type checking
npm run lint        # ESLint
npm run format:check  # Prettier formatting
```

All three must pass before submitting a pull request.

## Pull Request Process

1. Remove any install or build artefacts before submitting.
2. Update `README.md` with details of any interface changes — new query parameters, response shape changes, or notable behaviour differences.
3. Bump the version in `package.json` following [SemVer](https://semver.org).
4. A pull request requires sign-off from two maintainers before it can be merged. If you lack merge permissions, request that the second reviewer merges on your behalf.

## Attribution

This contributing guide is adapted from the [Contributor Covenant](http://contributor-covenant.org), version 1.4.
