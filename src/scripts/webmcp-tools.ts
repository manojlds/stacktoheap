// The runnable part of the WebMCP post (WebMCPTools.astro).
//
// On page load it registers a few tools about the post itself with WebMCP and
// shows each one as a card. Clicking a card's button calls the tool the way an
// agent would and shows the response. When an agent calls a tool, the same card
// shows that call too, so readers can watch it happen.
//
// Browsers without WebMCP get a stand-in on document.modelContext, so the cards
// work for everyone; the header says which one is in use.

type Json = Record<string, unknown>;

interface ModelContextTool {
  name: string;
  title?: string;
  description: string;
  inputSchema?: Json;
  annotations?: { readOnlyHint?: boolean };
  execute: (input: Json) => Promise<unknown>;
}

interface ModelContext {
  registerTool(tool: ModelContextTool): Promise<unknown> | unknown;
}

type Provider = 'document.modelContext' | 'navigator.modelContext' | 'stand-in';

const asContext = (value: unknown) =>
  value && typeof (value as ModelContext).registerTool === 'function' ? (value as ModelContext) : undefined;

/** The browser's WebMCP, or a stand-in where there is none. No agent can see the stand-in's tools. */
function modelContext(): { context: ModelContext; provider: Provider } {
  const onDocument = asContext((document as any).modelContext);
  if (onDocument) return { context: onDocument, provider: 'document.modelContext' };
  const onNavigator = asContext((navigator as any).modelContext);
  if (onNavigator) return { context: onNavigator, provider: 'navigator.modelContext' };
  const standIn: ModelContext = { registerTool: () => Promise.resolve() };
  Object.defineProperty(document, 'modelContext', { value: standIn, configurable: true });
  return { context: standIn, provider: 'stand-in' };
}

// --- Tools about the post --------------------------------------------------

const postBody = () => document.querySelector<HTMLElement>('[data-post-body]');
const headings = () =>
  [...(postBody()?.querySelectorAll<HTMLHeadingElement>('h1[id], h2[id], h3[id]') ?? [])].filter(
    (heading) => !heading.closest('[data-webmcp-tools]'),
  );
const level = (heading: Element) => Number(heading.tagName[1]);

/** The text from a heading up to the next heading at the same level or above. */
function sectionText(heading: HTMLHeadingElement): string {
  const parts: string[] = [];
  for (let node = heading.nextElementSibling; node; node = node.nextElementSibling) {
    if (/^H[1-6]$/.test(node.tagName) && level(node) <= level(heading)) break;
    if (node.closest('[data-x-omit]') || node.matches('[data-x-omit]')) continue;
    // Diagrams are SVG; their labels read as noise in plain text.
    if (node.matches('svg') || node.querySelector('svg')) continue;
    const text = (node as HTMLElement).innerText?.trim();
    if (text) parts.push(text);
  }
  return parts.join('\n\n');
}

function findHeading(id: unknown) {
  const heading = headings().find((candidate) => candidate.id === id);
  if (heading) return heading;
  const ids = headings().map((candidate) => candidate.id).join(', ');
  throw { error: `No section with id "${String(id)}". Use one of: ${ids}` };
}

/** In-band errors, as wterm does: browsers drop the message of a thrown error. */
const inBand = (run: (input: Json) => unknown) => async (input: Json) => {
  try {
    return await run(input ?? {});
  } catch (problem) {
    if (problem && typeof problem === 'object' && 'error' in problem) return problem;
    return { error: problem instanceof Error ? problem.message : String(problem) };
  }
};

const sectionId = { type: 'string', description: 'Section id from get_post_outline' };

const postTools: ModelContextTool[] = [
  {
    name: 'get_post_outline',
    title: 'Post outline',
    description: "List this blog post's sections with their ids, in reading order. Use an id with read_section or highlight_section.",
    inputSchema: { type: 'object', properties: {} },
    annotations: { readOnlyHint: true },
    execute: inBand(() => headings().map((heading) => ({ id: heading.id, title: heading.textContent?.trim(), level: level(heading) }))),
  },
  {
    name: 'read_section',
    title: 'Read a section',
    description: 'Return the plain text of one section of this post, without interactive parts.',
    inputSchema: { type: 'object', properties: { id: sectionId }, required: ['id'] },
    annotations: { readOnlyHint: true },
    execute: inBand((input) => {
      const heading = findHeading(input.id);
      return { id: heading.id, title: heading.textContent?.trim(), text: sectionText(heading) };
    }),
  },
  {
    name: 'highlight_section',
    title: 'Show a section',
    description: 'Scroll the reader to one section of this post and highlight it briefly, to point at what you are talking about.',
    inputSchema: { type: 'object', properties: { id: sectionId }, required: ['id'] },
    execute: inBand((input) => {
      const heading = findHeading(input.id);
      heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
      heading.classList.remove('webmcp-highlight');
      void heading.offsetWidth;
      heading.classList.add('webmcp-highlight');
      return { highlighted: heading.id };
    }),
  },
];

