'use client';

import { useTranslations } from 'next-intl';
import { CATALOG, FLAT_PRICE, REQUEST_PRICE, SIZE_PRICE } from '@/game/catalog';
import type { ComponentType } from '@/game/types';
import { ComponentIcon } from './ComponentIcon';

const priceTag = (type: ComponentType, units: { month: string; per100: string }) => {
  const sized = SIZE_PRICE[type]?.small;

  if (type === 'dynamodb' || type === 'lambda' || type === 'apiGateway') {
    return `$${REQUEST_PRICE[type]}${units.per100}`;
  }

  return `$${sized ?? FLAT_PRICE[type] ?? 0}${units.month}`;
};

/**
 * Lists the components the player can drag onto the board.
 * @param props Available types, the new ones and the drag handler.
 */
export const Palette = (props: {
  types: ComponentType[];
  fresh: ComponentType[];
  /** Types already at their limit on the board. */
  full: ComponentType[];
  onDragStart: (type: ComponentType, event: React.PointerEvent) => void;
  onClear: () => void;
  disabled: boolean;
}) => {
  const t = useTranslations('Game');

  return (
    <section className="rounded-xl border border-line bg-panel/95 p-3 shadow-xl backdrop-blur">
      <h2 className="mb-2 font-mono text-[11px] font-bold tracking-widest text-muted uppercase">{t('components')}</h2>
      <div className="grid max-h-[46vh] grid-cols-2 gap-2 overflow-y-auto pt-2 pr-1">
        {props.types.map((type) => (
          <button
            key={type}
            type="button"
            disabled={props.disabled || props.full.includes(type)}
            title={props.full.includes(type) ? t('limit_short') : undefined}
            className="relative flex touch-none flex-col items-center gap-0.5 rounded-lg border border-chalk/70 px-2 py-2 text-center hover:border-accent hover:bg-panel-2 disabled:opacity-40"
            onPointerDown={(event) => props.onDragStart(type, event)}
          >
            {props.fresh.includes(type) && (
              <span className="absolute -top-2 -right-1 rounded-full bg-info px-1.5 font-mono text-[9px] font-bold text-ink">
                {t('new')}
              </span>
            )}
            <ComponentIcon type={type} className="size-5" />
            <span className="text-[13px] leading-tight font-bold">{CATALOG[type].label}</span>
            <span className="font-mono text-[10px] text-muted">{priceTag(type, { month: t('per_month'), per100: t('per_100') })}</span>
          </button>
        ))}
      </div>
      <button
        type="button"
        disabled={props.disabled}
        className="mt-3 w-full rounded-lg border border-line py-1.5 text-sm font-semibold hover:bg-panel-2 disabled:opacity-40"
        onClick={props.onClear}
      >
        {t('clear_board')}
      </button>
    </section>
  );
};
