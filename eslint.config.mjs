import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["src/shared/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: "^(?:@/|(?:\\.\\./)+)(?:app|features)(?:/|$)",
              message:
                "Shared code must not depend on app composition or features.",
            },
          ],
        },
      ],
    },
  },
  ...["dashboard", "alerts", "assistant"].map((feature, _, features) => ({
    files: [`src/features/${feature}/**/*.{ts,tsx}`],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: `^(?:@/|(?:\\.\\./)+)(?:app|(?:features/)?(?:${features.filter((name) => name !== feature).join("|")}))(?:/|$)`,
              message:
                "Compose features in app; import shared contracts instead of another feature's implementation.",
            },
          ],
        },
      ],
    },
  })),
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
