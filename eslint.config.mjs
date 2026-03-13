import eslint from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import jsdoc from "eslint-plugin-jsdoc";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import tseslint from "typescript-eslint";

import platformCoverage from "./eslint-rules/platform-coverage.js";
import versionSync from "./eslint-rules/version-sync.js";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
  {
    plugins: {
      jsdoc,
      "simple-import-sort": simpleImportSort,
      "custom-rn": { rules: { "platform-coverage": platformCoverage, "version-sync": versionSync } },
    },
    rules: {
      "custom-rn/platform-coverage": "warn",
      "custom-rn/version-sync": "error",
      curly: "error",
      "jsdoc/require-jsdoc": [
        "error",
        {
          require: {
            FunctionDeclaration: false,
            MethodDefinition: false,
            ClassDeclaration: false,
          },
          contexts: [
            "ExportNamedDeclaration > FunctionDeclaration",
            "ExportDefaultDeclaration > FunctionDeclaration",
            "ExportNamedDeclaration > VariableDeclaration > VariableDeclarator > ArrowFunctionExpression",
          ],
          checkConstructors: false,
        },
      ],
      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            ["^\\u0000"],
            ["^react", "^@?\\w"],
            ["^@/"],
            ["^\\."],
          ],
        },
      ],
      "simple-import-sort/exports": "error",
    },
  },
  {
    files: ["eslint-rules/**/*.js"],
    languageOptions: {
      globals: {
        module: "readonly",
        require: "readonly",
        console: "readonly",
        process: "readonly",
      },
    },
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  {
    files: ["eslint-rules/**/*.js"],
    languageOptions: {
      sourceType: "commonjs",
      globals: {
        module: "readonly",
        require: "readonly",
        console: "readonly",
        __dirname: "readonly",
        process: "readonly",
      },
    },
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  {
    files: ["eslint-rules/**/*.test.js"],
    languageOptions: {
      globals: {
        describe: "readonly",
        it: "readonly",
        expect: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        jest: "readonly",
      },
    },
  },
  {
    ignores: [
      "node_modules/",
      "babel.config.js",
      "fingerprint.config.js",
      "jest.config.js",
      "jest-transformer.js",
      ".expo/",
      "dist/",
    ],
  },
);
