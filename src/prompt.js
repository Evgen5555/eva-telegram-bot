const fs = require('fs');
const { EVA_PROMPT_PATH } = require('./config');
const { answersSummary } = require('./session');

function loadBasePrompt() {
  return fs.readFileSync(EVA_PROMPT_PATH, 'utf-8').trim();
}

function buildConceptPrompt(session) {
  const marketingRule =
    session.ideaIntent === 'marketing'
      ? `
- Запрос про продвижение и упаковку: не предлагать разработку бота, сайта или AI-помощника как главное решение.
- Говори про контент, упаковку, подачу, канал или карточки — по смыслу идеи пользователя.`
      : '';

  return `${loadBasePrompt()}

ЗАДАЧА: Сформируй только блок «💡 Что я вижу» — 2–5 предложений. Простой язык. Без списков, сроков, функций, ТЗ.

ДАННЫЕ:
${answersSummary(session)}

Правила:
- Главное решение из данных — не менять, не подменять другим продуктом.
- Покажи понимание задачи + один инсайт.
- Заверши мягким переходом: направление ясно, детали зависят от задачи и бюджета — следующий шаг разобрать с Евгенией, что запускать первым.
- HTML: только <b>💡 Что я вижу</b> как заголовок, дальше текст.
- Только «ты». Без CTA.${marketingRule}

Начни строго с: <b>💡 Что я вижу</b>`;
}

module.exports = { buildConceptPrompt };
