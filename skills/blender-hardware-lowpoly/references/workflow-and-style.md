# Workflow and style decisions

**UNVALIDATED proposal.** These are project defaults and judgment criteria, not Blender standards or completed modeling results. Override a default explicitly when the asset/task needs it; record the reason.

## 1. Reference intake and fidelity

Use a compact asset record: asset ID, generic/product-specific status, source images/URLs, observed faces, known dimensions with units, port inventory, moving parts, target camera/use, budgets, tolerances and unresolved questions. Assign evidence per important property rather than one confidence rating to the whole asset.

- **Measured:** supplied measurement with method and unit.
- **Documented:** identifiable model/revision and authoritative dimension or interface specification.
- **Observed:** visible photo feature without exact dimensional or functional proof.
- **Inferred:** deliberate approximation, visibly distinguished from verified facts.
- **Unknown:** not established; omit, simplify or use an explicitly generic placeholder.

A perspective photo is not a dimensioned drawing. Do not turn pixel ratios into claimed millimeter accuracy without calibration. Exact labels, connector variants, keying, counts and panel ordering matter more than decorative PCB clutter. Visible similarities do not establish pinout, voltage, protocol, fiber type or safe use.

For phase-two RTDS/Novacore/I/O/GTSOC/GTNET/GTFPI assets, match the specific supplied hardware/revision. If the rear or a port is unseen, record the gap rather than adding interfaces from a generic practice model.

## 2. Geometry and module reuse

Construct silhouette and major masses first: board/enclosure, front/rear panels, display recess, mounting features. Add characteristic interfaces next; add small details only if they improve the intended view or teaching goal. Avoid invisible internals, threads or dense traces by default. This is visual simplification, not manufacturing CAD.

Candidate kit: IC package, header segment, terminal block, USB/network/coaxial socket silhouettes, knob, button, LED lens, screw head, vent strip, mounting ear and cable end. Do not label a generic connector as an exact standard without supporting evidence.

Use linked mesh data for repeated static components and collection assemblies for multi-part modules. A local mesh edit can affect every linked duplicate; create a deliberate independent copy for a true variant. Check shared animation actions before animating duplicates independently. Keep a parent root and semantic names, for example `asset_id / panel_front / port_id / socket_body`, rather than relying on object order.

Bevel widths follow object size and viewing distance, not a universal number. Begin with minimal segments. Restrict bevels by selected edges/weights/angles as appropriate, avoid overlaps, then inspect highlights. Weighted normals can improve flat-face shading but cannot fix a wrong silhouette, reversed faces or intersecting geometry. Use the installed version's smoothing controls; the old pre-4.1 Auto Smooth checkbox is not the 4.3 workflow.

For cables/fiber, retain an editable curve master with deliberate radius, path sampling and cross-section resolution. Inspect bend shape and entry tangent. Cable bend radius in an illustration is not a verified product bend-radius specification. Export from an evaluated copy when needed and count the result, not only curve control points.

## 3. Units, hierarchy, pivots and ports

Suggested common convention: meter-based geometry, millimeter display, Z up, front toward -Y; enclosure root at bottom-center and board root at its documented underside-center. Record deviations. Changing Scene Unit Scale leaves stored mesh coordinates unchanged; it changes their unit display/conversion. Unit settings may also affect an exporter's interpretation of physical size, so do not assume they are irrelevant to export. Verify a known physical dimension after export; do not manually apply an axis conversion twice.

Establish intended object scale before bevels and animation. Do not blindly apply all transforms after creating pivots, parenting, shared data or keyframes. Knobs rotate about their shafts; hinges rotate about their hinge axes; insertion motions use the connector's frame.

Create named non-rendering attachment anchors under the relevant device root or moving panel. Suggested anchor convention: local +Z outward from the socket and +Y keyed-up, with insertion along -Z. Record this in the asset; other conventions are valid if explicit and consistent. A multi-channel connector has one mechanical connector frame and separate channel semantics where useful—not automatically one cable anchor per electrical pin.

Keep three layers distinct:

| Layer | Example fields | What it establishes |
|---|---|---|
| Visual geometry | mesh/material IDs, display label | Appearance and selection target |
| Placement frame | stable port ID, parent, local transform, insertion axis | Where an illustrated connection attaches |
| Domain semantics | connector variant, role, channel, direction, evidence, compatibility status | Only the meaning supported by separate documentation/rules |

Compatibility status defaults to `unknown`. Separate physical mating from electrical/optical/protocol compatibility. A successful snap, matching color, socket shape or animation does not promote either to `verified`. Future tutorial rules should reference stable IDs and a separately reviewed connection graph. Do not encode correctness solely in mesh names, materials or spatial overlap. A future wiring tutorial remains a separate implementation/authorization step.

### Proposed semantic persistence contract

