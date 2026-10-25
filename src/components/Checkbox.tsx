/**
 * Draws a themed checkbox with a label, keeping the native input for keyboard and screen readers.
 * @param props The label, checked state, change handler and whether the box sits after the label.
 */
export const Checkbox = (props: {
  label: React.ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  boxAfter?: boolean;
  className?: string;
}) => (
  <label
    className={`flex cursor-pointer gap-2 has-disabled:cursor-not-allowed has-disabled:opacity-50 ${
      props.boxAfter ? 'flex-row-reverse items-start justify-between gap-3' : 'items-center'
    } ${props.className ?? ''}`}
  >
    <span className={`relative grid size-4 shrink-0 place-items-center ${props.boxAfter ? 'mt-1' : ''}`}>
      <input
        type="checkbox"
        className="peer size-4 cursor-pointer appearance-none rounded border border-line bg-ink transition-colors checked:border-accent checked:bg-accent hover:border-accent/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed"
        checked={props.checked}
        disabled={props.disabled}
        onChange={(event) => props.onChange(event.target.checked)}
      />
      <svg viewBox="0 0 16 16" aria-hidden="true" className="pointer-events-none absolute size-3 text-ink opacity-0 peer-checked:opacity-100">
        <path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
    {props.label}
  </label>
);
