/** @type {import("jest").Config} */
module.exports = {
  preset: "jest-expo",
  setupFiles: ["./jest.setup.ts"],
  moduleNameMapper: { "^@/(.*)$": "<rootDir>/src/$1" },
  modulePathIgnorePatterns: ["<rootDir>/.claude/worktrees"],
  transform: { "\\.[jt]sx?$": "<rootDir>/jest-transformer.js" },
};
