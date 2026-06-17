const STEPS = {
  IDLE: 'IDLE',
  ASK_NAME: 'ASK_NAME',
  MENU: 'MENU',
  Q1: 'Q1',
  Q2: 'Q2',
  CUSTOM_TEXT: 'CUSTOM_TEXT',
  Q3: 'Q3',
  IDEA_TEXT: 'IDEA_TEXT',
  GENERATING: 'GENERATING',
  CONCEPT: 'CONCEPT',
  CTA: 'CTA',
  CONTACT_PHONE: 'CONTACT_PHONE',
  CONTACT_TG: 'CONTACT_TG',
  LEAD_DONE: 'LEAD_DONE',
};

const DIRECTION = {
  BOT: 'bot',
  SITE: 'site',
  AGENT: 'agent',
  FUNNEL: 'funnel',
  MARKETING: 'marketing',
  DESIGN: 'design',
  IDEA: 'idea',
};

const BTN = {
  DIR_BOT: '🤖 Telegram-бот',
  DIR_SITE: '🌐 Сайт',
  DIR_AGENT: '⚡ AI-агент',
  DIR_FUNNEL: '📈 Автоворонка',
  DIR_MARKETING: '📢 Маркетинг / продвижение',
  DIR_DESIGN: '🎨 Дизайн / упаковка',
  DIR_IDEA: '💡 Своя идея',

  // Telegram-бот
  BOT_WANT_LEADS: '📥 Собирать заявки',
  BOT_WANT_REPLY: '💬 Отвечать клиентам',
  BOT_WANT_QUALIFY: '🎯 Квалифицировать',
  BOT_WANT_SELL: '💰 Помогать продавать',
  BOT_NOW_SELF: '🙋 Всё делаю сам',
  BOT_NOW_MANAGER: '👥 Есть менеджер',
  BOT_NOW_BOT: '🤖 Уже есть бот',
  BOT_NOW_NONE: '❌ Ничего нет',
  BOT_BLOCK_SLOW: '⏳ Не успеваю отвечать',
  BOT_BLOCK_LOSS: '📉 Теряются заявки',
  BOT_BLOCK_ROUTINE: '😴 Много рутины',
  BOT_BLOCK_UNKNOWN: '❓ Не понимаю, с чего начать',

  // Сайт
  SITE_WANT_LANDING: '🌐 Лендинг',
  SITE_WANT_VIZITKA: '💎 Сайт-визитку',
  SITE_WANT_CATALOG: '📦 Каталог услуг',
  SITE_NOW_NONE: '❌ Ничего нет',
  SITE_NOW_SITE: '🌐 Есть сайт',
  SITE_NOW_SOCIAL: '📄 Есть только соцсети',
  SITE_NOW_LANDING: '⚡ Есть лендинг',
  SITE_BLOCK_NO_LEADS: '📉 Нет заявок',
  SITE_BLOCK_UNCLEAR: '🤷 Люди не понимают предложение',
  SITE_BLOCK_NO_BUY: '💸 Не покупают',
  SITE_BLOCK_UNKNOWN: '❓ Не знаю',

  // AI-агент
  AGENT_TG: 'Telegram',
  AGENT_SITE: 'На сайте',
  AGENT_CRM: 'В CRM / переписках',
  AGENT_EVERYWHERE: 'Везде',
  AGENT_REPLY: 'Отвечать клиентам',
  AGENT_QUALIFY: 'Квалифицировать лидов',
  AGENT_CLOSE: 'Доводить до заявки',
  AGENT_CONSULT: 'Консультировать',
  LOAD_LT_20: 'До 20',
  LOAD_20_50: '20–50',
  LOAD_GT_50: '50+',

  // Автоворонка
  FUNNEL_WANT_LEADS: '📈 Больше заявок',
  FUNNEL_WANT_SALES: '💰 Больше продаж',
  FUNNEL_WANT_WARMUP: '🤖 Автоматизировать прогрев',
  FUNNEL_WANT_SCALE: '🚀 Масштабироваться',
  FUNNEL_NOW_MANUAL: '✍️ Продаю вручную',
  FUNNEL_NOW_CONTENT: '📢 Есть контент',
  FUNNEL_NOW_EXISTS: '⚙️ Есть воронка',
  FUNNEL_NOW_NONE: '❌ Ничего нет',
  FUNNEL_BLOCK_NO_LEAD: '📉 Люди не доходят до заявки',
  FUNNEL_BLOCK_GHOST: '👻 Пропадают после контакта',
  FUNNEL_BLOCK_NO_BUY: '💸 Не покупают',
  FUNNEL_BLOCK_UNKNOWN: '❓ Не понимаю где теряются',

  // Маркетинг / продвижение
  MKT_WANT_LEADS: '📈 Больше заявок',
  MKT_WANT_AUDIENCE: '👥 Рост аудитории',
  MKT_WANT_SALES: '💰 Больше продаж',
  MKT_WANT_AWARE: '⭐ Узнаваемость',
  MKT_HAVE_CHANNEL: '📢 Есть канал / блог',
  MKT_HAVE_PRODUCT: '📦 Есть продукт',
  MKT_HAVE_BOTH: '✅ Есть и продукт, и аудитория',
  MKT_HAVE_NONE: '❌ Начинаю с нуля',
  MKT_BLOCK_NO_LEADS: '📉 Нет заявок',
  MKT_BLOCK_REACH: '😶 Мало охватов',
  MKT_BLOCK_INTEREST: '💸 Есть интерес, но нет продаж',
  MKT_BLOCK_UNKNOWN: '❓ Не понимаю, что делать дальше',

  // Дизайн / упаковка
  DSG_WANT_BRAND: '🎨 Оформить бренд',
  DSG_WANT_SOCIAL: '📢 Оформить соцсети',
  DSG_WANT_MP: '🛍️ Карточки маркетплейса',
  DSG_WANT_SITE: '🌐 Дизайн сайта',
  DSG_HAVE_NONE: '❌ Ничего нет',
  DSG_HAVE_DRAFT: '⚡ Есть наброски',
  DSG_HAVE_BAD: '🎨 Есть дизайн, но не нравится',
  DSG_HAVE_MIX: '📦 Всё разрознено',
  DSG_BLOCK_UNPRO: '🤷 Выглядит непрофессионально',
  DSG_BLOCK_TRUST: '📉 Не вызывает доверия',
  DSG_BLOCK_STYLE: '🧩 Нет единого стиля',
  DSG_BLOCK_SALES: '💸 Не помогает продавать',

  // Своя идея
  IDEA_WANT_PRODUCT: '🤖 Новый продукт',
  IDEA_WANT_CLIENTS: '📈 Больше клиентов',
  IDEA_WANT_TIME: '⏳ Экономию времени',
  IDEA_WANT_AUTO: '🚀 Автоматизацию',
  IDEA_WANT_EXPLORE: '💡 Пока исследую идею',
  IDEA_HAVE_IDEA: '💭 Только идея',
  IDEA_HAVE_PRODUCT: '📦 Есть продукт',
  IDEA_HAVE_AUDIENCE: '👥 Есть аудитория',
  IDEA_HAVE_WORKS: '✅ Уже работает',
  IDEA_BLOCK_START: '🤷 Не знаю, с чего начать',
  IDEA_BLOCK_SALES: '💸 Нет продаж',
  IDEA_BLOCK_TIME: '⏰ Не хватает времени',
  IDEA_BLOCK_HOW: '⚙️ Не понимаю, как реализовать',

  DISCUSS: '✅ Обсудить реализацию',
  CHANGE_DIR: '↩️ Выбрать другое направление',
  BACK_MENU: '↩️ В главное меню',
  CALL: '📞 Созвон',
  TELEGRAM: '💬 Написать в Telegram',
  TG_HERE: '✅ Да, пишите сюда',
};

