const axios = require('axios');
const {
  OPENROUTER_API_KEY,
  OPENROUTER_MODEL,
  OPENROUTER_INTERPRET_MODEL,
  OPENROUTER_URL,
} = require('./config');
const { buildConceptPrompt } = require('./prompt');
const { getInterpretContext } = require('./interpretContext');

const HEADERS = {
  Authorization: `Bearer ${OPENROUTER_API_KEY}`,
  'Content-Type': 'application/json',
  'HTTP-Referer': 'https://t.me/vibepulse_eva_bot',
  'X-Title': 'Eva VibePulse Bot',
};

const INTERPRET_SYSTEM = `Ты — парсер намерений бота Eva. Отвечай ТОЛЬКО валидным JSON без markdown.

Допустимые action:
- set_name — пользователь называет или исправляет имя (value: строка имени)
- select_direction — выбор направления (value: bot|site|agent|funnel|idea)
- select_button — выбор ответа-кнопки (value: ТОЧНЫЙ текст из списка buttons/options)
- select_cta — способ связи (value: phone|telegram|discuss)
- reply — короткий ответ по-русски, если нельзя выполнить действие (value: текст 1–2 предложения)

Правила:
- select_button: value должен дословно совпадать с одной из кнопок в контексте
- select_direction: только если пользователь явно хочет бота, сайт, агента, воронку или свою идею
- set_name: если исправляет имя («не, Александра», «меня зовут…») или называет себя
- reply: если сообщение неясное; в тексте мягко направь к кнопкам
- Не выдумывай кнопки, которых нет в контексте`;

function parseInterpretJson(raw) {
  const match = raw.trim().match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

async function interpretUserMessage(session, userText) {
  const context = getInterpretContext(session);
  if (!context) return null;

  const response = await axios.post(
    OPENROUTER_URL,
    {
      model: OPENROUTER_INTERPRET_MODEL,
      messages: [
        { role: 'system', content: INTERPRET_SYSTEM },
        {
          role: 'user',
          content: `Контекст:\n${JSON.stringify(context, null, 2)}\n\nСообщение пользователя: ${userText}`,
        },
      ],
      temperature: 0.2,
      max_tokens: 200,
    },
    { headers: HEADERS, timeout: 30000 }
  );

  const content = response.data?.choices?.[0]?.message?.content?.trim();
  if (!content) return null;

  const parsed = parseInterpretJson(content);
  if (!parsed?.action) return null;
  return parsed;
}

async function generateConcept(session) {  const response = await axios.post(
    OPENROUTER_URL,
    {
      model: OPENROUTER_MODEL,
      messages: [
        { role: 'system', content: buildConceptPrompt(session) },
        { role: 'user', content: 'Сформируй короткий вывод «💡 Что я вижу» по правилам из системного промпта.' },
      ],
      temperature: 0.7,
      max_tokens: 500,
    },
    { headers: HEADERS, timeout: 90000 }
  );

  const content = response.data?.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error('Пустой ответ OpenRouter');
  return content;
}

module.exports = { generateConcept, interpretUserMessage };