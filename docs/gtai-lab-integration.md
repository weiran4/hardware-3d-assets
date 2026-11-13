# GTAI three-wire lesson integration

Import `initGtaiLab` from `web/src/rtds-gtai-lab.js` and mount into a section owned by the GTAI V2 hardware context. The module imports its scoped CSS and uses the existing published GTAI GLB. It adds no package dependencies.

API: `initGtaiLab(root)` returns `setActive(boolean)`, `dispose()`, `getState()`. Call setActive(false) whenever routing hides the lesson; dispose before replacing/remounting. It additionally stops on hidden ancestors, hidden document, offscreen viewport and WebGL loss. Failed asset loading offers retry and keyboard-accessible terminal controls.

Suggested route: `#rtds-analog-input`, mapped to GTAI V2; slides10 and12 use this foundational three-wire lesson. Slide11 remains pending, do not count as complete. This branch intentionally does not change shared app/router/coverage files. Parent integrator must wire the route, preserve back/forward and existing anchors, then run complete prepublication/CI/live suites.

Standalone checks (from web):
- `node --test tests/rtds-gtai-lab.test.js`
- `node tests/gtai-lab-browser.mjs` (uses configured Playwright browser installation)
- The standalone harness is created in a temporary directory; it neither creates a public route nor publishes artifacts.

Source claims: manual PDF336 for 12ch, ±10V,16bit,1µs updates; PDF347–350 for +/−/GND and shared channel grounds. The original external generator is a teaching instrument, not a commercial device compatibility claim. Scale, ADC quantization, anti-aliasing, common-mode limits and latency are deliberately not invented.
