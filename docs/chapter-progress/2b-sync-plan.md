# 2B NovaCor Light multi-chassis connection unit

## Scope and approach
Continue the approved offline connection curriculum. Extend the existing Light detail area with a dedicated checker, retaining its distinct three-channel IRC limit rather than borrowing NovaCor 2.0's six-channel limit. Reuse the established interaction pattern, not its hardware constants. No new chassis geometry, real SSH, credentials, firmware operations or fibre length tools.

## Sources
NovaCor Light revision 20250529, PDF reader pages 122–123, 126 and 133–140. GBH carries synchronization; IRC carries inter-chassis data. Three or more units need a Global Bus Hub. Up to four Light units fall within the three-IRC-channel direct category; more need IRC Switch. Configuration #1 uses two direct GBH and IRC links, P2P on and addresses set. #2 uses hub plus IRC direct, P2P off. #3 uses hub and IRC Switch, P2P off. Light supports NovaCor 1.0/2.0 mixed families, not PB5/GPC; this is not approval of a specific firmware combination.

## Implementation and acceptance
- [x] Add failing pure-state tests for #1/#2/#3, four/five-unit boundary, roles, unknown input, mixed-family boundary and configuration-file confirmation.
- [x] Implement a separate Light checker and mount it within 2B, with normal/error/reset examples and explicit source/boundary notes.
- [x] Add desktop/mobile browser assertions for examples, invalid counts, reset, navigation and screenshot evidence.
- [x] Run full unit/build; independent source and code review. Preserve old 2A and all model regression.
- [ ] Publish only original allowlisted text files by non-force main update after head check. Require exact-commit verify/deploy/smoke-live and actual desktop/mobile screenshot inspection.

## Boundaries
No per-port full mesh/ring wiring is invented. Optical part compatibility, measured latency and firmware versions remain unverified. A family match is not electrical/system approval. Keep 2B partial coverage; no claim of full manual completion.
