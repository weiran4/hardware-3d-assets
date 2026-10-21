# RTDS phase 2 — source-grounded visual assets

Approved task: build an editable, version-pinned hardware library before dynamic demos; final user review rather than intermediate plan questions. Critical visible ports, numbering, contact arrangements and key orientation are required. Decorative electronics can be simplified.

## First increment
- NovaCor 2.0 exterior, 2023 brochure appearance, reconciled against manual NovaCor 2.0 chapter revision 20250916. Envelope 483 × 522 × 178 mm. Never mix NovaCor 1.0 or Light.
- GTDI V2 PCB 2.01 only if reference evidence resolves critical interfaces; otherwise an explicit source catalog gate, not an invented card.
- Versioned catalog covers requested families, including older variants as distinct records.
- Native Blender 4.3.2 editable master, GLB, front/rear/side/top/iso/neutral/wireframe renders, native and round-trip QA, stable port IDs/anchors and field-level accuracy records.
- Original geometry and explanatory prose only. Manufacturer media and private manual stay outside public tree. No bitmap textures copied from sources.

## Accuracy levels
Documented feature/count/type/key direction is distinct from photo-estimated dimensions and manufacturer-certified mating geometry. Unknown socket standard remains `unknown`; a visually observed round single-contact socket may be rendered without inventing BNC lugs or a compatible plug. Unknown electrical compatibility is never accepted by an interactive validator. GBH is not LC. UDP copper SFP is not a fibre GT port.

## Presentation
Black powder-coated enclosure, silver metal, light identity strip, dark idle screen and small white labels matching source layout. Front −Y, right +X, Z up, metres. Port local +Z is outward and local +Y is keyed-up. Rear top and bottom fibre rows have opposite key orientation; image left maps to global +X on rear view. A separate metadata field gives documentation confidence and estimated placement.

## Acceptance
Count geometry as well as metadata. Test exact analog 12+3, 24 GT including 21–24 Aurora, 6 IRC, 1 GTSYNC, 1 copper UDP, 1 WIF, 1 GBH, 1 front-light-power and 1 AC inlet. Test odd top/even bottom rear ordering and row flips. Test complete IDs, contacts and frames survive actual GLB export. Inspect saved-file renders independently against source pixels. Do not call unknown mating dimensions exact.
