import { Link } from '@/libs/I18nNavigation';

/**
 * Returns from a detail page to its list.
 * @param props The list page and its accessible label.
 */
export const BackLink = (props: { href: string; label: string }) => (
  <Link
    href={props.href}
    title={props.label}
    aria-label={props.label}
    className="grid size-[34px] shrink-0 place-items-center rounded-lg border border-line bg-panel hover:bg-panel-2"
  >
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4" aria-hidden="true">
      <path d="M19 12H5M11 6l-6 6 6 6" />
    </svg>
  </Link>
);
