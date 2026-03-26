/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Tata Elxsi cleanup.
 * Selectors from captured DOM of https://www.tataelxsi.com/
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Cookie consent dialog (captured DOM: div.cookpolicy#cookieConsent)
    WebImporter.DOMUtils.remove(element, [
      '#cookieConsent',
      '.cookpolicy',
    ]);

    // Orientation prompt (captured DOM: div#orimode)
    WebImporter.DOMUtils.remove(element, ['#orimode']);

    // Google Translate widget (captured DOM: div#goog-gt-tt)
    WebImporter.DOMUtils.remove(element, ['#goog-gt-tt', '.VIpgJd-ZVi9od-ORHb-OEVmcd']);

    // Mobile-only duplicate content (captured DOM: div.hmbaner.mob)
    WebImporter.DOMUtils.remove(element, ['.hmbaner.mob']);

    // Mobile-only duplicate text (captured DOM: div.techlgy2.mob1)
    WebImporter.DOMUtils.remove(element, ['.techlgy2.mob1']);

    // Owl carousel navigation/dots (not authorable)
    WebImporter.DOMUtils.remove(element, ['.owl-nav', '.owl-dots']);

    // Progress bars (not authorable)
    WebImporter.DOMUtils.remove(element, ['.progress-container', '.progress-recog']);

    // Video overlay close button and video element (not authorable UI)
    WebImporter.DOMUtils.remove(element, ['.techutb']);

    // Scroll to top button
    WebImporter.DOMUtils.remove(element, ['.totop']);

    // Hidden input
    WebImporter.DOMUtils.remove(element, ['#LangSessID']);
  }

  if (hookName === TransformHook.afterTransform) {
    // Remove header and footer (auto-populated, not authorable)
    WebImporter.DOMUtils.remove(element, ['header', 'footer']);

    // Remove iframes, link tags, noscript
    WebImporter.DOMUtils.remove(element, ['iframe', 'link', 'noscript']);

    // Remove javascript: href links that are just UI controls
    const jsLinks = element.querySelectorAll('a[href^="javascript:"]');
    jsLinks.forEach((link) => {
      // Keep links that wrap meaningful content (images)
      if (!link.querySelector('img') && !link.textContent.trim()) {
        link.remove();
      }
    });
  }
}
