# 信号接线实验室 · Wiring Lab

An original, browser-only Chinese learning exhibit: rotate actual hardware GLBs, inspect semantic ports, connect **OUT → CH1**, and send an illustrative pulse. This is a concept demonstration, **not** an electrical simulator, compatibility certification, or real-device wiring instruction.

## Develop

Node.js 22 or later.

```sh
npm ci
npm test
npm run build
npm run dev
```

Open the printed local URL. All runtime assets are self-hosted and paths are relative, so the static build works under a GitHub Pages project path. No backend, account, analytics, third-party runtime API or secret is required.

## Browser verification

```sh
npx playwright install --with-deps chromium
npm run test:browser
```

Desktop, mobile touch, keyboard, reduced-motion, invalid-port recovery, viewport bounds, loading fallback, and real model loading are covered. Browser screenshots and the Playwright report are generated separately, not copied into `dist/`. A browser run is required before claiming visual/functional acceptance; passing Node tests is not a substitute.

## Files

- `src/scene.js` — actual Three.js viewer; GLTFLoader, OrbitControls, runtime outlines and conceptual cable.
- `src/scene-config.js` — camera framing, collision-aware port labels and pulse timing.
- `src/lesson.js` — pure lesson state machine shared by all input paths.
- `public/assets/hardware.glb` — display-only derivative of the repository's original generic sample scene; geometry, hierarchy and semantic anchors retained.
- `tests/` — state, GLB, geometry, camera and browser checks.
- `dist/` — generated public website only; never copy authoring `.blend`, source scripts, QA notes or secrets here.

The GLB exporter has already converted Blender Z-up to glTF Y-up. Do not apply that conversion again. The scene resolves anchors by semantic `sid` and uses their world positions; glTF local +Y maps to the authored port's outward axis. Connector-tip alignment is tested. Compatibility metadata remains unknown. All served models can be downloaded by visitors.

## Publication

Repository workflow `.github/workflows/deploy-pages.yml` runs Node tests, builds, performs real Chromium QA, preserves screenshot artifacts, and publishes **only** `web/dist` after the verification job succeeds. The repository's Pages source must be **GitHub Actions**. The workflow uses no custom credentials and grants deployment permissions only to the deploy job.

Three.js is MIT-licensed; see `public/third-party-notices.txt`.

## RTDS library / interface inspection

Use the **RTDS 素材库** mode, or link directly to `#rtds`. The original generic lesson remains the default and its connection state survives mode switches.

- 18 distinct version entries, with **seven original 3D visual candidates**: NovaCor 2.0 (2023 exterior), GTDI V2 PCB 2.01, GTDO V2 PCB 2.00, GTAI V2 PCB 2.31, GTAO V2 PCB 2.20, GTFPI V2 PCB 2.01 (capped GT ports), and GTSOC V2 / Model GTSOC-2A (16 copper RJ45 SFP modules). Remaining entries are reference-only, not completed models.
- The RTDS viewer uses each asset's real `sid` and `ports.json`; it never uses generic OUT/CH1 identities or wiring compatibility rules.
- Front/rear/top bookmarks, one-group-at-a-time inspection, exact-ID detail, one high-contrast orange projected rectangle with a dark understroke and thick corner brackets around the selected group (or just the selected port), isolation, and a play/pause group tour. The rectangle follows orbit, zoom and resize; it hides for rear-facing/offscreen targets and clears on reset/version change. The tour is an inspection aid, not LED behaviour, firmware timing, real device control, electrical simulation or certification.
- GTDI's 16 installed five-position plugs represent 80 terminal positions / 64 input channels. Four unresolved service regions remain informational only; they are excluded from selection and automatic tours. Any unverified pin assignment stays unknown.
- Metadata keeps source facts separate from photo-estimated placement/dimensions. Model availability never implies approved mating or electrical compatibility. Manufacturer images and the private manual are not copied into the website.
- RTDS renders only when the camera or selection changes, caps DPR at 1.5, and pauses when inactive. The existing generic renderer is paused while its mode is hidden.

