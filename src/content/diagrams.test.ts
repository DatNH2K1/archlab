import { describe, expect, it } from 'vitest';
import { parseDiagram } from './diagrams';

describe('parseDiagram', () => {
  it('returns undefined for a language that is not a diagram', () => {
    expect(parseDiagram('ts', 'const a = 1;')).toBeUndefined();
  });

  describe('flow', () => {
    it('splits a chain into nodes, notes and edge labels', () => {
      expect(parseDiagram('flow', '# Request path\nUsers -> ALB -[HTTPS]-> EC2 (ASG)')).toEqual({
        kind: 'flow',
        caption: 'Request path',
        rows: [
          {
            nodes: [{ label: 'Users' }, { label: 'ALB' }, { label: 'EC2', note: 'ASG' }],
            edges: [undefined, 'HTTPS'],
          },
        ],
      });
    });

    it('keeps one row per line', () => {
      const diagram = parseDiagram('flow', 'A -> B\nC -> D');

      expect(diagram?.kind === 'flow' && diagram.rows).toHaveLength(2);
    });
  });

  describe('groups', () => {
    it('reads the frame, group titles and highlighted items', () => {
      expect(parseDiagram('groups', '[Region]\nAZ a: EC2, *RDS primary\nAZ b: EC2')).toEqual({
        kind: 'groups',
        caption: undefined,
        frame: 'Region',
        groups: [
          {
            title: 'AZ a',
            items: [
              { label: 'EC2', highlight: false },
              { label: 'RDS primary', highlight: true },
            ],
          },
          { title: 'AZ b', items: [{ label: 'EC2', highlight: false }] },
        ],
      });
    });
  });

  describe('layers', () => {
    it('keeps the layers in order from outer to inner', () => {
      expect(parseDiagram('layers', 'Edge: WAF, *Shield\nData: KMS')).toEqual({
        kind: 'layers',
        caption: undefined,
        layers: [
          {
            title: 'Edge',
            items: [
              { label: 'WAF', highlight: false },
              { label: 'Shield', highlight: true },
            ],
          },
          { title: 'Data', items: [{ label: 'KMS', highlight: false }] },
        ],
      });
    });
  });

  describe('ladder', () => {
    it('reads label, detail and badge cells', () => {
      expect(parseDiagram('ladder', 'Standard | hot data | ms\nDeep Archive')).toEqual({
        kind: 'ladder',
        caption: undefined,
        steps: [
          { label: 'Standard', detail: 'hot data', badge: 'ms' },
          { label: 'Deep Archive', detail: undefined, badge: undefined },
        ],
      });
    });
  });

  describe('decide', () => {
    it('splits each rule into a condition and a pick', () => {
      expect(parseDiagram('decide', 'Needs failover => Multi-AZ')).toEqual({
        kind: 'decide',
        caption: undefined,
        rules: [{ when: 'Needs failover', then: 'Multi-AZ' }],
      });
    });
  });
});
