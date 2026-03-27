/*
 * Fragment Block
 * Include content on a page as a fragment.
 * Supports BOTH page fragments (.plain.html) and Content Fragments (DAM assets).
 * https://www.aem.live/developer/block-collection/fragment
 */
import {
  decorateMain,
  moveInstrumentation,
} from '../../scripts/scripts.js';
import {
  loadSections,
} from '../../scripts/aem.js';

/**
 * Loads a page fragment.
 * @param {string} path The path to the page fragment
 * @returns {Promise<HTMLElement>} The root element of the fragment
 */
export async function loadFragment(path) {
  if (path && path.startsWith('/')) {
    const resp = await fetch(`${path}.plain.html`);
    if (resp.ok) {
      const main = document.createElement('main');
      main.innerHTML = await resp.text();

      const resetAttributeBase = (tag, attr) => {
        main.querySelectorAll(`${tag}[${attr}^="./media_"]`).forEach((elem) => {
          elem[attr] = new URL(elem.getAttribute(attr), new URL(path, window.location)).href;
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
 * Loads a Content Fragment from the DAM via the AEM JSON endpoint.
 * @param {string} path The DAM path to the Content Fragment
 * @returns {Promise<HTMLElement|null>} Rendered HTML element or null
 */
async function loadContentFragment(path) {
  try {
    // Try the CF JSON endpoint (jcr:content/data.json)
    const resp = await fetch(`${path}/jcr:content/data.json`);
    if (!resp.ok) return null;

    const data = await resp.json();

    // Build a container with the CF fields
    const container = document.createElement('div');
    container.className = 'content-fragment';

    // data can have a "master" variation or fields at root level
    const fields = data.master || data;

    Object.entries(fields).forEach(([key, value]) => {
      // Skip JCR metadata fields
      if (key.startsWith('jcr:') || key.startsWith('cq:') || key === 'sling:resourceType') return;

      if (typeof value === 'string' && value.trim()) {
        const field = document.createElement('div');
        field.className = `cf-field cf-field-${key}`;
        field.setAttribute('data-field', key);

        // If the value contains HTML tags, render as HTML
        if (value.includes('<') && value.includes('>')) {
          field.innerHTML = value;
        } else {
          field.textContent = value;
        }
        container.append(field);
      }
    });

    return container.children.length > 0 ? container : null;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Error loading content fragment:', e);
    return null;
  }
}

/**
 * @param {Element} block
 */
export default async function decorate(block) {
  const link = block.querySelector('a');
  const path = link ? link.getAttribute('href') : block.textContent.trim();

  if (!path) return;

  // Determine if this is a Content Fragment (DAM path) or a page fragment
  if (path.startsWith('/content/dam/')) {
    // Content Fragment — fetch structured data and render
    const cfElement = await loadContentFragment(path);
    if (cfElement) {
      block.textContent = '';
      block.append(cfElement);
    }
  } else {
    // Page Fragment — use the standard .plain.html approach
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
