/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-banner. Base: cards. Source: https://www.tataelxsi.com/
 * Extracts fixed banner cards from .hmoverlbnr.hmlr2, .hmlr3, .hmlr4, .hmbaner2 .hmoverlbnr
 * xwalk model: card { image (reference), text (richtext) }
 * Each card = 1 row with 2 columns: [image | text]
 */
export default function parse(element, { document }) {
  const img = element.querySelector('img');
  const heading = element.querySelector('h3, h2, h1');
  const description = element.querySelector('p:not(.hmlink)');
  const link = element.querySelector('a[href]');

  const cells = [];

  // Column 1: image with field hint
  const imgFrag = document.createDocumentFragment();
  imgFrag.appendChild(document.createComment(' field:image '));
  if (img) {
    const pic = document.createElement('picture');
    const newImg = document.createElement('img');
    newImg.src = img.src;
    newImg.alt = img.alt || '';
    pic.appendChild(newImg);
    imgFrag.appendChild(pic);
  }

  // Column 2: text content with field hint
  const textFrag = document.createDocumentFragment();
  textFrag.appendChild(document.createComment(' field:text '));
  if (heading) textFrag.appendChild(heading.cloneNode(true));
  if (description && description.textContent.trim()) textFrag.appendChild(description.cloneNode(true));
  if (link && link.href && !link.href.startsWith('javascript:')) {
    const a = document.createElement('a');
    a.href = link.href;
    a.textContent = link.textContent.trim() || 'Check it out';
    const p = document.createElement('p');
    p.appendChild(a);
    textFrag.appendChild(p);
  }

  cells.push([imgFrag, textFrag]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-banner', cells });
  element.replaceWith(block);
}
