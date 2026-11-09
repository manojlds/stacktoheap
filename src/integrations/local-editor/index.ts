// A local editor for blog posts, available only under `astro dev`.
//
// /_edit lists the posts and /_edit/<id> edits one: markdown source on one
// side, the real post page on the other (tabs on narrow screens). Saving
// writes the file back to src/content/blog, and the dev server reloads the
// preview. Nothing here is part of a production build.

import type { AstroIntegration } from 'astro';
import type { Plugin } from 'vite';
import { createHash } from 'node:crypto';
import { readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

const API = '/_edit/api/file';
const hash = (text: string) => createHash('sha1').update(text).digest('hex');

/** Read and write post files. Only existing .md/.mdx files under the blog folder. */
function fileApi(root: string): Plugin {
  const blogDir = path.resolve(root, 'src/content/blog');

  const resolvePost = async (relative: unknown) => {
    if (typeof relative !== 'string') return undefined;
    const file = path.resolve(root, relative);
    if (!file.startsWith(blogDir + path.sep) || !/\.mdx?$/.test(file)) return undefined;
    const info = await stat(file).catch(() => undefined);
    return info?.isFile() ? file : undefined;
  };

  return {
    name: 'local-editor-file-api',
    configureServer(server) {
      server.middlewares.use(API, async (req, res) => {
        const send = (status: number, body: unknown) => {
          res.statusCode = status;
          res.setHeader('content-type', 'application/json');
          res.end(JSON.stringify(body));
        };
        try {
          if (req.method === 'GET') {
            const query = new URL(req.url ?? '', 'http://local').searchParams;
            const file = await resolvePost(query.get('path'));
            if (!file) return send(404, { error: 'No such post file' });
            const text = await readFile(file, 'utf8');
            return send(200, { text, hash: hash(text) });
          }
          if (req.method === 'PUT') {
            // A JSON body and a custom header both force a CORS preflight, which
            // this server never answers, so other sites cannot write files.
            if (req.headers['x-local-editor'] !== '1' || !req.headers['content-type']?.includes('application/json')) {
              return send(403, { error: 'Not from the editor' });
            }
            let raw = '';
            for await (const chunk of req) raw += chunk;
            const { path: relative, text, baseHash } = JSON.parse(raw);
            const file = await resolvePost(relative);
            if (!file || typeof text !== 'string') return send(400, { error: 'Bad request' });
            const current = await readFile(file, 'utf8');
            if (hash(current) !== baseHash) {
              return send(409, { error: 'The file changed on disk since you opened it', text: current, hash: hash(current) });
            }
            await writeFile(file, text);
            return send(200, { hash: hash(text) });
          }
          send(405, { error: 'Method not allowed' });
        } catch (problem) {
          send(500, { error: problem instanceof Error ? problem.message : String(problem) });
        }
      });
    },
  };
}

export function localEditor(): AstroIntegration {
  return {
    name: 'local-editor',
    hooks: {
      'astro:config:setup': ({ command, config, injectRoute, updateConfig }) => {
        if (command !== 'dev') return;
        injectRoute({ pattern: '/_edit', entrypoint: new URL('./EditorIndex.astro', import.meta.url) });
        injectRoute({ pattern: '/_edit/[id]', entrypoint: new URL('./EditorPost.astro', import.meta.url) });
        updateConfig({ vite: { plugins: [fileApi(new URL('.', config.root).pathname)] } });
      },
    },
  };
}
