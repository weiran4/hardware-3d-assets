# Course37: offline black-box controller loop

## Plan and acceptance
- Separate course37 route and component; leave course36 implementation unchanged.
- Show NovaCor and GTSOC V2 original existing GLB exteriors. Highlight functional groups, not numbered GTSOC socket mapping or insertion. BESS is a simulated plant within NovaCor, not a live battery rack.
- Measurements flow NovaCor→ARM controller and commands return. No external B-Box controller. Model library/interface-tool/firmware steps are conceptual only; no uploads, execution, firmware flashing or licensing.
- Gate loop on correct rear host group/GTIO group, fibre, compatible application interface and black-box firmware; reject missing return path. A synthetic unitless budget model demonstrates solver tick vs controller sample vs execution allowance, never real latency or capacity guarantee.
- State and route TDD, full unit/build, actual desktop/mobile browser and screenshots, course36 regression, hidden animation pause/history/reduced-motion/context-loss recovery. Parent publishes only after review and exact CI gates.

## Evidence limits
Deck37: .a static library, vendor-controlled parameter exposure, NovaCor fibre compatibility. Manual530–531: linked ARM controller application, complexity/sampling constrains instances. Manual529 vs531 disagree on front/rear numbered mapping; official GTSOC V2 brochure confirms rear host/black-box group only. No numbered association is asserted. Existing copper16 GLB front population is irrelevant to rear host group and must not be repurposed as optical Aurora front ports.

## Local verification
- 16 new state/route tests failed before implementation, then passed.
- Full unit suite 848/848 passed; static build and diff whitespace checks passed.
- Real Playwright headless Chromium/WebGL: course37 desktop1200/mobile390 and course36 regression desktop/mobile all passed (4 tests). Includes mismatch and overbudget stops, vendor parameter exposure, direction, history, hidden-loop stop, reduced motion and context-loss recovery.
- Actual desktop/mobile screenshots inspected: full labels fit; compact desktop layout shows models and status together; both mobile group plaques remain inside the canvas.
- No source PDF/images or private paths included. Publication/CI/live confirmation remain coordinator duties; this entry reports local verification only.
