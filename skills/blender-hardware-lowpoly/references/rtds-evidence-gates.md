# Source-grounded interface reconstruction

Use this reference when exact ports matter more than decorative detail. These are reusable decisions learned from the RTDS phase-2 exercise, not certification of any hardware or a replacement for its manual.

## Required port record
Keep these fields independent:

| Field | Meaning |
|---|---|
| `hardware_version` / appearance revision | Which photographed/documented population is being depicted |
| interface count | Count of physical connectors, not signal channels |
| visible contact count/layout | Directly observed or documented topology |
| key orientation | Physical notch/latch direction, separate from a mathematical anchor frame |
| placement and mechanical dimensions | Measured/drawing-derived or explicitly photo-estimated |
| role and direction | Relative to the system, not the viewpoint |
| physical/electrical compatibility | Unknown unless separately verified; never inferred from appearance |
| source/page/revision | Traceable support without redistributing reference media |

A record that says “accurate” is insufficient. A round socket with no visible key may still have unverified internal/mating geometry. Its reference-frame up direction is not proof of a physical key.

## Construction and review recipe
1. Inspect source pixels, not just text extraction or an image filename. Pin hardware generation and installed module/plug population before counting.
2. Map source-view coordinates explicitly. With front −Y and Z up, screen-right on a **rear** orthographic image is global −X. Do not mirror labels/pinouts by intuition.
3. Build each critical connector as a local assembly: +Z outward, +Y keyed-up. Apply the assembly orientation, not a second ad-hoc per-mesh flip. Alternating rows may have opposite keys.
4. Make a visible keyed mouth: real shoulder/recess geometry, not an invisible dark marker on an equally dark flat well. Count actual contact meshes independently from metadata.
5. Test interface clearance in the saved asset. A correct anchor and contact count can coexist with an opaque enclosure strip blocking the mouth. For annular contacts, ray-cast **four annulus quadrants** from outside toward the rim; one sample can miss a partial obstruction. Inspect the rendered mouth too.
   Also inspect the whole assembly from low-cost side views before beauty renders: connector bodies must meet the PCB or have visible support; board silkscreen belongs on the board plane. Contact tests alone do not catch floating housings or disconnected fins.
6. Reimport the exact delivered GLB and compare full records, frames, material bindings and geometry. Verify physical-key orientation against the source again after export.
7. Write the remaining gaps plainly. Detailed observed topology can ship as a visual reference while manufacturer-fit tolerances, exact mating parts and electrical validation remain unknown.

## Specific regression evidence from this exercise
- A copper socket's declared keyed-up frame initially disagreed with the physical latch/contacts; the local-Y regression failed, then passed after correcting geometry.
- A local “slot” marker did not create a visible stepped mouth. A two-shoulder geometry test caught that missing feature.
- Correctly counted NovaCor GT17 contacts were partially hidden by the enclosure spine. Four-quadrant saved-scene ray casts detected the actual occluder and passed after the spine moved into the observed inter-group gap.
- A front-light power jack intruded into the rear edge; an actual clearance check detected the error.
- GTDI side views exposed floating terminal/power supports and board text above the PCB, despite passing contact counts and visibility rays. Explicit seating/core regressions failed first, then passed on the final native master and actual imported GLB after the existing supports were connected.

See `rtds/tests/test_blender_ethernet_key.py`, `test_blender_novacor.py`, and `test_blender_mouth_clearance.py`. These checks establish visual topology/clearance, not safe real-world connection or manufacturing fit.

## Reference traps
- NovaCor analogue front sockets are visually single-contact round sockets, not BNC. An unknown family must remain unknown.
- A GTDI V2 bank has eight signal channels but two five-position plugs: 80 terminals across eight banks, not 64 connector contacts. Wetting/ground positions are not extra signal channels.
- Similar optical shapes can carry GT I/O, IRC, Aurora, sync or GBH roles. Similarity does not establish interchangeability.
- Different source extents (overall envelope, bare fascia, rear panel, rails) must not be silently averaged or rescaled into one “exact” dimension.

Manufacturer photos/manuals are private inspection inputs unless separately licensed for redistribution. Publish original geometry and concise original fact citations, not PDF mirrors, photo textures, copied serial labels or approval marks.
