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
 * Builds the AEM author base URL from the current page location.
 * Works in Universal Editor (author domain) and falls back for other envs.
 */
function getAemBase() {
  const { hostname, protocol } = window.location;
  if (hostname.includes('adobeaemcloud.com')) {
    return `${protocol}//${hostname}`;
  }
  // Fallback for EDS preview/live — update this to your author URL
  return 'https://author-p178403-e1883757.adobeaemcloud.com';
}

/**
 * Fetches Content Fragment data via AEM Assets HTTP API.
 */
async function fetchContentFragment(path) {
  const aemBase = getAemBase();
  const apiUrl = `${aemBase}/api/assets${path}.json`;

  try {
    const resp = await fetch(apiUrl, { credentials: 'include' });
    if (resp.ok) return resp.json();
    // eslint-disable-next-line no-console
    console.warn(`CF fetch returned ${resp.status} for ${apiUrl}`);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('CF fetch error:', e);
  }
  return null;
}

/**
 * Renders Content Fragment fields as HTML based on detected model.
 */
function renderContentFragment(data) {
  const container = document.createElement('div');
  container.className = 'content-fragment';

  const elements = data?.properties?.elements;
  if (!elements) return null;

  // FAQ model — has question + answer fields
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

  // Blog Post model — has title + body fields
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

  // Generic fallback — render all string/HTML fields
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
 * Normalizes the path from the Universal Editor.
 * The UE sometimes capitalizes paths like /Content/Dam/...
 */
function normalizePath(rawPath) {
  let p = rawPath.trim();
  if (p.startsWith('/Content/')) {
    p = p.replace(/^\/Content\//i, '/content/');
  }
  if (p.includes('/Dam/')) {
    p = p.replace(/\/Dam\//i, '/dam/');
  }
  if (p.includes('/Agentic-Ai/')) {
    p = p.replace(/\/Agentic-Ai\//i, '/agentic-ai/');
  }
  if (p.includes('/En/')) {
    p = p.replace(/\/En\//i, '/en/');
  }
  return p;
}

/**
 * @param {Element} block
 */
export default async function decorate(block) {
  const link = block.querySelector('a');
  const rawPath = link ? link.getAttribute('href') : block.textContent.trim();

  if (!rawPath) return;

  const path = normalizePath(rawPath);

  // Content Fragment — path starts with /content/dam/
  if (path.startsWith('/content/dam/')) {
    // Clear the raw path text from the block
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

    // Fetch or render failed
    block.classList.remove('cf-loading');
    block.innerHTML = '<p class="cf-error">Content fragment could not be loaded.</p>';
    // eslint-disable-next-line no-console
    console.error(`Fragment block: failed to load CF at ${path}`);
  } else {
    // Page Fragment — standard .plain.html approach
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
