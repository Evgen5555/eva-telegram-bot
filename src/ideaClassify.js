const PRODUCT_IDEA_RE =
  /бот|сайт|лендинг|автоматиза|ai[- ]?(агент|помощник)|crm|интеграц|воронк|приложен|web[- ]?app|сервис/i;

const MARKETING_IDEA_RE =
  /контент[- ]?план|контент|пост(?:ы|ов)?|reels|stories|ведение канала|telegram[- ]?канал|телеграм[- ]?канал|оформ(?:ить|ление).*канал|продвижен|маркетинг|\bsmm\b|позиционирован|узнаваем/i;

const DESIGN_IDEA_RE =
  /дизайн|упаковк|оформ(?:ить|ление)|бренд|карточк|визуал|баннер|презентац|wildberries|\bozon\b|\bwb\b|маркетплейс/i;

const IDEA_SCOPE_RE =
  /бизнес|продаж|клиент|заявк|запис|онлайн[- ]?школ|курс|эксперт|коуч|услуг|консультац|маркетплейс|магазин|проект|запуск|монетиз|подписчик|аудитор|лид|crm|saas|стартап|mvp|продукт/i;

function classifyIdeaIntent(text) {
  if (PRODUCT_IDEA_RE.test(text)) return 'product';
  if (MARKETING_IDEA_RE.test(text)) return 'marketing';
  return 'product';
}

function isInScopeIdea(text) {
  return (
    PRODUCT_IDEA_RE.test(text) ||
    MARKETING_IDEA_RE.test(text) ||
    DESIGN_IDEA_RE.test(text) ||
    IDEA_SCOPE_RE.test(text)
  );
}

const SITE_IDEA_RES = [
  /(?:нужен|хочу|надо|сделать).{0,15}(?:сайт|лендинг)/i,
  /(?:сайт|лендинг).{0,15}(?:нужен|хочу|надо)/i,
];

const BOT_IDEA_RES = [
  /(?:нужен|хочу|надо).{0,20}(?:бот|telegram|телеграм)/i,
  /(?:бот|telegram-бот|телеграм-бот).{0,15}(?:нужен|хочу|надо)/i,
  /автоматизир.{0,20}(?:telegram|телеграм|бот)/i,
];

const AGENT_IDEA_RES = [
  /ai[- ]?агент/i,
  /(?:нужен|хочу|надо).{0,15}агент/i,
];

const AUTOMATION_IDEA_RE = /автоматизац|автоматизир/i;

function detectIdeaDirection(text) {
  if (DESIGN_IDEA_RE.test(text)) return 'design';
  if (MARKETING_IDEA_RE.test(text)) return 'marketing';
  if (SITE_IDEA_RES.some((re) => re.test(text))) return 'site';
  if (BOT_IDEA_RES.some((re) => re.test(text))) return 'bot';
  if (!/автоматиз/i.test(text) && AGENT_IDEA_RES.some((re) => re.test(text))) return 'agent';
  if (AUTOMATION_IDEA_RE.test(text)) return 'automation';
  return null;
}

module.exports = { classifyIdeaIntent, isInScopeIdea, detectIdeaDirection };
