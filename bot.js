const { Telegraf } = require("telegraf");
const fs = require("fs");

// 🔥 ENV Variable မှ Bot Token ကို ယူသည်
const bot = new Telegraf(process.env.BOT_TOKEN);

// 🔥 Admin IDs (optional)
const ADMIN_IDS = process.env.ADMIN_IDS
  ? process.env.ADMIN_IDS.split(",").map(id => id.trim())
  : [];

// Existing data files
const users = require("./data/users.json");
const items = require("./data/items.json");


const POINT_REWARDS = [1,2,3,4,5,6,7,8,9,10,20,30,40,50];
const DAILY_LIMIT = {}; // To prevent 2 times per day for verse/devotional
const WORK_LIMIT = {};  // /work cooldown

const { getPoints } = require("./features/points");
const { getRole } = require("./features/roles");

const { getLastUsed, setLastUsed } = require("./features/lastUsed");
const { getDailyVerse, getDailyDevotional } = require("./features/verses");

// Function to save users
function saveUsers() {
  fs.writeFileSync("./data/users.json", JSON.stringify(users, null, 2));
}

// ===============================
// USER COMMANDS
// ===============================

// /start
bot.start((ctx) => {
  const id = ctx.from.id;

  if (!users[id]) {
    users[id] = {
      id: id,
      name: ctx.from.first_name,
      points: 0,
      redeemed: []
    };
    saveUsers();
  }

  ctx.reply("BibleNest မှ ကြိုဆိုပါ၏🙏\n/help ကိုနှိပ်ပြီး အသုံးပြုနည်းကြည့်ပါ။");
});

// /help (USER ONLY)
bot.command("help", (ctx) => {
  ctx.reply(
    "📌 BibleNest Commands\n" +
    "/work - Point များကိုစုရန်\n" +
    "/points - မိမိ Point စစ်မယ်\n" +
    "/items - လဲလှယ်နိုင်သော Items\n" +
    "/buy <item_name> - Itemလဲမယ်\n" +
    "/dailyverse - ယနေ့ကျမ်းချက်\n" +
    "/devotional - ယနေ့ Devotional\n" +
    "/role - ကိုယ်ရထားသော Role ကြည့်ရန်\n" +  
    "/rolerules - Role System Rules"
  );
});

// /work
bot.command("work", (ctx) => {
  const id = ctx.from.id;

  if (!users[id]) return ctx.reply("Please /start first!");

  const now = Date.now();
  const last = WORK_LIMIT[id] || 0;

  if (now - last < 3 * 60 * 60 * 1000) {
    return ctx.reply(
      "⏳ /work ကို 3 နာရီတစ်ကြိမ်သာ သုံးနိုင်သည်!\n" +
      "သတ်မှတ် Point ပြည့်ပါက /items များဖြင့် လဲလှယ်နိုင်ပါသည်။"
    );
  }

  WORK_LIMIT[id] = now;

  const reward = POINT_REWARDS[Math.floor(Math.random() * POINT_REWARDS.length)];
  users[id].points += reward;
  saveUsers();

  ctx.reply(`🎉 သင်ရရှိသော Point = ${reward}\nစုစုပေါင်း = ${users[id].points}`);
});

// /points
bot.command("points", (ctx) => {
  const id = ctx.from.id;
  if (!users[id]) return ctx.reply("Please /start first!");
  ctx.reply(`📌 သင့် Points = ${users[id].points}`);
});

// /items
bot.command("items", (ctx) => {
  ctx.reply("📦 လဲလှယ်နိုင်သော Items\n\nph_1000 = 1000 points\nph_3000 = 3000 points\nph_5000 = 5000 points");
});

// /buy <item>
bot.command("buy", (ctx) => {
  const id = ctx.from.id;
  if (!users[id]) return ctx.reply("Please /start first!");

  const text = ctx.message.text.split(" ");
  const item = text[1];

  if (!item || !items[item]) return ctx.reply("❌ Item မရှိပါ။ /items ကိုကြည့်ပါ။");

  const cost = items[item];

  if (users[id].points < cost) return ctx.reply("❌ Point မလုံလောက်ပါ!");

  users[id].points -= cost;
  users[id].redeemed.push(item);
  saveUsers();

  // Notify Admin
  config.ADMIN_IDS.forEach(adminId => {
    bot.telegram.sendMessage(
      adminId,
      `🔔 User Redeemed\nName: ${users[id].name}\nID: ${id}\nItem: ${item}`
    );
  });

  ctx.reply(`🎉 သင် ${item} လဲလှယ်ပြီးပါပြီ!\nAdmin မှ သင့်ထံ ဆက်သွယ်ပေးမည်`);
});

