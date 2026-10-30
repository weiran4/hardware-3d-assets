# Cubicle V2 dual-constraint rail budget Implementation Plan

> **For agentic workers:** use subagent-driven development; independent review before publication.

**Goal:** Teach why meeting each rail's 100 W limit does not imply that the cards physically fit.

**Architecture:** Preserve the existing power API and contextual hardware lesson. Add a pure integer-millimetre length budget and an original proportional occupancy graphic per rail, with independent accessible results. No real mechanical model or wiring is inferred from the diagram.

**Tech Stack:** Existing browser JS/CSS, Node tests, Playwright, unchanged Pages workflow.

**Spec:** Cubicle V2 chapter 1A, PDF reading pages 30–32, revision 20260506; Figure 1.15 applies to May 2025 and newer cabinets, viewed from the rear. Left available length 144 cm, right 134 cm; each of the existing GTAO/GTAI/GTDI/GTDO V2 cards is 19.7 cm.

## Constraints and review focus
- Keep 24 V / 100 W power budgets independent; do not reinterpret the existing power boundary as physical fit.
- Source orientation is rear view; capacities must never swap under front-view assumptions.
- Invalid quantities cannot leave a stale valid occupancy picture or result.
- Large counts must not create thousands of DOM elements or horizontal overflow.
- Mobile, keyboard, reduced motion and WebGL failure retain useful parameter results.
- Existing contextual routing, hidden pause and same-canvas PiP yielding remain unchanged.
- These two checks exclude clearances/tolerances, cables/connectors, thermal and installation checks. The result is not an installation approval.
- Private manual and original figure stay private. Only facts and original UI are published. Chapter 1A stays in progress.

## Task 1 — pure state and contextual UI
Files: `web/src/rtds-cabinet-state.js`, `web/src/rtds-cabinet.js`, `web/src/rtds-cabinet.css`, cabinet unit tests.
- [x] Add failing tests for empty/mixed/invalid budgets and rear-view capacity asymmetry.
- [x] Confirm failure, then implement `railSpaceBudget` with integer millimetres; keep `railBudget` unchanged.
- [x] Add separate space outputs and original proportional occupancy graphics.
- [x] Add preset: seven GTDO V2 per rail = 35 W and 137.9 cm; left within, right over by 3.9 cm.
- [x] Keep existing 100 W preset and explicitly show that its 20 cards exceed spatial capacity.
- [x] Run all unit tests and build.

## Task 2 — integration evidence and coverage
Files: `web/tests/browser/rtds-cabinet.spec.js`, `docs/chapter-progress/README.md`.
- [x] Assert asymmetry, invalid recovery and original power boundary independently.
- [x] Check mobile/reduced-motion/non-WebGL, keyboard preset and hardware switch/back navigation.
- [x] Capture desktop and mobile length-budget screenshots; inspect actual pixels.
- [x] Independent review of source values, constraints and changes.
- [ ] Verify exact remote base and no active run, publish ordinary non-force update, require exact-commit verify → deploy → smoke-live.
- [ ] Confirm anonymous live app hash and terminal browser results before calling released.
