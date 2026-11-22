import { getMessages } from 'next-intl/server';
import { COMPARISONS } from './comparisons';
import { FLASHCARDS } from './flashcards';
import { LESSONS } from './lessons';
import { costQuestions } from './questions/cost';
import { performanceQuestions } from './questions/performance';
import { resilientQuestions } from './questions/resilient';
import { secureQuestions } from './questions/secure';
import type { Comparison, Flashcard, Lesson, Question } from './types';

const QUESTIONS = [...secureQuestions, ...resilientQuestions, ...performanceQuestions, ...costQuestions];

/** Slugs of every lesson, for static params. */
export const LESSON_SLUGS = LESSONS.map((lesson) => lesson.slug);

/**
 * Returns the lessons in a language.
 * @param locale The page locale.
 * @returns Lessons ordered by domain.
 */
export const getLessons = async (locale: string): Promise<Lesson[]> => {
  const messages = await getMessages({ locale });

  return LESSONS.map((lesson) => ({ ...lesson, ...messages.Lessons[lesson.slug] }));
};

/**
 * Returns the practice questions in a language.
 * @param locale The page locale.
 * @returns Questions ordered by domain.
 */
export const getQuestions = async (locale: string): Promise<Question[]> => {
  const messages = await getMessages({ locale });

  return QUESTIONS.map((question) => ({ ...question, ...messages.Questions[question.id] }));
};

/**
 * Returns the flashcards in a language.
 * @param locale The page locale.
 * @returns Flashcards ordered by domain.
 */
export const getFlashcards = async (locale: string): Promise<Flashcard[]> => {
  const messages = await getMessages({ locale });

  return FLASHCARDS.map((card) => ({ ...card, ...messages.Flashcards[card.id] }));
};

/**
 * Returns the comparisons of commonly confused services in a language.
 * @param locale The page locale.
 * @returns Comparisons ordered by domain.
 */
export const getComparisons = async (locale: string): Promise<Comparison[]> => {
  const messages = await getMessages({ locale });

  return COMPARISONS.map((comparison) => ({ ...comparison, ...messages.Comparisons[comparison.id] }));
};

/** Number of lessons, questions and flashcards, the same in every language. */
export const CONTENT_COUNTS = { lessons: LESSONS.length, questions: QUESTIONS.length, flashcards: FLASHCARDS.length };
