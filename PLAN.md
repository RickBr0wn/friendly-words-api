Friendly Words API — v2 Rewrite Plan

Context

This is a minimal Netlify serverless function that picks a random predicate (adjective/verb) and object (noun) from the friendly-words npm package (open-source word lists from Glitch)
and returns them concatenated. The goal of v2 is to:

1.  Remove the friendly-words npm dependency — bundle the word lists as local JSON files instead
2.  Upgrade to the Netlify Functions v2 API (Web Standard Request/Response instead of the old Lambda-style handler)
3.  Fix a bug: current handler returns statusCode: 302 (a redirect), should be 200
4.  Modernize the toolchain (TypeScript 5/6, ESLint 9 flat config, Prettier 3, remove unused dotenv and ts-node)
5.  Optionally add query param support (?count=3, ?separator=-)

---

File Structure Changes

Before:
functions/friendly-words.ts ← old-style handler
.eslintrc.js ← old ESLint config

After:
netlify/functions/friendly-words.ts ← v2 handler (new default path)
data/predicates.json ← bundled word list (~1500 strings)
data/objects.json ← bundled word list (~1500 strings)
eslint.config.ts ← ESLint 9 flat config

Delete: functions/, .eslintrc.js

---

Step 1 — Extract Word Data

The friendly-words package is MIT-licensed. Copy its word lists into the project as JSON files so we own the data and remove the runtime dependency.

How to extract (run once before removing the package):
node -e "const fw = require('./node_modules/friendly-words'); const fs = require('fs'); fs.mkdirSync('data', {recursive:true}); fs.writeFileSync('data/predicates.json',
JSON.stringify(fw.predicates, null, 2)); fs.writeFileSync('data/objects.json', JSON.stringify(fw.objects, null, 2));"

Or download from the GitHub raw URLs (glitchdotcom/friendly-words) — two JSON arrays of strings.

---

Step 2 — New Function Handler

netlify/functions/friendly-words.ts

import type { Config, Context } from '@netlify/functions'
import predicates from '../../data/predicates.json' with { type: 'json' }
import objects from '../../data/objects.json' with { type: 'json' }

interface WordPair {
predicate: string
object: string
phrase: string
}

function pick<T>(arr: T[]): T {
return arr[Math.floor(Math.random() * arr.length)]
}

function buildPair(separator: string): WordPair {
const predicate = pick(predicates)
const object = pick(objects)
return { predicate, object, phrase: `${predicate}${separator}${object}` }
}

export default async (req: Request, \_context: Context): Promise<Response> => {
const url = new URL(req.url)
const count = Math.min(Math.max(parseInt(url.searchParams.get('count') ?? '1', 10), 1), 10)
const separator = url.searchParams.get('separator') ?? ' '

const pairs: WordPair[] = Array.from({ length: count }, () => buildPair(separator))
const body = count === 1 ? pairs[0] : pairs

return new Response(JSON.stringify(body), {
status: 200,
headers: { 'Content-Type': 'application/json' },
})
}

export const config: Config = {
path: '/\*',
}

Key points:

- with { type: 'json' } = TC39 Import Attributes — requires "module": "NodeNext" in tsconfig
- The config export handles routing — no [[redirects]] needed in netlify.toml
- Single call returns an object; ?count=N returns an array (capped at 10)
- ?separator=- gives slug-style output like brave-mountain

---

Step 3 — netlify.toml

[build]
publish = "."

[functions]
node_bundler = "esbuild"

- Remove [build] functions = "functions" — netlify/functions/ is the v2 default, auto-detected
- Remove [[redirects]] — routing handled by the config export in the function
- node_bundler = "esbuild" — critical: esbuild handles TypeScript + ESM natively without a separate compile step

---

Step 4 — tsconfig.json

{
"compilerOptions": {
"target": "ES2022",
"module": "NodeNext",
"moduleResolution": "NodeNext",
"lib": ["ES2022"],
"resolveJsonModule": true,
"strict": true,
"noEmit": true,
"skipLibCheck": true,
"types": ["node"]
},
"include": ["netlify/**/*", "eslint.config.ts"],
"exclude": ["node_modules"]
}

Key changes from current:

- "module": "NodeNext" — required for ESM-style imports and Import Attributes to typecheck
- "noEmit": true — TypeScript only type-checks; esbuild does the actual bundling
- "strict": true — replaces the loose eslint rules suppressing any
- "resolveJsonModule": true — required for the JSON imports

---

Step 5 — eslint.config.ts

import tseslint from 'typescript-eslint'
import prettierConfig from 'eslint-config-prettier'
import prettierPlugin from 'eslint-plugin-prettier/recommended'

