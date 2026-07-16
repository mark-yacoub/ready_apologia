# Browser Tests for Apologetics UI changes

This document lists the scenarios to be tested via the `/browser` subagent whenever changes are made to the Evidence/Tab Drawers in the UI.

## Scenarios
1. **Bible Video Badge Test**
   - **Goal:** Verify that a verse possessing videos (like John 1:1) displays the video icon badge in the chapter viewer.
   - **Steps:** Navigate to `http://localhost:4321/bible/jn/1`. Check for `.vd-icon` next to the verses. Ensure the video badge has correct SVG structure and click on it. It should open `http://localhost:4321/bible/jn/1/1/videos`.

2. **Quran Video Badge Test**
   - **Goal:** Verify that a Quran Surah correctly displays the video icon badge, utilizing the DB mapping via `short_per_verse`.
   - **Steps:** Navigate to `http://localhost:4321/quran/10`. Find verse 94. It should have the `.vd-icon`. Click it to go to `http://localhost:4321/quran/10/94/videos`.

3. **Videos Tab UI Test**
   - **Goal:** Verify the `VideosGrid` renders properly inside the drawer for a Bible or Quran verse.
   - **Steps:** Navigate to `http://localhost:4321/quran/10/94/videos`. Wait for the iframe container (YouTube embed) to render. Check for `.apologist-badge` or `.video-summary`. Finally, click the `details.mentioned-verses-details` component to expand and check that cross-references like `.ct-verse-link` correctly render and have English text available next to them.

## Running Tests
Run this via the browser agent:
```bash
agentapi new-conversation --title="Browser Videos Test" "Please run the browser tests defined in .agents/browser_tests.md against http://localhost:4321. Pay particular attention to the Videos tab UI features like cross-references accordion and grid layout."
```
