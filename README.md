# Market Operations Console — Initial

Shared project foundation: Next.js, React, strict TypeScript, Tailwind, Tremor components, canonical data and typed contracts, formatting and metric helpers, and Vitest/Testing Library setup.

## Run

Use Node.js 24. No environment variables or API keys are required.

```sh
npm ci
npm run dev
npm test
npm run typecheck
npm run lint
npm run build
```

The initial branch renders a setup screen. Dashboard features and the active assistant are added on their own branches. The supplied data and fixtures are included as source assets; there is no active chat endpoint here.

Branches build on each other: `feat/initial` → `feat/dashboard` → `feat/assistant`. See [the task boundaries](docs/TASKS.md).
