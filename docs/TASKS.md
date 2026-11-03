# Task branches

Integration branch: `dev`. Each task starts from the preceding integrated state and has its own commit and merge. `basic-ui` supplied the initial console shell.

| Task                                     | Branch                            |
| ---------------------------------------- | --------------------------------- |
| 01 · Data contracts                      | `feat/01-data-contracts`          |
| 02 · Data helpers and tests              | `feat/02-data-helpers`            |
| 03 · Dashboard summary                   | `feat/03-dashboard-summary`       |
| 04 · Dashboard navigation and URL state  | `feat/04-dashboard-navigation`    |
| 05 · Mock chat endpoint                  | `feat/05-chat-endpoint`           |
| 06 · Streaming chat                      | `feat/06-streaming-chat`          |
| 07 · Evidence and confidence             | `feat/07-chat-evidence`           |
| 08 · Revenue time-series                 | `feat/08-time-series`             |
| 09 · Country map                         | `feat/09-market-map`              |
| 10 · Comparison radar                    | `feat/10-comparison-radar`        |
| 11 · Performance heat map                | `feat/11-performance-heatmap`     |
| 12 · Audience modes and analyst table    | `feat/12-dashboard-modes`         |
| 13 · Alert configuration                 | `feat/13-alert-configuration`     |
| 14 · Accessibility and resilience        | `fix/14-accessibility-resilience` |
| 15 · CI, E2E, screenshots, documentation | `chore/15-submission`             |

Deployment remains an external handoff: connect the repository to a Next.js-capable host. No hosting account is configured, no remote Git branches have been pushed, and no live URL is claimed. Review the README in your own words before submitting. A video walkthrough is optional and has not been recorded.
