# In Due Time — Product Requirements Document

**Version:** 1.0 draft
**Date:** 2026-03-12
**Status:** Working document — pricing, referral thresholds, and free/Pro tier boundaries are TBD throughout

---

## Compliance check against Section 1 constraints

The current codebase has **no conflicts** with the architectural constraints defined in Section 1. The app is fully local-first today: all patient data is stored on-device via AsyncStorage, there are no API calls, no server sync, and no network transmission of patient data. The only external service is anonymous telemetry (vexo-analytics, production builds only). The HIPAA disclaimer at first launch explicitly states the app is not HIPAA compliant and instructs users not to enter PHI.

**One item to monitor:** The `Patient` model stores `name` (first name only) and an `id` field. As server-side features are introduced (Groups, Calendar sync), the architecture must ensure these fields never leave the device except through the approved encrypted-SMS channel. The existing `getOrCreateDeviceId()` function generates a persistent device UUID — this can serve as the basis for the anonymized provider identity used in server-side coordination, but must remain decoupled from any patient data.

---

## 1. Non-negotiable architectural constraints

These are hard product requirements and legal boundaries. They cannot be changed, worked around, or relaxed. Any feature that would violate them is permanently out of scope.

### Constraint 1: Patient data is device-local only

Patient names and all patient identifiers are stored locally on the user's device only. The app's servers never receive, store, process, or transmit any patient names or patient-identifying information. This is both a deliberate product design decision and a legal boundary. The app is not a HIPAA-covered entity and must not become one. The moment patient identifiers touch the app's servers, the legal and compliance architecture of the entire product changes irreversibly.

### Constraint 2: Server layer is anonymized only

The server layer stores only anonymized scheduling and availability data. Coverage requests, calendar state, busyness signals, and practice coordination data must be architected so they are meaningful without any patient identity attached. A coverage request is a time slot and a delivery context (e.g. spontaneous labor, scheduled induction) — never a named patient.

### Constraint 3: Device-to-device transfer via local mechanisms only

Device-to-device transfer of local patient data must occur via direct local transfer only. Acceptable mechanisms: Bluetooth, local WiFi, QR code pairing. The app's servers must not serve as an intermediary for this transfer at any point.

### Constraint 4: Patient handoff via encrypted SMS deep link

Patient handoff between providers must use an encrypted deep-link payload delivered via SMS — never via the app's servers. The architecture:

- The sending provider initiates a handoff in the app
- The app constructs a URL containing an encrypted, time-limited patient payload embedded directly in the URL string — not stored on or retrieved from any server
- The app opens the native SMS composer with the URL pre-populated; the sending provider transmits it via SMS, entirely outside the app's infrastructure
- The receiving provider taps the link; the OS recognizes the URL scheme and opens the app
- The app decrypts the payload locally and presents the patient details with an Accept / Decline prompt
- If accepted, the patient record is written to the receiving provider's local storage only
- The app's server records only the anonymized coverage event: a time slot, two provider IDs, and an accepted/declined status — never any patient identity
- The URL must include an expiry timestamp and an HMAC signature to prevent tampering and replay attacks
- If the receiving provider does not have the app installed, the link must fail gracefully with a human-readable fallback message in the SMS body
- Declined or unacknowledged handoffs must trigger a server-side notification back to the sending provider, using only the anonymized event ID

### Constraint 5: In-app group transfers follow the same rules

The in-app group transfer flow (see Groups feature in Section 6) is subject to the same constraints as the SMS handoff. The in-app notification carries only the anonymized event. Patient details transfer via the same encrypted payload mechanism. Group membership never exposes one provider's patient list to another provider — only availability, load signals, and coverage events are shared at the group level.

---

## 2. Product vision and goals

### Vision

In Due Time is a forward-facing capacity planning tool for obstetric providers. It helps midwives, OB-GYNs, and birth workers anticipate their upcoming delivery workload, coordinate coverage with colleagues, and maintain work-life balance — all without creating a clinical record or handling PHI through centralized infrastructure.

### Goals

