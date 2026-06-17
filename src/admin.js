const { Markup } = require('telegraf');
const { OPENROUTER_MODEL } = require('./config');
const { getSettings, saveSettings, getActiveModel, getActivePromptBase } = require('./settings');
const { getStatsSummary, getRecentLeads } = require('./analytics');

const MODEL_PRESETS = [
  'google/gemini-2.5-flash:free',
  'google/gemini-2.0-flash-001',
  'anthropic/claude-3.5-haiku',
  'openai/gpt-4o-mini',
];

const adminState = new Map();

function isAdmin(ctx, adminChatId) {
  if (!adminChatId || !ctx.from) return false;
  return String(ctx.from.id) === String(adminChatId);
}

function adminMenuKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback('🤖 Модель', 'admin:model')],
    [Markup.button.callback('📝 Промпт', 'admin:prompt')],
    [Markup.button.callback('📊 Статистика', 'admin:stats')],
    [Markup.button.callback('👥 Лиды', 'admin:leads')],
  ]);
}

function modelKeyboard() {
  const rows = MODEL_PRESETS.map((model) => [Markup.button.callback(model, `admin:setmodel:${model}`)]);
  rows.push([Markup.button.callback('✏️ Ввести свою', 'admin:model:custom')]);
  rows.push([Markup.button.callback('◀️ Назад', 'admin:menu')]);
  return Markup.inlineKeyboard(rows);
}

function backKeyboard() {
  return Markup.inlineKeyboard([[Markup.button.callback('◀️ Назад', 'admin:menu')]]);
}

