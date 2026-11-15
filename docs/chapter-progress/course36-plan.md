# Course 36 GTSOC V2 — scoped implementation

## Plan and acceptance
1. Keep five firmware applications distinct; implement MMC external-control loop first. SV uses existing copper16 exterior only. T-line/GPES remain evidence-only, black box remains separate course37.
2. MMC uses an original group-level optical GTSOC schematic and original B-Box controller schematic. No numbered socket, insertion geometry, physical power converter, measured timing, or copying third-party artwork.
3. Gate transfer on MMC firmware, optical front application group, compatible Aurora/MMC framing and both directions. Reject copper Ethernet module as Aurora, rear host group as external MMC control, or missing mapping.
4. Reuse existing scene lifecycle; selected hardware only, pause on switches/hidden, reduced-motion/static step/retry. Route #rtds-presentation-36 selects GTSOC V2. Leave37 unchanged.
5. Tests first: state gates and page route. Then implementation; unit suite/build; desktop/mobile browser interactions, screenshots, history and context loss. Parent reviews/publishes; no release claim here.

## Evidence and open items
Private deck36 lists firmware-dependent MMC, SV, T-line, GPES and black box. Manual PDF529 front application group/rear black-box group; PDF531 contradicts black-box front naming. July2026 RTDS GTSOC V2 brochure resolves group roles but not exact numbered jacks. Imperix PN122 provides B-Box/FPGA MMC-driver Aurora closed-loop example, not universal Aurora compatibility. Port numbering and insertion remain unverified. Existing copper16 model is an SV/Ethernet configuration, not evidence of Aurora optical sockets. All animations are qualitative, not real timing or converter physics. p36 partial; p37 not covered.

## Local verification
- New state/route tests observed failing before implementation, then 12 passed.
- Full unit suite: 832 passed; build passed.
- Supported Playwright Chromium headless with software WebGL: course36 desktop1200/mobile390 passed, including mismatches, application asset changes, reduced motion, history, hidden animation stop and context-loss recovery. Course35 desktop/mobile regression also passed (4 combined tests). Captions were inspected and fitted to textures.
- Reference-only application modes remove the external MMC controller. Copper SV exterior is never treated as an Aurora optical insertion model.
- Local verification only: exact-commit CI/deploy/live gates remain for coordinator. No publication performed here.
