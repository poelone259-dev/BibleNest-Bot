const fs = require("fs");
const path = require("path");

const versesPath = path.join(__dirname, "../data/verses.json");
const devotionalsPath = path.join(__dirname, "../data/devotionals.json");

function getDailyVerse() {
  if (!fs.existsSync(versesPath)) return null;
  const verses = JSON.parse(fs.readFileSync(versesPath));
  return verses[Math.floor(Math.random() * verses.length)];
}

function getDailyDevotional() {
  if (!fs.existsSync(devotionalsPath)) return null;
  const devotionals = JSON.parse(fs.readFileSync(devotionalsPath));
  return devotionals[Math.floor(Math.random() * devotionals.length)];
}

module.exports = { getDailyVerse, getDailyDevotional };