`src/rtds-catalog.js` contains condensed authored facts and citations. `src/rtds-models.js` registers the seven exact integration candidates; `public/assets/rtds/` contains public GLBs and metadata only. Inspect these assets before publication for embedded source paths or images. Do not copy research folders, reference screenshots, `.blend` files or the private manual into `public/`.

`tests/browser/rtds.spec.js` adds real-model inspection, mobile width, rear-surface camera, tour scheduling, reference-only fallback, mode switching, failed-load recovery and stale async-load coverage. CI screenshot review is still required for visual acceptance.

## RTDS conceptual signal flow

The lower RTDS section illustrates one virtual logical input through GTDI V2 PCB 2.01 into NovaCor 2.0. The external value, in-flight demonstration value and illustrative received value are separate. Manual step, play/pause and reset affect presentation only; switching modes or hiding the document pauses playback. Reduced motion uses discrete state changes.

The optical role association (`gtdi-v2-2.01.gt1` ↔ `novacor-2.0-2023.gt1`) was independently checked against the version-scoped source and the exact native/exported anchor geometry. Endpoint buttons inspect those real model IDs. This does **not** validate cable mating, electrical conditions, Tx/Rx polarity, pin wiring, firmware or timing. No RTDS case is executed and no hardware is connected. The diagram's one-way application-data arrow is distinct from the bidirectional optical transport association. Mixed-card chains are deliberately excluded.

`src/rtds-signal-state.js` is the deterministic presentation state machine; `src/rtds-signal-flow.js` owns accessible controls and scheduling. Source images and the private manual remain excluded. `tests/browser/rtds-signal.spec.js` covers interaction, pause/recovery, exact endpoint selection, failed loads, keyboard, reduced motion and five mobile/tablet widths; CI and screenshot inspection remain required before visual acceptance.

### Readable functional inspection

02 automatically opens the common 03 description, or the first genuinely distinct functional subtype. Repeated Aurora / GTI/O / IRC / GTAI ports share one explanation instead of repeated buttons. Optical upstream/downstream, known upper / unknown lower supply and GTAO channels 13–16 remain separate. DI/DO share an exact eight-bank odd/even contact map with common terminals and first signal positions marked. This does **not** narrow the 02 group camera/highlight: an explicit subtype, 3D hit or optional physical-port selector changes the inspection target. The physical selector is inside collapsed model notes and preserves keyboard access to every real anchor. Unresolved service groups do not auto-select a guessed contact. Primary 03 text explains documented function, connection objects and parameters; model IDs, estimated dimensions and geometric provenance remain in a collapsed secondary record. NovaCor LC/SFP and dedicated GBH cable facts are not replaced with the model's unvalidated-mating status. Functional descriptions cite version-specific manual pages and supporting public manufacturer references; no private manual or source pictures are distributed.

Default body text is 16px, main description 16px and parameter rows 15px; small-screen rows stack instead of shrinking their content. Browser coverage includes automatic selection, retained Aurora union/single selection, one-port groups, GTDI unknown lower-power pin order, GBH cable conditions and 320/390/560/768/800/1024/1100/1440px layouts.


### GTI/O batch 2

The gallery now includes GTDO V2 PCB 2.00, GTAI V2 PCB 2.31 and GTAO V2 PCB 2.20 in addition to the original NovaCor / GTDI models. Each uses its own frozen GLB and matching embedded/sidecar port records; V1 catalog entries remain reference-only. GTDO has 64 channels but 80 terminal positions, GTAI has 12 differential channels / 36 positions, and GTAO has 16 outputs / 32 positions (13–16 are NovaCor-only). Unknown service contacts remain noninteractive, and lower power pin assignments remain unknown. All five are educational original geometry, not mating-certified manufacturing CAD.


### Desktop following viewer

At desktop widths of 1024px and above, scrolling below the main model moves the **same** viewer element/canvas into a bottom-right mini-window. A same-height source slot preserves the layout; scrolling back returns it. No second Three.js scene or WebGL context is created. The mini-window supports orbit/zoom, projected highlights, keyboard view controls, minimize, close and return-to-main. A stable right reading gutter is reserved whenever the desktop RTDS model is ready, not toggled during docking/close/minimize, so the default-sized mini-viewer leaves controls and details clear and does not reflow them when it opens or closes. It is disabled on mobile, reference-only/error/loading states and the generic mode; event listeners/animation scheduling are disposed together.

