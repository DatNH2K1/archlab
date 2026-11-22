import type { Messages } from 'next-intl';

/** SAA-C03 exam domains with their official weight. */
export const DOMAINS = {
  secure: { code: 'D1', weight: 30 },
  resilient: { code: 'D2', weight: 26 },
  performance: { code: 'D3', weight: 24 },
  cost: { code: 'D4', weight: 20 },
} as const;

export type DomainId = keyof typeof DOMAINS;

/** Lesson slugs, taken from the locale files. */
export type LessonSlug = keyof Messages['Lessons'];

/** The language-neutral part of a lesson; texts live in the `Lessons` namespace. */
export type LessonData = {
  slug: LessonSlug;
  domain: DomainId;
  /** AWS services covered, used for search and tags. */
  services: string[];
  /** Estimated reading time in minutes. */
  minutes: number;
};

/** A study lesson rendered from Markdown (GitHub-flavored, tables allowed). */
export type Lesson = LessonData & {
  title: string;
  /** One or two sentences shown on the lesson card. */
  summary: string;
  /** Lesson body in Markdown. Use `##` and `###` headings, lists and tables. */
  body: string;
  /** Exam keywords: when the question says `trigger`, think `answer`. */
  keywords: { trigger: string; answer: string }[];
  /** Common traps and distractors seen in the exam. */
  traps: string[];
};

/** A practice exam question, written in English like the real exam in every locale. */
export type QuestionData = {
  id: keyof Messages['Questions'];
  domain: DomainId;
  /** Slug of the lesson that explains this topic. */
  lesson: LessonSlug;
  stem: string;
  options: string[];
  /** Indexes of the correct options. More than one means "Choose TWO/THREE". */
  answer: number[];
};

/** A practice exam question with its explanation in the page language. */
export type Question = QuestionData & {
  /** Why the correct answer is right and the others are wrong. */
  explanation: string;
};

/** The language-neutral part of a flashcard; texts live in the `Flashcards` namespace. */
export type FlashcardData = {
  id: keyof Messages['Flashcards'];
  domain: DomainId;
};

/** A flashcard for spaced review. */
export type Flashcard = FlashcardData & {
  front: string;
  back: string;
};

/** The language-neutral part of a comparison; texts live in the `Comparisons` namespace. */
export type ComparisonData = {
  id: keyof Messages['Comparisons'];
  domain: DomainId;
  /** Column headers: the services or options compared. */
  services: string[];
  /** Slugs of lessons with more detail. */
  lessons: LessonSlug[];
};

/** A side-by-side comparison of services that the exam likes to mix up. */
export type Comparison = ComparisonData & {
  title: string;
  /** Why these services get confused, in one or two sentences. */
  summary: string;
  /** One row per aspect; `values` follows the order of `services`. */
  rows: { aspect: string; values: string[] }[];
  /** When to pick each one; same order as `services`. */
  pick: string[];
  /** Optional fenced diagram block in lesson Markdown syntax, shown above the table. */
  diagram?: string;
  /** Phrases in a question that point to one answer. */
  keywords: { trigger: string; answer: string }[];
};
