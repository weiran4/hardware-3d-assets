# GTAI differential input implementation plan

Goal: Turn slides 10 and 12 into an interactive three-wire external signal-generator experiment. Slide 11 scaling remains pending: no unsupported formula.
Architecture: Independent state, Three.js scene and scoped UI modules, integrated later by the parent. Reuse the published GTAI V2 GLB; external generator is original illustrative equipment, not a certified product.

Sources: Hardware manual PDF336 (12 channels, ±10 V, 16 bit, samples sent every 1 µs); PDF347–350 (three-wire signal input; all channel GNDs common). Slide10–12. No private source assets enter repository.

Tasks and acceptance:
- State tests first: normal and reversed polarity, missing reference, out-of-range blocks, disconnect-before-rewire, finite numerical inputs.
- Scene uses semantic CH1 +/−/GND contact anchors from existing GLB; original 3D generator, color-coded cables, synchronized signal trace. No invented common-mode rating.
- UI offers terminal pairing, correct/reversed/missing-ground examples, bounded amplitude, on/off and pause/replay. No hidden animation; supports keyboard, reduced-motion, resize and disposal/retry.
- Local-only harness bundles module without touching app/router. Browser tests on desktop/mobile and actual screenshot inspection. Independent parent review before integration/publication.

Coverage: Slides10/12 foundational three-wire experiment; slide11 scaling and full ADC/anti-alias behavior pending. No measured timing or latency assertion. No high-voltage or real hardware operation.
