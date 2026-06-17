const { STEPS, DIRECTION } = require('./constants');

const MAIN_SOLUTION = {
  [DIRECTION.BOT]: 'Telegram-бот',
  [DIRECTION.SITE]: 'Сайт',
  [DIRECTION.AGENT]: 'AI-помощник',
  [DIRECTION.FUNNEL]: 'Автоворонка',
  [DIRECTION.MARKETING]: 'Маркетинг и продвижение',
  [DIRECTION.DESIGN]: 'Дизайн и упаковка',
  [DIRECTION.IDEA]: 'То, что описано в идее пользователя (не менять на другой продукт)',
};

function defaultSession() {
  return {
    step: STEPS.IDLE,
    leadStatus: 'new',
    direction: null,
    directionLabel: null,
    answers: {
      q1: null,
      q2: null,
      q3: null,
      ideaText: null,
      offerText: null,
      scenarioText: null,
    },
    textFlow: null,
    ideaIntent: null,
    firstName: null,
    nameUsed: 0,
    conceptText: null,
    contact: { type: null, value: null },
    waitingForPhone: false,
    history: [],
  };
}

function resetSession(session) {
  Object.assign(session, defaultSession());
}

function trimHistory(history, max) {
  return history.length <= max ? history : history.slice(-max);
}

function pushHistory(session, role, content, max) {
  session.history.push({ role, content });
  session.history = trimHistory(session.history, max);
}

function answersSummary(session) {
  const main =
    session.direction === DIRECTION.IDEA
      ? MAIN_SOLUTION[DIRECTION.IDEA]
      : MAIN_SOLUTION[session.direction] || session.directionLabel;

  const lines = [
    `Направление: ${session.directionLabel}`,
    `Главное решение (не менять): ${main}`,
  ];

  if (session.direction === 'idea') {
    lines.push(`Идея: ${session.answers.ideaText}`);
    if (session.answers.q1) lines.push(`Что хочет получить: ${session.answers.q1}`);
    if (session.answers.q2) lines.push(`Что есть сейчас: ${session.answers.q2}`);
    if (session.answers.q3) lines.push(`Что мешает: ${session.answers.q3}`);
  } else {
    if (session.answers.q1) lines.push(`Ответ 1: ${session.answers.q1}`);
    if (session.answers.offerText) lines.push(`Что продвигает: ${session.answers.offerText}`);
    if (session.answers.q2) lines.push(`Ответ 2: ${session.answers.q2}`);
    if (session.answers.scenarioText) lines.push(`Типичный кейс: ${session.answers.scenarioText}`);
    if (session.answers.q3) lines.push(`Ответ 3: ${session.answers.q3}`);
  }

  return lines.join('\n');
}

module.exports = {
  defaultSession,
  resetSession,
  pushHistory,
  answersSummary,
};
