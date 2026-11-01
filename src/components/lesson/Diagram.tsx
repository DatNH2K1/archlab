import { ComponentIcon } from '@/components/game/ComponentIcon';
import type { Diagram, DiagramItem, DiagramNode } from '@/content/diagrams';
import { CATALOG } from '@/game/catalog';
import type { ComponentType } from '@/game/types';

const ICONS = (Object.keys(CATALOG) as ComponentType[])
  .map((type) => ({ type, pattern: new RegExp(`(^|\\W)${CATALOG[type].label.replace(/\s+/g, '\\s*')}(\\W|$)`, 'i') }))
  .toSorted((a, b) => CATALOG[b.type].label.length - CATALOG[a.type].label.length);

const iconFor = (label: string) => ICONS.find((icon) => icon.pattern.test(label))?.type;

const Arrow = (props: { label?: string }) => (
  <div className="flex shrink-0 flex-col items-center px-1 text-muted">
    {props.label && <span className="text-[10px] leading-none whitespace-nowrap text-accent">{props.label}</span>}
    <svg viewBox="0 0 32 12" className="h-3 w-8" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M1 6h29M25 1l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </div>
);

const Node = (props: { node: DiagramNode }) => {
  const icon = iconFor(props.node.label);

  return (
    <div className="flex min-w-20 items-center gap-2 rounded-lg border border-line bg-panel-2 px-3 py-2">
      {icon && <ComponentIcon type={icon} className="size-5 shrink-0 text-accent" />}
      <div>
        <p className="text-sm leading-tight font-semibold">{props.node.label}</p>
        {props.node.note && <p className="text-xs leading-tight text-muted">{props.node.note}</p>}
      </div>
    </div>
  );
};

const Item = (props: { item: DiagramItem }) => {
  const icon = iconFor(props.item.label);

  return (
    <li
      className={`flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs ${props.item.highlight ? 'border-accent bg-accent/15 font-semibold' : 'border-line bg-ink/40'}`}
    >
      {icon && <ComponentIcon type={icon} className="size-3.5 text-accent" />}
      {props.item.label}
    </li>
  );
};

const Flow = (props: { diagram: Extract<Diagram, { kind: 'flow' }> }) => (
  <div className="space-y-3">
    {props.diagram.rows.map((row, r) => (
      <div key={`${r}-${row.nodes.map((node) => node.label).join('>')}`} className="flex flex-wrap items-center gap-y-2">
        {row.nodes.map((node, i) => (
          <div key={`${node.label}-${i}`} className="flex items-center">
            {i > 0 && <Arrow label={row.edges[i - 1]} />}
            <Node node={node} />
          </div>
        ))}
      </div>
    ))}
  </div>
);

const Groups = (props: { diagram: Extract<Diagram, { kind: 'groups' }> }) => {
  const grid = (
    <div className="grid gap-3 sm:grid-cols-[repeat(auto-fit,minmax(10rem,1fr))]">
      {props.diagram.groups.map((group, g) => (
        <div key={`${g}-${group.title}`} className="rounded-lg border border-line bg-panel-2/60 p-3">
          <p className="font-mono text-xs tracking-wide text-accent uppercase">{group.title}</p>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {group.items.map((item, j) => (
              <Item key={`${j}-${item.label}`} item={item} />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );

  return props.diagram.frame ? (
    <div className="rounded-xl border border-dashed border-muted/50 p-3 pt-2">
      <p className="mb-2 text-xs font-semibold text-muted">{props.diagram.frame}</p>
      {grid}
    </div>
  ) : (
    grid
  );
};

const Layers = (props: { diagram: Extract<Diagram, { kind: 'layers' }> }) => {
  const last = Math.max(props.diagram.layers.length - 1, 1);

  return (
    <ol className="space-y-1.5">
      {props.diagram.layers.map((layer, i) => {
        // Each layer sits a little further in, so the stack narrows towards the core.
        const style = {
          '--indent': `${i * 0.75}rem`,
          borderColor: `color-mix(in oklab, var(--color-warn) ${100 - (i / last) * 100}%, var(--color-info))`,
        };

        return (
          <li
            key={`${i}-${layer.title}`}
            className="flex flex-col gap-2 rounded-lg border-l-4 bg-panel-2/60 px-3 py-2 sm:mx-(--indent) sm:flex-row sm:items-center"
            style={style}
          >
            <p className="shrink-0 text-sm font-semibold sm:w-40">{layer.title}</p>
            <ul className="flex flex-wrap gap-1.5">
              {layer.items.map((item, j) => (
                <Item key={`${j}-${item.label}`} item={item} />
              ))}
            </ul>
          </li>
        );
      })}
    </ol>
  );
};

const Ladder = (props: { diagram: Extract<Diagram, { kind: 'ladder' }> }) => {
  const last = Math.max(props.diagram.steps.length - 1, 1);

  return (
    <ol className="space-y-1.5">
      {props.diagram.steps.map((step, i) => {
        // Warm colour on the first step fading to cool on the last one.
        const color = `color-mix(in oklab, var(--color-warn) ${100 - (i / last) * 100}%, var(--color-info))`;

        return (
          <li key={`${i}-${step.label}`} className="flex items-stretch gap-3">
            <span className="w-1.5 shrink-0 rounded-full" style={{ background: color }} />
            <div className="flex flex-1 flex-wrap items-baseline gap-x-3 gap-y-0.5 rounded-lg bg-panel-2/60 px-3 py-2">
              <span className="text-sm font-semibold">{step.label}</span>
              {step.detail && <span className="order-last w-full text-xs text-muted sm:order-none sm:w-auto sm:flex-1">{step.detail}</span>}
              {step.badge && (
                <span className="ml-auto rounded-full border px-2 font-mono text-xs" style={{ borderColor: color, color }}>
                  {step.badge}
                </span>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
};

const Decide = (props: { diagram: Extract<Diagram, { kind: 'decide' }> }) => (
  <ul className="grid gap-2 sm:grid-cols-2">
    {props.diagram.rules.map((rule, i) => (
      <li key={`${i}-${rule.when}`} className="flex flex-col gap-1.5 rounded-lg border border-line bg-panel-2/60 p-3">
        <span className="text-sm text-chalk/85">{rule.when}</span>
        <span className="flex items-center gap-1.5 text-sm font-bold text-accent">
          <span aria-hidden="true">→</span>
          {rule.then}
        </span>
      </li>
    ))}
  </ul>
);

/**
 * Draws a lesson diagram parsed from a fenced Markdown block.
 * @param props The parsed diagram.
 */
export const DiagramView = (props: { diagram: Diagram }) => (
  <figure className="my-6 rounded-xl border border-line bg-panel p-4">
    {props.diagram.kind === 'flow' && <Flow diagram={props.diagram} />}
    {props.diagram.kind === 'groups' && <Groups diagram={props.diagram} />}
    {props.diagram.kind === 'layers' && <Layers diagram={props.diagram} />}
    {props.diagram.kind === 'ladder' && <Ladder diagram={props.diagram} />}
    {props.diagram.kind === 'decide' && <Decide diagram={props.diagram} />}
    {props.diagram.caption && <figcaption className="mt-3 text-center text-xs text-muted">{props.diagram.caption}</figcaption>}
  </figure>
);
