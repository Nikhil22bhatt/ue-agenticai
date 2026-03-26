var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-homepage.js
  var import_homepage_exports = {};
  __export(import_homepage_exports, {
    default: () => import_homepage_default
  });

  // tools/importer/parsers/carousel-news.js
  function parse(element, { document }) {
    const items = element.querySelectorAll(".owl-item");
    const cells = [];
    items.forEach((item) => {
      const img = item.querySelector("img");
      const heading = item.querySelector("h3, h2, h1");
      const description = item.querySelector("p:not(.hmlink)");
      const link = item.querySelector("a[href]");
      const imgFrag = document.createDocumentFragment();
      imgFrag.appendChild(document.createComment(" field:media_image "));
      if (img) {
        const pic = document.createElement("picture");
        const newImg = document.createElement("img");
        newImg.src = img.src;
        newImg.alt = img.alt || "";
        pic.appendChild(newImg);
        imgFrag.appendChild(pic);
      }
      const textFrag = document.createDocumentFragment();
      textFrag.appendChild(document.createComment(" field:content_text "));
      if (heading) textFrag.appendChild(heading.cloneNode(true));
      if (description && description.textContent.trim()) textFrag.appendChild(description.cloneNode(true));
      if (link && link.href && !link.href.startsWith("javascript:")) {
        const a = document.createElement("a");
        a.href = link.href;
        a.textContent = link.textContent.trim() || "Read more";
        const p = document.createElement("p");
        p.appendChild(a);
        textFrag.appendChild(p);
      }
      cells.push([imgFrag, textFrag]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-news", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-banner.js
  function parse2(element, { document }) {
    const img = element.querySelector("img");
    const heading = element.querySelector("h3, h2, h1");
    const description = element.querySelector("p:not(.hmlink)");
    const link = element.querySelector("a[href]");
    const cells = [];
    const imgFrag = document.createDocumentFragment();
    imgFrag.appendChild(document.createComment(" field:image "));
    if (img) {
      const pic = document.createElement("picture");
      const newImg = document.createElement("img");
      newImg.src = img.src;
      newImg.alt = img.alt || "";
      pic.appendChild(newImg);
      imgFrag.appendChild(pic);
    }
    const textFrag = document.createDocumentFragment();
    textFrag.appendChild(document.createComment(" field:text "));
    if (heading) textFrag.appendChild(heading.cloneNode(true));
    if (description && description.textContent.trim()) textFrag.appendChild(description.cloneNode(true));
    if (link && link.href && !link.href.startsWith("javascript:")) {
      const a = document.createElement("a");
      a.href = link.href;
      a.textContent = link.textContent.trim() || "Check it out";
      const p = document.createElement("p");
      p.appendChild(a);
      textFrag.appendChild(p);
    }
    cells.push([imgFrag, textFrag]);
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-banner", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-insights.js
  function parse3(element, { document }) {
    const items = element.querySelectorAll(".servccrsl2");
    const cells = [];
    items.forEach((item) => {
      const img = item.querySelector(".servccrslig img");
      const heading = item.querySelector(".servdtls7 h5, .servdtls7 h4, .servdtls7 h3");
      const description = item.querySelector(".servdtls7 p");
      const link = item.querySelector(".servdtls8 a");
      const imgFrag = document.createDocumentFragment();
      imgFrag.appendChild(document.createComment(" field:image "));
      if (img) {
        const pic = document.createElement("picture");
        const newImg = document.createElement("img");
        newImg.src = img.src;
        newImg.alt = img.alt || "";
        pic.appendChild(newImg);
        imgFrag.appendChild(pic);
      }
      const textFrag = document.createDocumentFragment();
      textFrag.appendChild(document.createComment(" field:text "));
      if (heading) textFrag.appendChild(heading.cloneNode(true));
      if (description && description.textContent.trim()) textFrag.appendChild(description.cloneNode(true));
      if (link && link.href && !link.href.startsWith("javascript:")) {
        const a = document.createElement("a");
        a.href = link.href;
        a.textContent = link.textContent.trim() || "read more";
        const p = document.createElement("p");
        p.appendChild(a);
        textFrag.appendChild(p);
      }
      cells.push([imgFrag, textFrag]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-insights", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-showcase.js
  function parse4(element, { document }) {
    const items = element.querySelectorAll(".owl-item");
    const cells = [];
    items.forEach((item) => {
      const img = item.querySelector(".ftrdsrex1 img");
      const link = item.querySelector(".ftrdsrex2 a");
      const imgFrag = document.createDocumentFragment();
      imgFrag.appendChild(document.createComment(" field:media_image "));
      if (img) {
        const pic = document.createElement("picture");
        const newImg = document.createElement("img");
        newImg.src = img.src;
        newImg.alt = img.alt || "";
        pic.appendChild(newImg);
        imgFrag.appendChild(pic);
      }
      const textFrag = document.createDocumentFragment();
      textFrag.appendChild(document.createComment(" field:content_text "));
      if (link) {
        const a = document.createElement("a");
        a.href = link.href;
        a.textContent = link.textContent.trim();
        const p = document.createElement("p");
        p.appendChild(a);
        textFrag.appendChild(p);
      }
      cells.push([imgFrag, textFrag]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-showcase", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-awards.js
  function parse5(element, { document }) {
    const items = element.querySelectorAll(".servccrsl1");
    const cells = [];
    items.forEach((item) => {
      const img = item.querySelector(".servccrslig img");
      const heading = item.querySelector(".servdtls7 h5, .servdtls7 h4, .servdtls7 h3");
      const link = item.querySelector(".servdtls8 a");
      const imgFrag = document.createDocumentFragment();
      imgFrag.appendChild(document.createComment(" field:image "));
      if (img) {
        const pic = document.createElement("picture");
        const newImg = document.createElement("img");
        newImg.src = img.src;
        newImg.alt = img.alt || "";
        pic.appendChild(newImg);
        imgFrag.appendChild(pic);
      }
      const textFrag = document.createDocumentFragment();
      textFrag.appendChild(document.createComment(" field:text "));
      if (heading) textFrag.appendChild(heading.cloneNode(true));
      if (link && link.href && !link.href.startsWith("javascript:")) {
        const a = document.createElement("a");
        a.href = link.href;
        a.textContent = link.textContent.trim() || "read more";
        const p = document.createElement("p");
        p.appendChild(a);
        textFrag.appendChild(p);
      }
      cells.push([imgFrag, textFrag]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-awards", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-values.js
  function parse6(element, { document }) {
    const items = element.querySelectorAll(".hmcrers21");
    const cells = [];
    items.forEach((item) => {
      const img = item.querySelector(".hmcrers2g img");
      const heading = item.querySelector("h5");
      const imgFrag = document.createDocumentFragment();
      imgFrag.appendChild(document.createComment(" field:image "));
      if (img) {
        const pic = document.createElement("picture");
        const newImg = document.createElement("img");
        newImg.src = img.src;
        newImg.alt = img.alt || "";
        pic.appendChild(newImg);
        imgFrag.appendChild(pic);
      }
      const textFrag = document.createDocumentFragment();
      textFrag.appendChild(document.createComment(" field:text "));
      if (heading) textFrag.appendChild(heading.cloneNode(true));
      cells.push([imgFrag, textFrag]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-values", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/tataelxsi-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "#cookieConsent",
        ".cookpolicy"
      ]);
      WebImporter.DOMUtils.remove(element, ["#orimode"]);
      WebImporter.DOMUtils.remove(element, ["#goog-gt-tt", ".VIpgJd-ZVi9od-ORHb-OEVmcd"]);
      WebImporter.DOMUtils.remove(element, [".hmbaner.mob"]);
      WebImporter.DOMUtils.remove(element, [".techlgy2.mob1"]);
      WebImporter.DOMUtils.remove(element, [".owl-nav", ".owl-dots"]);
      WebImporter.DOMUtils.remove(element, [".progress-container", ".progress-recog"]);
      WebImporter.DOMUtils.remove(element, [".techutb"]);
      WebImporter.DOMUtils.remove(element, [".totop"]);
      WebImporter.DOMUtils.remove(element, ["#LangSessID"]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, ["header", "footer"]);
      WebImporter.DOMUtils.remove(element, ["iframe", "link", "noscript"]);
      const jsLinks = element.querySelectorAll('a[href^="javascript:"]');
      jsLinks.forEach((link) => {
        if (!link.querySelector("img") && !link.textContent.trim()) {
          link.remove();
        }
      });
    }
  }

  // tools/importer/transformers/tataelxsi-sections.js
  var TransformHook2 = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform2(hookName, element, payload) {
    if (hookName === TransformHook2.afterTransform) {
      const { document } = element.ownerDocument ? { document: element.ownerDocument } : { document };
      const template = payload && payload.template;
      if (!template || !template.sections || template.sections.length < 2) return;
      const sections = template.sections;
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
        let sectionEl = null;
        for (const sel of selectors) {
          sectionEl = element.querySelector(sel);
          if (sectionEl) break;
        }
        if (!sectionEl) continue;
        if (section.style) {
          const sectionMetadata = WebImporter.Blocks.createBlock(document, {
            name: "Section Metadata",
            cells: { style: section.style }
          });
          sectionEl.append(sectionMetadata);
        }
        if (i > 0) {
          const hr = document.createElement("hr");
          sectionEl.before(hr);
        }
      }
    }
  }

  // tools/importer/import-homepage.js
  var parsers = {
    "carousel-news": parse,
    "cards-banner": parse2,
    "cards-insights": parse3,
    "carousel-showcase": parse4,
    "cards-awards": parse5,
    "cards-values": parse6
  };
  var PAGE_TEMPLATE = {
    name: "homepage",
    description: "Tata Elxsi corporate homepage with hero, services, news, and company information sections",
    urls: [
      "https://www.tataelxsi.com/"
    ],
    blocks: [
      {
        name: "carousel-news",
        instances: [".hmbaner.desk .hmbnrcrosl"]
      },
      {
        name: "cards-banner",
        instances: [".hmoverlbnr.hmlr2", ".hmoverlbnr.hmlr3", ".hmoverlbnr.hmlr4", ".hmbaner2 .hmoverlbnr"]
      },
      {
        name: "cards-insights",
        instances: [".recogms2.botm2 .recoglst"]
      },
      {
        name: "carousel-showcase",
        instances: [".ftrdstorie2 .ftrdsres"]
      },
      {
        name: "cards-awards",
        instances: [".recogms2.recogms12 .recoglst"]
      },
      {
        name: "cards-values",
        instances: [".hmcrers2"]
      }
    ],
    sections: [
      {
        id: "section-1",
        name: "News Banner",
        selector: "section#hmbanner",
        style: "dark",
        blocks: ["carousel-news", "cards-banner"],
        defaultContent: []
      },
      {
        id: "section-2",
        name: "AI-First Design-Driven",
        selector: "section#hmservice",
        style: "dark",
        blocks: ["cards-insights"],
        defaultContent: [".hmservce1 h3", ".hmservce1 p"]
      },
      {
        id: "section-3",
        name: "Pioneering Possibilities",
        selector: "section#featureds",
        style: "dark",
        blocks: ["carousel-showcase"],
        defaultContent: [".ftrdstorie1 h3", ".ftrdstorie1 p"]
      },
      {
        id: "section-4",
        name: "Integrating Digital Technology And Design",
        selector: "section#technology",
        style: "dark",
        blocks: [],
        defaultContent: [".techlgy2 h1", ".techlgy2 p", ".techlgy1 a"]
      },
      {
        id: "section-5",
        name: "Recognized Excellence",
        selector: "section#recognition",
        style: "dark",
        blocks: ["cards-awards"],
        defaultContent: [".recogms1 h3", ".recogms1 p", ".recogms1 a"]
      },
      {
        id: "section-6",
        name: "Careers - Home to A Billion",
        selector: "section#hmcarer",
        style: "dark",
        blocks: ["cards-values"],
        defaultContent: [".hmcrers1 img", ".hmcrers1 p", ".hmcrers1 a"]
      }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
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
  var import_homepage_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
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
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "")
      );
      return [{
        element: main,
        path: path || "/index",
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_homepage_exports);
})();
