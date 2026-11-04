# Market Operations Console

A front-end take-home project for exploring market performance and checking answers from a streaming assistant. The dashboard uses the supplied market data. The assistant uses fixed answer fixtures served through a real API route.

## Setup

Use **Node.js 24** and npm, matching the CI environment. Run these commands from the repository root:

```sh
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000). No environment variables, API keys, database, or separate backend process are required.

To run a production build locally, stop the development server and run:

```sh
npm run build
npm run start
```

### Checks

```sh
npx next typegen
npm run typecheck
npm run lint
npm test
```

`next typegen` generates the route types needed by TypeScript on a fresh checkout. `npm run test:watch` runs unit and integration tests in watch mode.

For browser tests against a production build:

```sh
npx playwright install chromium
npm run build
CI=true npm run test:e2e
```

Playwright starts and stops its own server on port **3010**. Keep that port free. On Linux, use `npx playwright install --with-deps chromium` if browser system dependencies are missing.

`npm run test:e2e` without `CI=true` uses a development server instead. Stop any other development server for this checkout first, because Next.js allows one development server per project.

## Try it

1. Start with **Executive overview** for revenue, growth, forecast attainment, and markets to watch.
2. Switch to **Analyst deep-dive** for the country map, comparison radar, forecast heat map, and detailed tables.
3. Select a region, market, product, or reporting period. Reload or use back/forward to check that the URL preserves the selection.
4. Ask **“Why did Germany's revenue dip?”** and follow a citation back to its dashboard scope and period.
5. Open **Configure an alert**, save a rule, then enable **Simulate save failure** to try rollback and retry.

Other assistant prompts include **“Compare APAC and Europe”**, **“Forecast next year”**, **“full summary”**, and **“force error”**. Answers match fixture keywords; unsupported questions receive the supplied fallback.

## Architecture

I used a feature-based structure so each feature keeps its UI, hooks, helpers, styles, and tests together.

```text
src/
  app/                 Pages, API entry points, and feature composition
    _components/       Workspace shell and MarketWorkspace
    api/chat/route.ts  POST /api/chat entry point
  features/
    dashboard/         Selection, summaries, charts, and detail tables
    assistant/         Conversation, SSE transport, and citation resolution
      server/          Fixture loading and mock streaming handler
    alerts/            Form validation, optimistic saving, and persistence
  shared/
    ui/                Reusable components
    lib/               Market calculations, formatting, and URL serialization
    types.ts           Shared data and event contracts
    styles.css         Common styles and tokens
  data/                Supplied JSON, map geometry, and dataset loader
