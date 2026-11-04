# Market Operations Console

A front-end take-home implementation: a source-data dashboard and a fixture-backed streaming assistant. No real model, authentication service, database, or external market-data service is used.

## Run locally

Use Node.js 24 and npm.

```sh
npm ci
npm run dev
```

Open http://localhost:3000. No environment variables or API keys are required.

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm run start
```

For browser tests:

```sh
npx playwright install chromium
npm run test:e2e
```

Browser tests start their own server on port 3010. To test a production build, run `npm run build`, then `CI=true npm run test:e2e`.

## Try the application

1. Start in **Executive overview** for portfolio health, the revenue trend, risks, and movers.
2. Switch to **Analyst deep-dive** for the country map, radar comparison, forecast heat map, and sortable detail table.
3. Choose a region, market, product, or period. Country selection, heat-map cells, breadcrumbs, and table links share the same URL state. Reload and back/forward preserve that view.
4. Ask **“Why did Germany's revenue dip?”**. Watch the answer stream, then follow the Germany / Veltrix / March 2026 citation into the dashboard.
5. Open **Configure an alert**. Save a rule, then enable **Simulate save failure** to inspect optimistic saving and rollback.

Other useful prompts: **“Compare APAC and Europe”**, **“What's driving the forecast miss?”**, **“Forecast next year”**, **“full summary”**, and **“force error”**. The fixtures match keywords in order; unsupported questions use the supplied low-confidence fallback.

## Architecture and state

```text
Canonical JSON → server page → typed dataset prop → dashboard selectors → charts/tables
                                     ↑
                          URL selection and filters
                                     ↑
                               citation links

Server-only answer fixtures → POST /api/chat → typed SSE parser → local conversation state

Alert form → Zod validation → optimistic local state → mock save → localStorage
                                                         └ failure → rollback
