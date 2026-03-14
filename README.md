# In Due Time

A privacy-first gestational age tracker for birth workers — nurses, OBs, doulas, midwives, and anyone tracking due dates. Everything stays on your device.

Built with Expo (React Native) for iOS and Android.

## Features

- **Track due dates** — add people with a name and due date or gestational age
- **Unified input** — type "June 15", "6/15", "35w2d", or any common format
- **Batch entry** — add multiple people at once, one per line
- **Swipe gestures** — swipe left to delete, right to mark as delivered
- **Delivered tracking** — delivered entries show timing info ("2 days early") with configurable auto-cleanup
- **Calendar heat map** — month view with color-coded delivery probability
- **6 theme personalities** — Classic, Warm, Elegant, Playful, Modern, Mono — each with light and dark mode
- **Compact & cozy layouts** — list view or card grid
- **Birthstone icons** — gem icons based on due date month
- **Privacy first** — all data stays on-device, no server, no cloud sync

## Setup

```bash
npm install
```

## Running

```bash
npm start
```

Then:

- Install **Expo Go** on your phone ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) / [iOS](https://apps.apple.com/app/expo-go/id982107779)) and scan the QR code
- Press `a` for Android emulator
- Press `i` for iOS simulator

## Testing

```bash
npm test                     # Full suite (32 files, 468 tests)
npm test -- --watch          # Watch mode
npm test -- EntryForm        # Specific file
```

## Building

```bash
# Internal testing (TestFlight / internal distribution)
eas build --profile preview --platform all

# Production (App Store / Play Store)
eas build --profile production --platform all

# OTA update (JS-only changes)
eas update --channel production --message "description"
```

See the [Development Guide](docs/development.md) for full setup details, dev tools, and common patterns.

## EAS Channels

| Channel | Build Profile | Use Case |
|---------|---------------|----------|
| `development` | `development` | Dev client testing |
| `preview` | `preview` | Internal testers / TestFlight |
| `production` | `production` | Live app store users |

### Build Notifications

After creating a new EAS build, run the **Publish Latest Build Info** GitHub Actions workflow to notify users of available updates:

**Actions** tab → **Publish Latest Build Info** → **Run workflow**

One-time setup:
1. Add `EXPO_TOKEN` secret (Settings → Secrets → Actions)
2. Enable GitHub Pages (Settings → Pages → `gh-pages` branch)

## Documentation

- [Architecture](docs/architecture.md) — system design, key patterns, data flow
- [Development Guide](docs/development.md) — setup, dev tools, how to add themes/storage
- [Architecture Decision Records](docs/decisions/) — why things are built the way they are
- [Changelog](CHANGELOG.md) — release notes for every version
- [User Guide](docs/user-guide.md) — how to use the app, FAQ
- [QA Test Plan](docs/qa-manual-test-plan.md) — 197 manual test cases

## Tech Stack

- **Expo SDK 54** / React 19 / React Native 0.81.5
- **Expo Router v6** — file-based navigation
- **TypeScript** — strict mode
- **AsyncStorage** — local persistence
- **Jest** — 32 test files, pre-commit hooks
- **EAS Build + Update** — native builds + OTA

## Important Notes

- OTA updates only work when `runtimeVersion` matches the build. Native changes (new modules, SDK upgrade, `app.json` native config) require a new build.
- JS-only changes (components, styles, logic, assets) can always be pushed as OTA updates.
- Users receive updates on next app launch.
