/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-showcase. Base: carousel. Source: https://www.tataelxsi.com/
 * Extracts case study items from .ftrdstorie2 .ftrdsres owl-carousel
 * xwalk model: carousel-showcase-item { media_image (reference), media_imageAlt (collapsed), content_text (richtext) }
 * Each slide = 1 row with 2 columns: [image | text]
 */
export default function parse(element, { document }) {
  const items = element.querySelectorAll('.owl-item');
  const cells = [];

  items.forEach((item) => {
    const img = item.querySelector('.ftrdsrex1 img');
    const link = item.querySelector('.ftrdsrex2 a');

    // Column 1: image with field hint
    const imgFrag = document.createDocumentFragment();
    imgFrag.appendChild(document.createComment(' field:media_image '));
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
    textFrag.appendChild(document.createComment(' field:content_text '));
    if (link) {
      const a = document.createElement('a');
      a.href = link.href;
      a.textContent = link.textContent.trim();
      const p = document.createElement('p');
      p.appendChild(a);
      textFrag.appendChild(p);
    }

    cells.push([imgFrag, textFrag]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-showcase', cells });
  element.replaceWith(block);
}
