# Digital I/O 3D Input Lab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Ship an honest, usable 3D GTDI dry/wet input lab for presentation pages 13–14.

**Architecture:** Pure state and transitions are separate from Three.js geometry and rendering. A DOM controller uses the existing gallery routing and progressive fallback.

**Tech Stack:** Existing Three.js 0.180, native ES modules, Node tests, Playwright.

**Spec:** docs/superpowers/specs/2026-11-12-digital-io-design.md

## Global Constraints
- Original code and geometry only; no private source pages/images.
- Keep all existing routes, assets, dependencies and workflows unchanged except additive lesson integration.
- No main write until preceding 5B exact-SHA release is terminal and accepted.
- Distinguish wiring validity, raw electrical input and semantic meaning.
- Pages15–20 stay pending; do not call the digital-I/O course complete.

## Review Focus
- Powered wiring/mode/reset controls must never silently change live connections.
- Unknown or malformed state never yields a successful deterministic electrical level.
- Dry missing return can remain pulled high and must not be falsely reported as a good contact.
- Changing route, hidden tab and reduced motion stop flow and release rendering resources.
- Mobile controls and 3D labels must be readable, keyboard usable and free of overlap.

### Task 1: State and routing
Files: src/rtds-digital-input-state.js, tests/rtds-digital-input.test.js, rtds-lesson-context.js.
Interfaces: createDigitalState(mode='dry'); transitionDigital(state,action); evaluateDigital(state) -> {status,raw,voltageLabel,message,flow}; wireDefinitions and terminals exported.
- [x] Write failing threshold, wire pairing, interlock, missing return, mode/reset, malformed state and route tests.
- [x] Run red, implement pure state, rerun the tests and full unit suite green.

### Task 2: Original external devices and 3D scene
Files: src/rtds-digital-input-geometry.js, src/rtds-digital-input-scene.js, tests/rtds-digital-input-geometry.test.js.
Interfaces: createDigitalAssembly(template) -> {group,anchors,update(state,result,phase),dispose}; createDigitalScene(container,onProjection) -> Promise<{update(state,result,phase),setActive(bool),view(action),dispose}>.
- [x] Write failing tests for distinct original external devices, board anchor existence, wire visibility and contact movement.
- [x] Implement GLB reuse, authored relay/source/supply geometry, wires at functional terminals, projection and resource lifecycle.
- [x] Verify geometry tests and build; render screenshot for visual inspection.

### Task 3: Lesson UI and acceptance
Files: src/rtds-digital-input.js/css, app.js, gallery integration, index.html, browser/digital-input.spec.js, README and chapter-progress docs.
- [x] Add failing browser cases for dry opening/closure, wet thresholds/error, manual wiring, power interlocks, mobile, fallback and reduced motion.
- [x] Implement controls and projected markers; page13/14 tabs and15–20 pending labels; clear electrical/source boundaries.
- [x] Run full unit/build/browser suite and inspect desktop/mobile screenshots.
- [x] Fresh independent review, fix blockers with regression tests, freeze diff.
- [ ] Publish non-force from current main only after predecessor release accepted; verify exact-SHA verify/deploy/smoke-live before calling released.

## Local acceptance, 2026-11-12

702/702 unit tests, build and177/177 complete browser tests passed on the frozen product code. Desktop and390px mobile dry/wet screenshots were visually inspected. Independent review found3 blocking issues (powered hash navigation, runtimeWebGL loss, dry current direction); each received a reproduced regression and correction. Public release remains gated on exact-commitCI and anonymous live checks.

Known minor limits:320px device title labels can overlap, while terminal controls remain usable; the current single-mount controller does not yet remove all global listeners on an optional dispose/remount path.
