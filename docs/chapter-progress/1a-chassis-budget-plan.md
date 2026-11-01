# 1A chassis power scope — implementation and acceptance plan

Source: Cubicle V2 revision 20260506, PDF 32 §1.6. Public content is original factual explanation only. Chapter 1A remains partial.

Goal: distinguish component power scopes before adding numbers. Extend the existing contextual cabinet lesson with a reference ledger: cabinet without NovaCor ≈120 W maximum; each NovaCor 2.0 ≈290 W maximum; one GTNET chassis containing three GTNETx2 cards ≈90 W. The 18 W individual-card figure is a different scope, not an additional load on top of the 90 W populated-chassis figure.

Approach: a small state module and responsive ledger, not invented mechanical geometry, current calculation or mains wiring. A conditional sum assumes the three listed groups are separate contributions. The source does not fully enumerate the 120 W baseline or establish all auxiliaries/conversion losses; explicitly retain that gap. Never present the sum as a complete AC demand, breaker/cable/UPS rating or installation approval. Keep the earlier 24 V I/O estimates separate; do not automatically add them or the independent 100 W supply capacities. No physical-fit claim from selected counts.

- [x] State tests fail first: 0/1/2 NovaCor contributions; 0/1 populated GTNET chassis; 790 W reference example; unsupported partial/unknown GTNET population has no numeric sum; double counting adds no card watts; invalid/empty/negative/fractional inputs rejected.
- [x] Implement pure state and contextual UI. Source ledger, approximate/max distinctions, assumption note adjacent to result, normal and double-count/unsupported examples. Counts are limited teaching selections, not placement limits.
- [x] Browser tests fail before UI implementation, then pass: keyboard, repeated reset, unknown/invalid recovery, contextual switch/history, mobile/reduced-motion/no-WebGL, screenshots and no PiP overlap.
- [x] Independent source/code review; full unit/build and full browser suite; inspect desktop/mobile pictures.
- [ ] Nonforce main update only after preflight and tests. Exact-commit verify → deploy → smoke-live, anonymous JS/CSS matches, actual online desktop/mobile screenshot inspection before delivery.

Remaining: mechanically verified model/operations, detailed routing/installation constraints, additional board identities, and a fully evidenced whole-system AC budget. No advance to 1B.

Local acceptance: 177 unit tests, build and 113 browser tests passed; actual desktop/mobile screenshots inspected. Exact-commit publication evidence is recorded by Actions and the private execution receipt, not pre-certified here.
