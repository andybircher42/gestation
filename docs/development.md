# Development Guide

How to set up, run, and work on **In Due Time**.

## Prerequisites

- Node.js 18+
- npm
- Expo Go app on your phone (for quick previewing)
- EAS CLI (`npm install -g eas-cli`) for native builds

## Setup

```bash
git clone https://github.com/andybircher42/InDueTime.git
cd InDueTime
npm install
```

### ChromeOS / Crostini

If you're developing in a ChromeOS Linux container, you need the `--host` flag so your phone can reach the dev server across the network boundary:

```bash
npx expo start --host tunnel
```

## Running

```bash
npm start                    # Start Expo dev server
```

Then scan the QR code with Expo Go, or press `a` (Android emulator) / `i` (iOS simulator).

## Testing

```bash
npm test                     # Run full Jest suite (32 files, 468 tests)
npm test -- --watch          # Watch mode
npm test -- EntryForm        # Run a specific test file
```

Tests use `@testing-library/react-native`. Use the shared `renderWithTheme` helper instead of manually wrapping in `ThemeProvider`:

```typescript
import renderWithTheme from "@/test/renderWithTheme";

renderWithTheme(<YourComponent />);
renderWithTheme(<YourComponent />, { layout: "cozy" }); // override defaults
```

### Shared Test Utilities

Located in `src/test/`:

- **`renderWithTheme.tsx`** — wraps components in `ThemeProvider` with sensible defaults (classic, light, compact)
- **`mockData.ts`** — `makeEntry()` factory for creating test entries; shared `mockEntry` constant used across toast tests
- **`fakeTimers.ts`** — `setupFakeTimers()` / `teardownFakeTimers()` helpers with a default date of March 2, 2026

Global mocks are configured in `jest.setup.ts`, including a mutable `mockInsets` export for tests that need to verify safe area behavior.

## Pre-Commit Hooks

Husky runs automatically on every commit:

1. **lint-staged** — Prettier + ESLint on staged `.ts`/`.tsx` files
2. **expo-doctor** — Checks SDK compatibility
3. **Jest** — Full test suite
4. **Version sync check** — `version` and `runtimeVersion` in `app.json` must match

On push, a hook blocks any file containing `DO NOT` + `SUBMIT`.

## Dev Tools

In development builds (`__DEV__`), the header shows a wrench icon that opens the dev toolbar:

- **Seed data** — Generates randomized test entries with birthstones
- **Reset agreement** — Clears HIPAA acceptance + onboarding to re-trigger the first-run flow
- **Tester mode** — Disables analytics (persists across sessions)

The About modal (Settings → App info) shows a "DEV" badge in development builds.

## Adding a New Theme Personality

1. Open `src/theme/colors.ts`
2. Define `yourNameLightColors` and `yourNameDarkColors` implementing the full `ColorTokens` type (32 properties)
3. Define `yourNameLightRowColors` and `yourNameDarkRowColors` (7-color arrays for entry card backgrounds)
4. Add the personality name to the `Personality` type union
5. Add entries to both `personalityColorMap` and `personalityRowColorMap`
6. Add a label in `ThemePickerModal.tsx` (the personality picker section)

## Adding a New Storage Key

1. Define the key constant in `src/storage/storage.ts`
2. Add load/save/reset functions
3. Export from `src/storage/index.ts`
4. If it needs to load at startup, add to the init sequence in `app/_layout.tsx`

## Common Patterns

### Theme-aware styles

```typescript
import { ColorTokens, useTheme } from "@/theme";

export default function MyComponent() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  // ...
}

function createStyles(colors: ColorTokens) {
  return StyleSheet.create({
    container: { backgroundColor: colors.contentBackground },
    text: { color: colors.textPrimary },
  });
}
```

### Swipe gestures

```typescript
import { useSwipeDismiss } from "@/hooks";

const { animatedValue: translateX, panHandlers } = useSwipeDismiss({
  axis: "x",
  threshold: 80,
  onDismiss: () => handleDelete(id),        // Left swipe
  onDismissPositive: () => handleDeliver(id), // Right swipe (optional)
});

<Animated.View style={{ transform: [{ translateX }] }} {...panHandlers}>
```

### Date utilities

```typescript
import { toISODateString, gestationalAgeFromDueDate, parseDateOrAge } from "@/util";

const iso = toISODateString(new Date());           // "2026-03-13"
const { weeks, days } = gestationalAgeFromDueDate("2026-06-15");
const parsed = parseDateOrAge("35w2d");            // { dueDate: "..." }
```

## EAS Builds

```bash
# Internal testing (TestFlight / internal distribution)
eas build --profile preview --platform all

# Production (App Store / Play Store)
eas build --profile production --platform all

# OTA update (JS-only changes, no new binary needed)
eas update --channel production --message "description"
```

After a new native build, run the **Publish Latest Build Info** GitHub Actions workflow (Actions tab → Run workflow) to notify users of available updates.

### When You Need a New Build vs. OTA

- **OTA** works for: component changes, styles, logic, assets, copy
- **New build** required for: new native modules, SDK upgrade, `app.json` native config changes, `runtimeVersion` bump

## User Guide (GitHub Pages)

The user guide (`docs/user-guide.md`) is auto-deployed to GitHub Pages as a styled HTML page:

**URL**: `https://andybircher42.github.io/InDueTime/guide/`

The build script (`scripts/build-user-guide.js`) converts markdown to HTML with no dependencies. It runs automatically via the `deploy-user-guide` GitHub Actions workflow whenever `docs/user-guide.md` changes on `main`.

To build locally:

```bash
node scripts/build-user-guide.js    # Output: _site/guide/index.html
```

The in-app "Help & FAQ" link checks the hosted page with a HEAD request and falls back to the raw GitHub markdown if it 404s.

## Custom ESLint Rules

Two project-specific rules in `eslint-rules/`:

- **`version-sync`** — Fails if `app.json` version !== runtimeVersion
- **`platform-coverage`** — Warns on `Platform.OS` checks that only handle one platform. Suppress with a comment mentioning the missing platform (e.g., `// Android uses default behavior`)

## File Naming Conventions

- Components: `PascalCase.tsx` with optional `.test.tsx` sibling
- Hooks: `camelCase.ts` (prefixed with `use`)
- Utilities: `camelCase.ts`
- All imports use the `@/` alias pointing to `src/`
