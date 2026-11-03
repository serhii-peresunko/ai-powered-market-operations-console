# Tasks and branches

Integration branch: `dev`. Work is grouped into three tasks:

| Task      | Branch           | Includes                                                                                              |
| --------- | ---------------- | ----------------------------------------------------------------------------------------------------- |
| Initial   | `feat/initial`   | Project setup, starter data, types, shared components, styling tokens, metric helpers, and test setup |
| Dashboard | `feat/dashboard` | Metrics, four charts, drill-down, URL state, audience modes, and alert configuration                  |
| Assistant | `feat/assistant` | Streaming chat, stop/retry, citations, confidence, and dashboard integration                          |

Accessibility, tests, CI, screenshots, and documentation belong to the relevant task; there is no separate finishing task.

The original commits and merge history are preserved. These branches are cumulative checkpoints of the existing implementation. The complete verified application is on `dev` and `feat/assistant`.

Deployment remains an external handoff: connect the repository to a Next.js-capable host. No hosting account is configured, no remote Git branches have been pushed, and no live URL is claimed. Review the README in your own words before submitting. A video walkthrough is optional and has not been recorded.
