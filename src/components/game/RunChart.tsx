import type { TickSample } from '@/game/types';

/**
 * Plots answered share and response time over a run, shading the twist.
 * @param props The run samples, latency target and axis labels.
 */
export const RunChart = (props: {
  ticks: TickSample[];
  latencyTarget: number;
  labels: { answered: string; latency: string; twist: string };
}) => {
  const width = 320;
  const height = 110;
  const n = Math.max(1, props.ticks.length - 1);
  const maxLatency = Math.max(props.latencyTarget * 1.5, ...props.ticks.map((tick) => tick.latency));
  const x = (i: number) => (i / n) * width;
  const answered = props.ticks.map((tick, i) => `${x(i)},${height - tick.answered * height}`).join(' ');
  const latency = props.ticks.map((tick, i) => `${x(i)},${height - (tick.latency / maxLatency) * height}`).join(' ');
  const twistTicks = props.ticks.filter((tick) => tick.twistActive);
  const first = twistTicks[0];
  const last = twistTicks.at(-1);
  const targetY = height - (props.latencyTarget / maxLatency) * height;

  return (
    <figure>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-28 w-full overflow-visible" role="img" aria-label={props.labels.answered}>
        {first && last && (
          <rect x={x(first.t)} y={0} width={x(last.t) - x(first.t)} height={height} className="fill-warn/10" />
        )}
        <line x1={0} x2={width} y1={targetY} y2={targetY} strokeDasharray="4 4" className="stroke-info/50" />
        <polyline points={latency} fill="none" strokeWidth="1.5" className="stroke-info" />
        <polyline points={answered} fill="none" strokeWidth="2" className="stroke-good" />
      </svg>
      <figcaption className="mt-1 flex flex-wrap gap-3 text-[11px] text-muted">
        <span>
          <span className="mr-1 inline-block h-0.5 w-3 bg-good align-middle" />
          {props.labels.answered}
        </span>
        <span>
          <span className="mr-1 inline-block h-0.5 w-3 bg-info align-middle" />
          {props.labels.latency}
        </span>
        {first && (
          <span>
            <span className="mr-1 inline-block h-2 w-3 bg-warn/30 align-middle" />
            {props.labels.twist}
          </span>
        )}
      </figcaption>
    </figure>
  );
};
