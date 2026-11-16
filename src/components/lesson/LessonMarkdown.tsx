import ReactMarkdown from 'react-markdown';
import type { ExtraProps } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { parseDiagram } from '@/content/diagrams';
import { GLOSSARY_TERMS } from '@/content/glossary';
import { DiagramView } from './Diagram';
import { TermTooltip } from './TermTooltip';

type HastNode = NonNullable<ExtraProps['node']>['children'][number];

const textOf = (node: HastNode): string => {
  if (node.type === 'text') {
    return node.value;
  }

  return node.type === 'element' ? node.children.map(textOf).join('') : '';
};

/**
 * Turns a heading into a URL fragment.
 * @param text The heading text.
 * @returns A lowercase ASCII slug.
 */
const headingId = (text: string) =>
  text
    .normalize('NFD')
    .replaceAll(/[̀-ͯ]/gu, '')
    .replaceAll(/đ/giu, 'd')
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/gu, '-')
    .replaceAll(/^-|-$/gu, '');

/**
 * Lists the `##` headings of a lesson body.
 * @param body Lesson Markdown.
 * @returns Heading text with its fragment id.
 */
export const lessonHeadings = (body: string) =>
  [...body.matchAll(/^## (.+)$/gmu)].map((match) => {
    const text = (match[1] ?? '').replaceAll('**', '').trim();

    return { text, id: headingId(text) };
  });

const Pre = (props: React.ComponentProps<'pre'> & ExtraProps) => {
  const code = props.node?.children[0];
  const language =
    code?.type === 'element'
      ? String(code.properties.className ?? '').replace(/^language-/u, '')
      : '';
  const diagram = code ? parseDiagram(language, textOf(code)) : undefined;

  return diagram ? <DiagramView diagram={diagram} /> : <pre>{props.children}</pre>;
};

const Heading2 = (props: React.ComponentProps<'h2'> & ExtraProps) => (
  <h2
    id={props.node ? headingId(props.node.children.map(textOf).join('')) : undefined}
    className="scroll-mt-20"
  >
    {props.children}
  </h2>
);

const ACRONYM_PATTERN = new RegExp(
  `\\b(${[...GLOSSARY_TERMS, 'FSx'].toSorted((a, b) => b.length - a.length).join('|')})\\b`,
  'gu',
);

const annotateTerms = (text: string): React.ReactNode[] => {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  ACRONYM_PATTERN.lastIndex = 0;
  while ((match = ACRONYM_PATTERN.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const [, term] = match;
    if (term) {
      parts.push(<TermTooltip key={`${term}-${match.index}`} term={term} />);
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
};

const renderWithTerms = (children: React.ReactNode): React.ReactNode => {
  if (typeof children === 'string') {
    return annotateTerms(children);
  }

  if (Array.isArray(children)) {
    return children.map((child, i) => <span key={i}>{renderWithTerms(child)}</span>);
  }

  return children;
};

const Paragraph = (props: React.ComponentProps<'p'>) => <p>{renderWithTerms(props.children)}</p>;

const ListItem = (props: React.ComponentProps<'li'>) => <li>{renderWithTerms(props.children)}</li>;

const TableData = (props: React.ComponentProps<'td'>) => <td>{renderWithTerms(props.children)}</td>;

/**
 * Renders lesson Markdown with GFM tables, anchored headings, text diagrams and acronym tooltips.
 * @param props The Markdown source.
 * @returns Markdown rendered element tree.
 */
export const LessonMarkdown = (props: { children: string }) => (
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    components={{
      pre: Pre,
      h2: Heading2,
      p: Paragraph,
      li: ListItem,
      td: TableData,
    }}
  >
    {props.children}
  </ReactMarkdown>
);
