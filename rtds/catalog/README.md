# RTDS source catalog · 0.1.0

**18 separately identified variants; source inventory, not a connector-accuracy certificate.**

This catalog supports original educational 3D assets. The catalog retains 18 stable identities and seven **original visual candidates**: NovaCor 2.0, GTDI/GTDO/GTAI/GTAO V2, GTFPI PCB 2.01 with capped GT ports, and GTSOC V2 Model GTSOC-2A with 16 copper front SFP modules; this does not close their remaining mechanical/contact-detail gates. It keeps channel count, physical connector count, contact count, layout, keying, dimensions and compatibility separate. A familiar connector silhouette is never enough to enable a validated connection.

## Files

- `manifest.json` — source registry, version identity, page-level facts, uncertainties and release gates.
- `schema.json` — JSON Schema 2020-12; all six confidence dimensions are mandatory.
- `test_catalog.py` — offline integrity, coverage, conservative-gate and private-media checks.

The source-only gate is deliberately false for every record. An asset release needs its own geometry, saved-file, rendering, GLB and independent visual checks. Those checks may resolve a recorded gap without pretending every other gap has disappeared. Updating a confidence dimension requires adding the supporting source and locator.

## Version inventory

| Family | Separate records | Important separation |
|---|---|---|
| NovaCor | 2.0, Light, 1.0 | Different rear interfaces; no cross-generation geometry inheritance |
| GTDI | V2 (photo 2.01), V1 (chapter applies to 1.10+; photo 1.11) | Preserve V2 terminal and power details rather than projecting them backward |
| GTDO | V2, V1 | V2 has eight banks of eight; V1 has two banks of 32 |
| GTAI | V2, V1 placeholder | No standalone V1 chapter in this compilation |
| GTAO | V2 (photo 2.20), legacy twelve-channel | Sixteen outputs versus twelve is a hardware distinction |
| GTSOC | V2, V1 | V2 front/rear architecture must not be copied to V1 |
| GTNET | v3, x2, original legacy | Card generation and pre-/post-November-2024 enclosure are independent |
| GTFPI | V2 (photo 2.01), V1 placeholder | Card, low-voltage panel and high-voltage panel are different assets |

A placeholder is an unresolved requested identity, not evidence that a particular historical configuration has been verified.

## First delivered visual candidates

1. **NovaCor 2.0:** the 2023 brochure establishes a 483 × 522 × 178 mm exterior and useful front/rear views. The 2025-09-16 manual chapter resolves rear role groups, numbering and opposite top/bottom fibre-latch orientation. It does **not** identify the exact front analogue socket family/diameter. Those round sockets must not be replaced with a generic BNC asset.
2. **GTDI V2 / PCB 2.01:** the matching manual supplies the terminal grouping, label order, Phoenix Contact terminal-block number and keyed four-contact power diagram. The [official Phoenix product data](https://www.phoenixcontact.com/en-us/products/pcb-plug-mc-15-5-st-381-1803604) now verifies five positions, one row, 3.81 mm pitch and a 19.84 × 11.1 × 16.1 mm W/H/L plug envelope. The matching PCB header is still unknown; board dimensions and mating fit remain unverified.

Core interface count, numbering, visible contact topology and key directions have passed independent source/native/actual-GLB review. Editable masters, GLBs and detailed acceptance records are in [`../novacor-2.0-2023/`](../novacor-2.0-2023/) and [`../gtdi-v2-2.01/`](../gtdi-v2-2.01/).

For GTDI, PDF p.414 is a **connector-end view**, not a board-coordinate top/bottom rule. In the upright component-side board frame, odd signals run downward on the inner tier and even signals downward on the outer tier. Both power headers show four contacts; only the upper header's `+24V,GND,GND,NC` order is verified. The lower pin order is unknown. Four service interfaces remain contact-detail silhouettes; eight DIP rocker states are illustrative, not a verified default or usable address setting.

Refer to the manifest for the exact official links and manual page locators behind these statements.

## Contradictions and unknowns retained

- **NovaCor Light dimensions:** the brochure gives 483 × 522 × 178 mm. Manual PDF p.107 prints W × L × H as 20 × 19 × 7 inches (50.8 × 48.3 × 17.8 cm). This catalog preserves the disagreement rather than silently swapping axes or choosing a depth.
- **GTSOC V2 role wording:** the manual rear-link figure and current official brochure agree on rear ports 1–4 for blackbox use. The conflicting front-port sentence in chapter 13A printed p.4 remains recorded but is not used as a current mapping. No automatic wiring or compatibility rule is derived.
- **GTSOC V2 front population:** the public reference photo has copper RJ45 SFP modules. Sixteen SFP positions do not mean sixteen permanently fixed LC receptacles.
- **GTNETx2:** four visible metal assemblies are not four Ethernet ports; the simulator-side and LAN-side roles are distinct.
- **Legacy records:** full original GTNET, GTAI V1 and GTFPI V1 chapters were not found in the inspected hardware manual. V2 geometry is not a substitute.

## Provenance and publishing boundary

Checked **2026-10-21** against the privately supplied *RTDS Hardware Manual*. Public citations retain the relevant chapter, page and printed revision; private file identity and file metadata remain outside this catalog.

Only original short fact paraphrases, source identities and links are included here. No manufacturer PDF, photograph, bitmap texture, extracted page or nonpublic manual text chunk is distributed. Public accessibility is not a redistribution licence. Manufacturer names identify references and do not imply endorsement.

Coordinates, contact geometry, mating travel and tolerances must remain marked approximate where not sourced. Pin-role facts do not establish safe operating conditions. Every record leaves electrical/optical compatibility **unknown**: there is no permission to show “correct connection,” energize equipment, or infer interoperability from shape.

## Verify

From the project root:

```sh
python3 -m unittest discover -s rtds/catalog -p 'test_catalog*.py' -v
```

The schema test uses the already-available `jsonschema` package. No installation or network call is required in the verified environment. The checks include structural rejection of private file-identity fields; regression tests use no real private fingerprints.


## Auxiliary visual candidates

The existing `gtfpi-v2` and `gtsoc-v2` placeholders are upgraded in place; no duplicate versions or aliases are introduced. Exact original masters, exports and source-local verification records reside in `../gtfpi-v2-2.01-capped/` and `../gtsoc-v2-2a-copper16/`.

- GTFPI has 94 exposed electrical pins: 50 HV ribbon, 34 LV ribbon, 8 board-power and 2 auxiliary. It bridges separate LV/HV panels, not high-voltage contacts on the PCB itself. The two capped GT assemblies each form one duplex link. Power spatial order, auxiliary polarity, complete ribbon pin assignments, service interiors and uncapped optical geometry remain unresolved.
- GTSOC has 151 electrical contacts: 16 × 8 copper front, 3 × 4 USB-B service, 8 rear ETH and 3 AC. Four rear duplex optical units have 8 observed white faces, not asserted electrical contacts; cap-versus-sleeve is unknown. Copper SV population, documented service purposes, rear MMC monitoring, and application firmware/module/licensing conditions remain separate.

These are visual candidates, not insertion-ready or electrically qualified connections. The accurate-connector release gate stays false, and every unresolved boundary remains explicit. Public functional summaries are in `../docs/auxiliary-functional-03-facts.json`; source media and private source-container identity are not included.
