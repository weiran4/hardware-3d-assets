# NovaCor 2.0 — 2023 exterior / asset 0.1.0

Original editable visual reconstruction for identification and future explanatory demonstrations. **Not manufacturing CAD, a hardware simulator, a wiring guide, or proof that a plug will mate.** No RTDS endorsement is implied.

## Open
- `source/asset.blend`: editable master; separate shell, labels, connectors, contact recesses and anchor frames.
- `exports/asset.glb`: portable static model with semantic extras.
- `metadata/ports.json`: authoritative 51-interface inventory and uncertainty, independent of render appearance.
- `previews/`: full multiview set and interface close-ups.
- `qa/`: saved-file measurements, actual GLB round trip, component accuracy summary.

## Pinning and evidence
Appearance follows the [2023 NovaCor 2.0 brochure](https://knowledge.rtds.com/hc/en-us/article_attachments/16079537928727), p.2, not NovaCor Light or NovaCor 1.0. The user-provided *RTDS Hardware Manual*, NovaCor 2.0 chapter revision 20250916, PDF pp.70–73/81–82, resolves role labels, alternating optical key direction and the supported optical transceiver model. The private manual and manufacturer photos are not included or used as textures.

### Dimensions: distinct extents, not a resolved tolerance
The model uses the brochure's **483 × 522 × 178 mm overall envelope**. In the same user manual, the broader NovaCor chapter's PDF p.42 diagrams show a **450 mm front width, 175 mm height and 522 mm depth**, while PDF p.43 shows a **428 mm rear width**. Those measurements differ in shown extent and may also differ in generation. This asset does **not** claim they are interchangeable, scale one into another, or resolve the discrepancy. The shell, rails, fascia, hole pitch and connector positions inside the overall envelope are photo-estimated. The shell itself is 450 × 510 × 178 mm in this reconstruction; that is a modeling choice, not a certified hardware dimension.

## Critical interfaces
- Front: 12 single-contact round signal sockets, four columns of three, numbered down each column; three ground sockets. **Not BNC.** The standard, diameter, insertion depth and manufacturer are unknown; no mating plug is supplied.
- Rear: GT1–20 for general I/O; GT21–24 reserved for licensed Aurora; IRC1–6; GTSYNC; copper UDP marked ETH; separate WIF Ethernet; distinct GBH; front-light power and selector; three-blade AC inlet.
- All 31 optical SFP mouths are physically divided into two ferrule receptacles. Odd-numbered upper-row fibre sockets have key slots up; even-numbered lower-row sockets have key slots down. GTSYNC is upper row. The named manual-supported fibre module is Finisar FTLF8519P3BNL; mouth/key topology is represented, not its full certified mechanical drawing.
- UDP is a copper SFP, not an additional fibre socket. Both copper Ethernet mouths have eight individual contacts, with their latch directions represented independently.
- GBH is a separate duplex visual family; its exact part and cable variant are not certified. Do not infer LC compatibility from the nearby SFP ports.

## Reuse safely
Metres; Z up; front −Y. Stable IDs are `novacor-2.0-2023.ao1`…`ao12`, `gnd1`…`gnd3`, `gt1`…`gt24`, `irc1`…`irc6`, `gtsync`, `udp`, `wif`, `gbh`, `front_led_power`, `ac_power`. Anchor local +Z points outward; local +Y is the declared keyed-up direction. Blender quaternions are w,x,y,z. GLB has the standard Y-up conversion once.

Every interface has `validated_mating: false`. Role/shape evidence is not electrical/optical compatibility validation. All future snapping or connection teaching must read the explicit confidence fields and must not turn `unknown` into “correct connection.” Front analogue sockets are monitoring outputs, not the external GTAO card's channel count.

Simplifications: decorative screws, fans, side rails, vents and internal electronics are visual approximations; serial numbers, approval marks and copied logo artwork are omitted. The display is an unpowered-looking static surface, not a fabricated RSCAD status screen.