1. **Anticipate workload.** Give providers a probabilistic view of when their patients are likely to deliver, aggregated across their full panel.
2. **Coordinate coverage.** Enable seamless patient handoff between providers for vacations, high-volume periods, and unexpected absences — without exposing patient identity to any server.
3. **Protect work-life balance.** Surface patterns, conflicts, and opportunities for scheduling flexibility so providers can plan proactively rather than react to crises.
4. **Stay out of the clinical record.** The app is deliberately not a medical record system. It tracks timing, not outcomes. This keeps the product lightweight, the compliance posture clean, and the user experience focused.

---

## 3. Target users

### Primary: Independent and small-practice obstetric providers

- **Midwives** (CNMs, CPMs) in independent or small group practices
- **OB-GYNs** managing their own patient panels
- **Birth center staff** coordinating on-call coverage

### Common characteristics

- Manage 5–30 active patients at any given time
- Need to plan weeks ahead for likely delivery clusters
- Coordinate coverage informally with colleagues (text, phone, hallway conversations)
- Value work-life balance but lack tools to plan for it proactively
- Wary of complex clinical software and HIPAA overhead for what is essentially a personal scheduling concern

### Secondary: Practice managers and group coordinators

- Manage on-call schedules across a provider group
- Need visibility into aggregate patient load without seeing individual patient records

---

## 4. Core use cases

### Use case 1: Track my patient panel (exists today)

A provider adds each patient by first name and estimated due date (or gestational age). The app calculates the birthstone month, assigns a visual identity, and adds the patient to the provider's local list. The provider can view, edit, and remove patients at any time.

### Use case 2: See when deliveries are likely (exists today)

The calendar heat map shows aggregated delivery probability across all active patients for the next 11 months. Color intensity indicates days where multiple deliveries are likely to overlap. Individual patient due dates are marked on the calendar. The probability model accounts for the standard distribution of spontaneous labor onset and the effect of induction at 41 weeks.

### Use case 3: Hand off a patient to another provider (planned — see Section 6)

When a provider needs coverage — for a vacation, a high-volume week, or an unexpected absence — they initiate a handoff. The app constructs an encrypted SMS deep link containing the patient details. The receiving provider accepts or declines. Patient identity never touches the app's servers. *(Subject to Constraints 1, 2, and 4.)*

### Use case 4: Coordinate within a practice group (planned, Pro tier — see Section 6)

Providers in the same practice join a shared group. They can see each other's aggregate load and availability — but not individual patient lists. A provider can transfer a patient to a colleague within the group via in-app notification, with patient details delivered through the same encrypted payload mechanism as SMS handoff. *(Subject to Constraints 1, 2, and 5.)*

### Use case 5: Plan around personal commitments (planned, Pro tier — see Section 6)

A provider links their Google Calendar. The app surfaces conflicts between personal events and likely delivery windows. The provider sets flexibility scores for specific time slots, enabling smarter coverage recommendations.

---

## 5. Feature requirements — what exists today

This section describes the current state of the codebase as of the `rewrite` branch. All features listed here are implemented and functional.

### 5.1 Patient management

| Capability | Status | Implementation |
|---|---|---|
| Add patient (name + EDD or GA) | Built | 3-step modal wizard in `AddPatientScreen` |
| Edit patient | Built | Same wizard in edit mode, launched from `ViewPatientScreen` |
| Remove patient | Built | Long-press on tile (Home) or menu action (ViewPatient) |
| Undo removal | Built | 5-second undo toast via `usePatients` hook |
| Persistence | Built | AsyncStorage with validation and corruption recovery |

**Patient model** (defined in `src/storage/storage.ts`):
- `id`: string — unique, generated client-side (`p-{timestamp}-{counter}`)
- `name`: string — first name only
- `edd`: string — ISO date (YYYY-MM-DD), estimated due date
- `lmpDate`: string (optional) — last menstrual period date
- `birthstone`: `{ name: string, color: string }` — auto-assigned by EDD month

