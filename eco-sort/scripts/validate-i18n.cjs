const fs = require('fs');
const raw = fs.readFileSync('./src/i18n/translations.js', 'utf8')
  .replace(/export const translations /g, 'global.translations ')
  .replace(/export const extraTranslations /g, 'global.extraTranslations ')
  .replace(/export const LANGUAGES /g, 'global.LANGUAGES ')
  .replace(/export function/g, 'function');
eval(raw);
const langs = ['en', 'hi', 'hinglish', 'ur'];
const all = new Set();
for (const lang of langs) {
  Object.keys(global.translations?.[lang] || {}).forEach((k) => all.add(k));
  Object.keys(global.extraTranslations?.[lang] || {}).forEach((k) => all.add(k));
}
let failed = false;
for (const lang of langs) {
  const merged = { ...(global.translations?.[lang] || {}), ...(global.extraTranslations?.[lang] || {}) };
  const missing = [...all].filter((k) => !(k in merged));
  if (missing.length) {
    failed = true;
    console.error(lang, 'missing', missing.join(', '));
  }
}
console.log(`Checked ${all.size} translation keys for ${langs.length} languages.`);
if (failed) process.exit(1);
