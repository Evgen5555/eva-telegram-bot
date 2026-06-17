const { Telegraf } = require('telegraf');
const { session } = require('telegraf/session');
const { TELEGRAM_BOT_TOKEN, OPENROUTER_MODEL, ADMIN_CHAT_ID } = require('./config');
const { initSettings, getActiveModel } = require('./settings');
const { defaultSession } = require('./session');
const { registerHandlers } = require('./handlers');
const { registerAdminHandlers } = require('./admin');

function createBot() {
  initSettings();

  const bot = new Telegraf(TELEGRAM_BOT_TOKEN);

  bot.use(session({ defaultSession }));
  registerAdminHandlers(bot, ADMIN_CHAT_ID);
  registerHandlers(bot, ADMIN_CHAT_ID);

  return bot;
}

async function launchBot() {
  const bot = createBot();
  await bot.launch();
  console.log('Eva bot запущен');
  console.log(`Модель OpenRouter: ${getActiveModel()} (env: ${OPENROUTER_MODEL})`);
  if (ADMIN_CHAT_ID) console.log(`Уведомления админу: ${ADMIN_CHAT_ID}`);

  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
}

module.exports = { launchBot };
