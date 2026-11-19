# AGENTS.md

Guidance for coding agents working in this repo. `CLAUDE.md` is a symlink to this file. `README.md` covers the
stack and deploy.

## Commands

```bash
pnpm install
pnpm dev        # astro dev; draft posts are visible here
pnpm build      # astro check, then astro build; run it before handing a post over
```

The preview service is in `pitchfork.toml` (`astro dev` on 127.0.0.1:4321). Start it with
`vaibhav dev start stacktoheap preview`, stop it with `vaibhav dev stop stacktoheap preview`.

## Posts

- One MDX file per post in `src/content/blog/`. The frontmatter schema is in `src/content.config.ts`.
- A post's address is `/blog/YYYY/MM/DD/<file name>`, from its `date`.
- `draft: true` keeps a post out of the index, tags, RSS and the production build. Its page still renders under
  `astro dev`.
- Posts in a series carry `series: { name, part }`. Look up the highest `part` before adding one.
- Do not end a post with a sources or references list. Link each source where the post first uses it, and state
  the versions used in the text.
- Headings in a post body start at `#`.

## Images

Images live in `public/images/` and are referenced as `/images/<name>`. Keep the SVG source beside each PNG.

**Hero images** are 1200×630 PNGs named `<post>-hero.png`, set as `hero_image` in the frontmatter. The recent ones
are hand-written SVG: dark navy background, a small spaced-capitals kicker (`EXPLORING PI`), the title, one line
under it, and an illustration below. Start from the newest `*-hero.svg` and render it:

```bash
node -e 'require("sharp")(process.argv[1], { density: 72 }).resize(1200, 630).flatten({ background: "#121c2f" }).png().toFile(process.argv[2])' \
  public/images/<post>-hero.svg public/images/<post>-hero.png
```

`sharp` is installed as a dependency of Astro. Text is rendered with the fonts on this machine: the SVGs use
DejaVu Sans and DejaVu Sans Mono for heroes and Noto Sans for diagrams.

## Step diagrams

For a diagram that shows parts and numbered steps between them, use `scripts/diagrams/` and not Mermaid. Mermaid
(` ```mermaid ` blocks, drawn by `src/plugins/pele-diagrams.ts`) is still fine for a quick flowchart or a sequence.

```bash
python3 scripts/diagrams/pi-durable-heart-actors.py   # writes the .svg and .png for that post
```

- `scripts/diagrams/lib.py` has the helpers and the palette: `box` (a part: bold title, grey subtitle), `panel` (a
  beige container for a store or a group), `row` (a table row that is done, dropped or pending), `chip` (a small
  named item), `arrow` (an SVG path with an arrowhead), `step` (a numbered label beside an arrow), and `write`
  (saves the SVG and renders the PNG).
- Add one file per post, named after the post, that imports `lib` and calls `write("<post>-<name>", width, height,
  title, description, body)` once per diagram. The title and description become the SVG's `<title>` and `<desc>`.
- There is no layout engine. Every position is a pixel coordinate on a 1400-wide canvas, and text is not measured.
  After each run, open the PNG and look for labels that overlap a box or run off an edge, then move them.
- The conventions: one accent colour for the part the diagram is about and for the step labels, red only for
  something that failed, dark outlines for everything else, at most about six numbered steps.
- Embed with an `<img>` tag and write alt text that says what the diagram shows, step by step:

```mdx
<img src="/images/<post>-<name>.png" width="1400" alt="…" style="display:block;margin:0 auto;border-radius:12px;" />
```

The diagrams have a white background in both the light and the dark theme.
