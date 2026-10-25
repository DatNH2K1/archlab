'use client';

import { useTranslations } from 'next-intl';
import { CATALOG, defaultConfig } from '@/game/catalog';
import type { BoardNode, NodeTick } from '@/game/types';
import { ComponentIcon } from './ComponentIcon';

export const NODE_W = 150;
export const NODE_H = 70;
export const USERS_W = 120;
export const USERS_H = 96;

export type Side = 'top' | 'right' | 'bottom' | 'left';

/**
 * Returns the width and height a node takes on the board.
 * @param node The node.
 * @returns Its size in board pixels.
 */
export const nodeSize = (node: BoardNode) =>
  node.type === 'users' ? { w: USERS_W, h: USERS_H } : { w: NODE_W, h: NODE_H };

/**
 * Computes the position of one of the four connection dots of a node.
 * @param node The node.
 * @param side Which edge of the box.
 * @returns The dot center in board pixels.
 */
export const dotPosition = (node: BoardNode, side: Side) => {
  const { w, h } = nodeSize(node);

  switch (side) {
    case 'top':
      return { x: node.x + w / 2, y: node.y };
    case 'right':
      return { x: node.x + w, y: node.y + h / 2 };
    case 'bottom':
      return { x: node.x + w / 2, y: node.y + h };
    case 'left':
      return { x: node.x, y: node.y + h / 2 };
  }
};

const SIDES: Side[] = ['top', 'right', 'bottom', 'left'];

const utilColor = (util: number) => {
  if (util >= 1) {
    return 'bg-bad';
  }

  return util >= 0.75 ? 'bg-warn' : 'bg-good';
};

/** Builds the short settings line printed under the name of a node. */
const useSubtitle = (node: BoardNode) => {
  const t = useTranslations('Fields');
  const spec = CATALOG[node.type];
  const parts: string[] = [];
  const c = node.config;

  if (spec.fields.includes('size') && (node.type !== 'dynamodb' || c.provisioned)) {
    parts.push(t(`size_${c.size}`));
  }

  if (node.type === 'dynamodb') {
    parts.push(c.provisioned ? t('provisioned_dynamodb_short') : t('on_demand_short'));
  }

  if (spec.fields.includes('count')) {
    parts.push(c.autoScaling ? `ASG ${c.count}–${Math.max(c.maxCount, c.count)}` : `×${c.count}`);
  }

  return parts.join(' · ');
};

/** Lists the badges shown on a node for settings that matter in the exam. */
const useBadges = (node: BoardNode) => {
  const t = useTranslations('Fields');
  const tg = useTranslations('Game');
  const spec = CATALOG[node.type];
  const c = node.config;
  const badges: { label: string; tone: string }[] = [];

  if (spec.fields.includes('az') && node.type === 'ec2') {
    badges.push({ label: c.az === 'spread' ? 'AZ a+b' : `AZ ${c.az}`, tone: c.az === 'spread' ? 'text-good' : 'text-muted' });
  }

  if (node.type === 'readReplica') {
    badges.push({ label: `AZ ${c.az === 'b' ? 'b' : 'a'}`, tone: 'text-muted' });
  }

  if (spec.fields.includes('multiAz') && c.multiAz) {
    badges.push({ label: 'Multi-AZ', tone: 'text-good' });
  }

  if (spec.fields.includes('pricing') && c.pricing !== 'onDemand') {
    badges.push({ label: t(`pricing_${c.pricing}`), tone: 'text-info' });
  }

  if (spec.fields.includes('encrypted') && c.encrypted) {
    badges.push({ label: 'KMS', tone: 'text-accent' });
  }

  if (node.type === 'lambda' && c.provisioned) {
    badges.push({ label: 'PC', tone: 'text-info' });
  }

  if (node.type === 'cloudfront' && c.cacheApi) {
    badges.push({ label: tg('badge_api_cache'), tone: 'text-info' });
  }

  if (spec.fields.includes('region') && c.region !== defaultConfig(node.type).region) {
    badges.push({ label: c.region, tone: 'text-warn' });
  }

  return badges;
};

/**
 * Draws one component on the board with its live state during a run.
 * @param props The node, its state and the pointer handlers.
 */
export const NodeBox = (props: {
  node: BoardNode;
  selected: boolean;
  failing: boolean;
  live?: NodeTick;
  showDots: boolean;
  onPointerDown: (event: React.PointerEvent) => void;
  onDotPointerDown: (event: React.PointerEvent, side: Side) => void;
}) => {
  const t = useTranslations('Game');
  const subtitle = useSubtitle(props.node);
  const badges = useBadges(props.node);
  const { w, h } = nodeSize(props.node);
  const live = props.live;
  const down = live && !live.alive;
  const isUsers = props.node.type === 'users';

  return (
    <div
      data-node-id={props.node.id}
      className="group absolute touch-none select-none"
      style={{ left: props.node.x, top: props.node.y, width: w, height: h }}
      onPointerDown={props.onPointerDown}
    >
      {props.failing && (
        <div className="pulse-ring pointer-events-none absolute -inset-4 rounded-[50%] border-2 border-bad" />
      )}
      {isUsers ? (
        <div className="flex size-full cursor-grab flex-col items-center justify-center gap-1 text-chalk">
          <ComponentIcon type="users" className="size-14" />
          <span className="text-base font-bold">{t('users')}</span>
        </div>
      ) : (
        <div
          className={`relative flex size-full cursor-grab flex-col justify-center overflow-hidden rounded-lg border-2 bg-panel px-3 py-1.5 transition-colors ${
            props.selected ? 'border-accent' : down ? 'border-dashed border-muted' : 'border-chalk/80'
          } ${down ? 'opacity-50' : ''}`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-[15px] leading-tight font-bold">
              {CATALOG[props.node.type].label}
            </span>
            <ComponentIcon type={props.node.type} className="size-5 shrink-0 text-chalk/80" />
          </div>
          {subtitle && <div className="truncate font-mono text-[10px] text-muted">{subtitle}</div>}
          <div className="flex gap-1.5 overflow-hidden font-mono text-[9px] leading-tight">
            {badges.map((badge) => (
              <span key={badge.label} className={badge.tone}>
                {badge.label}
              </span>
            ))}
          </div>
          {live && !down && (
            <div className="absolute inset-x-0 bottom-0 h-1 bg-line">
              <div className={`h-full ${utilColor(live.util)}`} style={{ width: `${Math.min(100, live.util * 100)}%` }} />
            </div>
          )}
          {down && (
            <span className="absolute top-1 right-8 rounded bg-bad px-1 font-mono text-[9px] font-bold text-ink">
              {t('down')}
            </span>
          )}
          {live?.backlog !== undefined && live.backlog > 1 && (
            <span className="absolute top-1 right-8 rounded bg-warn px-1 font-mono text-[9px] font-bold text-ink">
              {t('backlog', { count: Math.round(live.backlog) })}
            </span>
          )}
        </div>
      )}
      {SIDES.map((side) => {
        const dot = dotPosition({ ...props.node, x: 0, y: 0 }, side);

        return (
          <button
            key={side}
            type="button"
            data-dot={side}
            aria-label={t('connect_from')}
            className={`group/dot absolute grid size-6 -translate-1/2 cursor-crosshair place-items-center transition-opacity ${
              props.showDots || props.selected ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'
            }`}
            style={{ left: dot.x, top: dot.y }}
            onPointerDown={(event) => props.onDotPointerDown(event, side)}
          >
            <span className="size-3 rounded-full border-2 border-chalk bg-ink group-hover/dot:scale-125 group-hover/dot:bg-accent" />
          </button>
        );
      })}
    </div>
  );
};
