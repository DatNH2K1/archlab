import { performanceCostComparisons } from './comparisons/performance-cost';
import { secureResilientComparisons } from './comparisons/secure-resilient';
import { performanceCostComparisonsEn } from './en/comparisons/performance-cost';
import { secureResilientComparisonsEn } from './en/comparisons/secure-resilient';
import { costFlashcardsEn } from './en/flashcards/cost';
import { performanceFlashcardsEn } from './en/flashcards/performance';
import { resilientFlashcardsEn } from './en/flashcards/resilient';
import { secureFlashcardsEn } from './en/flashcards/secure';
import { costLessonsEn } from './en/lessons/cost';
import { performanceLessonsEn } from './en/lessons/performance';
import { resilientLessonsEn } from './en/lessons/resilient';
import { secureLessonsEn } from './en/lessons/secure';
import { costQuestionsEn } from './en/questions/cost';
import { performanceQuestionsEn } from './en/questions/performance';
import { resilientQuestionsEn } from './en/questions/resilient';
import { secureQuestionsEn } from './en/questions/secure';
import { costFlashcards } from './flashcards/cost';
import { performanceFlashcards } from './flashcards/performance';
import { resilientFlashcards } from './flashcards/resilient';
import { secureFlashcards } from './flashcards/secure';
import { costLessons } from './lessons/cost';
import { performanceLessons } from './lessons/performance';
import { resilientLessons } from './lessons/resilient';
import { secureLessons } from './lessons/secure';
import { costQuestions } from './questions/cost';
import { performanceQuestions } from './questions/performance';
import { resilientQuestions } from './questions/resilient';
import { secureQuestions } from './questions/secure';
import type { Comparison, Flashcard, Lesson, Question } from './types';

const CONTENT = {
  vi: {
    lessons: [...secureLessons, ...resilientLessons, ...performanceLessons, ...costLessons],
    questions: [...secureQuestions, ...resilientQuestions, ...performanceQuestions, ...costQuestions],
    flashcards: [...secureFlashcards, ...resilientFlashcards, ...performanceFlashcards, ...costFlashcards],
    comparisons: [...secureResilientComparisons, ...performanceCostComparisons],
  },
  en: {
    lessons: [...secureLessonsEn, ...resilientLessonsEn, ...performanceLessonsEn, ...costLessonsEn],
    questions: [...secureQuestionsEn, ...resilientQuestionsEn, ...performanceQuestionsEn, ...costQuestionsEn],
    flashcards: [...secureFlashcardsEn, ...resilientFlashcardsEn, ...performanceFlashcardsEn, ...costFlashcardsEn],
    comparisons: [...secureResilientComparisonsEn, ...performanceCostComparisonsEn],
  },
};

const pick = (locale: string) => (locale === 'en' ? CONTENT.en : CONTENT.vi);

/**
 * Returns the lessons in a language.
 * @param locale The page locale.
 * @returns Lessons ordered by domain.
 */
export const getLessons = (locale: string): Lesson[] => pick(locale).lessons;

/**
 * Returns the practice questions in a language.
 * @param locale The page locale.
 * @returns Questions ordered by domain.
 */
export const getQuestions = (locale: string): Question[] => pick(locale).questions;

/**
 * Returns the flashcards in a language.
 * @param locale The page locale.
 * @returns Flashcards ordered by domain.
 */
export const getFlashcards = (locale: string): Flashcard[] => pick(locale).flashcards;

/**
 * Returns the comparisons of commonly confused services in a language.
 * @param locale The page locale.
 * @returns Comparisons ordered by domain.
 */
export const getComparisons = (locale: string): Comparison[] => pick(locale).comparisons;
