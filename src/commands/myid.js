const prisma = require("../database/prisma")

module.exports = (bot) => {
  bot.onText(/\/myid/, async (msg) => {
    const chatId = msg.chat.id
    const telegramId = BigInt(msg.from.id)
    const username = msg.from.username || "No username"

    await prisma.user.upsert({
      where: { telegramId },
      update: {},
      create: {
        telegramId,
        username
      }
    })

    bot.sendMessage(
      chatId,
      `🆔 Your Information\n\nID: ${telegramId}\nUsername: @${username}`
    )
  })
}
