import { describe, expect, it } from 'vitest';
import en from '@/locales/en/lessons.json';
import vi from '@/locales/vi/lessons.json';
import { parseDiagram } from './diagrams';
import { layoutFlow } from './flowLayout';

const flow = (source: string) => {
  const diagram = parseDiagram('flow', source);

  if (diagram?.kind !== 'flow') {
    throw new Error('Not a flow');
  }

  return layoutFlow(diagram.rows);
};

const named = (layout: ReturnType<typeof layoutFlow>) =>
  layout.cells.filter((cell) => cell.label !== undefined).map((cell) => `${cell.label}@${cell.rank},${cell.slot}`);

describe('layoutFlow', () => {
  it('forks a repeated node into one lane per branch, centred on them', () => {
    const layout = flow('Order -> SNS -> SQS kho\nSNS -> SQS thanh toán\nSNS -[filter]-> SQS analytics');

    expect(named(layout)).toEqual(['Order@0,1', 'SNS@1,1', 'SQS kho@2,0', 'SQS thanh toán@2,1', 'SQS analytics@2,2']);
    expect(layout.slots).toBe(3);
  });

  it('keeps nodes with different notes apart', () => {
    const layout = flow('Route 53 -> ALB (Region A)\nRoute 53 -> ALB (Region B)');

    expect(named(layout)).toEqual(['Route 53@0,0.5', 'ALB@1,0', 'ALB@1,1']);
  });

  it('reuses a node when the later mention has no note', () => {
    const layout = flow('Producers -> Kinesis (shards) -> Lambda\nKinesis -> Firehose');

    expect(layout.cells.filter((cell) => cell.label === 'Kinesis')).toHaveLength(1);
  });

  it('adds a new node instead of looping back', () => {
    const layout = flow('App -[GenerateDataKey]-> KMS -[data key]-> App');

    expect(named(layout)).toEqual(['App@0,0', 'KMS@1,0', 'App@2,0']);
  });

  it('carries a long edge through bend points in its own lane', () => {
    const layout = flow('DC -> DX A -> DX Gateway -> VPC\nDC -> DX B -> DX Gateway\nDC -[VPN]-> VPC');
    const bends = layout.cells.filter((cell) => cell.label === undefined);

    expect(bends).toHaveLength(2);
    expect(new Set(bends.map((cell) => cell.slot)).size).toBe(1);
    expect(layout.ends.find((end) => end.labels.includes('VPN'))?.rank).toBe(1);
  });

  it('places a second start node next to the node it joins', () => {
    const layout = flow('GitHub -[OIDC]-> STS -> Deploy\nSTS -> DynamoDB\nPod -[token]-> STS');

    expect(named(layout)).toContain('Pod@0,1');
  });

  it('never overlaps two cells of a column in any lesson', () => {
    const bodies = [en, vi].flatMap((messages) => Object.values(messages.Lessons).map((lesson) => lesson.body));
    const sources = bodies.flatMap((body) => [...body.matchAll(/~~~flow\n([\s\S]*?)~~~/g)].map((match) => match[1]!));

    for (const source of sources) {
      const { cells } = flow(source);
      const overlaps = cells.filter((cell) =>
        cells.some((other) => other.id < cell.id && other.rank === cell.rank && Math.abs(other.slot - cell.slot) < 1),
      );

      expect(overlaps, source).toEqual([]);
      expect(cells.every((cell) => Number.isInteger(cell.slot * 2)), source).toBe(true);
    }
  });
});
