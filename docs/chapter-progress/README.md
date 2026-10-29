# Chapter coverage

Updated 2026-10-29. 1A Cubicle V2 (PDF 16–36, revision 20260506) is **foundational / in progress**, not accepted as a complete chapter.

Implemented: independent 24 V / 100 W per-rail power budget for GTAO V2, GTAI V2, GTDI V2 and GTDO V2; normal, overload and exact-boundary presets; invalid input handling; rear LED / local internal-light dependency; 29-unit chapter navigator. The existing actual-model GTIO lesson retains its Cubicle V1 source labels.

Remaining: cabinet mechanical operations and verified model geometry; cable routing; other card types and full chassis/cubicle power budget. Uncertain fiber units are excluded. No private manuals or third-party illustrations are included.

Verification: 154 Node tests and production build passed locally. Two new browser scenarios cover desktop input/keyboard, mobile/reduced motion/non-WebGL fallback and produce screenshots. Local browser launch was blocked by the execution environment; this is not a browser or visual pass. The existing CI verify → deploy → smoke-live workflow must pass for the exact publishing commit, and screenshot evidence must be inspected. See the repository Actions result for that commit; this document alone does not certify deployment.

Other units remain pending; a model or earlier individual lesson does not count as chapter acceptance. The in-page navigator lists their precise PDF reading-page ranges. The 5 firmware units are a teaching partition of the appendix, not 5 original chapters.

Visual review caught the floating model covering the lighting result on desktop. The chapter now temporarily returns the same canvas inline while its parameter section occupies the reading center, restoring normal floating behavior outside the chapter; a browser visibility assertion guards this. This does not recreate a renderer or reserve a layout gutter.

## Contextual lesson navigation

Teaching is scoped to the explicitly selected hardware, inside its workbench rather than a global bottom-of-page stack. NovaCor 2.0 exposes its analog-output lesson; supported V2 I/O cards expose the existing GTAO dual-card supply example with its Cubicle V1 boundary; the parameter-only Cubicle V2 catalog entry exposes chapter 1A. Other hardware versions do not borrow these lessons. Initial implicit selection leaves lessons hidden. Known deep links route the matching hardware before revealing teaching; switching hardware pauses irrelevant lessons. Chapter coverage remains foundational/in progress.
