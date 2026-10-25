// Copies lesson titles from src/content into the LessonTitles namespace of both locale files.
// Run after adding or renaming a lesson: node scripts/sync-lesson-titles.mjs
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';

const LESSON = /slug: '([^']+)',\s*\n\s*domain: '[^']+',\s*\n\s*title: '((?:[^'\\]|\\.)*)'/gu;

const titles = (folder) => {
  const out = {};

  for (const file of readdirSync(folder).filter((name) => name.endsWith('.ts')).sort()) {
    for (const match of readFileSync(`${folder}/${file}`, 'utf8').matchAll(LESSON)) {
      out[match[1]] = match[2].replaceAll("\\'", "'");
    }
  }

  return out;
};

const sources = { vi: titles('src/content/lessons'), en: titles('src/content/en/lessons') };
const missing = Object.keys(sources.vi).filter((slug) => !(slug in sources.en));

if (missing.length > 0) {
  throw new Error(`Lessons without an English version: ${missing.join(', ')}`);
}

for (const [locale, lessonTitles] of Object.entries(sources)) {
  const path = `src/locales/${locale}.json`;
  const messages = JSON.parse(readFileSync(path, 'utf8'));

  messages.LessonTitles = lessonTitles;
  writeFileSync(path, `${JSON.stringify(messages, null, 2)}\n`);
}

console.log(`Synced ${Object.keys(sources.vi).length} lesson titles`);
