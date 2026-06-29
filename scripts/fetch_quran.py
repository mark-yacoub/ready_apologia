import urllib.request
import json
import os

url = "http://api.alquran.cloud/v1/quran/quran-uthmani"
out_path = "/usr/local/google/home/markyacoub/Documents/ready_apologia/src/data/scripture/hafs_arabic.json"

print(f"Fetching {url}...")
try:
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode())
    
    hafs_db = {}
    for surah in data['data']['surahs']:
        surah_num = surah['number']
        for ayah in surah['ayahs']:
            ayah_num = ayah['numberInSurah']
            hafs_id = f"{surah_num}:{ayah_num}"
            hafs_db[hafs_id] = ayah['text']
            
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(hafs_db, f, ensure_ascii=False, indent=2)
        
    print(f"Successfully saved {len(hafs_db)} verses to {out_path}")
except Exception as e:
    print("Error:", e)
