const { MAX_HISTORY } = require('./config');
const {
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
} = require('./constants');
const copy = require('./copy');
const micro = require('./micro');
const keyboards = require('./keyboards');
const { isInScopeIdea, detectIdeaDirection } = require('./ideaClassify');
const { fixKeyboardLayout } = require('./keyboardLayout');
const { normalizeDisplayName, formatMenuWelcome, formatCta } = require('./personalize');
const { resetSession, pushHistory } = require('./session');
const { generateConcept, interpretUserMessage } = require('./openrouter');
const { isButtonOnlyStep } = require('./interpretContext');
const { notifyAdmin } = require('./notify');
const { withTyping } = require('./typing');

const TEXT_FLOW_NEXT = {
  [TEXT_FLOW.BOT_AUDIENCE]: 3,
  [TEXT_FLOW.SITE_OFFER]: 2,
  [TEXT_FLOW.AGENT_SCENARIO]: 3,
  [TEXT_FLOW.FUNNEL_PRODUCT]: 2,
};

const TEXT_MIN = {
  [TEXT_FLOW.BOT_AUDIENCE]: 5,
  [TEXT_FLOW.SITE_OFFER]: 5,
  [TEXT_FLOW.AGENT_SCENARIO]: 10,
  [TEXT_FLOW.FUNNEL_PRODUCT]: 5,
};

const DIR_BY_ID = {
  bot: { id: DIRECTION.BOT, label: 'Telegram-бот' },
  site: { id: DIRECTION.SITE, label: 'Сайт' },
  agent: { id: DIRECTION.AGENT, label: 'AI-агент' },
  funnel: { id: DIRECTION.FUNNEL, label: 'Автоворонка' },
  marketing: { id: DIRECTION.MARKETING, label: 'Маркетинг / продвижение' },
  design: { id: DIRECTION.DESIGN, label: 'Дизайн / упаковка' },
  idea: { id: DIRECTION.IDEA, label: 'Своя идея' },
};

function isStep(session, ...steps) {
  return steps.includes(session.step);
}

async function reply(ctx, text, keyboard = {}) {
  try {
    await ctx.reply(text, { parse_mode: 'HTML', ...keyboard });
  } catch {
    await ctx.reply(text.replace(/<[^>]+>/g, ''), keyboard);
  }
}

function normalizeUserText(rawText) {
  const trimmed = rawText?.trim();
  if (!trimmed) return { text: '', wasFixed: false };

  const { text, wasFixed } = fixKeyboardLayout(trimmed);
  return { text, wasFixed };
}

function offTopicReply(wasFixed, text) {
  return copy.formatOffTopicReply(wasFixed, text);
}

function isPhoneLike(text) {
  return text.replace(/\D/g, '').length >= 10;
}

function contactValueFromCtx(ctx) {
  const user = ctx.from;
  return user.username ? `@${user.username}` : `tg_id:${user.id}`;
}

async function askUserName(ctx) {
  resetSession(ctx.session);
  ctx.session.step = STEPS.ASK_NAME;
  pushHistory(ctx.session, 'assistant', copy.ASK_NAME, MAX_HISTORY);
  await reply(ctx, copy.ASK_NAME, keyboards.removeKeyboard());
}

async function showMainMenu(ctx) {
  const s = ctx.session;
  const { firstName, nameUsed } = s;

  resetSession(s);
  s.firstName = firstName;
  s.nameUsed = nameUsed;
  s.step = STEPS.MENU;

  const menuText = formatMenuWelcome(firstName);
  pushHistory(s, 'assistant', menuText, MAX_HISTORY);
  await reply(ctx, menuText, keyboards.mainMenuKeyboard());
}

async function goToMenu(ctx) {
  if (ctx.session.firstName) {
    await showMainMenu(ctx);
    return;
  }
  await askUserName(ctx);
}

function keyboardForStep(session) {
  switch (session.step) {
    case STEPS.MENU:
      return keyboards.mainMenuKeyboard();
    case STEPS.Q1:
      return keyboards.branchKeyboard(session.direction, 'q1');
    case STEPS.Q2:
      return keyboards.branchKeyboard(session.direction, 'q2');
    case STEPS.Q3:
      return keyboards.branchKeyboard(session.direction, 'q3');
    case STEPS.CTA:
      return keyboards.ctaKeyboard();
    case STEPS.CONCEPT:
      return keyboards.conceptKeyboard();
    default:
      return {};
  }
}

