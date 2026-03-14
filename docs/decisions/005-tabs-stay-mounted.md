# ADR 005: All Tabs Stay Mounted

## Status

Accepted

## Context

The home screen has three tabs: Expecting, Delivered, and Calendar. Initially, only the active tab was rendered (conditional rendering). This caused two problems:

1. **Gem icon flash on iOS** — Birthstone icon images visibly loaded every time the user switched to a tab, causing a flicker.
2. **Layout jump on Android** — FlatList would re-measure and shift content on mount, causing a visible jump.

## Decision

Keep all three tabs mounted at all times. The inactive tabs are hidden with `display: "none"` instead of being unmounted.

The FlatList components use a `key` prop (`key="cozy"` / `key="compact"`) to force a fresh mount when layout mode changes — this avoids the React Native error "Changing numColumns on the fly is not supported."

## Consequences

- **No flicker**: Images and list layouts persist across tab switches.
- **Instant switching**: No mount/render delay when switching tabs.
- **Trade-off**: Higher memory usage — all three tabs and their FlatLists stay in memory. Mitigated by `removeClippedSubviews` on Android, which reclaims memory for off-screen list items.
- **Trade-off**: State updates in hidden tabs still trigger renders. This hasn't been a measurable issue given the small data set size.
