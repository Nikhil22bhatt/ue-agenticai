/*
 * Fragment Block
 * Include content on a page as a fragment.
 * Supports BOTH page fragments (.plain.html) AND Content Fragments (DAM).
 */
import {
  decorateMain,
  moveInstrumentation,
} from '../../scripts/scripts.js';
import {
  loadSections,
} from '../../scripts/aem.js';

/**
 * Loads a page fragment (standard EDS behavior — unchanged).
 */
export async function loadFragment(path) {
  if (path && path.startsWith('/')) {
    const resp = await fetch(`${path}.plain.html`);
    if (resp.ok) {
      const main = document.createElement('main');
      main.innerHTML = await resp.text();
      const resetAttributeBase = (tag, attr) => {
        main.querySelectorAll(`${tag}[${attr}^="./media_"]`).forEach((elem) => {
          elem[attr] = new URL(
            elem.getAttribute(attr),
            new URL(path, window.location),
          ).href;
        });
      };
      resetAttributeBase('img', 'src');
      resetAttributeBase('source', 'srcset');
      decorateMain(main);
      await loadSections(main);
      return main;
    }
  }
  return null;
}

/**
 * Extracts the CF/page path from the block.
 */
function extractPath(block) {
  // 1. Check for an anchor link
  const link = block.querySelector('a');
  if (link) {
    const href = link.getAttribute('href');
    if (href) return decodeURIComponent(href);
  }
  // 2. Check text content for a /content/dam/ path
  const allText = block.textContent.trim();
  const match = allText.match(/(\/[Cc]ontent\/[Dd]am\/[^\s]+)/);
  if (match) return match[1];
  // 3. Any /content/ path
  if (allText.startsWith('/content/')) return allText;
  // 4. Walk text nodes
  const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    const t = node.textContent.trim();
    if (t.match(/(\/[Cc]ontent\/[Dd]am\/)/)) return t;
    if (t.startsWith('/content/')) return t;
    node = walker.nextNode();
  }
  return allText || null;
}

/**
 * Normalizes path casing from Universal Editor.
 */
