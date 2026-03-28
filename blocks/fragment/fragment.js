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
  const link = block.querySelector('a');
  if (link) {
    const href = link.getAttribute('href');
    if (href) return decodeURIComponent(href);
  }
  const allText = block.textContent.trim();
  const match = allText.match(/(\/[Cc]ontent\/[Dd]am\/[^\s]+)/);
  if (match) return match[1];
  if (allText.startsWith('/')) return allText;
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
  return rawPath
    .replace(/\/Content\//g, '/content/')
    .replace(/\/Dam\//g, '/dam/')
    .replace(/\/Agentic-Ai\//g, '/agentic-ai/')
    .replace(/\/En\//g, '/en/')
    .replace(/\/Fr\//g, '/fr/')
    .replace(/\s+/g, '')
    .trim();
}

/**
 * Fetches Content Fragment data via AEM CF Fragments API v2.
 * Endpoint: /adobe/sites/cf/fragments?path={path}
 * Returns fields as an array: [{ name, type, values, mimeType }]
 */
async function fetchContentFragment(path) {
  const apiUrl = `/adobe/sites/cf/fragments?path=${encodeURIComponent(path)}&limit=1`;

  /* eslint-disable no-console */
  console.log('[Fragment] Fetching CF:', apiUrl);

  try {
    const resp = await fetch(apiUrl, {
      credentials: 'same-origin',
      headers: { Accept: 'application/json' },
    });
    console.log('[Fragment] Response status:', resp.status);
    if (resp.ok) {
      const data = await resp.json();
      // API returns { items: [...] }
      const item = data?.items?.[0] || data;
      console.log('[Fragment] CF data received');
      return item;
    }
    console.warn(`[Fragment] CF fetch returned ${resp.status}`);
  } catch (e) {
    console.warn('[Fragment] CF fetch error:', e.message);
  }
  /* eslint-enable no-console */
  return null;
}

/**
 * Normalises CF API v2 fields array into a simple { name: { value, mimeType } } map.
 * CF API v2 returns: fields: [{ name, type, values: [...], mimeType }]
 */
function normaliseFields(data) {
  // CF API v2 format — fields is an array
  if (Array.isArray(data?.fields)) {
    return Object.fromEntries(
      data.fields.map((f) => [f.name, { value: f.values?.[0], mimeType: f.mimeType }]),
    );
  }
  // Assets API v1 format — fields under properties.elements or elements
  return data?.properties?.elements || data?.elements || null;
}

/**
 * Renders Content Fragment fields as HTML.
 */
function renderContentFragment(data) {
  const container = document.createElement('div');
  container.className = 'content-fragment';

  const els = normaliseFields(data);
  if (!els) return null;

  // FAQ model — has question + answer
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

  // Blog Post model — has title + body
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
    const v = el.value;
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
  console.log('[Fragment] Block innerHTML:', block.innerHTML.substring(0, 200));

  const rawPath = extractPath(block);
  console.log('[Fragment] Extracted path:', rawPath);

  if (!rawPath) {
    console.warn('[Fragment] No path found');
    return;
  }

  const path = normalizePath(rawPath);
  console.log('[Fragment] Normalized path:', path);
  /* eslint-enable no-console */

  // Content Fragment — lives under /content/dam/
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
