import { query } from '../db.js';
import { enrichVideosWithVerses } from './video_service.js';

/**
 * @typedef {Object} ComparisonItem
 * @property {string} surviving_verse_ref - Standard Quran citation (e.g. "Surah 18:79")
 * @property {string} surviving_arabic - Cairo 1924 text in Arabic
 * @property {string} surviving_english - Cairo 1924 text in English
 * @property {string} lost_verse_arabic - Companion recitation in Arabic
 * @property {string} lost_verse_english - Companion recitation in English
 */

/**
 * @typedef {Object} HadithCitation
 * @property {string} source_reference - Canonical collection ref (e.g. "Sahih Muslim 1452a")
 * @property {string} [sunnah_url] - External sunnah.com verification link
 * @property {string} [in_book_reference] - In-book chapter/hadith identifier
 * @property {string} hadith_arabic - Complete Arabic narration
 * @property {string} hadith_english - Complete English narration
 * @property {string} highlight_arabic - Arabic key phrase to highlight
 * @property {string} highlight_english - English key phrase to highlight
 */

/**
 * @typedef {Object} CategoryMeta
 * @property {string} id - Category slug ('all' | 'legal' | 'textual' | 'surahs' | 'abrogation_contrast')
 * @property {string} label - Human-readable category title
 * @property {number} count - Total passages matching category
 */

