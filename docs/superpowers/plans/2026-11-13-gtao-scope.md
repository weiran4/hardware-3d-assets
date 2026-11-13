# GTAO scope implementation plan
Goal: course pages 8–9 foundation: a real GTAOv2 board and original illustrative 3D oscilloscope, paired output/return wiring and scale exploration.
Architecture: isolated state, Three scene and mount module. No shared routing edits; parent integrator mounts only for gtao-v2 and stops hidden animation.
Sources: hardware PDF277 ±10V/10mA; PDF289–292 positive/return, shared returns and short probe ground; PDF293 Scale maps to +5V. Course8–9. No live device operations.
Scope: ideal sine and static gain, range clipping is explicitly an ideal teaching limit, not a measured response. Oversampling, projection, watchdog remain uncovered.
- [ ] Unit tests first: scale, clipping, missing return, polarity, overload, invalid inputs and wiring lock.
- [ ] Original 3D scope with trace, real board and functional CH1 anchors; model-loading failure and WebGL recovery.
- [ ] Keyboard wiring, normal/error presets, pause/replay, reduced motion, hidden lifecycle, mobile.
- [ ] Independent review and focused browser screenshots, then report patch to parent (no push).
Acceptance: Scale value yields +5V, 2x scale yields 10V, larger input visibly ideal-clipped. 50ohm unsafe load blocked at >10mA, scope default1Mohm. Return missing cannot show valid measurement. Desktop/mobile visible model and trace, hidden animations stopped and disposal removes listeners/resources.

## Integration handoff
Import mountGtaoScope from web/src/rtds-gtao-scope.js and mount once inside a GTAO-only host. Call setActive(false) on hardware/route switches and true when selected. dispose() removes listeners, timers and all owned rendering resources. Existing NovaCor analog lesson must stay unchanged.
This isolated patch deliberately does not change app.js, index.html or shared gallery/context routes. Parent integrator owns deep links for presentation8/9 and complete browser navigation tests. It does not claim complete page9 oversampling coverage.
Run independent harness: node tools/gtao-scope-harness.mjs, serve dist on port4273, then PLAYWRIGHT_BROWSERS_PATH=/tmp/gtfpi-browsers node tools/test-gtao-scope.mjs (use installed browser path in other environments). Harness is not a public route.
Verification: 7 new state tests and 734 whole-baseline tests; build passed. Desktop1200/mobile390 focused browser assertions cover scale, clipping, reversed-ground block, overload, pause/visibility, reduced motion, context loss/retry, dispose. WebGL-disabled fallback passed. Screenshots actually viewed. Shared route integration and full browser regression still required before publication.
Review fixes: grounded-scope reversal now blocked (not simple sign flip); context loss destroys scene and prevents replay until recovery; static single-step added; channel1 wire_recess0/1 used from metadata, not world-coordinate pin estimates.
