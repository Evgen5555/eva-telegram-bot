require('dotenv').config();

const fs = require('fs');
const path = require('path');

const EVA_PROMPT_PATH = path.join(__dirname, '..', 'eva_prompt.txt');

function requireEnv(name, placeholder) {
  const value = process.env[name];
  if (!value || value === placeholder) return null;
  return value;
}

function validateEnv() {
  const missing = [];

  if (!requireEnv('TELEGRAM_BOT_TOKEN', 'your_telegram_bot_token_here')) {
    missing.push('TELEGRAM_BOT_TOKEN');
  }
  if (!requireEnv('OPENROUTER_API_KEY', 'your_openrouter_api_key_here')) {
    missing.push('OPENROUTER_API_KEY');
  }
  if (!fs.existsSync(EVA_PROMPT_PATH)) {
    console.error(`Файл промпта не найден: ${EVA_PROMPT_PATH}`);
    process.exit(1);
  }
  if (missing.length) {
    console.error(`Заполни переменные в .env: ${missing.join(', ')}`);
    process.exit(1);
  }

  if (!process.env.ADMIN_CHAT_ID) {
    console.warn('ADMIN_CHAT_ID не задан — уведомления администратору отключены');
  }
}

validateEnv();

module.exports = {
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
  OPENROUTER_MODEL: process.env.OPENROUTER_MODEL || 'google/gemini-2.5-flash:free',
  OPENROUTER_INTERPRET_MODEL:
    process.env.OPENROUTER_INTERPRET_MODEL ||
    process.env.OPENROUTER_MODEL ||
    'google/gemini-2.5-flash:free',
  ADMIN_CHAT_ID: process.env.ADMIN_CHAT_ID || null,
  EVA_PROMPT_PATH,
  MAX_HISTORY: 30,
  OPENROUTER_URL: 'https://openrouter.ai/api/v1/chat/completions',
};