function tryExtractNameCorrection(text) {
  const patterns = [
    /^(?:не|нет)[,\s]+(.+)$/i,
    /^(?:я\s+)?(?:имел(?:\s+в\s+виду)?|ошиб(?:ся|лась)|исправ(?:ь|лю)|правильнее|это|зовут(?:\s+меня)?)\s*[,:]?\s*(.+)$/i,
    /^меня\s+зовут\s+(.+)$/i,
  ];

  for (const re of patterns) {
    const match = text.match(re);
    if (match) return normalizeDisplayName(match[1]);
  }
  return null;
}

function tryQuickInterpret(session, text) {
  if (session.step !== STEPS.MENU) return null;

  const name = tryExtractNameCorrection(text);
  if (name) return { action: 'set_name', value: name };

  const ideaDir = detectIdeaDirection(text);
  if (ideaDir && DIR_BY_ID[ideaDir === 'automation' ? 'funnel' : ideaDir]) {
    return { action: 'select_direction', value: ideaDir === 'automation' ? 'funnel' : ideaDir };
  }

  return null;
}

async function selectDirection(ctx, directionId, label) {
  const s = ctx.session;
  s.direction = directionId;
  s.directionLabel = label;
  pushHistory(s, 'user', `Направление: ${label}`, MAX_HISTORY);

  if (directionId === DIRECTION.IDEA) {
    s.step = STEPS.IDEA_TEXT;
    await reply(ctx, copy.QUESTIONS.idea.text, keyboards.ideaTextKeyboard());
    return;
  }

  await askBranchQuestion(ctx, 1);
}

async function processBranchAnswer(ctx, text) {
  const s = ctx.session;
  const dir = s.direction;

  if (isStep(s, STEPS.Q1) && BRANCH_Q1[dir]?.includes(text)) {
    const trigger = BUTTON_TEXT_TRIGGER[`${dir}:${text}`];
    if (trigger) {
      pushHistory(s, 'user', `Q1: ${text}`, MAX_HISTORY);
      await startCustomText(ctx, trigger);
      return true;
    }

    s.answers.q1 = text;
    pushHistory(s, 'user', `Q1: ${text}`, MAX_HISTORY);

    if (AFTER_Q1_TEXT[dir]) {
      await sendFollowUpToText(ctx, 'q1', text, AFTER_Q1_TEXT[dir]);
      return true;
    }

    await sendFollowUp(ctx, 'q1', text, 2);
    return true;
  }

  if (isStep(s, STEPS.Q2) && BRANCH_Q2[dir]?.includes(text)) {
    const trigger = BUTTON_TEXT_TRIGGER[`${dir}:${text}`];
    if (trigger) {
      pushHistory(s, 'user', `Q2: ${text}`, MAX_HISTORY);
      await startCustomText(ctx, trigger);
      return true;
    }

    s.answers.q2 = text;
    pushHistory(s, 'user', `Q2: ${text}`, MAX_HISTORY);

    if (AFTER_Q2_TEXT[dir]) {
      await sendFollowUpToText(ctx, 'q2', text, AFTER_Q2_TEXT[dir]);
      return true;
    }

    await sendFollowUp(ctx, 'q2', text, 3);
    return true;
  }

  if (isStep(s, STEPS.Q3) && BRANCH_Q3[dir]?.includes(text)) {
    s.answers.q3 = text;
    pushHistory(s, 'user', `Q3: ${text}`, MAX_HISTORY);
    const microText = micro.buildMicroOnly(dir, 'q3', text);
    pushHistory(s, 'assistant', microText, MAX_HISTORY);
    await reply(ctx, microText);
    await runConceptGeneration(ctx);
    return true;
  }

  return false;
}

