/** SAA-C03 exam domains with their official weight. */
export const DOMAINS = {
  secure: { code: 'D1', weight: 30 },
  resilient: { code: 'D2', weight: 26 },
  performance: { code: 'D3', weight: 24 },
  cost: { code: 'D4', weight: 20 },
} as const;

export type DomainId = keyof typeof DOMAINS;

/** A study lesson rendered from Markdown (GitHub-flavored, tables allowed). */
export type Lesson = {
  slug: string;
  domain: DomainId;
  title: string;
  /** One or two sentences shown on the lesson card. */
  summary: string;
  /** AWS services covered, used for search and tags. */
  services: string[];
  /** Estimated reading time in minutes. */
  minutes: number;
  /** Lesson body in Markdown. Use `##` and `###` headings, lists and tables. */
  body: string;
  /** Exam keywords: when the question says `trigger`, think `answer`. */
  keywords: { trigger: string; answer: string }[];
  /** Common traps and distractors seen in the exam. */
  traps: string[];
};

/** A practice exam question, written in English like the real exam. */
export type Question = {
  id: string;
  domain: DomainId;
  /** Slug of the lesson that explains this topic. */
  lesson: string;
  stem: string;
  options: string[];
  /** Indexes of the correct options. More than one means "Choose TWO/THREE". */
  answer: number[];
  /** Why the correct answer is right and the others are wrong (Vietnamese). */
  explanation: string;
};

/** A flashcard for spaced review. */
export type Flashcard = {
  id: string;
  domain: DomainId;
  front: string;
  back: string;
};

/** A side-by-side comparison of services that the exam likes to mix up. */
export type Comparison = {
  id: string;
  domain: DomainId;
  title: string;
  /** Why these services get confused, in one or two sentences. */
  summary: string;
  /** Column headers: the services or options compared. */
  services: string[];
  /** One row per aspect; `values` follows the order of `services`. */
  rows: { aspect: string; values: string[] }[];
  /** When to pick each one; same order as `services`. */
  pick: string[];
  /** Phrases in a question that point to one answer. */
  keywords: { trigger: string; answer: string }[];
  /** Slugs of lessons with more detail. */
  lessons: string[];
};
