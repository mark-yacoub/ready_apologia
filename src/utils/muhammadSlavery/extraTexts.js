/**
 * Texts that are not in slavery.json but that the article quotes (approved in ia_r1_response.md:
 * decision (i) kindness/freeing texts, (ii) Muslim 1755, plus the ITEM_MUTATIONS appends).
 * HAND-MAINTAINED data (no generator). Key: "<collection>:<Sunnah.com number>". Each is listed as a
 * new source in data_proposals.md. `text` / `arabic` are the fawazahmed0 mirror of Sunnah.com, `grades`
 * the mirror's grades (the UI shows the grade beside every non-Ṣaḥīḥayn citation).
 *
 * Guards: scripts/verify_muhammad_slavery_quotes.mjs checks `text` (English, word-for-word) and `arabic`
 * (without tashkīl) against the mirror; the build fails if an entry is never rendered.
 */

export const EXTRA_TEXTS = {
  "muslim:1755": {
    "text": "It has been narrated on the authority of Salama (b. al-Akwa') who said:We fought against the Fazara, and Abu Bakr was the commander over us. He had been appointed by the Messenger of Allah (ﷺ). When we were only at an hour's distance from the water of the enemy, Abu Bakr ordered us to attack. We made a halt during the last part of the night to rest and then we attacked from all sides and reached their watering-place where a battle was fought. Some of the enemies were killed and some were taken prisoners. I saw a group of persons that consisted of women and children. I was afraid lest they should reach the mountain before me, so I shot an arrow between them and the mountain. When they saw the arrow, they stopped. So I brought them, driving them along. Among them was a woman from Banu Fazara. She was wearing a leather coat. With her was her daughter who was one of the prettiest girls in Arabia. I drove them along until I brought them to Abu Bakr who bestowed that girl upon me as a prize. So we arrived in Medina. I had not yet disrobed her when the Messenger of Allah (ﷺ) met me in the street and said: Give me that girl, O Salama. I said: Messenger of Allah, she has fascinated me. I had not yet disrobed her. When on the next day the Messenger of Allah (ﷺ) again met me in the street, he said: O Salama, give me that girl, may God bless your father. I said: She is for you, Messenger of Allah! By Allah. I have not yet disrobed her. The Messenger of Allah (ﷺ) sent her to the people of Mecca, and surrendered her as ransom for a number of Muslims who had been kept as prisoners at Mecca",
    "arabic": "حَدَّثَنَا زُهَيْرُ بْنُ حَرْبٍ، حَدَّثَنَا عُمَرُ بْنُ يُونُسَ، حَدَّثَنَا عِكْرِمَةُ بْنُ عَمَّارٍ، حَدَّثَنِي إِيَاسُ بْنُ سَلَمَةَ، حَدَّثَنِي أَبِي قَالَ، غَزَوْنَا فَزَارَةَ وَعَلَيْنَا أَبُو بَكْرٍ أَمَّرَهُ رَسُولُ اللَّهِ صلى الله عليه وسلم عَلَيْنَا فَلَمَّا كَانَ بَيْنَنَا وَبَيْنَ الْمَاءِ سَاعَةٌ أَمَرَنَا أَبُو بَكْرٍ فَعَرَّسْنَا ثُمَّ شَنَّ الْغَارَةَ فَوَرَدَ الْمَاءَ فَقَتَلَ مَنْ قَتَلَ عَلَيْهِ وَسَبَى وَأَنْظُرُ إِلَى عُنُقٍ مِنَ النَّاسِ فِيهِمُ الذَّرَارِيُّ فَخَشِيتُ أَنْ يَسْبِقُونِي إِلَى الْجَبَلِ فَرَمَيْتُ بِسَهْمٍ بَيْنَهُمْ وَبَيْنَ الْجَبَلِ فَلَمَّا رَأَوُا السَّهْمَ وَقَفُوا فَجِئْتُ بِهِمْ أَسُوقُهُمْ وَفِيهِمُ امْرَأَةٌ مِنْ بَنِي فَزَارَةَ عَلَيْهَا قِشْعٌ مِنْ أَدَمٍ - قَالَ الْقِشْعُ النِّطَعُ - مَعَهَا ابْنَةٌ لَهَا مِنْ أَحْسَنِ الْعَرَبِ فَسُقْتُهُمْ حَتَّى أَتَيْتُ بِهِمْ أَبَا بَكْرٍ فَنَفَّلَنِي أَبُو بَكْرٍ ابْنَتَهَا فَقَدِمْنَا الْمَدِينَةَ وَمَا كَشَفْتُ لَهَا ثَوْبًا فَلَقِيَنِي رَسُولُ اللَّهِ صلى الله عليه وسلم فِي السُّوقِ فَقَالَ ‏\"‏ يَا سَلَمَةُ هَبْ لِي الْمَرْأَةَ ‏\"‏ ‏.‏ فَقُلْتُ يَا رَسُولَ اللَّهِ وَاللَّهِ لَقَدْ أَعْجَبَتْنِي وَمَا كَشَفْتُ لَهَا ثَوْبًا ثُمَّ لَقِيَنِي رَسُولُ اللَّهِ صلى الله عليه وسلم مِنَ الْغَدِ فِي السُّوقِ فَقَالَ لِي ‏\"‏ يَا سَلَمَةُ هَبْ لِي الْمَرْأَةَ لِلَّهِ أَبُوكَ ‏\"‏ ‏.‏ فَقُلْتُ هِيَ لَكَ يَا رَسُولَ اللَّهِ فَوَاللَّهِ مَا كَشَفْتُ لَهَا ثَوْبًا فَبَعَثَ بِهَا رَسُولُ اللَّهِ صلى الله عليه وسلم إِلَى أَهْلِ مَكَّةَ فَفَدَى بِهَا نَاسًا مِنَ الْمُسْلِمِينَ كَانُوا أُسِرُوا بِمَكَّةَ ‏.‏",
    "grades": [],
    "why": "captives-exchanged: anchor (FC A 1.3; IA R1 decision ii)"
  },
  "bukhari:2141": {
    "text": "Narrated Jabir bin `Abdullah:A man decided that a slave of his would be manumitted after his death and later on he was in need of money, so the Prophet (ﷺ) took the slave and said, \"Who will buy this slave from me?\" Nu'aim bin `Abdullah bought him for such and such price and the Prophet (ﷺ) gave him the slave",
    "arabic": "حَدَّثَنَا بِشْرُ بْنُ مُحَمَّدٍ، أَخْبَرَنَا عَبْدُ اللَّهِ، أَخْبَرَنَا الْحُسَيْنُ الْمُكْتِبُ، عَنْ عَطَاءِ بْنِ أَبِي رَبَاحٍ، عَنْ جَابِرِ بْنِ عَبْدِ اللَّهِ ـ رضى الله عنهما ـ أَنَّ رَجُلاً أَعْتَقَ غُلاَمًا لَهُ عَنْ دُبُرٍ، فَاحْتَاجَ فَأَخَذَهُ النَّبِيُّ صلى الله عليه وسلم فَقَالَ ‏ \"‏ مَنْ يَشْتَرِيهِ مِنِّي ‏\"‏ فَاشْتَرَاهُ نُعَيْمُ بْنُ عَبْدِ اللَّهِ بِكَذَا وَكَذَا، فَدَفَعَهُ إِلَيْهِ‏.‏",
    "grades": [],
    "why": "mudabbar-sold: \"Who will buy this slave from me?\" (FC A 1.1)"
  },
  "bukhari:2102": {
    "text": "Narrated Anas bin Malik:Abu Taiba cupped Allah's Messenger (ﷺ) so he ordered that he be paid one Sa of dates and ordered his masters to reduce his tax (as he was a slave and had to pay a tax to them)",
    "arabic": "حَدَّثَنَا عَبْدُ اللَّهِ بْنُ يُوسُفَ، أَخْبَرَنَا مَالِكٌ، عَنْ حُمَيْدٍ، عَنْ أَنَسِ بْنِ مَالِكٍ ـ رضى الله عنه ـ قَالَ حَجَمَ أَبُو طَيْبَةَ رَسُولَ اللَّهِ صلى الله عليه وسلم فَأَمَرَ لَهُ بِصَاعٍ مِنْ تَمْرٍ، وَأَمَرَ أَهْلَهُ أَنْ يُخَفِّفُوا مِنْ خَرَاجِهِ‏.‏",
    "grades": [],
    "why": "abu-tayba: names Abū Ṭayba (FC A 1.4)"
  },
  "bukhari:2541": {
    "text": "Narrated Ibn `Aun:I wrote a letter to Nafi` and Nafi` wrote in reply to my letter that the Prophet (ﷺ) had suddenly attacked Bani Mustaliq without warning while they were heedless and their cattle were being watered at the places of water. Their fighting men were killed and their women and children were taken as captives; the Prophet (ﷺ) got Juwairiya on that day. Nafi` said that Ibn `Umar had told him the above narration and that Ibn `Umar was in that army",
    "arabic": "حَدَّثَنَا عَلِيُّ بْنُ الْحَسَنِ، أَخْبَرَنَا عَبْدُ اللَّهِ، أَخْبَرَنَا ابْنُ عَوْنٍ، قَالَ كَتَبْتُ إِلَى نَافِعٍ فَكَتَبَ إِلَىَّ أَنَّ النَّبِيَّ صلى الله عليه وسلم أَغَارَ عَلَى بَنِي الْمُصْطَلِقِ وَهُمْ غَارُّونَ وَأَنْعَامُهُمْ تُسْقَى عَلَى الْمَاءِ، فَقَتَلَ مُقَاتِلَتَهُمْ، وَسَبَى ذَرَارِيَّهُمْ، وَأَصَابَ يَوْمَئِذٍ جُوَيْرِيَةَ‏.‏ حَدَّثَنِي بِهِ عَبْدُ اللَّهِ بْنُ عُمَرَ، وَكَانَ فِي ذَلِكَ الْجَيْشِ‏.‏",
    "grades": [],
    "why": "juwayriyya: Bukhārī parallel of Muslim 1730a (FC A 2.2)"
  },
  "muslim:1768a": {
    "text": "It has been narrated on the authority of Abu Sa'id al-Khudri who said:The people of Quraiza surrendered accepting the decision of Sa'd b. Mu'adh about them. Accordingly, the Messenger of Allah (ﷺ) sent for Sa'd who came to him riding a donkey. When he approached the mosque, the Messenger of Allah (ﷺ) said to the Ansar: Stand up to receive your chieftain. Then he said (to Sa'd): These people have surrendered accepting your decision. He (Sa'd) said: You will kill their fighters and capture their women and children. (Hearing this), the Prophet (ﷺ) said: You have adjudged by the command of God. The narrator is reported to have said: Perhaps he said: You have adjudged by the decision of a king. Ibn Muthanna (in his version of the tradition) has not mentioned the alternative words",
    "arabic": "وَحَدَّثَنَا أَبُو بَكْرِ بْنُ أَبِي شَيْبَةَ، وَمُحَمَّدُ بْنُ الْمُثَنَّى، وَابْنُ، بَشَّارٍ - وَأَلْفَاظُهُمْ مُتَقَارِبَةٌ - قَالَ أَبُو بَكْرٍ حَدَّثَنَا غُنْدَرٌ، عَنْ شُعْبَةَ، وَقَالَ الآخَرَانِ، حَدَّثَنَا مُحَمَّدُ بْنُ جَعْفَرٍ، حَدَّثَنَا شُعْبَةُ، - عَنْ سَعْدِ بْنِ إِبْرَاهِيمَ، قَالَ سَمِعْتُ أَبَا أُمَامَةَ بْنَ سَهْلِ بْنِ حُنَيْفٍ، قَالَ سَمِعْتُ أَبَا سَعِيدٍ، الْخُدْرِيَّ قَالَ نَزَلَ أَهْلُ قُرَيْظَةَ عَلَى حُكْمِ سَعْدِ بْنِ مُعَاذٍ فَأَرْسَلَ رَسُولُ اللَّهِ صلى الله عليه وسلم إِلَى سَعْدٍ فَأَتَاهُ عَلَى حِمَارٍ فَلَمَّا دَنَا قَرِيبًا مِنَ الْمَسْجِدِ قَالَ رَسُولُ اللَّهِ صلى الله عليه وسلم لِلأَنْصَارِ ‏\"‏ قُومُوا إِلَى سَيِّدِكُمْ - أَوْ خَيْرِكُمْ ‏\"‏ ‏.‏ ثُمَّ قَالَ ‏\"‏ إِنَّ هَؤُلاَءِ نَزَلُوا عَلَى حُكْمِكَ ‏\"‏ ‏.‏ قَالَ تَقْتُلُ مُقَاتِلَتَهُمْ وَتَسْبِي ذُرِّيَّتَهُمْ ‏.‏ قَالَ فَقَالَ النَّبِيُّ صلى الله عليه وسلم ‏\"‏ قَضَيْتَ بِحُكْمِ اللَّهِ - وَرُبَّمَا قَالَ - قَضَيْتَ بِحُكْمِ الْمَلِكِ ‏\"‏ ‏.‏ وَلَمْ يَذْكُرِ ابْنُ الْمُثَنَّى وَرُبَّمَا قَالَ ‏\"‏ قَضَيْتَ بِحُكْمِ الْمَلِكِ ‏\"‏ ‏.‏",
    "grades": [],
    "why": "banu-qurayza: Muslim wording (FC Q §5)"
  },
  "bukhari:2229": {
    "text": "Narrated Abu Sa`id Al-Khudri:that while he was sitting with Allah's Messenger (ﷺ) he said, \"O Allah's Messenger (ﷺ)! We get female captives as our share of booty, and we are interested in their prices, what is your opinion about coitus interruptus?\" The Prophet (ﷺ) said, \"Do you really do that? It is better for you not to do it. No soul that which Allah has destined to exist, but will surely come into existence",
    "arabic": "حَدَّثَنَا أَبُو الْيَمَانِ، أَخْبَرَنَا شُعَيْبٌ، عَنِ الزُّهْرِيِّ، قَالَ أَخْبَرَنِي ابْنُ مُحَيْرِيزٍ، أَنَّ أَبَا سَعِيدٍ الْخُدْرِيَّ ـ رضى الله عنه ـ أَخْبَرَهُ أَنَّهُ، بَيْنَمَا هُوَ جَالِسٌ عِنْدَ النَّبِيِّ صلى الله عليه وسلم قَالَ يَا رَسُولَ اللَّهِ إِنَّا نُصِيبُ سَبْيًا، فَنُحِبُّ الأَثْمَانَ، فَكَيْفَ تَرَى فِي الْعَزْلِ فَقَالَ ‏ \"‏ أَوَإِنَّكُمْ تَفْعَلُونَ ذَلِكَ لاَ عَلَيْكُمْ أَنْ لاَ تَفْعَلُوا ذَلِكُمْ، فَإِنَّهَا لَيْسَتْ نَسَمَةٌ كَتَبَ اللَّهُ أَنْ تَخْرُجَ إِلاَّ هِيَ خَارِجَةٌ ‏\"‏‏.‏",
    "grades": [],
    "why": "azl-captives: \"we are interested in their prices\" (cuj_ia Addendum §7)"
  },
  "bukhari:4211": {
    "text": "Narrated Anas bin Malik:We arrived at Khaibar, and when Allah helped His Apostle to open the fort, the beauty of Safiya bint Huyai bin Akhtaq whose husband had been killed while she was a bride, was mentioned to Allah's Apostle. The Prophet (ﷺ) selected her for himself, and set out with her, and when we reached a place called Sidd-as-Sahba,' Safiya became clean from her menses. Then Allah's Messenger (ﷺ) married her. Hais (i.e. an 'Arabian dish) was prepared on a small leather mat. Then the Prophet (ﷺ) said to me, \"Invite the people around you.\" So that was the marriage banquet of the Prophet (ﷺ) and Safiya. Then we proceeded towards Medina, and I saw the Prophet, making for her a kind of cushion with his cloak behind him (on his camel). He then sat beside his camel and put his knee for Safiya to put her foot on, in order to ride (on the camel)",
    "arabic": "حَدَّثَنَا عَبْدُ الْغَفَّارِ بْنُ دَاوُدَ، حَدَّثَنَا يَعْقُوبُ بْنُ عَبْدِ الرَّحْمَنِ، ح وَحَدَّثَنِي أَحْمَدُ، حَدَّثَنَا ابْنُ وَهْبٍ، قَالَ أَخْبَرَنِي يَعْقُوبُ بْنُ عَبْدِ الرَّحْمَنِ الزُّهْرِيُّ، عَنْ عَمْرٍو، مَوْلَى الْمُطَّلِبِ عَنْ أَنَسِ بْنِ مَالِكٍ ـ رضى الله عنه ـ قَالَ قَدِمْنَا خَيْبَرَ، فَلَمَّا فَتَحَ اللَّهُ عَلَيْهِ الْحِصْنَ ذُكِرَ لَهُ جَمَالُ صَفِيَّةَ بِنْتِ حُيَىِّ بْنِ أَخْطَبَ، وَقَدْ قُتِلَ زَوْجُهَا وَكَانَتْ عَرُوسًا، فَاصْطَفَاهَا النَّبِيُّ صلى الله عليه وسلم لِنَفْسِهِ، فَخَرَجَ بِهَا، حَتَّى بَلَغْنَا سَدَّ الصَّهْبَاءِ حَلَّتْ، فَبَنَى بِهَا رَسُولُ اللَّهِ صلى الله عليه وسلم، ثُمَّ صَنَعَ حَيْسًا فِي نِطَعٍ صَغِيرٍ، ثُمَّ قَالَ لِي ‏ \"‏ آذِنْ مَنْ حَوْلَكَ ‏\"‏‏.‏ فَكَانَتْ تِلْكَ وَلِيمَتَهُ عَلَى صَفِيَّةَ، ثُمَّ خَرَجْنَا إِلَى الْمَدِينَةِ، فَرَأَيْتُ النَّبِيَّ صلى الله عليه وسلم يُحَوِّي لَهَا وَرَاءَهُ بِعَبَاءَةٍ، ثُمَّ يَجْلِسُ عِنْدَ بَعِيرِهِ، فَيَضَعُ رُكْبَتَهُ، وَتَضَعُ صَفِيَّةُ رِجْلَهَا عَلَى رُكْبَتِهِ حَتَّى تَرْكَبَ‏.‏",
    "grades": [],
    "why": "safiyya / answers: Ṣafiyya's husband killed (FC Q §3.9)"
  },
  "bukhari:30": {
    "text": "Narrated Al-Ma'rur: At Ar-Rabadha I met Abu Dhar who was wearing a cloak, and his slave, too, was wearing a similar one. I asked about the reason for it. He replied, \"I abused a person by calling his mother with bad names.\" The Prophet said to me, 'O Abu Dhar! Did you abuse him by calling his mother with bad names You still have some characteristics of ignorance. Your slaves are your brothers and Allah has put them under your command. So whoever has a brother under his command should feed him of what he eats and dress him of what he wears. Do not ask them (slaves) to do things beyond their capacity (power) and if you do so, then help them",
    "arabic": "حَدَّثَنَا سُلَيْمَانُ بْنُ حَرْبٍ، قَالَ حَدَّثَنَا شُعْبَةُ، عَنْ وَاصِلٍ الأَحْدَبِ، عَنِ الْمَعْرُورِ، قَالَ لَقِيتُ أَبَا ذَرٍّ بِالرَّبَذَةِ، وَعَلَيْهِ حُلَّةٌ، وَعَلَى غُلاَمِهِ حُلَّةٌ، فَسَأَلْتُهُ عَنْ ذَلِكَ، فَقَالَ إِنِّي سَابَبْتُ رَجُلاً، فَعَيَّرْتُهُ بِأُمِّهِ، فَقَالَ لِيَ النَّبِيُّ صلى الله عليه وسلم ‏ \"‏ يَا أَبَا ذَرٍّ أَعَيَّرْتَهُ بِأُمِّهِ إِنَّكَ امْرُؤٌ فِيكَ جَاهِلِيَّةٌ، إِخْوَانُكُمْ خَوَلُكُمْ، جَعَلَهُمُ اللَّهُ تَحْتَ أَيْدِيكُمْ، فَمَنْ كَانَ أَخُوهُ تَحْتَ يَدِهِ فَلْيُطْعِمْهُ مِمَّا يَأْكُلُ، وَلْيُلْبِسْهُ مِمَّا يَلْبَسُ، وَلاَ تُكَلِّفُوهُمْ مَا يَغْلِبُهُمْ، فَإِنْ كَلَّفْتُمُوهُمْ فَأَعِينُوهُمْ ‏\"‏‏.‏",
    "grades": [],
    "why": "answers: \"Your slaves are your brothers\" (FC Q §5)"
  },
  "bukhari:2517": {
    "text": "Narrated Abu Huraira:The Prophet (ﷺ) said, \"Whoever frees a Muslim slave, Allah will save all the parts of his body from the (Hell) Fire as he has freed the body-parts of the slave.\" Sa`id bin Marjana said that he narrated that Hadith to `Ali bin Al-Husain and he freed his slave for whom `Abdullah bin Ja`far had offered him ten thousand Dirhams or one-thousand Dinars",
    "arabic": "حَدَّثَنَا أَحْمَدُ بْنُ يُونُسَ، حَدَّثَنَا عَاصِمُ بْنُ مُحَمَّدٍ، قَالَ حَدَّثَنِي وَاقِدُ بْنُ مُحَمَّدٍ، قَالَ حَدَّثَنِي سَعِيدٌ ابْنُ مَرْجَانَةَ، صَاحِبُ عَلِيِّ بْنِ حُسَيْنٍ قَالَ لِي أَبُو هُرَيْرَةَ ـ رضى الله عنه ـ قَالَ النَّبِيُّ صلى الله عليه وسلم ‏ \"‏ أَيُّمَا رَجُلٍ أَعْتَقَ امْرَأً مُسْلِمًا اسْتَنْقَذَ اللَّهُ بِكُلِّ عُضْوٍ مِنْهُ عُضْوًا مِنْهُ مِنَ النَّارِ ‏\"‏‏.‏ قَالَ سَعِيدٌ ابْنُ مَرْجَانَةَ فَانْطَلَقْتُ إِلَى عَلِيِّ بْنِ حُسَيْنٍ فَعَمَدَ عَلِيُّ بْنُ حُسَيْنٍ ـ رضى الله عنهما ـ إِلَى عَبْدٍ لَهُ قَدْ أَعْطَاهُ بِهِ عَبْدُ اللَّهِ بْنُ جَعْفَرٍ عَشَرَةَ آلاَفِ دِرْهَمٍ ـ أَوْ أَلْفَ دِينَارٍ ـ فَأَعْتَقَهُ‏.‏",
    "grades": [],
    "why": "answers: reward for freeing (FC Q §5)"
  },
  "bukhari:3015": {
    "text": "Narrated Ibn `Umar:During some of the Ghazawat of Allah's Messenger (ﷺ) a woman was found killed, so Allah's Messenger (ﷺ) forbade the killing of women and children",
    "arabic": "حَدَّثَنَا إِسْحَاقُ بْنُ إِبْرَاهِيمَ، قَالَ قُلْتُ لأَبِي أُسَامَةَ حَدَّثَكُمْ عُبَيْدُ اللَّهِ، عَنْ نَافِعٍ، عَنِ ابْنِ عُمَرَ ـ رضى الله عنهما ـ قَالَ وُجِدَتِ امْرَأَةٌ مَقْتُولَةً فِي بَعْضِ مَغَازِي رَسُولِ اللَّهِ صلى الله عليه وسلم، فَنَهَى رَسُولُ اللَّهِ صلى الله عليه وسلم عَنْ قَتْلِ النِّسَاءِ وَالصِّبْيَانِ‏.‏",
    "grades": [],
    "why": "answers: killing of women and children forbidden (FC Q §5)"
  },
  "muslim:1657a": {
    "text": "Zadhan Abl Umar reported:I came to Ibn 'Umar as he had granted freedom to a stave. He (the narrator further) said: He took hold of a wood or something like it from the earth and said: It (freedom of a slave) has not the reward evert equal to it, but the fact that I heard Allah's Messenger (way peace be upon him) say: He who slaps his slave or beats him, the expiation for it is that he should set him free",
    "arabic": "حَدَّثَنِي أَبُو كَامِلٍ، فُضَيْلُ بْنُ حُسَيْنٍ الْجَحْدَرِيُّ حَدَّثَنَا أَبُو عَوَانَةَ، عَنْ فِرَاسٍ، عَنْ ذَكْوَانَ أَبِي صَالِحٍ، عَنْ زَاذَانَ أَبِي عُمَرَ، قَالَ أَتَيْتُ ابْنَ عُمَرَ وَقَدْ أَعْتَقَ مَمْلُوكًا - قَالَ - فَأَخَذَ مِنَ الأَرْضِ عُودًا أَوْ شَيْئًا فَقَالَ مَا فِيهِ مِنَ الأَجْرِ مَا يَسْوَى هَذَا إِلاَّ أَنِّي سَمِعْتُ رَسُولَ اللَّهِ صلى الله عليه وسلم يَقُولُ ‏ \"‏ مَنْ لَطَمَ مَمْلُوكَهُ أَوْ ضَرَبَهُ فَكَفَّارَتُهُ أَنْ يُعْتِقَهُ ‏\"‏",
    "grades": [],
    "why": "answers: slapping a slave, expiation is freeing (FC Q §5; muslim/27/45)"
  },
  "muslim:1662": {
    "text": "Abu Huraira reported Allah's Messenger (ﷺ) as saying:It is essential to feed the slave, clothe him (properly) and not burden him with work which is beyond his power",
    "arabic": "وَحَدَّثَنِي أَبُو الطَّاهِرِ، أَحْمَدُ بْنُ عَمْرِو بْنِ سَرْحٍ أَخْبَرَنَا ابْنُ وَهْبٍ، أَخْبَرَنَا عَمْرُو، بْنُ الْحَارِثِ أَنَّ بُكَيْرَ بْنَ الأَشَجِّ، حَدَّثَهُ عَنِ الْعَجْلاَنِ، مَوْلَى فَاطِمَةَ عَنْ أَبِي هُرَيْرَةَ، عَنْ رَسُولِ اللَّهِ صلى الله عليه وسلم أَنَّهُ قَالَ ‏ \"‏ لِلْمَمْلُوكِ طَعَامُهُ وَكِسْوَتُهُ وَلاَ يُكَلَّفُ مِنَ الْعَمَلِ إِلاَّ مَا يُطِيقُ ‏\"‏ ‏.‏",
    "grades": [],
    "why": "answers: feed and clothe the slave (FC Q §5; muslim/27/63)"
  },
  "muslim:1659a": {
    "text": "Abu Mas'ud al-Badri reported:I was beating my slave with a whip when I heard a voice behind me: Understand, Abu Masud; but I did not recognise the voice due to intense anger. He (Abu Mas'ud) reported: As he came near me (I found) that he was the Messenger of Allah (ﷺ) and he was saying: Bear in mind, Abu Mas'ud; bear in mind. Abu Mas'ud. He (Aba Maslad) said: threw the whip from my hand. Thereupon he (the Holy Prophet) said: Bear in mind, Abu Mas'ud; verily Allah has more dominance upon you than you have upon your slave. I (then) said: I would never beat my servant in future",
    "arabic": "حَدَّثَنَا أَبُو كَامِلٍ الْجَحْدَرِيُّ، حَدَّثَنَا عَبْدُ الْوَاحِدِ، - يَعْنِي ابْنَ زِيَادٍ - حَدَّثَنَا الأَعْمَشُ، عَنْ إِبْرَاهِيمَ التَّيْمِيِّ، عَنْ أَبِيهِ، قَالَ قَالَ أَبُو مَسْعُودٍ الْبَدْرِيُّ كُنْتُ أَضْرِبُ غُلاَمًا لِي بِالسَّوْطِ فَسَمِعْتُ صَوْتًا مِنْ خَلْفِي ‏\"‏ اعْلَمْ أَبَا مَسْعُودٍ ‏\"‏ ‏.‏ فَلَمْ أَفْهَمِ الصَّوْتَ مِنَ الْغَضَبِ - قَالَ - فَلَمَّا دَنَا مِنِّي إِذَا هُوَ رَسُولُ اللَّهِ صلى الله عليه وسلم فَإِذَا هُوَ يَقُولُ ‏\"‏ اعْلَمْ أَبَا مَسْعُودٍ اعْلَمْ أَبَا مَسْعُودٍ ‏\"‏ ‏.‏ قَالَ فَأَلْقَيْتُ السَّوْطَ مِنْ يَدِي فَقَالَ ‏\"‏ اعْلَمْ أَبَا مَسْعُودٍ أَنَّ اللَّهَ أَقْدَرُ عَلَيْكَ مِنْكَ عَلَى هَذَا الْغُلاَمِ ‏\"‏ ‏.‏ قَالَ فَقُلْتُ لاَ أَضْرِبُ مَمْلُوكًا بَعْدَهُ أَبَدًا ‏.‏",
    "grades": [],
    "why": "answers: \"Allah has more dominance upon you\" (FC Q §5; muslim/27/53)"
  },
  "abudawud:1690": {
    "text": "Maimunah, wife of the Probhet (ﷺ) said :I had a slave girl and I set her free. When the Prophet (ﷺ) entered upon me, I informed him (of this). He said : May Allah give reward for it; if you had given her to your maternal uncles, it would have increased your reward",
    "arabic": null,
    "grades": [
      "Al-Albani: Sahih",
      "Muhammad Muhyi Al-Din Abdul Hamid: Sahih",
      "Zubair Ali Zai: Sahih"
    ],
    "why": "maymuna / answers: \"May Allah give reward for it\" (FC Q §5)"
  },
  "abudawud:3931": {
    "text": "Narrated Aisha, Ummul Mu'minin: Juwayriyyah, daughter of al-Harith ibn al-Mustaliq, fell to the lot of Thabit ibn Qays ibn Shammas, or to her cousin. She entered into an agreement to purchase her freedom. She was a very beautiful woman, most attractive to the eye. Aisha said: She then came to the Messenger of Allah (ﷺ) asking him for the purchase of her freedom. When she was standing at the door, I looked at her with disapproval. I realised that the Messenger of Allah (ﷺ) would look at her in the same way that I had looked. She said: Messenger of Allah, I am Juwayriyyah, daughter of al-Harith, and something has happened to me, which is not hidden from you. I have fallen to the lot of Thabit ibn Qays ibn Shammas, and I have entered into an agreement to purchase of my freedom. I have come to you to seek assistance for the purchase of my freedom. The Messenger of Allah (ﷺ) said: Are you inclined to that which is better? She asked: What is that, Messenger of Allah? He replied: I shall pay the price of your freedom on your behalf, and I shall marry you. She said: I shall do this. She (Aisha) said: The people then heard that the Messenger of Allah (ﷺ) had married Juwayriyyah. They released the captives in their possession and set them free, and said: They are the relatives of the Messenger of Allah (ﷺ) by marriage. We did not see any woman greater than Juwayriyyah who brought blessings to her people. One hundred families of Banu al-Mustaliq were set free on account of her. Abu dawud said: This evidence shows that a Muslim ruler may marry a slave woman himself",
    "arabic": null,
    "grades": [
      "Al-Albani: Hasan",
      "Muhammad Muhyi Al-Din Abdul Hamid: Hasan",
      "Shuaib Al Arnaut: Hasan",
      "Zubair Ali Zai: Hasan"
    ],
    "why": "juwayriyya / answers: kitāba; 100 families freed (FC Q §5)"
  },
  "ibnmajah:2516": {
    "text": "It was narrated that Ibn`Abbas said:“Mention was made of the mother of Ibrahim in the presence of the Messenger of Allah (ﷺ), and he said: 'Her son set her free.'”",
    "arabic": null,
    "grades": [
      "Al-Albani: Daif",
      "Muhammad Fouad Abd al-Baqi: Daif",
      "Shuaib Al Arnaut: Very Daif",
      "Zubair Ali Zai: Daif"
    ],
    "why": "answers: Māriya, \"Her son set her free\" (graded ḍaʿīf) (FC Q §5)"
  },
  "nasai:3959": {
    "text": "It was narrated from Anas, that the Messenger of Allah had a female slave with whom he had intercourse, but 'Aishah and Hafsah would not leave him alone until he said that she was forbidden for him. Then Allah, the Mighty and Sublime, revealed:\"O Prophet! Why do you forbid (for yourself) that which Allah has allowed to you.' until the end of the Verse",
    "arabic": null,
    "grades": [
      "Abu Ghuddah: Sahih Isnaad",
      "Al-Albani: Sahih Isnaad",
      "Zubair Ali Zai: Isnaad Sahih"
    ],
    "why": "answers: female slave and 66:1 (FC Q §5)"
  },
  "bukhari:2379": {
    "text": "Narrated 'Abdullah (ra): I heard the Messenger of Allah (ﷺ) say, \"If somebody buys date-palms after they have been pollinated, the fruits will belong to the seller unless the buyer stipulates the contrary. If somebody buys a slave having some property, the property will belong to the seller unless the buyer stipulate that it should belong to him",
    "arabic": "أَخْبَرَنَا عَبْدُ اللَّهِ بْنُ يُوسُفَ، حَدَّثَنَا اللَّيْثُ، حَدَّثَنِي ابْنُ شِهَابٍ، عَنْ سَالِمِ بْنِ عَبْدِ اللَّهِ، عَنْ أَبِيهِ ـ رضى الله عنه ـ قَالَ سَمِعْتُ رَسُولَ اللَّهِ صلى الله عليه وسلم يَقُولُ ‏ \"‏ مَنِ ابْتَاعَ نَخْلاً بَعْدَ أَنْ تُؤَبَّرَ فَثَمَرَتُهَا لِلْبَائِعِ، إِلاَّ أَنْ يَشْتَرِطَ الْمُبْتَاعُ، وَمَنِ ابْتَاعَ عَبْدًا وَلَهُ مَالٌ فَمَالُهُ لِلَّذِي بَاعَهُ إِلاَّ أَنْ يَشْتَرِطَ الْمُبْتَاعُ ‏\"‏‏.‏ وَعَنْ مَالِكٍ عَنْ نَافِعٍ عَنِ ابْنِ عُمَرَ عَنْ عُمَرَ فِي الْعَبْدِ‏.‏",
    "grades": [],
    "why": "answers: a slave's property belongs to the seller (FC Q §5)"
  },
  "abudawud:2078": {
    "text": "Narrated Jabir ibn Abdullah: The Prophet (ﷺ) said: If any slave marries without the permission of his masters, he is a fornicator",
    "arabic": null,
    "grades": [
      "Al-Albani: Hasan",
      "Muhammad Muhyi Al-Din Abdul Hamid: Hasan",
      "Shuaib Al Arnaut: Hasan Sahih",
      "Zubair Ali Zai: Daif"
    ],
    "why": "answers: a slave who marries without permission (graded: Albani ḥasan, Zubair ʿAlī Zaʾī ḍaʿīf) (FC Q §5)"
  }
};
