/** The ArchLab mark: three stacked layers of an architecture. */
export const LogoMark = (props: { className?: string }) => (
  <svg viewBox="0 0 64 64" className={props.className ?? 'size-7'} aria-hidden="true">
    <path d="M32 12 51 22 32 32 13 22Z" className="fill-accent" />
    <path
      d="M13 31l19 10 19-10M13 40l19 10 19-10"
      fill="none"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="stroke-accent"
    />
  </svg>
);

/** The logo with the app name. */
export const Logo = () => (
  <span className="flex items-center gap-2">
    <LogoMark />
    <span className="text-lg font-bold tracking-tight">
      Arch<span className="text-accent">Lab</span>
    </span>
  </span>
);
