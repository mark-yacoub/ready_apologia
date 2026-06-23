import asyncio
import json
import urllib.request
import websockets
import subprocess
import time
import os

async def main():
    # Start Chrome
    chrome = subprocess.Popen([
        "google-chrome",
        "--headless",
        "--remote-debugging-port=9222",
        "--disable-gpu"
    ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    
    time.sleep(2)
    
    # Get WS URL
    try:
        response = urllib.request.urlopen("http://localhost:9222/json")
        data = json.loads(response.read().decode())
        ws_url = data[0]["webSocketDebuggerUrl"]
    except Exception as e:
        print(f"Error connecting to CDP: {e}")
        chrome.kill()
        return

    async with websockets.connect(ws_url) as ws:
        msg_id = 1
        async def send(method, params=None):
            nonlocal msg_id
            payload = {"id": msg_id, "method": method}
            if params: payload["params"] = params
            await ws.send(json.dumps(payload))
            msg_id += 1
            # Simple wait for reply
            while True:
                resp = json.loads(await ws.recv())
                if resp.get("id") == payload["id"]:
                    return resp

        # Navigate
        print("Running tests...")
        
        # Test Case 1: First Visit
        await send("Page.enable")
        await send("Page.navigate", {"url": "http://localhost:8080/"})
        time.sleep(2)
        
        # Check if modal is visible
        res = await send("Runtime.evaluate", {"expression": "document.querySelector('.onboarding-modal-card') !== null"})
        modal_visible = res["result"]["result"]["value"]
        print(f"Test 1 - Modal visible on first visit: {modal_visible}")
        
        # Test Case 2: Dismissing the Modal
        await send("Runtime.evaluate", {"expression": "document.querySelector('.onboarding-btn').click()"})
        time.sleep(0.5)
        res = await send("Runtime.evaluate", {"expression": "document.querySelector('.onboarding-modal-card') === null"})
        modal_dismissed = res["result"]["result"]["value"]
        print(f"Test 2 - Modal dismissed: {modal_dismissed}")
        
        # Test Case 3: Same Session Navigation (John 2)
        await send("Page.navigate", {"url": "http://localhost:8080/bible/John/2/1/manuscripts"})
        time.sleep(2)
        res = await send("Runtime.evaluate", {"expression": "document.querySelector('.onboarding-modal-card') === null"})
        modal_not_shown = res["result"]["result"]["value"]
        print(f"Test 3 - Modal NOT shown on John 2: {modal_not_shown}")

        # Test Case 4: Achieving Goal (John 1:1)
        await send("Page.navigate", {"url": "http://localhost:8080/bible/John/1/1/manuscripts"})
        time.sleep(2)
        # Check if 3 tabs exist
        res = await send("Runtime.evaluate", {"expression": "document.querySelectorAll('.segmented-pill-btn').length"})
        tabs_count = res["result"]["result"]["value"]
        res = await send("Runtime.evaluate", {"expression": "document.querySelector('.onboarding-modal-card') === null"})
        modal_not_shown_goal = res["result"]["result"]["value"]
        print(f"Test 4 - John 1:1 loaded. Tabs count: {tabs_count}. Modal NOT shown: {modal_not_shown_goal}")

        # Test Case 5: New Session after Achieving Goal
        await send("Runtime.evaluate", {"expression": "sessionStorage.clear()"})
        await send("Page.reload")
        time.sleep(2)
        res = await send("Runtime.evaluate", {"expression": "document.querySelector('.onboarding-modal-card') === null"})
        modal_not_shown_after_reload = res["result"]["result"]["value"]
        print(f"Test 5 - New Session (cleared sessionStorage), Modal NOT shown: {modal_not_shown_after_reload}")

    chrome.kill()

asyncio.run(main())