// --- The cards -------------------------------------------------------------

const DEFAULT_SECTION = 'how-webmcp-differs-from-mcp';

const el = <K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, text?: string) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

/** Show one call on the tool's card, whether a reader clicked or an agent called. */
function showCall(card: HTMLElement, who: 'you' | 'an agent', input: Json, result: unknown) {
  const output = card.querySelector<HTMLElement>('[data-result]')!;
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  output.querySelector('[data-meta]')!.textContent = `Called by ${who} at ${time} with ${JSON.stringify(input)}`;
  output.querySelector('code')!.textContent = JSON.stringify(result, null, 2);
  output.hidden = false;
  card.dataset.error = String(Boolean(result && typeof result === 'object' && 'error' in result));
  card.classList.remove('wmt-called');
  void card.offsetWidth;
  card.classList.add('wmt-called');
}

function toolCard(tool: ModelContextTool, call: (input: Json) => Promise<unknown>) {
  const card = el('article', 'wmt-tool');
  card.dataset.tool = tool.name;

  const head = el('header', 'wmt-tool-head');
  head.append(el('code', 'wmt-tool-name', tool.name));
  head.append(el('span', 'wmt-badge', tool.annotations?.readOnlyHint ? 'read-only' : 'changes the page'));
  card.append(head, el('p', 'wmt-tool-desc', tool.description));

  const controls = el('div', 'wmt-controls');
  let pick: HTMLSelectElement | undefined;
  if ((tool.inputSchema?.properties as Json | undefined)?.id) {
    const label = el('label', 'wmt-input');
    label.append(el('span', undefined, 'id'));
    pick = el('select');
    for (const heading of headings()) {
      const option = el('option', undefined, heading.id);
      option.value = heading.id;
      option.selected = heading.id === DEFAULT_SECTION;
      pick.append(option);
    }
    pick.append(Object.assign(el('option', undefined, 'not-a-section (see the error)'), { value: 'not-a-section' }));
    label.append(pick);
    controls.append(label);
  }
  const button = el('button', 'wmt-call', 'Call');
  button.type = 'button';
  controls.append(button);
  card.append(controls);

  const schema = el('details', 'wmt-schema');
  schema.append(el('summary', undefined, 'Input schema'), el('pre', undefined, JSON.stringify(tool.inputSchema ?? {}, null, 2)));
  card.append(schema);

  const result = el('div', 'wmt-result');
  result.dataset.result = '';
  result.hidden = true;
  const pre = el('pre');
  pre.append(el('code'));
  result.append(el('p', 'wmt-meta'), pre);
  result.querySelector('p')!.dataset.meta = '';
  card.append(result);

  button.addEventListener('click', () => void call(pick ? { id: pick.value } : {}));
  return card;
}

async function init(root: HTMLElement) {
  if (root.dataset.ready) return;
  root.dataset.ready = 'true';

  const { context, provider } = modelContext();
  root.querySelector('[data-webmcp-provider]')!.textContent =
    provider === 'stand-in'
      ? 'No WebMCP in this browser, so agents cannot see these. The buttons still work.'
      : `WebMCP is on (${provider}). Agents in this browser can call these.`;

  const list = root.querySelector<HTMLElement>('[data-webmcp-tool-list]')!;
  list.replaceChildren();

  for (const tool of postTools) {
    let card: HTMLElement;
    const run = async (input: Json, who: 'you' | 'an agent') => {
      const result = await tool.execute(input ?? {});
      showCall(card, who, input ?? {}, result);
      return result;
    };
    card = toolCard(tool, (input) => run(input, 'you'));
    list.append(card);
    try {
      await context.registerTool({ ...tool, execute: (input) => run(input, 'an agent') });
    } catch (problem) {
      console.warn(`WebMCP: could not register ${tool.name}`, problem);
    }
  }
}

document.querySelectorAll<HTMLElement>('[data-webmcp-tools]').forEach((root) => void init(root));
