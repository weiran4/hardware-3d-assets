# 1A cable-access comparison — implementation plan

Goal: distinguish the V2 cabinet's verified cable entries and explain why a closed side panel or a still-attached LED connector cannot be ignored when discussing side-by-side routing.

Design: a parameter-only location schematic and explicit state comparison inside the existing selected-hardware chapter. Top has four corner entries; bottom opening is 12 × 3 inches (304.8 × 76.2 mm); side access depends on the panel. PDF 21–22 (§1.2.1) and 33 (§1.7), revision 20260506, inspected visually. No source image is published. Geometry is deliberately non-scale, not a realistic mechanical model, cable-fill calculation, installation drawing, operation sequence or permission to work. No mains/electrical operation is simulated.

Alternatives considered: a realistic removal animation lacks sufficient mechanical/clearance evidence; a full-cabinet watt total has unresolved baseline inclusions. Use a sourced access-location comparison now; leave those gaps explicit.

Tasks / acceptance:
- [x] Add pure `cableAccessCheck({route,panel,led})` state model and test first. Routes top/bottom/side; panel installed/removed/unknown; LED connected/disconnected/unknown. Unknown/invalid input cannot silently pass. Top/bottom do not depend on side-panel assumptions. Removed+connected is an error, installed is blocked, unknown remains unknown, removed+disconnected only satisfies this narrow assumption.
- [x] Build accessible route/state controls, original labeled schematic, source and limits, normal / blocked / unsafe-assumption examples. No animation timer or hidden playback. State does not claim actual hardware status. Side controls disabled for other routes; changing routes retains user assumptions.
- [x] Test desktop/mobile, keyboard, repeated route changes, contextual hardware/history, reduced motion and no-WebGL fallback. Inspect screenshots; preserve existing lessons and PiP.
- [ ] Independent review; all unit/build/browser checks; exact-commit verify → deploy → smoke-live, actual online screenshots and file hash before release claim. Keep chapter 1A partial.

Review focus: stale side assumptions on top/bottom; incomplete fields; impossible removed/connected state; invalid enum/prototype names; misleading approval language or schematic dimensions.

Local verification: 173 unit tests/build and 111 browser tests passed; actual desktop/mobile screenshots reviewed; independent reviewer found no blocker. Release verification remains pending at commit creation and is established only by exact-commit Actions plus live evidence.
