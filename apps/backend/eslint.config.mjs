import tseslint from "typescript-eslint";
import unusedImportsPlugin from "eslint-plugin-unused-imports"
import eslint from "@eslint/js";
import { globalIgnores } from "eslint/config"
import simpleImportSort from "eslint-plugin-simple-import-sort";

export default tseslint.config(
  globalIgnores(["./experiments", "./src/generated", "./prisma", "*.*js"]),
  eslint.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  {
    plugins: {
      "unused-imports": unusedImportsPlugin,
    },
    rules: {
      "@typescript-eslint/no-unused-vars": "off", // "no-unused-vars": "off"
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          "vars": "all",
          "varsIgnorePattern": "^_",
          "args": "after-used",
          "argsIgnorePattern": "^_",
        },
      ]
    }
  },
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    plugins: {
      "simple-import-sort": simpleImportSort,
    },
    files: ["**/*.ts"],
    rules: {
      "simple-import-sort/imports": "warn",
    },
  },
  {
    rules: {
      "@typescript-eslint/interface-name-prefix": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/consistent-type-definitions": "off",
      "@typescript-eslint/no-unsafe-assignment": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/require-await": "warn",
      "@typescript-eslint/eol-last": "off",
      "@typescript-eslint/space-before-function-paren": "off",
      "space-before-function-paren": "off",
      "no-console": "warn",
    },
  }
);
