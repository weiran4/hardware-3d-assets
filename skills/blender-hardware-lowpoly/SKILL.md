---
name: blender-hardware-lowpoly
description: Use when preparing or reviewing reusable low-poly Blender assets of electronic boards, laboratory instruments, control hardware, connectors, or fiber cables, especially for photo-based models and future wiring illustrations.
---

# Blender Hardware Low-Poly

**Status: UNVALIDATED learning candidate.** This is a requested project-local draft, not an installed or production-proven skill. Written knowledge checks are not modeling proof. Complete the practical gates in [evaluation](references/evaluation.md) before claiming validation.

## Scope and runtime

Create recognizable, editable hardware assets whose geometry, presentation, attachment frames, and electrical meaning remain distinct. This skill does not certify mechanical/electrical/optical compatibility, simulate circuits, authorize device control, or authorize a website, installation, upload, or environment change.

Recorded project runtime, reported verified by the setup worker on 2026-10-21: **Blender 4.3.2; internal Python 3.13.5; headless Cycles CPU; no GPU**. This is an environment observation, not an assertion about the standard Blender distribution. Recheck the actual executable/build, Python and exporter before each implementation task. Do not silently switch machines.

## Working contract

Record target asset/use, reference provenance and confidence, known dimensions, required views/animations, camera distance, task-specific evaluated/exported triangle budget, material budget, output formats, and acceptance tolerances. Unknown dimensions or connectors stay unknown; a generic practice asset is not an exact product replica.

Read [workflow and style](references/workflow-and-style.md) for construction decisions; consult [sources and version notes](references/sources.md) for technical claims.

## Workflow

1. **Block out recognition.** Match enclosure/board proportions and major panels before details. Inventory visible ports, controls and labels; distinguish observed, documented, measured and inferred features. Do not invent hidden RTDS interfaces.
2. **Build a small module vocabulary.** Reuse mesh datablocks or collection assemblies for sockets, terminals, knobs, LEDs, screws and vents. Keep movable parts separate. Preserve the editable master rather than flattening it for convenience.
3. **Control hard-surface shading.** Apply intended scale before establishing bevels/animation; use selective narrow bevels, explicit sharp/smooth boundaries and optional weighted normals. Check flat planes under neutral lighting. More segments or a modifier are not substitutes for inspection.
4. **Define coordinate frames.** Use a documented unit/axis/root convention and real hinge/shaft pivots. Name port anchors independently of visible meshes; record stable ID, local frame, insertion direction and evidence. A snapping target establishes placement only, not compatibility.
5. **Separate illustration from asset.** Use cream surroundings, dark ink-like contours, muted accents and a true orthographic render camera for the requested presentation. Keep outlines and showcase scenery optional. Read the reference before choosing an outline implementation.
6. **Test portability early.** Save the editable `.blend`; export a small representative `.glb`; reimport into a clean scene and inspect scale, hierarchy, anchors, shading and animation. Only then expand the library.

## Required evidence before delivery

- Reopen the saved `.blend`; verify dependencies and repeatable headless CPU rendering.
- Inspect front/rear/side/top and three-quarter views, wireframe/normals and moving-part states. Record neutral QA **and** illustrative presentation evidence.
- Count evaluated/exported geometry including curves, bevels and any outline shells; distinguish unique meshes from placed instances. No universal low-poly limit.
- Reimport the actual delivered GLB; compare dimensions, orientation, port frames, materials and intended animation. Report consumer-specific differences, warnings and untested behavior.
- Provide asset/version/export settings, counts, uncertainties and compatibility evidence. Do not equate file creation, tool success or a pretty render with a passed asset review.

## Common traps

| Trap | Correct decision |
|---|---|
| Follow old Auto Smooth or new slotted-action tutorial unchanged | Match installed 4.3 APIs; 4.1 changed smoothing and 4.4 introduced action slots |
| Keyframe emission or curve growth and assume GLB preserves it | Verify supported channels; keep unsupported effects as explicit Blender-only or future runtime work |
| Let outlines hide bad topology or blocked sockets | Review the neutral, outline-free asset separately |
| Call this draft validated after written questions | Require actual models, saved-file rerenders, GLB round trips and unseen-reference transfer |

