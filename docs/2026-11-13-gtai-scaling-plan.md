# GTAI V2 scaling · implementation and acceptance

Scope: course page 11 basic interaction, extending the existing real GTAI V2 + original 3D differential generator. Private course page 11 explicitly shows 1/SC; manual PDF 336 confirms ±10 V and PDF 354 confirms per-channel scale settings. No source images are published.

Plan: add a positive teaching SC control, display physical input and derived simulation value simultaneously, and animate a normalized engineering-value meter beside the existing 3D circuit. Example SC=5 V per teaching unit makes 5 V → 1 unit. Physical ±10 V is fixed, not expanded by software scaling. Zero SC and overrange inputs are rejected by teaching interlocks. No claim about RSCAD's complete accepted SC parameter domain.

Acceptance: unit tests for inverse scaling, reversed polarity, zero/invalid scale, powered edits, and physical overrange independent of SC; browser normal/error examples, animation lifecycle, reduced motion, loading recovery, desktop/mobile screenshots. Preserve existing wiring/model and deep links. Coverage remains basic: no ADC quantization, filtering, actual latency, or calibrated external transducer model.

Validation correction: the first implementation failed the full browser gate before deployment. Reassigning the meter's hidden property during a document-wide hidden-attribute observer callback created a self-triggered mutation loop. The fix writes only when visibility changes; a regression test proves unchanged renders make no writes and changed states drain the observer queue. CI now stops after three browser failures to avoid repeating a global-load failure hundreds of times; successful verification still runs every test, and deploy plus anonymous smoke-live remain mandatory.
