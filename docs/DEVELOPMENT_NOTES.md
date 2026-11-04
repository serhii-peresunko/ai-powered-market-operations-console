# Development notes

This draft records the implemented steps and their technical rationale, grouped by the three development branches. Review the explanations and put them in your own words before using them in the submission. The assignment asks for your personal reasoning.

## Initial

### 1. Read the requirements and define the boundaries

Reviewed the assignment, `CONTRACT.md`, the starter files, and the existing project. The required result was a connected dashboard and streaming assistant, with trustworthy evidence, accessible charts, URL state, a validated form, and meaningful tests.

The implementation stayed focused on those front-end requirements. The supplied dataset and answer fixtures were enough to build and verify the experience. Authentication, a real model, data pipelines, live updates, virtualization, and Storybook were left outside this implementation.

### 2. Keep the existing framework and component foundation

Retained Next.js App Router, React, strict TypeScript, Tailwind, and the existing Button and Card components. Documented Node.js 24 as the target version and used it in CI.

This gave the application a server page for loading data and a route handler for the mock stream within one project. Native inputs and selects covered the controls without introducing another component system.

### 3. Inspect the canonical data and define contracts

Added the supplied data and fixtures and defined types for markets, series rows, citations, fixture answers, and streaming events. Narrowed JSON string values such as market status into their allowed unions.

The dataset contains 13 markets, four regions, five products, and 24 monthly periods: 1,560 fact rows. Its latest period is May 2026. Source and citation references were checked against real IDs and periods so broken references could be caught before they reached the UI.

The application defaults to the dataset's latest period. Using the current calendar month would select a period that the supplied data cannot answer.

### 4. Establish shared calculations and formatting

Created pure functions for selecting markets and fact rows, calculating totals, and preparing trends. Revenue, forecast, prior-year revenue, and units are summed before calculating percentages:

- Growth: `(actual / priorYear - 1) × 100`.
- Forecast attainment: `(actual / forecast) × 100`.
- Forecast variance: `actual - forecast`.

This avoids averaging market percentages, which would give small and large markets equal weight. A zero denominator produces an unavailable percentage.

Kept source status and market share tied to their supplied latest-period values. Historical statuses and product or region market share are unavailable because the required source values are missing. `Intl` formatters handle currency, percentages, compact amounts, and UTC-safe period labels. Revenue is explicitly labeled USD.

Implementation: [metric helpers](../src/lib/metrics.ts) and [formatters](../src/lib/format.ts).

### 5. Set up styles, checks, and branch boundaries

Established shared tokens for color, typography, surfaces, spacing, and focus. Added Vitest and Testing Library for calculations and component behavior, alongside lint, strict type checking, and production builds.

The work initially used smaller implementation branches. It was later consolidated into `feat/initial`, `feat/dashboard`, and `feat/assistant` to match the requested workflow. The branches were rebuilt so dashboard could run without chat, and assistant added its own logic on top of dashboard. Earlier commits remain in `dev`.

The branch boundaries are documented in [TASKS.md](TASKS.md). Initial contains the shared foundation; accessibility, tests, and documentation stay with the feature they support.

## Dashboard

### 1. Load source data and separate state by responsibility

The server page imports the static dataset and passes it to the client console. The dataset changes with the application build, so the implementation uses that supplied data directly.

Dashboard selection belongs in the URL. Temporary interactions, including table sorting, keyboard focus, and unsaved form values, stay in local React state. This keeps the shared view understandable without introducing a global store or query cache for unchanged local data.

### 2. Build hierarchy navigation and shareable views

Added portfolio → region → market → product navigation, breadcrumbs, and a reporting-period control. URL parameters also store audience mode, comparisons, map metric, and the latest-source-status filter.

`readView` validates IDs and periods and resolves a selected market to its region. Native history updates keep the view shareable and support reload and back/forward. Country clicks, table links, heat-map cells, and later citation navigation use the same selection path.

Comparison selections remain explicit. Map and heat-map peer views show markets in the selected region and status scope; individual market/product details use the full drill path.

Implementation: [URL state](../src/lib/view.ts) and [dashboard view hook](../src/components/dashboard/useDashboardView.ts).

### 3. Add health summaries and priorities

Replaced the placeholder with revenue, forecast attainment, year-on-year growth, and the number of markets to watch. Added source-status risks and the largest revenue variances from forecast.

These give the executive view an immediate starting point: how the portfolio is performing and where attention may be needed. Source-status labels retain their date, including while a historical revenue period is selected. Market anomaly notes remain identified as market-level source notes.

The source flags six markets as at risk or off track. That count comes from the dataset, independently of the assistant fixture that highlights three markets.

### 4. Add the four required visualizations

