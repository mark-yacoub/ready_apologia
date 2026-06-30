const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const html = fs.readFileSync('dist/client/bible/gn/1/index.html', 'utf8');
const dom = new JSDOM(html);
const document = dom.window.document;

// Simulate active topics
const activeTopics = ["divinity_of_the_holy_spirit", "trinity", "prophecies"];

const container = document.querySelector('.verses-container');
const topicsMeta = container ? JSON.parse(container.getAttribute('data-topics-meta') || '{}') : {};
console.log("Topics meta count:", Object.keys(topicsMeta).length);

document.querySelectorAll('.verse-row[data-topics]').forEach(el => {
  const verseTopicsStr = el.getAttribute('data-topics');
  if (!verseTopicsStr) return;
  const verseTopics = verseTopicsStr.split(',');
  const intersection = activeTopics.filter(t => verseTopics.includes(t));
  console.log(`Verse ${el.id} has topics: ${verseTopicsStr}, intersection: ${intersection}`);
});
