import json
import urllib.request

def main():
    # Fetch surahs from API
    try:
        url = 'https://api.alquran.cloud/v1/surah'
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode('utf-8'))['data']
    except Exception as e:
        print(f"Error fetching surahs: {e}")
        return

    quran_books = [
        { "id": "qr-0", "name": "Lost Verses", "chapters": 1 }
    ]
    
    for s in data:
        quran_books.append({
            "id": f"qr-{s['number']}",
            "name": f"{s['number']}. {s['englishName']}",
            "chapters": 1
        })

    # Read existing meta
    meta_path = 'src/data/books_meta.json'
    with open(meta_path, 'r', encoding='utf-8') as f:
        meta = json.load(f)

    meta['quran'] = quran_books

    # Write back
    with open(meta_path, 'w', encoding='utf-8') as f:
        json.dump(meta, f, indent=2, ensure_ascii=False)
        f.write('\n')
        
    print("Successfully updated books_meta.json!")

if __name__ == '__main__':
    main()
