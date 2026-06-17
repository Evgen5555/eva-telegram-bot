const {
  STEPS,
  DIRECTION,
  BTN,
  DIR_MAP,
  DIR_BUTTONS,
  BRANCH_Q1,
  BRANCH_Q2,
  BRANCH_Q3,
} = require('./constants');
const copy = require('./copy');

function getInterpretContext(session) {
  const { step, direction, ideaIntent, firstName, directionLabel } = session;

  if (step === STEPS.MENU) {
    return {
      step: 'menu',
      userName: firstName,
      message: 'Пользователь в главном меню. Может исправить имя или выбрать направление.',
      directions: DIR_BUTTONS.map((btn) => ({
        id: DIR_MAP[btn].id,
        label: btn,
      })),
    };
  }

  if (step === STEPS.Q1 && direction) {
    return {
      step: 'q1',
      direction,
      directionLabel,
      question: copy.QUESTIONS[direction].q1,
      buttons: BRANCH_Q1[direction],
    };
  }

  if (step === STEPS.Q2 && direction) {
    return {
      step: 'q2',
      direction,
      directionLabel,
      question: copy.QUESTIONS[direction].q2,
      buttons: BRANCH_Q2[direction],
    };
  }

  if (step === STEPS.Q3 && direction) {
    return {
      step: 'q3',
      direction,
      directionLabel,
      question: copy.QUESTIONS[direction].q3,
      buttons: BRANCH_Q3[direction],
    };
  }

  if (step === STEPS.CTA) {
    return {
      step: 'cta',
      userName: firstName,
      message: 'Пользователь выбирает способ связи.',
      options: [
        { id: 'phone', label: BTN.CALL },
        { id: 'telegram', label: BTN.TELEGRAM },
      ],
    };
  }

  if (step === STEPS.CONCEPT) {
    return {
      step: 'concept',
      message:
        'Пользователь видит сгенерированный конcept. Ответь кратко на вопрос или предложи нажать «Обсудить реализацию».',
    };
  }

  return null;
}

const BUTTON_ONLY_STEPS = new Set([
  STEPS.MENU,
  STEPS.Q1,
  STEPS.Q2,
  STEPS.Q3,
  STEPS.CTA,
  STEPS.CONCEPT,
]);

function isButtonOnlyStep(step) {
  return BUTTON_ONLY_STEPS.has(step);
}

module.exports = { getInterpretContext, isButtonOnlyStep };
