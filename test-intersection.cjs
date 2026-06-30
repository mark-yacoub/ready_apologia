const verseTopicsStr = "divinity_of_the_holy_spirit,trinity";
const verseTopics = verseTopicsStr.split(',');
const activeTopics = ["divinity_of_christ", "divinity_of_the_holy_spirit", "prophecies", "trinity"];
const intersection = activeTopics.filter(t => verseTopics.includes(t));
console.log(intersection);
