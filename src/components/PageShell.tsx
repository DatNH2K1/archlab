import { AppMenu } from './AppMenu';
import { BackLink } from './BackLink';
import { LocaleSwitcher } from './LocaleSwitcher';

/**
 * Frames a reading page with the menu and language switch.
 * @param props Page title, optional link back to a list page, and content.
 */
export const PageShell = (props: { title: string; back?: { href: string; label: string }; children: React.ReactNode }) => (
  <div className="min-h-dvh">
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-ink/90 px-4 py-2.5 backdrop-blur">
      <div className="flex items-center gap-2">
        {props.back && <BackLink href={props.back.href} label={props.back.label} />}
        <AppMenu title={props.title} />
      </div>
      <LocaleSwitcher />
    </header>
    <main className="mx-auto w-full max-w-4xl px-4 py-8">{props.children}</main>
  </div>
);
