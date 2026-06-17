const { Markup } = require('telegraf');
const { BTN, BRANCH_Q1, BRANCH_Q2, BRANCH_Q3 } = require('./constants');

function mainMenuKeyboard() {
  return Markup.keyboard([
    [BTN.DIR_BOT, BTN.DIR_SITE],
    [BTN.DIR_AGENT, BTN.DIR_FUNNEL],
    [BTN.DIR_MARKETING, BTN.DIR_DESIGN],
    [BTN.DIR_IDEA],
  ]).resize();
}

function branchKeyboard(direction, questionNum) {
  const rows = {
    q1: BRANCH_Q1[direction],
    q2: BRANCH_Q2[direction],
    q3: BRANCH_Q3[direction],
  }[questionNum];

  if (!rows) return mainMenuKeyboard();

  const pairs = [];
  for (let i = 0; i < rows.length; i += 2) {
    pairs.push(rows.slice(i, i + 2));
  }
  pairs.push([BTN.BACK_MENU]);
  return Markup.keyboard(pairs).resize();
}

function ideaTextKeyboard() {
  return Markup.keyboard([[BTN.BACK_MENU]]).resize();
}

function conceptKeyboard() {
  return Markup.keyboard([[BTN.DISCUSS]]).resize();
}

function ctaKeyboard() {
  return Markup.keyboard([
    [BTN.CALL, BTN.TELEGRAM],
    [BTN.BACK_MENU],
  ]).resize();
}

function contactPhoneKeyboard() {
  return Markup.keyboard([[BTN.BACK_MENU]]).resize();
}

function contactTgKeyboard() {
  return Markup.keyboard([[BTN.TG_HERE], [BTN.BACK_MENU]]).resize();
}

function removeKeyboard() {
  return Markup.removeKeyboard();
}

module.exports = {
  mainMenuKeyboard,
  branchKeyboard,
  ideaTextKeyboard,
  conceptKeyboard,
  ctaKeyboard,
  contactPhoneKeyboard,
  contactTgKeyboard,
  removeKeyboard,
};
