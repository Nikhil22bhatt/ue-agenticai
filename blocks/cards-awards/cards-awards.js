import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && (div.querySelector('picture') || div.querySelector('img'))) div.className = 'cards-awards-card-image';
      else div.className = 'cards-awards-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('img').forEach((img) => {
    try {
      const url = new URL(img.src, window.location.origin);
      if (url.origin === window.location.origin) {
        const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
        moveInstrumentation(img, optimizedPic.querySelector('img'));
        const wrapper = img.closest('picture') || img;
        wrapper.replaceWith(optimizedPic);
      }
    } catch { /* skip external images */ }
  });
  block.textContent = '';
  block.append(ul);
}
