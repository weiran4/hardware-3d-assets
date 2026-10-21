# GTDI V2 — PCB 2.01 · visual candidate 0.1.0

Original, editable RTDS hardware illustration. **This is not a manufacturing or electrically validated connection model.** Candidate status: `visual_candidate_with_service_detail_gaps`.

- Master: [`source/asset.blend`](source/asset.blend); portable mesh: [`exports/asset.glb`](exports/asset.glb).
- Generator: [`source/build.py`](source/build.py), [`parameters.json`](parameters.json).
- Inspectable interface records: [`metadata/ports.json`](metadata/ports.json). IDs/anchors are separate from connection eligibility; all mating validation is disabled.
- Renders: [`previews/`](previews/); prefer upright `top.png`, `iso.png` and the three interface close-ups.
- Accuracy scorecard: [`qa/component-accuracy.json`](qa/component-accuracy.json); final-master/PNG hashes and render settings: [`qa/preview-provenance.json`](qa/preview-provenance.json).
- Measured/native/round-trip tests: [`qa/`](qa/).

## Version and represented state

Pinned to **GTDI V2, PCB 2.01**, not the separate legacy GTDI V1 hardware. The component-side arrangement follows manual PDF page 405, Figure 9.1. The model deliberately shows **16 installed removable terminal plugs**, supported by the populated close-up on PDF page 414, Figure 9.9. It does not claim the distant public-board photograph shows that identical population state.

## Interfaces represented

| Group | Modelled observation | Confidence / limit |
|---|---|---|
| Eight digital-input banks | Two 5-position plugs each = **80 terminal positions**, not 64. 64 signals + eight WET + eight GND positions. | Contact count, bank grouping and numbering source-grounded. |
| Terminal orientation | Upright component side: inward/upper odd tier `1,3,5,7,V+(WET)`; outer/lower even tier `2,4,6,8,GND`; add eight per bank. | Wire-end view reverses left/right. No electrical compatibility is inferred. |
| Terminal plug | Phoenix Contact **1803604**, five positions, one row, **3.81 mm pitch**, **19.84 × 11.1 × 16.1 mm W/H/L**. Square wire entries face outward; screw wells face component side. | Manufacturer-documented plug dimensions; original visual shell, not certified mating CAD. Hidden rear female mating fingers are not wire-entry holes. PCB header/tier offsets are estimated. |
| GT1 / GT2 | Two separate duplex LC optical ports, GT1 above GT2 on left edge; two visible receptacles each. | Role/topology grounded. Reused visual LC profile is not a manufacturer CAD model. GT1 upstream, GT2 downstream. |
| Power | Two white keyed 1×4 headers; four contacts each. Observed two corner chamfers on one long side. | Upper header top-to-bottom `+24V,GND,GND,NC`. Lower daisy-chain function is documented, but its separate pin order is deliberately **unknown**. Exact connector/pitch unknown. |
| DIP / ID | Eight individual DIP rockers and seven-segment display. | Eight-rocker count is observed; centered rocker positions are unverified visual placeholders, **not a factory default or usable address setting**. No powered ID indication is selected. |
| Auxiliary/service | Four hollow observational outlines: top pull-up header, service/JTAG area, lower auxiliary header, small USB-like receptacle. | **Contacts, exact family and keying not resolved, not modelled and not interactive.** These are explicit detail gaps, not accurate complete connectors. |

## Dimensions and appearance

PCB **100 × 190 × 1.6 mm** and carrier, connector placement, header spacing and heights are **photo-estimated visual dimensions**. Only the quoted Phoenix plug pitch/envelope is manufacturer documented. This is not a drill/clearance/fit template. Board blue, green terminal/carrier, white power housings, metal optical cages and black round heatsink follow the photographs. Small ICs, resistors, capacitors, mounting supports and traces are simplified decorative geometry; their counts and footprints are not an electronic BOM. Original text geometry is used, not manufacturer bitmap textures.

`service_jtag` and `service_usb` are internal location handles, not verified connector or protocol identities.

Coordinates: metres; PCB lies in XY, component side +Z, upright board top +Y. Optical ports face −X; terminal wire entries face +X; power faces +Z. glTF export uses the established Y-up conversion; inspect exported anchor transforms rather than assuming native axes.

## Remaining evidence needed

Please provide powered-off, well-lit **perpendicular close-ups of the three black headers** (top pull-up, central service/JTAG, lower auxiliary), showing every pin/row and key notch; one straight-on view **into the small USB-like connector mouth**; and the **printed board revision** in the same photo set. Those specific photos would close the service-detail gate. A connector identifier/drawing is needed for physical-fit certification of power/header/SFP details. The present asset remains useful for identified core interface learning, not complete connector certification.

## Reproduce and test

From repository root, using existing Blender 4.3.2 (Cycles CPU):

```sh
python3 rtds/gtdi-v2-2.01/source/manifest.py
python3 -m unittest discover -s rtds/tests -p test_gtdi_manifest.py -v
blender -b --python rtds/tools/build_asset.py -- --asset gtdi-v2-2.01 --views ''
blender -b rtds/gtdi-v2-2.01/source/asset.blend --python rtds/gtdi-v2-2.01/source/test_geometry.py
blender -b --python tools/qa_asset.py -- --asset-dir rtds/gtdi-v2-2.01
blender -b --python tools/qa_roundtrip.py -- --asset-dir rtds/gtdi-v2-2.01
blender -b --python rtds/gtdi-v2-2.01/source/test_roundtrip_geometry.py
blender -b --python rtds/gtdi-v2-2.01/source/render_views.py
```

Five manifest tests and twelve native/interface tests (repeated after actual GLB import) pass for r05. Eight standard views plus terminal/optical/power close-ups are produced from the saved master. Iso/top use 1400² at 48 Cycles CPU samples; diagnostic/close-up views use 1024² at 24 samples.

Tests inspect actual reopened meshes, transformed label normals, keyed shrouds, ray-visible LC/terminal contacts, PCB seating and the connected heatsink core, not only a matching metadata sidecar. Native and glTF round-trip QA checks dimensions, IDs, hierarchy, materials and anchors. Tests cannot prove unknown electrical compatibility.

## Sources and rights

- RTDS hardware manual, local privately supplied 605-page compilation, SHA256 `c621dc48408d091eaa1a2fa4a1a253c83db49a2e7f85aa67a2754a56cf4cfaaf`; GTDI V2 chapter revision **2024-12-19**, PDF pages **404–425**, especially **405, 406, 408, 410–411, 414**. The folder name “HARDWARE_2009” is not the hardware revision. No manual page, embedded photo or lengthy verbatim excerpt is redistributed.
- [Phoenix Contact MC 1,5/5-ST-3,81, item 1803604](https://www.phoenixcontact.com/en-us/products/pcb-plug-mc-15-5-st-381-1803604), accessed 2026-10-21. Authoritative plug dimensions and product views used for reference only, no image copied into this asset.
- [RTDS GTIO Cards knowledge-base overview](https://knowledge.rtds.com/hc/en-us/articles/360034281234-GTIO-Cards) and its official GTDI V2 product photograph, consulted as visual cross-check. Public-source media remains manufacturer-owned and is not included.

Original geometry, labels and prose follow the repository license. RTDS and Phoenix Contact product names identify the referenced hardware; no affiliation or endorsement is implied.
