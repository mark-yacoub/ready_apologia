export const companionDisplayNameMap = {
  "A'isha": "Aisha",
  "'A'isha bint Abi Bakr": "Aisha",
  "A'isha bint Abi Bakr": "Aisha",
  "Aisha bint Abi Bakr": "Aisha",
  "Aisha": "Aisha",
  "Abdullah bin Abbas": "Abdullah bin Abbas",
  "Ibn Abbas": "Abdullah bin Abbas",
  "Ibn 'Abbas": "Abdullah bin Abbas",
  "Abdullah bin Masud": "Abdullah bin Masud",
  "Abdullah b. Mas'ud": "Abdullah bin Masud",
  "Abu Musa al-Ash'ari": "Abu Musa al-Ash'ari",
  "Anas": "Anas bin Malik",
  "Anas bin Malik": "Anas bin Malik",
  "Ubayy bin Ka'b": "Ubayy bin Ka'b",
  "Ubayy b. Ka'b": "Ubayy bin Ka'b",
  "Umar bin Al-Khattab": "Umar_bin_Al-Khattab",
  "Abdullah bin Umar": "Abdullah bin Umar",
  "Abu Huraira": "Abu Huraira",
  "Al-Amash": "Al-Amash",
  "Al-A'mash": "Al-Amash",
  "Hisham bin Hakim": "Hisham bin Hakim",
  "Hisham bin Al-Hakim": "Hisham bin Hakim",
  "Ibn Shihab": "Ibn Shihab",
  "Jabir bin Abdullah": "Jabir_bin_Abdullah",
  "Nahik b. Sinan": "Nahik b. Sinan",
  "Sahl bin Sa'd": "Sahl bin Sa'd",
  "Sa'id b. Jubair": "Sa'id b. Jubair",
  "Urwa bin Az-Zubair": "Urwa bin Az-Zubair",
  "Zaid b. Arqam": "Zaid b. Arqam",
  "Unknown": "Unknown"
};

export const allUniqueCompanions = Array.from(new Set(Object.values(companionDisplayNameMap)));

export const normalizeCompanionFilename = (name) => {
  const mapping = {
    "A'isha": "Aisha",
    "'A'isha bint Abi Bakr": "Aisha",
    "A'isha bint Abi Bakr": "Aisha",
    "Aisha bint Abi Bakr": "Aisha",
    "Aisha": "Aisha",
    "Abdullah bin Abbas": "Abdullah_bin_Abbas",
    "Ibn Abbas": "Abdullah_bin_Abbas",
    "Ibn 'Abbas": "Abdullah_bin_Abbas",
    "Abdullah bin Masud": "Abdullah_bin_Masud",
    "Abdullah b. Mas'ud": "Abdullah_bin_Masud",
    "Abu Musa al-Ash'ari": "Abu_Musa_al-Ashari",
    "Anas": "Anas_bin_Malik",
    "Anas bin Malik": "Anas_bin_Malik",
    "Ubayy bin Ka'b": "Ubayy_bin_Kab",
    "Ubayy b. Ka'b": "Ubayy_bin_Kab",
    "Umar bin Al-Khattab": "Umar_bin_Al-Khattab",
    "Abdullah bin Umar": "Abdullah_bin_Umar",
    "Abu Huraira": "Abu_Huraira",
    "Al-Amash": "Al-Amash",
    "Al-A'mash": "Al-Amash",
    "Hisham bin Hakim": "Hisham_bin_Hakim",
    "Hisham bin Al-Hakim": "Hisham_bin_Hakim",
    "Ibn Shihab": "Ibn_Shihab",
    "Jabir bin Abdullah": "Jabir_bin_Abdullah",
    "Nahik b. Sinan": "Nahik_b._Sinan",
    "Sahl bin Sa'd": "Sahl_bin_Sad",
    "Sa'id b. Jubair": "Said_b._Jubair",
    "Urwa bin Az-Zubair": "Urwa_bin_Az-Zubair",
    "Zaid b. Arqam": "Zaid_bin_Arqam",
    "Unknown": "Unknown"
  };
  return mapping[name] || name.replace(/\s+/g, '_').replace(/[']/g, '');
};

export const STATIC_RECITATIONS = [
  { qari: 'nafi', qariName: 'Nafi\'', rawis: [{ id: 'qalun', name: 'Qalun' }, { id: 'warsh', name: 'Warsh' }] },
  { qari: 'ibn_kathir', qariName: 'Ibn Kathir', rawis: [{ id: 'bazzi', name: 'Al-Bazzi' }, { id: 'qunbul', name: 'Qunbul' }] },
  { qari: 'abu_amr', qariName: 'Abu \'Amr', rawis: [{ id: 'duri_abu_amr', name: 'Al-Duri' }, { id: 'susi', name: 'Al-Susi' }] },
  { qari: 'ibn_amir', qariName: 'Ibn \'Amir', rawis: [{ id: 'hisham', name: 'Hisham' }, { id: 'ibn_dhakwan', name: 'Ibn Dhakwan' }] },
  { qari: 'asim', qariName: 'Asim', rawis: [{ id: 'shubah', name: 'Shu\'bah' }, { id: 'hafs', name: 'Hafs' }] },
  { qari: 'hamzah', qariName: 'Hamzah', rawis: [{ id: 'khalaf_hamzah', name: 'Khalaf' }, { id: 'khallad', name: 'Khallad' }] },
  { qari: 'al-kisai', qariName: 'Al-Kisa\'i', rawis: [{ id: 'abu_al_harith', name: 'Abu al-Harith' }, { id: 'duri_kisai', name: 'Al-Duri' }] },
  { qari: 'abu_jafar', qariName: 'Abu Ja\'far', rawis: [{ id: 'isa', name: 'Isa bin Wardan' }, { id: 'ibn_jammaz', name: 'Ibn Jummaz' }] },
  { qari: 'yaqub', qariName: 'Ya\'qub', rawis: [{ id: 'ruways', name: 'Ruways' }, { id: 'rawh', name: 'Rawh' }] },
  { qari: 'khalaf', qariName: 'Khalaf al-Bazzar', rawis: [{ id: 'ishaq', name: 'Ishaq' }, { id: 'idris', name: 'Idris' }] }
];

export const companionProminence = ['Aisha', 'Ubayy bin Ka\'b', 'Abdullah bin Masud', 'Ali bin Abi Talib', 'Abdullah bin Abbas'];