// /dailyverse
bot.command("dailyverse", (ctx) => {
  const userId = ctx.from.id.toString();
  const last = getLastUsed(userId, "dailyverse");
  const today = new Date().toISOString().slice(0, 10);

  if (last === today) {
    return ctx.reply("⚠️ ယနေ့အတွက် နေ့စဉ်ကျမ်းပိုဒ်ကို သင်ရရှိ ပြီးပါပြီ။ နောက်နေ့ မနက်မှာ ပြန်လည်ရယူလိုက်ပါ။ ");
  }

  const verse = getDailyVerse(); // random verse from verses.json
  if (!verse) return ctx.reply("No verse found.");

  ctx.reply(`📖 ${verse.book} ${verse.chapter}:${verse.verse}\n\n${verse.text}`);
  setLastUsed(userId, "dailyverse");
});

// /devotional
bot.command("devotional", (ctx) => {
  const userId = ctx.from.id.toString();
  const last = getLastUsed(userId, "devotional");
  const today = new Date().toISOString().slice(0, 10);

  if (last === today) {
    return ctx.reply("⚠️ You have already received today's Devotional.");
  }

  const devotional = getDailyDevotional(); // random devotional from devotionals.json
  if (!devotional) return ctx.reply("No devotional found.");

  ctx.reply(`📖 ${devotional.title}\n\n${devotional.text}`);
  setLastUsed(userId, "devotional");
});

// /role
bot.command("role", (ctx) => {
  const userId = ctx.from.id.toString();
  const points = getPoints(userId);   // users.json မှ points ရယူ
  const role = getRole(points);       // role သတ်မှတ်
  ctx.reply(`Your Role: ${role}\nYour Points: ${points}`);
});

// /rolerules
bot.command("rolerules", (ctx) => {
  ctx.reply(
    `Role Rules and Rewards:\n
💎 Diamond: 3000 points
🏆 Platinum: 2000 points
🥇 Gold: 1500 points
🥈 Silver: 1000 points
🥉 Bronze: 500 points
👤 New Member: 0 points`
  );
});

// ===============================
// ADMIN COMMANDS
// ===============================

function isAdmin(id) {
  return config.ADMIN_IDS.includes(id);
}

// /addpoints <user_id> <amount>
bot.command("addpoints", (ctx) => {
  if (!isAdmin(ctx.from.id)) return;

  const [, userId, amount] = ctx.message.text.split(" ");

  if (!users[userId]) return ctx.reply("User မတွေ့ပါ");
  users[userId].points += Number(amount);
  saveUsers();

  ctx.reply("DONE ✔️");
});

// /removepoints <user_id> <amount>
bot.command("removepoints", (ctx) => {
  if (!isAdmin(ctx.from.id)) return;

  const [, userId, amount] = ctx.message.text.split(" ");

  if (!users[userId]) return ctx.reply("User မတွေ့ပါ");
  users[userId].points -= Number(amount);
  if (users[userId].points < 0) users[userId].points = 0;

  saveUsers();
  ctx.reply("DONE ✔️");
});

// /userlist
bot.command("userlist", (ctx) => {
  if (!isAdmin(ctx.from.id)) return;

  const list = Object.values(users)
    .map(u => `${u.id} - ${u.name}`)
    .join("\n");

  ctx.reply("👥 Users:\n\n" + list);
});

// /redeemlist
bot.command("redeemlist", (ctx) => {
  if (!isAdmin(ctx.from.id)) return;

  let text = "🎁 Redeemed Items:\n\n";
  Object.values(users).forEach(u => {
    if (u.redeemed.length > 0)
      text += `${u.name}(${u.id}) = ${u.redeemed.join(", ")}\n`;
  });

  ctx.reply(text);
});

// start bot
bot.launch();
