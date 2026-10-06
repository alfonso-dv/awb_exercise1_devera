import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import prettier from "eslint-config-prettier";
import { defineConfig } from "eslint/config";

export default defineConfig([
  { ignores: ["dist/", "node_modules/", "resources/"] },
  js.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      // Type-aware rules (no-floating-promises, no-unsafe-*) need type info.
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname
      },
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.browser
    },
    rules: {
      eqeqeq: "error",
      "no-var": "error",
      "prefer-const": "error",
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" }
      ],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-non-null-assertion": "warn"
    }
  },
  {
    // Rules of Hooks + correct effect dependencies for React components.
    files: ["src/react/**/*.tsx", "src/react/**/*.ts"],
    extends: [reactHooks.configs.flat.recommended]
  },
  {
    // Tooling config files run in Node and aren't part of the app's tsconfig.
    files: ["vite.config.ts", "eslint.config.js"],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: { globals: globals.node }
  },
  // Must stay last: turns off every stylistic rule that would fight Prettier.
  prettier
]);
