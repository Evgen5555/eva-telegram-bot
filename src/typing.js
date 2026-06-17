const TYPING_REFRESH_MS = 4000;

async function sendTyping(ctx) {
  try {
    await ctx.sendChatAction('typing');
  } catch {
    // чат недоступен или action не поддерживается
  }
}

async function withTyping(ctx, task) {
  await sendTyping(ctx);

  const interval = setInterval(() => {
    sendTyping(ctx);
  }, TYPING_REFRESH_MS);

  try {
    return await task();
  } finally {
    clearInterval(interval);
  }
}

module.exports = { sendTyping, withTyping };
