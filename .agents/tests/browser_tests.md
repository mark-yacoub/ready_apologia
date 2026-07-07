# Browser Automation Test Cases

**CRITICAL RULE: NEVER modify these test cases based on subagent failures or assumptions. If a test fails and you suspect the test is outdated, you MUST consult the user before altering any of the test logic.**

This document defines the structured browser automation test cases for Ready Apologia. Run these test cases using the `/browser` subagent whenever code or styling changes are made to ensure zero regression.
**Note on Execution**: You can spin up all test subagents concurrently to finish the entire test suite faster. However, to prevent Chrome DevTools Protocol (port 9222) connection overload and timeouts, instruct each subagent in its prompt to stagger its start time by a few seconds (e.g., Subagent 1 starts immediately, Subagent 2 waits 4 seconds before connecting, Subagent 3 waits 8 seconds, etc.). Also, ensure a full production build (`astro build`) has completed before running tests that navigate to Old Testament books (e.g., Genesis) to prevent 404 errors.
---

## Test Case 1: Initial Redirect Gate & Last Visited Persistence
1.  **Preparation**: Clear all browser storage, cookies, and `localStorage`.
2.  **Action**: Navigate to root url `http://localhost:8080/ready_apologia/`.
3.  **Verification**:
    *   Confirm the page redirects automatically to `/ready_apologia/bible/jn/1`.
    *   Verify `localStorage.getItem('lastVisitedUrl')` is initialized to `/ready_apologia/bible/jn/1`.
4.  **Action**: Navigate to Genesis 1 by typing `http://localhost:8080/ready_apologia/bible/gn/1` in the browser or clicking the left sidebar.
5.  **Verification**:
    *   Verify `localStorage.getItem('lastVisitedUrl')` updates to `/ready_apologia/bible/gn/1`.
6.  **Action**: Navigate to root url `http://localhost:8080/ready_apologia/`.
7.  **Verification**:
    *   Confirm the page redirects to `/ready_apologia/bible/gn/1`.

---

## Test Case 2: Verse Selection & Highlighting (Mobile View - 375x667)
1.  **Action**: Go to `/ready_apologia/bible/jn/1` in mobile viewport.
2.  **Action**: Hover or touch (without releasing) Verse 3 text.
3.  **Verification**:
    *   Verify that Verse 3 row receives select/highlight styles (e.g. background change) while held.
4.  **Action**: Release the touch/click on Verse 3 text.
5.  **Verification**:
    *   Verify the page navigates to the evidence view for Verse 3.

---

## Test Case 3: Mobile Pager Navigation & Swipes (Mobile View - 375x667)
1.  **Action**: Go to `/ready_apologia/bible/jn/1` in mobile viewport.
2.  **Action**: Locate the floating right arrow pager button (`Chapter 2 →`) and click it.
3.  **Verification**:
    *   Confirm the reader transitions smoothly to `/ready_apologia/bible/jn/2`.
    *   Verify the top header branding text swaps to "John 2" as you scroll down.
4.  **Action**: Click the floating left arrow pager button (`← Chapter 1`).
5.  **Verification**:
    *   Confirm the reader transitions back to `/ready_apologia/bible/jn/1`.

---

## Test Case 4: Evidence Tab Switching & Custom Order Persistence (Mobile View - 375x667)
1.  **Action**: Navigate directly to `/ready_apologia/bible/jn/1/1`.
2.  **Verification**:
    *   Verify it redirects to `/ready_apologia/bible/jn/1/1/manuscripts`.
3.  **Action**: Click the "Apologetics" tab in the segmented pill bar.
4.  **Verification**:
    *   Confirm URL changes to `/ready_apologia/bible/jn/1/1/apologetics` and the apologetics text renders.
5.  **Action**: Click the settings ellipsis button (`#open-tab-settings-btn`) to open the "Customize Tab Order" modal.
6.  **Action**: Move "Apologetics" to the top of the list and click "Done".
7.  **Verification**:
    *   Confirm the "Apologetics" tab is now the leftmost tab in the bar.
    *   Verify `localStorage.getItem('ready_apologia_tab_order')` contains `["apologetics", ...]` (or matches custom order).
8.  **Action**: Perform a full page reload on the tab page.
9.  **Verification**:
    *   Confirm the custom tab order persists.
10. **Action**: Click the back navigation link `← John 1`.
11. **Verification**:
    *   Confirm it returns to the scripture reader at `/ready_apologia/bible/jn/1`.

