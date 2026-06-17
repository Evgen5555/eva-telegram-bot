const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const STATS_PATH = path.join(DATA_DIR, 'stats.json');
const LEADS_PATH = path.join(DATA_DIR, 'leads.json');

const DEFAULT_STATS = {
  userIds: [],
  conceptsCount: 0,
};

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readJson(pathToFile, fallback) {
  ensureDataDir();
  if (!fs.existsSync(pathToFile)) {
    fs.writeFileSync(pathToFile, `${JSON.stringify(fallback, null, 2)}\n`, 'utf-8');
    return JSON.parse(JSON.stringify(fallback));
  }

  try {
    return JSON.parse(fs.readFileSync(pathToFile, 'utf-8'));
  } catch {
    return JSON.parse(JSON.stringify(fallback));
  }
}

function writeJson(pathToFile, data) {
  ensureDataDir();
  fs.writeFileSync(pathToFile, `${JSON.stringify(data, null, 2)}\n`, 'utf-8');
}

function loadStats() {
  return readJson(STATS_PATH, DEFAULT_STATS);
}

function saveStats(stats) {
  writeJson(STATS_PATH, stats);
}

function loadLeads() {
  return readJson(LEADS_PATH, []);
}

function saveLeads(leads) {
  writeJson(LEADS_PATH, leads);
}

function trackUser(userId) {
  const stats = loadStats();
  const id = Number(userId);
  if (!stats.userIds.includes(id)) {
    stats.userIds.push(id);
    saveStats(stats);
  }
}

function trackConcept() {
  const stats = loadStats();
  stats.conceptsCount += 1;
  saveStats(stats);
}

function addLead({ ctx, session }) {
  const user = ctx.from;
  const name = [user.first_name, user.last_name].filter(Boolean).join(' ') || '—';
  const username = user.username ? `@${user.username}` : '—';
  const contact = session.contact;

  const lead = {
    id: `${user.id}-${Date.now()}`,
    userId: user.id,
    name,
    username,
    direction: session.directionLabel || '—',
    contactType: contact.type || '—',
    contactValue: contact.value || '—',
    createdAt: new Date().toISOString(),
  };

  const leads = loadLeads();
  leads.push(lead);
  saveLeads(leads);
  return lead;
}

function getStatsSummary() {
  const stats = loadStats();
  const leads = loadLeads();

  return {
    usersCount: stats.userIds.length,
    conceptsCount: stats.conceptsCount,
    leadsCount: leads.length,
  };
}

function getRecentLeads(limit = 10) {
  const leads = loadLeads();
  return leads.slice(-limit).reverse();
}

module.exports = {
  trackUser,
  trackConcept,
  addLead,
  getStatsSummary,
  getRecentLeads,
};
