# In Due Time — User Guide

A quick guide to getting the most out of **In Due Time**, your privacy-first gestational age tracker.

---

## Getting Started

When you first open the app, you'll see a short privacy note explaining how your data is stored. Everything stays on your device — nothing is sent to a server or backed up to the cloud.

After that, a quick walkthrough introduces the three main tabs: **Expecting**, **Delivered**, and **Calendar**.

## Adding Someone

Tap the **Add someone** button at the top of the Expecting tab. Enter a name and a due date.

The date field is flexible — you can type:
- A date like **June 15**, **6/15**, or **06-15-2026**
- A gestational age like **35w2d** (35 weeks, 2 days)

The app figures out the due date either way.

### Batch Entry

Need to add several people at once? Tap the **batch mode** icon (the multi-line icon next to the input field). Enter one person per line in the format:

```
Name, due date
```

For example:
```
Sarah, June 15
Jordan, 7/22
Alex, 34w0d
```

## The Three Tabs

### Expecting

Your main list of people with upcoming due dates. Each entry shows:
- Name
- Gestational age (e.g., "35w 2d")
- A birthstone gem icon based on the due date month

**Sorting**: Tap the sort icon to change the order — by name, due date, or recently added.

**Tap an entry** to see full details in a popup.

### Delivered

People you've marked as delivered move here. Each entry shows timing info like "2 days early" or "right on time."

Delivered entries are automatically removed after a configurable number of days (default: 3 days). The current cleanup setting is shown at the top of the Delivered tab — tap **Change** to cycle through options without opening Settings. You can also change this in **Settings > Preferences > Delivered cleanup**.

Changing the cleanup interval doesn't immediately remove entries — cleanup happens the next time you open the app, so you won't accidentally lose anything while browsing options.

### Calendar

A month-by-month calendar view with a heat map showing when due dates cluster. Darker colors mean more people are due around that date. Dates where someone was delivered show a baby icon.

Tap any date to see who's due or was delivered on that day.

## Gestures

### Swipe Left — Delete

On any entry (expecting or delivered), swipe left to delete. A red background appears to confirm the action. An **undo toast** pops up at the bottom — tap it to bring the entry back.

### Swipe Right — Deliver

On the Expecting tab, swipe right to mark someone as delivered. A green background appears. You'll get an **undo toast** in case you swiped by accident.

### Tips

- A quick flick triggers the action faster — you don't need to swipe all the way across.
- If you change direction mid-swipe, the action cancels.

## Layouts

Switch between two display styles in **Settings > Appearance > Layout**:

- **Compact** — a dense list, one entry per row
- **Cozy** — a two-column card grid with larger birthstone icons

Both layouts support the same sorting and swipe gestures.

## Themes

The app has **6 theme personalities**, each available in light and dark mode:

| Theme | Style |
|-------|-------|
| Classic | Clean blues and grays |
| Warm | Earthy tones |
| Elegant | Refined, muted palette |
| Playful | Bright, cheerful colors |
| Modern | Bold, high-contrast |
| Mono | Black and white |

Change themes in **Settings > Appearance > Theme**.

For brightness, choose **Light**, **Dark**, or **System** (follows your phone's setting).

## Settings

Open settings with the gear icon in the header.

Each settings sub-page has a **(?)** icon — tap it for a quick explanation of what that setting does.

### Appearance
- **Theme** — personality and brightness
- **Layout** — compact or cozy

### Preferences
- **Delivered cleanup** — how many days delivered entries stay before automatic removal (default: 3 days)

### Support
- **Help & FAQ** — opens this guide in your browser
- **Report a Bug** — opens the bug report form
- **Request a Feature** — opens the feature request form

### About
- App version and build info

## Privacy & Data

**All data stays on your device.** The app does not have a server, does not sync to the cloud, and does not transmit patient information.

A few things to know:
- **No account needed** — there's nothing to sign up for.
- **No backup** — if you uninstall the app or lose your phone, your data is gone. The app is designed for transient tracking (gestational ages are time-bounded), so this is intentional.
- **Use first names or nicknames** — the app encourages this as a privacy best practice. Avoid entering full names or medical record numbers.
- **Device security matters** — since data lives on your phone, keep your device locked with a passcode or biometric.

## Frequently Asked Questions

### Can I sync my list between devices?

No. All data is stored locally on your device. This is a deliberate design choice to keep patient information private and avoid the complexity of HIPAA-compliant cloud infrastructure.

### What happens when I uninstall the app?

Your data is deleted. There is no cloud backup. If you plan to switch phones, note down any information you need before uninstalling.

### Can multiple people share a list?

Not currently. Each device has its own independent list.

### What does the heat map on the calendar show?

The color intensity represents how likely it is that someone on your list will deliver on that date, based on a statistical model (normal distribution centered on each due date). Darker = more people expected around that date.

### Why do delivered entries disappear?

Delivered entries are automatically removed after a set number of days to keep your list focused on active patients. You can change the cleanup interval in **Settings > Preferences > Delivered cleanup**, or set it to **Never** to keep them indefinitely.

### What are the gem icons?

Each entry shows a **birthstone** based on the due date month — garnet for January, amethyst for February, and so on. It's a small visual touch to make each entry feel personal.

### How do I undo a delete or deliver?

Tap the **Undo** button on the toast that appears at the bottom of the screen.

### The app crashed. What do I do?

The app has a built-in crash recovery screen. If you see it, tap **Try Again** to reload. Your data should still be there — entries are saved to your device as you add them.

If the problem persists, try closing and reopening the app.

### How do I report a bug or request a feature?

Contact the developer through the app store listing or the project's GitHub page.