```

The static dataset is loaded by the server page and serialized once to the client. It is bundled source data, so there is no fetching/cache library or revalidation layer. Answer fixtures remain behind the route handler and are not passed to the browser.

URL state owns region, market, product, period, audience mode, map metric, comparisons, and source-status filtering. `useSearchParams` reads that state; native history updates avoid refetching the unchanged dataset. Unknown IDs and unsupported periods fall back to valid selections. A selected market determines its region.

Conversation turns, composer input, table sort, heat-map keyboard focus, and unsaved form values are local React state. Alerts persist only in this browser. There is no shared persistence or notification delivery.

Shared styling is in `src/app/console.css`; dashboard and assistant styles are isolated in `dashboard.css` and `assistant.css`. Feature components live under `src/components/`; calculations, URL parsing, streaming, and alert rules live under `src/lib/`. There are no generic repositories, service containers, global stores, or chart frameworks layered over the libraries.

## Data accuracy and trust

- The source covers June 2024–May 2026. The default is the dataset's latest period, not the current calendar month.
- Revenue, forecast, prior-year revenue, and units are summed from facts before calculating percentages. Growth is `(actual / priorYear − 1) × 100`; attainment is `actual / forecast × 100`. Zero denominators produce unavailable percentages.
- Source status and market share are latest-period attributes. Historical status and product/region market share are not invented. A status filter always means the latest source status, including on historical views.
- Computed percentages can differ from the supplied rounded KPI values. The charts and detail table consistently calculate from the fact series; source status and share remain authoritative source attributes.
- Market-level anomaly notes retain their period and are not presented as product-level explanations.
- Every chart exposes exact values through a table. Radar axes normalize revenue contribution, growth, and attainment using disclosed scales; clipping affects only the drawing.
- Amounts use `Intl.NumberFormat`, dates use UTC-safe `Intl.DateTimeFormat`, and USD is labeled explicitly. This dataset uses one reporting currency; no currency conversion is implied.

AI interpretation has a separate visual surface from source data. Citations resolve real IDs and periods, and their links work as shareable URLs. Confidence arrives only with the final event and is labeled as fixture metadata, not a calibrated probability. Stopped/disconnected answers remain partial and receive no fabricated evidence. Abstentions and failures have explicit states.

The assistant is intentionally **not aware of the dashboard selection**. Its answers retain the scope of their fixed citations. There are discrepancies in the supplied material: the risk fixture highlights three markets while source status flags six as at risk/off track; the forecast-miss fixture discusses weaker markets while the latest portfolio total is slightly ahead of plan. The source data is preserved, the UI labels the interpretation as a demo, and citations let readers inspect the actual values.

## Technical choices

| Concern          | Choice and reason                                                                                                                                                             |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework        | Keep the starter's Next.js App Router, React, and strict TypeScript. Server-rendered data delivery and the mock stream need no separate service.                              |
| Components/style | Existing Tremor Raw Button/Card plus CSS tokens for color, spacing, surfaces, and focus. Native controls avoid adding a second component system.                              |
| Streaming        | POST streaming fetch with a buffered SSE decoder and AbortController. Native EventSource does not support this POST contract.                                                 |
| Charts           | Recharts for time-series/radar; native SVG country paths and an HTML heat-map table for the other views. All chart animations are disabled.                                   |
| Map              | Bundled Natural Earth country outlines. No map account, runtime network request, or map library.                                                                              |
| State            | URL for shareable selection; local React state for transient interactions; localStorage for demo alerts. No Redux, Zustand, or query cache is needed for this static dataset. |
| Validation       | Zod for dependent alert fields; explicit TypeScript contracts and runtime guards for streamed events. Ordinary form state is sufficient for this one form.                    |

## Accessibility

The implementation includes semantic headings and table headers, labeled native controls, visible focus, a skip link, status text/icons beyond color, and reduced-motion support. Countries support Tab/Enter/Space; heat-map cells support arrow keys, Home/End, and Enter, with one cell in the Tab sequence. Revenue and comparison tables provide keyboard selection. Chart alternatives remain available if a Recharts render fails.

Streaming text is not announced token by token. A separate polite status reports generation progress; complete answers remain available to read. Validation messages identify affected fields, and save errors preserve form input.

Automated axe checks cover WCAG 2.1 A/AA rules on the analyst view. Mobile overflow is browser-tested. This is not a WCAG certification: a dedicated screen-reader audit, expanded browser/device coverage, and usability testing remain future work.

## Testing and engineering standards

- **Vitest / Testing Library:** source references, aggregation and zero denominators, URL parsing, fragmented SSE including Unicode, malformed/premature responses, endpoint validation and cancellation, citations, keyboard map/heat-map selection, table drill paths, chart failure fallback, alert validation, and optimistic rollback/retry.
- **Playwright:** the full dashboard → chat → citation → alert flow, URL history/reload, comparison persistence, uncertainty/abstention/error states, stopped generation, axe checks, and mobile layout.
- **CI:** `.github/workflows/ci.yml` runs clean install, generated route types, typecheck, lint, unit/integration tests, production build, and Chromium E2E tests. Browser artifacts are retained for seven days.

The checks use behavioral assertions rather than snapshot collections or tests of chart-library internals. Strict typing, runtime event validation, safe plain-text rendering, shared metric calculations, feature boundaries, and focused branches are the main standards. Storybook, table virtualization, exhaustive browser matrices, and a real backend were deliberately deferred.

The three branches have feature-specific changes: `feat/initial` is the shared foundation, `feat/dashboard` adds only dashboard features, and `feat/assistant` adds chat and its integration. Review dashboard against initial, and assistant against dashboard. Previous history is preserved in `dev`. See [the task ledger](docs/TASKS.md).

## Production path

The production build prerenders `/`; `/api/chat` remains a dynamic streaming route. Standard `npm run build` / `npm run start` deployment is supported. Static-only hosting is insufficient because the POST stream requires a server.

For Vercel, import the repository, select `dev`, retain the Next.js preset, use Node 24, and deploy with the standard commands. No application secrets are needed. Hosting is **not configured or deployed by this repository**. Verify incremental delivery with `curl -N` on the deployed `/api/chat`; a proxy must not buffer or transform SSE. The endpoint sends `Cache-Control: no-cache, no-transform`.

Already implemented: lazy chart chunks, no chart animations, isolated chat updates, route/chart error recovery, safe output rendering, input limits, cancellation, typed stream guards, and CI checks. Next.js handles fingerprinted static assets; the canonical dataset changes only with a new build.

Before real users: measure production Core Web Vitals and JS transfer sizes, set budgets, add RUM/web-vitals and error tracking with privacy controls, apply request limits at the edge, and add durable alert storage. These are **not wired up** in this demo. Track LCP, INP, CLS, stream start/completion/cancellation/failure, and alert-save failures; avoid logging conversation contents by default. Establish preview/production deployment checks and rollback through the hosting provider. The configured GitHub workflow performs verification; it does not provision hosting or deploy.

## AI-assisted development and submission review

AI assistance was used to inspect the supplied contract, split the work, implement components and tests, and investigate verification failures. No sub-agents were used. The repeatable workflow was one task branch, implementation, relevant checks, diff review, and merge. Browser checks exposed contrast/label errors and a map-selection bug, which were fixed before delivery.

AI output is not treated as authoritative for business calculations, evidence, or test results. The canonical data and executed checks are the references. Do not add credentials, a real model, or unsupported market explanations to this exercise.

**Before submitting:** review the implementation and replace this factual development account with your own assessment of the choices, alternatives, engineering standards, and AI workflow. The assignment explicitly asks for your reasoning; this README should not be submitted as a substitute for that personal review.

With more time: a screen-reader usability pass, tighter production performance measurements, contextual fixture responses, and deployed observability would come first. Live mode, virtualization, command palette, and Storybook remain optional.

## Attribution

Map geometry is public-domain [Natural Earth](https://www.naturalearthdata.com/about/terms-of-use/) data, converted once to SVG paths by `scripts/build-map.py` using the upstream [110m country boundaries](https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_110m_admin_0_countries.geojson).

## Refactoring boundaries

`MarketConsole` coordinates URL state and composes the workspace, header, summary, chart group, and priorities. `ConsoleWithAssistant` injects the assistant and its hint without making dashboard modules import chat logic. `Panel` and `DataTable` own shared presentation and accessibility markup. Market projections and comparison normalization are pure functions.

`AlertForm` composes the form, `useAlertForm` owns input and validation, `useAlertRules` owns optimistic saving and rollback, and `SavedAlerts` owns rule display. For chat, `useChat` owns request lifetime and turn updates, `useChatScroll` owns scroll-follow behavior, and `ChatComposer` owns input. HTTP/SSE transport and citation resolution live in `src/lib`. These are feature-specific components and hooks, with no additional state or service framework.

UI copy is grouped in feature `copy.ts` constants, while component classes and chart styles stay in local `UI` objects. Map bands, heat-map rows, and sortable market rows are prepared by pure helpers in `src/lib`. The map uses fixed percentage thresholds for growth and attainment; revenue uses five equal bands relative to the largest market in the selected scope. Derived chart values are calculated from the current selection rather than stored in extra React state.
