# Task branches

Integration branch: `dev`. Each task starts from the preceding integrated state and has its own commit and merge. `basic-ui` supplied the initial console shell.

| Task                                     | Branch                         |
| ---------------------------------------- | ------------------------------ |
| 01 · Data contracts                      | `feat/data-contracts`          |
| 02 · Data helpers and tests              | `feat/data-helpers`            |
| 03 · Dashboard summary                   | `feat/dashboard-summary`       |
| 04 · Dashboard navigation and URL state  | `feat/dashboard-navigation`    |
| 05 · Mock chat endpoint                  | `feat/chat-endpoint`           |
| 06 · Streaming chat                      | `feat/streaming-chat`          |
| 07 · Evidence and confidence             | `feat/chat-evidence`           |
| 08 · Revenue time-series                 | `feat/time-series`             |
| 09 · Country map                         | `feat/market-map`              |
| 10 · Comparison radar                    | `feat/comparison-radar`        |
| 11 · Performance heat map                | `feat/performance-heatmap`     |
| 12 · Audience modes and analyst table    | `feat/dashboard-modes`         |
| 13 · Alert configuration                 | `feat/alert-configuration`     |
| 14 · Accessibility and resilience        | `fix/accessibility-resilience` |
| 15 · CI, E2E, screenshots, documentation | `chore/submission`             |

Deployment remains an external handoff: connect the repository to a Next.js-capable host. No hosting account is configured, no remote Git branches have been pushed, and no live URL is claimed. Review the README in your own words before submitting. A video walkthrough is optional and has not been recorded.