export const RAW_LOST_VERSES = [
  {
    id: 'suckling-verses',
    rank: 1,
    category: 'legal',
    category_label: 'Legal & Ritual Injunctions',
    title: 'The Suckling Verses (Fosterage Injunctions)',
    companion: {
      name: 'Aisha',
      slug: 'aisha',
      title: 'Mother of the Believers'
    },
    lost_verse_arabic: 'عَشْرُ رَضَعَاتٍ مَعْلُومَاتٍ يُحَرِّمْنَ ... خَمْسٌ مَعْلُومَاتٌ',
    lost_verse_english: 'Ten clear sucklings make the marriage unlawful ... then five clear sucklings.',
    summary: 'Aisha explicitly stated that this verse was actively recited as part of the Quran at the moment the Prophet died. Because revelation and divine abrogation ceased upon his passing, its absence from the standardized text represents post-prophetic human loss.',
    hadiths: [
      {
        source_reference: 'Sahih Muslim 1452a',
        sunnah_url: 'https://sunnah.com/muslim:1452a',
        in_book_reference: 'Book 17, Hadith 30',
        hadith_arabic: 'عَنْ عَائِشَةَ، أَنَّهَا قَالَتْ كَانَ فِيمَا أُنْزِلَ مِنَ الْقُرْآنِ عَشْرُ رَضَعَاتٍ مَعْلُومَاتٍ يُحَرِّمْنَ ثُمَّ نُسِخْنَ بِخَمْسٍ مَعْلُومَاتٍ فَتُوُفِّيَ رَسُولُ اللَّهِ صلى الله عليه وسلم وَهُنَّ فِيمَا يُقْرَأُ مِنَ الْقُرْآنِ‏.‏',
        hadith_english: 'Aisha reported that it had been revealed in the Holy Qur\'an that ten clear sucklings make the marriage unlawful, then it was abrogated (and substituted) by five sucklings, and Allah\'s Messenger (ﷺ) died and they were still among what was recited of the Qur\'an.',
        highlight_english: 'and Allah\'s Messenger (ﷺ) died and they were still among what was recited of the Qur\'an.',
        highlight_arabic: 'فَتُوُفِّيَ رَسُولُ اللَّهِ صلى الله عليه وسلم وَهُنَّ فِيمَا يُقْرَأُ مِنَ الْقُرْآنِ'
      },
      {
        source_reference: 'Sahih Muslim 1452b',
        sunnah_url: 'https://sunnah.com/muslim:1452b',
        in_book_reference: 'Book 17, Hadith 31',
        hadith_arabic: 'عَنْ عَمْرَةَ، أَنَّهَا سَمِعَتْ عَائِشَةَ، تَقُولُ - وَهْىَ تَذْكُرُ الَّذِي يُحَرِّمُ مِنَ الرَّضَاعَةِ - قَالَتْ عَمْرَةُ فَقَالَتْ عَائِشَةُ نَزَلَ فِي الْقُرْآنِ عَشْرُ رَضَعَاتٍ مَعْلُومَاتٍ ثُمَّ نَزَلَ أَيْضًا خَمْسٌ مَعْلُومَاتٌ‏.‏',
        hadith_english: 'Amra reported that she heard Aisha discussing fosterage which makes marriage unlawful; Aisha said: "There was revealed in the Holy Qur\'an ten clear sucklings, and then there was also revealed five clear sucklings."',
        highlight_english: 'There was revealed in the Holy Qur\'an ten clear sucklings, and then there was also revealed five clear sucklings.',
        highlight_arabic: 'نَزَلَ فِي الْقُرْآنِ عَشْرُ رَضَعَاتٍ مَعْلُومَاتٍ ثُمَّ نَزَلَ أَيْضًا خَمْسٌ مَعْلُومَاتٌ'
      }
    ],
    video_verse_id: 'aisha_0'
  },
  {
    id: 'afternoon-prayer',
    rank: 2,
    category: 'legal',
    category_label: 'Legal & Ritual Injunctions',
    title: 'The Afternoon Prayer (Surah 2:238)',
    companion: {
      name: 'Aisha',
      slug: 'aisha',
      title: 'Mother of the Believers'
    },
    surviving_verse_ref: 'Surah 2:238',
    surviving_arabic: 'حَـٰفِظُوا۟ عَلَى ٱلصَّلَوَٰتِ وَٱلصَّلَوٰةِ ٱلْوُسْطَىٰ وَقُومُوا۟ لِلَّهِ قَـٰنِتِينَ',
    surviving_english: 'Guard the prayers and the middle prayer, and stand up truly obedient to Allah.',
    lost_verse_arabic: 'حَافِظُوا عَلَى الصَّلَوَاتِ وَالصَّلاَةِ الْوُسْطَى وَصَلاَةِ الْعَصْرِ وَقُومُوا لِلَّهِ قَانِتِينَ',
    lost_verse_english: 'Guard the prayers and the middle prayer and the afternoon prayer, and stand up truly obedient to Allah.',
    summary: 'Aisha ordered her personal scribe to record her Mushaf with the explicit phrase "and the afternoon prayer" in Surah 2:238, swearing she heard it directly from the Prophet. This specific phrase is omitted in the modern Uthmanic canon.',
    hadiths: [
      {
        source_reference: 'Sahih Muslim 629',
        sunnah_url: 'https://sunnah.com/muslim:629',
        in_book_reference: 'Book 5, Hadith 261',
        hadith_arabic: 'عَنْ أَبِي يُونُسَ، مَوْلَى عَائِشَةَ أَنَّهُ قَالَ أَمَرَتْنِي عَائِشَةُ أَنْ أَكْتُبَ لَهَا مُصْحَفًا وَقَالَتْ إِذَا بَلَغْتَ هَذِهِ الآيَةَ فَآذِنِّي { حَافِظُوا عَلَى الصَّلَوَاتِ وَالصَّلاَةِ الْوُسْطَى} فَلَمَّا بَلَغْتُهَا آذَنْتُهَا فَأَمْلَتْ عَلَىَّ حَافِظُوا عَلَى الصَّلَوَاتِ وَالصَّلاَةِ الْوُسْطَى وَصَلاَةِ الْعَصْرِ وَقُومُوا لِلَّهِ قَانِتِينَ قَالَتْ عَائِشَةُ سَمِعْتُهَا مِنْ رَسُولِ اللَّهِ صلى الله عليه وسلم‏.‏',
        hadith_english: 'Abu Yunus, the freed slave of Aisha, reported: Aisha ordered me to transcribe a copy of the Qur\'an for her and said: "When you reach this verse: \'Guard the prayers and the middle prayer\' (2:238), inform me." When I reached it, I informed her and she dictated to me: "Guard the prayers and the middle prayer and the afternoon prayer, and stand up truly obedient to Allah." Aisha said: "I heard it from the Messenger of Allah (ﷺ)."',
        highlight_english: 'Guard the prayers and the middle prayer and the afternoon prayer, and stand up truly obedient to Allah.',
        highlight_arabic: 'حَافِظُوا عَلَى الصَّلَوَاتِ وَالصَّلاَةِ الْوُسْطَى وَصَلاَةِ الْعَصْرِ'
      }
    ],
    video_verse_id: 'aisha_0'
  },
  {
    id: 'surah-layl-variant',
    rank: 3,
    category: 'textual',
    category_label: 'Textual Transmission & Omissions',
    title: 'Surah Al-Layl (92:3) Textual Divergence',
    companion: {
      name: 'Abu Darda & Abdullah bin Masud',
      slug: 'abdullah-bin-masud',
      title: 'Senior Master Reciters'
    },
    surviving_verse_ref: 'Surah 92:3',
    surviving_arabic: 'وَمَا خَلَقَ ٱلذَّكَرَ وَٱلْأُنثَىٰ',
    surviving_english: 'And by Him Who created the male and the female',
    lost_verse_arabic: 'وَالذَّكَرِ وَالأُنْثَى',
    lost_verse_english: 'And by the male and the female',
    summary: 'Abu Darda and Abdullah bin Masud—two of the primary reciters recognized by the Prophet—both recited Surah 92:3 without the words "wa ma khalaqa". Abu Darda swore by Allah that he heard it directly from Muhammad and adamantly refused to adopt the standardized Syrian committee reading.',
    hadiths: [
      {
        source_reference: 'Sahih al-Bukhari 4944',
        sunnah_url: 'https://sunnah.com/bukhari:4944',
        in_book_reference: 'Book 65, Hadith 466',
        hadith_arabic: 'عَنْ عَلْقَمَةَ، قَالَ دَخَلْتُ فِي نَفَرٍ مِنْ أَصْحَابِ عَبْدِ اللَّهِ الشَّأْمَ، فَسَمِعَ بِنَا أَبُو الدَّرْدَاءِ، فَأَتَانَا فَقَالَ أَفِيكُمْ مَنْ يَقْرَأُ فَقُلْنَا نَعَمْ‏.‏ قَالَ فَأَيُّكُمْ أَقْرَأُ فَأَشَارُوا إِلَىَّ، فَقَالَ اقْرَأْ، فَقَرَأْتُ {وَاللَّيْلِ إِذَا يَغْشَى وَالنَّهَارِ إِذَا تَجَلَّى وَالذَّكَرِ وَالأُنْثَى} قَالَ أَنْتَ سَمِعْتَهُ مِنْ صَاحِبِكَ قُلْتُ نَعَمْ‏.‏ قَالَ وَأَنَا سَمِعْتُهُ مِنْ رَسُولِ اللَّهِ صلى الله عليه وسلم وَهَؤُلاَءِ يَأْبَوْنَ عَلَيْنَا‏.‏',
        hadith_english: 'Narrated Alqama: I entered Syria with a group of the companions of Abdullah (bin Mas\'ud). Abu al-Darda heard of us and came, asking: "Is there anyone among you who recites according to the recitation of Abdullah?" They pointed at me. Abu al-Darda said: "Recite." So I recited: "By the night when it covers, and the day when it shines, and by the male and the female." Abu al-Darda asked: "Did you hear your companion recite it so?" I replied: "Yes." He said: "And I heard the Messenger of Allah (ﷺ) reciting it likewise, but these people insist upon us reciting: \'And by Him Who created the male and the female\'!"',
        highlight_english: 'By the night when it covers, and the day when it shines, and by the male and the female.',
        highlight_arabic: 'وَاللَّيْلِ إِذَا يَغْشَى وَالنَّهَارِ إِذَا تَجَلَّى وَالذَّكَرِ وَالأُنْثَى'
      },
      {
        source_reference: 'Sahih Muslim 824a',
        sunnah_url: 'https://sunnah.com/muslim:824a',
        in_book_reference: 'Book 6, Hadith 341',
        hadith_arabic: 'عَنْ عَلْقَمَةَ، قَالَ قَدِمْنَا الشَّامَ فَأَتَانَا أَبُو الدَّرْدَاءِ... قَالَ وَأَنَا وَاللَّهِ هَكَذَا سَمِعْتُ رَسُولَ اللَّهِ صلى الله عليه وسلم يَقْرَؤُهَا وَلَكِنْ هَؤُلاَءِ يُرِيدُونَ أَنْ أَقْرَأَ {وَمَا خَلَقَ} فَلاَ أُتَابِعُهُمْ‏.‏',
        hadith_english: 'Alqama reported: We went to Syria and Abu al-Darda came to us... Upon hearing the recitation without "wa ma khalaqa", Abu al-Darda said: "By Allah, I heard the Messenger of Allah (ﷺ) reciting in this way, but they desire us to recite: \'And by Him Who created\', but by Allah, I do not yield to their desire."',
        highlight_english: 'By Allah, I heard the Messenger of Allah (ﷺ) reciting in this way, but they desire us to recite: (and by Him Who created), but I do not yield to their desire.',
        highlight_arabic: 'وَاللَّهِ هَكَذَا سَمِعْتُ رَسُولَ اللَّهِ صلى الله عليه وسلم يَقْرَؤُهَا وَلَكِنْ هَؤُلاَءِ يُرِيدُونَ أَنْ أَقْرَأَ {وَمَا خَلَقَ} فَلاَ أُتَابِعُهُمْ'
      }
    ],
    video_verse_id: 'ibnmasud_0'
  },
  {
    id: 'ibn-abbas-18-79',
    rank: 4,
    category: 'textual',
    category_label: 'Textual Transmission & Omissions',
    title: 'Surah 18:79–80 Textual Divergences ("Serviceable Ship" & "Disbelieving Boy")',
    companion: {
      name: 'Abdullah bin Abbas',
      slug: 'abdullah-bin-abbas',
      title: 'Interpreter of the Quran'
    },
    comparisons: [
      {
        surviving_verse_ref: 'Surah 18:79',
        surviving_arabic: 'وَكَانَ وَرَآءَهُم مَّلِكٌ يَأْخُذُ كُلَّ سَفِينَةٍ غَصْبًا',
        surviving_english: '...for there was after them a king who seized every ship by force.',
        lost_verse_arabic: 'وَكَانَ أَمَامَهُمْ مَلِكٌ يَأْخُذُ كُلَّ سَفِينَةٍ صَالِحَةٍ غَصْبًا',
        lost_verse_english: '...for there was in front of them a king who seized every [sound/serviceable] ship by force.'
      },
      {
        surviving_verse_ref: 'Surah 18:80',
        surviving_arabic: 'وَأَمَّا ٱلْغُلَـٰمُ فَكَانَ أَبَوَاهُ مُؤْمِنَيْنِ',
        surviving_english: 'And as for the boy, his parents were believers...',
        lost_verse_arabic: 'وَأَمَّا الْغُلَامُ فَكَانَ كَافِرًا',
        lost_verse_english: 'And as for the boy, he was a disbeliever [and his parents were believers]...'
      }
    ],
    summary: 'Ibn Abbas recited two distinct textual differences in this narrative: in Surah 18:79, reading "in front of them" instead of "after them" and specifying every "sound/serviceable" ship; and in Surah 18:80, reading "and as for the boy, he was a disbeliever" (wa-ammā al-ghulāmu fa-kāna kāfirā).',
    hadiths: [
      {
        source_reference: 'Sahih al-Bukhari 4727',
        sunnah_url: 'https://sunnah.com/bukhari:4727',
        in_book_reference: 'Book 65, Hadith 249',
        hadith_arabic: 'وَكَانَ ابْنُ عَبَّاسٍ يَقْرَأُ: {وَكَانَ أَمَامَهُمْ مَلِكٌ يَأْخُذُ كُلَّ سَفِينَةٍ صَالِحَةٍ غَصْبًا} {وَأَمَّا الْغُلاَمُ فَكَانَ كَافِرًا}‏.‏',
        hadith_english: 'Ibn Abbas used to recite: "And in front of them there was a king who used to seize every (serviceable) boat by force" (18:79)... "and as for the boy, he was a disbeliever" (18:80).',
        highlight_english: 'seize every (serviceable) boat by force ... and as for the boy, he was a disbeliever',
        highlight_arabic: 'يَأْخُذُ كُلَّ سَفِينَةٍ صَالِحَةٍ غَصْبًا ... وَأَمَّا الْغُلاَمُ فَكَانَ كَافِرًا'
      }
    ],
    video_verse_id: 'variantcodices_0'
  },
  {
    id: 'ibn-abbas-26-214',
    rank: 5,
    category: 'textual',
    category_label: 'Textual Transmission & Omissions',
    title: 'Surah 26:214 Omitted Clause ("And Your Sincere Group")',
    companion: {
      name: 'Abdullah bin Abbas',
      slug: 'abdullah-bin-abbas',
      title: 'Interpreter of the Quran'
    },
    surviving_verse_ref: 'Surah 26:214',
    surviving_arabic: 'وَأَنذِرْ عَشِيرَتَكَ ٱلْأَقْرَبِينَ',
    surviving_english: 'And warn your nearest kindred.',
    lost_verse_arabic: 'وَأَنذِرْ عَشِيرَتَكَ الأَقْرَبِينَ وَرَهْطَكَ مِنْهُمُ الْمُخْلَصِينَ',
    lost_verse_english: 'And warn your nearest kindred [and your sincere/chosen group among them].',
    summary: 'Ibn Abbas reported that Surah 26:214 was originally revealed with the explicit qualifying clause "and your sincere/chosen group among them" (wa-rahṭaka minhumu al-mukhlaṣīn), which prompted the Prophet to summon his clan at Mount Safa. This clause is omitted from the modern Uthmanic text.',
    hadiths: [
      {
        source_reference: 'Sahih Muslim 208a',
        sunnah_url: 'https://sunnah.com/muslim:208a',
        in_book_reference: 'Book 1, Hadith 418',
        hadith_arabic: 'عَنِ ابْنِ عَبَّاسٍ، قَالَ لَمَّا نَزَلَتْ هَذِهِ الآيَةُ: {وَأَنْذِرْ عَشِيرَتَكَ الأَقْرَبِينَ} وَرَهْطَكَ مِنْهُمُ الْمُخْلَصِينَ‏ خَرَجَ رَسُولُ اللَّهِ صلى الله عليه وسلم حَتَّى صَعِدَ الصَّفَا...‏',
        hadith_english: 'Ibn Abbas reported: When this verse was revealed: "And warn your nearest kindred" (26:214), it was revealed with the addition: "and your chosen group among them," Allah\'s Messenger (ﷺ) went out and climbed As-Safa...',
        highlight_english: 'and your chosen group among them',
        highlight_arabic: 'وَرَهْطَكَ مِنْهُمُ الْمُخْلَصِينَ'
      }
    ],
    video_verse_id: 'variantcodices_0'
  },
  {
    id: 'stoning-verse',
    rank: 6,
    category: 'legal',
    category_label: 'Legal & Ritual Injunctions',
    title: 'The Verse of Stoning (Ayat al-Rajm)',
    companion: {
      name: 'Umar bin Al-Khattab',
      slug: 'umar-bin-al-khattab',
      title: 'Second Caliph'
    },
    lost_verse_arabic: 'الشَّيْخُ وَالشَّيْخَةُ إِذَا زَنَيَا فَارْجُمُوهُمَا الْبَتَّةَ نَكَالًا مِنَ اللَّهِ وَاللَّهُ عَزِيزٌ حَكِيمٌ',
    lost_verse_english: 'When the mature man and mature woman commit adultery, stone them both without hesitation as an exemplary punishment from Allah, and Allah is Mighty, Wise.',
    summary: 'Caliph Umar testified from the Prophet\'s pulpit that the verse establishing capital punishment by stoning was revealed in the Book of Allah. Although the legal penalty is retained in Islamic jurisprudence, the scriptural verse was omitted from the Mushaf because Umar feared public accusations of altering the text.',
    hadiths: [
      {
        source_reference: 'Sahih al-Bukhari 6829',
        sunnah_url: 'https://sunnah.com/bukhari:6829',
        in_book_reference: 'Book 86, Hadith 55',
        hadith_arabic: 'عَنِ ابْنِ عَبَّاسٍ، قَالَ قَالَ عُمَرُ: لَقَدْ خَشِيتُ أَنْ يَطُولَ بِالنَّاسِ زَمَانٌ حَتَّى يَقُولَ قَائِلٌ لاَ نَجِدُ الرَّجْمَ فِي كِتَابِ اللَّهِ فَيَضِلُّوا بِتَرْكِ فَرِيضَةٍ أَنْزَلَهَا اللَّهُ، أَلاَ وَإِنَّ الرَّجْمَ حَقٌّ عَلَى مَنْ زَنَى، وَقَدْ أَحْصَنَ... أَلَا وَقَدْ رَجَمَ رَسُولُ اللَّهِ صلى الله عليه وسلم وَرَجَمْنَا بَعْدَهُ‏.‏',
        hadith_english: 'Narrated Ibn Abbas: Umar said: "I am afraid that after a long time has passed, people may say, \'We do not find the verse of Rajam (stoning) in the Holy Book,\' and consequently they may go astray by leaving an obligation that Allah has revealed. Lo! I confirm that the penalty of Rajam is a right laid down in the Book of Allah against whoever commits adultery if married... Allah\'s Messenger (ﷺ) carried out the penalty of Rajam, and so did we after him."',
        highlight_english: 'We do not find the verse of Rajam (stoning) in the Holy Book',
        highlight_arabic: 'لاَ نَجِدُ الرَّجْمَ فِي كِتَابِ اللَّهِ فَيَضِلُّوا بِتَرْكِ فَرِيضَةٍ أَنْزَلَهَا اللَّهُ'
      },
      {
        source_reference: 'Sahih Muslim 1691a',
        sunnah_url: 'https://sunnah.com/muslim:1691a',
        in_book_reference: 'Book 29, Hadith 21',
        hadith_arabic: 'عَنِ ابْنِ عَبَّاسٍ، يَقُولُ قَالَ عُمَرُ بْنُ الْخَطَّابِ وَهُوَ جَالِسٌ عَلَى مِنْبَرِ رَسُولِ اللَّهِ صلى الله عليه وسلم: إِنَّ اللَّهَ قَدْ بَعَثَ مُحَمَّدًا صلى الله عليه وسلم بِالْحَقِّ وَأَنْزَلَ عَلَيْهِ الْكِتَابَ فَكَانَ مِمَّا أُنْزِلَ عَلَيْهِ آيَةُ الرَّجْمِ قَرَأْنَاهَا وَوَعَيْنَاهَا وَعَقَلْنَاهَا فَرَجَمَ رَسُولُ اللَّهِ صلى الله عليه وسلم وَرَجَمْنَا بَعْدَهُ‏.‏',
        hadith_english: 'Ibn Abbas reported that Umar bin al-Khattab sat on the pulpit of Allah\'s Messenger (ﷺ) and said: "Verily Allah sent Muhammad (ﷺ) with truth and He sent down the Book upon him, and the verse of stoning was included in what was sent down to him. We recited it, retained it in our memory and understood it."',
        highlight_english: 'and the verse of stoning was included in what was sent down to him. We recited it, retained it in our memory and understood it.',
        highlight_arabic: 'فَكَانَ مِمَّا أُنْزِلَ عَلَيْهِ آيَةُ الرَّجْمِ قَرَأْنَاهَا وَوَعَيْنَاهَا وَعَقَلْنَاهَا'
      },
      {
        source_reference: 'Sahih Muslim 1698',
        sunnah_url: 'https://sunnah.com/muslim:1698',
        in_book_reference: 'Book 29, Hadith 35',
        hadith_arabic: 'فَقَالَ رَسُولُ اللَّهِ صلى الله عليه وسلم: وَالَّذِي نَفْسِي بِيَدِهِ لأَقْضِيَنَّ بَيْنَكُمَا بِكِتَابِ اللَّهِ... وَاغْدُ يَا أُنَيْسُ إِلَى امْرَأَةِ هَذَا فَإِنِ اعْتَرَفَتْ فَارْجُمْهَا‏.‏ قَالَ فَغَدَا عَلَيْهَا فَاعْتَرَفَتْ فَأَمَرَ بِهَا رَسُولُ اللَّهِ صلى الله عليه وسلم فَرُجِمَتْ‏.‏',
        hadith_english: 'Allah\'s Messenger (ﷺ) said: "By Him in Whose Hand is my life, I will judge between you according to the Book of Allah... O Unais, go to this woman, and if she confesses, stone her." She confessed and Allah\'s Messenger (ﷺ) ordered her to be stoned.',
        highlight_english: 'I will judge between you according to the Book of Allah... and if she confesses, stone her.',
        highlight_arabic: 'لأَقْضِيَنَّ بَيْنَكُمَا بِكِتَابِ اللَّهِ... فَإِنِ اعْتَرَفَتْ فَارْجُمْهَا'
      }
    ],
    video_verse_id: 'aisha_0'
  },
  {
    id: 'two-lost-surahs',
    rank: 7,
    category: 'surahs',
    category_label: 'Entire Surahs & Passages',
    title: 'Two Entire Forgotten Surahs & The Valley of Gold',
    companion: {
      name: 'Abu Musa al-Ashari & Ubayy bin Kab',
      slug: 'abu-musa-al-ashari',
      title: 'Senior Reciters'
    },
    lost_verse_arabic: 'لَوْ كَانَ لاِبْنِ آدَمَ وَادِيَانِ مِنْ مَالٍ لاَبْتَغَى وَادِيًا ثَالِثًا وَلاَ يَمْلأُ جَوْفَ ابْنِ آدَمَ إِلاَّ التُّرَابُ ... يَا أَيُّهَا الَّذِينَ آمَنُوا لِمَ تَقُولُونَ مَا لاَ تَفْعَلُونَ فَتُكْتَبُ شَهَادَةً فِي أَعْنَاقِكُمْ فَتُسْأَلُونَ عَنْهَا يَوْمَ الْقِيَامَةِ',
    lost_verse_english: 'If the son of Adam had two valleys of wealth, he would desire a third, and nothing fills the belly of the son of Adam except dust ... O you who believe, why do you say that which you do not practice? It shall be recorded as a testimony on your necks and you will be questioned regarding it on the Day of Resurrection.',
    summary: 'Abu Musa al-Ash\'ari assembled 300 master reciters of Basra and acknowledged that they used to recite two complete, substantial chapters (one comparable in length and severity to Surah 9, and another resembling the Musabbihat) which were entirely forgotten by the community except for single fragmentary verses.',
    hadiths: [
      {
        source_reference: 'Sahih Muslim 1050',
        sunnah_url: 'https://sunnah.com/muslim:1050',
        in_book_reference: 'Book 12, Hadith 156',
        hadith_arabic: 'عَنْ أَبِي حَرْبِ بْنِ أَبِي الأَسْوَدِ عَنْ أَبِيهِ، قَالَ بَعَثَ أَبُو مُوسَى الأَشْعَرِيُّ إِلَى قُرَّاءِ أَهْلِ الْبَصْرَةِ فَدَخَلَ عَلَيْهِ ثَلاَثُمِائَةِ رَجُلٍ قَدْ قَرَءُوا الْقُرْآنَ... وَإِنَّا كُنَّا نَقْرَأُ سُورَةً كُنَّا نُشَبِّهُهَا فِي الطُّولِ وَالشِّدَّةِ بِبَرَاءَةَ فَأُنْسِيتُهَا غَيْرَ أَنِّي قَدْ حَفِظْتُ مِنْهَا: {لَوْ كَانَ لاِبْنِ آدَمَ وَادِيَانِ مِنْ مَالٍ لاَبْتَغَى وَادِيًا ثَالِثًا وَلاَ يَمْلأُ جَوْفَ ابْنِ آدَمَ إِلاَّ التُّرَابُ} وَكُنَّا نَقْرَأُ سُورَةً كُنَّا نُشَبِّهُهَا بِإِحْدَى الْمُسَبِّحَاتِ فَأُنْسِيتُهَا غَيْرَ أَنِّي حَفِظْتُ مِنْهَا: {يَا أَيُّهَا الَّذِينَ آمَنُوا لِمَ تَقُولُونَ مَا لاَ تَفْعَلُونَ فَتُكْتَبُ شَهَادَةً فِي أَعْنَاقِكُمْ فَتُسْأَلُونَ عَنْهَا يَوْمَ الْقِيَامَةِ}‏.‏',
        hadith_english: 'Abu Musa al-Ash\'ari sent for the reciters of Basra (300 men who had memorized the Qur\'an)... He said: "We used to recite a surah which resembled in length and severity to Surah Bara\'at (Surah 9), but I have forgotten it except this which I remember: \'If the son of Adam had two valleys of wealth, he would seek a third, and nothing fills his belly but dust.\' And we used to recite a surah which resembled one of the Musabbihat, but I have forgotten it except this: \'O you who believe, why do you say that which you do not practice? It will be recorded on your necks and you will be questioned on the Day of Resurrection.\'"',
        highlight_english: 'We used to recite a surah which resembled in length and severity to Surah Bara\'at, but I have forgotten it... And we used to recite a surah which resembled one of the Musabbihat, but I have forgotten it',
        highlight_arabic: 'كُنَّا نَقْرَأُ سُورَةً كُنَّا نُشَبِّهُهَا فِي الطُّولِ وَالشِّدَّةِ بِبَرَاءَةَ فَأُنْسِيتُهَا... وَكُنَّا نَقْرَأُ سُورَةً كُنَّا نُشَبِّهُهَا بِإِحْدَى الْمُسَبِّحَاتِ فَأُنْسِيتُهَا'
      },
      {
        source_reference: 'Sahih al-Bukhari 6438',
        sunnah_url: 'https://sunnah.com/bukhari:6438',
        in_book_reference: 'Book 81, Hadith 28',
        hadith_arabic: 'عَنْ أَنَسٍ، عَنْ أُبَىٍّ، قَالَ: كُنَّا نَرَى هَذَا مِنَ الْقُرْآنِ حَتَّى نَزَلَتْ {أَلْهَاكُمُ التَّكَاثُرُ}‏.‏',
        hadith_english: 'Narrated Anas: Ubayy bin Ka\'b said: "We used to consider this (the valley of gold narration) as a saying from the Qur\'an until Surah At-Takathur (102:1) was revealed."',
        highlight_english: 'We used to consider this as a saying from the Qur\'an until Surah At-Takathur was revealed.',
        highlight_arabic: 'كُنَّا نَرَى هَذَا مِنَ الْقُرْآنِ حَتَّى نَزَلَتْ {أَلْهَاكُمُ التَّكَاثُرُ}'
      }
    ],
    video_verse_id: 'ubayy_0'
  },
  {
    id: 'bir-mauna-martyrs',
    rank: 8,
    category: 'abrogation_contrast',
    category_label: 'Abrogation Benchmark',
    title: 'The Bir Ma\'una Recitation: An Explicit Benchmark of Abrogation',
    companion: {
      name: 'Anas bin Malik',
      slug: 'anas-bin-malik',
      title: 'Companion of the Prophet'
    },
    is_abrogation_benchmark: true,
    lost_verse_arabic: 'بَلِّغُوا قَوْمَنَا أَنْ قَدْ لَقِينَا رَبَّنَا فَرَضِيَ عَنَّا وَأَرْضَانَا',
    lost_verse_english: 'Inform our people that we have met our Lord, and He is pleased with us, and has made us pleased.',
    abrogation_note: {
      title: 'Critical Scholarly Contrast: Explicit Cancellation vs. Unabrogated Lost Verses',
      english: 'Notice the decisive contrast: In this narration, Anas bin Malik explicitly uses the term "nusikha" (حَتَّى نُسِخَ بَعْدُ - "until it was later cancelled/abrogated"). This proves that when a verse was genuinely abrogated during Muhammad\'s lifetime, the Sahaba explicitly recorded and identified its abrogation. In stark contrast, NONE of the other missing passages (#1–#7 and #9) contain any statement of abrogation—companions like Aisha, Abu Darda, Umar, and Ubayy swore they remained divine revelation until Muhammad\'s death.',
      arabic: 'مقارنة منهجية حاسمة: صرّح الصحابي أنس بن مالك بوضوح بوقوع النسخ فقال: «قُرْآنًا قَرَأْنَاهُ حَتَّى نُسِخَ بَعْدُ». هذا يثبت أن الآيات التي نُسخت بالفعل وثّق الصحابة نسخها صراحة؛ بينما كافة النصوص المفقودة السابقة لم يرد فيها أي ذكر للنسخ، بل أثبت الصحابة تلاوتها وتطبيقها حتى وفاة النبي.'
    },
    summary: 'This recitation provides an indispensable benchmark of what genuine abrogation looks like: Anas bin Malik explicitly states that it was recited "until it was later cancelled/abrogated" (حَتَّى نُسِخَ بَعْدُ). The complete absence of any abrogation statement in all other lost passages proves they were omitted through human transmission loss, not divine cancellation.',
    hadiths: [
      {
        source_reference: 'Sahih al-Bukhari 4095',
        sunnah_url: 'https://sunnah.com/bukhari:4095',
        in_book_reference: 'Book 64, Hadith 139',
        hadith_arabic: 'عَنْ أَنَسِ بْنِ مَالِكٍ، قَالَ دَعَا النَّبِيُّ صلى الله عليه وسلم عَلَى الَّذِينَ قَتَلُوا أَصْحَابَهُ بِبِئْرِ مَعُونَةَ ثَلاَثِينَ صَبَاحًا... قَالَ أَنَسٌ: فَأَنْزَلَ اللَّهُ تَعَالَى لِنَبِيِّهِ صلى الله عليه وسلم فِي الَّذِينَ قُتِلُوا أَصْحَابِ بِئْرِ مَعُونَةَ قُرْآنًا قَرَأْنَاهُ حَتَّى نُسِخَ بَعْدُ: {بَلِّغُوا قَوْمَنَا فَقَدْ لَقِينَا رَبَّنَا فَرَضِيَ عَنَّا وَرَضِينَا عَنْهُ}‏.‏',
        hadith_english: 'Narrated Anas bin Malik: The Prophet (ﷺ) invoked curse for thirty mornings upon those who killed his companions at Bir Ma\'una... Anas said: "Allah revealed a Qur\'anic Verse regarding those killed at Bir Ma\'una which we recited until it was later cancelled: \'Inform our people that we have met our Lord, and He is pleased with us, and we are pleased with Him.\'"',
        highlight_english: 'Allah revealed a Qur\'anic Verse regarding those killed at Bir Ma\'una which we recited until it was later cancelled',
        highlight_arabic: 'أَنْزَلَ اللَّهُ تَعَالَى لِنَبِيِّهِ... قُرْآنًا قَرَأْنَاهُ حَتَّى نُسِخَ بَعْدُ'
      },
      {
        source_reference: 'Sahih al-Bukhari 2801',
        sunnah_url: 'https://sunnah.com/bukhari:2801',
        in_book_reference: 'Book 56, Hadith 18',
        hadith_arabic: 'عَنْ أَنَسٍ، قَالَ: فَكُنَّا نَقْرَأُ: {أَنْ بَلِّغُوا قَوْمَنَا أَنْ قَدْ لَقِينَا رَبَّنَا فَرَضِيَ عَنَّا وَأَرْضَانَا} ثُمَّ نُسِخَ بَعْدُ‏.‏',
        hadith_english: 'Narrated Anas: Gabriel informed the Prophet (ﷺ) that the martyrs had met their Lord... "So we used to recite: \'Inform our people that we have met our Lord, He is pleased with us and has made us pleased.\' Later on, this Qur\'anic verse was cancelled."',
        highlight_english: 'So we used to recite: \'Inform our people that we have met our Lord, He is pleased with us and has made us pleased.\' Later on, this Qur\'anic verse was cancelled.',
        highlight_arabic: 'فَكُنَّا نَقْرَأُ: {أَنْ بَلِّغُوا قَوْمَنَا أَنْ قَدْ لَقِينَا رَبَّنَا فَرَضِيَ عَنَّا وَأَرْضَانَا} ثُمَّ نُسِخَ بَعْدُ'
      },
      {
        source_reference: 'Sahih Muslim 677a',
        sunnah_url: 'https://sunnah.com/muslim:677a',
        in_book_reference: 'Book 5, Hadith 378',
        hadith_arabic: 'عَنْ أَنَسِ بْنِ مَالِكٍ، قَالَ: أَنْزَلَ اللَّهُ عَزَّ وَجَلَّ فِي الَّذِينَ قُتِلُوا بِبِئْرِ مَعُونَةَ قُرْآنًا قَرَأْنَاهُ حَتَّى نُسِخَ بَعْدُ: {أَنْ بَلِّغُوا قَوْمَنَا أَنْ قَدْ لَقِينَا رَبَّنَا فَرَضِيَ عَنَّا وَرَضِينَا عَنْهُ}‏.‏',
        hadith_english: 'Anas bin Malik reported: "Allah, the Exalted and Great, revealed regarding those killed at Bir Ma\'una a Qur\'anic verse that we recited until it was abrogated later on: \'Convey to our people the tidings that we have met our Lord, and He was pleased with us and we were pleased with Him.\'"',
        highlight_english: 'revealed regarding those killed at Bir Ma\'una a Qur\'anic verse that we recited until it was abrogated later on',
        highlight_arabic: 'أَنْزَلَ اللَّهُ عَزَّ وَجَلَّ... قُرْآنًا قَرَأْنَاهُ حَتَّى نُسِخَ بَعْدُ'
      }
    ],
    video_verse_id: 'variantcodices_0'
  }
];

