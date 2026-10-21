# GTAO V2 PCB 2.20 — bounded source-grounded asset

User intent: continue reusable original hardware library; prioritize accurate critical ports over decorative passives, final-result review only. No intermediate approval question per explicit user preference. Existing asset workflow is reused; no shared or frozen assets changed.

## Evidence and approach
- Private manual chapter 6A rev20240924, PDF279 Figure6.2: PCB 2.20, sixteen individual two-contact output plugs, two optical cages, two keyed 1x4 power connectors, eight DIP rockers, round and lower rectangular heatsinks.
- PDF278 identifies Phoenix1803578; PDF289–290 establishes upright top positive / bottom return. Manufacturer product page independently verifies two positions, 3.81mm pitch, W8.41 H11.1 L16.1mm. Original geometry, not downloaded CAD.
- PDF282: upper power connector +24V/GND/GND/NC top-to-bottom. Lower connector role known; pin ordering remains unvalidated.
- Service header and USB-like mouth visible but fine contact/key geometry unverified: hollow noninteractive outlines only.
- PCB envelope/placement estimated from pixels; not manufacturing CAD. Sixteen-output V2 never mixed with legacy twelve-output V1.

## Implementation
1. Fail exact manifest and geometry contracts before generation.
2. Generate revision-pinned records and original PCB/connector meshes; all 16 terminal plugs installed. Preserve authentic blue/green/black appearance.
3. Build without beauty render, reopen and test counts, pitch, transforms, open mouths, four-quadrant optical visibility, power-key orientation and full assembly seating.
4. Render four cheap side diagnostics; inspect before expensive views.
5. Export actual GLB, reimport and repeat physical/semantic tests.
6. Freeze geometry hashes, render saved master views/closeups, inspect and record matching provenance. README and accuracy record disclose remaining uncertainty.

## Acceptance
32 output terminal contacts + 8 power contacts + 4 optical receptacles. 16 signal anchors, 2 power, 2 optical, 2 unresolved service anchors. No copied pixels/serial numbers, no unknown service contacts, no mating/electrical certification. Target <=60000 evaluated/exported triangles. Blender4.3.2 CPU renders and editable master.

## Verified review refinements
- Hidden round-heatsink core cap recessed by 1 mm to avoid coplanar shading while keeping PCB attachment.
- Every printed label is tagged and tested, including labels under port anchors: 86 labels and 10,388 exact glyph samples on both the saved native master and actual imported GLB. Text-only clearance fixes leave connector frames and contacts unchanged.
- Final preview receipt requires all 11 canonical views and verifies each renderer-provided master/file hash against the current PNG before adding decoded RGBA hashes. Diagnostics and partial runs cannot satisfy the final receipt.
