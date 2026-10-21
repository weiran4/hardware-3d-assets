# GTAI V2 — PCB 2.31

Original editable **visual candidate with service-detail gaps**, pinned to manual chapter revision 20240924 and Figure 7.1 PCB **2.31**. This is not the PCB 2.21 shown in a different public photograph.

## Included
- `source/asset.blend`: editable Blender 4.3.2 master and original procedural `build.py`.
- `exports/asset.glb`: actual exported/reimported portable model.
- `metadata/ports.json`: 18 stable attachment frames: twelve 3-position analogue-input plugs, two 4-contact power headers, two duplex optical ports and two explicitly unresolved service outlines.
- `metadata/accuracy.json` and `references/manifest.json`: field-level provenance, limits and required follow-up evidence.
- `previews/`: eight standard views and three interface close-ups; matching master hashes recorded in `qa/preview-provenance.json`.

Each input channel is upright **+, −, GND**, in that order from board top to bottom. Phoenix Contact 1803581 plug count, 3.81 mm pitch and 12.22×11.1×16.1 mm envelope are documented. Board envelope, PCB header details and absolute placements are visual estimates. Upper power pin assignment is source-grounded; lower power pin order remains unknown. Service contact counts and exact optical-module internal mating geometry remain unvalidated. Do not use the model as manufacturing CAD or a safe-wiring guide.

## Rebuild / verify
Run from the repository root using the recorded Blender runtime:

```sh
python rtds/gtai-v2-2.31/source/manifest.py
python rtds/gtai-v2-2.31/source/test_manifest.py
blender -b --python-exit-code 1 --python rtds/tools/build_asset.py -- --asset gtai-v2-2.31 --views ''
blender -b --python-exit-code 1 rtds/gtai-v2-2.31/source/asset.blend --python rtds/gtai-v2-2.31/source/test_geometry.py > rtds/gtai-v2-2.31/qa/geometry-r08.log 2>&1
blender -b --python-exit-code 1 --python tools/qa_asset.py -- --asset-dir rtds/gtai-v2-2.31
blender -b --python-exit-code 1 --python tools/qa_roundtrip.py -- --asset-dir rtds/gtai-v2-2.31
blender -b --python-exit-code 1 --python rtds/gtai-v2-2.31/source/test_roundtrip_geometry.py > rtds/gtai-v2-2.31/qa/roundtrip-geometry-r08.log 2>&1
blender -b --python-exit-code 1 --python rtds/gtai-v2-2.31/source/render_views.py
python rtds/gtai-v2-2.31/source/write_preview_provenance.py
```

Physical tests inspect actual contacts, four-quadrant optical visibility, terminal and power mouth rays, keyed shoulders, attachment frames, component seating, board bounds, label orientation and all 69 printed annotations via exact glyph-triangle occlusion rays. Export tests compare full records, IDs, hierarchy, dimensions, materials and frames—not merely file existence. Private manuals, screenshots and manufacturer photos are inspection inputs only and are not distributed.
