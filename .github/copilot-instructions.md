# Copilot instructions for VELOTO

## Project overview

VELOTO is a local Vite concept site for a colored notebook product. It is a private, client-only application: there is no backend, deployment configuration, payment integration, analytics, or real email service. Runtime assets and fonts are served locally.

The page is structured in `index.html` and styled in `src/style.css`. `src/main.js` owns the UI state and event wiring. The state includes the selected color, open/closed state, spread, view (`cover`, `paper`, or `pen`), zoom, guided-tour step, and static/interactive mode. Keep state changes flowing through `update()` so labels, controls, poster images, form preference, accessibility attributes, and the Three.js model stay synchronized.

The interactive product viewer is deliberately lazy-loaded from `src/model.js`. That module builds the notebook, paper turns, ribbon, pen, lighting, camera, pointer rotation, animation loop, visibility throttling, reduced-motion behavior, and cleanup. `main.js` owns the fallback: WebGL failure or context loss switches to the local poster gallery while preserving the selected color and spread. Do not make the initial page depend on Three.js being available.

`src/drawing.js` is an independent pointer-input canvas. It stores normalized stroke coordinates in memory, redraws at the device-pixel ratio, and preserves strokes through resize. `src/email.js` is a demo submission adapter only; it validates locally and must not imply that an email was sent or saved. If real collection is added, use a server endpoint and keep provider credentials out of frontend variables and source control.

The image-generation route `/?render=1` creates a minimal render page and exposes `window.__studio`; `scripts/render-assets.mjs` uses it to write the local PNGs under `public/images/`. Generated `dist/`, `public/images/`, screenshots, and dependencies should not be treated as application source.

## Commands

Run from the repository root:

```sh
npm install
npm run dev                 # Vite at http://127.0.0.1:5173/
npm run build               # production build in dist/
npm run preview             # serve dist/, normally on port 4173
npm test                    # full Playwright/Chromium verification in tests/verify.mjs
npm run assets              # regenerate public/images/; requires a running local server
node scripts/quality.mjs    # focused visual/narrow-phone screenshots; requires a running server
```

`npm test` is a single Node verification script containing the browser checks; it does not currently expose a per-check selector. For a focused browser check, use `node scripts/quality.mjs`, or make a temporary focused copy/change of the relevant `check(...)` block in `tests/verify.mjs` rather than assuming Jest/Vitest filtering exists.

The browser helpers prefer `VELOTO_CHROME_PATH`, then standard Windows Chrome/Edge paths. Set `VELOTO_TEST_URL` to test another running origin, such as a production preview:

```powershell
$env:VELOTO_TEST_URL='http://127.0.0.1:4173'
npm test
```

On systems without a standard Chrome/Edge install, install Playwright Chromium with `npx playwright install chromium`.

## Conventions and boundaries

- Preserve the honest concept/demo language. Product dimensions, materials, pricing, launch dates, shipping, ink performance, and email subscription are intentionally unconfirmed.
- Use the existing color keys `black`, `maroon`, and `slate`. Keep the UI palette in `src/main.js`, the 3D palette in `src/model.js`, and the CSS paper custom property synchronized when adding color behavior.
- Keep all viewer controls and poster updates accessible: use native buttons/details/dialog where already used, maintain `aria-pressed`/`disabled`/live status updates, and keep the keyboard and reduced-motion paths working.
- The viewer does not use wheel-to-zoom; ordinary wheel input must remain page scrolling. Pointer dragging is implemented in the Three.js canvas, while drawing uses pointer capture and handles cancellation.
- Treat animation and rendering as resources. Pause work when hidden/offscreen, respect `prefers-reduced-motion`, and dispose Three.js geometries, materials, textures, observers, listeners, and animation frames on page teardown.
- Keep the initial UI bundle separate from the lazy Three.js import. Avoid importing the model or other heavy rendering code at module initialization.
- Viewer state is intentionally inspectable through the read-only `window.__veloto` object for local browser verification. Preserve its shape when changing state behavior unless the tests and documentation are updated together.
- Keep artwork procedural and local. The product imagery is generated from `src/model.js`; do not replace it with external runtime image requests.
- Use `src/style.css`'s existing typography, custom properties, responsive breakpoints, and reduced-motion rules instead of introducing a second styling system. Verify narrow widths (including 320px and 768px) for horizontal overflow.
- For visual changes, rebuild before browser verification so the checks exercise the production output when applicable. The test suite also checks console/page errors, static fallback, session color persistence, drawing resize/cancellation, and form non-transmission.
