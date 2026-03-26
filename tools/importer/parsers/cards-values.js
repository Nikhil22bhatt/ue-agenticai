/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-values. Base: cards. Source: https://www.tataelxsi.com/
 * Extracts value items from .hmcrers2
 * xwalk model: card { image (reference), text (richtext) }
 * Each card = 1 row with 2 columns: [image | text]
 */
export default function parse(element, { document }) {
  const items = element.querySelectorAll('.hmcrers21');
  const cells = [];

  items.forEach((item) => {
    const img = item.querySelector('.hmcrers2g img');
    const heading = item.querySelector('h5');

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

    cells.push([imgFrag, textFrag]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-values', cells });
  element.replaceWith(block);
}
