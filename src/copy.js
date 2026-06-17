const ASK_NAME = `Привет! ✨

Как я могу к тебе обращаться?`;

const GUARD_NAME = 'Напиши, как к тебе обращаться — хотя бы имя.';
const INTERPRET_FALLBACK = 'Не совсем поняла — выбери вариант кнопкой 👇';

function formatNameUpdated(name) {
  return `Поняла, буду звать тебя ${name}.\n\nС чего начнём?`;
}

const GENERATING = `Поняла задачу.

Смотрю, что здесь главное — буквально несколько секунд ⏳`;

const CTA = `Отлично.

Оставь контакт, и Евгения свяжется с тобой, чтобы разобрать задачу и подобрать лучший вариант реализации.

Как тебе удобнее связаться?`;

const FINAL = `Супер, зафиксировала.

Передаю задачу и вводные Евгении — она свяжется и разберёт варианты реализации. На связи! 🔥`;

const CONTACT_PHONE = `Напиши свой номер телефона — Евгения свяжется и разберёт твой кейс.`;

const CONTACT_TG = `Напиши свой @username или просто подтверди, что удобно получить сообщение в этом чате.`;

const GUARD_BUTTON = 'Выбери вариант кнопкой 👇';
const GUARD_INSIGHT = 'Чтобы разобрать варианты — нажми «Обсудить реализацию» 👇';
const GUARD_IDEA = 'Расскажи коротко — 1–2 предложения.';
const GUARD_OFF_TOPIC = `Я помогаю с идеями для ботов, сайтов и автоматизации.

Расскажи своими словами, что хочешь создать — 2–3 предложения.`;

function formatOffTopicReply(wasFixed, text) {
  if (!wasFixed) return GUARD_OFF_TOPIC;
  return `Похоже, ты хотел написать по-русски, но была включена английская раскладка: «${text}».

${GUARD_OFF_TOPIC}`;
}
const GUARD_AUDIENCE = 'Напиши 1–2 предложения — кто твоя аудитория.';
const GUARD_OFFER = 'Напиши 1–2 предложения — что продаёшь или продвигаешь.';
const GUARD_SCENARIO = 'Опиши пример в 2–3 предложениях — что пишет клиент и чего ждёшь.';
const GUARD_PRODUCT = 'Напиши 1–2 предложения — что продаёшь или планируешь продавать.';
const GUARD_PHONE = 'Не похоже на номер. Попробуй ещё раз.';
const GENERATION_ERROR = 'Не удалось сформировать вывод. Попробуй ещё раз — /start';

const AUDIENCE_OTHER = `У каждой аудитории свой язык и свои триггеры.

Кто твоя аудитория? Напиши 1–2 предложения — кто эти люди и что им нужно.`;

const SITE_OFFER = `Теперь про содержание.

Что будешь продвигать на сайте? Напиши 1–2 предложения — что продаёшь или продвигаешь.`;

const AGENT_SCENARIO = `Приведи живой пример.

Что обычно пишет клиент и чего ты ждёшь от ответа? 2–3 предложения — как в реальной переписке.`;

const PRODUCT_OTHER = `Расскажи своими словами.

Что продаёшь или планируешь продавать? 1–2 предложения — чем это отличается от типовых курсов или услуг.`;

const QUESTIONS = {
  bot: {
    q1: 'Что хочешь?',
    q2: 'Что есть сейчас?',
    q3: 'Что сейчас мешает?',
  },
  site: {
    q1: 'Что хочешь?',
    q2: 'Что есть сейчас?',
    q3: 'Что сейчас мешает?',
  },
  agent: {
    q1: 'Где должен работать?',
    q2: 'Что должен делать в первую очередь?',
    q3: 'Сколько обращений в день примерно?',
  },
  funnel: {
    q1: 'Что хочешь?',
    q2: 'Что есть сейчас?',
    q3: 'Что сейчас мешает?',
  },
  marketing: {
    q1: 'Что хочешь?',
    q2: 'Что есть сейчас?',
    q3: 'Что сейчас мешает?',
  },
  design: {
    q1: 'Что хочешь?',
    q2: 'Что есть сейчас?',
    q3: 'Что сейчас мешает?',
  },
  idea: {
    text: `Расскажи коротко свою идею.

1–2 предложения.`,
    q1: 'Что хочешь получить?',
    q2: 'Что сейчас есть?',
    q3: 'Что сейчас мешает?',
  },
};

const TEXT_PROMPTS = {
  bot_audience: AUDIENCE_OTHER,
  site_offer: SITE_OFFER,
  agent_scenario: AGENT_SCENARIO,
  funnel_product: PRODUCT_OTHER,
};

const TEXT_GUARDS = {
  bot_audience: GUARD_AUDIENCE,
  site_offer: GUARD_OFFER,
  agent_scenario: GUARD_SCENARIO,
  funnel_product: GUARD_PRODUCT,
};

const TEXT_MICRO = {
  bot_audience: 'audienceCustom',
  site_offer: 'offerCustom',
  agent_scenario: 'scenarioCustom',
  funnel_product: 'productCustom',
};

module.exports = {
  ASK_NAME,
  GUARD_NAME,
  INTERPRET_FALLBACK,
  formatNameUpdated,
  GENERATING,
  CTA,
  FINAL,
  CONTACT_PHONE,
  CONTACT_TG,
  GUARD_BUTTON,
  GUARD_INSIGHT,
  GUARD_IDEA,
  GUARD_OFF_TOPIC,
  formatOffTopicReply,
  GUARD_AUDIENCE,
  GUARD_OFFER,
  GUARD_SCENARIO,
  GUARD_PRODUCT,
  AUDIENCE_OTHER,
  SITE_OFFER,
  AGENT_SCENARIO,
  PRODUCT_OTHER,
  GUARD_PHONE,
  GENERATION_ERROR,
  QUESTIONS,
  TEXT_PROMPTS,
  TEXT_GUARDS,
  TEXT_MICRO,
};
