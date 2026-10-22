# GTSOC V2 — GTSOC-2A / copper16 visual variant

Original editable, low-poly reference asset. Front population: **16 copper RJ45 SFP modules**, in two groups of eight; odd ports above even ports. The upper latch/key is up and the lower one down. `GTSOC-2A` comes from the rear model plate, not a chapter number. This is not an exact-fit CAD model or an electrical connection validator.

## What is modeled

- 16 front copper mouths with eight metal contacts each, three USB-B-shaped service ports with four contacts each, rear ETH with eight contacts, and a switched/fused three-blade AC inlet.
- Four rear blue **duplex** ports: upper 1/3, lower 2/4. Eight white annular faces and neutral filled centers reproduce the visible exterior. They are **not asserted to be exposed optical contacts or insertion bores**; cap-versus-sleeve state remains unknown.
- Original text, front grouping lines, power/reset controls, rear fan grille and a plain model plate. No serial numbers, QR codes, compliance marks, source textures or copied logo artwork.

The entire 483 × 300 × 88 mm display envelope is **estimated**, including nominal-looking rack width. Sides, bottom and depth are simplified. Hidden mounting collars and internal support geometry are estimated, not a fastening specification. For insertion fidelity, obtain a perpendicular rear-connector face photo with caps explicitly removed; for exact fit, obtain a dimensioned side/depth drawing. Do not manufacture, fit hardware or infer mating depths from this asset. All port records have `validated_mating: false` and `insertion_animation_ready: false`.

## Application boundaries

This copper population is suitable as a visual reference for the SV/Ethernet configuration; it does not establish that the same copper modules support Aurora or other applications. Actual use depends on firmware, transceiver population, licensing and the relevant configuration. GTSOC V2 is an auxiliary simulation platform, not a generic switch. The three service connectors are PS monitoring, PL hardware-test monitoring and JTAG programming; rear ETH is a monitoring workstation connection, not an extra NovaCor optical link.

For black-box illustrations, identify the four **rear** links. The current brochure and manual connection figure support rear1–4; the conflicting older “front1–4” sentence is not used as a connection rule. No functional simulation, insertion animation or protocol validation is provided.

## Files and verification

- `source/asset.blend`: editable master; `source/build.py`: original rebuild source.
- `exports/asset.glb`: actual GLB with stable IDs/anchors and complete port-record extras.
- `metadata/ports.json`, `parts.json`, `accuracy.json`: semantics, inventory and confidence boundaries.
- `previews/`: eleven orthographic/closeup views; `qa/preview-provenance.json`: per-view source/output hashes.
- `qa/`: saved-native and actual-GLB geometry/label/roundtrip results. Complete glyph samples and real key-slot/contact rays are checked, not only object names. Every contact base is seated in solid support; each module has direct panel/collar intersections. Six deliberate fault probes are caught in both representations. An in-memory rebuild matches geometry, material and semantic digests without replacing the master.

The saved candidate contains151 asserted metal contacts and36 labels. All3,888 glyph-surface visibility samples are checked in both native and actualGLB forms; independent geometry review passed669 checks on each. `qa/delivery-manifest.json` inventories the frozen folder; modifying or rebuilding files requires refreshed receipts.

Coordinates: meters, front −Y, right +X, up +Z. Port local +Z points outward; local +Y is keyed-up. Rear-photo left maps to global +X.

From the repository root, using the recorded Blender 4.3.2 build:

```sh
python rtds/gtsoc-v2-2a-copper16/source/manifest.py
python rtds/gtsoc-v2-2a-copper16/source/test_manifest.py
blender -b -t 3 --python rtds/tools/build_asset.py -- --asset gtsoc-v2-2a-copper16 --views ''
blender -b -t 3 rtds/gtsoc-v2-2a-copper16/source/asset.blend --python rtds/gtsoc-v2-2a-copper16/source/test_geometry.py
blender -b -t 3 --python rtds/gtsoc-v2-2a-copper16/source/test_roundtrip_geometry.py
blender -b -t 3 --python rtds/gtsoc-v2-2a-copper16/source/test_mutation_probes.py
blender -b -t 3 --python rtds/gtsoc-v2-2a-copper16/source/test_rebuild.py
blender -b -t 3 --python rtds/gtsoc-v2-2a-copper16/source/render_views.py
python rtds/gtsoc-v2-2a-copper16/source/finalize_receipts.py
```

## Evidence

- [Official GTSOC V2 article](https://knowledge.rtds.com/hc/en-us/articles/7817390306199-GTSOC-V2-Multi-Function-Auxiliary-Simulation-Hardware): unit capabilities and application-dependent SFP use.
- [Official copper-front photograph](https://knowledge.rtds.com/hc/article_attachments/19752419176215): selected front appearance, count, labeling and row key orientation. Reference only; not redistributed.
- [Official GTSOC V2 brochure](https://knowledge.rtds.com/hc/en-us/article_attachments/30065880593303), pp.1–2: rear black-box links and firmware-dependent applications.
- RTDS Hardware Manual, chapter 13A, GTSOC V2, revision 20240927, printed pp.1–3 and 8: service roles, rear exterior/model plate, port numbering, supply/fuse and copper-SFP SV context. The private manual and all extracted media are excluded.
