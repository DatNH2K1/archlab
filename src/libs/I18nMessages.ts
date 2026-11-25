import type { Messages } from 'next-intl';

/** Namespaces read only by server pages, which pass resolved texts to client components as props. */
const SERVER_ONLY = new Set(['Questions', 'Flashcards', 'Comparisons', 'Tips', 'Traps']);

/**
 * Keeps the messages client components need, so long study texts stay out of every page payload.
 * @param messages All messages of the locale.
 * @returns UI and game messages, plus lesson titles without their bodies.
 */
export const pickClientMessages = (messages: Messages) => ({
  ...Object.fromEntries(Object.entries(messages).filter(([namespace]) => !SERVER_ONLY.has(namespace))),
  Lessons: Object.fromEntries(Object.entries(messages.Lessons).map(([slug, lesson]) => [slug, { title: lesson.title }])),
});