async function handleIdeaTextInput(ctx, text, wasFixed) {
  const s = ctx.session;

  if (text.length < 5) {
    await reply(ctx, copy.GUARD_IDEA, keyboards.ideaTextKeyboard());
    return;
  }

  if (!isInScopeIdea(text)) {
    await reply(ctx, offTopicReply(wasFixed, text), keyboards.ideaTextKeyboard());
    return;
  }

  s.direction = DIRECTION.IDEA;
  s.directionLabel = 'Своя идея';
  s.answers.ideaText = text;
  pushHistory(s, 'user', `Идея: ${text}`, MAX_HISTORY);
  await askBranchQuestion(ctx, 1);
}

async function applyInterpretation(ctx, result) {
  const s = ctx.session;
  const { action, value } = result;

  if (action === 'set_name') {
    const name = normalizeDisplayName(value || '');
    if (!name) return false;

    s.firstName = name;
    s.nameUsed = 1;
    s.step = STEPS.MENU;
    pushHistory(s, 'user', value, MAX_HISTORY);

    const menuText = copy.formatNameUpdated(name);
    pushHistory(s, 'assistant', menuText, MAX_HISTORY);
    await reply(ctx, menuText, keyboards.mainMenuKeyboard());
    return true;
  }

  if (action === 'select_direction') {
    const route = DIR_BY_ID[value];
    if (!route) return false;
    await selectDirection(ctx, route.id, route.label);
    return true;
  }

  if (action === 'select_button') {
    if (!value) return false;
    return processBranchAnswer(ctx, value);
  }

  if (action === 'select_cta' && isStep(s, STEPS.CTA)) {
    if (value === 'phone') {
      s.step = STEPS.CONTACT_PHONE;
      s.contact.type = 'phone';
      s.waitingForPhone = true;
      s.leadStatus = 'contact_requested';
      pushHistory(s, 'user', BTN.CALL, MAX_HISTORY);
      await reply(ctx, copy.CONTACT_PHONE, keyboards.contactPhoneKeyboard());
      return true;
    }
    if (value === 'telegram') {
      s.step = STEPS.CONTACT_TG;
      s.contact.type = 'telegram';
      s.leadStatus = 'contact_requested';
      pushHistory(s, 'user', BTN.TELEGRAM, MAX_HISTORY);
      await reply(ctx, copy.CONTACT_TG, keyboards.contactTgKeyboard());
      return true;
    }
  }

  if (action === 'reply' && value) {
    pushHistory(s, 'assistant', value, MAX_HISTORY);
    await reply(ctx, value, keyboardForStep(s));
    return true;
  }

  return false;
}

async function handleButtonStepFreeText(ctx, text) {
  const s = ctx.session;

  const quick = tryQuickInterpret(s, text);
  if (quick && (await applyInterpretation(ctx, quick))) return;

  let handled = false;
  await withTyping(ctx, async () => {
    try {
      const result = await interpretUserMessage(s, text);
      if (result) {
        handled = await applyInterpretation(ctx, result);
      }
    } catch (error) {
      console.error('Ошибка interpret:', error.response?.data || error.message);
    }
  });

  if (handled) return;

  pushHistory(s, 'user', text, MAX_HISTORY);
  await reply(ctx, copy.INTERPRET_FALLBACK, keyboardForStep(s));
}

async function askBranchQuestion(ctx, questionNum) {
  const { direction } = ctx.session;
  const text = copy.QUESTIONS[direction][`q${questionNum}`];
  ctx.session.step = questionNum === 1 ? STEPS.Q1 : questionNum === 2 ? STEPS.Q2 : STEPS.Q3;
  await reply(ctx, text, keyboards.branchKeyboard(direction, `q${questionNum}`));
}

async function sendFollowUp(ctx, answeredStep, answer, nextQuestionNum) {
  const { direction } = ctx.session;
  const nextQ = copy.QUESTIONS[direction][`q${nextQuestionNum}`];
  const text = micro.buildFollowUp(direction, answeredStep, answer, nextQ);
  ctx.session.step =
    nextQuestionNum === 2 ? STEPS.Q2 : nextQuestionNum === 3 ? STEPS.Q3 : STEPS.Q2;

  pushHistory(ctx.session, 'assistant', text, MAX_HISTORY);
  await reply(ctx, text, keyboards.branchKeyboard(direction, `q${nextQuestionNum}`));
}

