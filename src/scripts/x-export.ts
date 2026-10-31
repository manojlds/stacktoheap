// Tools for posting a blog post as an X Article. BlogPost.astro loads this
// only when the URL has ?x. They copy the post as rich text or Markdown and
// each diagram, image or the cover as a PNG; the post itself is unchanged.

import { OMITTED } from '@/lib/x-export';

const IMAGES = '.pele-diagram, img';
// Left out of copies: the series box and the like (skip), interactive parts (omit).
const SKIP = '[data-x-actions], [data-x-skip]';
const OMIT = '[data-x-omit]';
const PELE_VARS = [
  '--pele-bg', '--pele-fg', '--pele-fg-on-light', '--pele-fg-on-dark', '--pele-muted', '--pele-line',
  '--pele-surface', '--pele-surface-alt', '--pele-border', '--pele-accent', '--pele-critical', '--pele-error',
];

/** The images the copies number, in page order; none inside parts the copies leave out. */
const images = (root: Element) =>
  [...root.querySelectorAll(IMAGES)].filter((element) => !element.closest(`${SKIP}, ${OMIT}`));

/** An image is exported with its figure, if it has one. */
const visual = (element: Element) => (element.matches('img') ? (element.closest('figure') ?? element) : element);

function button(label: string, onClick: () => void, primary = false): HTMLButtonElement {
  const element = document.createElement('button');
  element.type = 'button';
  element.className = primary ? 'x-button x-button-primary' : 'x-button';
  element.textContent = label;
  element.addEventListener('click', (event) => {
    // Diagrams open the lightbox on click; keep the buttons from doing that.
    event.stopPropagation();
    onClick();
  });
  return element;
}

function actions(label: string, ...buttons: HTMLButtonElement[]): HTMLElement {
  const row = document.createElement('div');
  row.className = 'x-actions not-prose';
  row.dataset.xActions = '';
  const name = document.createElement('span');
  name.textContent = label;
  row.append(name, ...buttons);
  return row;
}

/** Resolve the theme's CSS variables onto a detached copy, which loses the page's styles. */
function standalone(svg: SVGSVGElement): SVGSVGElement {
  const copy = svg.cloneNode(true) as SVGSVGElement;
  const specified = getComputedStyle(svg);
  const probe = document.createElement('span');
  document.body.append(probe);
  for (const name of PELE_VARS) {
    const value = specified.getPropertyValue(name).trim();
    if (!value) continue;
    probe.style.color = value;
    copy.style.setProperty(name, getComputedStyle(probe).color);
  }
  probe.remove();
  for (const name of ['--pele-font', '--pele-font-mono', '--pele-radius']) {
    const value = specified.getPropertyValue(name).trim();
    if (value) copy.style.setProperty(name, value);
  }
  return copy;
}

async function draw(source: string, width: number, height: number, pad: number): Promise<Blob> {
  const image = new Image();
  image.src = source;
  await image.decode();
  const scale = 2;
  const canvas = document.createElement('canvas');
  canvas.width = Math.round((width + pad * 2) * scale);
  canvas.height = Math.round((height + pad * 2) * scale);
  const context = canvas.getContext('2d')!;
  context.fillStyle = '#fff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, pad * scale, pad * scale, width * scale, height * scale);
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('PNG export failed'))), 'image/png'),
  );
}

async function diagramPng(figure: Element): Promise<Blob> {
  const svg = figure.querySelector('svg')!;
  const { width, height } = svg.viewBox.baseVal;
  const copy = standalone(svg);
  copy.setAttribute('width', String(width));
  copy.setAttribute('height', String(height));
  const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(copy)], { type: 'image/svg+xml' }));
  try {
    return await draw(url, width, height, 16);
  } finally {
    URL.revokeObjectURL(url);
  }
}

