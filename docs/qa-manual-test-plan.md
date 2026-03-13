# Comprehensive Manual QA Test Cases for "in due time" Gestation Tracking App

## 1. ONBOARDING & INITIALIZATION

### First Launch Flow
- **TC-001**: First app launch shows HIPAA agreement modal
  - Verify text is readable and scrollable
  - Verify "I Agree" button proceeds to onboarding
  - Verify "Disagree, exit app" button closes the app
  - Verify agreement is persisted (subsequent launches skip this)

- **TC-002**: Onboarding overlay displays sequentially animated text
  - Verify 4 lines appear one by one with delays
  - Verify "Get Started" button appears after final line
  - Verify button tap saves completion and shows home screen
  - Verify onboarding only shows once per installation

- **TC-003**: Splash screen displays after agreement accepted
  - Verify logo and background display for 2 seconds
  - Verify transitions to home screen automatically

- **TC-004**: Returning user skips both modals
  - Clear app data and reinstall to confirm first launch flow
  - Then verify stored agreement/onboarding state prevents modals

### Device ID & Analytics
- **TC-005**: Device ID created on first launch
  - App generates and persists unique device ID
  - ID can be viewed in App Info modal

---

## 2. HOME SCREEN - CORE LAYOUT

### Header & Navigation
- **TC-006**: Header displays correctly
  - Logo image visible
  - Title "in due time" visible and centered
  - View toggle button (list/calendar) responsive
  - Settings button responsive and anchored correctly

- **TC-007**: App label displays when configured
  - If app has APP_LABEL config, verify it shows as badge in header
  - Check against light and dark themes

- **TC-008**: Safe area insets respected
  - No content hidden behind notch/island on iOS
  - Status bar color matches theme (light/dark)

### View Switching
- **TC-009**: Switch between list and calendar views
  - Tap view toggle button
  - List view shows entries or empty state
  - Calendar view shows 11 months of data
  - Toggle back and forth multiple times
  - Verify state preserved when switching (scroll position, selections)

---

## 3. ENTRY LIFECYCLE: ADD → VIEW → EDIT → DELIVER → CLEANUP

### Adding Entries - Single Entry Mode

#### Form Visibility & Interaction
- **TC-010**: Add button toggles form visibility
  - Tap "Add someone" button in list view
  - Form appears with animation
  - Name input is focused and ready
  - Tap close (X) button to hide form
  - Verify form resets when reopened

- **TC-011**: Name input validation
  - Enter valid name (1-50 characters)
  - Verify "Due Date or Gestational Age" field appears
  - Leave name empty, verify age field hidden
  - Try name with special characters (accept all)
  - Try name with emojis (should work)
  - Max 50 characters enforced

#### Due Date Input - Multiple Formats
- **TC-012**: Parse gestational age format (weeks + days)
  - Enter "35w5d" → preview shows calculated due date
  - Enter "35 w 5 d" (with spaces) → works
  - Enter "35w5" → error: "Days must be 0–6"
  - Enter "43w0d" → error: "Weeks must be 0–42"
  - Verify preview updates in real-time

- **TC-013**: Parse date format MM-DD-YYYY
  - Enter "06-15-2026" → preview shows date
  - Enter "6-15-26" → preview shows date (2-digit year expansion)
  - Enter "6-15" → preview shows date (year inferred: current or next year)
  - Try date in the past → error if >1 month old
  - Try date too far in future → error if >42 weeks

- **TC-014**: Slash vs hyphen date formats
  - Enter "6/15/2026" → works
  - Enter "06/15/2026" → works
  - Enter "6/15" → works (year inferred)
  - Both slash and hyphen formats accepted

- **TC-015**: Date bounds validation
  - Enter date 1 month in past → accepted
  - Enter date 32 days in past → error: "must be within the last month"
  - Enter date 42 weeks in future → accepted
  - Enter date 43 weeks in future → error: "must be within the next 42 weeks"

- **TC-016**: Invalid date error messages
  - Enter "13-01-2026" → error: "Month must be 1–12"
  - Enter "06-32-2026" → error: "Day must be 1–31"
  - Enter "02-30-2026" → error: "not a valid date"
  - Enter "abc" → error: "Enter date as MM-DD-YYYY"
  - Error clears when valid input entered

#### Calendar Date Picker
- **TC-017**: Calendar button opens date picker
  - Tap calendar icon next to date input
  - iOS: spinner picker appears
  - Android: native date dialog appears
  - Picker respects min/max date bounds

- **TC-018**: Date picker interaction (iOS)
  - Spin to select date
  - Cannot scroll past min/max bounds
  - Tap "Done" button to confirm
  - Date appears in input field
  - Text input still editable after picker selection

- **TC-019**: Date picker interaction (Android)
  - Select date in dialog
  - Dialog auto-closes on selection
  - Date appears in input field

#### Add Action & Confirmation
- **TC-020**: Add button disabled until form is valid
  - Name empty → Add button disabled/grayed
  - Name present but date empty → Add button disabled
  - Both fields valid → Add button enabled and tappable
  - Tap Add with valid data → entry added to list

