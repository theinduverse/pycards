# PyCards

Learn Python one card at a time. Each topic is a deck of small cards (concept, try it, predict, challenge, recap), and code runs in the browser via [Pyodide](https://pyodide.org). There's no backend: the site is a static export.

## Develop

```bash
npm install
npm run dev
```

## Adding content

Decks live in `src/content/decks/`, one file per deck, typed by `src/content/types.ts`. To add one, write the file and replace its "planned" entry in `src/content/index.ts`.

Challenge `tests` are Python run after the learner's code in the same namespace. `_output` holds everything their code printed. Use `assert condition, "message shown to the learner"`.

## How it works

- `public/pyodide-worker.js`: loads Pyodide from the jsDelivr CDN and runs code off the main thread.
- `src/lib/python.ts`: talks to the worker and restarts it if a run takes more than 5s.
- `src/lib/progress.ts`: progress and the streak, stored in localStorage.

## Deploy (free)

`npm run build` writes a static site to `out/`.

**Vercel (recommended):** push this repo to GitHub, import it at vercel.com/new, and set **Root Directory** to `python-cards`. Every push to `main` then redeploys automatically.

**Cloudflare Pages:** set build command `npm run build`, output directory `out`, and root directory `python-cards`.
