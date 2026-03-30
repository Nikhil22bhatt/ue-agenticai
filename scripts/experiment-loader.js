/**
 * Checks if experimentation is enabled.
 * @returns {boolean} True if experimentation is enabled, false otherwise.
 */
const isExperimentationEnabled = () => document.head.querySelector('[name^="experiment"],[name^="campaign-"],[name^="audience-"],[property^="campaign:"],[property^="audience:"]')
  || [...document.querySelectorAll('.section-metadata div')].some((d) => d.textContent.match(/Experiment|Campaign|Audience/i));

/**
 * Register the config reply listener immediately at module load time.
 * The A/B extension sends hlx:experimentation-get-config as soon as the
 * panel opens — before runExperimentation() is called — so we must listen
 * from the very start to avoid the race condition.
 */
window.addEventListener('message', (event) => {
  if (event.data?.type === 'hlx:experimentation-get-config' && !isExperimentationEnabled()) {
    event.source.postMessage({
      type: 'hlx:experimentation-config',
      config: { experiments: [], audiences: [], campaigns: [] },
      source: 'no-experiments',
    }, '*');
  }
});

/**
 * Loads the experimentation module (eager).
 * @param {Document} doc The document object.
 * @returns {Promise<void>} A promise that resolves when the experimentation module is loaded.
 */
export async function runExperimentation(doc, config) {
  if (!isExperimentationEnabled()) {
    return null;
  }

  try {
    const { loadEager } = await import(
      // eslint-disable-next-line import/no-relative-packages
      '../plugins/experimentation/src/index.js'
    );
    return loadEager(doc, config);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to load experimentation module (eager):', error);
    return null;
  }
}

/**
 * Loads the experimentation module (lazy).
 * @param {Document} doc The document object.
 * @returns {Promise<void>} A promise that resolves when the experimentation module is loaded.
 */
export async function showExperimentationRail(doc, config) {
  if (!isExperimentationEnabled()) {
    return null;
  }

  try {
    const { loadLazy } = await import(
      // eslint-disable-next-line import/no-relative-packages
      '../plugins/experimentation/src/index.js'
    );
    await loadLazy(doc, config);

    const loadSidekickHandler = () => import('../tools/sidekick/aem-experimentation.js');

    if (doc.querySelector('helix-sidekick, aem-sidekick')) {
      await loadSidekickHandler();
    } else {
      await new Promise((resolve) => {
        doc.addEventListener(
          'sidekick-ready',
          () => loadSidekickHandler().then(resolve),
          { once: true },
        );
      });
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to load experimentation module (lazy):', error);
    return null;
  }
}
