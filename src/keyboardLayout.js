const EN_TO_RU = {
  '`': 'ё',
  '~': 'Ё',
  q: 'й',
  w: 'ц',
  e: 'у',
  r: 'к',
  t: 'е',
  y: 'н',
  u: 'г',
  i: 'ш',
  o: 'щ',
  p: 'з',
  '[': 'х',
  ']': 'ъ',
  a: 'ф',
  s: 'ы',
  d: 'в',
  f: 'а',
  g: 'п',
  h: 'р',
  j: 'о',
  k: 'л',
  l: 'д',
  ';': 'ж',
  "'": 'э',
  z: 'я',
  x: 'ч',
  c: 'с',
  v: 'м',
  b: 'и',
  n: 'т',
  m: 'ь',
  ',': 'б',
  '.': 'ю',
  Q: 'Й',
  W: 'Ц',
  E: 'У',
  R: 'К',
  T: 'Е',
  Y: 'Н',
  U: 'Г',
  I: 'Ш',
  O: 'Щ',
  P: 'З',
  '{': 'Х',
  '}': 'Ъ',
  A: 'Ф',
  S: 'Ы',
  D: 'В',
  F: 'А',
  G: 'П',
  H: 'Р',
  J: 'О',
  K: 'Л',
  L: 'Д',
  ':': 'Ж',
  '"': 'Э',
  Z: 'Я',
  X: 'Ч',
  C: 'С',
  V: 'М',
  B: 'И',
  N: 'Т',
  M: 'Ь',
  '<': 'Б',
  '>': 'Ю',
};

const CYRILLIC_RE = /[а-яёА-ЯЁ]/;
const LATIN_RE = /[a-zA-Z]/;
const LAYOUT_HINT_RE = /[\[\];',.`]/;

function hasCyrillic(text) {
  return CYRILLIC_RE.test(text);
}

function fromEnLayout(text) {
  return [...text].map((ch) => EN_TO_RU[ch] ?? ch).join('');
}

function cyrillicRatio(text) {
  const letters = text.replace(/\s/g, '');
  if (!letters.length) return 0;
  const cyrillicCount = (letters.match(/[а-яёА-ЯЁ]/g) || []).length;
  return cyrillicCount / letters.length;
}

function looksLikeWrongLayout(text) {
  if (hasCyrillic(text) || !LATIN_RE.test(text)) return false;
  if (LAYOUT_HINT_RE.test(text)) return true;

  const converted = fromEnLayout(text);
  return hasCyrillic(converted) && cyrillicRatio(converted) >= 0.7;
}

function fixKeyboardLayout(text) {
  if (!text || !looksLikeWrongLayout(text)) {
    return { text, wasFixed: false };
  }

  const converted = fromEnLayout(text);
  if (!hasCyrillic(converted) || cyrillicRatio(converted) < 0.7) {
    return { text, wasFixed: false };
  }

  return { text: converted, wasFixed: true };
}

module.exports = { fixKeyboardLayout };