export default tseslint.config(
{ ignores: ['node_modules/**', 'data/**'] },
...tseslint.configs.recommended,
prettierConfig,
prettierPlugin,
{
rules: {
'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
},
}
)

Delete .eslintrc.js.

---

Step 6 — package.json

{
"name": "friendly-words-api",
"version": "2.0.0",
"description": "Netlify Functions v2 API returning random friendly word pairs",
"author": "Rick Brown",
"license": "MIT",
"type": "module",
"scripts": {
"dev": "netlify dev",
"typecheck": "tsc --noEmit",
"lint": "eslint netlify/",
"lint:fix": "eslint netlify/ --fix",
"format": "prettier --write .",
"format:check": "prettier --check ."
},
"devDependencies": {
"@netlify/functions": "^5.2.0",
"@types/node": "^22.0.0",
"eslint": "^9.0.0",
"eslint-config-prettier": "^10.0.0",
"eslint-plugin-prettier": "^5.0.0",
"prettier": "^3.0.0",
"typescript": "^5.8.0",
"typescript-eslint": "^8.0.0"
}
}

Removed: friendly-words, dotenv, ts-node, nodemon, old ESLint packages
Added: @netlify/functions (types), typescript-eslint (unified package), updated all major versions
"type": "module" — declares ESM project, required since @netlify/functions is ESM

---

Step 7 — .prettierrc

Change jsxBracketSameLine → bracketSameLine (Prettier 3 rename, old key silently ignored).

---

Netlify Hosting Considerations

- No breaking change to the URL — the endpoint https://friendly-words-api.netlify.app/ continues to work. The config: { path: '/\*' } export replaces the [[redirects]] rule but
  produces identical routing behavior.
- esbuild bundler — must be declared in netlify.toml. Without it, Netlify may use the legacy zisi bundler which handles ESM differently.
- No node_modules deployed — Netlify's build system installs deps during CI. Since we're moving all deps to devDependencies, the runtime bundle only contains what esbuild inlines. The
  friendly-words data JSON is bundled at build time, not fetched at runtime.
- Node version — Netlify defaults to Node 18 for functions. ES2022 target is fully supported. Consider adding a .nvmrc or [functions] node_bundler version pin if you want Node 22.
- Cold starts — unchanged; this function has no I/O, so it will be as fast as before.

---

Migration Execution Order

1.  npm install (populate node_modules one last time)
2.  Extract word lists → data/predicates.json, data/objects.json
3.  Create netlify/functions/friendly-words.ts
4.  Replace netlify.toml
5.  Replace tsconfig.json
6.  Replace .prettierrc
7.  Delete functions/, .eslintrc.js
8.  Replace package.json
9.  Delete package-lock.json, node_modules/
10. npm install (fresh lockfile)
11. npm run typecheck → should pass clean
12. npm run lint → should pass clean
13. npm run dev → test locally

---

Verification

Netlify Hosting Considerations

- No breaking change to the URL — the endpoint https://friendly-words-api.netlify.app/ continues to work. The config: { path: '/\*' } export replaces the [[redirects]] rule but
  produces identical routing behavior.
- esbuild bundler — must be declared in netlify.toml. Without it, Netlify may use the legacy zisi bundler which handles ESM differently.
- No node_modules deployed — Netlify's build system installs deps during CI. Since we're moving all deps to devDependencies, the runtime bundle only contains what esbuild inlines. The
  friendly-words data JSON is bundled at build time, not fetched at runtime.
- Node version — Netlify defaults to Node 18 for functions. ES2022 target is fully supported. Consider adding a .nvmrc or [functions] node_bundler version pin if you want Node 22.
- Cold starts — unchanged; this function has no I/O, so it will be as fast as before.

---

Migration Execution Order

1.  npm install (populate node_modules one last time)
2.  Extract word lists → data/predicates.json, data/objects.json
3.  Create netlify/functions/friendly-words.ts
4.  Replace netlify.toml
5.  Replace tsconfig.json
6.  Replace .prettierrc
7.  Delete functions/, .eslintrc.js
8.  Replace package.json
9.  Delete package-lock.json, node_modules/
10. npm install (fresh lockfile)
11. npm run typecheck → should pass clean
12. npm run lint → should pass clean
13. npm run dev → test locally

---

Verification

# Single word pair (default)

curl http://localhost:8888/

# → { "predicate": "...", "object": "...", "phrase": "... ..." }

# Multiple pairs

curl "http://localhost:8888/?count=3"

# → [{ ... }, { ... }, { ... }]

# Slug-style output

curl "http://localhost:8888/?count=1&separator=-"

# → { "predicate": "...", "object": "...", "phrase": "...-..." }

# Any path is handled

curl http://localhost:8888/anything/works
