const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../data/last_used.json");

function getLastUsed(userId, command) {
  if (!fs.existsSync(filePath)) return null;
  const data = JSON.parse(fs.readFileSync(filePath));
  return data[userId]?.[command] || null;
}

function setLastUsed(userId, command) {
  let data = {};
  if (fs.existsSync(filePath)) {
    data = JSON.parse(fs.readFileSync(filePath));
  }
  if (!data[userId]) data[userId] = {};
  data[userId][command] = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

module.exports = { getLastUsed, setLastUsed };
