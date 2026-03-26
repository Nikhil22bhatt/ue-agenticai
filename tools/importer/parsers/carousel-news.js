/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-news. Base: carousel. Source: https://www.tataelxsi.com/
 * Extracts news items from .hmbaner.desk .hmbnrcrosl owl-carousel.
 * xwalk model: carousel-news-item { media_image (reference), media_imageAlt (collapsed), content_text (richtext) }
 * Each slide = 1 row with 2 columns: [image | text content]
 */
export default function parse(element, { document }) {
  const items = element.querySelectorAll('.owl-item');
  const cells = [];

  items.forEach((item) => {
    const img = item.querySelector('img');
    const heading = item.querySelector('h3, h2, h1');
    const description = item.querySelector('p:not(.hmlink)');
    const link = item.querySelector('a[href]');

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
    if (heading) textFrag.appendChild(heading.cloneNode(true));
    if (description && description.textContent.trim()) textFrag.appendChild(description.cloneNode(true));
    if (link && link.href && !link.href.startsWith('javascript:')) {
      const a = document.createElement('a');
      a.href = link.href;
      a.textContent = link.textContent.trim() || 'Read more';
      const p = document.createElement('p');
      p.appendChild(a);
      textFrag.appendChild(p);
    }

    cells.push([imgFrag, textFrag]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-news', cells });
  element.replaceWith(block);
}
