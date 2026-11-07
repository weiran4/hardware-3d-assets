# 2C NovaCor 1.0 multi-unit connections

## Scope and design
Extend the independent 2C course with an offline connection checker. Source: chapter revision 20230523, PDF156–157,164,169–175,177–180. Reuse the native form/result design; do not import Light rules or reuse its four-unit limit. No physical model, real device commands, timing simulation or firmware changes.

## Implementation and acceptance
- [x] Add failing state tests for three source configurations, 7/8 direct IRC boundary, GBH versus IRC role errors, P2P and configuration assumptions.
- [x] Implement `checkNovaOneSync(input)` in `web/src/rtds-novacor-one-sync.js`: bounded statuses invalid/unknown/match; require known protocol, family and links; PB5/GPC uses GTWIF, protocol B and cross-generation small-time-step subnet are rejected; legacy-step acknowledgment required. Unknown families and mode never get approval.
- [x] Integrate `initNovaOneSync(root)` inside 2C, with side-by-side controls/results, real source pages, normal/error/recovery presets. Treat protocol selection as an assumption, not cable-length/firmware validation.
- [x] Add desktop/mobile/fallback keyboard, boundary, legacy, repeated switching and history tests. Preserve existing tests.
- [ ] Independently review source and code. Full tests/build; actual browser screenshots locally if permitted, otherwise existing CI. Only publish original files, via normal main update. Exact-commit verify/deploy/smoke-live and anonymous resource match are final acceptance.

Review focus: malformed inputs, inherited option keys, conflicting legacy conditions, count boundaries, unknowns masked by a configuration number. Missing physical geometry, wiring matrices and measured latency remain gaps, not invented details.

Independent source and code review passed: 403 unit tests and build; 108,000 state combinations checked without an unsafe match. Browser, screenshot and release acceptance remain required at the exact published commit; local system Chromium could not launch (crashpad environment failure).
