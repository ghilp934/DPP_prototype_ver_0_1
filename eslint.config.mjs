import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  // LOCK-SEC-UI-01: Security rules (eval, innerHTML, dangerouslySetInnerHTML)
  {
    rules: {
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",
      "react/no-danger": "error",
      "no-restricted-properties": [
        "error",
        {
          object: "document",
          property: "write",
          message: "document.write is forbidden for security reasons.",
        },
      ],
      "no-restricted-syntax": [
        "error",
        {
          selector: "MemberExpression[property.name='innerHTML']",
          message: "innerHTML is forbidden (LOCK-SEC-UI-01). Use textContent or React rendering instead.",
        },
        {
          selector: "MemberExpression[property.name='outerHTML']",
          message: "outerHTML is forbidden (LOCK-SEC-UI-01). Use React rendering instead.",
        },
      ],
    },
  },
]);

export default eslintConfig;