| Visualization       | Implementation and reason                                                                                                                                                               |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Revenue time-series | Recharts lines for actual, forecast, and prior-year revenue. Different line styles distinguish series, and a reference line marks the selected period.                                  |
| Country choropleth  | Bundled Natural Earth outlines rendered as SVG. Country selection works without a map account, runtime map requests, or an additional map library.                                      |
| Comparison radar    | Recharts radar for up to four markets or regions. Disclosed scales normalize revenue contribution, growth, and attainment; the table keeps exact values when the drawing clips a value. |
| Forecast heat map   | An HTML table of markets and periods, with signed values and a diverging color scale. Cell selection focuses the corresponding market and period.                                       |

The heat map fits the monthly dataset and makes sustained forecast misses easy to find. It also provides a direct market-and-period selection interaction. Chart data comes from the shared calculation functions so values remain consistent across views.

### 5. Support executive and analyst audiences

Added an executive overview for health, trends, and priorities, and an analyst view for all charts, detailed metrics, sorting, and drill paths. Switching modes preserves the selected scope.

The audiences need different information density. Both modes share the same data and selection state, which avoids maintaining separate calculation paths.

### 6. Add the required validated form

Implemented an alert/threshold configurator. The assignment requires a non-trivial schema-validated form with optimistic saving and rollback, and explicitly suggests alerts as a suitable example.

The form supports a name, portfolio/region/market scope, growth and attainment conditions, and AND/OR matching. Zod checks the selected scope, enabled conditions, and numeric limits. The threshold limits are shared by the schema and inputs to keep their rules consistent.

These are browser-local rules for market totals across all products. They show matching markets for the selected period; they do not change authoritative source status or send notifications.

### 7. Make saving optimistic and recoverable

Added an asynchronous mock save backed by localStorage. A pending rule appears immediately. Success confirms it; failure restores the previous rules and preserves input for retry. A failure toggle makes that path reproducible. Concurrent saves are blocked while one is pending.

This demonstrates the requested interaction without introducing a persistence service. During refactoring, `AlertForm` became the form layout, `useAlertForm` took ownership of input and validation, `useAlertRules` kept persistence and rollback, and `SavedAlerts` remained responsible for display.

Implementation: [alert rules and validation](../src/lib/alerts.ts) and [save lifecycle](../src/components/alerts/useAlertRules.ts).

### 8. Add accessible alternatives and recovery

Added data tables for chart values, labeled controls, visible focus, semantic headings, status text/icons, and reduced-motion handling. Country paths support keyboard selection. Heat-map cells use a single Tab entry point with arrow-key, Home/End, and Enter navigation.

The signed heat-map values and table alternatives make the data usable beyond its colors. Recharts error boundaries preserve the accessible table, and a route error boundary offers recovery for a failed view.

Browser checks found contrast and accessible-name issues, which were corrected. They also exposed a map bug where countries without data could receive a selected outline when no market was selected. The selection condition was corrected to require a tracked market.

### 9. Refactor repeated presentation and calculations

Split `MarketConsole` into workspace layout, header, summary, charts, and priorities. It now coordinates selection and composition. `Panel` owns the repeated heading/description structure; `DataTable` owns the scrollable, labeled table and optional disclosure.

Centralized market filtering and metric projections, comparison entity resolution, and radar normalization. This gives charts and tables the same rules and keeps calculation code separately testable. Stateful alert saving was extracted from the form component.

Grouped complete presentation messages in feature `copy.ts` constants and kept component styles in local `UI` objects. Formatting functions keep sentences together instead of scattering punctuation and whitespace through JSX. History counts, currency labels, comparison limits, and heat-map legend boundaries come from the dataset or shared configuration. Repeated domain values use typed constants. Static text and values derived from filters do not need React state.

Simplified `MarketMap` by moving SVG country rendering into `MarketMapCanvas` and data preparation into [the map helper](../src/lib/market-map.ts). Growth and attainment keep their existing fixed percentage thresholds. Revenue bands use 20%, 40%, 60%, and 80% of the largest value in scope, producing five equal ranges. These are display bands, not alert rules or source statuses. Tests cover their boundaries, missing values, and an empty scope.

Heat-map rows, variance classification, keyboard navigation, sortable table data, and alert form validation have focused helpers or hooks. Market summaries group facts in one pass, and trend calculations group rows by period. Map, heat-map, and table models use memoization so unrelated local interactions do not repeat aggregation. Sparse-data tests preserve markets and periods without matching facts. The welcome screen and citation list have their own components. An unused stylesheet for an older console layout was removed.

The final browser review exposed a race between consecutive filter updates. The URL update hook now reads the current browser URL before applying each patch, so a period change cannot erase a market selection that React has not rendered yet. A regression test applies market, period, and product updates in the same render cycle.

Chart failures retain the accessible table and offer a retry for transient rendering errors. Citation links retain native modifier-click navigation. Stream limits apply to complete and partial frames, so oversized complete events cannot bypass validation; malformed JSON receives a consistent user-facing error. Valid network chunks containing multiple small events remain supported.

The abstractions correspond to repeated UI or existing responsibilities. The refactor added no runtime libraries, service layer, or state framework.

## Assistant

### 1. Adapt the supplied fixture endpoint

