# ToDo

## Styling

- [ ] No known items.

## Bugs/Fixes

- [ ] **6 pre-existing ESLint errors** in `frontend/src`: `AuthForm.tsx`,
      `authContext.tsx`, `JournalPage.tsx`, `ProfilePage.tsx`
      (`no-empty-object-type`, `no-empty-pattern`, `react-refresh` warnings).
      Present before the SEO work; no new errors introduced.
- [ ] **README deploy snippet is stale**: line ~109 shows
      `ALLOWED_HOSTS=.run.app`. Production must include both
      `mindful-companion.com` and `www.mindful-companion.com` — the www
      redirect calls `get_host()`, which raises `DisallowedHost` (HTTP 400)
      before the 301 can fire if the www host is missing.

## MVP Features

- [ ] No known items.

## IceBox Features

- [ ] **Prerender or SSR the landing page.** The app is a Vite SPA: crawlers get
      an empty `<div id="root">` and must execute JS to see any content. Google
      usually renders it, but Bing and social scrapers often do not. Static
      prerendering of `/` (e.g. `vite-plugin-prerender`, or a hand-written static
      hero in `index.html`) would put the real copy in the initial HTML.
- [ ] **Per-route meta tags.** All routes currently share one `index.html` head,
      so `/profile` inherits the homepage canonical. Handled for now by
      `X-Robots-Tag: noindex` on every non-homepage path. If public,
      indexable routes are ever added (blog, about, pricing), add
      `react-helmet-async` or move to SSR and update `INDEXABLE_PATHS`.
- [ ] **Content for ranking.** The homepage has one `<h1>` and ~20 words of
      body copy. Meta/schema work is now done, but there is no substantive
      content to rank for journaling/mental-wellbeing queries.
