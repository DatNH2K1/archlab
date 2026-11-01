/**
 * Small text diagrams written inside lesson Markdown as fenced code blocks.
 *
 * Every kind takes an optional first line `# caption`.
 * - `flow`: one chain per line, `A -> B -[label]-> C (note)`.
 * - `groups`: one box per line, `Title: item, *highlighted item`; an optional `[Frame title]` line wraps them all.
 * - `layers`: stacked bands from the outermost layer to the innermost, `Layer: item, *highlighted item`.
 * - `ladder`: ordered steps from hot to cold, `Label | detail | badge`.
 * - `decide`: one rule per line, `When this => pick that`.
 */
export type DiagramNode = { label: string; note?: string };

export type DiagramItem = { label: string; highlight: boolean };

export type Diagram =
  | { kind: 'flow'; caption?: string; rows: { nodes: DiagramNode[]; edges: (string | undefined)[] }[] }
  | { kind: 'groups'; caption?: string; frame?: string; groups: { title: string; items: DiagramItem[] }[] }
  | { kind: 'layers'; caption?: string; layers: { title: string; items: DiagramItem[] }[] }
  | { kind: 'ladder'; caption?: string; steps: { label: string; detail?: string; badge?: string }[] }
  | { kind: 'decide'; caption?: string; rules: { when: string; then: string }[] };

type DiagramKind = Diagram['kind'];

const KINDS: DiagramKind[] = ['flow', 'groups', 'layers', 'ladder', 'decide'];

const EDGE = /\s*-(?:\[([^\]]*)\]-)?>\s*/;

const isKind = (value: string): value is DiagramKind => KINDS.some((kind) => kind === value);

const parseNode = (text: string): DiagramNode => {
  const match = /^(.*?)\s*\(([^()]+)\)$/.exec(text);

  return match?.[1] ? { label: match[1], note: match[2] } : { label: text };
};

const parseFlowRow = (line: string) => {
  const parts = line.split(EDGE);
  // `split` with a capture group interleaves node texts and edge labels.
  const nodes = parts.filter((_, i) => i % 2 === 0).map((text) => parseNode(text.trim()));
  const edges = parts.filter((_, i) => i % 2 === 1).map((label) => label?.trim() || undefined);

  return { nodes, edges };
};

const parseGroup = (line: string) => {
  const colon = line.indexOf(':');
  const title = colon === -1 ? line : line.slice(0, colon);
  const items = colon === -1 ? [] : line.slice(colon + 1).split(',');

  return {
    title: title.trim(),
    items: items
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => (item.startsWith('*') ? { label: item.slice(1).trim(), highlight: true } : { label: item, highlight: false })),
  };
};

const parseCells = (line: string) => line.split('|').map((cell) => cell.trim() || undefined);

/**
 * Parses the source of a fenced diagram block.
 * @param kind The fence language, such as `flow`.
 * @param source The text inside the fence.
 * @returns The diagram, or `undefined` when the language is not a diagram kind.
 */
export const parseDiagram = (kind: string, source: string): Diagram | undefined => {
  if (!isKind(kind)) {
    return undefined;
  }

  const lines = source
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  const caption = lines[0]?.startsWith('# ') ? lines[0].slice(2).trim() : undefined;
  const body = caption === undefined ? lines : lines.slice(1);

  switch (kind) {
    case 'flow':
      return { kind, caption, rows: body.map(parseFlowRow) };
    case 'groups': {
      const frameLine = body.find((line) => /^\[.+\]$/.test(line));

      return {
        kind,
        caption,
        frame: frameLine?.slice(1, -1).trim(),
        groups: body.filter((line) => line !== frameLine).map(parseGroup),
      };
    }
    case 'layers':
      return { kind, caption, layers: body.map(parseGroup) };
    case 'ladder':
      return {
        kind,
        caption,
        steps: body.map((line) => {
          const [label = '', detail, badge] = parseCells(line);

          return { label, detail, badge };
        }),
      };
    case 'decide':
      return {
        kind,
        caption,
        rules: body.map((line) => {
          const [when = '', then = ''] = line.split('=>').map((part) => part.trim());

          return { when, then };
        }),
      };
  }
};
