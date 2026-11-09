// The editor page: load the post source, save it back, keep the preview current.
//
// Unsaved text is also kept in localStorage, because phones discard background
// tabs. Saves send the hash of the version they started from, so a file that
// changed on disk meanwhile (another editor, git) is never overwritten silently.

const API = '/_edit/api/file';
const body = document.body;
const file = body.dataset.file!;
const source = document.querySelector<HTMLTextAreaElement>('[data-source]')!;
const preview = document.querySelector<HTMLIFrameElement>('[data-preview]')!;
const saveButton = document.querySelector<HTMLButtonElement>('[data-save]')!;
const statusLabel = document.querySelector<HTMLElement>('[data-status]')!;
const notice = document.querySelector<HTMLElement>('[data-notice]')!;
const backupKey = `local-editor:${file}`;

let baseHash = '';
let savedText = '';
let saving = false;

const dirty = () => source.value !== savedText;

function refresh(message?: string) {
  body.dataset.dirty = String(dirty());
  saveButton.disabled = saving || !dirty();
  statusLabel.textContent = message ?? (dirty() ? 'Unsaved' : 'Saved');
}

function showNotice(text: string, actions: [string, () => void][] = []) {
  notice.replaceChildren(document.createTextNode(text));
  if (actions.length) notice.append(document.createElement('br'));
  for (const [label, run] of actions) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.addEventListener('click', () => {
      notice.hidden = true;
      run();
    });
    notice.append(button);
  }
  notice.hidden = false;
}

function useDiskVersion(text: string, hash: string) {
  source.value = savedText = text;
  baseHash = hash;
  localStorage.removeItem(backupKey);
  refresh();
}

// --- Preview: reload after a save, keeping the scroll position --------------

let pendingScroll: number | undefined;
let reloadTimer: number | undefined;

preview.addEventListener('load', () => {
  window.clearTimeout(reloadTimer);
  if (pendingScroll === undefined) return;
  const y = pendingScroll;
  pendingScroll = undefined;
  // Let images and diagrams lay out before scrolling back.
  setTimeout(() => preview.contentWindow?.scrollTo(0, y), 150);
});

function reloadPreview() {
  const frame = preview.contentWindow;
  if (!frame) return;
  pendingScroll = frame.scrollY;
  // The dev server usually reloads the page itself when the file changes.
  // If it has not after a moment, reload it here.
  window.clearTimeout(reloadTimer);
  reloadTimer = window.setTimeout(() => frame.location.reload(), 1500);
}

// --- Load and save -----------------------------------------------------------

async function load() {
  const response = await fetch(`${API}?path=${encodeURIComponent(file)}`);
  const data = await response.json();
  if (!response.ok) return refresh(data.error ?? 'Could not load');
  useDiskVersion(data.text, data.hash);
  source.disabled = false;

  const backup = localStorage.getItem(backupKey);
  if (backup !== null && backup !== data.text) {
    showNotice('You have unsaved changes from an earlier visit.', [
      ['Restore them', () => ((source.value = backup), refresh())],
      ['Discard them', () => localStorage.removeItem(backupKey)],
    ]);
  }
}

async function save() {
  if (saving || !dirty()) return;
  saving = true;
  refresh('Saving…');
  const text = source.value;
  try {
    const response = await fetch(API, {
      method: 'PUT',
      headers: { 'content-type': 'application/json', 'x-local-editor': '1' },
      body: JSON.stringify({ path: file, text, baseHash }),
    });
    const data = await response.json();
    if (response.status === 409) {
      showNotice('This file changed on disk after you opened it.', [
        ['Load the disk version', () => useDiskVersion(data.text, data.hash)],
        ['Keep mine and save', () => ((baseHash = data.hash), void save())],
      ]);
      return;
    }
    if (!response.ok) throw new Error(data.error ?? `HTTP ${response.status}`);
    baseHash = data.hash;
    savedText = text;
    if (source.value === text) localStorage.removeItem(backupKey);
    reloadPreview();
  } catch (problem) {
    showNotice(`Save failed: ${problem instanceof Error ? problem.message : String(problem)}`);
  } finally {
    saving = false;
    refresh();
  }
}

// --- Wiring --------------------------------------------------------------------

source.addEventListener('input', () => {
  if (dirty()) localStorage.setItem(backupKey, source.value);
  else localStorage.removeItem(backupKey);
  refresh();
});

saveButton.addEventListener('click', () => void save());

document.addEventListener('keydown', (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
    event.preventDefault();
    void save();
  }
});

window.addEventListener('beforeunload', (event) => {
  if (dirty()) event.preventDefault();
});

for (const tab of document.querySelectorAll<HTMLButtonElement>('[data-tab]')) {
  tab.addEventListener('click', () => {
    body.dataset.view = tab.dataset.tab;
    for (const other of document.querySelectorAll<HTMLButtonElement>('[data-tab]')) {
      other.setAttribute('aria-pressed', String(other === tab));
    }
  });
}

// Saving changes the content collection, and the dev server then reloads every
// open page, this one included, which would reset the tab, cursor and scroll.
// Vite lets listeners see the reload payload before it acts, and it reloads
// only the page an .html path names, so point it at a page that does not exist.
// The preview frame has its own client and still reloads. If Vite changes this,
// the editor just reloads too: nothing is lost, the text was saved.
import.meta.hot?.on('vite:beforeFullReload', (payload: { path?: string }) => {
  payload.path = '/__local-editor-keeps-its-state.html';
});

void load();
