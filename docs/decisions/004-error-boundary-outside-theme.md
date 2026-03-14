# ADR 004: ErrorBoundary Wraps ThemeProvider

## Status

Accepted

## Context

The ErrorBoundary needs to catch errors from *anywhere* in the component tree, including ThemeProvider itself. If ThemeProvider throws (corrupted storage, context bug), an ErrorBoundary inside it would never catch the error.

But the ErrorBoundary also needs theme colors to render its fallback UI — it should respect dark mode, not show a jarring white screen in a dark-themed app.

## Decision

Place ErrorBoundary outside ThemeProvider in the component tree. The ErrorBoundary component uses a `useThemeSafe()` helper that wraps `useTheme()` in a try/catch. If the theme context isn't available (because ThemeProvider failed), it falls back to `lightColors`.

```
ErrorBoundary (useThemeSafe → try useTheme(), catch → lightColors)
  └── ThemeProvider
        └── App routes
```

## Consequences

- **Robustness**: Catches errors from ThemeProvider and everything below it.
- **Graceful degradation**: Falls back to light theme colors if the theme system is broken, rather than crashing or showing an unstyled screen.
- **Trade-off**: The ErrorBoundary is a class component (React requirement) wrapped in a functional component for hook access. This is slightly awkward but necessary — React does not support `componentDidCatch` in functional components.
