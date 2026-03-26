/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import carouselNewsParser from './parsers/carousel-news.js';
import cardsBannerParser from './parsers/cards-banner.js';
import cardsInsightsParser from './parsers/cards-insights.js';
import carouselShowcaseParser from './parsers/carousel-showcase.js';
import cardsAwardsParser from './parsers/cards-awards.js';
import cardsValuesParser from './parsers/cards-values.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/tataelxsi-cleanup.js';
import sectionsTransformer from './transformers/tataelxsi-sections.js';

// PARSER REGISTRY
const parsers = {
  'carousel-news': carouselNewsParser,
  'cards-banner': cardsBannerParser,
  'cards-insights': cardsInsightsParser,
  'carousel-showcase': carouselShowcaseParser,
  'cards-awards': cardsAwardsParser,
  'cards-values': cardsValuesParser,
};

// PAGE TEMPLATE CONFIGURATION
const PAGE_TEMPLATE = {
  name: 'homepage',
  description: 'Tata Elxsi corporate homepage with hero, services, news, and company information sections',
  urls: [
    'https://www.tataelxsi.com/'
  ],
  blocks: [
    {
      name: 'carousel-news',
      instances: ['.hmbaner.desk .hmbnrcrosl']
    },
    {
      name: 'cards-banner',
      instances: ['.hmoverlbnr.hmlr2', '.hmoverlbnr.hmlr3', '.hmoverlbnr.hmlr4', '.hmbaner2 .hmoverlbnr']
    },
    {
      name: 'cards-insights',
      instances: ['.recogms2.botm2 .recoglst']
    },
    {
      name: 'carousel-showcase',
      instances: ['.ftrdstorie2 .ftrdsres']
    },
    {
      name: 'cards-awards',
      instances: ['.recogms2.recogms12 .recoglst']
    },
    {
      name: 'cards-values',
      instances: ['.hmcrers2']
    }
  ],
  sections: [
    {
      id: 'section-1',
      name: 'News Banner',
      selector: 'section#hmbanner',
      style: 'dark',
      blocks: ['carousel-news', 'cards-banner'],
      defaultContent: []
    },
    {
      id: 'section-2',
      name: 'AI-First Design-Driven',
      selector: 'section#hmservice',
      style: 'dark',
      blocks: ['cards-insights'],
      defaultContent: ['.hmservce1 h3', '.hmservce1 p']
    },
    {
      id: 'section-3',
      name: 'Pioneering Possibilities',
      selector: 'section#featureds',
      style: 'dark',
      blocks: ['carousel-showcase'],
      defaultContent: ['.ftrdstorie1 h3', '.ftrdstorie1 p']
    },
    {
      id: 'section-4',
      name: 'Integrating Digital Technology And Design',
      selector: 'section#technology',
      style: 'dark',
      blocks: [],
      defaultContent: ['.techlgy2 h1', '.techlgy2 p', '.techlgy1 a']
    },
    {
      id: 'section-5',
      name: 'Recognized Excellence',
      selector: 'section#recognition',
      style: 'dark',
      blocks: ['cards-awards'],
      defaultContent: ['.recogms1 h3', '.recogms1 p', '.recogms1 a']
    },
    {
      id: 'section-6',
      name: 'Careers - Home to A Billion',
      selector: 'section#hmcarer',
      style: 'dark',
      blocks: ['cards-values'],
      defaultContent: ['.hmcrers1 img', '.hmcrers1 p', '.hmcrers1 a']
    }
  ]
};

// TRANSFORMER REGISTRY
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];

  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    // 1. Execute beforeTransform transformers (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page using embedded template
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block using registered parsers
    pageBlocks.forEach((block) => {
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. Execute afterTransform transformers (section breaks + metadata)
    executeTransformers('afterTransform', main, payload);

    // 5. Apply WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path
    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, '')
    );

    return [{
      element: main,
      path: path || '/index',
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      }
    }];
  }
};
