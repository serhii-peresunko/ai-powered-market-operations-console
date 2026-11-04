# Development notes

I split the work into three parts: the initial setup, the dashboard, and the assistant. My main goal was to make the required flows work together and keep the code easy to follow. I used the supplied data and mock answers throughout the project.

## Initial

### 1. Understand the assignment

I started by reading the brief, `CONTRACT.md`, and the starter files. I wanted to understand the data and the streaming contract before building the screens.

The main requirements were a dashboard with connected charts and drill-downs, a streaming assistant with source citations, a validated form, and tests for the important interactions. I focused on those first. I left authentication, a real model, live updates, virtualization, and Storybook outside this implementation.

### 2. Keep the setup simple

I kept Next.js App Router, React, strict TypeScript, Tailwind, and the existing Button and Card components. Next.js let me load the data on the server and keep the mock streaming endpoint in the same project.

I used native inputs and selects for the controls. They covered what I needed here, so I didn't add another component library. I documented Node.js 24 as the target version and used it in CI.

### 3. Check the data before using it

I added the supplied dataset and fixtures, then defined types for markets, monthly records, citations, answers, and stream events. I also checked string values such as status and confidence against their allowed values when loading the JSON.

The dataset has 13 markets, four regions, five products, and 24 monthly periods. That gives 1,560 fact rows. The latest period is May 2026, so I used that as the default. Using the current calendar month would open a period with no data.

I checked that market, region, product, and period references resolved correctly. I wanted a broken reference to show up in a test rather than become a confusing chart or citation later.

### 4. Put calculations in one place

I created shared functions for filtering records, calculating totals, and preparing chart data. I sum revenue, forecast, prior-year revenue, and units before calculating percentages:

- Growth: `(actual / priorYear - 1) × 100`.
- Forecast attainment: `(actual / forecast) × 100`.
- Revenue variance from forecast: `actual - forecast`.

I used totals because averaging market percentages would give a small market the same weight as a large one. When a denominator is zero, I show the percentage as unavailable.

I also kept the source status and market share tied to the latest period. The data doesn't provide historical statuses or product and region market shares, so I didn't calculate substitutes for them.

For display, I used `Intl` formatters for money, percentages, and dates. Dates use UTC so a period label doesn't change with the browser's time zone. Currency labels come from the dataset, which uses USD.

The main functions are in [metric helpers](../src/lib/metrics.ts) and [formatters](../src/lib/format.ts).

### 5. Organize the work and checks

I set up shared styles for colors, spacing, typography, and focus states. I added Vitest and Testing Library for calculations and component behavior, along with lint, type checking, and production builds.

I grouped the implementation into `feat/initial`, `feat/dashboard`, and `feat/assistant`. Initial contains the shared setup. Dashboard runs on its own, and assistant adds the conversation flow on top of it. I kept tests and accessibility work with the feature they cover so each branch has its own implementation to review.

## Dashboard

### 1. Decide where state belongs

I load the static dataset in the server page and pass it to the client console. Since the data changes with the application build, I didn't need a fetching or cache library for it.

I put the selected region, market, product, period, audience mode, comparisons, map metric, and status filter in the URL. That lets me refresh the page, share a view, and use browser back and forward.

I kept temporary interactions in local React state: table sorting, keyboard focus, the hovered country, and unsaved form values. I didn't need a global store for these.

### 2. Connect navigation and filters

I added the portfolio → region → market → product drill-down, breadcrumbs, and the reporting-period control. Country clicks, table links, and heat-map cells all update the same dashboard selection.

I used `readView` to validate URL values. It rejects unknown IDs and periods, applies defaults, and makes sure a selected market belongs to the correct region.

For the map and heat map, I keep the other markets in the selected region and status scope visible. Selecting Germany should still let me compare it with its peers. The detailed table follows the full market and product selection. Radar comparisons stay explicit through their own picker.

The code is in [URL state](../src/lib/view.ts) and [the dashboard view hook](../src/components/dashboard/useDashboardView.ts).

### 3. Give the overview a clear starting point

I added total revenue, forecast attainment, year-on-year growth, and the number of markets to watch. Below that, I show source-flagged markets and the largest revenue gaps from forecast.

I wanted the executive view to answer two questions quickly: how is the selected scope performing, and where should I look next?

I kept the date visible on source-status information, even when a historical revenue period is selected. I also kept anomaly notes identified as market-level notes, since the source doesn't provide a separate explanation for every product.

One difference in the supplied material needed care: the source flags six markets as at risk or off track, while an assistant fixture highlights three. I use the dataset for the dashboard count and preserve the fixture as the supplied mock answer.

### 4. Build the four charts

