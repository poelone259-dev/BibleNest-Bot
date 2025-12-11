const roles = [
  { name: "Bronze", minPoints: 500, reward: 500 },
  { name: "Silver", minPoints: 1000, reward: 1000 },
  { name: "Gold", minPoints: 1500, reward: 1500 },
  { name: "Platinum", minPoints: 2000, reward: 2000 },
  { name: "Diamond", minPoints: 3000, reward: 3000 },
];

function getRole(points) {
  if (points >= 5000) return "💎 Diamond";
  if (points >= 3000) return "🔷 Platinum";
  if (points >= 2000) return "🥇 Gold";
  if (points >= 1000) return "🥈 Silver";
  if (points >= 500)  return "🥉 Bronze";
  return "👤 New Member";
}

module.exports = { roles, getRole };