async function sendFollowUpToText(ctx, answeredStep, answer, textFlow) {
  const { direction } = ctx.session;
  const prompt = copy.TEXT_PROMPTS[textFlow];
  const text = micro.buildFollowUp(direction, answeredStep, answer, prompt);

  ctx.session.textFlow = textFlow;
  ctx.session.step = STEPS.CUSTOM_TEXT;
  pushHistory(ctx.session, 'assistant', text, MAX_HISTORY);
  await reply(ctx, text, keyboards.ideaTextKeyboard());
}

async function startCustomText(ctx, textFlow) {
  const prompt = copy.TEXT_PROMPTS[textFlow];
  ctx.session.textFlow = textFlow;
  ctx.session.step = STEPS.CUSTOM_TEXT;
  pushHistory(ctx.session, 'assistant', prompt, MAX_HISTORY);
  await reply(ctx, prompt, keyboards.ideaTextKeyboard());
}

async function completeCustomText(ctx, text) {
  const s = ctx.session;
  const flow = s.textFlow;
  const minLen = TEXT_MIN[flow] || 5;

  if (text.length < minLen) {
    await reply(ctx, copy.TEXT_GUARDS[flow], keyboards.ideaTextKeyboard());
    return;
  }

  switch (flow) {
    case TEXT_FLOW.BOT_AUDIENCE:
      s.answers.q2 = `Аудитория: ${text}`;
      pushHistory(s, 'user', `Аудитория: ${text}`, MAX_HISTORY);
      break;
    case TEXT_FLOW.SITE_OFFER:
      s.answers.offerText = text;
      pushHistory(s, 'user', `Оффер: ${text}`, MAX_HISTORY);
      break;
    case TEXT_FLOW.AGENT_SCENARIO:
      s.answers.scenarioText = text;
      pushHistory(s, 'user', `Кейс: ${text}`, MAX_HISTORY);
      break;
    case TEXT_FLOW.FUNNEL_PRODUCT:
      s.answers.q1 = `Продукт: ${text}`;
      pushHistory(s, 'user', `Продукт: ${text}`, MAX_HISTORY);
      break;
    default:
      return;
  }

  s.textFlow = null;
  const microStep = copy.TEXT_MICRO[flow];
  const nextQ = TEXT_FLOW_NEXT[flow];

  await sendFollowUp(ctx, microStep, null, nextQ);
}

async function showCta(ctx) {
  const s = ctx.session;
  s.step = STEPS.CTA;
  s.leadStatus = 'cta_shown';
  const ctaText = formatCta(s);
  pushHistory(s, 'assistant', ctaText, MAX_HISTORY);
  await reply(ctx, ctaText, keyboards.ctaKeyboard());
}

async function runConceptGeneration(ctx) {
  const s = ctx.session;
  s.step = STEPS.GENERATING;

  await reply(ctx, copy.GENERATING);

  try {
    s.conceptText = await withTyping(ctx, () => generateConcept(s));
    s.leadStatus = 'concept_shown';
    pushHistory(s, 'assistant', s.conceptText, MAX_HISTORY);
    await reply(ctx, s.conceptText);
    await showCta(ctx);
  } catch (error) {
    console.error('Ошибка генерации:', error.response?.data || error.message);
    s.step = STEPS.MENU;
    await reply(ctx, copy.GENERATION_ERROR, keyboards.mainMenuKeyboard());
  }
}

async function completeLead(ctx) {
  const s = ctx.session;
  s.step = STEPS.LEAD_DONE;
  s.leadStatus = 'completed';
  s.waitingForPhone = false;

  await reply(ctx, copy.FINAL, keyboards.removeKeyboard());
  pushHistory(s, 'assistant', copy.FINAL, MAX_HISTORY);
  await notifyAdmin(ctx.telegram, ctx.state.adminChatId, ctx, s);
}

