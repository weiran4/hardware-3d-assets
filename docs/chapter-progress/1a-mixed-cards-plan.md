# 1A mixed-generation rail budgets

Scope: continue the approved Cubicle V2 chapter, using the existing planner. PDF 32 (revision 20260506) gives GTDI V1 length 26.6 cm and GTDO V1 length 28.5 cm; its power table is explicitly GTDI V1.11 = 6 W and GTDO V1.21 = 12 W. Expose those revision-specific entries, not generic V1 power claims. Keep the four V2 entries unchanged. These are nominal arithmetic examples, not mixed-system compatibility or installation approval.

Approach: extend the existing pure card data and proportional rail bars rather than invent mechanical geometry or duplicate lessons. Show each card's power and nominal length beside its input. Add a normal mixed example (one each: GTDI V1.11, GTDO V1.21, GTDI V2, GTDO V2 = 31 W / 94.5 cm on each rail) and an asymmetric length example (five GTDO V1.21 = 60 W / 142.5 cm on each rail; left fits nominally, right exceeds 8.5 cm). Ambiguous GTFPI/GTSYNC identities and unsupported GTAI V1 power remain excluded.

Acceptance / implementation checklist:
- [x] Add failing unit assertions for exact version facts, mixed sums, independent limits and invalid counts.
- [x] Extend card data and input labels; add normal/error presets with distinct diagram colors and explicit version caveat.
- [x] Add browser tests for keyboard, reset/repeated switching, history, mobile/reduced-motion/no-WebGL and screenshots.
- [x] Run all unit tests/build and browser regressions; inspect desktop/mobile screenshots; independent review.
- [ ] Publish only original code/docs via nonforce main, with exact-commit verify → deploy → smoke-live and online screenshot/hash verification.

Chapter remains foundational / in progress. Mechanical model/operations, cable routing, remaining card identities and whole-cabinet/chassis budgeting are not completed by this increment.

Pre-publication evidence: 169 unit tests, build and all 109 local browser cases passed; desktop/mobile mixed-card screenshots inspected, no overlap or clipped labels. Independent source/code review found no blocking issues. Exact-commit deployment/live verification remains a release-time gate, not a claim made by this plan.
