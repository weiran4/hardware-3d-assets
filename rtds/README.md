# RTDS hardware library · Phase 2

Source-grounded, editable visual assets for learning hardware layout. **The source catalog is not a claim that all catalogued hardware has been modelled.** Version-specific ports are evidence-gated; no model is a certified mating part or electrical compatibility validator.

## Seven version-pinned visual models
| Asset | Version boundary | Interface scope |
|---|---|---|
| [NovaCor 2.0](novacor-2.0-2023/) | 2023 brochure exterior, manual chapter 20250916 | 51 separate interfaces, 31 duplex optical SFP mouths, alternating row keying, 12+3 front single-contact sockets; exact socket standard unresolved |
| [GTDI V2](gtdi-v2-2.01/) | PCB Version 2.01, manual chapter 20241219 | Core-interface visual candidate: 16 five-position plugs, two optical ports, two keyed four-contact power headers; four service interfaces retain explicit contact-detail gaps |
| [GTDO V2](gtdo-v2-2.00/) | PCB Version 2.00, manual chapter 20240924 | 64 digital-output channels; 16 five-position plugs / 80 terminal positions (64 signals + 16 bank-supply positions); two optical and two four-contact power ports; four unresolved service outlines |
| [GTAI V2](gtai-v2-2.31/) | PCB Version 2.31, manual chapter 20240924; not website PCB 2.21 | 12 differential-input channels; 12 three-position plugs / 36 terminal positions; two optical and two four-contact power ports; two unresolved service outlines |
| [GTAO V2](gtao-v2-2.20/) | PCB Version 2.20, manual chapter 20240924; not the older 12-output card | 16 output channels; 16 two-position plugs / 32 terminal positions; two optical and two four-contact power ports; two unresolved service outlines |
| [GTFPI V2](gtfpi-v2-2.01-capped/) | PCB Version 2.01; both GT ports capped; chapter 20240924 | 94 exposed electrical pins: 50 HV + 34 LV + 8 board-power + 2 auxiliary; separate-panel bridge, not the HV contact panel; power spatial order, auxiliary polarity and covered optical interiors remain unknown |
| [GTSOC V2](gtsoc-v2-2a-copper16/) | Rear nameplate Model GTSOC-2A; 16 copper RJ45 SFP front population; chapter 20240927 | 151 electrical contacts: 128 front + 12 service + 8 rear ETH + 3 AC; four rear duplex units have eight white exterior features, not asserted contacts; cap-versus-sleeve remains unknown |

[Catalog](catalog/) records 18 version-specific hardware references, including NovaCor Light/1.0, separate GTDI/GTDO/GTAI/GTAO generations, GTSOC and GTNET variants, and GTFPI. The existing GTFPI V2 / GTSOC V2 identities are upgraded in place, not duplicated. Its confidence dimensions distinguish count, layout, keying, contacts, dimensions and electrical compatibility. GTSOC copper population is documented for SV; other applications depend on firmware, installed modules and licensing.

## What is and is not verified
Documented role/count/key orientation and observed visible contact topology can be useful even when exact mechanical tolerance is unavailable. Every asset exposes field-level evidence and uncertainty. Photo-estimated geometry is labelled as such. An unknown connector type is never silently substituted with a generic BNC, RJ45, LC or terminal block. No undocumented electrical connection is shown as correct.

All included geometry, labels and explanatory prose were created for this library. Private manuals and manufacturer images remain outside the repository; no manufacturer photo textures, PDFs or approval marks are distributed. Product names are identification only; this is not an official RTDS asset library.

## Rebuild
Installed reference runtime: Blender 4.3.2 / internal Python 3.13.5 / glTF exporter 4.3.47, Cycles CPU, no denoising. No installation is required.

```sh
python3 -m unittest discover -s rtds/tests -p 'test_*manifest.py' -v
python3 -m unittest discover -s rtds/catalog -p 'test_catalog*.py' -v
blender -b --python-exit-code 1 --python rtds/tools/build_asset.py -- --asset novacor-2.0-2023 --views iso,front,rear,left,right,top,neutral,wireframe
blender -b --python-exit-code 1 --python tools/qa_asset.py -- --asset-dir rtds/novacor-2.0-2023
blender -b --python-exit-code 1 --python tools/qa_roundtrip.py -- --asset-dir rtds/novacor-2.0-2023
blender -b rtds/novacor-2.0-2023/source/asset.blend --python-exit-code 1 --python rtds/tests/test_blender_novacor.py
blender -b --python-exit-code 1 --python rtds/tools/render_closeups.py -- rtds/novacor-2.0-2023
```

The runner overwrites this phase's own generated outputs; copy a candidate outside the publishable tree if retaining a previous iteration. It does not change the verified `generic/` assets or their tools. Presentation cameras/lights/ground are not in GLB. Port anchors are distinct from geometry and do not imply electrical compatibility. See per-asset README and QA before reuse.
