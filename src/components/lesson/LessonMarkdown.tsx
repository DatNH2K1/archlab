import ReactMarkdown from 'react-markdown';
import type { ExtraProps } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { parseDiagram } from '@/content/diagrams';
import { DiagramView } from './Diagram';

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
export const headingId = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/**
 * Lists the `##` headings of a lesson body.
 * @param body Lesson Markdown.
 * @returns Heading text with its fragment id.
 */
export const lessonHeadings = (body: string) =>
  [...body.matchAll(/^## (.+)$/gm)].map((match) => {
    const text = (match[1] ?? '').replaceAll('**', '').trim();

    return { text, id: headingId(text) };
  });

const Pre = (props: React.ComponentProps<'pre'> & ExtraProps) => {
  const code = props.node?.children[0];
  const language = code?.type === 'element' ? String(code.properties.className ?? '').replace(/^language-/, '') : '';
  const diagram = code ? parseDiagram(language, textOf(code)) : undefined;

  return diagram ? <DiagramView diagram={diagram} /> : <pre>{props.children}</pre>;
};

const Heading2 = (props: React.ComponentProps<'h2'> & ExtraProps) => (
  <h2 id={props.node ? headingId(props.node.children.map(textOf).join('')) : undefined} className="scroll-mt-20">
    {props.children}
  </h2>
);

/**
 * Renders lesson Markdown with GFM tables, anchored headings and text diagrams.
 * @param props The Markdown source.
 */
export const LessonMarkdown = (props: { children: string }) => (
  <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ pre: Pre, h2: Heading2 }}>
    {props.children}
  </ReactMarkdown>
);