function imagePng(img: HTMLImageElement): Promise<Blob> {
  return draw(img.currentSrc || img.src, img.naturalWidth / 2, img.naturalHeight / 2, 0);
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

async function copyRich(html: string, text: string): Promise<boolean> {
  try {
    await navigator.clipboard.write([
      new ClipboardItem({
        'text/html': new Blob([html], { type: 'text/html' }),
        'text/plain': new Blob([text], { type: 'text/plain' }),
      }),
    ]);
    return true;
  } catch {
    return copyText(text);
  }
}

/** The site's own origin, from the canonical link, so copies work outside the site. */
function siteOrigin(): string {
  const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href;
  return canonical ? new URL(canonical).origin : location.origin;
}

export function init(postId: string) {
  const body = document.querySelector<HTMLElement>('[data-post-body]');
  if (!body) return;
  document.documentElement.classList.add('x-export');

  const status = document.createElement('span');
  status.className = 'text-sm text-muted-foreground';
  status.setAttribute('role', 'status');
  const say = (text: string) => (status.textContent = text);

  const origin = siteOrigin();
  const markdown = fetch(`/x-source/${postId}.json`)
    .then((response) => (response.ok ? response.json() : Promise.reject(new Error(String(response.status)))))
    // Links to other posts are site-relative; give them the full address.
    .then((data: { markdown: string }) => data.markdown.replace(/\]\(\//g, `](${origin}/`));
  // Markdown tables in source order, matching the rendered <table> elements. Code blocks can hold | lines too.
  const tables = markdown.then((source) =>
    [...source.replace(/^```[\s\S]*?^```/gm, '').matchAll(/^(?:\|.*\|[ \t]*\n?)+/gm)].map((match) =>
      match[0].trimEnd(),
    ),
  );

  async function saveImage(png: () => Promise<Blob>, name: string, download: boolean) {
    const failed = `Could not make a PNG of ${name}. Screenshot it instead.`;
    if (download) {
      let url: string;
      try {
        url = URL.createObjectURL(await png());
      } catch {
        say(failed);
        return;
      }
      Object.assign(document.createElement('a'), { href: url, download: `${name}.png` }).click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      say(`Downloaded ${name}.png.`);
      return;
    }
    // Safari wants the PNG as a promise, handed over while the click is still current.
    const blob = png();
    try {
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      say(`Copied ${name} as an image.`);
    } catch {
      const made = await blob.then(
        () => true,
        () => false,
      );
      say(made ? 'This browser would not copy the image. Use Download PNG instead.' : failed);
    }
  }
  const imageButtons = (png: () => Promise<Blob>, name: string) => [
    button('Copy image', () => saveImage(png, name, false)),
    button('Download PNG', () => saveImage(png, name, true)),
  ];

  // The body as X should receive it: diagrams, images and tables become placeholders.
  function exportBody(): HTMLElement {
    const copy = body!.cloneNode(true) as HTMLElement;
    copy.querySelectorAll(SKIP).forEach((element) => element.remove());
    copy.querySelectorAll(OMIT).forEach((element) => {
      const marker = document.createElement('p');
      marker.textContent = OMITTED;
      element.replaceWith(marker);
    });
    copy.querySelectorAll<HTMLAnchorElement>('a[href]').forEach((link) => {
      const href = link.getAttribute('href')!;
      if (href.startsWith('/')) link.setAttribute('href', origin + href);
    });
    images(copy).forEach((element, index) => {
      const marker = document.createElement('p');
      marker.textContent = `[Insert image ${index + 1}]`;
      visual(element).replaceWith(marker);
    });
    copy.querySelectorAll('table').forEach((table, index) => {
      const marker = document.createElement('p');
      marker.textContent = `[Insert table ${index + 1}]`;
      table.replaceWith(marker);
    });
    return copy;
  }

  const toolbar = document.createElement('div');
  toolbar.className = 'x-toolbar not-prose';
  const title = document.querySelector('h1')?.textContent?.trim() ?? '';
  toolbar.append(
    button('Copy title', async () => say((await copyText(title)) ? 'Title copied.' : 'Could not copy the title.')),
    button(
      'Copy body',
      async () => {
        const copy = exportBody();
        // innerText needs the element in the document to see paragraph breaks.
        copy.style.cssText = 'position:absolute;left:-9999px';
        document.body.append(copy);
        const text = copy.innerText;
        copy.remove();
        say((await copyRich(copy.innerHTML, text)) ? 'Body copied with formatting.' : 'Could not copy the body.');
      },
      true,
    ),
    button('Copy body as Markdown', async () => {
      try {
        say((await copyText(await markdown)) ? 'Body copied as Markdown.' : 'Could not copy the Markdown.');
      } catch {
        say('Could not load the Markdown for this post.');
      }
    }),
    status,
  );
  body.before(toolbar);

  const cover = document.querySelector<HTMLElement>('[data-post-cover]');
  const coverImage = cover?.querySelector('img');
  if (cover && coverImage) cover.after(actions('Cover', ...imageButtons(() => imagePng(coverImage), `${postId}-cover`)));

  images(body).forEach((element, index) => {
    const n = index + 1;
    const png = element instanceof HTMLImageElement ? () => imagePng(element) : () => diagramPng(element);
    visual(element).after(actions(`Image ${n}`, ...imageButtons(png, `${postId}-${n}`)));
  });

  [...body.querySelectorAll('table')]
    .filter((table) => !table.closest(OMIT))
    .forEach((table, index) => {
      const n = index + 1;
      table.after(
        actions(
          `Table ${n}`,
          button('Copy as Markdown', async () => {
            try {
              const source = (await tables)[index];
              say(source && (await copyText(source)) ? `Copied table ${n} as Markdown.` : `Could not copy table ${n}.`);
            } catch {
              say('Could not load the Markdown for this post.');
            }
          }),
        ),
      );
    });

  say('X export tools on.');
}
