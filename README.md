# hardware-3d-assets

## Interactive review page

[Open the public wiring lab](https://weiran4.github.io/hardware-3d-assets/) · [Source and tests](web/)

Rotate the original generic models, inspect ports, and try a conceptual **OUT → CH1** pulse sequence. Desktop/mobile browser checks gate deployment, followed by anonymous checks of the live page. This is **not** an electrical simulator, compatibility certification, or real-device wiring guide.

## Generic hardware · Phase 1

Original, editable low-poly practice models for a future wiring tutorial. **Not product replicas, a circuit simulation, or real-device wiring instructions.** Dimensions are fictional concept parameters. All physical/electrical compatibility and limits remain unknown.

## Open / reuse

- `generic/<asset>/source/asset.blend` — editable master; native cable curve and separate moving parts.
- `generic/<asset>/exports/asset.glb` — static portable geometry, materials, hierarchy, semantic extras (`port_record` is JSON text; the sidecar is authoritative).
- `generic/<asset>/metadata/ports.json` — authoritative port semantics; never infer compatibility from connector shape.
- `generic/<asset>/previews/` — front, rear, left, right, top, iso, neutral (no outline), wireframe.
- `generic/<asset>/qa/` — actual saved-file measurements and clean GLB reimport comparison.
- `generic/<asset>/source/build.py`, `parameters.json`, `tools/` — complete regeneration sources.

Assets: `oscilloscope`, `trigger-controller`, `signal-cable`, `sample-scene`. The scene appends the three verified `.blend` masters and displays the loose cable **unplugged**.

## Rebuild in the verified environment

Blender **4.3.2**, its bundled Python **3.13.5**, glTF exporter **4.3.47**; CPU Cycles. No external Python packages needed for modeling or QA. The contact-sheet helper uses the already-present Pillow package.

```sh
python3 -m unittest discover -s tests -p test_contract.py -v
./tools/rebuild_all.sh my-new-run
```

The historical checkpoint directories referenced by QA are retained locally but intentionally excluded from this clean bundle. Their measured comparison results and exact final model/QA source snapshots are included. The command above produces a new complete checkpoint and eight-view set; no historical checkpoint is needed to regenerate the delivered models.

An existing checkpoint is never overwritten. Each candidate saves source/config snapshots; native and actual-GLB QA must pass before generated files are promoted. `--views iso` can be used for a first look, then `tools/render_views.py` renders only missing views from the saved `.blend`. Final source-sidecar changes are mirrored on rebuild and checked against actual anchor frames.

## Conventions / limits

Meters; Z up; front −Y; right +X; all object scales 1. Device root at the supporting-plane center. Port local +Z points outward; +Y is keyed-up; sidecar quaternions use **w,x,y,z**. Knobs have local-Z shafts and independent pointer children; buttons translate locally. Controls have been trial-moved and restored; no animation clips are supplied.

GLB export performs the exporter’s Y-up conversion once. Freestyle ink lines, cream studio floor/background, lighting and camera **are not exported**. Viewers must supply their own presentation; no outline shell inflates geometry. Simple Principled materials are used; no unsupported animated shader is claimed. A Blender round trip does not certify all third-party viewers. Native geometry/transform digest coordinates are quantized to 1 micrometer; the built-in roundtrip node-matrix comparison uses that same representation. The independent reviewer also compares raw floating-point anchor transforms, well inside the 1 mm acceptance tolerance.

## Verification coverage

Independent review: **PASS_WITH_STATED_LIMITATIONS**, no remaining blocking findings; see `qa/independent-review.json`. User acceptance remains pending.

All four masters were freshly rebuilt and re-exported in separate Blender processes. Geometry, full semantic metadata, materials and object-material bindings match the accepted baselines exactly under the documented canonical comparison. All four iso views were freshly rerendered; the scope also rerendered its other seven views and the controller its neutral/wireframe views before redundant rendering was curtailed. The remaining diagnostic PNGs are the previously inspected baseline renders, reused only after exact model-digest equality. Each asset’s `qa/preview-provenance.json` identifies this explicitly. This is not a claim of two complete eight-view rerenders.

Final illustrations use 1024² PNG, Standard color transform, 128 CPU samples. The cloud Blender build has no OpenImageDenoise, so denoising is disabled. See `qa/progress.md` for observed failures and justified adjustments; older candidates remain outside the delivery bundle.

## Repository organization and publication

This is the public source repository, published with the owner's authorization.

- `generic/`: original fictional, reusable hardware assets; four editable masters, four GLBs, and 32 diagnostic/illustration views.
- `rtds/`: reserved for separately verified RTDS-specific assets; currently a placeholder only.
- `deliverables/`: overview images and a SHA-256 manifest, without duplicate ZIP archives.
- `tools/`, `tests/`, `skills/`: procedural sources, tests, and the working Blender skill.
- `docs/`, `qa/`: historical design/plan and measured review evidence. Historical documents describe their original pre-publication scope, not the current repository status; see `docs/README.md`.

The reference artwork and personal/social screenshots are not included or embedded. No credentials, Library receipts, historical checkpoint binaries, caches, or render-temporary files are included. See `qa/publication-audit.json` for the explicit file allowlist and publication checks. The original frozen delivery ZIP was not modified.

Technical QA does not replace user aesthetic scoring or acceptance. RTDS models remain future work. Any interactive review page is a separate layer and does not certify real-device wiring.

## Rights and dependencies

No project license has been selected. Public visibility is not a blanket permission grant; no MIT or other license is implied. Original procedural geometry and project code are included. Blender and Pillow are external runtime dependencies, not vendored here. Labels use Blender's built-in font; no third-party font file is bundled.

`tools/package_delivery.py` is the historical packaging procedure and requires the original local checkpoints named in it. Use `tools/rebuild_all.sh` for a fresh project-relative rebuild; the historical package command is not the repository publication command.
