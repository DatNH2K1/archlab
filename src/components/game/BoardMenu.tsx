'use client';

export type BoardMenuItem = {
  key: string;
  label: string;
  hint: string;
  disabled: boolean;
  onClick: () => void;
};

/**
 * The right-click menu of the board, closed by any click outside it.
 * @param props Screen position, menu items and the close handler.
 */
export const BoardMenu = (props: {
  x: number;
  y: number;
  items: BoardMenuItem[];
  onClose: () => void;
}) => (
  <div
    className="fixed inset-0 z-40"
    onPointerDown={props.onClose}
    onContextMenu={(event) => {
      event.preventDefault();
    }}
  >
    <ul
      role="menu"
      className="fixed w-52 rounded-xl border border-line bg-panel/95 p-1 text-sm shadow-lg backdrop-blur"
      style={{
        left: Math.min(props.x, window.innerWidth - 216),
        top: Math.min(props.y, window.innerHeight - props.items.length * 34 - 16),
      }}
      onPointerDown={(event) => {
        event.stopPropagation();
      }}
    >
      {props.items.map((item) => (
        <li key={item.key} role="none">
          <button
            type="button"
            role="menuitem"
            disabled={item.disabled}
            className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-1.5 text-left hover:bg-panel-2 disabled:opacity-40 disabled:hover:bg-transparent"
            onClick={() => {
              item.onClick();
              props.onClose();
            }}
          >
            <span>{item.label}</span>
            <kbd className="font-mono text-xs text-muted">{item.hint}</kbd>
          </button>
        </li>
      ))}
    </ul>
  </div>
);