---

## Test Case 5: Topics Explorer Scroll Controls (Mobile View - 375x667)
1.  **Action**: Navigate to `/ready_apologia/topics/divinity_of_christ`.
2.  **Verification**:
    *   Verify the master tab bar containing NT, OT, Fathers, Ancient Judaism has a right scroll arrow overlay visible on the right edge.
3.  **Action**: Click the right scroll arrow.
4.  **Verification**:
    *   Confirm the bar scrolls smoothly to the right.
    *   Verify the left scroll arrow appears, and the right scroll arrow disappears when scrolled to the end.

---

## Test Case 6: Topics List Navigation, Highlight Toggling & Scripture Sync (Mobile View - 375x667)
1.  **Action**: Clear `localStorage` and navigate to root `http://localhost:8080/ready_apologia/` (redirects to John 1).
2.  **Action**: Click the "Topics" tab in the bottom nav to go to `/ready_apologia/topics`.
3.  **Verification**:
    *   Verify the list of topics displays.
    *   Verify that each card has a prominent red "Explore" button (with a right chevron arrow) on the right edge.
4.  **Action**: Click the "Explore" button on the "Divinity of Christ" card.
5.  **Verification**:
    *   Confirm it navigates to `/ready_apologia/topics/divinity_of_christ`.
6.  **Action**: Go back to `/ready_apologia/topics`.
7.  **Action**: Click the "Highlight in Scripture" toggle switch inside the "Divinity of Christ" card.
8.  **Verification**:
    *   Confirm `localStorage.getItem('activeTopics')` is set to `["divinity_of_christ"]`.
9.  **Action**: Click the "Scripture" tab in the bottom nav to go back to John 1 reader (`/ready_apologia/bible/jn/1`).
10. **Verification**:
    *   Confirm Verse 1 (`#1` row) has the `.topic-highlight` class applied.
    *   Verify the Divinity of Christ commentary pill is appended to Verse 1 and is clickable.

---

## Test Case 7: Desktop Layout Auto-Docking (Desktop View - 1024x768)
1.  **Action**: Open `/ready_apologia/bible/jn/1` in desktop view.
2.  **Verification**:
    *   Verify the Bottom Navigation tab bar is hidden (`display: none`).
    *   Verify the collapsible sidebar navigation is permanently docked on the **left** side of the screen (`order: -1`).
3.  **Action**: Click the section header "Old Testament" in the sidebar, click "Genesis", and click chapter "1".
4.  **Verification**:
    *   Confirm it navigates successfully to `/ready_apologia/bible/gn/1`.

---

## Test Case 8: Global Error & Warning Check
1.  **Action**: Throughout all actions in Test Cases 1-7 and 9, monitor the browser console logs.
2.  **Verification**:
3.      *   Verify that **zero errors or warnings** are generated by the app scripts.

---

## Test Case 9: Multi-Topic Highlighting & Navigation Persistence (SPA Transition)
1.  **Action**: Clear `localStorage` and navigate to root `http://localhost:8080/ready_apologia/` (redirects to John 1).
2.  **Action**: Click the "Topics" tab in the bottom nav to go to `/ready_apologia/topics`.
3.  **Action**: Toggle the "Highlight in Scripture" switch to **Active** on every single topic card.
4.  **Action**: Open the collapsible left navigation sidebar, click on "Old Testament", select "Genesis", and click on chapter "1".
5.  **Verification**:
    *   Confirm the reader transitions successfully to `/ready_apologia/bible/gn/1`.
    *   Verify that Verse 2 (`#2` row) has the `.topic-highlight` class applied.
    *   Verify the Divinity of the Holy Spirit and Trinity commentary pills are successfully appended to Verse 2 and are interactive.
    *   Verify that **zero console errors** (specifically, `SyntaxError` redeclaration errors) are thrown during or after navigation.

---

## Test Case 10: End-to-End Build Resiliency
- **Action**: As an agent, attempt to run the Astro production build command:
  `NODE_OPTIONS='--experimental-sqlite' $(find ~/.vscode-server/cli/servers -name node -type f | head -n 1) ./node_modules/astro/bin/astro.mjs build`
- **Expected Outcome**:
  - The build should compile all static routes successfully.

---

## Test Case 11: Quran Competing Codex Pill & Codex Page Navigation
1.  **Action**: Navigate to Surah 2 reader (`http://localhost:8080/ready_apologia/quran/2`).
2.  **Verification**:
    *   Confirm the page renders Surah 2 verses.
