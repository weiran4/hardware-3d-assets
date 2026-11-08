# IRC Switch V2 connection mapping unit

Scope: revision 20250910, PDF181–196. Deliver an offline NovaCor 1.0 IRC-to-switch mapping checker and management-port selector. No real device operations, geometry, timing or guessed optical compatibility.

1. Test capacity (1–6 cards, 24 ports each), physical/config tuples, duplicate switch ports and rack/IRC endpoints, missing entries, channel ranges and saved-state handling.
2. Add original Chinese lesson, valid unequal-number example switch7/rack5/IRC1, mismatch/duplicate/over-capacity/recovery cases. Distinguish IRC data from GBH synchronization. Card1 only for Ethernet and USB management.
3. Integrate hardware selector and chapter3 route, preserving other lesson visibility, history, PiP and model behavior.
4. Independently verify sources/code, run full unit/build/browser suite, inspect desktop/mobile and legacy screenshots. Existing CI verify/deploy/smoke-live is the publication gate.

Acceptance: correct tuple equality rather than matching switch-port/rack numbers; no malformed, missing, duplicate or out-of-range input passes. Unknown settings never claim readiness. Source pages and partial coverage visible. Keyboard/reduced-motion/fallback supported.

Remaining evidence: exact optical compatibility (PDF194 specifications require cross-check), full firmware combinations, physical connector geometry, multi-switch details and measured latency. Do not turn generic chapter181 seven-unit guidance into a NovaCor Light rule.
