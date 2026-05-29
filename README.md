# UX Quality Agent

An AI-assisted UX auditor. The user provides a screenshot **or a public URL**, plus a short context describing the screen, picks one or more evaluation criteria (Nielsen heuristics, WCAG accessibility, visual hierarchy, copy clarity, mobile readiness, etc.), and the agent returns a structured audit: strengths, severity-tagged issues, and a small actionable roadmap.

The frontend is a Vite + React 19 single-page app. The audit is performed by a multimodal LLM (Gemini by default, OpenRouter as fallback) called directly from the browser using the user's API key. URL mode uses Vercel serverless API routes to capture a screenshot and scrape structural HTML before the audit runs.

---

## Stack

- **Build:** Vite 8
- **UI:** React 19, Tailwind CSS v4 (via `@tailwindcss/vite`)
- **LLM providers:** Google Gemini and OpenRouter (any vision-capable model). Provider selection and failover is handled in `src/services/aiClient.js`.
- **URL capture (optional):** Vercel serverless functions in `api/` — screenshot via ScreenshotOne, HTML scrape for structural context.

## Setup

### 1. Install dependencies

```bash
npm install
cp .env.example .env.local
```

Fill in `.env.local`:

- **Required for any audit:** at least one LLM provider key (`VITE_GEMINI_API_KEY` and/or `VITE_OPENROUTER_API_KEY`).
- **Required for URL mode:** `SCREENSHOTONE_API_KEY` (server-only; never prefix with `VITE_`).

### 2. Run locally

Local dev uses **two processes** when you want URL input. Vite serves the React app and proxies `/api/*` to the Vercel dev server on port 3000 (see `vite.config.js`).

**Terminal 1 — API routes (needed for URL mode):**

```bash
npx vercel dev
```

On first run, the CLI may ask you to link or create a Vercel project; accept the defaults for local development. Keep this process on port **3000**.

**Terminal 2 — frontend:**

```bash
npm run dev
```

Open **http://localhost:5173** (Vite's default port).

| Mode | What to run | Env vars |
| --- | --- | --- |
| Screenshot only | `npm run dev` | LLM keys (`VITE_*`) |
| Screenshot + URL | `npx vercel dev` **and** `npm run dev` | LLM keys + `SCREENSHOTONE_API_KEY` |

Drop a PNG/JPEG/WebP screenshot or paste a URL, write a short context, pick criteria, and run the analysis. `Cmd/Ctrl + Enter` triggers it from the keyboard.

If URL mode fails with a proxy or connection error, confirm `npx vercel dev` is running on port 3000 before starting Vite.

## Environment variables

Client-side variables use the `VITE_*` prefix — they are bundled into the browser. Server-only variables (no prefix) stay on Vercel API routes and are never sent to the client.

| Variable | Scope | Purpose |
| --- | --- | --- |
| `VITE_AI_PROVIDER` | Client | `gemini` or `openrouter`. Preferred provider; the other is used as fallback. |
| `VITE_GEMINI_API_KEY` / `VITE_GEMINI_MODEL` / `VITE_GEMINI_BASE_URL` | Client | Gemini config. |
| `VITE_OPENROUTER_API_KEY` / `VITE_OPENROUTER_MODEL` / `VITE_OPENROUTER_BASE_URL` | Client | OpenRouter config. |
| `VITE_OPENROUTER_HTTP_REFERER` / `VITE_OPENROUTER_APP_NAME` | Client | OpenRouter attribution headers. |
| `SCREENSHOTONE_API_KEY` | Server | ScreenshotOne access key for `/api/screenshot` and rendered HTML in `/api/scrape`. |

For production, keep LLM keys behind a backend proxy as well; URL capture already runs server-side on Vercel.

## Scripts

- `npm run dev` — Vite dev server with HMR (proxies `/api` → `http://127.0.0.1:3000`)
- `npx vercel dev` — local Vercel runtime for `api/` routes (port 3000)
- `npm run build` — production build to `dist/`
- `npm run preview` — preview the built bundle
- `npm run lint` — ESLint

## Repository layout

```
src/
  App.jsx                      Orchestrates state, builds the request, calls the LLM
  prompts/
    systemUxAudit.js           Assembles the system prompt + JSON schema contract
  guidelines/
    index.js                   The actual heuristic text fed into the prompt per criterion
  data/
    criteriaMeta.js            Display labels for each criterion key
  services/
    aiClient.js                Provider router with failover
    gemini.js                  Gemini chat completion adapter
    openRouter.js              OpenRouter chat completion adapter
  utils/
    buildAuditRequest.js       Builds multimodal chat messages for the audit
    formatStructuralContext.js Formats scraped HTML metadata for the user prompt
    url.js                       Client-side URL validation
  components/
    input/                     Source/context/criteria fields + analyze CTA
    output/                    Empty / loading / error / results views
    Topbar.jsx, TweaksPanel.jsx
api/
  screenshot.js                GET /api/screenshot — full-page capture via ScreenshotOne
  scrape.js                    GET /api/scrape — HTML + structural assessment
  _lib/                        Shared URL validation, scraping, ScreenshotOne helpers
vercel.json                    SPA rewrites + Vercel deployment config
vite.config.js                 Dev proxy: /api → http://127.0.0.1:3000
.claude/ .agents/              Claude Code skills used when developing on this repo
skills-lock.json               Lockfile for those developer-side skills
AGENTS.md                      Instructions for AI agents working on this codebase
```

## Runtime flow

**Screenshot mode**

1. User uploads a screenshot, writes context, and toggles criteria in `InputPane`.
2. `App.jsx` collects the selected criterion keys and asks `guidelines/index.js` for their guideline text.
3. `prompts/systemUxAudit.js` builds the system message: role description, strict JSON schema, output constraints, and the rendered criteria.
4. `services/aiClient.js` sends `{ system, user text + image }` to the preferred provider, falling back to the other one on error.
5. The response (JSON) is parsed, normalized, and rendered as Scorecard + Issues + Strengths + Roadmap.

**URL mode** (requires `npx vercel dev` + `SCREENSHOTONE_API_KEY`)

1. User enters a public URL; `utils/url.js` validates it client-side.
2. `App.jsx` calls `/api/screenshot` and `/api/scrape` in parallel (proxied to Vercel dev locally).
3. The screenshot becomes the audit image; scraped structure is appended to the user message via `formatStructuralContext`.
4. Steps 2–5 of screenshot mode follow unchanged.

## Adding a new UX evaluation criterion

A criterion is the runtime "skill" the auditing LLM applies. It is defined in three places that must stay in sync. The system prompt itself does *not* need editing — it renders whatever criteria the user picked.

1. **`src/data/criteriaMeta.js`** — add the display label:
   ```js
   gestalt: { label: 'Gestalt principles' },
   ```

2. **`src/guidelines/index.js`** — add the guideline lines under the same key. These are inserted verbatim into the system prompt:
   ```js
   gestalt: [
     'Proximity: elements placed close together are perceived as related.',
     'Similarity: consistent style should reflect consistent meaning.',
     // ...
   ],
   ```

3. **`src/components/input/CriteriaField.jsx`** — add the toggle button so the user can select it:
   ```js
   { key: 'gestalt', label: 'Gestalt principles' },
   ```

Keep the guideline lines as short imperative sentences — they are concatenated into the prompt, so verbosity costs tokens on every request.

> **Heads up:** the `.claude/skills/` and `.agents/skills/` directories are Claude Code skills used while *developing* this project. They are not used at runtime by the auditing LLM. Don't confuse them with the criteria above.