- **TC-021**: Confirmation message after add
  - Add entry → green checkmark + "Added [name] — [age]" fades in
  - Message auto-dismisses after 1.5 seconds
  - Name field clears
  - Date field clears
  - Ready for next entry (batch mode) or close form

### Adding Entries - Batch Mode

- **TC-022**: Toggle batch mode
  - In add form, tap "Add multiple" link
  - Form switches to batch mode with larger text input
  - Batch input shows example: "Sam 6/14, Alex 35w5d, Jamie 6-14-26, Riley 22w 3d"
  - Tap "Add one at a time" to switch back to single mode
  - Each mode preserves its own input state

- **TC-023**: Batch input format help
  - Tap help (?) icon in batch mode
  - Help box shows: "Separate entries with commas"
  - Example format displays
  - Help dismissible with another tap

- **TC-024**: Batch parsing with various formats
  - Input "Alice 6/14, Bob 35w5d, Carol 2026-06-15"
  - Each entry parsed correctly
  - Preview shows "Added 3 people — Alice, Bob, Carol"
  - All entries added to list

- **TC-025**: Batch error handling - partial success
  - Input "Alice 6/14, BadEntry 99w0d, Carol 7/4"
  - Alice and Carol added (success message shows both)
  - BadEntry remains in input showing error: "Weeks must be 0–42"
  - User can fix and retry or clear

- **TC-026**: Batch error handling - all failures
  - Input "No1 invalid, No2 invalid"
  - Nothing added
  - Both errors display
  - Batch text field keeps invalid entries for retry

- **TC-027**: Batch with empty/whitespace entries
  - Input "Alice 6/14, , Bob 7/4"
  - Empty entry shows error: "Empty entry"
  - Alice and Bob added
  - Empty entry in text for correction

### Viewing Entries - List View

- **TC-028**: Empty state message
  - App with no entries shows empty screen
  - Icon: calendar outline
  - Text: "Ready when you are"
  - Subtitle: "Tap Add someone to get started"
  - Both "Add someone" button and empty state are tappable

- **TC-029**: Entry row displays all information
  - Add entry "Alice" with due date "6/14/2026"
  - Row shows:
    - Name: "Alice"
    - Gestational age: "35w5d" (calculated)
    - Due date: "Jun 14" or "Jun 14 '26" depending on year
    - Birthstone symbol icon
  - Row is tappable to open detail modal

- **TC-030**: Row colors cycle correctly
  - Add 5 entries with different names
  - Each row has different background color
  - Colors cycle through theme's rowColors array
  - Colors remain consistent if entries reordered

- **TC-031**: Entry row appearance in different themes
  - Test all 6 personality themes (classic, warm, elegant, playful, modern, mono)
  - Test light and dark brightness
  - Verify text contrast is readable
  - Verify row colors are distinct

### Viewing Entries - Calendar View

- **TC-032**: Calendar displays 11 months
  - Switch to calendar view
  - Current month + next 10 months visible
  - Scroll through all months

- **TC-033**: Calendar cells show heatmap colors
  - Add entries with due dates spread across months
  - Days with entries show colored backgrounds
  - Color intensity increases with more entries on same day
  - Today's date highlighted distinctly

- **TC-034**: Calendar cell tap shows entries
  - Add 3 entries all due on same date
  - Tap that calendar day
  - Navigate to date-detail screen
  - All 3 entries listed with details

- **TC-035**: Empty calendar state
  - Clear all entries
  - Switch to calendar view
  - Empty state shows: "No one to show yet"
  - Suggests switching to list view

### Entry Detail Modal (Tap on Entry)

- **TC-036**: Detail modal opens on entry tap
  - In list view, tap any entry
  - Modal appears with fade animation
  - Modal displays centered on screen
  - Backdrop (dimmed background) is visible

- **TC-037**: Detail modal content correct
  - Modal shows:
    - Birthstone icon (large, 48px)
    - Name
    - Due date
    - Gestational age
    - Birthstone name (if present)
  - Card background matches birthstone color
  - Text is white/readable
  - All text center-aligned

- **TC-038**: Detail modal close
  - Tap "Done" button → modal closes
  - Tap backdrop outside card → modal closes
  - Verify list still shows all entries

- **TC-039**: Detail modal on different themes
  - Test modal on all 6 themes and both brightness levels
  - Card always readable
  - Text contrast adequate

### Delivering Entries (Swipe or Long Press)

#### Swipe Gesture (List View)
- **TC-040**: Swipe left on entry row
  - Swipe left >= 100 pixels
  - Row animates off-screen
  - Delete confirmation visible
  - Entry removed from active list

- **TC-041**: Swipe right on entry row
  - Swipe right >= 100 pixels
  - Row animates off-screen
  - "Delivered" action triggers
  - Entry moves to "Delivered" section
  - Marked with `deliveredAt` timestamp

- **TC-042**: Incomplete swipe returns to position
  - Swipe left < 100 pixels
  - Row springs back to original position
  - Entry unchanged

- **TC-043**: Swipe background shows actions
  - Swipe slowly left to see background
  - Right side shows trash icon + "Delete"
  - Left side shows heart icon + "Delivered"