**Data entry modes:**
- **Due date input**: MM/DD format with auto-formatting and validation
- **Gestational age input**: Weeks + days with smart auto-advance (single digit 2–9 skips to days; 0–1 waits for second digit). Toggle between modes via swap icon.

### 5.2 Delivery probability engine

The probability engine (`src/engine/probabilityEngine.ts`) models delivery timing using a truncated normal distribution with induction adjustment:

- **Base model**: Normal distribution, μ=280 days (40 weeks), σ=10 days
- **Support**: Truncated to gestational days 140–301 (20w0d to 43w0d)
- **Induction adjustment**: At day 287 (41w0d), all remaining tail probability mass is collapsed onto a single day, modeling the clinical reality that most providers induce by 41 weeks
- **Conditional probability**: Given that a patient hasn't delivered yet (based on current GA), what's the probability of delivery on any future day?
- **Multi-patient aggregation**: Sum conditional probabilities across all patients for any calendar date to produce a delivery "load" score

### 5.3 Calendar heat map

- 11-month scrollable calendar (current month + 10 forward)
- Each day cell colored by aggregate delivery load: transparent (< 0.5% combined probability) through 40% opacity purple (≥ 10% combined probability)
- Patient due dates marked on individual cells with birthstone-colored indicators
- Overflow label when 4+ patients share the same due date
- Empty state when no patients are tracked

### 5.4 Visual identity system

Each patient is assigned a birthstone based on their due date month. The 12 birthstones (Garnet through Turquoise) each have a distinct color and gem image. This provides:
- Color-coded patient tiles on the home grid
- Birthstone icon on patient cards and detail views
- Visual differentiation across the calendar

### 5.5 Onboarding and compliance

- **HIPAA disclaimer**: Modal presented at first launch. Must accept to proceed; declining exits the app. Text explicitly states the app is not HIPAA compliant and instructs users not to enter PHI. *(Aligns with Constraint 1.)*
- **Onboarding sequence**: Four-line animated text introducing the app's value proposition, followed by "Get Started" button
- **Persistence**: Both agreement acceptance and onboarding completion are tracked in AsyncStorage

### 5.6 Navigation and UX flows

**Screen flow:**

```
Launch → [HIPAA Disclaimer if needed] → Onboarding (first time) → Home
                                                                    ↕
                                                              AddPatient (modal)
                                                              ViewPatient (detail)
```

- `LaunchScreen`: Splash with agreement check, 1.5s delay, routes to Onboarding or Home
- `OnboardingScreen`: Staggered text reveal animation, "Get Started" commits and navigates to Home
- `HomeScreen`: Two tabs — Patients (2-column grid) and Calendar (heat map). Add button at end of grid.
- `AddPatientScreen`: Presented as native modal (slide-up on iOS). Three steps: Name → Due Date/GA → Confirmation. Keyboard-aware CTA positioning. Step 3 "Done" dismisses modal and returns patient to Home.
- `ViewPatientScreen`: Full-screen patient card with 3D flip animation from tile origin. Edit/Remove/Schedule menu. Nearby patients (±14 days) listed below card.

### 5.7 Animations

- Tile-to-card expand/collapse with position, scale, and Y-axis rotation
- Content counter-rotation so text remains readable through the flip
- Fade transitions between AddPatient steps
- Staggered opacity reveal on onboarding text
- Blinking cursor and label collapse/expand in gestational age input
- Perspective separation for iOS 3D transform compatibility

### 5.8 Platform support

- **iOS**: Primary target. Native modal presentation, ActionSheetIOS menus, keyboard-aware layout, safe area handling.
- **Android**: Supported. Modal fallback menus, keyboard-did-show events, adaptive icons.
- **Web**: Functional with limitations. No native modal animations, hardcoded keyboard offset, `window.confirm` for delete confirmation.

### 5.9 Theming

