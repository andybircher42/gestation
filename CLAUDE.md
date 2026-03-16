## Design Context

### Users
Midwives and birth workers tracking multiple pregnancies simultaneously. They open the app at the start of a shift to scan their caseload, during appointments to check gestational ages, and in delivery rooms (often dim) to confirm details. They may track dozens of families at once. Speed and scannability matter more than visual delight.

### Brand Personality
**Warm, reliable, personal.** Like a trusted colleague's notebook — approachable but professional. The app name "in due time" is always lowercase, reflecting a calm, unhurried confidence. Birthstone gems are the signature visual element, connecting each pregnancy to something tangible and personal.

### Aesthetic Direction
- **Visual tone**: Grounded and warm, not sterile or flashy. Color comes from the 7-color row palette and birthstone cards, not from gradients or effects.
- **Light/dark**: Both supported, with 6 personality themes (classic, warm, elegant, playful, modern, mono). System brightness follows device setting by default.
- **Typography**: System fonts throughout. No custom display fonts currently loaded.
- **Anti-references**: Must NOT look like a medical/clinical app (no sterile whites, no hospital UI). Must NOT look like a generic list/notes app (should feel purpose-built for pregnancy tracking). A consumer baby tracker (cutesy illustrations, milestone photos) is acceptable as a secondary audience but the primary user is a professional.

### Design Principles

1. **Urgency first** — The most time-sensitive information (gestational age, due date proximity) should be the most visually prominent element on any screen. A midwife scanning 30 cards should spot who needs attention without reading.

2. **One tap, not three** — Every common action should be reachable in one interaction. Sort cycling, theme switching, and entry management should never require navigating through sub-pages or modals when an inline control works.

3. **Earn every pixel** — On mobile, space is scarce. Every label, icon, and element must justify its presence. Redundant information (e.g., "Delivered:" on the delivered tab) gets cut. If the context already communicates it, the UI doesn't need to say it again.

4. **Consistent language** — Use "Remove" (not "Delete"), "someone" (not "client" or "person"), and sentence case throughout. Action verbs should be parallel across similar interactions.

5. **Invisible resilience** — Handle long names, large datasets, batch input edge cases, and text overflow gracefully. The app should never break visually regardless of what a user enters. Performance optimizations (FlatList tuning, memoization) should be in place before the list grows.
