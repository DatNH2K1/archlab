'use client';

import { useTranslations } from 'next-intl';
import { normalizeGlossaryKey } from '@/content/glossary';

/**
 * Renders an acronym term with an accessible interactive tooltip localized via next-intl.
 * @param props The term key and optional children.
 * @returns An interactive abbreviation with definition preview.
 */
export const TermTooltip = (props: { term: string; children?: React.ReactNode }) => {
  const t = useTranslations('Glossary');
  const key = normalizeGlossaryKey(props.term);

  if (!key) {
    return props.children ?? props.term;
  }

  const name = t(`${key}.name`);
  const desc = t(`${key}.desc`);

  return (
    <span className="group relative inline-block">
      <abbr
        className="cursor-help font-semibold text-chalk underline decoration-accent/60 decoration-dotted underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
        title={`${props.term} (${name}): ${desc}`}
      >
        {props.children ?? props.term}
      </abbr>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 hidden w-64 -translate-x-1/2 rounded-lg border border-line bg-panel p-2.5 text-left text-xs font-normal tracking-normal text-chalk normal-case shadow-2xl backdrop-blur group-focus-within:block group-hover:block"
      >
        <span className="block font-mono font-bold text-accent">
          {props.term} <span className="text-[11px] font-normal text-muted">({name})</span>
        </span>
        <span className="mt-1 block leading-snug text-chalk/90">{desc}</span>
        <span className="absolute top-full left-1/2 -mt-px -translate-x-1/2 border-4 border-transparent border-t-line" />
      </span>
    </span>
  );
};
