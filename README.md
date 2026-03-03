# Gestation Tracker

A mobile app for tracking gestational ages. Built with Expo (React Native) for Android and iOS.

## Setup

```
npm install
```

## Running the App

```
npm start
```

Then:

- Install the **Expo Go** app on your phone ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) / [iOS](https://apps.apple.com/app/expo-go/id982107779)), then scan the QR code
- Press `a` to open in an Android emulator
- Press `i` to open in an iOS simulator

## EAS Build & Update

### Building

Build for internal distribution (preview):

```
eas build --profile preview --platform all
```

Build for production (App Store / Google Play):

```
eas build --profile production --platform all
```

### Pushing OTA Updates

OTA (over-the-air) updates let you push JS/asset changes to users without submitting a new build to the app stores. Updates are delivered via [EAS Update](https://docs.expo.dev/eas-update/introduction/).

Push an update to a specific channel:

```
eas update --channel production --message "description of changes"
```

Available channels (defined in `eas.json`):

| Channel        | Build Profile   | Use Case                          |
| -------------- | --------------- | --------------------------------- |
| `development`  | `development`   | Dev client testing                |
| `preview`      | `preview`       | Internal testers / TestFlight     |
| `production`   | `production`    | Live app store users              |

### Updating Latest Build Info

After creating a new EAS build, run the **Publish Latest Build Info** GitHub Actions workflow to notify users that a newer native build is available. The workflow queries EAS for the latest finished builds and publishes a `latest-build.json` file to GitHub Pages. The app fetches this file at launch and shows a toast if the user's build is outdated.

To run: **Actions** tab → **Publish Latest Build Info** → **Run workflow**

One-time setup:

1. Add an `EXPO_TOKEN` secret to the repo (Settings → Secrets and variables → Actions)
2. Enable GitHub Pages (Settings → Pages → Source: "Deploy from a branch" → branch: `gh-pages`, folder: `/ (root)`)

### Important Notes

- Updates only work when the `runtimeVersion` matches the build. If you change native code (new native modules, SDK upgrade, `app.json` native config), you must create a **new build** — an OTA update won't be enough.
- JS-only changes (components, styles, logic, assets) can always be pushed as updates.
- Users receive the update on next app launch (or next foregrounding, depending on the update check configuration).
