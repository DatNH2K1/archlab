'use client';

import { useTranslations } from 'next-intl';
import { updateProgress, useProgress } from '@/libs/Progress';

/**
 * Shows a check mark when a lesson was read.
 * @param props The lesson slug.
 */
export const LessonReadBadge = (props: { slug: string }) => {
  const progress = useProgress();
  const t = useTranslations('LessonsPage');

  return progress.lessonsRead.includes(props.slug) ? (
    <span className="shrink-0 rounded-full bg-good/20 px-2 text-xs text-good">✓ {t('read')}</span>
  ) : null;
};

/**
 * Marks a lesson as read or unread.
 * @param props The lesson slug.
 */
export const MarkReadButton = (props: { slug: string }) => {
  const progress = useProgress();
  const t = useTranslations('LessonsPage');
  const read = progress.lessonsRead.includes(props.slug);

  return (
    <button
      type="button"
      className={`rounded-lg px-4 py-2 font-semibold ${read ? 'border border-good text-good' : 'bg-accent text-ink'}`}
      onClick={() =>
        updateProgress((old) => ({
          ...old,
          lessonsRead: read ? old.lessonsRead.filter((slug) => slug !== props.slug) : [...old.lessonsRead, props.slug],
        }))
      }
    >
      {read ? `✓ ${t('read')}` : t('mark_read')}
    </button>
  );
};
