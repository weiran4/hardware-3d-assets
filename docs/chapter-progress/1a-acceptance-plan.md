# 1A bounded teaching acceptance plan

2026-11-03. Compare reader pages 16–36 (Cubicle V2 revision 20260506) against the nine-row source register and current implementation. Inspect diagram pixels, not only extracted text. Independent review must distinguish known missing facts from unsupported physical installation assumptions.

Acceptance scope: versioned offline parameter/state teaching, normal/error and invalid input paths, hardware-specific visibility/hidden pause, existing deep links/history, desktop/mobile/keyboard/reduced-motion/load failure and legacy 3D regression. This is not complete hardware documentation or an installation approval. Partial coverage must remain visibly labeled basic.

Audit found a concrete conflict: PDF 25–26 show 24 V / 3.8 A while PDF 28 prose states 100 W per rail. Preserve the prose-based 100 W teaching threshold, disclose both sources next to the budget, and do not present P/24 or 4.17 A as verified supply capability. Do not silently replace either source, create a new preset or infer an overload behavior.

Before publication: add a regression for the source boundary, run complete unit/build checks, obtain independent review, retain unchanged verify → deploy → smoke-live, inspect exact-commit desktop/mobile and legacy rendered evidence, and compare anonymous live bytes. Local Chromium socket denial is not a browser pass; approved CI rendering is the fallback.
