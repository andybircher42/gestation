/**
 * ESLint rule: version-sync
 *
 * Ensures that "version" and "runtimeVersion" in app.json are always
 * equal.  Runs on app.json only (configure via eslint file matching).
 */

const fs = require("fs");
const path = require("path");

/** @type {import("eslint").Rule.RuleModule} */
module.exports = {
  meta: {
    type: "problem",
    docs: {
      description:
        'Ensure "version" and "runtimeVersion" match in app.json',
    },
    messages: {
      mismatch:
        'app.json "version" ({{version}}) and "runtimeVersion" ({{runtimeVersion}}) must match.',
    },
    schema: [],
  },
  create(context) {
    return {
      Program() {
        const appJsonPath = path.resolve(
          context.cwd ?? process.cwd(),
          "app.json",
        );

        let raw;
        try {
          raw = fs.readFileSync(appJsonPath, "utf8");
        } catch {
          return;
        }

        let config;
        try {
          config = JSON.parse(raw);
        } catch {
          return;
        }

        const expo = config.expo ?? config;
        const version = expo.version;
        const runtimeVersion = expo.runtimeVersion;

        if (
          version &&
          runtimeVersion &&
          typeof runtimeVersion === "string" &&
          version !== runtimeVersion
        ) {
          context.report({
            loc: { line: 1, column: 0 },
            messageId: "mismatch",
            data: { version, runtimeVersion },
          });
        }
      },
    };
  },
};
