export function parseAndLinkReferences(text: string): string {
  if (!text) return text;
  
  const icon = `<svg class="inline-block w-3.5 h-3.5 mb-0.5 ml-0.5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>`;
  
  const chunks = text.split(/(<[^>]+>)/g);
  
  for (let i = 0; i < chunks.length; i++) {
    if (chunks[i].startsWith('<')) continue;
    
    let html = chunks[i];

    // 2. Tafsir Ibn Kathir
    const ibnKathirRegex = /(?:Tafsir\s+)?Ibn\s+Kathir(?:\s*\([a-zA-Z\s]+\))?[\s\-:(]+(?:Quran|Surah|Verse|for\s+Surah|for\s+Verse|for)?\s*(\d+):(\d+)(?:-\d+)?(?:\))?(?:\s*\(.*?\))?/gi;
    html = html.replace(ibnKathirRegex, (match, surah, ayah) => {
      return `<a href="/quran/${surah}/${ayah}/tafsir/ibn_kathir" target="_blank" class="internal-ref font-bold text-purple-700 hover:text-purple-900 transition-colors dropdown-link shadow-inner" title="View Tafsir Ibn Kathir">${match}</a>`;
    });
    
    // 3. Tafsir al-Tabari
    const tabariRegex = /(?:Tafsir\s+)?(?:al-)?Tabari(?:\s*\([a-zA-Z\s]+\))?[\s\-:(]+(?:Quran|Surah|Verse|for\s+Surah|for\s+Verse|for)?\s*(\d+):(\d+)(?:-\d+)?(?:\))?(?:\s*\(.*?\))?/gi;
    html = html.replace(tabariRegex, (match, surah, ayah) => {
      return `<a href="/quran/${surah}/${ayah}/tafsir/tabari" target="_blank" class="internal-ref font-bold text-purple-700 hover:text-purple-900 transition-colors dropdown-link shadow-inner" title="View Tafsir al-Tabari">${match}</a>`;
    });
    
    // 4. Tafsir al-Qurtubi
    html = html.replace(/Tafsir al-Qurtubi(?:\s*\([a-zA-Z\s]+\))?[\s\-:(]+(?:Quran|Surah|Verse|for\s+Surah|for\s+Verse|for)?\s*(\d+):(\d+)(?:-\d+)?(?:\))?/gi, (match, surah, ayah) => {
      return `<a href="/quran/${surah}/${ayah}/tafsir/qurtubi" target="_blank" class="internal-ref font-bold text-purple-700 hover:text-purple-900 transition-colors dropdown-link shadow-inner">${match}</a>`;
    });

    // 1. Quran Translation Ref
    html = html.replace(/Quran\s+(\d+)\:(\d+)(?:-\d+)?(?:\s*\(.*?\))?/gi, (match, surah, ayah) => {
      return `<a href="/quran/${surah}#${ayah}" target="_blank" class="internal-ref font-bold text-purple-700 hover:text-purple-900 transition-colors dropdown-link shadow-inner">Quran ${surah}:${ayah}</a>`;
    });
    
    // Specific Muslim format with Book/Hadith
    html = html.replace(/Muslim\s+\d+\s*\/\s*Arabic Number\s+[\d\.]+,\s*Ref:\s*Book\s+(\d+),\s*Hadith\s+(\d+)\s*\(Sahih Muslim\)/gi, (match, book, hadith) => {
      return `<a href="https://sunnah.com/muslim/${book}/${hadith}" target="_blank" rel="noopener noreferrer" class="hadith-source-link font-bold text-purple-700 hover:text-purple-900 transition-colors dropdown-link shadow-inner">${match}${icon}</a>`;
    });

    // Bukhari
    html = html.replace(/(?:Sahih )?(?:al-)?Bukhari\s+(\d+)/gi, (match, num) => {
      return `<a href="https://sunnah.com/bukhari:${num}" target="_blank" rel="noopener noreferrer" class="hadith-source-link font-bold text-purple-700 hover:text-purple-900 transition-colors dropdown-link shadow-inner">${match}${icon}</a>`;
    });

    // Muslim Regex
    html = html.replace(/(?:Sahih )?Muslim\s+(\d+(?:\.\d+)?[a-zA-Z]?)/gi, (match, num) => {
      return `<a href="https://sunnah.com/muslim:${num}" target="_blank" rel="noopener noreferrer" class="hadith-source-link font-bold text-purple-700 hover:text-purple-900 transition-colors dropdown-link shadow-inner">${match}${icon}</a>`;
    });

    // Sunan Abi Dawud NNNN
    html = html.replace(/Sunan Abi Dawud\s+(\d+)/gi, (match, num) => {
      return `<a href="https://sunnah.com/abudawud:${num}" target="_blank" rel="noopener noreferrer" class="hadith-source-link font-bold text-purple-700 hover:text-purple-900 transition-colors dropdown-link shadow-inner">${match}${icon}</a>`;
    });

    // Sunan an-Nasa'i NNNN
    html = html.replace(/Sunan an-Nasa'i\s+(\d+)/gi, (match, num) => {
      return `<a href="https://sunnah.com/nasai:${num}" target="_blank" rel="noopener noreferrer" class="hadith-source-link font-bold text-purple-700 hover:text-purple-900 transition-colors dropdown-link shadow-inner">${match}${icon}</a>`;
    });
    
    // Musannaf Ibn Abi Shaybah 6236
    html = html.replace(/Musannaf Ibn Abi Shaybah\s+(\d+)/gi, (match, num) => {
      if (num === '6236' || num === '6235') {
         return `<a href="https://islamqa.info/en/answers/8489/" target="_blank" rel="noopener noreferrer" class="hadith-source-link font-bold text-purple-700 hover:text-purple-900 transition-colors dropdown-link shadow-inner">${match}</a> <a href="https://dorar.net/hadith/search?q=%D8%A3%D9%85%D8%A9+%D9%85%D8%AA%D9%82%D9%86%D8%B9%D8%A9+%D9%81%D8%B6%D8%B1%D8%A8%D9%87%D8%A7" target="_blank" rel="noopener noreferrer" class="text-xs font-bold text-emerald-600 hover:text-emerald-800 transition-colors ml-1" title="Verify Arabic Chains on Dorar">[Dorar Validation]${icon}</a>`;
      }
      return match;
    });

    // Generic Hadith Fallback
    html = html.replace(/Hadith\s+(\d{4,})/gi, (match, num) => {
      return `<a href="https://sunnah.com/search?q=${num}" target="_blank" rel="noopener noreferrer" class="hadith-source-link font-bold text-purple-700 hover:text-purple-900 transition-colors dropdown-link shadow-inner">${match}${icon}</a>`;
    });

    chunks[i] = html;
  }
  
  return chunks.join('');
}