const DIR_MAP = {
  [BTN.DIR_BOT]: { id: DIRECTION.BOT, label: 'Telegram-бот' },
  [BTN.DIR_SITE]: { id: DIRECTION.SITE, label: 'Сайт' },
  [BTN.DIR_AGENT]: { id: DIRECTION.AGENT, label: 'AI-агент' },
  [BTN.DIR_FUNNEL]: { id: DIRECTION.FUNNEL, label: 'Автоворонка' },
  [BTN.DIR_MARKETING]: { id: DIRECTION.MARKETING, label: 'Маркетинг / продвижение' },
  [BTN.DIR_DESIGN]: { id: DIRECTION.DESIGN, label: 'Дизайн / упаковка' },
  [BTN.DIR_IDEA]: { id: DIRECTION.IDEA, label: 'Своя идея' },
};

const DIR_BUTTONS = Object.keys(DIR_MAP);

const BRANCH_Q1 = {
  bot: [BTN.BOT_WANT_LEADS, BTN.BOT_WANT_REPLY, BTN.BOT_WANT_QUALIFY, BTN.BOT_WANT_SELL],
  site: [BTN.SITE_WANT_LANDING, BTN.SITE_WANT_VIZITKA, BTN.SITE_WANT_CATALOG],
  agent: [BTN.AGENT_TG, BTN.AGENT_SITE, BTN.AGENT_CRM, BTN.AGENT_EVERYWHERE],
  funnel: [BTN.FUNNEL_WANT_LEADS, BTN.FUNNEL_WANT_SALES, BTN.FUNNEL_WANT_WARMUP, BTN.FUNNEL_WANT_SCALE],
  marketing: [BTN.MKT_WANT_LEADS, BTN.MKT_WANT_AUDIENCE, BTN.MKT_WANT_SALES, BTN.MKT_WANT_AWARE],
  design: [BTN.DSG_WANT_BRAND, BTN.DSG_WANT_SOCIAL, BTN.DSG_WANT_MP, BTN.DSG_WANT_SITE],
  idea: [BTN.IDEA_WANT_PRODUCT, BTN.IDEA_WANT_CLIENTS, BTN.IDEA_WANT_TIME, BTN.IDEA_WANT_AUTO, BTN.IDEA_WANT_EXPLORE],
};