I used Recharts for the revenue trend and radar. For the country map, I bundled Natural Earth outlines and rendered them as SVG. For the heat map, I used an HTML table.

- **Revenue trend:** I show actual, forecast, and prior-year revenue with different line styles. A reference line marks the selected period.
- **Country map:** I use color to show the selected metric and let the user select a tracked country with a mouse or keyboard. Bundled SVG paths avoid a map account or runtime map requests.
- **Comparison radar:** I allow up to four markets or regions. The axes use explained scales, and the table keeps the exact values when the drawing clips a value.
- **Forecast heat map:** I show signed monthly variance by market. Selecting a cell opens that market and period. This makes it easier to spot a sustained miss across several months.

All four views use the shared calculation functions. I wanted the same selection to produce the same numbers in a chart and its table.

### 5. Support both audiences

I added an executive view for summaries, trends, and priorities, and an analyst view for all charts, detailed metrics, sorting, and drill-downs.

Both views use the same data and URL state. I only change the amount of information shown, so switching audiences doesn't reset the selection or introduce a second set of calculations.

### 6. Use alerts for the validated form

I chose an alert configurator because the assignment asks for a non-trivial validated form and suggests alerts as one example. It also fits the dashboard: a user can define which market results they want to watch.

The form supports a name, portfolio/region/market scope, growth and attainment thresholds, and AND/OR matching. I used Zod to check the target, enabled conditions, and numeric limits. The schema and inputs share the same limits so they cannot disagree about a valid threshold.

I save these rules in localStorage and show matching markets for the selected period. They apply to market totals across all products. They don't change the source status or send notifications.

### 7. Handle save failures

I made the save asynchronous and optimistic. A new rule appears immediately with a pending state. If the mock save fails, I restore the previous list and keep the form input so the user can retry.

I added a failure toggle to make that path easy to check, and I block another save while one is pending.

As the form grew, I split its responsibilities. `AlertForm` handles the layout, `useAlertForm` handles input and validation, `useAlertRules` handles saving and rollback, and `SavedAlerts` displays the rules. That made the save flow easier to follow without adding a form framework.

The implementation is in [alert rules and validation](../src/lib/alerts.ts) and [the save hook](../src/components/alerts/useAlertRules.ts).

### 8. Make the charts usable beyond their colors

I added data tables, labels, visible focus, semantic headings, status text and icons, and reduced-motion support. Country paths support keyboard selection. Heat-map cells have one Tab entry point, with arrow keys, Home/End, and Enter for navigation and selection.

If a Recharts component fails, I keep its table available and offer a retry. I also added a page-level error state for a failed view.

Browser checks caught contrast and accessible-name issues, which I fixed. They also caught a map bug: countries without data could get a selected outline when no market was selected. I changed the condition to require a tracked market before applying that outline.

### 9. Make the code easier to read

The larger components were mixing too many things: text, styles, calculations, and rendering. I split `MarketConsole` into the workspace, header, summary, charts, and priorities. I used `Panel` and `DataTable` for the repeated panel and table structure.

I moved styles into local `UI` objects and presentation text into feature `copy.ts` files. I kept complete messages together rather than extracting individual punctuation marks or joining sentence fragments in JSX. Counts, currency labels, comparison limits, and legend descriptions now use the dataset or shared configuration.

`MarketMap` needed particular attention. I moved the country shapes into `MarketMapCanvas` and the calculations into [the map helper](../src/lib/market-map.ts). Growth and attainment use fixed percentage thresholds so their bands keep the same meaning across scopes. Revenue uses 20%, 40%, 60%, and 80% of the largest value in scope to create five equal bands. These bands control the display; they don't define alerts or change source status.

I also separated heat-map data, keyboard navigation, and sortable table data. Market summaries group facts in one pass, and trends group rows by period. I memoized the chart models so moving over a country or changing keyboard focus doesn't recalculate all the data. I added tests for markets and periods with no matching facts, since those should remain visible with unavailable percentages.

Another browser test caught a race between filter changes. Selecting a market and then quickly changing the period could apply the second change to an older view and clear the market. I fixed the update hook to read the current browser URL before applying a patch. I added a regression test that changes market, period, and product before React renders again.

I kept these changes inside the existing components and helpers. I didn't add a service layer, state framework, or more runtime dependencies.

## Assistant

### 1. Keep the supplied mock behavior

I adapted the fixture endpoint for `POST /api/chat`. It matches questions against the supplied keywords, uses the fallback for unsupported questions, and validates input before starting a stream.

The handler sends tokens with their whitespace, followed by completion metadata. It supports the error fixture and stops enqueueing tokens after cancellation.