#### Long Press (Grid View - Cozy Layout)
- **TC-044**: Long press entry card in grid
  - Hold finger on entry card > 500ms
  - Action sheet appears with options:
    - "Delivered"
    - "Remove"
    - "Cancel"
  - Tap "Delivered" → entry moves to delivered section
  - Tap "Remove" → entry deleted

- **TC-045**: Long press on empty space dismisses
  - Long press action sheet appears
  - Tap "Cancel" → closes without action
  - Tap outside → sheet dismisses

### Undo Toast

- **TC-046**: Undo toast after deletion
  - Delete entry by swiping left
  - Toast appears at bottom showing deleted entry name and age
  - Toast includes "Undo" button
  - Toast auto-dismisses after 5 seconds

- **TC-047**: Undo restores entry
  - After deletion, tap "Undo" button on toast
  - Entry re-appears in list at original position
  - Toast dismisses
  - Entry's data intact (createdAt, dueDate)

- **TC-048**: Swipe to dismiss undo toast
  - After deletion, swipe toast upward > 30 pixels
  - Toast animates away
  - Cannot undo deletion after swipe

- **TC-049**: Multiple deletes - only last is undoable
  - Delete entry A → toast
  - Tap undo → entry A restored
  - Delete entry B → new toast
  - Original undo is gone, only entry B can be undone

### Delivered Section & Auto-Cleanup

- **TC-050**: Delivered section appears in list
  - Deliver entries by swiping right or long-press
  - "Delivered" section appears at bottom of list
  - Shows baby emoji (👶) + "Delivered" title
  - All delivered entries listed chronologically (newest first)

- **TC-051**: Delivered entry appearance
  - Delivered entries show in faded boxes with lower opacity (0.6)
  - Show name + due date
  - Visually distinct from active entries

- **TC-052**: Auto-purge delivered entries after 3 days
  - Deliver entry A at time T
  - Wait 3 days (or manipulate system time in dev tools)
  - Load entries → entry A is gone from storage
  - Entry B delivered at T + 2 days → still visible
  - Only entries delivered > 3 days ago are purged

- **TC-053**: Delivered section clears when empty
  - All entries active
  - No "Delivered" section visible in list
  - Deliver one entry → section appears
  - Undo delivery → section disappears

---

## 4. SORTING & CONTROLS

### Sort Options (List View)
- **TC-054**: Default sort order
  - New app (no saved preference) → defaults to "Name (A–Z)"
  - Entries sorted alphabetically by name (case-insensitive)

- **TC-055**: Open sort picker
  - Tap sort icon (swap-vertical-outline)
  - iOS: ActionSheetIOS shows 5 options + Cancel
  - Android: Alert dialog shows options
  - Options: No sort, Due date (newest/oldest), Name (A–Z/Z–A)

- **TC-056**: Sort by no sort (insertion order)
  - Select "No sort"
  - Entries ordered by creation time (newest first)
  - Add new entry → appears at top
  - Verify consistent order across reloads

- **TC-057**: Sort by due date - newest first
  - Select "Due date (newest first)"
  - Entries sorted by dueDate descending (string comparison)
  - When dates match, sorted by name (A–Z)
  - Verify consistent on reload

- **TC-058**: Sort by due date - oldest first
  - Select "Due date (oldest first)"
  - Entries sorted by dueDate ascending
  - When dates match, sorted by name
  - Verify on reload

- **TC-059**: Sort by name - A–Z (case insensitive)
  - Select "Name (A–Z)"
  - Entries sorted alphabetically
  - "Alice" before "Bob" before "Charlie"
  - "alice" treated same as "Alice"
  - When names match, sorted by due date

- **TC-060**: Sort by name - Z–A
  - Select "Name (Z–A)"
  - Reverse alphabetical order
  - Verify on reload

- **TC-061**: Sort order persisted across session
  - Set sort to "Due date (newest first)"
  - Close app
  - Reopen app → still sorted by due date (newest first)

### Sort in Grid View (Cozy Layout)
- **TC-062**: Grid view respects same sort logic
  - Switch to cozy layout
  - Default sort is "Name (A–Z)"
  - Open sort picker and select different option
  - Cards rearrange accordingly
  - Sort persisted on reload

### Remove All Button
- **TC-063**: Remove all with confirmation
  - Tap "Remove all" button in toolbar (appears when entries exist)
  - Confirmation dialog: "Remove everyone? This will remove all X people you're tracking. You can't undo this."
  - "Cancel" closes dialog
  - "Remove all" (destructive style) clears all entries

- **TC-064**: Remove all clears list and delivered section
  - Entries active and delivered present
  - Tap "Remove all" and confirm
  - Both sections cleared
  - Empty state appears
  - No undo possible

---

## 5. THEME SYSTEM

### Brightness (Light/Dark/System)

- **TC-065**: System brightness default
  - Fresh app defaults to "System" brightness
  - Light theme on light system, dark theme on dark system
  - Change system theme → app updates instantly

- **TC-066**: Force light brightness
  - Settings → select "Light"
  - App displays light theme
  - Background light colors
  - Text dark colors
  - Status bar styled for light background

