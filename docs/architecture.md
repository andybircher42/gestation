# Architecture

Technical overview of **In Due Time** — a React Native/Expo gestational age tracker.

## Stack

- **Expo SDK 54** / React 19 / React Native 0.81.5
- **Expo Router v6** — file-based navigation (`app/` directory)
- **TypeScript** — strict mode with `@/` path alias
- **AsyncStorage** — all persistence is local, on-device
- **EAS Build + Update** — native builds + OTA hot deploys

## Directory Structure

```
app/                        # Expo Router screens
├── _layout.tsx             # Root layout: ErrorBoundary → SafeArea → ThemeProvider → init gate
├── index.tsx               # Home: 3-tab view (expecting / delivered / calendar)
└── date-detail.tsx         # Calendar date drill-down

src/
├── components/             # 19 React Native components + barrel index
├── hooks/                  # useEntries (CRUD), useSwipeDismiss (gestures), useThemePreference
├── storage/                # AsyncStorage wrappers, Entry type, validation
├── theme/                  # 2-axis color system (personality × brightness)
├── engine/                 # Probability math for calendar heat map
├── util/                   # Date parsing, gestational age, birthstones, batch parsing
└── test/                   # Shared test utilities

eslint-rules/               # Custom ESLint plugins
├── version-sync.js         # app.json version === runtimeVersion
└── platform-coverage.js    # Flags asymmetric Platform.OS checks

scripts/                    # Build scripts
└── build-user-guide.js     # Converts user-guide.md to GitHub Pages HTML

docs/                       # Developer documentation
assets/                     # Icons, splash screens, birthstone PNGs, fonts
```

## Key Architectural Patterns

### Theme System (2-Axis)

The theme is defined by two independent axes:

- **Personality** — visual identity: `classic`, `warm`, `elegant`, `playful`, `modern`, `mono`
- **Brightness** — light/dark: `light`, `dark`, `system`

This produces 12 distinct palettes. Each palette is a `ColorTokens` object with 32 named tokens (e.g., `primary`, `textPrimary`, `contentBackground`, `shadow`).

A third axis, **Layout** (`compact` | `cozy`), controls list vs. grid display.

```
ThemeProvider (ThemeContext.tsx)
  ├── Resolves system brightness preference
  ├── Selects palette: personalities[personality][resolvedBrightness]
  └── Exposes: colors, rowColors, resolvedTheme, personality, brightness, layout, setters
```

**Usage**: `const { colors, layout } = useTheme();`

### Dynamic Styles

Every themed component uses the `createStyles(colors)` pattern:

```typescript
const styles = useMemo(() => createStyles(colors), [colors]);
// ...
function createStyles(colors: ColorTokens) {
  return StyleSheet.create({ /* uses colors.* tokens */ });
}
```

This ensures styles recompute only when the palette changes.

### State Management

No external state library. All state lives in hooks:

- **`useEntries`** — entry CRUD, undo/redo, persistence, delivered TTL. Every mutation auto-persists to AsyncStorage with one retry on failure.
- **`useThemePreference`** — theme persistence with legacy migration from the old single-axis `@theme_mode` key.
- **`useSwipeDismiss`** — PanResponder-based gesture recognition with haptic feedback, velocity detection, and reversal cancellation.

### Storage Layer

All data is local. No server, no cloud sync. AsyncStorage keys:

| Key | Purpose |
|-----|---------|
| `@gestation_entries` | Entry array (JSON) |
| `@hipaa_agreement_accepted` | Privacy disclaimer gate |
| `@onboarding_complete` | First-run flag |
| `@delivered_ttl_days` | Auto-purge interval |
| `@device_id` | UUID for analytics |
| `@tester_mode` | Disables analytics |
| `@theme_personality` / `brightness` / `layout` | Theme prefs |

The `Entry` type:

```typescript
interface Entry {
  id: string;             // `${Date.now()}-${counter}`
  name: string;
  dueDate: string;        // ISO YYYY-MM-DD
  createdAt: number;      // Timestamp (ms)
  deliveredAt?: number;   // Set when marked delivered
  birthstone?: Birthstone;
}
```

Entries are validated on load. Corrupted entries are silently discarded and the user is notified via toast.

### Navigation & Init Sequence

`_layout.tsx` orchestrates startup through a phase state machine:

```
init → check agreement → show HIPAA modal (if needed)
     → check onboarding → show overlay (if needed)
     → splash (2s) → ready → render Stack routes
```

All tabs (expecting, delivered, calendar) stay mounted with `display: "none"` toggling — this prevents gem icon flash and layout jumps on tab switch.

### Gesture Architecture

Swipe gestures use a shared `useSwipeDismiss` hook:

- **Left swipe** → delete (both expecting and delivered lists)
- **Right swipe** → deliver (expecting list only)
- **Velocity detection** — fast flicks trigger at 30px instead of full threshold
- **Reversal cancellation** — changing swipe direction mid-gesture cancels the action
- **Haptic feedback** — medium impact when crossing the commit threshold

### Calendar Heat Map

`probabilityEngine.ts` uses a truncated normal distribution (μ=280 days, σ=10, range 140–301) to compute per-day delivery probability across all entries. The calendar renders this as color intensity.

### Error Handling

- **ErrorBoundary** wraps the entire app (outside ThemeProvider). Uses `useThemeSafe()` with try/catch fallback to `lightColors` so it can render even if ThemeProvider is broken.
- **`reportError()`** — `console.error` in dev, Alert in production. Used for all async failures.
- **Save retry** — `persistEntries()` retries once on AsyncStorage failure, then shows a toast.

## Platform Differences

The app has 12+ locations with iOS/Android branching. A custom ESLint rule (`platform-coverage.js`) flags asymmetric `Platform.OS` checks. Key differences:

- **Date picker**: iOS uses inline calendar, Android uses modal
- **LayoutAnimation**: Android requires explicit enablement
- **KeyboardAvoidingView**: iOS `padding`, Android `height`
- **FlatList**: `removeClippedSubviews` enabled only on Android
- **Adaptive icons**: Android-specific foreground/background/monochrome

## Testing

- **32 test files, 468 tests** covering components, hooks, utilities, and engine
- **Jest + jest-expo** with SWC transformer for speed
- **Shared test utilities** — `renderWithTheme`, `mockData` (entry factory), `fakeTimers`, mutable `mockInsets` in `jest.setup.ts`
- **Pre-commit**: lint-staged → expo-doctor → full test suite
- **Pre-push**: blocks `DO NOT` + `SUBMIT` markers
- **No E2E tests** yet (Maestro is the planned tool)

Components are tested with `@testing-library/react-native` using the shared `renderWithTheme` helper.

## Build & Distribution

Three EAS profiles:

| Profile | Distribution | Channel | Use |
|---------|-------------|---------|-----|
| `development` | store | `development` | Dev client |
| `preview` | internal | `preview` | TestFlight / internal |
| `production` | store | `production` | App Store / Play Store |

OTA updates push JS changes without a new binary. A GitHub Actions workflow publishes `latest-build.json` to GitHub Pages so the app can notify users of new native builds.

### GitHub Pages

Two workflows publish to the `gh-pages` branch:

- **Publish Latest Build Info** — deploys `latest-build.json` + user guide (manual trigger)
- **Deploy User Guide** — auto-deploys `_site/guide/index.html` when `docs/user-guide.md` changes on `main`
