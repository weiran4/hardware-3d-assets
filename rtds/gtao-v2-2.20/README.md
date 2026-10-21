# GTAO V2 — PCB 2.20 · visual candidate 0.1.0

Original editable hardware illustration, **not manufacturing CAD or an electrically validated connection model**. The asset depicts sixteen-output GTAO V2, never the older twelve-output GTAO.

- Editable master: [`source/asset.blend`](source/asset.blend); portable model: [`exports/asset.glb`](exports/asset.glb).
- Original generator: [`source/build.py`](source/build.py); settings: [`parameters.json`](parameters.json).
- Port IDs, frames, role and evidence: [`metadata/ports.json`](metadata/ports.json).
- Preferred review views: `previews/top.png`, `iso.png`, `terminal-closeup.png`, `optical-closeup.png`, `power-closeup.png`.
- Native, actual-GLB and physical mesh QA: [`qa/`](qa/); render provenance: [`qa/preview-provenance.json`](qa/preview-provenance.json).

## Exact represented version and interfaces

Source: private RTDS hardware compilation, chapter **6A revision 20240924**, Figure 6.2 on absolute PDF page **279**, PCB silkscreen **GTAO Version 2.20**. All sixteen removable output terminal plugs are populated, as supported by Figures 6.2 and 6.10.

| Group | Representation | Confidence and limits |
|---|---|---|
| Analogue output | Sixteen separate two-position plugs = **32 terminals**. Channel 1 at upright top, channel 16 at bottom; top contact positive, bottom return. | Counts, order and polarity orientation documented. Channels 13–16 are NovaCor-only; all physical connectors remain present. Not a wiring validator. |
| Plug | Phoenix Contact **1803578**, two positions in one row, **3.81 mm pitch**, **8.41 × 11.1 × 16.1 mm W/H/L**. Open outward wire entries, slotted screws above. | Plug pitch/envelope manufacturer-documented. Original approximate shell and hidden mating fingers, not manufacturer mating CAD. Installed PCB header and placement estimated. |
| Optical | GT1 upper and GT2 lower on left edge; each two visible optical receptacles. GT1 upstream, GT2 daisy-chain. | Documented roles and observed topology; fine module/key geometry remains visual, not certified. |
| Power | Two white 1×4 keyed shrouds, chamfered left corners. Upper top-to-bottom +24V, GND, GND, NC. | Four-contact shape and upper order from Figure 6.4. Lower daisy-chain role known but its separate pin order intentionally unvalidated. |
| Service | Upper black header outline and small USB-like outline. | Exact contact/key geometry not validated, intentionally absent, noninteractive. No connector/protocol compatibility inferred from appearance. |
| DIP and ID | Eight individual rockers; seven-segment unlit display. | Observed count. Centered rockers are not factory settings, an address or a usable configuration. |

## Appearance and dimensions

PCB **100 × 190 × 1.6 mm**, carrier envelope, component placement and heights are **photo-estimated**. Blue PCB, green carrier/terminals, white power housings, metal optical cages, circular heatsink and lower rectangular finned heatsink follow the source arrangement. Small ICs and passives are decorative, not a BOM. No copied barcode, serial number, approval mark or bitmap texture is included. Underside support is indicative; unobserved DIN-clip mechanics are not invented.

Metres; PCB in XY, component side +Z, board upright top +Y. Terminal mouths face +X, optical mouths −X, power mouths +Z. Port anchors are placement aids only. Every port has `validated_mating: false`; physical/electrical compatibility is unknown.

## QA and remaining gates

Five version/manifest tests, twenty native physical tests repeated on actual GLB import, and four deliberate in-memory mutation probes pass. Existing generic/frozen manifest regression tests also pass.

Tests inspect actual contacts, plug pitch, label normals, source-pinned frame directions, four optical annulus quadrants, terminal wire-entry rays, PCB seating and heatsink attachment. All 86 printed annotations, including labels parented to ports, receive 10,388 exact glyph samples per file to reject raised-object occlusion. The exact delivered GLB is reimported and retested. Cheap front/rear/left/right views are inspected before full previews. These checks establish visual topology and assembly consistency, not electrical safety or mechanical fit.

Missing: perpendicular close-ups of the black service header and small service mouth with PCB revision visible; specific power/SFP/header part drawings; a mechanical board datum. These gaps prevent complete connector and physical-fit claims, not use as an identified core-interface visual candidate.

## Reproduce

From repository root, existing Blender 4.3.2 / Cycles CPU:

```sh
python3 rtds/gtao-v2-2.20/source/manifest.py
python3 rtds/gtao-v2-2.20/source/test_manifest.py
blender --python-exit-code 1 -b --python rtds/tools/build_asset.py -- --asset gtao-v2-2.20 --views ''
blender --python-exit-code 1 -b rtds/gtao-v2-2.20/source/asset.blend --python rtds/gtao-v2-2.20/source/test_geometry.py
blender --python-exit-code 1 -b --python tools/qa_asset.py -- --asset-dir rtds/gtao-v2-2.20
blender --python-exit-code 1 -b --python tools/qa_roundtrip.py -- --asset-dir rtds/gtao-v2-2.20
blender --python-exit-code 1 -b --python rtds/gtao-v2-2.20/source/test_roundtrip_geometry.py
blender --python-exit-code 1 -b --python rtds/gtao-v2-2.20/source/test_mutation_probes.py
blender --python-exit-code 1 -b --python rtds/gtao-v2-2.20/source/diagnostic_views.py
blender --python-exit-code 1 -b --python rtds/gtao-v2-2.20/source/render_views.py
python3 rtds/gtao-v2-2.20/source/write_preview_provenance.py --revision r05
```

## Sources and rights

- Private supplied *RTDS Hardware Manual*. GTAO V2 chapter 6A rev20240924, PDF 276–307; key pages 276,278–282,289–290. Source media stays private and is not distributed.
- [Phoenix Contact MC 1,5/2-ST-3,81 / 1803578](https://www.phoenixcontact.com/en-us/products/pcb-plug-mc-15-2-st-381-1803578), checked 2026-10-21. Two-position topology, pitch, envelope and screw form.
- [RTDS GTIO overview](https://knowledge.rtds.com/hc/en-us/articles/360034281234-GTIO-Cards), source catalog cross-reference only. No manufacturer photo is redistributed.

Original meshes, text and prose only. Product names identify hardware, not endorsement.