Drag any edge or corner to resize the desktop window; its opposite edge stays anchored. Visible corner grips and directional cursors identify the resize areas. The expanded frame starts at 320 × 306px, normally stops at 280 × 240px, and always fits inside an 18px viewport margin (smaller viewports take precedence over the minimum). The canvas resizes in place without resetting orbit, zoom, selection, highlights or identity badges. The chosen size survives minimize/restore, return-to-main and temporary viewport clamps within the session. The reading gutter stays fixed during resizing to prevent text jumps; deliberately enlarging the window can overlay more of the page.

Keyboard users can Tab to the upper-left resize grip: arrow keys adjust the corresponding edge by 16px, Shift + arrow uses 48px, and Home restores the default window size. Escape during a drag cancels that resize; otherwise it closes the following viewer. Pointer capture and temporary resize listeners are released on completion, cancellation, focus loss, dismissal and mode/viewport changes. Mobile remains inline-only.

The release suite contains 98 unit tests and 59 browser scenarios. Real browser screenshot acceptance is performed by the existing GitHub Actions verify → deploy → smoke-live workflow, not by a local/browser-policy bypass.

### Floating card identity

GTDI / GTDO / GTAI / GTAO carry a screen-space DI / DO / AI / AO annotation anchored to an existing decorative component. The visible “视觉标注” caption distinguishes this from physical silkscreen. Fixed pixel text follows orbit/zoom/resize and the reused desktop floating viewer. Collision checks protect every projected interface; the leader is masked over those regions, and all interface inspection hides the badge until reset. No GLB, materials, pin mappings or electrical claims change.


### Auxiliary interface batch

The existing `gtfpi-v2` and `gtsoc-v2` catalog placeholders are upgraded in place: stable IDs, 18 entries, 7 modeled assets, no duplicate V2 rows. All previous five GLB/metadata pairs remain byte-identical. The new GLBs are unchanged copies of their independently audited source exports; source originals stay in their original asset folders.

- **GTFPI PCB 2.01, capped GT ports:** 94 exposed electrical pins = 50 HV + 34 LV + 8 board-power + 2 auxiliary. HV and LV connect separate panels; the board is not itself the HV contact panel. The two GT assemblies each represent one duplex link and remain capped. Both four-position power pin orders, the green open two-pin header's spatial polarity, complete ribbon pin mappings, and covered optical geometry remain unverified. Two unresolved service regions stay noninteractive.
- **GTSOC V2, nameplate Model GTSOC-2A, copper16:** 151 electrical contacts = 16 × 8 front RJ45 + 3 × 4 USB-B service + 8 rear ETH + 3 AC. The 4 rear duplex optical units have 8 white exterior features, not asserted electrical contacts; cap-versus-sleeve remains unresolved. Copper SV population is not universal Aurora/fibre compatibility. PS, PL and JTAG have distinct source-documented service roles; rear ETH is MMC workstation monitoring. Application capacity depends on firmware, modules and licensing. AC input, maximum consumption and fuse ratings are stated separately.

The common 03 panel opens automatically, merges genuinely repeated ports, and retains HV/LV, upstream/downstream, service-purpose and rear-port-1 distinctions. Important wiring uncertainties remain in the main facts; estimated model geometry remains in collapsed notes. The existing same-canvas desktop PiP, four card identity badges, orange highlights, conceptual GTDI flow, and generic lesson remain unchanged.

`tests/rtds-auxiliary.test.js` checks exact public metadata/GLB agreement, counts, identities, grouping and functional limits. `tests/browser/rtds-auxiliary.spec.js` adds desktop/mobile facts, highlights, same-canvas PiP, and superseded-load coverage for both models. Collection or Node success is not a claim that browser execution passed; acceptance still requires the existing official verify → deploy → smoke-live workflow and screenshot review.
