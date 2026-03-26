# Project Configuration

## Project Type: xwalk (Universal Editor)

This is an **AEM Edge Delivery Services xwalk project** using the **Universal Editor** for content authoring.

**This is NOT a Document Authoring (DA) project.**

### Key Implications

- Content is authored via the **Universal Editor**, not Document Authoring (DA)
- Block models are defined in `component-models.json` and `component-definition.json`
- Block filtering is controlled by `component-filters.json`
- Content uses **JCR/XML format** with field hinting (`<!-- field:name -->` comments in HTML)
- The `eslint-plugin-xwalk` package is used for linting block definitions
- Content HTML files in `/content/` include Universal Editor field hints for inline editing

### Content Structure

- Content files use `.plain.html` format with UE field annotations
- Blocks include `<!-- field:image -->`, `<!-- field:text -->`, etc. for Universal Editor binding
- Section metadata is authored as a block within each section

### Block Library

- Library endpoint: `https://main--sta-xwalk-boilerplate--aemysites.aem.page/tools/sidekick/library.json`
- Local blocks are in `/blocks/` directory
- Each block has JS decoration (`block.js`) and CSS styling (`block.css`)

### Available Blocks

Accordion, Cards (+ variants: Awards, Banner, Insights, Values), Carousel (+ variants: News, Showcase), Columns, Embed, Form, Fragment, Hero, Modal, Quote, Search, Table, Tabs, Video

### What NOT To Do

- Do NOT use DA-style markdown authoring (no `.md` content files for pages)
- Do NOT treat nav/footer as markdown files - they use `.plain.html` format
- Do NOT strip or ignore `<!-- field:* -->` comments - they are required for Universal Editor
- Do NOT generate content without proper UE field hinting