/**
 * Loads the 8 ranked lost verses with attached apologetics video shorts from SQLite.
 *
 * @param {string} base Base URL for routing links
 * @returns {Promise<Array<Object>>} Enriched lost verses dataset
 */
export async function loadRankedLostVerses(base = '') {
  const videoIds = Array.from(new Set(RAW_LOST_VERSES.map(v => v.video_verse_id).filter(Boolean)));
  let videosByVerseId = {};

  if (videoIds.length > 0) {
    const idSet = videoIds.map(id => `'${id}'`).join(',');
    try {
      const rawVideos = query(`
        SELECT DISTINCT sm.*, spv.verse_id
        FROM short_per_verse spv
        JOIN shorts_metadata sm ON spv.video_id = sm.video_id
        WHERE spv.verse_id IN (${idSet})
      `);

      const seenPerVerse = new Set();
      rawVideos.forEach(v => {
        const key = `${v.verse_id}:${v.video_id}`;
        if (seenPerVerse.has(key)) return;
        seenPerVerse.add(key);
        if (!videosByVerseId[v.verse_id]) videosByVerseId[v.verse_id] = [];
        videosByVerseId[v.verse_id].push(v);
      });
    } catch (e) {
      console.warn('[LostVersesLoader] Could not fetch short videos from SQLite:', e.message);
    }
  }

  return RAW_LOST_VERSES.map(entry => {
    const attachedVideos = entry.video_verse_id && videosByVerseId[entry.video_verse_id]
      ? enrichVideosWithVerses(videosByVerseId[entry.video_verse_id], base)
      : [];

    return {
      ...entry,
      videos: attachedVideos
    };
  });
}

/**
 * Dynamically computes category tabs with exact passage counts from RAW_LOST_VERSES (Single Source of Truth).
 * @returns {Array<CategoryMeta>} Category tabs with computed counts
 */
export function getLostVersesCategories() {
  const counts = {
    all: RAW_LOST_VERSES.length,
    legal: RAW_LOST_VERSES.filter(v => v.category === 'legal').length,
    textual: RAW_LOST_VERSES.filter(v => v.category === 'textual').length,
    surahs: RAW_LOST_VERSES.filter(v => v.category === 'surahs').length,
    abrogation_contrast: RAW_LOST_VERSES.filter(v => v.category === 'abrogation_contrast').length,
  };

  return [
    { id: 'all', label: 'All Passages', count: counts.all },
    { id: 'legal', label: 'Legal & Ritual Injunctions', count: counts.legal },
    { id: 'textual', label: 'Textual Transmission & Omissions', count: counts.textual },
    { id: 'surahs', label: 'Entire Surahs & Passages', count: counts.surahs },
    { id: 'abrogation_contrast', label: 'Abrogation Benchmark', count: counts.abrogation_contrast }
  ];
}

export const LOST_VERSES_CATEGORIES = getLostVersesCategories();

