import { AppMenu } from './AppMenu';
import { LocaleSwitcher } from './LocaleSwitcher';

/**
 * Frames a reading page with the menu and language switch.
 * @param props Page title and content.
 */
export const PageShell = (props: { title: string; children: React.ReactNode }) => (
  <div className="min-h-dvh">
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-ink/90 px-4 py-2.5 backdrop-blur">
      <AppMenu title={props.title} />
      <LocaleSwitcher />
    </header>
    <main className="mx-auto w-full max-w-4xl px-4 py-8">{props.children}</main>
  </div>
);
