const fs = require('fs');
const path = require('path');
const { OPENROUTER_MODEL, EVA_PROMPT_PATH } = require('./config');

const DATA_DIR = path.join(__dirname, '..', 'data');
const SETTINGS_PATH = path.join(DATA_DIR, 'settings.json');

const DEFAULT_SETTINGS = { model: '', prompt: '' };

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readSettingsFile() {
  ensureDataDir();
  if (!fs.existsSync(SETTINGS_PATH)) {
    fs.writeFileSync(SETTINGS_PATH, `${JSON.stringify(DEFAULT_SETTINGS, null, 2)}\n`, 'utf-8');
    return { ...DEFAULT_SETTINGS };
  }

  try {
    const parsed = JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf-8'));
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

let settings = readSettingsFile();

function getSettings() {
  return settings;
}

function saveSettings(partial) {
  settings = { ...settings, ...partial };
  ensureDataDir();
  fs.writeFileSync(SETTINGS_PATH, `${JSON.stringify(settings, null, 2)}\n`, 'utf-8');
  return settings;
}

function getActiveModel() {
  const custom = settings.model?.trim();
  return custom || OPENROUTER_MODEL;
}

function getActivePromptBase() {
  const custom = settings.prompt?.trim();
  if (custom) return custom;
  return fs.readFileSync(EVA_PROMPT_PATH, 'utf-8').trim();
}

function initSettings() {
  settings = readSettingsFile();
}

module.exports = {
  initSettings,
  getSettings,
  saveSettings,
  getActiveModel,
  getActivePromptBase,
};
