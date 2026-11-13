# Hardware core presentation: integrated batch

## Plan and acceptance
- Integrate independently reviewed GTAO scope (8–9), GTAI differential source (10/12), HV isolation panel (20), and GT I/O chain (21–23) without replacing existing GTFPI/digital I/O lessons.
- Keep presentation page routes and all 40 page coverage states. Basic experiments do not imply every topic or source page is complete.
- Check hardware/version routing, hidden-scene suspension, browser history, normal/error wiring, desktop/mobile real WebGL, and current-course keyboard focus.
- Run all unit tests, build and browser regression; publish only via existing verify → deploy → smoke-live pipeline.

## Implemented boundaries
GTAO: 3D oscilloscope, scaling, clipping and loading fundamentals; advanced oversampling/projection/watchdog remain open. GTAI: 3D signal source, differential/ground and polarity/range cases; anti-aliasing/sampling detail remains open. HV: offline solid-state switch isolation with hypothetical compatible receiver, never live high-voltage procedure. Chain: supported GT port, fiber card order/IDs and timing-critical GTDI ordering; not an electrical substitute for individual card wiring.

## Integration review fixes
Independent review found the common Enter teaching button chose the hardware default instead of the selected extra course. Added a four-course focus regression, verified failure, then made the default follow the matching route. Multiple GTDI chains now warn if any GTDI is after the first card, rather than inspecting only the first occurrence.

## Evidence
781 unit tests and build passed before final navigation correction. Focused independent integration browser review passed 26 tests. Desktop/mobile GTAO, GTAI and HV screenshots were visually inspected with actual WebGL rendering; no final mobile HV label overlap. Full regression and exact deployed-commit workflow results remain the release gate, not this note.

## CI keyboard repair
The first integrated CI passed 213/214 browser checks but blocked deployment: availability/model redraw could replace a focused chain-card action before Enter, leaving a link disconnected. A deterministic reduced-motion availability regression reproduced lost focus. Rendering now restores the same available card action without scrolling, only while the lesson is visible. Electrical validation and timeouts are unchanged. This is a product keyboard repair, not a test retry workaround.
