import { fileURLToPath } from 'node:url';
import { PeleError, render } from 'pele';
import { defineHastPlugin, htmlToHast, type HastNode } from 'satteri';

/**
 * Measured font passed to pele's build-time renderer. Keep this identical to
 * `--pele-font` in global.css so labels fit the font the page draws.
 */
const FONT_FAMILY = 'Inter var, system-ui, sans-serif';
const FONT_FAMILY_MONO = 'ui-monospace, SFMono-Regular, Menlo, monospace';

/** Article column (`max-w-3xl`). Diagrams scale down further in the browser. */
const ARTICLE_MAX_WIDTH = 768;

/** htmlToHast keeps the SVG namespace as `:xmlns`, which MDX then emits literally. */
function restoreXmlns(node: HastNode): void {
  if (node.type === 'element' && node.properties && ':xmlns' in node.properties) {
    const xmlns = node.properties[':xmlns'];
    if (typeof xmlns === 'string') node.properties.xmlns = xmlns;
    delete node.properties[':xmlns'];
  }
  if ('children' in node && node.children) {
    for (const child of node.children) restoreXmlns(child);
  }
}

function mermaidSource(node: HastNode): string | undefined {
  if (node.type !== 'element') return undefined;
  const code = node.children?.find(
    (child) => child.type === 'element' && child.tagName === 'code',
  );
  if (!code || code.type !== 'element') return undefined;

  const lang = (code.data as { lang?: string } | undefined)?.lang;
  const className = code.properties?.className;
  const fromClass =
    Array.isArray(className) && className.some((name) => name === 'language-mermaid');
  if (lang !== 'mermaid' && !fromClass) return undefined;

  const source = (code.children ?? [])
    .map((child) => (child.type === 'text' ? child.value : ''))
    .join('')
    .replace(/\n$/, '');
  return source;
}

/**
 * Replace ```mermaid fences with pele SVG at build time.
 *
 * A hast plugin (not an mdast `{ type: 'html' }` node) keeps the SVG in the
 * tree MDX 8 can compile. Pele still reads Mermaid syntax.
 */
export function peleDiagrams() {
  let index = 0;

  return defineHastPlugin({
    name: 'pele-diagrams',
    element: {
      filter: ['pre'],
      visit(node, ctx) {
        const source = mermaidSource(node);
        if (source === undefined) return;

        index += 1;
        const where = ctx.fileURL ? fileURLToPath(ctx.fileURL) : 'markdown';
        const idPrefix = `pele-${index}`;

        let svg: string;
        try {
          svg = render(source, {
            idPrefix,
            maxWidth: ARTICLE_MAX_WIDTH,
            responsive: true,
            fontFamily: FONT_FAMILY,
            fontFamilyMono: FONT_FAMILY_MONO,
          }).svg;
        } catch (error) {
          const detail =
            error instanceof PeleError
              ? `${error.code} at line ${error.line}, column ${error.column}: ${error.message}`
              : error instanceof Error
                ? error.message
                : String(error);
          throw new Error(
            `Pele could not render mermaid diagram ${index} in ${where}. ${detail}`,
          );
        }

        const parsed = htmlToHast(svg, { fragment: true, space: 'svg' });
        const svgNode =
          parsed.type === 'root'
            ? parsed.children?.find((child) => child.type === 'element' && child.tagName === 'svg')
            : undefined;
        if (!svgNode || svgNode.type !== 'element') {
          throw new Error(
            `Pele returned SVG that could not be parsed for diagram ${index} in ${where}.`,
          );
        }
        restoreXmlns(svgNode);

        return {
          type: 'element' as const,
          tagName: 'figure',
          properties: { className: ['pele-diagram'] },
          children: [svgNode],
        };
      },
    },
  });
}
