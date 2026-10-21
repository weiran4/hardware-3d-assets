# GTAI V2 PCB 2.31 — source-grounded bounded asset

## Brief and scope
Produce an editable original visual candidate for the approved RTDS library, prioritizing visible core connector topology, numbering, orientation and seating. Match **manual Figure 7.1 PCB 2.31**, chapter revision 20240924; do not mix the different public-photo PCB 2.21. User requested autonomous intermediate decisions and final review only.

Component side is +Z, upright board top +Y, signal terminals +X and optical ports −X. PCB envelope 100×180×1.6 mm is photo-estimated. Phoenix 1803581 removable plug envelope 12.22×11.1×16.1 mm and 3.81 mm pitch are manufacturer-documented; installed PCB header/absolute placement are estimated. Original mesh/colors/text only; no photo or manual media distributed. Target <=60,000 placed triangles, metre units, BLEND + GLB + metadata + neutral and cream preview evidence.

## Evidence decisions
- PDF337/340: exact revision and component layout; twelve 3-position removable terminal plugs, 2 GT optical cages, 2 keyed 4-contact power headers, 8-switch DIP, upper service header and upper USB-like outline.
- PDF347 Fig7.8: upright per-channel top-to-bottom **+, −, ground**; right-angle installed connectors. PDF339 names Phoenix 1803581. Manufacturer page confirms count/pitch/envelope.
- PDF341 Fig7.3: upper power top-to-bottom +24V/GND/GND/NC and left corner-chamfer shape. Lower header pin order not independently established.
- Optical internal dimensions, exact transceiver part, Tx/Rx mapping, service contact counts and mating tolerances remain unknown. Use reusable observed optical visual topology, never certify mating. Service mouths are hollow outlines without invented pins.
- Decorative components are representative; underside DIN latch is not invented.

## Test-first sequence
1. Write failing semantic and native-geometry contracts: 12×3 signal contacts, channel labels/order, two 4-contact power headers, two duplex optical ports, 18 anchors total, no service contacts.
2. Build source-derived blockout and original connector bodies. Physical mouth openings, contact rays, key shoulder position and board supports are tested, not metadata alone.
3. Save/reopen, four cheap orthogonal side diagnostics, complete native geometry/contract checks, actual GLB clean import with repeated geometry and full semantic/frame/material comparison.
4. Freeze final BLEND/GLB hashes before 11 presentation views. All previews record final master hash. Inspect upright top, contact close-ups, sides, neutral and wireframe. Independent audit remains separate.
