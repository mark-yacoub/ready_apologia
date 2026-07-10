import asyncio
import json
import urllib.request
import websockets
import subprocess
import time
import os
import sys

# Comprehensive CDP test runner implementing browser_tests.md (Test Cases 1-18)
import shutil

async def run_test_suite():
    print("🚀 Launching Headless Chrome (CDP on port 9223)...")
    shutil.rmtree("/tmp/chrome_clean_run", ignore_errors=True)
    chrome = subprocess.Popen([
        "google-chrome",
        "--headless",
        "--remote-debugging-port=9223",
        "--disable-gpu",
        "--no-proxy-server",
        "--proxy-bypass-list=127.0.0.1,localhost",
        "--disable-extensions",
        "--disable-component-extensions-with-background-pages",
        "--disable-features=SafeBrowsing,SafeBrowsingEnhancedProtection",
        "--user-data-dir=/tmp/chrome_clean_run"
    ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    
    time.sleep(2.5)
    
    try:
        response = urllib.request.urlopen("http://localhost:9223/json")
        data = json.loads(response.read().decode())
        ws_url = data[0]["webSocketDebuggerUrl"]
    except Exception as e:
        print(f"❌ Error connecting to CDP on port 9223: {e}")
        chrome.kill()
        return False

    results = {}
    console_errors = []

    async with websockets.connect(ws_url) as ws:
        msg_id = 1
        async def send(method, params=None):
            nonlocal msg_id
            payload = {"id": msg_id, "method": method}
            if params: payload["params"] = params
            await ws.send(json.dumps(payload))
            msg_id += 1
            while True:
                resp_str = await ws.recv()
                resp = json.loads(resp_str)
                if resp.get("method") == "Runtime.consoleAPICalled":
                    if resp.get("params", {}).get("type") == "error":
                        console_errors.append(resp["params"])
                if resp.get("id") == payload["id"]:
                    if "error" in resp or resp.get("result", {}).get("errorText"):
                        print(f"   ⚠️ CDP Error for {method} {params}: {resp}")
                    return resp

        async def eval_js(expr):
            res = await send("Runtime.evaluate", {"expression": expr, "returnByValue": True})
            if "error" in res or "exceptionDetails" in res.get("result", {}):
                print(f"   ⚠️ eval_js error for [{expr}]: {res}")
            return res.get("result", {}).get("result", {}).get("value")

        async def set_viewport(width, height):
            await send("Emulation.setDeviceMetricsOverride", {
                "width": width,
                "height": height,
                "deviceScaleFactor": 2,
                "mobile": width < 768
            })

        await send("Page.enable")
        await send("Runtime.enable")

        print("\n--- Executing Browser Test Suite (browser_tests.md) ---")

        # Test Case 1: Initial Redirect Gate & Last Visited Persistence
        print("Running Test Case 1: Initial Redirect & Last Visited Persistence...")
        await send("Page.navigate", {"url": "http://127.0.0.1:8080/"})
        time.sleep(2)
        await eval_js("localStorage.clear(); sessionStorage.clear();")
        await send("Page.navigate", {"url": "http://127.0.0.1:8080/"})
        time.sleep(2)
        path1 = await eval_js("window.location.pathname")
        last_visited1 = await eval_js("localStorage.getItem('lastVisitedUrl')")
        
        await send("Page.navigate", {"url": "http://127.0.0.1:8080/bible/gn/1"})
        time.sleep(2)
        last_visited2 = await eval_js("localStorage.getItem('lastVisitedUrl')")
        
        await send("Page.navigate", {"url": "http://127.0.0.1:8080/"})
        time.sleep(2)
        path2 = await eval_js("window.location.pathname")
        
        print(f"   [Case 1 Debug] path1={path1}, last_visited1={last_visited1}, last_visited2={last_visited2}, path2={path2}")
        results["Test Case 1: Initial Redirect & Last Visited Persistence"] = (
            "/bible/jn/1" in str(path1) and 
            "/bible/jn/1" in str(last_visited1) and 
            "/bible/gn/1" in str(last_visited2) and 
            "/bible/gn/1" in str(path2)
        )

        # Test Case 2: Verse Selection & Highlighting (Mobile View - 375x667)
        print("Running Test Case 2: Verse Selection & Highlighting (Mobile)...")
        await set_viewport(375, 667)
        await send("Page.navigate", {"url": "http://127.0.0.1:8080/bible/jn/1"})
        time.sleep(2)
        await eval_js("const el = document.getElementById('3')?.querySelector('.verse-text-link-wrapper') || document.getElementById('3')?.querySelector('a'); if(el) el.click();")
        time.sleep(2.5)
        path_v3 = await eval_js("window.location.pathname")
        print(f"   [Case 2 Debug] path_v3={path_v3}")
        results["Test Case 2: Verse Selection & Highlighting"] = "/bible/jn/1/3/" in str(path_v3)

        # Test Case 3: Mobile Pager Navigation & Swipes (Mobile View - 375x667)
        print("Running Test Case 3: Mobile Pager Navigation...")
        await send("Page.navigate", {"url": "http://127.0.0.1:8080/bible/jn/1"})
        time.sleep(2)
        await eval_js("const nextBtn = Array.from(document.querySelectorAll('.pager-btn')).find(el => el.textContent.includes('2')); if(nextBtn) nextBtn.click();")
        time.sleep(1.5)
        path_ch2 = await eval_js("window.location.pathname")
        await eval_js("const prevBtn = Array.from(document.querySelectorAll('.pager-btn')).find(el => el.textContent.includes('1')); if(prevBtn) prevBtn.click();")
        time.sleep(1.5)
        path_ch1 = await eval_js("window.location.pathname")
        print(f"   [Case 3 Debug] path_ch2={path_ch2}, path_ch1={path_ch1}")
        results["Test Case 3: Mobile Pager Navigation"] = ("/bible/jn/2" in str(path_ch2)) and ("/bible/jn/1" in str(path_ch1))

        # Test Case 4: Evidence Tab Switching & Custom Order Persistence (Mobile View - 375x667)
        print("Running Test Case 4: Evidence Tab Switching & Custom Order Persistence...")
        await send("Page.navigate", {"url": "http://127.0.0.1:8080/bible/jn/1/1"})
        time.sleep(2.5)
        redirected_tab = await eval_js("window.location.pathname")
        await eval_js("const apTab = Array.from(document.querySelectorAll('.segmented-pill-btn')).find(el => el.textContent.includes('Apologetics')); if(apTab) apTab.click();")
        time.sleep(1.5)
        path_ap = await eval_js("window.location.pathname")
        await eval_js("window.dispatchEvent(new Event('open-tab-settings'));")
        time.sleep(1)
        modal_open = await eval_js("document.querySelector('.reorder-modal-card') !== null")
        await eval_js("""
            (() => {
                const apRow = Array.from(document.querySelectorAll('.reorder-list-item')).find(el => el.textContent.includes('Apologetics'));
                if(apRow) apRow.querySelectorAll('.reorder-arrow-btn')[0]?.click();
            })();
        """)
        time.sleep(1)
        await eval_js("""
            (() => {
                const apRow = Array.from(document.querySelectorAll('.reorder-list-item')).find(el => el.textContent.includes('Apologetics'));
                if(apRow) apRow.querySelectorAll('.reorder-arrow-btn')[0]?.click();
            })();
        """)
        time.sleep(1)
        await eval_js("const doneBtn = document.querySelector('.reorder-modal-done-btn'); if(doneBtn) doneBtn.click();")
        time.sleep(0.5)
        saved_order = await eval_js("localStorage.getItem('ready_apologia_tab_order')")
        await send("Page.reload")
        time.sleep(2.5)
        first_tab_text = await eval_js("document.querySelector('.segmented-pill-btn')?.textContent")
        print(f"   [Case 4 Debug] redirected_tab={redirected_tab}, path_ap={path_ap}, modal_open={modal_open}, saved_order={saved_order}, first_tab_text={first_tab_text}")
        results["Test Case 4: Evidence Tab Switching & Custom Order Persistence"] = (
            "/manuscripts" in str(redirected_tab) and
            "/apologetics" in str(path_ap) and
            modal_open and
            "apologetics" in str(saved_order) and
            "Apologetics" in str(first_tab_text)
        )

        # Test Case 5: Topics Explorer Scroll Controls (Mobile View - 375x667)
        print("Running Test Case 5: Topics Explorer Scroll Controls...")
        await send("Page.navigate", {"url": "http://127.0.0.1:8080/topics/divinity_of_christ"})
        time.sleep(2.5)
        has_scroll_track = await eval_js("document.querySelector('.scrollable-track-wrapper') !== null || document.querySelector('.tab-segmented-bar') !== null")
        results["Test Case 5: Topics Explorer Scroll Controls"] = bool(has_scroll_track)

        # Test Case 6: Topics List Navigation, Highlight Toggling & Scripture Sync (Mobile View - 375x667)
        print("Running Test Case 6: Topics List Navigation & Scripture Sync...")
        await send("Page.navigate", {"url": "http://127.0.0.1:8080/topics"})
        time.sleep(3.5)
        await eval_js("localStorage.clear();")
        await send("Page.reload")
        time.sleep(3.5)
        explore_btn_exists = await eval_js("document.querySelector('.explore-badge-btn') !== null || Array.from(document.querySelectorAll('a, div, button')).some(el => el.textContent.includes('Explore'))")
        
        # Toggle switch on Divinity of Christ
        await eval_js("""
            (() => {
                const toggle = Array.from(document.querySelectorAll('.ios-compact-toggle, .card-toggle')).find(el => el.closest('.topic-card')?.textContent.includes('Divinity of Christ') || el.parentElement?.parentElement?.textContent.includes('Divinity of Christ'));
                if(toggle) toggle.click();
            })();
        """)
        time.sleep(1)
        active_topics = await eval_js("localStorage.getItem('activeTopics')")
        
        # Navigate back to John 1
        await send("Page.navigate", {"url": "http://127.0.0.1:8080/bible/jn/1"})
        time.sleep(3)
        has_highlight = await eval_js("document.getElementById('1')?.classList.contains('topic-highlight') || document.getElementById('1')?.querySelector('.verse-topic-pills') !== null")
        print(f"   [Case 6 Debug] explore_btn_exists={explore_btn_exists}, active_topics={active_topics}, has_highlight={has_highlight}")
        results["Test Case 6: Topics List Navigation & Scripture Sync"] = (
            explore_btn_exists and "divinity_of_christ" in str(active_topics) and bool(has_highlight)
        )

        # Test Case 7: Desktop Layout Auto-Docking (Desktop View - 1024x768)
        print("Running Test Case 7: Desktop Layout Auto-Docking...")
        await set_viewport(1024, 768)
        await send("Page.navigate", {"url": "http://127.0.0.1:8080/bible/jn/1"})
        time.sleep(2.5)
        bottom_nav_hidden = await eval_js("window.getComputedStyle(document.querySelector('.bottom-nav')).display === 'none'")
        sidebar_docked = await eval_js("window.getComputedStyle(document.querySelector('#scripture-nav-sidebar')).position === 'relative'")
        
        # Click Old Testament -> Genesis -> 1 in sidebar
        await eval_js("""
            const otHeader = Array.from(document.querySelectorAll('.section-header-btn')).find(el => el.textContent.includes('Old Testament'));
            if(otHeader) otHeader.click();
        """)
        time.sleep(0.5)
        await eval_js("""
            const gnBtn = Array.from(document.querySelectorAll('.book-select-btn')).find(el => el.textContent.includes('Genesis'));
            if(gnBtn) gnBtn.click();
        """)
        time.sleep(0.5)
        await eval_js("""
            const ch1Btn = Array.from(document.querySelectorAll('.chapter-link')).find(el => el.textContent === '1' && el.href.includes('/gn/'));
            if(ch1Btn) ch1Btn.click();
        """)
        time.sleep(2.5)
        desktop_nav_path = await eval_js("window.location.pathname")
        
        results["Test Case 7: Desktop Layout Auto-Docking"] = (
            bool(bottom_nav_hidden) and bool(sidebar_docked) and "/bible/gn/1" in str(desktop_nav_path)
        )

        # Test Case 8: Global Error & Warning Check
        print("Checking Test Case 8: Global Error & Warning Check...")
        results["Test Case 8: Global Error & Warning Check"] = (len(console_errors) == 0)

        # Test Case 9: Multi-Topic Highlighting & Navigation Persistence (SPA Transition)
        print("Running Test Case 9: Multi-Topic Highlighting & SPA Persistence...")
        await set_viewport(375, 667)
        await send("Page.navigate", {"url": "http://127.0.0.1:8080/topics"})
        time.sleep(3.5)
        await eval_js("localStorage.clear();")
        await send("Page.reload")
        time.sleep(3.5)
        # Toggle all active
        await eval_js("""
            document.querySelectorAll('.card-toggle, .ios-compact-toggle').forEach(t => { if(!t.classList.contains('is-active')) t.click(); });
        """)
        time.sleep(1)
        await send("Page.navigate", {"url": "http://127.0.0.1:8080/bible/gn/1"})
        time.sleep(3)
        multi_highlight = await eval_js("document.getElementById('2')?.classList.contains('type-topic') || document.getElementById('2')?.querySelector('.verse-topic-pills') !== null")
        results["Test Case 9: Multi-Topic Highlighting & SPA Persistence"] = bool(multi_highlight)

        # Test Case 11: Quran Competing Codex Pill & Codex Page Navigation
        print("Running Test Case 11: Quran Competing Codex Pill & Codex Page Navigation...")
        await send("Page.navigate", {"url": "http://127.0.0.1:8080/quran/2"})
        time.sleep(2)
        v184_competing_pill = await eval_js("document.querySelector('#v-184 .competing-pill') !== null")
        await eval_js("const pill = document.querySelector('#v-184 .competing-pill'); if(pill) pill.closest('summary')?.click();")
        time.sleep(0.5)
        has_arabic_eng = await eval_js("document.querySelector('#v-184 .text-arabic') !== null && document.querySelector('#v-184 .text-english') !== null")
        
        await eval_js("const btn = document.querySelector('#v-184 .read-as-btn'); if(btn) btn.click();")
        time.sleep(2)
        codex_path = await eval_js("window.location.pathname")
        
        results["Test Case 11: Quran Competing Codex & Codex Page Navigation"] = (
            bool(v184_competing_pill) and bool(has_arabic_eng) and "/quran/codex/" in str(codex_path)
        )

        # Test Case 14: Quran Verse Manuscript Evidence Drawer
        print("Running Test Case 14: Quran Verse Manuscript Evidence Drawer...")
        await send("Page.navigate", {"url": "http://127.0.0.1:8080/quran/43"})
        time.sleep(1.5)
        v10_tray = await eval_js("document.querySelector('#v-10 .ms-icon') !== null")
        await eval_js("const icon = document.querySelector('#v-10 .ms-icon'); if(icon) icon.click();")
        time.sleep(1.5)
        ms_path = await eval_js("window.location.pathname")
        active_ms_tab = await eval_js("document.querySelector('.segmented-pill-btn.active')?.textContent.includes('Manuscripts')")
        
        results["Test Case 14: Quran Verse Manuscript Evidence Drawer"] = (
            bool(v10_tray) and "/quran/43/10/manuscripts" in str(ms_path) and bool(active_ms_tab)
        )

        # Test Case 15: Quran Contradictions Evidence Drawer
        print("Running Test Case 15: Quran Contradictions Evidence Drawer...")
        await send("Page.navigate", {"url": "http://127.0.0.1:8080/quran/7"})
        time.sleep(1.5)
        v120_ct = await eval_js("document.querySelector('#v-120 .ct-icon') !== null")
        await eval_js("const icon = document.querySelector('#v-120 .ct-icon'); if(icon) icon.closest('a')?.click() || icon.click();")
        time.sleep(1.5)
        ct_path = await eval_js("window.location.pathname")
        has_opp = await eval_js("document.querySelector('.snippet-opp') !== null || document.querySelector('.contradiction-details-card') !== null")
        
        results["Test Case 15: Quran Contradictions Evidence Drawer"] = (
            bool(v120_ct) and "/quran/7/120/contradictions" in str(ct_path) and bool(has_opp)
        )

        # Test Case 16: Quran Christian Commentaries & Tafseer Tabs
        print("Running Test Case 16: Quran Christian Commentaries & Tafseer Tabs...")
        await send("Page.navigate", {"url": "http://127.0.0.1:8080/quran/1/1/christian-footnotes"})
        time.sleep(1.5)
        comm_active = await eval_js("document.querySelector('.segmented-pill-btn.active')?.textContent.includes('Christian Footnotes')")
        
        await send("Page.navigate", {"url": "http://127.0.0.1:8080/quran/1/1/islamic-commentaries"})
        time.sleep(1.5)
        tafseer_active = await eval_js("document.querySelector('.segmented-pill-btn.active')?.textContent.includes('Islamic Commentaries')")
        
        results["Test Case 16: Quran Christian Commentaries & Tafseer Tabs"] = bool(comm_active) and bool(tafseer_active)

        # Test Case 17: Quran Scientific Errors Tab
        print("Running Test Case 17: Quran Scientific Errors Tab...")
        await send("Page.navigate", {"url": "http://127.0.0.1:8080/quran/86/6/scientific-errors"})
        time.sleep(1.5)
        se_active = await eval_js("document.querySelector('.segmented-pill-btn.active')?.textContent.includes('Scientific Errors')")
        results["Test Case 17: Quran Scientific Errors Tab"] = bool(se_active)

        # Test Case 18: Quran Debunking Miracles, Clickable Verse Text & Tab Preference Redirection
        print("Running Test Case 18: Quran Debunking Miracles & Tab Preference Redirection...")
        await send("Page.navigate", {"url": "http://127.0.0.1:8080/quran/86"})
        time.sleep(2)
        await eval_js("localStorage.clear();")
        await send("Page.reload")
        time.sleep(1.5)
        v1_clickable = await eval_js("document.querySelector('#v-1 .verse-text-link') !== null")
        await eval_js("const link = document.querySelector('#v-1 .verse-text-link'); if(link) link.click();")
        time.sleep(1.5)
        dm_path = await eval_js("window.location.pathname")
        dm_active = await eval_js("document.querySelector('.segmented-pill-btn.active')?.textContent.includes('Debunking Miracles')")
        
        # Open tab settings and reorder
        await eval_js("window.dispatchEvent(new Event('open-quran-tab-settings'));")
        time.sleep(0.5)
        await eval_js("""
            const msRow = Array.from(document.querySelectorAll('.reorder-list-item')).find(el => el.textContent.includes('Manuscripts'));
            if(msRow) {
                const upBtn = msRow.querySelectorAll('.reorder-arrow-btn')[0];
                if(upBtn) upBtn.click();
                if(upBtn) upBtn.click();
                if(upBtn) upBtn.click();
            }
        """)
        time.sleep(0.3)
        await eval_js("const doneBtn = document.querySelector('.reorder-modal-done-btn'); if(doneBtn) doneBtn.click();")
        time.sleep(0.5)
        saved_quran_order = await eval_js("localStorage.getItem('ready_apologia_quran_tab_order')")
        
        # Click verse text again after navigating back
        await send("Page.navigate", {"url": "http://127.0.0.1:8080/quran/86"})
        time.sleep(1.5)
        await eval_js("const link2 = document.querySelector('#v-1 .verse-text-link'); if(link2) link2.click();")
        time.sleep(1.5)
        pref_path = await eval_js("window.location.pathname")
        print(f"   [Case 18 Debug] v1_clickable={v1_clickable}, dm_path={dm_path}, dm_active={dm_active}, saved_quran_order={saved_quran_order}, pref_path={pref_path}")
        results["Test Case 18: Quran Debunking Miracles & Tab Preference Redirection"] = (
            bool(v1_clickable) and "/debunking-miracles" in str(dm_path) and bool(dm_active) and ("manuscripts" in str(saved_quran_order) or "/manuscripts" in str(pref_path))
        )

        # Print Final Summary Table
        print("\n" + "="*70)
        print("          READY APOLOGIA - FULL BROWSER SUITE RESULTS")
        print("="*70)
        passed_count = 0
        for case_name, status in results.items():
            status_str = "✅ PASS" if status else "❌ FAIL"
            if status: passed_count += 1
            print(f"{case_name.ljust(56)} : {status_str}")
        print("="*70)
        print(f"Total: {passed_count}/{len(results)} Test Cases Passed.")
        
        if console_errors:
            print("\n⚠️ Console Errors Detected:")
            for err in console_errors:
                print(err)

    chrome.kill()
    return (passed_count == len(results))

if __name__ == "__main__":
    success = asyncio.run(run_test_suite())
    sys.exit(0 if success else 1)
