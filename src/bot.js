const { Telegraf } = require('telegraf');
const { session } = require('telegraf/session');
const { TELEGRAM_BOT_TOKEN, OPENROUTER_MODEL, ADMIN_CHAT_ID } = require('./config');
const { defaultSession } = require('./session');
const { registerHandlers } = require('./handlers');

function createBot() {
  const bot = new Telegraf(TELEGRAM_BOT_TOKEN);

  bot.use(session({ defaultSession }));
  registerHandlers(bot, ADMIN_CHAT_ID);

  return bot;
}

async function launchBot() {
  const bot = createBot();
  await bot.launch();
  console.log('Eva bot запущен');
  console.log(`Модель OpenRouter: ${OPENROUTER_MODEL}`);
  if (ADMIN_CHAT_ID) console.log(`Уведомления админу: ${ADMIN_CHAT_ID}`);

  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
}

module.exports = { launchBot };