const BRANCH_Q2 = {
  bot: [BTN.BOT_NOW_SELF, BTN.BOT_NOW_MANAGER, BTN.BOT_NOW_BOT, BTN.BOT_NOW_NONE],
  site: [BTN.SITE_NOW_NONE, BTN.SITE_NOW_SITE, BTN.SITE_NOW_SOCIAL, BTN.SITE_NOW_LANDING],
  agent: [BTN.AGENT_REPLY, BTN.AGENT_QUALIFY, BTN.AGENT_CLOSE, BTN.AGENT_CONSULT],
  funnel: [BTN.FUNNEL_NOW_MANUAL, BTN.FUNNEL_NOW_CONTENT, BTN.FUNNEL_NOW_EXISTS, BTN.FUNNEL_NOW_NONE],
  marketing: [BTN.MKT_HAVE_CHANNEL, BTN.MKT_HAVE_PRODUCT, BTN.MKT_HAVE_BOTH, BTN.MKT_HAVE_NONE],
  design: [BTN.DSG_HAVE_NONE, BTN.DSG_HAVE_DRAFT, BTN.DSG_HAVE_BAD, BTN.DSG_HAVE_MIX],
  idea: [BTN.IDEA_HAVE_IDEA, BTN.IDEA_HAVE_PRODUCT, BTN.IDEA_HAVE_AUDIENCE, BTN.IDEA_HAVE_WORKS],
};

const BRANCH_Q3 = {
  bot: [BTN.BOT_BLOCK_SLOW, BTN.BOT_BLOCK_LOSS, BTN.BOT_BLOCK_ROUTINE, BTN.BOT_BLOCK_UNKNOWN],
  site: [BTN.SITE_BLOCK_NO_LEADS, BTN.SITE_BLOCK_UNCLEAR, BTN.SITE_BLOCK_NO_BUY, BTN.SITE_BLOCK_UNKNOWN],
  agent: [BTN.LOAD_LT_20, BTN.LOAD_20_50, BTN.LOAD_GT_50],
  funnel: [BTN.FUNNEL_BLOCK_NO_LEAD, BTN.FUNNEL_BLOCK_GHOST, BTN.FUNNEL_BLOCK_NO_BUY, BTN.FUNNEL_BLOCK_UNKNOWN],
  marketing: [BTN.MKT_BLOCK_NO_LEADS, BTN.MKT_BLOCK_REACH, BTN.MKT_BLOCK_INTEREST, BTN.MKT_BLOCK_UNKNOWN],
  design: [BTN.DSG_BLOCK_UNPRO, BTN.DSG_BLOCK_TRUST, BTN.DSG_BLOCK_STYLE, BTN.DSG_BLOCK_SALES],
  idea: [BTN.IDEA_BLOCK_START, BTN.IDEA_BLOCK_SALES, BTN.IDEA_BLOCK_TIME, BTN.IDEA_BLOCK_HOW],
};

const TEXT_FLOW = {
  BOT_AUDIENCE: 'bot_audience',
  SITE_OFFER: 'site_offer',
  AGENT_SCENARIO: 'agent_scenario',
  FUNNEL_PRODUCT: 'funnel_product',
};

const AFTER_Q1_TEXT = {};

const AFTER_Q2_TEXT = {
  [DIRECTION.AGENT]: TEXT_FLOW.AGENT_SCENARIO,
};

const BUTTON_TEXT_TRIGGER = {};

const ALL_BRANCH_ANSWERS = [
  ...new Set([
    ...Object.values(BRANCH_Q1).flat(),
    ...Object.values(BRANCH_Q2).flat(),
    ...Object.values(BRANCH_Q3).flat(),
  ]),
];

module.exports = {
  STEPS,
  DIRECTION,
  BTN,
  DIR_MAP,
  DIR_BUTTONS,
  BRANCH_Q1,
  BRANCH_Q2,
  BRANCH_Q3,
  TEXT_FLOW,
  AFTER_Q1_TEXT,
  AFTER_Q2_TEXT,
  BUTTON_TEXT_TRIGGER,
  ALL_BRANCH_ANSWERS,
};
