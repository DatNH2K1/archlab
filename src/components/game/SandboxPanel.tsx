'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Checkbox } from '@/components/Checkbox';
import { Select } from '@/components/Select';
import type { RequirementId, Scenario, TrafficClass } from '@/game/types';
import { REGIONS, REQUIREMENTS, TWISTS } from '@/game/types';

const CLASSES: TrafficClass[] = ['read', 'write', 'static', 'job'];

/**
 * Sets one share and rescales the others so they still sum to 1.
 * @param options The current shares, every key that holds one, the key the player moved and its new value.
 * @returns The rescaled shares.
 */
const normalize = <K extends string>(options: {
  shares: Partial<Record<K, number>>;
  keys: readonly K[];
  changed: K;
  value: number;
}) => {
  const others = options.keys.filter((key) => key !== options.changed);
  const rest = others.reduce((acc, key) => acc + (options.shares[key] ?? 0), 0);
  const next: Partial<Record<K, number>> = {};

  next[options.changed] = options.value;

  for (const key of others) {
    next[key] = rest > 0 ? ((options.shares[key] ?? 0) / rest) * (1 - options.value) : (1 - options.value) / others.length;
  }

  return next;
};

/**
 * Lets the player set traffic, request mix, twist and rules in the sandbox.
 * @param props The scenario and its change handler.
 */
export const SandboxPanel = (props: { scenario: Scenario; onChange: (scenario: Scenario) => void; disabled: boolean }) => {
  const t = useTranslations('Sandbox');
  const tt = useTranslations('Twists');
  const tq = useTranslations('Requirements');
  const [open, setOpen] = useState(true);
  const s = props.scenario;
  const set = (patch: Partial<Scenario>) => props.onChange({ ...s, ...patch });

  return (
    <section className="w-72 rounded-xl border border-line bg-panel/95 p-3 text-sm shadow-xl backdrop-blur">
      <button type="button" className="flex w-full items-center justify-between font-bold" onClick={() => setOpen(!open)}>
        {t('settings')}
        <span className="text-muted">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <fieldset disabled={props.disabled} className="mt-3 space-y-3">
          <label className="block">
            <span className="flex justify-between">
              {t('traffic')} <span className="font-mono">{s.traffic} req/s</span>
            </span>
            <input
              type="range"
              min={1}
              max={4}
              step={0.01}
              value={Math.log10(s.traffic)}
              className="w-full accent-[var(--color-accent)]"
              onChange={(event) => set({ traffic: Math.round(10 ** Number(event.target.value) / 10) * 10 || 10 })}
            />
          </label>
          {CLASSES.map((cls) => (
            <label key={cls} className="block">
              <span className="flex justify-between">
                {t(`mix_${cls}`)} <span className="font-mono">{Math.round((s.mix[cls] ?? 0) * 100)}%</span>
              </span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={s.mix[cls] ?? 0}
                className="w-full accent-[var(--color-accent)]"
                onChange={(event) =>
                  set({ mix: normalize({ shares: s.mix, keys: CLASSES, changed: cls, value: Number(event.target.value) }) })
                }
              />
            </label>
          ))}
          {REGIONS.map((region) => (
            <label key={region} className="block">
              <span className="flex justify-between">
                {t('users_near', { region })} <span className="font-mono">{Math.round((s.audience[region] ?? 0) * 100)}%</span>
              </span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={s.audience[region] ?? 0}
                className="w-full accent-[var(--color-accent)]"
                onChange={(event) =>
                  set({
                    audience: normalize({ shares: s.audience, keys: REGIONS, changed: region, value: Number(event.target.value) }),
                  })
                }
              />
            </label>
          ))}
          <Select
            label={t('twist')}
            value={s.twist ?? 'none'}
            options={[
              { value: 'none', label: t('no_twist') },
              ...TWISTS.map((twist) => ({ value: twist, label: tt(`${twist}.name`) })),
            ]}
            disabled={props.disabled}
            onChange={(twist) => set({ twist: twist === 'none' ? undefined : twist })}
          />
          {s.twist === 'regionOutage' && (
            <Select
              label={t('outage_region')}
              value={s.outageRegion ?? REGIONS[0]}
              options={REGIONS.map((region) => ({ value: region, label: region }))}
              disabled={props.disabled}
              onChange={(outageRegion) => set({ outageRegion })}
            />
          )}
          <div>
            <span>{t('rules')}</span>
            {REQUIREMENTS.map((id: RequirementId) => (
              <Checkbox
                key={id}
                className="mt-1.5"
                label={tq(`${id}.title`)}
                checked={s.requirements.includes(id)}
                disabled={props.disabled}
                onChange={(checked) =>
                  set({ requirements: checked ? [...s.requirements, id] : s.requirements.filter((item) => item !== id) })
                }
              />
            ))}
          </div>
        </fieldset>
      )}
    </section>
  );
};