3.  **Action**: Scroll down to Verse 184 (`#v-184`).
4.  **Verification**:
    *   Verify that Verse 184 contains a clickable `<summary>` element featuring the red `COMPETING CODEX` pill (`.competing-pill`).
5.  **Action**: Click the `COMPETING CODEX` summary pill on Verse 184.
6.  **Verification**:
    *   Confirm the `<details>` element expands to reveal the competing reading variant cards.
    *   Verify that both Arabic (`.text-arabic`) and English (`.text-english`) texts, as well as the hyperlinked hadith reference (`.hadith-title-link`), are visible inside the variant cards.
7.  **Action**: Click the "Read as Abdullah bin Umar" button (`.read-as-btn`) inside one of the variant cards.
8.  **Verification**:
    *   Confirm the browser navigates smoothly to the full companion codex page (`/ready_apologia/quran/codex/abdullah-bin-umar`).
    *   Verify that the full codex page displays the companion title, bio section, and structured Uthmanic comparison cards cleanly without layout shifts or console errors.

---

## Test Case 12: Quran Qira'at Variant Readings & Inline Highlighting
1.  **Action**: Navigate to Surah 1 reader (`http://localhost:8080/ready_apologia/quran/1`).
2.  **Verification**:
    *   Confirm the page renders Surah 1 verses.
3.  **Action**: Inspect Verse 4 (`#v-4`).
4.  **Verification**:
    *   Verify that the English word "Master" and the Arabic word "مَٰلِكِ" in the main verse text are wrapped in `<span class="qiraat-highlight">`, giving them a subtle yellow background and bottom border.
    *   Verify that Verse 4 contains a clickable `<summary class="qiraat-summary">` featuring the yellow/orange Qira'at pill (`.qiraat-pill`) with text indicating the change category and effect (e.g., `Graphical/Basic Letter Difference - Change Meaning (general semantic shift)`).
    *   Verify that no variant reading with both category or effect as "Other" / "other" is rendered.
5.  **Action**: Click the Qira'at summary pill on Verse 4.
6.  **Verification**:
    *   Confirm the `<details class="qiraat-details">` element expands to reveal the Qira'at variant card (`.qiraat-card`).
    *   Verify the side-by-side diff box (`.qiraat-diff`) cleanly displays `Original (Hafs)` on the left and `Variant Reading` on the right, separated by a divider icon.
    *   Verify the description callout box (`.qiraat-description`) and the list of canonical readers (`.qiraat-readers`) are visible and cleanly formatted.
7.  **Action**: Navigate to Surah 2 reader and scroll to Verse 184 (`http://localhost:8080/ready_apologia/quran/2#v-184`).
8.  **Verification**:
    *   Confirm that Verse 184 displays **both** the red `COMPETING CODEX` pill (`.competing-pill`) and the yellow/orange Qira'at variant reading pill (`.qiraat-pill`) simultaneously.
    *   Verify that expanding both pills independently works cleanly without layout collisions or console errors.


---

## Test Case 13: Quran Evidence & Filters Home Page & Variant Navigation
1.  **Action**: Navigate to `http://localhost:8080/ready_apologia/quran`.
2.  **Verification**:
    *   Confirm the page renders the Evidence & Filters home page.
    *   Verify the top header reads "Evidence & Filters" and the surah selector dropdown chevron is completely hidden.
    *   Verify the "Lost Verses" card displays a total count badge (e.g., `<span class="count-badge light">`).
    *   Verify the "Competing Codices" card displays companion pills with numerical counts next to them.
3.  **Action**: Click the `Abdullah bin Umar` pill inside the Competing Codices card.
4.  **Verification**:
    *   Confirm the browser navigates successfully to `/ready_apologia/quran/codex/abdullah-bin-umar`.
5.  **Action**: Navigate back to `http://localhost:8080/ready_apologia/quran`.
6.  **Action**: Click the `Change Meaning (general semantic shift)` pill inside the Qiraat variants by effect card.
7.  **Verification**:
    *   Confirm the browser navigates successfully to `/ready_apologia/quran/variant/effect-change-meaning-general-semantic-shift`.
    *   Verify the top header renders "Change Meaning (general semantic shift)" and the dropdown chevron is hidden.
    *   Verify the verses list displays variant cards with the variant words visually highlighted in green.
