# Connection-first Implementation Plan

> For agentic workers: execute the small composition correction natively and obtain independent source/code review before publication.

**Goal:** Prioritize how hardware connects, preserve cabinet data only as optional reference.
**Architecture:** Existing workbench/routes/GLB remain; rtds-cabinet.js composes a connection overview and a closed auxiliary disclosure. Existing lessons retain their exact version boundaries.
**Tech Stack:** JavaScript, native details/links, existing CSS and Playwright.
**Spec:** ../specs/2026-11-03-connection-first-design.md

## Constraints and review focus
- No unknown pins, physical geometry or delays; sampling/update period is not total latency.
- Cross-hardware links explicitly state which version they select.
- Default collapsed references must not hide errors in the wiring examples themselves.
- Keyboard/history and auxiliary reopening work; no hidden animation starts.
- Existing tests for auxiliary tools explicitly open them rather than assuming default visibility.

## Implementation
- [ ] Add failing unit coverage for connection overview before closed auxiliary details and distinct timing terminology.
- [ ] Add connection entry markup with endpoint/cable/spec summaries and existing lesson/hardware links; wrap legacy cabinet tools in closed details.
- [ ] Update chapter scope/progress text: auxiliary mechanical/environment gaps do not block connection lessons.
- [ ] Add desktop/mobile/keyboard/context-history browser tests for initial focus and disclosure; retain prior auxiliary tests by explicitly opening references.
- [ ] Run full unit/build, independent review; existing exact-commit CI full browser → deploy → anonymous full smoke. Inspect actual final desktop/mobile and legacy3D screenshots and byte hashes.

Review found hardware-only links did not focus the requested interface. Add four whitelisted version/group hashes, selecting and focusing the actual interface button after metadata loading. Test parser rejection and all four links on desktop/mobile including no-WebGL fallback and back navigation. Existing hardware and lesson hashes stay unchanged.
