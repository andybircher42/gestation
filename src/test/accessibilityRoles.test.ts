import * as fs from "fs";
import * as path from "path";

/**
 * Valid React Native accessibilityRole values that are supported at runtime.
 * Derived from the React Native Android/iOS native implementations.
 * @see https://reactnative.dev/docs/accessibility#accessibilityrole
 */
const VALID_ROLES = new Set([
  "none",
  "button",
  "dropdownlist",
  "togglebutton",
  "link",
  "search",
  "image",
  "keyboardkey",
  "text",
  "adjustable",
  "imagebutton",
  "header",
  "summary",
  "alert",
  "checkbox",
  "combobox",
  "menu",
  "menubar",
  "menuitem",
  "progressbar",
  "radio",
  "radiogroup",
  "scrollbar",
  "spinbutton",
  "switch",
  "tab",
  "tablist",
  "timer",
  "list",
  "toolbar",
  "grid",
  "pager",
  "scrollview",
  "horizontalscrollview",
  "viewgroup",
  "webview",
  "drawerlayout",
  "slidingdrawer",
  "iconmenu",
]);

/** Recursively collect all .tsx files under a directory. */
function collectTsxFiles(dir: string): string[] {
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== "node_modules") {
      results.push(...collectTsxFiles(full));
    } else if (entry.isFile() && /\.tsx$/.test(entry.name)) {
      results.push(full);
    }
  }
  return results;
}

describe("accessibilityRole validation", () => {
  const projectRoot = path.resolve(__dirname, "../..");
  const files = collectTsxFiles(projectRoot).filter(
    (f) => !f.includes("node_modules") && !f.includes(".test."),
  );

  // Match accessibilityRole="value" and accessibilityRole={"value"}
  const pattern = /accessibilityRole=(?:"([^"]+)"|\{"([^"]+)"\})/g;

  it("all accessibilityRole values in source files are valid", () => {
    const violations: string[] = [];

    for (const filePath of files) {
      const content = fs.readFileSync(filePath, "utf-8");
      const lines = content.split("\n");

      for (let i = 0; i < lines.length; i++) {
        let match: RegExpExecArray | null;
        pattern.lastIndex = 0;
        while ((match = pattern.exec(lines[i])) !== null) {
          const role = match[1] ?? match[2];
          if (!VALID_ROLES.has(role)) {
            const relative = path.relative(projectRoot, filePath);
            violations.push(`${relative}:${i + 1} — invalid role "${role}"`);
          }
        }
      }
    }

    if (violations.length > 0) {
      fail(
        `Found invalid accessibilityRole values:\n  ${violations.join("\n  ")}`,
      );
    }
  });
});
