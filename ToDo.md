# ToDo

## Styling

- [ ] **Dark mode follows the OS only.** Tokens flip under
      `prefers-color-scheme: dark` (`frontend/src/index.css`); there is no in-app
      toggle. Add one only if users ask — it needs a persisted preference and a
      `data-theme` override on `:root`.
- [ ] **`field-sizing: content` is Chromium-only** (Sept 2026). Firefox/Safari
      fall back to the fixed `min-h-40 sm:min-h-56` textarea, which scrolls
      internally on long entries. Replace with a small auto-resize effect if
      that fallback bothers anyone.

## Bugs/Fixes

- [ ] **Anonymous reflection is not attached on later sign-in.** "Sign in to
      keep this entry" saves the entry text (`createJournalEntry`) but the AI
      reflection shown on screen is not stored with it — the API has no endpoint
      to attach an existing response. Needs `POST /api/journal/<id>/interaction`
      or a `claude_response` field on entry creation.
- [ ] **Journal history fetches every entry on each month change** and filters
      client-side (`ProfilePage.tsx`). Fine at hobby scale; add `?year=&month=`
      to `GET /api/journal/` once users have hundreds of entries.

## MVP Features

- [ ] **Frontend has no component test runner.** `npm test` runs Node's
      built-in runner over `frontend/tests/` (pure helpers only:
      `src/lib/entries.ts`). Page/component behaviour (draft persistence,
      inline reflection, locked help cards) is verified by build + manual
      screenshots, not tests. Add Vitest + Testing Library when the UI
      stabilises; coverage for the frontend is currently unmeasured.

## IceBox Features

- [ ] **Prerender or SSR the landing page.** The app is a Vite SPA: crawlers get
      an empty `<div id="root">` and must execute JS to see any content. Google
      usually renders it, but Bing and social scrapers often do not. Static
      prerendering of `/` (e.g. `vite-plugin-prerender`, or a hand-written static
      hero in `index.html`) would put the real copy in the initial HTML.
- [ ] **Per-route meta tags.** All routes currently share one `index.html` head,
      so `/journal` inherits the homepage canonical. Handled for now by
      `X-Robots-Tag: noindex` on every non-homepage path. If public,
      indexable routes are ever added (blog, about, pricing), add
      `react-helmet-async` or move to SSR and update `INDEXABLE_PATHS`.
- [ ] **Content for ranking.** The homepage has one `<h1>` and two sentences of
      body copy. Meta/schema work is done, but there is no substantive content
      to rank for journaling/mental-wellbeing queries.
- [ ] **Crisis-content detection.** The footer now carries a 988 / helpline
      line at all times, but nothing inspects entry text for risk language and
      surfaces help more prominently. Belongs in the backend prompt/response
      pipeline, not the UI alone.
