const fs = require("fs");
const path = require("path");

const usersFile = path.join(__dirname, "../data/users.json"); // users.json path

// Get user points
function getPoints(userId) {
  const users = JSON.parse(fs.readFileSync(usersFile));
  if (!users[userId]) {
    users[userId] = { id: userId, points: 0, redeemed: [] };
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
  }
  return users[userId].points;
}

// Add points to user
function addPoints(userId, amount) {
  const users = JSON.parse(fs.readFileSync(usersFile));
  if (!users[userId]) {
    users[userId] = { id: userId, points: 0, redeemed: [] };
  }
  users[userId].points += amount;
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
  return users[userId].points;
}

// Determine role based on points
function getRole(points) {
  if (points >= 3000) return "💎 Diamond";
  if (points >= 2000) return "🏆 Platinum";
  if (points >= 1500) return "🥇 Gold";
  if (points >= 1000) return "🥈 Silver";
  if (points >= 500) return "🥉 Bronze";
  return "👤 New Member";
}

module.exports = { getPoints, addPoints, getRole };
