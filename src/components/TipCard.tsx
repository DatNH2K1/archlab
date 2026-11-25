import { Link } from '@/libs/I18nNavigation';

/**
 * Frames one quick-pick or trap group as a card with links to related lessons.
 * @param props Anchor id, domain label, title, optional intro, lesson links and the list.
 */
export const TipCard = (props: {
  id: string;
  label: string;
  title: string;
  intro?: string;
  lessons: { slug: string; title: string }[];
  children: React.ReactNode;
}) => (
  <section id={props.id} className="scroll-mt-20 rounded-xl border border-line bg-panel p-4">
    <p className="font-mono text-xs tracking-widest text-accent uppercase">{props.label}</p>
    <h3 className="mt-1 text-xl font-bold">{props.title}</h3>
    {props.intro && <p className="mt-1 text-sm text-muted">{props.intro}</p>}
    {props.children}
    {props.lessons.length > 0 && (
      <div className="mt-3 flex flex-wrap gap-1.5">
        {props.lessons.map((lesson) => (
          <Link key={lesson.slug} href={`/lessons/${lesson.slug}`} className="rounded-full border border-line px-2.5 py-0.5 text-xs text-muted hover:border-accent hover:text-chalk">
            📖 {lesson.title}
          </Link>
        ))}
      </div>
    )}
  </section>
);
