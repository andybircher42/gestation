# ADR 003: Swipe Gestures Instead of Buttons

## Status

Accepted

## Context

Entries need two primary actions: delete and deliver. The original design used visible trash/checkmark buttons on each row. This worked but was visually cluttered — every row had two buttons competing for attention with the actual content.

## Decision

Replace action buttons with swipe gestures: left to delete, right to deliver. Actions are revealed progressively during the swipe with animated icons and haptic feedback at the commit threshold.

A long-press fallback provides the same actions via an Alert menu for accessibility and discoverability.

## Consequences

- **Cleaner UI**: Entry rows show only the name and gestational info. No button clutter.
- **Faster interaction**: Swipe is a single continuous gesture vs. tap-then-confirm.
- **Trade-off**: Swipe gestures are less discoverable than visible buttons. Mitigated by the onboarding overlay and long-press fallback.
- **Trade-off**: Gesture conflicts are possible (e.g., scrolling vs. swiping). Mitigated by axis locking in the PanResponder and reversal cancellation — changing direction mid-swipe cancels the action instead of triggering it.
- **Complexity**: The `useSwipeDismiss` hook handles velocity detection, haptics, threshold animation, and reversal logic. This required several bug fix iterations (swipe getting stuck on iOS, opposite color bleed, accidental triggers on direction change).
