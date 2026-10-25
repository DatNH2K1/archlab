'use client';

import { useTranslations } from 'next-intl';
import { Checkbox } from '@/components/Checkbox';
import { CAPACITY, CATALOG, SIZES } from '@/game/catalog';
import type { BoardNode, ComponentType, NodeConfig } from '@/game/types';
import { REGIONS } from '@/game/types';
import { Link } from '@/libs/I18nNavigation';
import { ComponentIcon } from './ComponentIcon';

/** Lesson that explains each component. */
export const COMPONENT_LESSON: Record<ComponentType, string> = {
  users: 'high-availability-multi-az',
  route53: 'route53-routing',
  globalAccelerator: 'edge-networking',
  waf: 'threat-detection-waf-shield',
  cloudfront: 'edge-networking',
  alb: 'elastic-load-balancing',
  apiGateway: 'serverless-workflows',
  ec2: 'ec2-compute',
  lambda: 'serverless-workflows',
  elasticache: 'nosql-caching',
  rds: 'relational-databases',
  aurora: 'relational-databases',
  readReplica: 'relational-databases',
  dynamodb: 'nosql-caching',
  s3: 's3-performance',
  sqs: 'decoupling-messaging',
  sns: 'decoupling-messaging',
};

const Segmented = <T extends string>(props: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  disabled: boolean;
}) => (
  <div>
    <div className="mb-1 text-[11px] font-bold tracking-wider text-muted uppercase">{props.label}</div>
    <div className="flex rounded-lg border border-line p-0.5">
      {props.options.map((option) => (
        <button
          key={option.value}
          type="button"
          disabled={props.disabled}
          aria-pressed={option.value === props.value}
          className={`flex-1 rounded-md px-1.5 py-1 text-xs font-semibold ${
            option.value === props.value ? 'bg-accent text-ink' : 'text-chalk/80 hover:bg-panel-2'
          }`}
          onClick={() => props.onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  </div>
);

const Toggle = (props: { label: string; hint?: string; value: boolean; onChange: (value: boolean) => void; disabled: boolean }) => (
  <Checkbox
    boxAfter
    label={
      <span>
        <span className="block text-sm font-semibold">{props.label}</span>
        {props.hint && <span className="block text-xs text-muted">{props.hint}</span>}
      </span>
    }
    checked={props.value}
    disabled={props.disabled}
    onChange={props.onChange}
  />
);

const Stepper = (props: { label: string; value: number; min: number; max: number; onChange: (value: number) => void; disabled: boolean }) => (
  <div className="flex items-center justify-between">
    <span className="text-sm font-semibold">{props.label}</span>
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={props.disabled || props.value <= props.min}
        className="size-7 rounded-md border border-line font-bold disabled:opacity-30"
        onClick={() => props.onChange(props.value - 1)}
        aria-label="−"
      >
        −
      </button>
      <span className="w-5 text-center font-mono">{props.value}</span>
      <button
        type="button"
        disabled={props.disabled || props.value >= props.max}
        className="size-7 rounded-md border border-line font-bold disabled:opacity-30"
        onClick={() => props.onChange(props.value + 1)}
        aria-label="+"
      >
        +
      </button>
    </div>
  </div>
);

/**
 * Shows and edits the settings of the selected component.
 * @param props The node, its monthly cost and change handlers.
 */
export const Inspector = (props: {
  node: BoardNode;
  cost: number;
  locked: boolean;
  onChange: (config: Partial<NodeConfig>) => void;
  onDelete: () => void;
  onClose: () => void;
}) => {
  const t = useTranslations('Fields');
  const tc = useTranslations('Components');
  const tg = useTranslations('Game');
  const { node } = props;
  const spec = CATALOG[node.type];
  const has = (field: (typeof spec.fields)[number]) => spec.fields.includes(field);
  const c = node.config;
  const capacity = CAPACITY[node.type];

  return (
    <section className="max-h-[calc(100dvh-7rem)] overflow-y-auto rounded-xl border border-line bg-panel/95 p-4 shadow-xl backdrop-blur">
      <header className="mb-2 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <ComponentIcon type={node.type} className="size-6" />
          <h2 className="text-lg font-bold">{node.type === 'users' ? tg('users') : spec.label}</h2>
        </div>
        <button type="button" className="text-muted hover:text-chalk" onClick={props.onClose} aria-label={tg('close')}>
          ✕
        </button>
      </header>
      <p className="text-sm text-chalk/85">{tc(`${node.type}.desc`)}</p>
      <details className="mt-2 text-sm">
        <summary className="cursor-pointer text-muted hover:text-chalk">{tg('exam_tip')}</summary>
        <p className="mt-1 text-chalk/80">{tc(`${node.type}.tip`)}</p>
        <Link href={`/lessons/${COMPONENT_LESSON[node.type]}`} className="mt-1 inline-block text-accent underline">
          {tg('read_lesson')}
        </Link>
      </details>

      <div className="mt-4 space-y-3 border-t border-line pt-3">
        {has('size') && (node.type !== 'dynamodb' || c.provisioned) && (
          <Segmented
            label={capacity ? t('size_with_capacity', { capacity: capacity[c.size] }) : t('size')}
            value={c.size}
            disabled={props.locked}
            options={SIZES.map((size) => ({ value: size, label: t(`size_${size}`) }))}
            onChange={(size) => props.onChange({ size })}
          />
        )}
        {has('count') && (
          <Stepper
            label={c.autoScaling ? t('min_count') : t('count')}
            value={c.count}
            min={1}
            max={8}
            disabled={props.locked}
            onChange={(count) => props.onChange({ count, maxCount: Math.max(c.maxCount, count) })}
          />
        )}
        {has('autoScaling') && (
          <Toggle
            label={t('auto_scaling')}
            hint={t('auto_scaling_hint')}
            value={c.autoScaling}
            disabled={props.locked}
            onChange={(autoScaling) => props.onChange({ autoScaling })}
          />
        )}
        {has('autoScaling') && c.autoScaling && (
          <Stepper
            label={t('max_count')}
            value={Math.max(c.maxCount, c.count)}
            min={c.count}
            max={12}
            disabled={props.locked}
            onChange={(maxCount) => props.onChange({ maxCount })}
          />
        )}
        {has('az') && (
          <Segmented
            label={t('az')}
            value={node.type === 'readReplica' && c.az === 'spread' ? 'a' : c.az}
            disabled={props.locked}
            options={[
              { value: 'a', label: 'AZ a' },
              { value: 'b', label: 'AZ b' },
              ...(node.type === 'ec2' ? [{ value: 'spread' as const, label: t('az_spread') }] : []),
            ]}
            onChange={(az) => props.onChange({ az })}
          />
        )}
        {has('pricing') && (
          <Segmented
            label={t('pricing')}
            value={c.pricing}
            disabled={props.locked}
            options={[
              { value: 'onDemand', label: t('pricing_onDemand') },
              { value: 'reserved', label: t('pricing_reserved') },
              { value: 'spot', label: t('pricing_spot') },
            ]}
            onChange={(pricing) => props.onChange({ pricing })}
          />
        )}
        {has('multiAz') && (
          <Toggle
            label={node.type === 'rds' ? t('multi_az_rds') : t('multi_az_cache')}
            hint={node.type === 'rds' ? t('multi_az_rds_hint') : t('multi_az_cache_hint')}
            value={c.multiAz}
            disabled={props.locked}
            onChange={(multiAz) => props.onChange({ multiAz })}
          />
        )}
        {has('provisioned') && (
          <Toggle
            label={node.type === 'lambda' ? t('provisioned_lambda') : t('provisioned_dynamodb')}
            hint={node.type === 'lambda' ? t('provisioned_lambda_hint') : t('provisioned_dynamodb_hint')}
            value={c.provisioned}
            disabled={props.locked}
            onChange={(provisioned) => props.onChange({ provisioned })}
          />
        )}
        {has('cacheApi') && (
          <Toggle
            label={t('cache_api')}
            hint={t('cache_api_hint')}
            value={c.cacheApi}
            disabled={props.locked}
            onChange={(cacheApi) => props.onChange({ cacheApi })}
          />
        )}
        {has('encrypted') && (
          <Toggle
            label={t('encrypted')}
            hint={t('encrypted_hint')}
            value={c.encrypted}
            disabled={props.locked}
            onChange={(encrypted) => props.onChange({ encrypted })}
          />
        )}
        {has('region') && (
          <Segmented
            label={t('region')}
            value={c.region}
            disabled={props.locked}
            options={REGIONS.map((region) => ({ value: region, label: t(`region_${region}`) }))}
            onChange={(region) => props.onChange({ region })}
          />
        )}
      </div>

      {node.type !== 'users' && (
        <footer className="mt-4 flex items-center justify-between border-t border-line pt-3">
          <span className="font-mono text-sm text-muted">{tg('cost_per_month', { cost: props.cost.toFixed(1) })}</span>
          <button
            type="button"
            disabled={props.locked}
            className="rounded-lg border border-bad/60 px-3 py-1 text-sm font-semibold text-bad hover:bg-bad/10 disabled:opacity-40"
            onClick={props.onDelete}
          >
            {tg('delete')}
          </button>
        </footer>
      )}
    </section>
  );
};
