/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-insights. Base: cards. Source: https://www.tataelxsi.com/
 * Extracts insight/blog article items from .recogms2.botm2 .recoglst
 * xwalk model: card { image (reference), text (richtext) }
 * Each card = 1 row with 2 columns: [image | text]
 */
export default function parse(element, { document }) {
  const items = element.querySelectorAll('.servccrsl2');
  const cells = [];

  items.forEach((item) => {
    const img = item.querySelector('.servccrslig img');
    const heading = item.querySelector('.servdtls7 h5, .servdtls7 h4, .servdtls7 h3');
    const description = item.querySelector('.servdtls7 p');
    const link = item.querySelector('.servdtls8 a');

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
      a.textContent = link.textContent.trim() || 'read more';
      const p = document.createElement('p');
      p.appendChild(a);
      textFrag.appendChild(p);
    }

    cells.push([imgFrag, textFrag]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-insights', cells });
  element.replaceWith(block);
}
