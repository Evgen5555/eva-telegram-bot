const { answersSummary } = require('./session');

function formatLeadMessage(ctx, session) {
  const user = ctx.from;
  const name = [user.first_name, user.last_name].filter(Boolean).join(' ');
  const username = user.username ? `@${user.username}` : '—';
  const contact = session.contact;

  return (
    `🆕 <b>Новый лид — EVA Bot</b>\n\n` +
    `👤 ${name} (${username})\n` +
    `🆔 ID: ${user.id}\n\n` +
    `<b>📋 Вводные:</b>\n${answersSummary(session)}\n\n` +
    `<b>💡 Вывод Eva:</b>\n${session.conceptText}\n\n` +
    `<b>📞 Контакт:</b> ${contact.type} — ${contact.value}`
  );
}

async function notifyAdmin(telegram, adminChatId, ctx, session) {
  if (!adminChatId) return;

  try {
    await telegram.sendMessage(adminChatId, formatLeadMessage(ctx, session), {
      parse_mode: 'HTML',
    });
  } catch (error) {
    console.error('Не удалось отправить уведомление админу:', error.message);
  }
}

module.exports = { notifyAdmin };