function normalizePath(rawPath) {
  if (!rawPath) return null;
  let p = rawPath
    .replace(/\/Content\//g, '/content/')
    .replace(/\/Dam\//g, '/dam/')
    .replace(/\/Agentic-Ai\//g, '/agentic-ai/')
    .replace(/\/En\//g, '/en/')
    .replace(/\/Fr\//g, '/fr/')
    .replace(/\s+/g, '')
    .trim();
  // DAM paths don't have .html — UE sometimes appends it via link rendering
  if (p.startsWith('/content/dam/')) {
    p = p.replace(/\.html$/, '');
  }
  return p;
}

/**
 * Tries a fetch and returns parsed JSON, or null on failure.
 */
async function tryFetch(url, options = {}) {
  try {
    const resp = await fetch(url, {
      credentials: 'include',
      headers: { Accept: 'application/json' },
      ...options,
    });
    // eslint-disable-next-line no-console
    console.log(`[Fragment] ${url} → ${resp.status}`);
    if (resp.ok) return resp.json();
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn(`[Fragment] fetch failed for ${url}:`, e.message);
  }
  return null;
}

/**
 * Fetches Content Fragment data.
 * Tries CF Fragments API v2 first, then Assets API v1 as fallback.
 */
async function fetchContentFragment(path) {
  // --- Approach 1: CF Fragments API v2 (by UUID lookup via path) ---
  const cfByPath = await tryFetch(
    `/adobe/sites/cf/fragments?path=${encodeURIComponent(path)}&limit=1`,
  );
  if (cfByPath) {
    // List endpoint returns { items: [...] }
    const item = cfByPath?.items?.[0] ?? cfByPath;
    if (item?.fields || item?.id) return item;
  }

  // --- Approach 2: Assets API v1 ---
  // Strip /content/dam/ prefix: /content/dam/foo/bar → /foo/bar
  const assetPath = path.replace(/^\/content\/dam/, '');
  const assetsData = await tryFetch(`/api/assets${assetPath}.json`);
  if (assetsData) return assetsData;

  // eslint-disable-next-line no-console
  console.warn('[Fragment] All fetch attempts failed for', path);
  return null;
}

/**
 * Normalises response into a simple { fieldName: { value, mimeType } } map.
 * Handles:
 *  - CF API v2: { fields: [{ name, values, mimeType }] }
 *  - Assets API v1: { properties: { elements: { name: { value } } } }
 */
function normaliseFields(data) {
  if (!data) return null;

  // CF API v2 — fields array
  if (Array.isArray(data.fields)) {
    return Object.fromEntries(
      data.fields.map((f) => [f.name, { value: f.values?.[0], mimeType: f.mimeType }]),
    );
  }

  // Assets API v1 — properties.elements
  if (data.properties?.elements) return data.properties.elements;

  // Elements at root
  if (data.elements) return data.elements;

  return null;
}

/**
 * Renders Content Fragment fields as HTML.
 */
function renderContentFragment(data) {
  // eslint-disable-next-line no-console
  console.log('[Fragment] Raw CF data:', JSON.stringify(data).substring(0, 300));

  const container = document.createElement('div');
  container.className = 'content-fragment';

  const els = normaliseFields(data);
  // eslint-disable-next-line no-console
  console.log('[Fragment] Normalised fields:', els ? Object.keys(els) : null);

  if (!els) return null;

  // FAQ model — question + answer
  if (els.question && els.answer) {
    container.classList.add('cf-faq');

    const catVal = els.category?.value;
    if (catVal) {
      const cat = document.createElement('span');
      cat.className = 'cf-category';
      cat.textContent = catVal;
      container.append(cat);
    }

    const q = document.createElement('h3');
    q.className = 'cf-question';
    q.textContent = els.question.value;
    container.append(q);

    const a = document.createElement('div');
    a.className = 'cf-answer';
    a.innerHTML = els.answer.value;
    container.append(a);

    return container;
  }

  // Blog model — title + body/main
  if (els.title && (els.body || els.main)) {
    container.classList.add('cf-blog');

    const title = document.createElement('h2');
    title.className = 'cf-title';
    title.textContent = els.title.value;
    container.append(title);

    const body = document.createElement('div');
    body.className = 'cf-body';
    body.innerHTML = (els.body || els.main).value;
    container.append(body);

    return container;
  }

  // Generic fallback — render all string/HTML fields
  Object.entries(els).forEach(([key, el]) => {
    const v = el?.value;
    if (v === undefined || v === null || v === '') return;
    if (typeof v === 'number') return;

    const field = document.createElement('div');
    field.className = `cf-field cf-field-${key}`;
    if (typeof v === 'string' && v.includes('<')) {
      field.innerHTML = v;
    } else if (typeof v === 'string') {
      field.textContent = v;
    }
    container.append(field);
  });

  return container.children.length > 0 ? container : null;
}

/**
 * @param {Element} block
 */
export default async function decorate(block) {
  /* eslint-disable no-console */
  console.log('[Fragment] Block innerHTML:', block.innerHTML.substring(0, 300));

  const rawPath = extractPath(block);
  console.log('[Fragment] Extracted path:', rawPath);

  if (!rawPath) {
    console.warn('[Fragment] No path found in block');
    return;
  }

  const path = normalizePath(rawPath);
  console.log('[Fragment] Normalized path:', path);
  /* eslint-enable no-console */

  // Content Fragment — path under /content/dam/
  if (path && path.startsWith('/content/dam/')) {
    block.textContent = '';
    block.classList.add('cf-loading');

    const data = await fetchContentFragment(path);
    if (data) {
      const rendered = renderContentFragment(data);
      if (rendered) {
        block.classList.remove('cf-loading');
        block.append(rendered);
        return;
      }
    }

    block.classList.remove('cf-loading');
    block.innerHTML = '<p class="cf-error">Content fragment could not be loaded.</p>';
  } else if (path) {
    // Page Fragment — standard .plain.html
    const fragment = await loadFragment(path);
    if (fragment) {
      const fragmentSection = fragment.querySelector(':scope .section');
      if (fragmentSection) {
        block.closest('.section').classList.add(...fragmentSection.classList);
        moveInstrumentation(block, block.parentElement);
        block.closest('.fragment').replaceWith(...fragment.childNodes);
      }
    }
  }
}
