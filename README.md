# Veleto — Where thoughts take shape.

A dark, responsive prelaunch storefront and a complete founder’s launch kit, built directly in this project. The existing Vite / vanilla JavaScript / Three.js framework was retained. See [the initial inspection](REPOSITORY-INSPECTION.txt).

## Preview

```sh
npm install
npm run dev -- --port 5174
```

Node 20.19+ or 22.12+ is required by the installed Vite version. Node 24.16 was used here. Dependencies are already installed in this workspace.

- Storefront: http://127.0.0.1:5174/
- Founder’s kit: http://127.0.0.1:5174/launch-kit/
- Downloadable project/kit: http://127.0.0.1:5174/launch-kit/downloads/veleto-launch-kit.zip

The completed preview runs on port 5174 with the launch-kit route configured. If it stops, run the command above. No public deployment was made.

```sh
npm run build
npm run preview -- --port 4173
```

Production output goes to `dist/`. Fonts and images are local; no external runtime requests are needed.

## What was created

- Veleto identity, story, voice, audience hypothesis, palette, typography, taglines, and collection naming.
- Still / Black, Ember / Maroon, and Form / Slate product copy; proposed notebook $19.99, optional pen $6.99 to $8.99, bundle $24.99 to $27.99 Ritual Sets; bundle and packaging strategy; manufacturer brief, RFQ draft, supplier questions, and sample tests.
- Dark editorial storefront, notebook-and-pen presentation, cover opening and curved page turns, color selection, guided exploration, zoom/rotation, static fallback, scroll reveals, subtle parallax, white-ink animation, and a digital sketchpad.
- Ten short-video concepts, ten captions, five scripts, three announcements, three creator-outreach drafts, and a 30-day content calendar.
- Waitlist/form copy, welcome email, three launch emails, survey questions, preorder readiness gates, and a first-week validation plan.
- Today/supplier/sample task lists, startup cost scenarios, editable contribution calculator, 30-day operating plan, and founder approval checklist.
- SVG wordmark, monogram, brand board, ritual card, packaging concept, and three social templates. Brand board, ritual card, packaging, and social templates also have PNG exports.

## Source map

- `index.html`: storefront markup and customer-facing copy.
- `src/atelier.css`: active responsive design. `src/style.css` is the retained, unused original stylesheet.
- `src/main.js`: viewer, selection, form, and motion interactions.
- `src/model.js`: original Three.js notebook, pen, page geometry, procedural cover texture, and sketch artwork.
- `src/drawing.js`: pointer/touch sketchpad. Drawings remain in memory only.
- `src/email.js`: explicit demo submission adapter.
- `public/launch-kit/strategy.json`: brand and product strategy.
- `public/launch-kit/content.json`: content library and calendar.
- `public/launch-kit/operations.json`: funnel, emails, budgets, and launch plan.
- `scripts/build-launch-kit.mjs`: generates the kit HTML, CSVs, text downloads, and editable brand SVGs from those JSON sources.
- `public/brand/`: SVG and PNG assets. Social graphics are 1080 × 1350 pixels.
- `public/fonts/`: handbook font and license notices for both font families.

After editing the kit JSON, run `npm run kit`. The generated handbook includes a copy button for each draft, printable layout, downloadable CSV/text files, a cost calculator, and a browser-local approval checklist. The checklist records personal notes; it does not authorize external actions.

With the local server running:

```sh
npm run assets
npm run kit
node scripts/export-brand.mjs
python scripts/package-kit.py
npm run build
```

`npm run assets` regenerates product renders from the model, not from a product photograph. `export-brand.mjs` uses the browser to export code-authored SVG artwork to PNG. Repackage after source or asset changes to keep the ZIP current. Unzip the archive, enter the `veleto` directory, then run `npm install` and `npm run dev`.

## Verification

With the server running:

```sh
npm test
npm run test:launch
```

The original browser suite exercises the 3D viewer, all colors, page turns and interrupted transitions, keyboard/drag/zoom controls, guided tour, static fallback, simulated graphics failure, touch drawing, form validation, privacy dialog, reduced motion, and mobile layout.

The launch suite checks content counts, budget arithmetic, shade-to-waitlist synchronization, demo form states, calculator behavior, checklist persistence, download availability, responsive handbook layout, and page errors.

Use `VELOTO_TEST_URL` to test another origin. Browser discovery uses Chrome or Edge on Windows, or `VELOTO_CHROME_PATH` as an override. Elsewhere, install Playwright Chromium with `npx playwright install chromium`. A restricted environment may require permission to launch the headless browser. Screenshots and verification results are in `screenshots/`.

## Real launch dependencies

This is a working local prototype and business foundation. No emails are collected, saved, or transmitted; no checkout, analytics, fulfillment, or public hosting is connected. Demo confirmation states explicitly say no subscription was made. The selected color persists in session storage. The founder checklist persists locally. Drawings do not persist.

All Veleto prices, costs, demand targets, specifications, manufacturing quantities, and timelines are proposed assumptions. The guide cites the two official reference pages actually consulted. Neither establishes a supplier relationship or verifies Veleto’s product. All imagery is concept artwork; no physical samples were created or tested.

Before collecting real interest, replace `submitInterest` with a request to a server endpoint backed by the chosen provider. Keep provider secrets on the server. Verify validation, rate limits, consent, duplicates, confirmation, unsubscribe, error handling, and deletion. Supply actual business/privacy/support details. Replace demo notices only after the full flow works.

Before publishing a customer site, remove the founder-kit footer link and exclude `public/launch-kit/` from that deployment: it contains internal operating assumptions. Set the real canonical URL and raster social-preview URL. Before taking orders, approve physical samples, final contents/prices, shipping markets, order policies, and a credible delivery window. The supplied packaging graphic is not a manufacturing dieline. Font files and brand SVG text remain editable; confirm final outlines before print production.

No supplier outreach, email campaign, ad purchase, service purchase, or inventory order was made.
