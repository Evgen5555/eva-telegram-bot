const CTA_TAIL = `Оставь контакт, и Евгения свяжется с тобой, чтобы разобрать задачу и подобрать лучший вариант реализации.

Как тебе удобнее связаться?`;

function normalizeDisplayName(raw) {
  const name = raw?.trim().split(/\s+/)[0];
  if (!name || name.length < 2 || name.length > 30) return null;
  if (/^\d+$/.test(name)) return null;
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function formatMenuWelcome(firstName) {
  return `Очень приятно, ${firstName}.

Я Eva.

Помогаю превращать идеи в ботов, сайты, AI-агентов и автоматизацию.

За пару минут помогу понять, что стоит запускать в первую очередь именно в твоей ситуации.

С чего начнём?`;
}

function formatCta(session) {
  const { firstName, nameUsed } = session;
  if (firstName && nameUsed < 2) {
    session.nameUsed += 1;
    return `Отлично, ${firstName}.\n\n${CTA_TAIL}`;
  }
  return `Отлично.\n\n${CTA_TAIL}`;
}

module.exports = {
  normalizeDisplayName,
  formatMenuWelcome,
  formatCta,
};
