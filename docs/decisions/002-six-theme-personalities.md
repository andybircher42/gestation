# ADR 002: Six Theme Personalities

## Status

Accepted

## Context

The app needed a theme system. Most apps offer light/dark mode and call it done. But this is a personal tool used during long shifts — it should feel like *yours*, not generic.

## Decision

Implement a 2-axis theme system: 6 personalities (classic, warm, elegant, playful, modern, mono) × 2 brightness modes (light, dark) = 12 palettes. Each personality defines 32 color tokens and a 7-color row palette for entry cards.

Brightness and personality are independent — you can pick "warm dark" or "playful light" without either choice constraining the other.

## Consequences

- **Personalization**: Users can make the app feel distinctly theirs.
- **Trade-off**: 12 palettes to maintain. Every new color token must be defined across all 12 variants. This is mitigated by the `ColorTokens` type — TypeScript enforces completeness at compile time.
- **Trade-off**: More QA surface area. Every UI change should be spot-checked across at least 2-3 palettes.
- **Future consideration**: If the palette count becomes burdensome, consider trimming to the most-used personalities based on analytics.
