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

/** Edge IDs marked with Mermaid's `id@{ animate: true }` or `animation: fast|slow`. */
function animatedEdges(source: string): Map<string, 'fast' | 'slow' | undefined> {
  const edges = new Map<string, 'fast' | 'slow' | undefined>();
  for (const match of source.matchAll(/([A-Za-z_][\w-]*)@\{([^}]*)\}/g)) {
    const [, id, body] = match;
    const speed = /animation\s*:\s*(fast|slow)/.exec(body)?.[1] as 'fast' | 'slow' | undefined;
    if (speed || /animate\s*:\s*true/.test(body)) edges.set(id, speed);
  }
  return edges;
}

/**
 * Pele parses Mermaid's edge animation but draws a static line. Tag those
 * edges so global.css can animate them.
 */
function markAnimatedEdges(svg: string, edges: Map<string, 'fast' | 'slow' | undefined>): string {
  if (edges.size === 0) return svg;
  return svg.replace(/<g class="pele-edge" data-id="([^"]+)">/g, (tag, id: string) => {
    if (!edges.has(id)) return tag;
    const speed = edges.get(id);
    return `<g class="pele-edge pele-edge-animated${speed ? ` pele-edge-${speed}` : ''}" data-id="${id}">`;
  });
}

/** `%% pele: play` asks for a sequence diagram to reveal its steps in order. */
function wantsPlayback(source: string): boolean {
  return /^\s*%%\s*pele:\s*play\s*$/m.test(source);
}

/** Participants introduced with `create participant` or `create actor`. */
function createdParticipants(source: string): Set<string> {
  return new Set([...source.matchAll(/^\s*create\s+(?:participant|actor)\s+([^\s]+)/gm)].map((match) => match[1]));
}

/**
 * Number each sequence message and note in source order. Pele gives them
 * `data-id="i<statement>"`, shared by a message and its label.
 *
 * Participants created mid-diagram, and their destroy marks, join the step of
 * the message drawn at their height, so they do not show before they exist.
 */
function markSteps(svg: string, created: Set<string>): { svg: string; steps: number } {
  const step = /<g class="(pele-edge pele-message[^"]*|pele-edge-label|pele-note[^"]*)" data-id="i(\d+)"/g;
  const order = [...new Set([...svg.matchAll(step)].map((match) => Number(match[2])))].sort((a, b) => a - b);
  const rank = new Map(order.map((statement, index) => [statement, index]));
  let marked = svg.replace(
    step,
    (_tag, className: string, statement: string) =>
      `<g class="${className} pele-step" style="--pele-step:${rank.get(Number(statement))}" data-id="i${statement}"`,
  );
  if (created.size === 0) return { svg: marked, steps: order.length };

  // The y of each message's line, in step order.
  const messages = [...svg.matchAll(/<g class="pele-edge pele-message[^"]*" data-id="i(\d+)"><path d="M[-\d.]+,([-\d.]+)/g)]
    .map((match) => ({ step: rank.get(Number(match[1]))!, y: Number(match[2]) }))
    .sort((a, b) => a.y - b.y);
  const lastAbove = (y: number) => messages.filter((message) => message.y <= y).at(-1)?.step;

  // A created participant's header box sits level with the message that creates it.
  const appears = new Map<string, number>();
  for (const match of svg.matchAll(/<g class="pele-node pele-actor(?![^"]*pele-actor-footer)[^"]*" data-id="([^"]+)"><rect x="[-\d.]+" y="([-\d.]+)" width="[-\d.]+" height="([-\d.]+)"/g)) {
    const [, id, top, height] = match;
    if (!created.has(id)) continue;
    const at = lastAbove(Number(top) + Number(height));
    if (at !== undefined) appears.set(id, at);
  }

  const tag = (className: string, id: string, at: number | undefined, element: string) =>
    at === undefined
      ? `<${element} class="${className}" data-id="${id}"`
      : `<${element} class="${className} pele-step" style="--pele-step:${at}" data-id="${id}"`;
  marked = marked
    .replace(/<g class="(pele-node pele-actor[^"]*)" data-id="([^"]+)"/g, (whole, className: string, id: string) =>
      appears.has(id) ? tag(className, id, appears.get(id), 'g') : whole,
    )
    .replace(/<path class="pele-lifeline" data-id="([^"]+)"/g, (whole, id: string) =>
      appears.has(id) ? tag('pele-lifeline', id, appears.get(id), 'path') : whole,
    )
    .replace(/<path class="pele-destroy" data-id="[^"]+" d="M[-\d.]+,([-\d.]+)/g, (whole, y: string) => {
      const at = lastAbove(Number(y));
      return at === undefined ? whole : whole.replace('class="pele-destroy"', `class="pele-destroy pele-step" style="--pele-step:${at}"`);
    });
  return { svg: marked, steps: order.length };
}

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

        svg = markAnimatedEdges(svg, animatedEdges(source));
        let steps = 0;
        if (wantsPlayback(source)) ({ svg, steps } = markSteps(svg, createdParticipants(source)));

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
          properties:
            steps > 0
              ? { className: ['pele-diagram', 'pele-play'], dataPeleSteps: String(steps) }
              : { className: ['pele-diagram'] },
          children: [svgNode],
        };
      },
    },
  });
}