Three visual themes (light, dark, monochrome) with system preference detection. Theme selection persists via AsyncStorage. Implemented via React Context with color token system. *Note: The current screens (Home, AddPatient, ViewPatient) use hardcoded colors (#f0f1d6 background, #391b59 primary) and do not yet consume the theme context. The theme system exists in infrastructure but is not applied to the main UI.*

### 5.10 Testing

17 test suites, 258 tests. Coverage includes:
- Storage layer (validation, corruption recovery, persistence)
- Utility functions (date parsing, gestational age calculations)
- Components (modals, toasts, forms, toolbar)
- Hooks (entries, theme preference, swipe gesture)

---

## 6. Feature requirements — planned

All features in this section are **not yet implemented**. They are documented as planned/future scope.

### 6.1 Patient status actions (planned, free tier)

Three distinct actions available on any active patient:

**"Hand off"** (label TBD)
- Available on any active patient
- Handles both spontaneous labor and scheduled deliveries
- A coverage flow captures timing after the action is initiated
- Encompasses both finding new coverage and recording an already-agreed transfer
- This is the UX surface for the encrypted SMS deep-link architecture described in Constraint 4
- *(Subject to Constraints 1, 2, and 4)*

**"Close out"**
- Single-tap archiving action
- Simple and final — no outcome fields, no date capture, no confirmation dialog if possible
- Patient is removed from the active list
- Deliberately minimal: the app's value prop is forward-facing capacity planning, not clinical record-keeping

**"Schedule delivery"**
- Marks a patient as having a confirmed scheduled c-section or induction
- Replaces or overrides the estimated due date with a confirmed delivery date
- *Note: This action appears in the current ViewPatient menu but is labeled "not yet implemented" in code*

### 6.2 Information architecture updates (planned, free tier)

**Archived patients section**
- Separate view for patients who have been closed out
- Reactivation capability to move an archived patient back to active status
- Covers scenarios like preterm labor that resolves or a premature close-out

### 6.3 Authentication (planned, free tier)

**Biometric login**
- Face ID / fingerprint authentication
- Required during first-time setup — not optional
- Protects local patient data on the device

### 6.4 Calendar — personal integration (planned, Pro tier)

- Link to personal Google Calendar
- Surface personal busy days and times within the app
- Identify conflicts between personal busy times and likely on-call or delivery windows
- Allow providers to set a "flexibility score" for specific days, times, or events — indicating willingness to be available or covered during those windows
- *(The Google Calendar integration fetches data into the device. Calendar event details must remain local. Only anonymized availability/flexibility signals may be shared with the server for group coordination. Subject to Constraint 2.)*

### 6.5 Groups — practice coordination (planned, Pro tier)

- Invite colleagues to join a shared group for capacity planning within a practice or clinic
- Scan across the group for patient load rebalancing opportunities — identifying providers who are over- or under-loaded
- Transfer a patient to another provider within the group via in-app notification
  - This is a distinct flow from the SMS deep-link handoff, used when both providers are in the same group
  - *(Subject to Constraints 1, 2, and 5. The in-app notification carries only the anonymized event. Patient details transfer via the same encrypted payload mechanism. Group membership never exposes individual patient lists — only availability, load signals, and anonymized coverage events are visible at the group level.)*

**Tension to flag:** The Groups feature requires a server-side component for group membership, load signals, and coverage events. The server must be architected from the ground up to work with anonymized data only. Specifically:
- Patient load signals must be expressed as numeric counts or time-slot density, never as patient lists
- Coverage events reference only a time slot, delivery context, and two provider IDs
- The encrypted patient payload for in-app transfers must use the same client-side encryption as SMS deep links, with the server acting only as a notification transport for the anonymized event wrapper — never decrypting or inspecting the payload

### 6.6 Week/month planning view (planned, Pro tier)

- Set flexibility scores for upcoming periods
- Review how the previous week or month went in terms of work-life balance
- Compare to prior periods
- Surface advice or nudges for how to improve the coming period based on observed patterns

---

## 7. UX flows — planned

### 7.1 Handoff flow (SMS deep link)

```
Provider A: ViewPatient → "Hand off" → Coverage timing form → Generate encrypted URL
    → Native SMS composer opens with pre-populated URL + fallback message
    → Provider A sends SMS (outside app infrastructure)

Provider B: Receives SMS → Taps link → App opens (or fallback message if not installed)
    → App decrypts payload locally → Accept / Decline prompt
    → If accepted: patient written to Provider B's local storage
    → Server records: anonymized event (time slot, provider IDs, status)

If declined or unacknowledged:
    → Server sends anonymized notification to Provider A (event ID only)
```

### 7.2 In-app group transfer flow

```
Provider A: ViewPatient → "Hand off" → Select group member → Confirm
    → App constructs encrypted patient payload
    → Server delivers anonymized coverage event notification to Provider B
    → Encrypted payload delivered via same mechanism (not through server)

Provider B: Receives in-app notification (anonymized: time slot + context)
    → Opens notification → App decrypts payload locally → Accept / Decline
    → If accepted: patient written to Provider B's local storage
    → Server records: anonymized event status update
```

*(Subject to Constraint 5. The critical architectural question is how the encrypted payload reaches Provider B without transiting the server. Options include: piggybacking on push notification payload, establishing a direct device-to-device channel within the app, or using a one-time-use encrypted blob stored ephemerally. Each has trade-offs against Constraint 5 that must be resolved in technical design.)*

### 7.3 Invite flows (two modes)

**Mode A: Invite to join my group**
```
Provider A: Groups → Invite → "Join my group" → Enter colleague's contact info
    → SMS/email sent with group invite link + app download link
    → Colleague installs app → Completes onboarding + biometric setup
    → Opens invite link → Joins group → Pro tier trial begins
```

**Mode B: Invite to use independently**
```
Provider A: Settings/Share → "Invite a colleague" → Enter contact info
    → SMS/email sent with app download link + referral code
    → Colleague installs app → Completes onboarding + biometric setup
    → Free trial begins → No group affiliation
```

These are distinct UX flows with different onboarding outcomes. Mode A results in group membership (Pro tier). Mode B results in an independent account (free tier trial).

---

## 8. Information architecture

### Current (built)

```
Home
├── Patients tab
│   ├── Patient tile grid (2 columns)
│   │   ├── [Patient Card] → ViewPatient
│   │   │   ├── Edit → AddPatient (edit mode)
│   │   │   ├── Remove (with confirmation)
│   │   │   ├── Schedule delivery (stub)
│   │   │   └── Nearby patients list
│   │   └── [+ Add a patient] → AddPatient (modal)
│   │       ├── Step 1: Name
│   │       ├── Step 2: Due date / Gestational age
│   │       └── Step 3: Confirmation + Done / Add Another
│   └── (empty state)
└── Calendar tab
    ├── 11-month heat map scroll
    └── (empty state)
```

### Planned additions

```
Home
├── Patients tab (active patients — as today)
├── Calendar tab (enhanced — Pro tier adds personal calendar overlay)
├── Archived tab (new — closed-out patients, reactivation)
├── Groups tab (new, Pro tier — group members, load overview, transfers)
└── Planning tab (new, Pro tier — week/month flexibility, retrospective)

ViewPatient
├── Hand off → Coverage flow → SMS or in-app transfer
├── Close out → Archive immediately
└── Schedule delivery → Confirm date → Override EDD

Settings
├── Biometric setup
├── Google Calendar link (Pro tier)
├── Group management (Pro tier)
├── Invite colleagues
└── Subscription management
```

---

## 9. Technical architecture

### Current stack

| Layer | Technology |
|---|---|
| Framework | React Native 0.81.5 via Expo SDK 54 |
| Language | TypeScript (strict mode) |
| Navigation | React Navigation 7 (native-stack) |
| Storage | AsyncStorage (unencrypted, device-local) |
| State management | React hooks (`useState`, `useCallback`, custom hooks) |
| Animations | React Native `Animated` API (native driver where possible) |
| Fonts | Fraunces (display), DM Sans (body) via expo-font |
| Analytics | vexo-analytics (anonymous, production only) |
| Testing | Jest + SWC transformer |
| Build/Deploy | EAS Build + EAS Update (OTA) |

### Current data flow

```
User input → React state → AsyncStorage (device-local)
                         → Probability engine (in-memory computation)
                         → Calendar heat map (derived view)
```

No server. No network calls. No authentication. All computation is client-side.

### Planned architectural additions

**Server layer** (required for Groups, handoff event tracking, notifications):
- Must store only anonymized data (Constraint 2)
- Provider identity via device-generated UUID (existing `getOrCreateDeviceId()`)
- Event records: `{ eventId, timeSlot, deliveryContext, providerA_id, providerB_id, status, timestamp }`
- Group records: `{ groupId, memberProviderIds[], aggregateLoadSignals }`
- Push notification infrastructure for group transfer events and handoff status updates

**Encryption layer** (required for SMS handoff and group transfers):
- Client-side encryption of patient payload into URL-safe format
- HMAC signature for tamper detection
- Expiry timestamp embedded in payload
- Key management strategy TBD — must not depend on server-held secrets that would give the server access to patient data *(Constraint 4)*

**Authentication layer** (required for biometric login):
- Device-local biometric gate (Face ID / Touch ID / fingerprint)
- No server-side authentication for the free tier
- Server-side provider identity required for Pro tier (Groups, Calendar sync)

**Storage encryption** (recommended alongside biometric login):
- Current storage is unencrypted AsyncStorage — the HIPAA disclaimer acknowledges this
- Biometric login implies a user expectation of data protection at rest
- Consider encrypting local patient data with a device-derived key

### Constraint adherence in planned architecture

| Component | Constraint | Adherence strategy |
|---|---|---|
| Server database | C1, C2 | Schema physically cannot store patient name/identifier fields |
| SMS handoff | C4 | Payload encrypted client-side, embedded in URL, transmitted via OS SMS |
| Group transfers | C5 | Same encrypted payload mechanism; server sees only anonymized event |
| Device transfer | C3 | Bluetooth/WiFi/QR only — no server intermediary |
| Google Calendar | C1 | Calendar data pulled to device only; server receives flexibility scores, not event details |
| Push notifications | C1, C5 | Notification body contains event ID only; patient payload delivered separately |

---

## 10. Business model

### Freemium structure

**Free tier:**
- Patient tracking (add, edit, remove, archive)
- Delivery probability engine and calendar heat map
- Patient handoff via SMS deep link
- Biometric login
- Patient status actions (hand off, close out, schedule delivery)

**Pro tier** (pricing TBD):
- Google Calendar integration with conflict detection
- Groups — practice coordination, in-app transfers, load visibility
- Week/month planning view with flexibility scores and retrospectives

### Trial and referral

- **Free trial**: 1 month free for the signing-up provider and everyone they invite during the trial period
- **No credit card required** to start the trial
- **Referral incentive**: If N invited users convert to paid, the inviting provider receives 1 additional free month
  - The value of N is **TBD**
  - The exact boundary between free and Pro features is **TBD** and may shift based on market testing

### Note on pricing

Pricing, the referral conversion threshold (N), and the precise free/Pro feature boundary are all TBD. They should not be treated as final. The free tier must deliver enough standalone value (patient tracking, probability calendar, SMS handoff) that providers adopt and retain the app without paying. The Pro tier must deliver enough coordination value (groups, calendar, planning) that practices are willing to pay per-provider.

---

## Appendix: Glossary

| Term | Definition |
|---|---|
| EDD | Estimated due date. Calculated as 280 days from last menstrual period. |
| GA | Gestational age. Expressed as weeks + days (e.g. 38w2d). |
| Birthstone | Visual identity assigned to a patient based on their due date month. |
| Delivery load | Sum of conditional delivery probabilities across all patients for a given calendar date. |
| Heat map | Calendar visualization where color intensity represents delivery load. |
| Handoff | Transfer of patient responsibility from one provider to another. |
| Coverage event | An anonymized record of a handoff: time slot, delivery context, provider IDs, status. |
| Flexibility score | A provider's self-reported willingness to be available during a specific time window. |
