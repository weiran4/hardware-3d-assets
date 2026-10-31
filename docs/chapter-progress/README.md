# Chapter coverage

Updated 2026-10-31. 1A Cubicle V2 (PDF 16–36, revision 20260506) is **foundational / in progress**, not accepted as a complete chapter.

Implemented: independent 24 V / 100 W per-rail power budget for GTAO V2, GTAI V2, GTDI V2 and GTDO V2; normal, overload and power-boundary presets; independent nominal-length budget (rear-view left 144 cm / right 134 cm, May 2025+ V2 cabinets), four V2 card types at 19.7 cm each plus revision-specific GTDI V1.11 and GTDO V1.21 at 26.6/28.5 cm, original proportional occupancy bars and a 7-card GTDO V2 counterexample (35 W fits both power budgets but 137.9 cm exceeds the right rail by 3.9 cm); invalid input handling; rear LED / local internal-light dependency; independent operating-environment checks for temperature, relative humidity, user-assessed non-condensing and office-like cleanliness conditions; 29-unit chapter navigator. The existing actual-model GTIO lesson retains its Cubicle V1 source labels.

Remaining: cabinet mechanical operations and verified model geometry; cable routing; other card types and full chassis/cubicle power budget. Uncertain fiber units are excluded. No private manuals or third-party illustrations are included.

Verification: the length-budget slice adds unit and browser coverage for left/right asymmetry, independent power and space results, invalid-input recovery, large counts without layout overflow, contextual navigation, keyboard, and mobile/reduced-motion/non-WebGL operation. Test counts and release status must be read from the exact-commit Actions result, not inferred from this progress document. The existing CI verify → deploy → smoke-live workflow must pass for the exact publishing commit, and screenshot evidence must be inspected. See the repository Actions result for that commit; this document alone does not certify deployment.

Other units remain pending; a model or earlier individual lesson does not count as chapter acceptance. The in-page navigator lists their precise PDF reading-page ranges. The 5 firmware units are a teaching partition of the appendix, not 5 original chapters.

Visual review caught the floating model covering the lighting result on desktop. The chapter now temporarily returns the same canvas inline while its parameter section occupies the reading center, restoring normal floating behavior outside the chapter; a browser visibility assertion guards this. This does not recreate a renderer or reserve a layout gutter.

## Contextual lesson navigation

Teaching is scoped to the explicitly selected hardware, inside its workbench rather than a global bottom-of-page stack. NovaCor 2.0 exposes its analog-output lesson; supported V2 I/O cards expose the existing GTAO dual-card supply example with its Cubicle V1 boundary; the parameter-only Cubicle V2 catalog entry exposes chapter 1A. Other hardware versions do not borrow these lessons. Initial implicit selection leaves lessons hidden. Known deep links route the matching hardware before revealing teaching; switching hardware pauses irrelevant lessons. Chapter coverage remains foundational/in progress.

## 1A nominal rail-space budget

Source facts: PDF 30–32; Figure 1.15 is explicitly a rear view for Cubicle V2 May 2025 and newer. The state uses integer millimetres (1440 / 1340 mm; 197 mm per V2 card, 266/285 mm for the supported legacy digital cards), displaying cm. Existing power limits remain independent. A 100 W power-boundary configuration can still fail the length check. The original graphic clips its drawn occupancy to rail capacity while the text reports the full excess; it is not a reproduced manual illustration, exact mechanical model, wiring plan or installation approval. Clearances, tolerances, connectors, cable ratings and thermal conditions are not checked.

## 1A operating-environment conditions

PDF reading page 34, §1.9 (Cubicle V2, revision 20260506) states ambient 15–30 °C, relative humidity 30–60%, non-condensing, and a relatively clean office-like environment. The contextual checker evaluates these independently, defaults qualitative assumptions to unknown, and provides synthetic normal, endpoint and condensation-error examples. Empty/non-finite numeric entries and RH outside 0–100% are invalid. Numeric values alone cannot establish the qualitative conditions. No sensor, dew-point model, dust-limit threshold, permission to operate or whole-cabinet certification is implied.

New tests cover independent statuses, exact endpoints, invalid recovery, unknown conditions, keyboard and contextual history, plus mobile/reduced-motion/no-WebGL screenshots. The exact-commit release pipeline and actual screenshot inspection remain the release gate. This increment does not complete chapter 1A or advance to 1B.

## 1A revision-specific legacy digital cards

PDF 32 now also drives GTDI V1.11 (6 W; V1 nominal length 26.6 cm) and GTDO V1.21 (12 W; V1 nominal length 28.5 cm). Each input displays its own length as well as power. The original four V2 entries are unchanged. A mixed arithmetic example uses one of each legacy digital entry plus GTDI V2 and GTDO V2: 31 W and 94.5 cm per rail. Five GTDO V1.21 cards use 60 W and 142.5 cm: 1.5 cm left-side nominal spare, but 8.5 cm right-side excess. The graphic uses actual per-entry nominal lengths, not uniform card widths.

These examples establish neither cross-version electrical/interface compatibility nor installation clearance. The old-card power figures must not be applied to unspecified V1 revisions. GTFPI/GTSYNC version identification and GTAI V1 power are not assumed. Normal/reset, invalid-input recovery, keyboard/history, desktop/mobile and reduced-motion/no-WebGL tests are included. Chapter 1A remains in progress; mechanical geometry, operations, cable routing, remaining cards and whole-cabinet budgeting remain open.
