# CLAUDE.md

Instructions for AI coding agents (Claude Code or similar) working on this repository. Read this before making changes.

## What this project is

A UX audit tool with a Vite + React frontend. The user provides a **screenshot or a public URL**, context, and selected evaluation criteria; a multimodal LLM returns a structured JSON audit (strengths, severity-tagged issues, roadmap).

- **Screenshot mode:** fully client-side — LLM calls go from `src/services/*` directly to Gemini or OpenRouter using `VITE_*` keys.
- **URL mode:** the frontend calls Vercel serverless routes in `api/` to capture a screenshot (ScreenshotOne) and scrape structural HTML; the audit image and extra context are then sent to the LLM from the browser as in screenshot mode.

For project setup, scripts, and the full repo layout, see `README.md`.

## Two distinct meanings of "skill" — do not confuse them

- **Developer-side skills** in `.claude/skills/` and `.agents/skills/` (locked via `skills-lock.json`): these guide *you* when writing code in this repo (frontend-design, react-best-practices, accessibility, vite, etc.). Treat them as conventions for your own work.
- **Runtime UX criteria** in `src/guidelines/index.js` and `src/data/criteriaMeta.js`: these are the heuristic packs the auditing LLM applies to the user's screenshot. They are plain prompt text, not Claude skills.

When the user says "add a new skill for the agent to use during analysis," they almost always mean a **runtime criterion**, not a `.claude/skills/` entry. See the three-file procedure in `README.md`.

## Conventions to follow

- The audit response is contractually JSON-only. Do not loosen the schema in `src/prompts/systemUxAudit.js` without also updating `normalizeAudit` in `App.jsx` and the result components under `src/components/output/results/`.
- Provider adapters must return an OpenAI-shaped response (`choices[0].message.content`) so `aiClient.js` and `App.jsx` can treat them uniformly. If you add a third provider, mirror that shape.
- Keep `VITE_*` keys out of any server-side code path or commits. Server-only secrets (e.g. `SCREENSHOTONE_API_KEY`) belong in env without the `VITE_` prefix and are read only from `api/`. `.env.local` is gitignored; `.env.example` is the template.
- Tailwind v4 is in use — class names are JIT-compiled from sources; no `tailwind.config.js` is required for default usage.
- **Do not commit unless the user explicitly asks.** The user reviews files before commits.

## Common tasks and where they live

| Task | File(s) |
| --- | --- |
| Tweak the system prompt or output schema | `src/prompts/systemUxAudit.js` (+ `normalizeAudit` in `App.jsx`) |
| Add/edit a UX criterion | `src/data/criteriaMeta.js`, `src/guidelines/index.js`, `src/components/input/CriteriaField.jsx` |
| Add or swap an LLM provider | `src/services/` (new adapter) + `src/services/aiClient.js` (router) |
| Change loading copy or steps | `LOADING_STEPS` in `src/App.jsx` |
| Adjust how results render | `src/components/output/results/` |
| URL capture / scrape behavior | `api/screenshot.js`, `api/scrape.js`, `api/_lib/`, `src/utils/url.js`, `src/utils/formatStructuralContext.js` |
| URL vs screenshot orchestration | `App.jsx` (`hasSource`, `runAnalysis`), `SourceField`/`UrlInput` |

## Known limitations

- URL mode requires `npx vercel dev` (port 3000) alongside `npm run dev` locally, plus `SCREENSHOTONE_API_KEY`. Screenshot mode only needs Vite.
- LLM API keys (`VITE_*`) are exposed to the browser. Acceptable for local/dev use; for production, proxy LLM calls server-side.
- No automated tests yet.
