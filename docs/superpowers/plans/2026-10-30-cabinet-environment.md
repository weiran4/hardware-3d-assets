# Cubicle V2 environment conditions Implementation Plan

> **For agentic workers:** use subagent-driven implementation with independent review before release.

**Goal:** Teach that acceptable temperature and relative humidity do not establish non-condensing, clean operating conditions.

**Architecture:** Add a small pure check function and contextual form to the existing Cubicle V2 lesson. Preserve independent power and nominal-length tools, lighting, routing and PiP behavior. User-entered conditions are assumptions for offline learning, not sensor readings or permission to operate.

**Tech Stack:** Existing JavaScript, CSS, Node tests, Playwright and unchanged Pages pipeline.

**Source/spec:** 1A Cubicle V2, revision 20260506, PDF reading page 34, §1.9: ambient 15–30 °C, relative humidity 30–60%, non-condensing, relatively clean office-like environment. No dew-point or dust-limit values are supplied, so do not invent them.

## Acceptance and review focus
- Temperature and RH are independently evaluated, including exact endpoints, out-of-range and invalid/empty values.
- Condensation and cleanliness are explicit user-provided qualitative assumptions, defaulting to unknown.
- Normal numeric values with condensation must not pass; unknown conditions must not pass.
- RH outside physical 0–100% is invalid, never silently clamped or treated as an ordinary operating-range result.
- Results must say stated-condition checks only, not whole-system safety/installation certification or measured monitoring.
- Normal, boundary and condensation-error examples are clearly synthetic examples. Static parameter interaction is appropriate; no invented hardware timing or mechanics.
- Keyboard, mobile, reduced-motion and no-WebGL operation remain usable; no horizontal overflow or PiP obstruction.
- Hidden lessons remain hardware-contextual; history navigation and prior model/animation regression stay intact.
- Publish only original code, tests and authored source summaries, never private pages or images. Chapter remains partial.

## Steps
- [x] Write failing pure-state tests for limits, errors, independent conditions and unknown states.
- [x] Implement the smallest checker and accessible contextual form, preserving other tools.
- [x] Add browser normal/error/recovery, keyboard, mobile/non-WebGL and context/history assertions with screenshots.
- [x] Independently review sources, code and tests; run complete unit/build and browser verification.
- [x] Inspect actual desktop/mobile pixels and document remaining chapter gaps.
- [ ] Confirm remote base/no running publisher, ordinary non-force main update.
- [ ] Require exact-commit verify → deploy → smoke-live, anonymous hash match and live screenshot inspection before release claim.