I kept the fixed answers because this assignment is about the front-end experience. They make the normal, uncertain, abstention, and error cases reproducible. I also removed an explicit runtime setting when the production build showed that it conflicted with the enabled Next.js Cache Components setting.

### 2. Parse the stream carefully

I used streaming fetch for the POST request and buffered the response before parsing events. A network chunk can contain part of an event or several events, so I couldn't treat each chunk as a complete answer update.

The parser handles UTF-8 characters split across chunks, incomplete frames, multiple events in one chunk, and both newline forms. I check event shapes before passing them to the UI. If the stream ends before completion, I show an incomplete-response error.

I also check the size of complete and partial frames. Checking only the remaining buffer would let a large complete event bypass the limit. Malformed JSON gets a readable error message, and cleanup cancels the reader and releases its lock. A large network chunk is still valid when it contains several small, valid events.

The code is in [the chat transport and parser](../src/lib/chat.ts).

### 3. Separate the request from the interface

I put request state, turn updates, cancellation, and unmount cleanup in `useChat`. It blocks a second generation while one is active. Token updates stay in the assistant tree, so they don't cause the dashboard to recalculate.

`ChatComposer` handles input and keyboard behavior. `Conversation` renders turns and their states. `useChatScroll` follows new output while the reader is near the bottom, but lets them scroll back through earlier messages. I gave the welcome screen and citation list their own components as well.

I tested cancellation on unmount and the guard against overlapping requests. The main hook is [useChat](../src/components/chat/useChat.ts).

### 4. Link answers back to the data

I resolve citations against real market, region, product, and period IDs. A valid citation gets a source label and a dashboard link. An unresolved or contradictory reference shows an unavailable-source message.

A normal citation click opens the exact scope and period in analyst mode, clears the source-status filter, and moves focus to the dashboard heading. I kept a real URL in the link so it can be shared or opened with the browser's normal modifier-click behavior.

I moved reference validation and label construction into [one citation helper](../src/lib/citations.ts). That keeps navigation rules out of the evidence renderer.

### 5. Show uncertainty and partial answers clearly

I only show confidence and citations after the final metadata arrives. Confidence comes from the fixture, so I label it as fixture metadata rather than a measured probability.

Low-confidence answers, abstentions, errors, and stopped responses have different states. If the user stops generation, I keep the partial text but don't attach confidence or citations to it. Errors and interrupted responses offer retry.

I render answers as plain text. I use a separate polite status message for generation progress rather than asking a screen reader to announce every token. I also keep the assistant visually separate from the source dashboard so it is clear which information comes from the data and which comes from an interpretation.

### 6. Connect it to the dashboard

I used `ConsoleWithAssistant` to add the assistant through the dashboard's composition slot. Dashboard modules handle selection and data presentation, while assistant modules handle the conversation. Following a citation connects the two through the shared view.

The generated answers still use the fixtures' fixed scope. I didn't implement dashboard-aware answers, which were an optional stretch goal.

I documented the differences between the fixtures and the data. Besides the three highlighted risks versus six source-flagged markets, the forecast-miss fixture discusses weaker markets while the latest portfolio total is slightly ahead of forecast. I kept the supplied material unchanged and made the citations available so users can check the underlying numbers.

### 7. Check the complete flow

The latest full verification passed 46 unit/integration tests, nine browser tests, lint, type checking, and the production build.

I covered calculations, source references, URL state, stream parsing, cancellation, citations, validation, optimistic rollback, keyboard interactions, and error recovery. The browser tests follow the dashboard → answer → citation → saved alert flow and check history, reload, comparisons, uncertainty, stopped generation, accessibility, and mobile overflow.

I also checked the dashboard branch separately to make sure it runs without chat UI or an active chat endpoint.

I configured [CI](../.github/workflows/ci.yml) to run the checks for pull requests and pushes to `dev` on Node.js 24. It builds the app before running the browser tests. It doesn't deploy the app.

### 8. How I used AI and what I would do next

I used AI to help inspect the requirements, write parts of the implementation and tests, refactor the code, and investigate failures. I didn't use parallel agents. I checked the work through source review, type checking, tests, and browser flows. I used the canonical dataset for business values and kept confidence and citations tied to the supplied fixtures.

During cleanup, I removed generated visual artifacts, an unused stylesheet, and the bundled license file. I merged the feature work into `dev` and kept these notes on a separate documentation branch.

I haven't deployed the app or connected real-user performance monitoring. My next steps would be to set up hosting, check that the deployed proxy streams responses without buffering, and measure Core Web Vitals and bundle sizes. I would then set performance budgets and add error tracking with appropriate privacy controls.

For a real product, I would also need shared alert storage and notification delivery. The current browser-local rules are enough to demonstrate the form and recovery flow in this assignment.