```

[MarketWorkspace](src/app/_components/MarketWorkspace.tsx) connects the dashboard, alerts, and assistant through props and callbacks. Features do not import another feature's implementation. Shared code does not depend on features or app composition. [ESLint rules](eslint.config.mjs) enforce these boundaries and restrict frontend imports of server modules and answer fixtures.

The server page loads the static dataset and passes it to the client workspace. Dashboard helpers calculate the selected view for charts and tables. Answer fixtures stay behind `/api/chat`.

State has three owners:

- **URL:** region, market, product, period, audience mode, map metric, comparisons, and source-status filter. Invalid values fall back to valid selections.
- **Local React state:** conversation, composer input, sorting, keyboard focus, and unsaved form values.
- **localStorage:** saved demo alert rules in the current browser.

## Key technical decisions

### Keep the existing stack

I kept Next.js App Router, React, strict TypeScript, Tailwind, and the existing Button and Card components. Next.js handles both the page and the mock API, so I did not need a separate backend application. Native inputs and selects cover the form controls.

### Use the URL for dashboard selection

The selected view should survive reloads and be shareable. [useDashboardView](src/features/dashboard/useDashboardView.ts) reads search parameters and updates browser history. Citation links use the same view contract to open the relevant market, product, and period. Temporary interactions stay in component state.

The dataset changes with the build. I did not add a query cache or global state library for unchanged local data.

### Keep calculations separate from rendering

[Metric helpers](src/shared/lib/metrics.ts) sum actual, forecast, prior-year revenue, and units before calculating percentages. This avoids giving small and large markets equal weight by averaging their percentages.

- Growth: `(actual / priorYear - 1) × 100`.
- Forecast attainment: `(actual / forecast) × 100`.
- Forecast variance: `actual - forecast`.

A zero denominator produces an unavailable percentage. Charts and tables use these same calculations. Feature copy lives in `copy.ts` files, component classes in local `UI` constants, and chart preparation in focused helpers. Static labels and derived values do not need extra React state.

### Simulate the backend through an API

[POST /api/chat](src/features/assistant/server/chat-route.ts) validates a JSON question, selects a supplied fixture, and streams SSE token events followed by completion metadata. It also supports error fixtures and cancellation. No model or external service is called.

I used streaming `fetch` because the request is a POST. The [client decoder](src/features/assistant/chat.ts) buffers incomplete frames, handles split UTF-8 characters, validates events, and reports an incomplete response if the stream ends early. `useChat` owns request lifetime and cancellation; components render the resulting turns.

Citations are checked against real IDs and periods. Confidence comes from the fixture's final event. A stopped response keeps its partial text without adding confidence or evidence that never arrived.

### Choose charts for the interaction

Recharts renders the revenue trend and comparison radar. The country map uses bundled Natural Earth SVG geometry, and the forecast heat map uses an HTML table. This avoids a map account, runtime map requests, and another map library.

Every chart has a table with exact values. Radar scales are disclosed. Map growth and attainment bands use fixed thresholds; revenue uses five equal bands relative to the largest market in scope. These bands are display rules, separate from source status and alert thresholds.

### Keep alert saving small and testable

Zod validates the alert name, scope, enabled conditions, and threshold ranges. A mock asynchronous save writes to localStorage. A pending rule appears immediately; a failed save restores the previous rules and keeps the form input for retry.

The form layout, input validation, and save lifecycle have separate components or hooks. These rules demonstrate validation and optimistic rollback. They do not send notifications or change the source data.

## Data and demo limits

The supplied data covers **June 2024–May 2026**, so the dashboard defaults to May 2026 rather than the current month. Source status and market share are latest-period attributes; historical status and product/region share are unavailable. Amounts are labeled USD, with no currency conversion.

The assistant is **not aware of the current dashboard selection**. Its answers and citations have fixed fixture scope. The risk fixture highlights three markets while source status flags six, and the forecast-miss fixture discusses weaker markets while the latest portfolio total is slightly ahead of forecast. I preserved the supplied material and kept interpretation separate from source values so readers can verify the claims.

Alerts are browser-local. Authentication, real model answers, durable storage, and notification delivery are outside this implementation.

## Verification and remaining work

Vitest and Testing Library cover calculations, URL state, stream parsing, API validation and cancellation, citations, chart interactions, and alert rollback. Playwright covers complete user flows, history/reload, error states, keyboard navigation, the pinned menu, mobile overflow, and automated axe accessibility checks.

[CI](.github/workflows/ci.yml) installs dependencies, generates route types, runs type checking, lint, unit/integration tests, a production build, and Chromium browser tests. It verifies the application; it does not deploy it.

The UI includes labeled controls, visible focus, a skip link, keyboard chart selection, table alternatives, and chart error recovery. Stream progress uses a separate polite status instead of announcing every token. A manual screen-reader audit and broader browser/device testing remain to be done.

Deployment needs a Next.js server because `/api/chat` streams POST responses. Hosting and observability are not configured. Before production use, I would verify streaming through the hosting proxy, measure Core Web Vitals and bundle sizes, and add error monitoring and request limits. Real alert persistence would need backend work.

AI assistance was used for requirement analysis, implementation, refactoring, and tests. I checked the work against the supplied data, source code, and executed checks. No sub-agents were used.

## Attribution

Map geometry is public-domain [Natural Earth](https://www.naturalearthdata.com/about/terms-of-use/) data. [scripts/build-map.py](scripts/build-map.py) converts the upstream [110m country boundaries](https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_110m_admin_0_countries.geojson) into the bundled SVG paths.
