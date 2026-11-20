# GTAI scene: 81150A Option 002 visual reference

The left instrument is an original procedural reconstruction of the Agilent/Keysight 81150A Option 002 exterior. It is not an instrument simulator or a verified compatible GTAI source. The nine front BNC shells have no selection anchors or electrical meaning. The separate colored gp/gm/gg teaching points retain the existing ideal circuit and are not attached to BNCs. There is no invented independent REF connector. The LCD is dark; plots and readouts are explicitly teaching overlays.

## Photo evidence
- Actual front: https://i.ebayimg.com/images/g/COcAAOSwPu9mNu6u/s-l1600.webp
- Same photographed unit rear: https://i.ebayimg.com/images/g/WXcAAOSwl6NmNu6w/s-l1600.webp
- Official quick guide: https://www.keysight.com/us/en/assets/9018-06622/quick-start-guides/9018-06622.pdf
- Official datasheet: https://www.keysight.com/us/en/assets/7018-01537/data-sheets/5989-6433.pdf

Reference envelope with bumpers: 439 W × 108 H × 456 D mm. Front silhouette, left dark LCD panel, display soft keys, numeric keypad, cursor cluster, rotary knob, right control field and nine gold BNC shells are modeled. Rear has the photographed perforation pattern, small connectors on viewer-left and AC inlet on viewer-right. Hardware identity, typography, tiny labels, hidden mechanisms and mechanical depth of jacks are approximate. Rear feature names intentionally avoid assigning unverified signal roles. Perforation dark disks are a rendering approximation rather than manufactured through-holes. Text is original canvas typography; no photo, vendor graphic or private document pixels are embedded.

## Reproduction and checks
`web/src/rtds-gtai-81150a.js` exports a visual-only Three.js group. +Y is up, +Z is front. Default width .16 scene units; dimensions uniformly scaled from the reference envelope. `web/src/rtds-gtai-lab-scene.js` attaches this group while leaving state evaluation, gp/gm/gg locations and board anchors unchanged.

From `web/`:
- `npm test`
- `npm run build`
- `PLAYWRIGHT_BROWSERS_PATH=.browsers node tests/gtai-lab-browser.mjs`
- `PLAYWRIGHT_BROWSERS_PATH=.browsers node tests/gtai-81150a-photo-browser.mjs`

The scoped photo harness checks nine visual BNC objects and zero physical selection anchors, and produces `/tmp/gtai-81150a-front.png` and `/tmp/gtai-81150a-rear.png`. The integration harness checks ideal readings, reversed/ground/range behavior, mobile width, reduced motion, context loss/retry, disposal/remount and blocked GLB recovery. Images are generated QA artifacts, not source photo copies.

The keyboard-accessible 看 81150A 正面 / 返回差分接线 toggle isolates a centered front view in the same renderer. Board, wires, teaching point labels and floating readout are hidden during inspection; camera and visibility restore without changing the circuit state. Desktop and 390-pixel inspection screenshots are emitted by the integration harness.
