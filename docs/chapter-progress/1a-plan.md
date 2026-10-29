# 1A Cubicle V2 — first implementation plan

Source: Hardware Manual, Cubicle & Power V2, revision 20260506, PDF 16–36. Only factual paraphrases and original code are published.

Scope: add a lightweight 29-unit chapter navigator and honest coverage; a version-specific two-rail 24 V / 100 W load-budget tool with normal and overloaded presets; independent LED/local-light controls. Link, but do not relabel, the existing Cubicle V1-based actual-GTAO-model demonstration. No mains wiring instructions, no invented mechanical model or operating timing.

Acceptance: separate rail limits (unused power cannot transfer); maximum loads, watts and derived amps at 24 V clearly labeled; invalid/fractional/negative input rejected; light requires both switches; keyboard/mobile usable; existing 3D library and lessons retained. Unit tests, build, browser desktop/mobile/keyboard tests and screenshots; independent review. Existing verify → deploy → smoke-live must succeed for exact commit before publication is claimed.

Coverage: first release is foundational, not whole-chapter complete. Cabinet mechanical operations, verified cable routing and full chassis budget remain pending. Source fiber unit anomaly excluded from calculations. No private manual, photographs or private file paths in repository.