function truncate(text, max = 800) {
  if (text.length <= max) return text;
  return `${text.slice(0, max)}…`;
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function formatLeadsList(leads) {
  if (!leads.length) {
    return '👥 <b>Лиды</b>\n\nПока нет сохранённых лидов.';
  }

  const lines = leads.map((lead, index) => {
    const contact =
      lead.contactType && lead.contactValue
        ? `${lead.contactType}: ${lead.contactValue}`
        : '—';
    return (
      `<b>${index + 1}.</b> ${lead.name} (${lead.username})\n` +
      `📅 ${formatDate(lead.createdAt)}\n` +
      `🎯 ${lead.direction}\n` +
      `📞 ${contact}`
    );
  });

  return `👥 <b>Последние лиды</b> (${leads.length})\n\n${lines.join('\n\n')}`;
}

async function replyHtml(ctx, text, keyboard = {}) {
  try {
    await ctx.reply(text, { parse_mode: 'HTML', ...keyboard });
  } catch {
    await ctx.reply(text.replace(/<[^>]+>/g, ''), keyboard);
  }
}

async function editOrReply(ctx, text, keyboard = {}) {
  try {
    if (ctx.callbackQuery?.message) {
      await ctx.editMessageText(text, { parse_mode: 'HTML', ...keyboard });
      return;
    }
  } catch {
    // fallback to new message
  }
  await replyHtml(ctx, text, keyboard);
}

function clearAdminState(chatId) {
  adminState.delete(chatId);
}

function registerAdminHandlers(bot, adminChatId) {
  bot.command('admin', async (ctx) => {
    if (!adminChatId) {
      await replyHtml(ctx, 'Админ-панель не настроена: задай <code>ADMIN_CHAT_ID</code> в .env');
      return;
    }
    if (!isAdmin(ctx, adminChatId)) return;

    clearAdminState(ctx.chat.id);
    await replyHtml(ctx, '🛠 <b>Админ-панель Eva</b>\n\nВыберите раздел:', adminMenuKeyboard());
  });

  bot.action('admin:menu', async (ctx) => {
    if (!isAdmin(ctx, adminChatId)) return;
    await ctx.answerCbQuery();
    clearAdminState(ctx.chat.id);
    await editOrReply(ctx, '🛠 <b>Админ-панель Eva</b>\n\nВыберите раздел:', adminMenuKeyboard());
  });

  bot.action('admin:model', async (ctx) => {
    if (!isAdmin(ctx, adminChatId)) return;
    await ctx.answerCbQuery();
    clearAdminState(ctx.chat.id);

    const current = getActiveModel();
    const saved = getSettings().model?.trim();
    const source = saved ? 'settings.json' : `по умолчанию (${OPENROUTER_MODEL})`;

    await editOrReply(
      ctx,
      `🤖 <b>Модель OpenRouter</b>\n\n` +
        `Текущая: <code>${current}</code>\n` +
        `Источник: ${source}\n\n` +
        'Выберите модель или введите свою:',
      modelKeyboard()
    );
  });

  bot.action(/^admin:setmodel:(.+)$/, async (ctx) => {
    if (!isAdmin(ctx, adminChatId)) return;
    await ctx.answerCbQuery();

    const model = ctx.match[1];
    saveSettings({ model });
    clearAdminState(ctx.chat.id);

    await editOrReply(
      ctx,
      `✅ Модель сохранена:\n<code>${model}</code>\n\nПрименяется сразу, без перезапуска.`,
      backKeyboard()
    );
  });

  bot.action('admin:model:custom', async (ctx) => {
    if (!isAdmin(ctx, adminChatId)) return;
    await ctx.answerCbQuery();
    adminState.set(ctx.chat.id, { step: 'await_model' });

    await editOrReply(
      ctx,
      `✏️ Отправьте название модели OpenRouter одним сообщением.\n\n` +
        `Пример: <code>google/gemini-2.5-flash:free</code>`,
      backKeyboard()
    );
  });

  bot.action('admin:prompt', async (ctx) => {
    if (!isAdmin(ctx, adminChatId)) return;
    await ctx.answerCbQuery();
    adminState.set(ctx.chat.id, { step: 'await_prompt' });

    const saved = getSettings().prompt?.trim();
    const source = saved ? 'settings.json' : 'eva_prompt.txt';
    const preview = truncate(getActivePromptBase(), 600);

    await editOrReply(
      ctx,
      `📝 <b>Системный промпт</b>\n\n` +
        `Источник: ${source}\n\n` +
        `<b>Текущий промпт:</b>\n<pre>${preview.replace(/</g, '&lt;')}</pre>\n\n` +
        'Отправьте новый текст промпта одним сообщением.',
      backKeyboard()
    );
  });

  bot.action('admin:stats', async (ctx) => {
    if (!isAdmin(ctx, adminChatId)) return;
    await ctx.answerCbQuery();
    clearAdminState(ctx.chat.id);

    const { usersCount, conceptsCount, leadsCount } = getStatsSummary();

    await editOrReply(
      ctx,
      `📊 <b>Статистика</b>\n\n` +
        `👤 Пользователей: <b>${usersCount}</b>\n` +
        `💡 Концепций: <b>${conceptsCount}</b>\n` +
        `📞 Лидов: <b>${leadsCount}</b>`,
      backKeyboard()
    );
  });

  bot.action('admin:leads', async (ctx) => {
    if (!isAdmin(ctx, adminChatId)) return;
    await ctx.answerCbQuery();
    clearAdminState(ctx.chat.id);

    const leads = getRecentLeads(10);
    await editOrReply(ctx, formatLeadsList(leads), backKeyboard());
  });
}

async function handleAdminText(ctx, adminChatId) {
  if (!isAdmin(ctx, adminChatId)) return false;

  const state = adminState.get(ctx.chat.id);
  if (!state) return false;

  const text = ctx.message.text?.trim();
  if (!text) return false;

  if (state.step === 'await_model') {
    saveSettings({ model: text });
    clearAdminState(ctx.chat.id);
    await replyHtml(
      ctx,
      `✅ Модель сохранена:\n<code>${text}</code>\n\nПрименяется сразу, без перезапуска.`,
      backKeyboard()
    );
    return true;
  }

  if (state.step === 'await_prompt') {
    if (text.length < 20) {
      await replyHtml(ctx, 'Промпт слишком короткий. Отправьте полный текст системного промпта.');
      return true;
    }

    saveSettings({ prompt: text });
    clearAdminState(ctx.chat.id);
    await replyHtml(
      ctx,
      `✅ Промпт сохранён (${text.length} символов).\n\nПрименяется сразу, без перезапуска.`,
      backKeyboard()
    );
    return true;
  }

  return false;
}

module.exports = { registerAdminHandlers, handleAdminText, isAdmin };
