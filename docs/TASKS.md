# Tasks and branch boundaries

| Branch           | Base             | Own changes                                                                                                               |
| ---------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `feat/initial`   | Starter commit   | Framework setup, shared components and tokens, canonical data and contracts, metric helpers, unit-test setup, and base CI |
| `feat/dashboard` | `feat/initial`   | Dashboard UI, charts, drill-down, URL state, audience modes, alerts, and dashboard tests                                  |
| `feat/assistant` | `feat/dashboard` | Streaming endpoint/client, chat UI, confidence, citations, dashboard integration, and assistant tests                     |

The branches are stacked. Review the dashboard against initial, and the assistant against dashboard. The dashboard branch contains no chat components, streaming client, or active chat endpoint. Shared data and event contracts belong to initial.

`dev` remains the integration branch. Existing history is retained there while the feature branches are rebuilt with these boundaries. Deployment requires a connected hosting account; no live deployment is configured.
