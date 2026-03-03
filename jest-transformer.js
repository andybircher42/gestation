/**
 * Delegating Jest transformer that routes project files to @swc/jest
 * (fast native Rust compiler) and node_modules to babel-jest (needed
 * for Flow types and Expo-specific Babel plugins).
 *
 * Currently the bottleneck is babel-jest transforming node_modules (React
 * Native, Expo, etc.), so the SWC path doesn't noticeably speed up the
 * overall suite yet. The benefit will grow as the project's own source
 * files account for a larger share of compilation time.
 *
 * @type {import("@jest/transform").SyncTransformer}
 */
const { createTransformer: createSwcTransformer } = require("@swc/jest");
const babelJest = require("babel-jest");

const swc = createSwcTransformer({
  jsc: {
    parser: { syntax: "typescript", tsx: true },
    transform: { react: { runtime: "automatic" } },
    target: "es2022",
  },
  module: { type: "commonjs" },
});

const babel = babelJest.createTransformer({
  caller: { name: "metro", bundler: "metro", platform: "ios" },
});

function isNodeModules(filename) {
  return filename.includes("node_modules");
}

/**
 * SWC emits an _export helper that uses Object.defineProperty with
 * configurable defaulting to false, which prevents jest.spyOn from
 * redefining exports. This patches the helper to add configurable: true.
 */
function makeExportsConfigurable(code) {
  return code.replace(
    /enumerable:\s*true,(\s*get:\s*Object\.getOwnPropertyDescriptor)/g,
    "enumerable: true, configurable: true,$1",
  );
}

module.exports = {
  process(src, filename, options) {
    if (isNodeModules(filename)) {
      return babel.process(src, filename, options);
    }
    const result = swc.process(src, filename, options);
    return { ...result, code: makeExportsConfigurable(result.code) };
  },

  getCacheKey(src, filename, options) {
    if (isNodeModules(filename)) {
      return "babel:" + babel.getCacheKey(src, filename, options);
    }
    return "swc:" + swc.getCacheKey(src, filename, options);
  },
};
