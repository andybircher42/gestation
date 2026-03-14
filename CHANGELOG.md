# Changelog

All notable changes to **In Due Time** are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versions follow [Semantic Versioning](https://semver.org/).

---

## [1.3.0] — 2026-03-13

Major delivered-tab overhaul, three-tab navigation, UI polish pass, and accessibility improvements.

### Added

- **Three-tab navigation** — Expecting, Delivered, and Calendar are now separate tabs instead of inline sections
- **Delivered tab overhaul** — redesigned with timing info ("2 days early", "right on time"), cuter styling, and dedicated cozy card layout
- **Deliver toast with undo** — delivering someone shows a toast with an undo option
- **Delivered entry detail** — tap a delivered entry to view full details in the modal
- **Configurable delivery cleanup** — choose how long delivered entries stay before auto-removal (renamed from "Auto-remove" to "Delivered cleanup")
- **Remove all (delivered tab)** — bulk-remove delivered entries without affecting the expecting list
- **Swipe-to-delete on delivered rows** — compact delivered list supports the same swipe gesture as the expecting list
- **Calendar delivered markers** — baby icon shows on calendar dates where someone was delivered
- **ErrorBoundary** — catches unhandled crashes with a recovery UI instead of a blank screen
- **Toast stacking** — multiple toasts (delete undo, deliver undo, errors) stack instead of replacing each other
- **Cross-platform sort picker** — replaced native Alert-based sort picker with a custom `SortPickerModal` that works identically on iOS and Android
- **Dev tools dropdown** — build indicator in About modal, tester mode, analytics opt-out for internal builds
- **Settings drill-down** — settings modal broken into Appearance and Preferences subgroups with contextual help (?) on each sub-page
- **Help & FAQ link** — opens the hosted user guide from the settings dropdown
- **Inline delivered cleanup info** — Delivered tab header shows current cleanup setting with tap-to-cycle
- **Modal focus trapping** — `accessibilityViewIsModal` on all 7 modals for screen reader users
- **Regression test suite** — DeliveredList layout-switching and filtering tests

### Changed

- **Privacy modal rewrite** — "A quick note about privacy" replaces the legalistic HIPAA language; friendlier tone with "personal notebook, not a chart" framing
- **Copy clarifications** — friendlier error messages, actionable empty states ("Add someone in the Expecting tab…"), consistent voice throughout
- **Cozy empty state** — card-based "Ready when you are" layout distinct from compact's centered text
- **iOS date picker** — switched to inline calendar with tap-to-select; pre-fills today and dismisses keyboard on open
- **Swipe UX** — velocity-based dismissal, haptic feedback, animated delete reveals; reversing direction cancels instead of triggering
- **Sort picker** — current option highlighted with checkmark; "No sort" renamed to "Recently added"
- **Theme tokens** — replaced all hardcoded `#ffffff`, `rgba(255,255,255,…)`, and `shadowColor: "#000"` with `textOnColor`, `textOnColorMuted`, `overlayOnColor`, and `shadow` tokens
- **Mono dark mode** — proper dark palette instead of reusing the light palette
- **Form toolbar** — smaller footprint for the add-someone form
- **Remove all scoping** — "Remove all" on the Expecting tab now only removes expecting entries (previously removed deliveries too)

### Fixed

- **Remove-all deleted wrong group** — "Remove all" on expecting tab was clearing delivered entries too
- **iOS empty state positioning** — "Ready when you are" centered properly when items are removed while form is open
- **Swipe cancel on reversal** — swiping past halfway then reversing no longer triggers the action
- **Swipe opposite color bleed** — swiping right no longer briefly shows the left-side action color
- **Gem flash on tab switch** — birthstone icons no longer flash/reload when switching tabs (all tabs stay mounted)
- **List jump on Android** — layout no longer shifts when navigating between tabs
- **Cozy add card stretching** — single card in last row no longer stretches full width
- **Seed data missing birthstones** — dev seed data now includes correct birth gemstones
- **Build ID fallback** — production builds no longer show "DEV" as the build identifier

### Performance

- **Memoized components** — `BirthstoneIcon` wrapped in `React.memo`; inline styles memoized with `useMemo`
- **Memoized computations** — `new Date()` calls, tab entry counts, and current-month gem cached
- **Touch targets** — sort icon button increased from 36px to 44px minimum
- **Android FlatList** — `removeClippedSubviews` enabled on all FlatLists for Android
- **Accessibility labels** — added to 5+ interactive elements missing them; decorative images marked `accessible={false}`

### Changed

- **Delivered cleanup timing** — changing the cleanup interval no longer immediately removes entries; cleanup applies on next app launch to prevent accidental data loss while browsing options

### Internal

- Added expo-dev-client and future native dependencies
- Switched dev build distribution to store for TestFlight
- Skip Vexo analytics for internal builds and tester mode
- Added 197-case manual QA test plan (`docs/qa-manual-test-plan.md`)
- Tabs kept mounted via `display: "none"` instead of conditional rendering
- **Shared test utilities** — extracted `mockData.ts`, `fakeTimers.ts`, and `mockInsets` to reduce test duplication
- **Reusable `HelpButton` component** — standardized (?) contextual help pattern across settings and batch entry
- **Hosted user guide** — `docs/user-guide.md` auto-deploys to GitHub Pages via workflow; in-app link checks availability and falls back to GitHub
- **ESLint config** — added `scripts/**/*.js` override for Node.js build scripts

---

## [1.1.0] — 2026-03-12

Major feature release: unified input, delivered flow, cozy layout, calendar, birthstones, and much more.

### Added

- **Unified date input** — single text field replaces the due date / gestational age mode switcher; parses "June 15", "6/15", "35w2d", and more
- **Delivered flow** — swipe right to mark someone as delivered; auto-cleanup after 3 days
- **Entry detail modal** — tap any entry (compact or cozy) to view full details
- **Cozy card grid** — 2-column card layout option with birthstone icons and gestational age
- **Layout preference** — switch between compact list and cozy grid in settings
- **Calendar date detail** — tap a date on the calendar to see who's due
- **Birthstone-themed add button** — "Add someone" button shows the current month's birthstone gem
- **Insertion ordering** — entries track `createdAt` for reliable "Recently added" sort
- **Sort controls in cozy layout** — same sort options available in both compact and cozy views
- **Batch entry mode** — add multiple people at once with one entry per line
- **reportError utility** — surfaces production errors via Alert in dev, silent in production
- **Version sync lint rule** — pre-commit check ensures `version` and `runtimeVersion` stay in sync

### Changed

- **Sort picker** — replaced segmented control with icon-triggered action sheet
- **Add button** — restyled with smaller birthstone gems and better spacing
- **Settings label** — "Style" renamed to "Theme" for clarity
- **Example names** — gender-neutral placeholder names in forms
- **Date validation** — out-of-range errors shown immediately; iOS picker clamped to valid range

### Fixed

- **Swipe stuck on iOS** — handled `onPanResponderTerminate` to prevent gestures from locking up
- **Flaky HomeScreen test** — replaced `act()` flush with `waitFor` for reliable async assertions
- **ESLint globals** — added `process` and `jest` globals for eslint-rules directory
- **Duplicate dependency** — removed expo-insights to fix version mismatch with Vexo

### Internal

- Switched Vexo to static import per official docs
- Added `.claude/` to `.gitignore`
- Dynamic requires for `vexo-analytics` and `expo-updates` for Expo Go compatibility
- Updated minor/patch dependencies including vexo-analytics 1.5.4

---

## [1.0.0] — 2026-03-02

Initial release of **In Due Time**, a privacy-first gestational age tracker for birth workers.

### Added

- **Core tracking** — add people with name and due date, view in a sortable list
- **Gestational age** — automatic computation from due date, displayed as weeks + days
- **Due date input** — typed date input with flexible format parsing (MM-DD-YYYY, M-D-YY, etc.) and calendar picker
- **Date validation** — range checking, blur-based error display, auto-formatting
- **Sorting** — toggleable sort by name or due date with ascending/descending
- **Swipe-to-delete** — swipe left on any entry to remove; undo toast for recovery
- **Delete all** — bulk removal with confirmation dialog
- **HIPAA disclaimer** — first-launch privacy agreement modal
- **Dark mode** — theme toggle with persistent preference (light, dark, system)
- **Theme system** — 6 personality themes (Classic, Warm, Elegant, Playful, Modern, Mono) × 2 brightness modes = 12 palettes
- **Theme picker** — dropdown modal for selecting personality and brightness
- **Calendar heat map** — month view with color-coded density of due dates
- **Birthstone icons** — gem icons based on due date month, displayed in entry rows
- **Dev seed data** — one-tap test data generation with randomized entries
- **Loading screen** — branded splash with app logo
- **Branding** — custom app icon, splash screen, header logo, "in due time" wordmark
- **Safe area support** — proper insets for header and toast positioning
- **Keyboard handling** — `KeyboardAvoidingView` with platform-specific behavior
- **Persistent storage** — AsyncStorage for entries, theme preference, and agreement state
- **OTA updates** — EAS Update configured for immediate application on launch

### Internal

- Full TypeScript migration from JavaScript
- Jest test suite with 22+ tests covering all source files
- ESLint + Prettier with pre-commit hooks (expo-doctor, tests, lint)
- GitHub Actions CI with Jest cache
- Expo SDK 54, React 19, React Native 0.81.5
- Expo Router v6 with file-based navigation
- JSDoc documentation on all exported functions
- SWC transformer for fast Jest execution
- EAS Build configured for Android preview builds
- Barrel exports for components, hooks, util, theme, and storage

---

[1.3.0]: https://github.com/andybircher42/gestation/compare/38adeb9...HEAD
[1.1.0]: https://github.com/andybircher42/gestation/compare/6003b68...38adeb9
[1.0.0]: https://github.com/andybircher42/gestation/compare/6003b68...6003b68
