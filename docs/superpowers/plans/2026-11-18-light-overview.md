# Light overview companion implementation plan
Add a bounded two-Light companion exercise to course38, above the existing course39 I/O labs. Show four available cores as overview (licensing/configuration dependent, not benchmark or linear capacity), original Light chassis with four core blocks, and separate GB sync / IRC data paths. Presets: direct GB+IRC and P2P enabled; GBH sync + direct IRC and P2P disabled; GBH sync + IRC switch and P2P disabled. Only two units are instantiated, no mixed-version or larger-system capacity assertion. Source: course38 and manual PDF133–136. Tests first: independent sync/data prerequisites, incorrect settings, wrong interface, reset and scene links. Then shared scene network mode and panel lifecycle; desktop/mobile WebGL, faults, reduced motion, navigation/hidden stop and recovery. Preserve analogue/digital/UDP tests. Basic/partial course coverage only.

## Acceptance and evidence
- Implemented only the bounded two-Light presets (direct, GBH + direct IRC, GBH + IRC switch), not three/four/larger or mixed-version systems.
- New state test first failed with missing implementation, then passed. Independent path status, wrong WIF/media/P2P, unsupported topology and reset isolation covered.
- P38 overview states core availability/licensing and non-benchmark comparison, plus separate p39 I/O link. No fixed capacity, interchangeable connector or timing claims.
- Independent visual review found direct routes overlapped: corrected only direct-network midpoints with opposite offsets, desktop vertically / compact horizontally.
- Render fallback/retry, reduced-motion static step, route deactivation, keyboard activation and p39 focus are exercised in browser checks. Private manuals are referenced by page only; no PDF or third-party image included.
