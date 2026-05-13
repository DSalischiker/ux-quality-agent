# UX Quality Agent

An AI-assisted UX auditor. The user provides a screenshot (URL input is planned but not yet wired) plus a short context describing the screen, picks one or more evaluation criteria (Nielsen heuristics, WCAG accessibility, visual hierarchy, copy clarity, mobile readiness, etc.), and the agent returns a structured audit: strengths, severity-tagged issues, and a small actionable roadmap.

The frontend is a Vite + React 19 single-page app. The audit is performed by a multimodal LLM (Gemini by default, OpenRouter as fallback) called directly from the browser using the user's API key.

---

## Stack

- **Build:** Vite 8
- **UI:** React 19, Tailwind CSS v4 (via `@tailwindcss/vite`)
- **LLM providers:** Google Gemini and OpenRouter (any vision-capable model). Provider selection and failover is handled in `src/services/aiClient.js`.

## Setup

```bash
npm install
cp .env.example .env.local   # then fill in at least one provider's API key
npm run dev
```

Open the printed local URL, drop a PNG/JPEG/WebP screenshot, write a short context, pick criteria, and run the analysis. `Cmd/Ctrl + Enter` triggers it from the keyboard.

## Environment variables

All variables are `VITE_*` because they ship to the browser bundle (the request is made client-side). For production, route requests through a backend proxy and keep real keys server-side.

| Variable | Purpose |
| --- | --- |
| `VITE_AI_PROVIDER` | `gemini` or `openrouter`. Sets the preferred provider; the other is used as fallback. |
| `VITE_GEMINI_API_KEY` / `VITE_GEMINI_MODEL` / `VITE_GEMINI_BASE_URL` | Gemini config. |
| `VITE_OPENROUTER_API_KEY` / `VITE_OPENROUTER_MODEL` / `VITE_OPENROUTER_BASE_URL` | OpenRouter config. |
| `VITE_OPENROUTER_HTTP_REFERER` / `VITE_OPENROUTER_APP_NAME` | OpenRouter attribution headers. |

## Scripts

- `npm run dev` — local dev server with HMR
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
  components/
    input/                     Source/context/criteria fields + analyze CTA
    output/                    Empty / loading / error / results views
    Topbar.jsx, TweaksPanel.jsx
.claude/ .agents/              Claude Code skills used when developing on this repo
skills-lock.json               Lockfile for those developer-side skills
AGENTS.md                      Instructions for AI agents working on this codebase
```

## Runtime flow

1. User uploads a screenshot, writes context, and toggles criteria in `InputPane`.
2. `App.jsx` collects the selected criterion keys and asks `guidelines/index.js` for their guideline text.
3. `prompts/systemUxAudit.js` builds the system message: role description, strict JSON schema, output constraints, and the rendered criteria.
4. `services/aiClient.js` sends `{ system, user text + image }` to the preferred provider, falling back to the other one on error.
5. The response (JSON) is parsed, normalized, and rendered as Scorecard + Issues + Strengths + Roadmap.

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
