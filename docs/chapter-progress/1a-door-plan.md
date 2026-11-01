# 1A door latch sequence — 2026-11-01

Source: Cubicle V2 revision 20260506, PDF 21–23, particularly §1.2.2. Original offline schematic only, no copied images. This is a bounded increment under the approved autonomous chapter plan.

Design: prefer a discrete state illustration over a fabricated photorealistic door model or autoplay. The reader explicitly advances the documented sequence and tries an out-of-order action; no timers or hidden playback. Text remains usable without WebGL and with reduced motion. This demonstrates the upper/lower latch dependency, not lifting, isolation, forces, dimensional fit or a complete service procedure. Heavy-door and skilled-person warnings remain visible.

Implementation: new `web/src/rtds-cabinet-door.js` exports `doorTransition(state, action)` and initializer; integrate in existing contextual chapter, reuse CSS and source/coverage conventions. Unit tests in `web/tests/rtds-cabinet-door.test.js`; desktop/mobile tests in `web/tests/browser/rtds-cabinet-door.spec.js`.

Acceptance:
- [x] Failing tests first: documented forward sequence, wrong-order actions preserve state, reset/repeat, invalid/prototype inputs.
- [x] States: closed → open → upper disconnected → detached → bottom seated → upper held/aligned → secured. Reinstallation completion is not actual safety certification.
- [x] Each action shows source-grounded result and separate textual latch status. No literal LED/side-panel dependency borrowed for the rear-door sequence.
- [x] Desktop/mobile, keyboard, reset, repeat, contextual switch/history, reduced motion and no-WebGL checked; no PiP overlap or clipped labels.
- [x] Independent source/code/visual review; all unit/build/browser checks.
- [ ] Nonforce main update after fresh-head/no-active-run check; exact verify→deploy→smoke-live plus anonymous file hashes and actual online screenshots.

Chapter stays partial: verified complete mechanical geometry, detailed handling/installation, cable routing, remaining cards and AC baseline inclusions remain unaccepted.

Release regression correction: the first CI verify prevented deployment after an existing analog-context test exposed a race. The lesson model can be ready before the gallery model; late route presentation then paused a user's newly started playback. A held-response test reproduced the failure. Explicit pointer/keyboard input in the teaching region now supersedes only the deferred route presentation; new hardware navigation still pauses hidden lessons. No retries or checks were weakened.
