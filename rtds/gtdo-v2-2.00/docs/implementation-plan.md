# GTDO V2 PCB 2.00 — source-grounded continuation

## Brief and authority
The user accepted the first visual style and asked to continue, with final review only. This is a bounded extension of the existing asset pipeline, not a new system. Critical signal, optical and power geometry takes priority over decorative passives. No frozen model or common connector changes; no publication by this worker.

## Selected design
Model the exact PCB Version 2.00 shown in private manual Figure 8.1 (absolute PDF363), chapter8A revision20240924. The 400px public photo cannot resolve fine contacts and is not the geometry authority. Manual Figure8.7 resolves removable 5-position plugs, dual-height headers, connector mouth and screw arrangement. Source length197mm is documented; width110mm, carrier114x201mm, thickness and locations are photo estimates. DIN underside detail is simplified, not mechanically validated.

Alternative rejected: reuse GTDI with only label changes. GTDO has eight larger output driver regions, different service layout and labels, PCB2.00 and V+/V− bank supplies, not wetting/GND. Alternative rejected: model older GTDO V1 because it would mix generations.

## Acceptance / plan
1. Record source facts and tests for 16 five-position plugs, 80 actual terminals, two duplex optical interfaces, two keyed4-contact power headers, eight DIP switches; manifest labels follow upright source.
2. RED: native and manifest checks must fail before implementation. Reuse original connector primitives only after inspecting GTDO sources.
3. Build separate editable original geometry and records. Do not model uncertain service pins; hollow service silhouettes, noninteractive.
4. Save native/GLB. Test actual mesh counts, frames, pitch, full-board seating, contact visibility against other body meshes, real keyed shrouds, upright silkscreen.
5. Four low-cost side views before expensive presentation. Fix physical defects first. Actual GLB import repeats geometry and full semantic/material contract checks.
6. Freeze master/export hashes, render standard and close-up views from that master, record per-view provenance, independent source/render review, update catalog only after QA.

## Explicit limitations
Plug pitch/envelope comes from Phoenix1803604; installed PCB header/mating profile remains estimated. Manufacturer-fit dimensions, electrical compatibility and optical Tx/Rx polarity are unvalidated. Lower power pin order remains unknown. Original source geometry only; no private manual, screenshots, serial barcode, copied brand bitmap or third-party textures.