function registerHandlers(bot, adminChatId) {
  bot.use((ctx, next) => {
    ctx.state.adminChatId = adminChatId;
    return next();
  });

  bot.start(askUserName);
  bot.command('reset', askUserName);

  bot.hears(BTN.BACK_MENU, goToMenu);
  bot.hears(BTN.CHANGE_DIR, goToMenu);

  bot.hears(DIR_BUTTONS, async (ctx) => {
    if (!isStep(ctx.session, STEPS.MENU)) return;

    const data = DIR_MAP[ctx.message.text];
    await selectDirection(ctx, data.id, data.label);
  });

  bot.hears(ALL_BRANCH_ANSWERS, async (ctx) => {
    await processBranchAnswer(ctx, ctx.message.text);
  });

  bot.hears(BTN.DISCUSS, async (ctx) => {
    if (!isStep(ctx.session, STEPS.CONCEPT, STEPS.CTA)) return;
    await showCta(ctx);
  });

  bot.hears(BTN.CALL, async (ctx) => {
    if (!isStep(ctx.session, STEPS.CTA)) return;
    ctx.session.step = STEPS.CONTACT_PHONE;
    ctx.session.contact.type = 'phone';
    ctx.session.waitingForPhone = true;
    ctx.session.leadStatus = 'contact_requested';
    pushHistory(ctx.session, 'user', BTN.CALL, MAX_HISTORY);
    await reply(ctx, copy.CONTACT_PHONE, keyboards.contactPhoneKeyboard());
  });

  bot.hears(BTN.TELEGRAM, async (ctx) => {
    if (!isStep(ctx.session, STEPS.CTA)) return;
    ctx.session.step = STEPS.CONTACT_TG;
    ctx.session.contact.type = 'telegram';
    ctx.session.leadStatus = 'contact_requested';
    pushHistory(ctx.session, 'user', BTN.TELEGRAM, MAX_HISTORY);
    await reply(ctx, copy.CONTACT_TG, keyboards.contactTgKeyboard());
  });

  bot.hears(BTN.TG_HERE, async (ctx) => {
    if (!isStep(ctx.session, STEPS.CONTACT_TG)) return;
    ctx.session.contact.value = contactValueFromCtx(ctx);
    pushHistory(ctx.session, 'user', BTN.TG_HERE, MAX_HISTORY);
    await completeLead(ctx);
  });

  bot.on('text', async (ctx) => {
    const rawText = ctx.message.text?.trim();
    if (!rawText || rawText.startsWith('/')) return;

    const { text, wasFixed } = normalizeUserText(rawText);
    if (!text) return;

    const s = ctx.session;

    if (isStep(s, STEPS.ASK_NAME)) {
      const name = normalizeDisplayName(text);
      if (!name) {
        await reply(ctx, copy.GUARD_NAME, keyboards.removeKeyboard());
        return;
      }

      s.firstName = name;
      s.nameUsed = 1;
      s.step = STEPS.MENU;
      pushHistory(s, 'user', name, MAX_HISTORY);

      const menuText = formatMenuWelcome(name);
      pushHistory(s, 'assistant', menuText, MAX_HISTORY);
      await reply(ctx, menuText, keyboards.mainMenuKeyboard());
      return;
    }

    if (isStep(s, STEPS.CUSTOM_TEXT)) {
      await completeCustomText(ctx, text);
      return;
    }

    if (isStep(s, STEPS.IDEA_TEXT)) {
      await handleIdeaTextInput(ctx, text, wasFixed);
      return;
    }

    if (isStep(s, STEPS.CONTACT_PHONE) && s.waitingForPhone) {
      if (!isPhoneLike(text)) {
        await reply(ctx, copy.GUARD_PHONE, keyboards.contactPhoneKeyboard());
        return;
      }
      s.contact.value = text;
      pushHistory(s, 'user', `Контакт: ${text}`, MAX_HISTORY);
      await completeLead(ctx);
      return;
    }

    if (isStep(s, STEPS.CONTACT_TG)) {
      s.contact.value = text.startsWith('@') ? text : `@${text}`;
      pushHistory(s, 'user', `Контакт: ${s.contact.value}`, MAX_HISTORY);
      await completeLead(ctx);
      return;
    }

    if (isButtonOnlyStep(s.step)) {
      await handleButtonStepFreeText(ctx, text);
      return;
    }

    if (isStep(s, STEPS.GENERATING)) {
      await reply(ctx, 'Секунду, смотрю, что здесь главное ⏳');
      return;
    }

    if (isStep(s, STEPS.LEAD_DONE)) {
      await reply(ctx, 'Уже передала Евгении — скоро вернёмся 🔥');
    }
  });
}

module.exports = { registerHandlers };
