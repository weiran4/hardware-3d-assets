# GTFPI V2 — PCB 2.01, capped GT ports

Original low-poly visual asset for recognition, explanations and future separately reviewed hardware animations. **This population is not ready for connector insertion animation or real wiring validation.**

## What is modelled
- Upper HV shrouded male ribbon header: **2 × 25 = 50 pins**.
- Lower LV header: **2 × 17 = 34 pins**. Both central key gaps face the outside/right edge of the upright board. Only the observed LV footer-end `1` (outer) and `2` (inner) marks are shown; no HV pin numbering is inferred.
- Two GT optical assemblies with the **photographed black dust caps retained**. No uncovered optical sleeve, ferrule bore or hidden compatible connector is invented.
- Two white four-contact power headers, their observed outward-wall chamfers, and one green two-contact header with the visible twin-lobe inner mouth.
- Eight DIP switches, eight status LEDs, one seven-segment card-ID display and reset control. ICs/passives are illustrative, not a bill of materials.

GTFPI bridges one LV digital I/O panel and one HV panel to the GT data link. The separate panel's high-voltage rating is not a voltage rating for these ribbon pins. GT1 is upstream; GT2 is downstream. The documented supply is +24 V and maximum board consumption is 5 W.

## Bounded gaps
Power functions are +24 V, GND, GND and NC, but the diagrams' viewing directions have not been independently aligned. **No position-specific power pinout is supplied.** Green-header polarity placement is also unknown. Service header and service receptacle are non-interactive silhouettes without guessed contact counts or subtype. All placement and detailed dimensions are estimates; carrier/underside detail is simplified. No mating standard, tolerances, mechanical fit, protocol operation or safety is certified.

Needed to support a later insertion exercise: perpendicular uncapped GT mouth photographs; an unambiguously oriented power pin diagram; detailed service connector views where those interfaces are included. The present visual variant is not blocked by these intentionally excluded functions.

## Files and reconstruction
- `source/asset.blend`: editable master, metre units, root at carrier underside.
- `exports/asset.glb`: actual exported static geometry and semantic extras.
- `metadata/ports.json`, `parts.json`, `accuracy.json`: authoritative interface records, scope and confidence.
- `previews/`: original renders. `qa/preview-provenance.json` binds every final view to the exact master and GLB hashes.
- `source/build.py`, `geometry.py`, `manifest.py`: reproducible original geometry/metadata.

From repository root (Blender 4.3.2, Python 3.13.5 verified):

```sh
python rtds/gtfpi-v2-2.01-capped/source/manifest.py
blender -b --python-exit-code 1 --python rtds/tools/build_asset.py -- --asset gtfpi-v2-2.01-capped --views ''
blender -b rtds/gtfpi-v2-2.01-capped/source/asset.blend --python-exit-code 1 --python rtds/gtfpi-v2-2.01-capped/source/test_geometry.py
blender -b --python-exit-code 1 --python rtds/gtfpi-v2-2.01-capped/source/test_roundtrip_geometry.py
blender -b --python-exit-code 1 --python rtds/gtfpi-v2-2.01-capped/source/render_views.py
python rtds/gtfpi-v2-2.01-capped/source/write_preview_provenance.py
blender -b --python-exit-code 1 --python rtds/gtfpi-v2-2.01-capped/source/test_rebuild.py
```

Board component face is +Z, upright board top +Y, right edge +X. Port local +Z faces outward; ribbon local +Y points toward its physical key gap (+X board). The word “anchor” describes a placement frame, not a compatible plug.

The frozen delivery is inventoried in `qa/delivery-manifest.json`. Native and actual-GLB tests cover94 exposed contacts, all23 label meshes (5,740 glyph-surface visibility samples), key access and component support. Independent geometry audit passed299 checks on each format; all11 final rendered views have independently checked file and decoded-RGBA hashes. `test_rebuild.py` compares a fresh in-memory build with complete geometry/semantic/material digests without replacing the saved master. Rebuilding/exporting intentionally invalidates frozen receipts until regenerated.

## Evidence and rights
[Official GTFPI article](https://knowledge.rtds.com/hc/en-us/articles/360034817173-GTFPI-Card), [official PCB photograph](https://knowledge.rtds.com/hc/article_attachments/360100284873), and *RTDS Hardware Manual*, GTFPI V2 chapter 10, revision 20240924, printed pages 1–6 and 20–22. Reference media are inspection inputs only and are not distributed. No source bitmap, serial/barcode, approval art or copied manufacturer logo is included. All geometry and explanatory prose here are original.
