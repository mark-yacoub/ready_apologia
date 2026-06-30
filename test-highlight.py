import asyncio
import json
import urllib.request
import websockets
import subprocess
import time

async def main():
    # Start Chrome
    chrome = subprocess.Popen([
        "google-chrome",
        "--headless",
        "--remote-debugging-port=9222",
        "--disable-gpu"
    ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(2)
    
    req = urllib.request.Request("http://127.0.0.1:9222/json")
    with urllib.request.urlopen(req) as resp:
        pages = json.loads(resp.read().decode('utf-8'))
        ws_url = pages[0]['webSocketDebuggerUrl']
        
    async with websockets.connect(ws_url) as ws:
        msg_id = 1
        async def send(method, params=None):
            nonlocal msg_id
            await ws.send(json.dumps({'id': msg_id, 'method': method, 'params': params or {}}))
            msg_id += 1
            while True:
                resp = json.loads(await ws.recv())
                if resp.get('id') == msg_id - 1:
                    return resp
                    
        # Go to topics
        await send("Page.navigate", {"url": "http://localhost:8080/ready_apologia/topics"})
        time.sleep(2)
        
        # Set localStorage directly instead of clicking toggles
        await send("Runtime.evaluate", {
            "expression": "localStorage.setItem('activeTopics', JSON.stringify(['divinity_of_christ', 'divinity_of_the_holy_spirit', 'prophecies', 'trinity']))"
        })
        
        # Go to gn 1
        await send("Page.navigate", {"url": "http://localhost:8080/ready_apologia/bible/gn/1"})
        time.sleep(2)
        
        # Check verse 2
        res = await send("Runtime.evaluate", {
            "expression": "document.getElementById('2') ? document.getElementById('2').className : 'Not found'",
            "returnByValue": True
        })
        print("Verse 2 classes:", res['result']['result']['value'])
        
        res = await send("Runtime.evaluate", {
            "expression": "document.querySelectorAll('.topic-highlight').length",
            "returnByValue": True
        })
        print("Highlighted verses length:", res['result']['result']['value'])
        
    chrome.terminate()

asyncio.get_event_loop().run_until_complete(main())