## Verified sample lessons — 2026-10-21

**Still UNVALIDATED overall.** Phase 1 supplied real static-model evidence for an original oscilloscope, pulse controller, cable, and their composition. It does not validate unseen-reference transfer, linked-mesh edit propagation, exported animation, or real wiring. See [evaluation](references/evaluation.md) for scoped evidence and unfinished gates.

- In this actual 4.3.2 cloud build, OpenImageDenoise is unavailable. Check capabilities before enabling it; the approved sample used 128 CPU samples with denoising disabled.
- Factory-empty Freestyle line sets required an explicitly created LineStyle. An inclusion collection outlined mesh shells and the beveled cable body curve; excluding fine labels/grid/trace prevented ink from swallowing readable details. Inspect neutral views as well.
- A knob's pivot can be mathematically correct while its body visibly floats. Inspect side/top views and provide a short mounting neck where the design requires it. Test local-axis motion with a postmultiplied quaternion, invariant world shaft/pivot, visible pointer movement, and unchanged unrelated parts—not Euler world-Z tilt.
- Roundtrip QA must compare complete imported port records with the native records and authoritative sidecar. Actual deletion/semantic-mutation probes exposed checks that node existence alone missed.
- Rebuild material summaries must include per-object slots and polygon material indices, not just palette values. A real reassignment to another existing palette color otherwise went undetected.
- Count actual distinct mesh datablocks separately from placements and exported GLB primitives. Geometrically identical but separate native datablocks must not silently become one unique mesh count.

These lessons came from actual saved-file tests and an independent reviewer, not only written answers. Keep user acceptance separate from technical QA.

## Source-grounded ports — phase 2

For real-hardware interfaces, read [evidence gates](references/rtds-evidence-gates.md). Keep count, visible contacts, keying, estimated placement and compatibility confidence separate. **A correct anchor is not a correct connector.** Physically model the keyed mouth and check contact visibility against enclosure geometry in the saved file and actual GLB. The RTDS exercise exposed and regression-tested flipped copper key geometry, an invisible “slot” marker and a chassis strip occluding a correctly counted optical contact. The skill remains a learning candidate; these specific checks are practical evidence, not manufacturing/electrical certification or proof of all future reference-transfer tasks.

### Bounded visible variants and final-artifact gates

- **Do not turn covered or ambiguous faces into invented interiors.** Preserve a photographed dust cap. If a white optical face has unresolved cap-versus-sleeve status, reproduce only its visible exterior and keep that classification unknown. Do not claim exposed contacts, insertable bores or an uncapped compatible part. Mark insertion animation unavailable until the missing state has direct supporting evidence.
- **Keep viewpoint ambiguity unresolved.** Apparently reversed power labels may come from board-side versus cable-side views. Independently align the views before assigning spatial pin numbers; otherwise retain only the documented function set. Do not silently copy a similar board's pinout or declare a manufacturer error.
- **Check support and access independently.** Each contact base must enter its own actual solid insulating support, not merely a hollow housing's bounding box. Check the complete PCB/chassis assembly graph and verify panel-to-housing supports against actual solid panel triangles. Separately ray-test physical key openings: clear contacts do not prove a clear latch slot, and decorative panel ink can obstruct one. Recheck every annotation's glyph surfaces, not just label centers. Run these tests on the saved native asset and the actual delivered GLB; use deliberate fault probes and an independent reviewer.
- **Inspect cheaply before rendering fully.** Review top, isometric and four sides first, then critical-mouth closeups. Keep diagnostic wire contrast legible and exclude thin printed glyphs from wire modifiers that create spikes. Freeze geometry before the final view set and bind every view to its exact master/export hashes.
- **Sanitize PNG text metadata without changing pixels.** Before public delivery, replace absolute `File` text paths with project-relative paths using metadata-only PNG chunk edits. Preserve IDAT bytes and verify decoded RGBA equality; do not re-encode the image. Refresh every dependent image hash, preview/audit receipt and delivery inventory, while retaining the unchanged master/GLB binding and explicit evidence of the metadata-only transformation. A visually identical image with stale receipts is not a verified delivery.

These additional gates were exercised on bounded visual variants; the skill's overall validation status and compatibility limitations remain unchanged.
