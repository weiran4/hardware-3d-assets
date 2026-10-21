# GTDO V2 — PCB 2.00

Original editable **visual candidate**, pinned to the manual chapter 8A revision 20240924, Figure 8.1 (PDF 363). Not an engineering drawing, wiring guide, approved mating model or electrical validator.

## Included
- `source/asset.blend`: editable original geometry; `source/build.py` and `source/manifest.py`: repeatable construction.
- `exports/asset.glb`: real exported geometry and semantic anchors.
- `metadata/ports.json`: 24 anchors — 16 populated five-position signal plugs, two optical, two keyed four-contact power, four unresolved service outlines.
- `metadata/accuracy.json` and `references/manifest.json`: exact evidence boundaries.
- `previews/`: standard orthographic, neutral, wireframe and signal/optical/power closeups, from the saved master.
- `qa/`: physical native and actual-GLB regressions, port/material roundtrip and preview provenance.

## Interface facts
Eight banks each contain two removable five-position Phoenix 1803604 plugs. There are **80 terminal positions**, not 64 physical contacts: 64 digital signals plus eight V+ and eight V− bank-supply positions. Upright board ordering is signals 1/3/5/7/V+ on the inner upper tier and 2/4/6/8/V− on the outer lower tier, then add 8 for each bank. This is **not** GTDI wetting/GND semantics. GT1 is upstream; GT2 is downstream. The upper four-contact power header alone has verified order +24V/GND/GND/NC from board-top to board-bottom; lower order stays unknown.

The [Phoenix 1803604 product record](https://www.phoenixcontact.com/en-us/products/pcb-plug-mc-15-5-st-381-1803604) establishes five contacts, 3.81 mm pitch and a 19.84×11.1×16.1mm plug envelope. The fitted PCB header and hidden mating details remain estimated. Card length 197 mm is documented, but the exact measurement endpoints are not dimensioned. Width 110 mm, thickness 1.6 mm, carrier and placements are estimated.

## Deliberate limits
Four service interfaces have hollow silhouettes with **no invented contacts or pinouts**. Power connector manufacturer, optical module part/TxRx mapping, precise key profiles, fit tolerances and underside DIN latch remain unverified. DIP positions and ID display are illustrative/unlit, not operating settings. Small electronics are simplified. Manufacturer photos/private manual pages, extracted screenshots, serial barcodes and copied textures are not included.

## Rebuild and checks
Run from repository root using Blender 4.3.2. No GPU or external assets required.

```sh
python rtds/gtdo-v2-2.00/source/manifest.py
python rtds/gtdo-v2-2.00/source/test_manifest.py
blender -b --python-exit-code 1 --threads 4 --python rtds/tools/build_asset.py -- --asset gtdo-v2-2.00 --views ''
blender -b --python-exit-code 1 rtds/gtdo-v2-2.00/source/asset.blend --python rtds/gtdo-v2-2.00/source/test_geometry.py
blender -b --python-exit-code 1 --python rtds/gtdo-v2-2.00/source/test_roundtrip_geometry.py
blender -b --python-exit-code 1 --python tools/qa_asset.py -- --asset-dir rtds/gtdo-v2-2.00
blender -b --python-exit-code 1 --python tools/qa_roundtrip.py -- --asset-dir rtds/gtdo-v2-2.00
blender -b --python-exit-code 1 --threads 4 --python rtds/gtdo-v2-2.00/source/render_views.py
python rtds/gtdo-v2-2.00/source/write_preview_provenance.py --revision r05
```

Units metres; component side +Z, board top +Y; local port +Z outward and +Y keyed-up. Anchors enable visual placement only: `validated_mating=false` throughout.
