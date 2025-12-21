require("dotenv").config()
const TelegramBot = require("node-telegram-bot-api")

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true })

require("./commands/myid")(bot)

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    `🙏 Welcome to BibleNest\n\n/help ကိုနှိပ်ပြီး command များကြည့်နိုင်ပါသည်`
  )
})

module.exports = bot