For later authorized asset tasks, use a local sidecar asset manifest as the authoritative semantic record; Blender custom properties and optional glTF extras are convenience mirrors, not the sole copy. No manifest or application is implemented by this draft. A project-specific agreed schema may replace this proposal explicitly.

| Required record | Minimum content |
|---|---|
| Asset | Stable asset ID, generic/product/revision identity, source references, unit/axis conventions, confidence and unresolved facts |
| Port | Stable port ID, stable parent node ID, anchor object mapping, display label, connector identity/confidence, evidence references |
| Placement | Position in meters and quaternion **w,x,y,z**, relative to the named parent; unit scale; outward/keyed-up axis convention |
| Compatibility | Separate physical and electrical/optical/protocol statuses; `unknown` by default; evidence and revision scope for any verified claim |
| Export mapping | Source stable IDs to exported node IDs/names; exported coordinate/quaternion convention; metadata included/omitted |

Do not identify a port only by a mutable display name. Keep source IDs in the sidecar even if a consumer drops custom properties. Explicitly translate quaternion ordering/coordinate conventions when mirroring to another format. Round-trip checks compare the manifest to actual reimported nodes and transformed frames; missing, duplicated or mis-parented IDs/anchors fail the check. This preserves semantics without implementing electrical validation logic in the mesh.

## 4. Requested illustration direction

The user-provided style reference (not distributed) was visually inspected. Observed traits: warm cream field, dark ink-like contours, coral/orange and pale green/blue-gray blocks, strongly directional blue shadow, restrained labels, and an isometric-looking three-quarter composition. This is visual evidence only; the screenshot does not prove its renderer or exact camera settings. Do not copy the pictured vacuum, interface, proprietary artwork or third-party skill corpus.

Transfer those traits to hardware while keeping ports and labels accurate:

- Set the **render camera** to Orthographic; changing viewport projection alone is insufficient. Use readable three-quarter composition without hiding the working panel.
- Use a small muted palette and clear part grouping. Accent controls/status without using color as the only identifier.
- Separate silhouette contours from interior detail lines; preserve thin terminals and label legibility at the target output size. Hand-drawn irregularity is optional and must not move port anchors or obscure exact connections.
- Use cream surroundings and a restrained directional shadow. Keep presentation materials/lighting separate from the neutral asset QA scene.
- Prefer simple Principled materials for the reusable asset. Blender-only shader/compositor effects need an explicit export alternative, not an assumption of portability.

**Outline choice is a prototype decision, not settled implementation:** Freestyle is a Blender line-rendering option to test for offline images; its rendered strokes are not automatically GLB mesh data. A geometric outline shell changes triangle cost and can occlude socket interiors; test backface/material behavior in the target consumer. A future viewer-side outline is application work, not part of this skill draft. Do not claim matching outlines in Blender and GLB until demonstrated.

## 5. Neutral QA and delivery

Neutral QA uses clear lighting, an unambiguous background and no decorative outline concealment. Check silhouette, normals, flat-face shading, floating parts, intersections, panel thickness, socket clearance and the verified port inventory. Use front, rear, side, top and three-quarter views, with a wireframe/normal diagnostic view. Intentional open surfaces are not automatically defects; judge them against intended visibility and function.

Illustrative QA checks target-size readability, consistent line weight, palette, shadow, camera framing and distinguishable ports. Use the same asset and fixed comparison views, not a flattering replacement mesh. Record render engine, resolution, samples, exposure and view transform. A neutral product-color view and a stylized view answer different questions.

Budget per task: define scene population, view distance and target before fixing triangle/material limits. Record base, evaluated and exported counts; count generated curves/bevels/outline meshes. Report `unique_mesh_triangles` (each exported mesh's primitives counted once) and `placed_scene_triangles` (sum over exported mesh placements/instances), identifying any intentional exclusions. Record exported vertex count separately: normal/UV seams can duplicate vertices without increasing triangle count. These are asset-complexity measures, not proof of runtime performance. No fixed count in this draft is a universal acceptance threshold.

Delivery requires the editable `.blend`, actual `.glb`, manifest and review evidence requested by the task. Save packed eligible resources and reopen the saved file; packing is not complete merely because the menu action ran. Reimport GLB into a clean scene and compare scale, orientation, hierarchy, visible geometry, normals, materials, anchor transforms, required metadata and supported animations. If an independent target viewer is available and authorized, inspect it too; a Blender round trip does not prove every consumer.

glTF supports a subset of Blender data. Object transforms, bones and shape-key values are portable animation categories; arbitrary material emission, light animation and curve bevel-factor growth are not automatically exported. Freestyle, world/background styling and compositor effects also need separate handling. Supported-channel redesign, baked static states or later runtime effects are alternatives to test—not promises. Never mark an unsupported effect passed just because the file exports without an exception.
