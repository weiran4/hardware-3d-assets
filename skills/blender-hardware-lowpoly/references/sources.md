# Sources and version notes

Research checked 2026-10-21. This file contains short original summaries and links, not a copied documentation corpus. Project conventions and rubric thresholds are recommendations, not statements from Blender. Local modeling/export validation remains pending.

## Runtime provenance

The setup worker reported Blender **4.3.2**, Blender-internal Python **3.13.5**, headless **Cycles CPU**, and no GPU; the coordinator confirmed internal Python is distinct from system Python **3.12.14**. This draft did not rerun that probe. Preserve the actual executable/build and probe output with later task evidence; do not infer a standard official binary pairing or use host Python as proof of Blender's interpreter.

## Version-sensitive primary sources

1. [Blender 4.3 manual index](https://docs.blender.org/manual/en/4.3/): baseline documentation family for the observed runtime. Verify exact available properties/operator options locally before writing implementation.
2. [Blender 4.1 modeling release notes](https://developer.blender.org/docs/release_notes/4.1/modeling/): the previous Auto Smooth option was replaced by a node-group modifier workflow; mixed sharp/smooth elements and custom normals determine normal handling. Relevant to 4.3, unlike older checkbox tutorials.
3. [Blender 4.3 Weighted Normal](https://docs.blender.org/manual/de/4.3/modeling/modifiers/normals/weighted_normal.html): changes custom normals using face area/angle weighting; Keep Sharp and face influence are relevant to broad flat panels. It is a shading tool, not a topology repair guarantee.
4. [Blender 4.3 glTF animation](https://docs.blender.org/manual/uk/4.3/addons/import_export/scene_gltf2.html): action/NLA modes and transform/bone/shape-key animation support; other property animation is ignored. Test the installed exporter and the intended consumer.
5. [Blender 4.4 animation release notes](https://developer.blender.org/docs/release_notes/4.4/animation_rigging/) and [action-slot API migration](https://developer.blender.org/docs/release_notes/4.4/upgrading/slotted_actions/): slots were introduced after 4.3. Do not transplant 4.4/4.5 action-slot code into 4.3. Older Blender sees only the first slot of newer slotted actions; saving can lose later-slot data.
6. [Blender 4.3 projection](https://docs.blender.org/manual/id/4.3/editors/3dview/navigate/projections.html): viewport orthographic mode does not change the render camera. The actual camera must be set to Orthographic.
7. [Blender 4.3 Freestyle introduction](https://docs.blender.org/manual/pt/4.3/render/freestyle/introduction.html): edge/line-based NPR renderer with configurable line styles; only faced meshes are supported and the method can be memory intensive. A rendered contour is not thereby exportable mesh geometry.
8. [Blender 4.3 color management](https://docs.blender.org/manual/nl/4.3/render/color_management.html): Standard and Khronos PBR Neutral serve different viewing goals; Neutral is intended for product-color fidelity under neutral lighting. Record the selected transform instead of comparing differently graded renders as if identical.

Localized official pages were used where the English page fetch was unavailable; the version in each URL is intentional.

## Background research from 4.5 LTS

These sources informed the draft before the runtime was known. Their general concepts are useful; **4.5-specific UI, APIs, attributes and exporter options are not validated in 4.3.2**.

| Topic | Primary source | Decision supported |
|---|---|---|
| Bevel | [4.5 Bevel](https://docs.blender.org/manual/id/4.5/modeling/modifiers/generate/bevel.html) | Selective bevels, overlap control, normals and face-strength interaction |
| Reuse | [Linked duplicates](https://docs.blender.org/manual/ka/4.5/scene_layout/object/editing/duplicate_linked.html), [collection instances](https://docs.blender.org/manual/en/4.5/scene_layout/object/properties/instancing/collection.html) | Share mesh/material data deliberately; consider linked actions and assembly hierarchy |
| Scale/pivots | [Units](https://docs.blender.org/manual/id/4.5/scene_layout/scene/properties.html), [Apply](https://docs.blender.org/manual/en/4.5/scene_layout/object/editing/apply.html), [Origins](https://docs.blender.org/manual/uk/4.5/scene_layout/object/origin.html) | Distinguish displayed units, geometry/transforms and rotation origins |
| Cable geometry | [Curve geometry](https://docs.blender.org/manual/id/4.5/modeling/curves/properties/geometry.html) | Bevel converts curve paths to tubes; resolution affects geometry cost |
| Diagnostics | [Viewport overlays](https://docs.blender.org/manual/de/4.5/editors/3dview/display/overlays.html) | Statistics, wireframe, face orientation, normals and origins support visual QA |
| Packaging | [Packed data](https://docs.blender.org/manual/de/4.5/files/blend/packed_data.html) | Eligible dependencies can be packed; packing takes effect on save; not every external resource can be packed |
| Export geometry | [4.5 glTF](https://docs.blender.org/manual/fr/4.5/addons/import_export/scene_gltf2.html) | Exported vertex counts can increase at UV/flat-shading boundaries; inspect actual output |

## User style evidence

User-provided image: a privately supplied style reference (not distributed), inspected visually during drafting. It shows cream paper-like surroundings, dark outlines, restrained colored masses, a directional blue shadow and an isometric-looking object illustration. These observations guide a new hardware presentation; they do not establish the original renderer, authorize copying the artwork, or authorize installing the third-party skill advertised within the screenshot.

## Not established by these sources

- Exact dimensions/interfaces of the user's future RTDS hardware.
- Mechanical fit, electrical/optical safety, pinouts, voltage, protocol or connector interoperability.
- A universal triangle budget or tolerance for all boards and instruments.
- Successful local outline rendering, model generation, animation or GLB preservation.
- A complete website or working interactive wiring tutorial.
