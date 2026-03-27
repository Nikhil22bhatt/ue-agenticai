/*
 * Fragment Block
 * Include content on a page as a fragment.
 * Supports BOTH page fragments (.plain.html) AND Content Fragments (DAM).
 *
 * The fragment block model uses "aem-content" component for the reference field.
 * EDS renders the reference as a link inside the block table structure.
 */
import {
  decorateMain,
  moveInstrumentation,
} from '../../scripts/scripts.js';
import {
  loadSections,
} from '../../scripts/aem.js';

/**
 * Loads a page fragment (standard EDS behavior).
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
 * The aem-content component renders references in several possible ways.
 */
function extractPath(block) {
  // Method 1: <a> tag (most common for aem-content references)
  const link = block.querySelector('a');
  if (link) {
    const href = link.getAttribute('href');
    if (href) return decodeURIComponent(href);
  }

  // Method 2: All text content — look for a path pattern
  const allText = block.textContent.trim();
  const match = allText.match(/(\/[Cc]ontent\/[Dd]am\/[^\s]+)/);
  if (match) return match[1];

  // Method 3: Any path-like content
  if (allText.startsWith('/')) return allText;

  // Method 4: Check all nested elements for path text
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
  let p = rawPath.trim();
  p = p.replace(/\/Content\//g, '/content/');
  p = p.replace(/\/Dam\//g, '/dam/');
  p = p.replace(/\/Agentic-Ai\//g, '/agentic-ai/');
  p = p.replace(/\/En\//g, '/en/');
  p = p.replace(/\/Fr\//g, '/fr/');
  p = p.replace(/\s+/g, '').trim();
  return p;
}

/**
 * Builds the AEM base URL for API calls.
 */
function getAemBase() {
  const { hostname, protocol } = window.location;
  if (hostname.includes('adobeaemcloud.com')) {
    return `${protocol}//${hostname}`;
  }
  return 'https://author-p178403-e1883757.adobeaemcloud.com';
}

/**
 * Fetches Content Fragment data via AEM Assets HTTP API.
 */
async function fetchContentFragment(path) {
  const aemBase = getAemBase();
  // AEM Assets API expects path WITHOUT /content/dam/ prefix
  // e.g., /content/dam/agentic-ai/en/my-cf → /api/assets/agentic-ai/en/my-cf.json
  const assetPath = path.replace(/^\/content\/dam\//, '/');
  const apiUrl = `${aemBase}/api/assets${assetPath}.json`;

  /* eslint-disable no-console */
  console.log('[Fragment] Fetching CF:', apiUrl);

  try {
    const resp = await fetch(apiUrl, { credentials: 'include' });
    console.log('[Fragment] Response status:', resp.status);
    if (resp.ok) {
      const data = await resp.json();
      console.log('[Fragment] CF data received:', Object.keys(data));
      return data;
    }
    console.warn(`[Fragment] CF fetch returned ${resp.status} for ${apiUrl}`);
  } catch (e) {
    console.warn('[Fragment] CF fetch error:', e.message);
  }
  /* eslint-enable no-console */
  return null;
}

/**
 * Renders Content Fragment fields as HTML.
 */
function renderContentFragment(data) {
  const container = document.createElement('div');
  container.className = 'content-fragment';

  const elements = data?.properties?.elements;
  if (!elements) {
    // eslint-disable-next-line no-console
    console.warn('[Fragment] No elements found in CF data. Keys:', Object.keys(data?.properties || {}));
    return null;
  }

  // FAQ model — has question + answer
  if (elements.question && elements.answer) {
    container.classList.add('cf-faq');

    if (elements.category?.value) {
      const cat = document.createElement('span');
      cat.className = 'cf-category';
      cat.textContent = elements.category.value;
      container.append(cat);
    }

    const q = document.createElement('h3');
    q.className = 'cf-question';
    q.textContent = elements.question.value;
    container.append(q);

    const a = document.createElement('div');
    a.className = 'cf-answer';
    a.innerHTML = elements.answer.value;
    container.append(a);

    return container;
  }

  // Blog Post model — has title + body
  if (elements.title && (elements.body || elements.main)) {
    container.classList.add('cf-blog');

    const title = document.createElement('h2');
    title.className = 'cf-title';
    title.textContent = elements.title.value;
    container.append(title);

    const body = document.createElement('div');
    body.className = 'cf-body';
    body.innerHTML = (elements.body || elements.main).value;
    container.append(body);

    return container;
  }

  // Generic fallback
  Object.entries(elements).forEach(([key, el]) => {
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
  console.log('[Fragment] Block HTML:', block.innerHTML.substring(0, 300));

  const rawPath = extractPath(block);
  console.log('[Fragment] Extracted path:', rawPath);

  if (!rawPath) {
    console.warn('[Fragment] No path found in block');
    return;
  }

  const path = normalizePath(rawPath);
  console.log('[Fragment] Normalized path:', path);
  /* eslint-enable no-console */

  // Content Fragment — path starts with /content/dam/
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
