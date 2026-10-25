'use client';

import { useId, useState } from 'react';

type SelectOption<T extends string> = { value: T; label: string };

/**
 * Draws a themed dropdown that opens a listbox under its button.
 * @param props The label, options, selected value and change handler.
 */
export const Select = <T extends string>(props: {
  label: string;
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  disabled?: boolean;
}) => {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const selected = props.options.find((option) => option.value === props.value);

  const show = () => {
    setActive(Math.max(0, props.options.findIndex((option) => option.value === props.value)));
    setOpen(true);
  };

  const pick = (option: SelectOption<T> | undefined) => {
    if (option) {
      props.onChange(option.value);
    }

    setOpen(false);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    const last = props.options.length - 1;

    if (event.key === 'Escape' || event.key === 'Tab') {
      setOpen(false);

      return;
    }

    if (!['ArrowDown', 'ArrowUp', 'Enter', ' ', 'Home', 'End'].includes(event.key)) {
      return;
    }

    event.preventDefault();

    if (!open) {
      show();

      return;
    }

    if (event.key === 'ArrowDown') {
      setActive(Math.min(last, active + 1));
    } else if (event.key === 'ArrowUp') {
      setActive(Math.max(0, active - 1));
    } else if (event.key === 'Home') {
      setActive(0);
    } else if (event.key === 'End') {
      setActive(last);
    } else {
      pick(props.options[active]);
    }
  };

  return (
    <div
      className="relative"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setOpen(false);
        }
      }}
    >
      <span id={`${id}-label`} className="block">
        {props.label}
      </span>
      <button
        type="button"
        role="combobox"
        aria-labelledby={`${id}-label`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-activedescendant={open ? `${id}-${active}` : undefined}
        disabled={props.disabled}
        className={`mt-1 flex w-full items-center justify-between gap-2 rounded-lg border bg-ink px-2.5 py-1.5 text-left transition-colors hover:border-accent/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50 ${
          open ? 'border-accent' : 'border-line'
        }`}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={onKeyDown}
      >
        <span className="truncate">{selected?.label}</span>
        <svg viewBox="0 0 16 16" aria-hidden="true" className={`size-3.5 shrink-0 text-muted transition-transform ${open ? 'rotate-180' : ''}`}>
          <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <ul
          id={`${id}-list`}
          role="listbox"
          aria-labelledby={`${id}-label`}
          tabIndex={-1}
          className="absolute inset-x-0 top-full z-20 mt-1 max-h-60 overflow-y-auto rounded-lg border border-line bg-panel p-1 shadow-xl"
        >
          {props.options.map((option, index) => (
            <li
              key={option.value}
              id={`${id}-${index}`}
              role="option"
              aria-selected={option.value === props.value}
              className={`flex cursor-pointer items-center justify-between rounded-md px-2 py-1.5 ${
                index === active ? 'bg-panel-2' : ''
              } ${option.value === props.value ? 'font-semibold text-accent' : ''}`}
              onMouseEnter={() => setActive(index)}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => pick(option)}
            >
              {option.label}
              {option.value === props.value && <span aria-hidden="true">✓</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