- **TC-067**: Force dark brightness
  - Settings → select "Dark"
  - App displays dark theme
  - Background dark colors (#121212 for classic)
  - Text light colors
  - Status bar styled for dark background
  - Splash background changes

- **TC-068**: Brightness persisted
  - Set to "Dark"
  - Close and reopen app → still dark
  - Change system brightness → app still dark (not following system)

### Personality Themes (6 total)

- **TC-069**: Classic theme (default)
  - Primary: Blue (#2e78c2 light, #3a84cc dark)
  - Verify all UI elements use classic colors
  - Verify buttons, links, icons use primary

- **TC-070**: Warm theme
  - Primary: Orange/amber tones
  - Verify distinct color palette applied everywhere

- **TC-071**: Elegant theme
  - Primary: Purple/mauve tones
  - Subtle, refined color palette

- **TC-072**: Playful theme
  - Primary: Vibrant pink/coral
  - Energetic color scheme

- **TC-073**: Modern theme
  - Primary: Cyan/teal tones
  - Clean, contemporary colors

- **TC-074**: Mono theme (B&W)
  - Primary: Grayscale only
  - No colorful accents
  - High contrast

- **TC-075**: Theme selection persisted
  - Select personality theme X
  - Close and reopen app → still theme X

- **TC-076**: All themes in light mode
  - For each personality, set brightness to "Light"
  - Verify colors are readable
  - Verify sufficient contrast

- **TC-077**: All themes in dark mode
  - For each personality, set brightness to "Dark"
  - Verify colors are readable in dark
  - Verify sufficient contrast

### Layout (Compact vs Cozy)

- **TC-078**: Compact layout (list view)
  - Select "Compact" layout
  - Entries display as rows in a scrollable list
  - Each row shows minimal information
  - Optimized for vertical scrolling

- **TC-079**: Cozy layout (grid view)
  - Select "Cozy" layout
  - Entries display as 2-column grid cards
  - Cards are square aspect ratio
  - More visual, less dense

- **TC-080**: Layout persisted
  - Set to "Cozy"
  - Close and reopen → still cozy
  - Switch view to calendar and back → still cozy

- **TC-081**: Layout changes update colors
  - In compact, verify rowColors used for alternating row backgrounds
  - In cozy, verify card backgrounds match birthstone colors
  - Switch layouts → colors update accordingly

### Theme Picker Modal

- **TC-082**: Theme picker opens from settings
  - Tap settings gear icon
  - Modal dropdown appears anchored below settings button
  - Contains all theme options, brightness options, layout options

- **TC-083**: Theme picker positioning
  - Settings icon in header → picker appears below it
  - Picker positioned to right side of screen
  - Picker stays visible (not cut off)

- **TC-084**: Current selections marked with checkmark
  - Current personality has checkmark icon
  - Current brightness has checkmark
  - Current layout has checkmark

- **TC-085**: Quick switching themes
  - Tap different personalities rapidly
  - App updates colors smoothly
  - No crashes or flickering

- **TC-086**: Closing theme picker
  - Tap outside modal → closes
  - Tap "App Info" in picker → picker closes and app info opens

---

## 6. MODALS

### HIPAA Agreement Modal
- **TC-087**: HIPAA modal styling
  - Text readable in all themes
  - Scrollable content
  - Both buttons visible and tappable
  - Buttons have distinct styles (primary vs secondary)

### Onboarding Overlay
- **TC-088**: Onboarding animation timing
  - Line 1 appears at 1.2s
  - Line 2 appears at 2.4s
  - Line 3 appears at 3.6s
  - Line 4 appears at 4.8s
  - Button appears at 6.0s
  - Timing consistent

### App Info Modal

- **TC-089**: App Info modal displays
  - Opens from theme picker
  - Shows "About" title
  - Displays app name ("in due time")
  - Displays version number
  - Shows build ID (first 8 chars)
  - Shows OS version (iOS X.X or Android X.X)

- **TC-090**: Copy to clipboard functionality
  - Tap build ID row → copies full build ID
  - Tap OS version row → copies "iOS X.X" or "Android X.X"
  - If available, update ID copyable too
  - User receives feedback (visual or haptic)

- **TC-091**: App Info close
  - Tap "Close" button → modal closes
  - Tap outside modal → closes

### Entry Detail Modal
- **TC-092**: Already tested in TC-036 to TC-039 above

---

## 7. STORAGE & PERSISTENCE

### Entry Persistence

- **TC-093**: Entries saved on add
  - Add entry → appears in list
  - Force close app (kill process)
  - Reopen → entry still there

- **TC-094**: Entries saved on delete
  - Delete entry by swiping
  - Force close app
  - Reopen → entry gone, entry count reduced

- **TC-095**: Entries saved on deliver
  - Deliver entry
  - Force close app
  - Reopen → entry in delivered section with deliveredAt timestamp

### Data Validation & Migration

- **TC-096**: Invalid entry discarded
  - Corrupt storage data (simulate invalid JSON)
  - Load entries → discarded count notification appears
  - App shows: "We removed X people whose data was unreadable"
  - Toast dismissible

- **TC-097**: Missing createdAt field migrated
  - Pre-existing entries without createdAt timestamp
  - Load entries → migrated to have createdAt
  - Entries preserve order (sorted by ID)

- **TC-098**: Legacy birthstone format migrated
  - Pre-existing entries with old Birthstone format
  - Load entries → converted to new BirthSymbol format
  - Entry displays correctly

- **TC-099**: Missing birthstone regenerated
  - Pre-existing entries without birthstone field
  - Load entries → birthstone assigned based on dueDate
  - Entry displays with icon

### Theme Preference Persistence

- **TC-100**: Personality theme persisted
  - Set personality to "Warm"
  - Close app → reopen
  - Verify still "Warm"
  - Confirm via settings button

- **TC-101**: Brightness persisted
  - Set brightness to "Dark"
  - Close app → reopen
  - Verify still "Dark"

- **TC-102**: Layout persisted
  - Set layout to "Cozy"
  - Close app → reopen
  - Verify still "Cozy"

### Device ID Persistence

- **TC-103**: Device ID generated once
  - Fresh app → device ID generated
  - Close and reopen → same device ID
  - Verify via App Info modal

### Agreement & Onboarding Persistence

- **TC-104**: HIPAA agreement remembered
  - Accept HIPAA agreement
  - Close app → reopen
  - Agreement screen does not reappear
  - Onboarding shows instead (if not completed)

- **TC-105**: Onboarding completion remembered
  - Complete onboarding
  - Close app → reopen
  - Both agreement and onboarding skipped
  - Home screen shows immediately

---

## 8. ERROR HANDLING

### Save Errors

- **TC-106**: Save error notification
  - Simulate save failure (network offline, storage full)
  - Toast appears: "Your changes might not be saved. Try again or restart the app."
  - User can dismiss toast

- **TC-107**: Save error retried
  - Save fails → error notification
  - User restarts app → retry happens automatically
  - If successful, notification clears
  - If fails again, notification reappears

### Invalid Input Handling

- **TC-108**: Invalid date triggers error on blur
  - Enter date "13-45-2026"
  - Tap outside field (blur)
  - Error message appears: "Month must be 1–12"
  - Error text colored red/destructive

- **TC-109**: Valid input clears error
  - Input shows error
  - User corrects to valid date
  - Error clears immediately
  - Preview updates

### Gestational Age Bounds

- **TC-110**: Weeks > 42 error
  - Enter "43w0d"
  - Error: "Weeks must be 0–42"

- **TC-111**: Days > 6 error
  - Enter "35w7d"
  - Error: "Days must be 0–6"

- **TC-112**: Invalid date (Feb 30)
  - Enter "02-30-2026"
  - Error: "not a valid date"

---

## 9. EDGE CASES & BOUNDARY CONDITIONS

### Date Edge Cases

- **TC-113**: Leap year handling
  - Add entry with due date 02-29-2024 (leap year)
  - Display and calculations correct
  - Add entry with due date 02-29-2025 (not leap year) → error

- **TC-114**: Year 2000 problem
  - Add entry with due date in year 2000 (if allowed by bounds)
  - Verify no Y2K issues

- **TC-115**: Minimum date (1 month in past)
  - Current date: 03-13-2026
  - Add entry with due date 02-13-2026 → accepted
  - Add entry with due date 02-12-2026 → error

- **TC-116**: Maximum date (42 weeks in future)
  - Current date: 03-13-2026
  - Add entry with due date 12-31-2026 (42 weeks out) → verify if accepted/rejected
  - Add entry with due date 01-01-2027 → error if > 42 weeks

### Name Edge Cases

- **TC-117**: Very long name (50 characters)
  - Enter 50-char name → accepted
  - Enter 51-char name → truncated to 50
  - Verify display truncates with ellipsis if needed

- **TC-118**: Name with special characters
  - Enter "Alice-Marie"
  - Enter "José"
  - Enter "李明" (Chinese)
  - Enter "👶 Baby"
  - All accepted and displayed correctly

- **TC-119**: Whitespace-only name
  - Enter "   " (spaces only)
  - Age field does not appear
  - Add button disabled

- **TC-120**: Duplicate names
  - Add "Alice" for 6/14/2026
  - Add "Alice" for 6/15/2026
  - Both appear in list
  - No conflict or deduplication

### Multiple Entries

- **TC-121**: Add 100 entries
  - Rapidly add 100 entries
  - List scrolls smoothly
  - All entries persisted
  - No memory leaks or crashes
  - Sorting still works

- **TC-122**: All entries same due date
  - Add 5 entries all due on 6/14/2026
  - Calendar view shows that day with high intensity
  - Tap day → detail screen shows all 5
  - List view shows all 5 in sort order

### Rapid Actions

- **TC-123**: Rapid add and delete
  - Add entry → immediately swipe to delete
  - Delete entry → immediately swipe to undo
  - Verify state consistent

- **TC-124**: Rapid theme switching
  - Tap settings → rapidly switch through all themes
  - App updates color without crashes or lag

- **TC-125**: Rapid batch add
  - Paste 20 entries into batch input
  - Tap "Add All"
  - All 20 added without errors

---

## 10. PLATFORM-SPECIFIC BEHAVIOR (iOS vs Android)

### Date Picker UI
- **TC-126**: iOS date picker (spinner)
  - On iOS, tap calendar button
  - Spinner picker appears (not calendar dialog)
  - Can scroll up/down to select
  - Must tap "Done" to confirm

- **TC-127**: Android date picker (dialog)
  - On Android, tap calendar button
  - Native date picker dialog appears
  - Dialog auto-closes on date selection
  - No "Done" button needed

### Keyboard Behavior

- **TC-128**: iOS keyboard avoid (padding)
  - Enter name field on iPhone with keyboard
  - Keyboard appears
  - Content shifts up with padding (not overlaid)

- **TC-129**: Android keyboard avoid (height)
  - Enter name field on Android with keyboard
  - Keyboard appears
  - Content shifts up with height adjustment

### Sort Picker UI

- **TC-130**: iOS sort picker (ActionSheetIOS)
  - Tap sort button
  - Native iOS action sheet slides up
  - Options visible
  - Cancel option at bottom

- **TC-131**: Android sort picker (Alert dialog)
  - Tap sort button
  - Material alert dialog appears
  - Options listed
  - Cancel button present

### Status Bar Styling

- **TC-132**: iOS status bar light theme
  - Brightness set to "Light"
  - Status bar shows dark text/icons (readable on light background)

- **TC-133**: iOS status bar dark theme
  - Brightness set to "Dark"
  - Status bar shows light text/icons

- **TC-134**: Android status bar light theme
  - Same as iOS but respects Material Design conventions

- **TC-135**: Android status bar dark theme
  - Same as iOS but respects Material Design conventions

### Gesture Handling

- **TC-136**: iOS swipe sensitivity
  - Swipe on entry row
  - Responsive to gesture
  - Animates smoothly

- **TC-137**: Android swipe sensitivity
  - Same swipe behavior
  - May feel different due to device hardware

### Safe Area

- **TC-138**: iOS safe area (notch/island)
  - iPhone with notch (iPhone X and later)
  - Header not obscured by notch
  - Logo and title visible
  - Settings button clickable

- **TC-139**: iOS safe area (bottom notch/gesture bar)
  - iPhone with home indicator
  - Buttons not obscured
  - Toast and undo buttons tappable

- **TC-140**: Android safe area
  - Android devices with cutouts/notches
  - Content properly positioned

---

## 11. ACCESSIBILITY

### Screen Reader (VoiceOver/TalkBack)

- **TC-141**: Entry row accessible
  - VoiceOver/TalkBack enabled
  - Swipe to select entry row
  - Reader announces: "[Name], [weeks] weeks [days] days"
  - Long press ring available
  - Tap to open detail modal

- **TC-142**: Buttons have labels
  - Add button: "Add someone new"
  - Settings button: "Theme settings"
  - View toggle: "Switch to calendar view" / "Switch to list view"
  - All announced clearly

- **TC-143**: Form inputs labeled
  - Name input: "Name"
  - Date input: "Due date or gestational age"
  - Error messages announced

- **TC-144**: Toasts announced
  - Undo toast role="alert", live region
  - Deletion announcement
  - Reader announces message and undo button

### Color Contrast

- **TC-145**: Text on primary color
  - White text on primary button
  - Contrast ratio >= 4.5:1 (WCAG AA)
  - Readable in all themes

- **TC-146**: Text on entry rows
  - Text color on row background
  - Sufficient contrast for reading

- **TC-147**: Disabled state contrast
  - Disabled button color
  - Still distinguishable from enabled

### Touch Targets

- **TC-148**: Button hit areas (iOS 44x44 minimum)
  - Add button tappable in large area
  - Sort button tappable (36x36 or hit slop)
  - All buttons >= 44x44 or have hitSlop

- **TC-149**: Entry row tappable
  - Entire row is tappable
  - Swipe gesture doesn't interfere with tap

---

## 12. PERFORMANCE

### Rendering Performance

- **TC-150**: Smooth scrolling with 50 entries
  - Add 50 entries
  - Scroll through list smoothly
  - No janky animations
  - 60 FPS (or consistent frame rate)

- **TC-151**: Smooth calendar scrolling
  - Calendar view with 50 entries
  - Scroll through 11 months smoothly
  - Heatmap renders without lag

- **TC-152**: Layout animation smoothness
  - Toggle form visibility
  - Toggle batch mode
  - Smooth expand/collapse animations

### Memory Management

- **TC-153**: Memory stable with repeated operations
  - Add 100 entries
  - Delete 100 entries
  - Repeat 5 times
  - Memory returns to baseline
  - No memory leak

- **TC-154**: Modal opens and closes smoothly
  - Open detail modal 20 times
  - Memory stable
  - No leaks

### Load Time

- **TC-155**: Cold start time
  - Force stop app
  - Reopen
  - Home screen shows within 3 seconds
  - Entries loaded and displayed

- **TC-156**: Warm start time
  - App in background
  - Tap to foreground
  - Appears instantly

---

## 13. CONFIGURATION & BUILD VARIANTS

### APP_LABEL Configuration

- **TC-157**: App label displays when configured
  - If app.json extra.appLabel is set
  - Badge appears in header
  - Styled with primary color background
  - Removed if config empty string

### Development Toolbar (Dev Only)

- **TC-158**: Dev toolbar visible in __DEV__
  - __DEV__ flag true
  - Toolbar appears in header
  - Contains seed data button and reset agreement button

- **TC-159**: Seed data button
  - Populates list with sample entries
  - Entries appear immediately
  - Each call adds new batch

- **TC-160**: Reset agreement button
  - Clears stored agreement and onboarding
  - App reloads
  - HIPAA modal shown on next launch

### Feature Flags & Updates

- **TC-161**: Update check (production only)
  - Non-dev build checks for updates
  - If available, fetches in background
  - Reloads on next app open (if loading completes)

- **TC-162**: Vexo analytics (production only)
  - Non-dev build initializes vexo
  - Device ID sent to analytics
  - No errors if vexo unavailable (Expo Go)

---

## 14. DATA MIGRATION & UPGRADES

### Backward Compatibility

- **TC-163**: Load legacy entries without createdAt
  - Old entries lack createdAt field
  - Migration assigns createdAt based on ID order
  - Entries appear correctly

- **TC-164**: Load legacy entries with old birthstone format
  - Old entries use Birthstone type (not BirthSymbol)
  - Migrated to new BirthSymbol on load
  - Display and colors correct

- **TC-165**: Load entries with corrupted data
  - Some entries missing required fields
  - Valid entries loaded
  - Invalid entries discarded
  - Count shown in notification

### Upgrade Scenarios

- **TC-166**: Upgrade from version 1.x to 2.x
  - Simulated old app data
  - New version loads
  - Data migrated without loss
  - Features work correctly

---

## 15. STRESS & SECURITY TESTS

### Large Data Sets

- **TC-167**: Load 500 entries
  - Simulate storage with 500 entries
  - Load entries → list appears
  - Scrolling slow but not crashed
  - Sorting works

- **TC-168**: Very large name (1000 chars)
  - Name truncated to 50 chars in form
  - Display handles gracefully

### Unusual Input

- **TC-169**: XSS attempt in name
  - Enter name like "<script>alert('xss')</script>"
  - Displayed as plain text
  - No script execution
  - No crashes

- **TC-170**: SQL injection attempt (if any DB used)
  - Unlikely in this React Native app
  - AsyncStorage only, no SQL
  - Not applicable

- **TC-171**: Null/undefined handling
  - Entry with null name
  - Entry with undefined dueDate
  - App handles without crashing (validation discards)

### Date/Time Edge Cases

- **TC-172**: Daylight saving time transition
  - App running when DST changes
  - Dates still calculated correctly
  - No off-by-one hour errors

- **TC-173**: Leap second (rare)
  - System clock includes leap second
  - No crashes or calculation errors

---

## 16. INTEGRATION & WORKFLOW TESTS

### Complete User Journey 1: Expectant Family
- **TC-174**: Alice adding baby for family member
  1. First launch → HIPAA agreement → onboarding
  2. Tap "Add someone" → single entry mode
  3. Enter "Sarah" for due date "7/15/2026" → add
  4. Confirm toast shows "Added Sarah — 28w2d"
  5. Tap "Add someone" again
  6. Enter "Mike" for due date "8/22/2026" → add
  7. Now 2 entries in list sorted by name
  8. Switch to calendar view → see both dates highlighted
  9. Switch theme to "Warm" → colors update
  10. Settings button → verify "Warm" selected
  11. Back to list → both entries still there
  12. Swipe Sarah right → mark as delivered
  13. Sarah moves to Delivered section (with 👶 emoji)
  14. Verify persisted on close/reopen

### Complete User Journey 2: Batch Entry
- **TC-175**: Clinic staff adding cohort of patients
  1. App with 0 entries
  2. Tap "Add someone"
  3. Tap "Add multiple" → batch mode
  4. Copy-paste: "Emma 6/20, Olivia 7/3/26, Ava 32w4d"
  5. Tap "Add All"
  6. Toast confirms "Added 3 people"
  7. Switch to calendar → see heatmap with 3 dates
  8. Back to list → sorted by name (default)
  9. Swipe left on Emma → delete
  10. Undo appears → tap to restore
  11. Emma back in list
  12. Change sort to "Due date (newest first)"
  13. Order changes: Olivia, Ava, Emma
  14. Close app, reopen → sort persisted, entries there

### Complete User Journey 3: Theme Preferences
- **TC-176**: User exploring themes
  1. Fresh app → defaults to System brightness, Classic theme, Compact layout
  2. Settings → ThemePickerModal opens
  3. Select "Elegant" → colors change to purple
  4. Select "Cozy" layout → view switches to grid (if had entries)
  5. Close settings
  6. Settings again → Elegant and Cozy still selected
  7. Select "Dark" brightness → dark theme applied
  8. Settings again → Dark and Elegant confirmed
  9. Add entry → appears in cozy grid layout
  10. Close app, reopen → all preferences persist

---

## 17. PLATFORM SYSTEM INTERACTIONS

### Network/Connectivity
- **TC-177**: App offline
  - Disable network
  - App still works (all local)
  - Add/delete/deliver work
  - Analytics not sent (caught gracefully)

### Clipboard Integration
- **TC-178**: Copy build ID from app info
  - Open app info modal
  - Tap build ID row
  - Verify copied to clipboard
  - Can paste elsewhere

### File System
- **TC-179**: AsyncStorage permission (Android)
  - Android permission to write to storage
  - Entry persistence works
  - No crashes on permission denial (unlikely with AsyncStorage)

### Background & Foreground

- **TC-180**: App backgrounded with toast visible
  - Delete entry (toast shown)
  - Switch to another app
  - Switch back → toast might auto-dismiss or still visible (OS dependent)
  - Undo still works if toast still present

- **TC-181**: App backgrounded and killed
  - Open entry detail modal
  - Switch to another app
  - Force stop this app
  - Reopen → modal closed, home screen shown
  - Entry still in list (persisted)

---

## 18. REGRESSION & KNOWN ISSUES

### Version Tracking
- **TC-182**: Version matches between code and app.json
  - Check app.json version
  - Compare with package.json version (might differ)
  - Confirm in App Info modal
  - On build, runtimeVersion matches version

### Layout Switching Regressions
- **TC-182b**: Switching layout while on Delivered tab does not crash
  - Navigate to Delivered tab with at least 1 delivered entry
  - Open settings → Layout → switch from Cozy to Compact
  - App should not crash or go blank
  - Switch back from Compact to Cozy
  - App should not crash or go blank
  - Repeat on Expecting tab to confirm no crash there either

- **TC-182c**: Switching layout while on Expecting tab does not crash
  - Navigate to Expecting tab with at least 1 entry
  - Switch layout via settings
  - Entries should re-render in the new layout without errors

### Build ID & Update ID
- **TC-183**: Build ID present in non-Expo Go builds
  - EAS build creates build ID
  - Visible in App Info
  - Copyable to clipboard

- **TC-184**: Update ID shown only if available
  - Expo Updates module available
  - Update ID shows in App Info
  - In Expo Go, no update ID shown

---

## 19. VISUAL REGRESSION TESTING

### Screenshots by Theme & Brightness

- **TC-185**: Screenshot: Empty state (all 6 themes × 2 brightness)
  - Capture empty home screen for each combo
  - Verify icon, text, button styling

- **TC-186**: Screenshot: List with entries (3 themes × light/dark)
  - Sample of 3 entries with variety of due dates
  - Verify row colors, text colors, spacing

- **TC-187**: Screenshot: Grid view (cozy layout)
  - 4-6 cards in 2-column grid
  - Verify card colors match birthstones
  - Verify text size and spacing

- **TC-188**: Screenshot: Calendar view
  - 2-3 months visible with heatmap
  - Verify color intensity gradient
  - Verify day labels and week layout

- **TC-189**: Screenshot: Theme picker modal
  - All options visible
  - Current selection marked
  - Verify positioning and styling

- **TC-190**: Screenshot: Detail modal
  - Entry displayed centered
  - Birthstone color background
  - Text readable and centered
  - All details visible

---

## 20. DOCUMENTATION & HELP

### HIPAA Compliance Messaging
- **TC-191**: HIPAA disclaimer accurate
  - Read disclaimer text
  - Verify it correctly states app not HIPAA compliant
  - Verify mentions PHI restrictions
  - Verify mentions local storage, no encryption
  - Verify mentions non-clinical use only

### In-App Help

- **TC-192**: Batch format help visible
  - Batch mode, tap ? icon
  - Help box appears with example
  - Example matches documentation
  - Help dismissible

### Bug Report Form

- **TC-193**: Bug report URL pre-filled
  - Settings → "Report a Bug"
  - Opens Google Form with:
    - App version pre-filled
    - Build ID pre-filled
    - OS version pre-filled
  - Form submission works

### Feature Request Form

- **TC-194**: Feature request form accessible
  - Settings → "Request a Feature"
  - Opens Google Form
  - User can submit request

---

## 21. KNOWN LIMITATIONS & EXPECTED BEHAVIOR

### Not Tested (Out of Scope)
- Push notifications (not implemented)
- Cloud sync (not implemented)
- Export/import (not implemented)
- Encryption at rest (explicitly not HIPAA compliant)

### Expected Limitations
- **TC-195**: Single device only
  - No cloud backup
  - Data tied to device AsyncStorage
  - Reinstalling app loses data

- **TC-196**: No patient identity protection
  - User can enter PHI (app warns against it)
  - Data stored unencrypted on device
  - Intending for non-clinical, personal use only

- **TC-197**: No authentication
  - No login required
  - Anyone with device access can view data
  - Intentional design for simplicity

---

## SUMMARY

This comprehensive test plan covers:

- **1. Onboarding & Initialization**: Agreement, onboarding, splash
- **2. Home Screen**: Header, navigation, safe areas
- **3. Entry Lifecycle**: Add (single/batch), view, deliver, cleanup
- **4. Sorting & Controls**: All sort options, remove all, persistence
- **5. Theme System**: 6 personalities × 3 brightness modes × 2 layouts = 36 combinations
- **6. Modals**: Agreement, onboarding, app info, entry detail
- **7. Storage & Persistence**: Save, load, validation, migration
- **8-15. Error Handling, Edge Cases, Platform-Specific, Accessibility, Performance, Config, Migration, Security**
- **16-21. Integration workflows, system interactions, regression, visual, documentation, limitations**

**Total Test Cases: 197**

All tests are designed to be executable on real devices or emulators (iOS and Android). Each test follows a clear scenario → action → expected result format suitable for manual QA execution.