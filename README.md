# Market Operations Console — Dashboard

This branch adds dashboard logic on top of `feat/initial`: portfolio metrics, source-status risks, revenue trends, an offline country map, radar comparisons, a forecast heat map, URL-backed drill-down, executive/analyst modes, and validated local alerts.

It contains no chat UI, streaming client, fixture matcher, or active `/api/chat` endpoint. The assistant is added by `feat/assistant`.

## Run and verify

Use Node.js 24. No application secrets or map account are needed.

```sh
npm ci
npm run dev
npm test
npm run typecheck
npm run lint
npm run build
npx playwright install chromium
CI=true npm run test:e2e
```

The browser tests start the production server on port 3010. CI runs the same checks. Source data is loaded by the server page; URL parameters own the shared view, and form/sort state is local React state. Alerts save to localStorage through a deterministic async mock with optimistic rollback. The failure toggle lets reviewers exercise that behavior.

Percentages are calculated from summed fact rows. Zero denominators are unavailable. Source status and market share are latest-period attributes; historical status and product/region market share are not invented. Amounts are USD, formatted with `Intl`.

Charts provide numeric tables, keyboard navigation, non-color signals, and reduced-motion support. Recharts rendering failures preserve the accessible alternative. Automated axe and narrow-layout checks are included; a dedicated screen-reader audit remains future work.

Shared tokens are in `src/app/console.css`; dashboard styles are in `src/app/dashboard.css`. Recharts is used for time-series/radar, bundled Natural Earth outlines for the map, and an HTML table for the heat map. No global state manager or external backend is needed.

Review this branch against `feat/initial`. See [the task boundaries](docs/TASKS.md). Hosting and observability are not configured; deploy to a Node.js-capable Next.js host and measure production performance before real users.

Natural Earth boundaries are public domain. Before submitting, add your own reasoning and account of AI assistance.

## Refactoring boundaries

`MarketConsole` coordinates URL state and composes the workspace, header, summary, chart group, and priorities. `Panel` and `DataTable` own common presentation and accessibility markup. Market filtering and projections live in `metrics.ts`; comparison entity resolution and radar normalization live in `comparisons.ts`.

`AlertForm` owns input and validation. `useAlertRules` owns persistence, pending state, optimistic updates, and rollback. `SavedAlerts` renders the saved rules. The assistant is composed through a view-aware slot, so dashboard modules do not import assistant implementation.

UI copy is grouped in feature `copy.ts` constants, while component classes and chart styles stay in local `UI` objects. Map bands, heat-map rows, and sortable market rows are prepared by pure helpers in `src/lib`. The map uses fixed percentage thresholds for growth and attainment; revenue uses five equal bands relative to the largest market in the selected scope. Derived chart values are calculated from the current selection rather than stored in extra React state.