Used the provided answers and keyword matching to implement `POST /api/chat`. Unsupported questions receive the supplied fallback. Input validation rejects malformed or empty questions and enforces the shared question-length limit.

The handler streams whitespace-preserving tokens and then sends completion metadata. It also handles the error fixture and stops enqueueing work after cancellation. The explicit runtime setting was removed after the production build showed that it conflicts with the enabled Next.js Cache Components setting.

The assignment evaluates the front-end surface, so fixed fixtures keep the behavior deterministic and make uncertainty, abstention, errors, and long responses reproducible.

### 2. Implement streaming fetch and robust event parsing

Added a POST fetch request and buffered SSE decoder. The parser handles UTF-8 characters split across chunks, incomplete frames, several events in one chunk, and both supported newline forms. Runtime guards check event shapes before the UI consumes them.

Network chunks do not necessarily align with application events. Buffering preserves the event contract, and an unexpected end before completion becomes an incomplete-response error. Reader cancellation and lock release happen during cleanup.

Implementation: [chat transport and parser](../src/lib/chat.ts).

### 3. Separate request lifetime from the interface

Moved request state, turn updates, cancellation, and unmount cleanup into `useChat`. An active request blocks a second generation. Token updates stay inside the assistant component tree so they do not trigger dashboard recalculation.

`ChatComposer` owns input and keyboard behavior. `Conversation` renders turns and their states. `useChatScroll` follows new output while the reader is near the bottom and allows them to scroll back through earlier content.

This separates the asynchronous lifecycle from rendering and scrolling. Request cleanup is tested, including cancellation on unmount and protection against overlapping requests.

Implementation: [chat lifecycle](../src/components/chat/useChat.ts).

### 4. Make evidence navigable

Completion events carry citations to canonical IDs and periods. Citation resolution validates those references, creates a source label, and prepares the corresponding dashboard view. Unresolved or contradictory references produce an unavailable-source state.

Following a valid citation opens the exact scope and period in analyst mode, clears the source-status filter, and moves focus to the dashboard heading. The link also contains a shareable URL.

During refactoring, reference validation and label construction moved into one pure helper so the evidence renderer does not repeat entity lookups or navigation rules.

Implementation: [citation resolution](../src/lib/citations.ts).

### 5. Represent uncertainty and incomplete answers honestly

Confidence and evidence appear when final metadata arrives. Confidence is labeled as fixture metadata rather than a calibrated probability. Low-confidence answers, abstentions, errors, and stopped responses have distinct presentations.

Stopping a generation retains partial content without attaching fabricated confidence or citations. Error and interrupted states offer retry. Output is rendered as plain text, and a separate polite status avoids announcing every token to a screen reader.

The source dashboard and AI interpretation have different labels and structure. This helps readers verify a claim before acting on it.

### 6. Connect the assistant without coupling dashboard modules to chat

Added `ConsoleWithAssistant` to supply the assistant through the dashboard's composition slot. Dashboard modules own selection and data presentation; assistant modules own conversation behavior. Both use the selected view when a citation is followed.

Answer generation still uses fixed fixture scope. Dashboard-aware answers were an optional stretch goal and remain unimplemented. The fixture that highlights three risks is not an exhaustive list of the six flagged source markets. Likewise, the forecast-miss fixture discusses weaker markets while the latest portfolio total is slightly ahead of forecast.

Those differences are documented so canned interpretation is not mistaken for a fresh calculation of the current selection.

### 7. Verify the complete workflows

The last full implementation verification passed 46 unit/integration tests, nine browser tests, lint, type checking, and the production build. Coverage includes calculations, source references, URL state, SSE parsing, request cancellation, citation navigation, optimistic rollback, keyboard interactions, and error recovery.

Browser flows cover dashboard selection → streamed answer → source citation → alert saving, along with history/reload, comparisons, uncertainty, abstention, errors, accessibility, and mobile overflow. The dashboard-only branch was separately checked for the absence of chat UI and an active chat endpoint.

The [CI workflow](../.github/workflows/ci.yml) is configured to run verification for pull requests and pushes to `dev` using Node.js 24. It builds the application before browser tests. Deployment is not part of that workflow.

### 8. Record the AI workflow, cleanup, and remaining work

AI assistance was used for requirement analysis, implementation, refactoring, tests, and investigating failures. No sub-agents were used. Work was checked through source review, strict types, targeted tests, and production browser flows. Business values came from the canonical dataset, and confidence/citations came from the supplied fixtures.

Later repository cleanup removed generated visual artifacts and the bundled license file at the requested scope. These were separate changes from the feature implementation. The feature branches were integrated into `dev`; these development notes have their own documentation branch.

The remaining production work is to connect hosting, verify deployed streaming through the hosting proxy, measure Core Web Vitals and bundle sizes, set performance budgets, and connect observability with appropriate privacy controls. Real alert persistence and notifications would require additional product and backend work.

For submission, review the reasoning in this draft, add your personal trade-offs, and prepare the remaining deliverables listed in the brief. The application has no verified live deployment, and real-user performance monitoring has not been connected.
