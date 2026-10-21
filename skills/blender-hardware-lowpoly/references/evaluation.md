# Evaluation: retrieval is not modeling proof

**Current status: UNVALIDATED learning candidate.** No practice model, model generator, animation, render or export was created for this skill-drafting task. Environment readiness reported by another worker is not validation of this workflow.

## A. Written decision checks

Run these as an independent written exercise. Require a concrete decision and evidence needed, not merely the right vocabulary. These checks diagnose instruction clarity only.

| Case | Question | Passing decision |
|---|---|---|
| W1 | A single front photo shows similar sockets; an authored cable snaps into both. Are they interchangeable? | No. Distinguish visual placement, physical mating, electrical/optical/protocol compatibility; retain unknown status pending authoritative evidence. |
| W2 | A 4.5 tutorial uses slotted actions. The installed Blender is 4.3.2. Reuse it unchanged? | No. Recognize 4.4+ feature boundary; use installed-version APIs and a small real export test. |
| W3 | LED emission and cable bevel-factor growth animate in Blender. Is the delivered GLB animated correctly? | Not established. Identify unsupported property animation and test supported alternatives/consumer behavior. |
| W4 | Base mesh is below a proposed count, but bevels, curves and outline shells remain unevaluated. Accepted? | No. Measure evaluated/exported geometry against a task-specific budget, including generated parts and instance accounting. |
| W5 | One illustrative image looks good. Can the asset ship? | Require neutral and illustrative multi-view QA, saved-blend reopen/rerender, actual GLB clean reimport, transforms/anchors/materials/animation checks and limitations. |
| W6 | How do repeated connectors, movable knobs and future wiring labels coexist? | Shared mesh/assembly data, independent motion where needed, real pivots, stable named anchor frames, separate semantic evidence and explicit units/axes. |
| W7 | Viewport is orthographic and Freestyle looks correct. Does GLB preserve the same appearance? | Render camera must independently be orthographic; rendered outlines/background/compositor effects need a tested export/runtime plan. |
| W8 | The written test passes. Can the skill be labeled validated? | No. Written retrieval and scenario reasoning do not prove modeling, visual quality or portability. |

### Baseline record, 2026-10-21

Before drafting, a fresh-context agent received the runtime/use case and W1-W6 without this skill. **All six core decision checks passed on review.** Its answer stated: “Do not confuse a successful file export with preserved animation.” It also explicitly distinguished snapping from mechanical, electrical and optical compatibility.

No failing no-skill behavior was observed in that sample. Therefore this baseline does **not** demonstrate that the draft fixes a failure or improves an already-capable agent. This is a user-requested reference candidate, not a claimed red/green skill success. One sample also does not establish general reliability. W7-W8 were added as future coverage, not retroactively scored against that agent.

Post-draft written evaluation on 2026-10-21: a second fresh-context agent read the skill/workflow/source references, but not this answer-key file. **W1-W8 passed on review.** No clear technical error was established by that document-only review. It identified three useful ambiguities: unit scale versus exported physical size, authoritative semantic persistence, and unique/instanced triangles versus exported vertices. The workflow reference was clarified on those points. This is written retrieval evidence only; it is not proof of a behavior improvement over the already-passing baseline or of working Blender assets. At that document-only stage practical gates had not run; the later scoped phase-1 evidence is recorded below.

The same reviewer reread the revised workflow sections 3/5 and found all three clarifications explicit and internally consistent, with no remaining clear issue in those sections. That targeted review does not replace practical validation.

## B. Practical gates — full suite still incomplete

Begin only when modeling is authorized in the selected environment. Keep evidence under the task's agreed destination; no automatic publishing or installation.

1. **Export smoke test:** one representative socket/knob/cable assembly with a known dimension, stable port anchor, shared geometry and a supported transform animation. Save/reopen `.blend`, render headlessly on CPU, export `.glb`, clean-reimport it, compare dimensions/hierarchy/frames/materials and animation states.
2. **Reuse test:** place the same module in two assets; prove the intended mesh edit propagates while independent transforms/animations remain independent. Demonstrate an intentional variant without corrupting the original.
3. **Practice progression:** relay/trigger-controller panel, MCU/FPGA board, power supply/oscilloscope, then a fiber-connected assembly. Use the same conventions across distinct shapes rather than proving one script once.
4. **Style test:** compare neutral outline-free QA with the cream/ink/muted-color orthographic presentation at intended viewing size. Inspect thin terminals, text and connector interiors; confirm the chosen outline approach's CPU cost and export boundary.
5. **Transfer test:** build a different, previously unused reference asset without copying its whole scene. Record where the skill was sufficient, ambiguous or wrong. For photo-based hardware, preserve unknown dimensions/interfaces.

## C. Review rubric for actual artifacts

Proposed scoring: silhouette/proportions 25, port/control fidelity 25, shading/materials 15, reuse/organization 10, animation/anchor readiness 10, geometry economy 5, delivery integrity 10. A suggested overall gate is 85/100 **and no critical failure**, subject to task agreement. Set actual dimensional tolerances and budgets from the task; this draft supplies no universal millimeter or triangle threshold.

Critical failures: incorrect essential interface presented as verified; missing geometry/dependency; undocumented scale/axis mismatch; broken hierarchy or pivots; invalid anchor positions; an untested or missing required exported effect claimed as passed.

Evidence record per practical gate: asset/reference IDs, runtime/build, export settings, intended checks, actual measurements, render/contact-sheet paths, GLB reimport results, failures/limitations and reviewer verdict. Mark each gate `not run`, `failed`, `passed with stated limitations`, or `passed`. Do not mark unsupported requirements passed by deleting them silently.

## Promotion rule

Keep UNVALIDATED until practical smoke, reuse, style and transfer evidence exists and the required tasks pass review. Improve the skill only from observed failure/ambiguity or new verified requirements. Preserve the distinction between a clearer document, a working model, a portable asset and a safe/accurate connection lesson.

## D. Actual phase-1 sample evidence — 2026-10-21

The approved original-generic sample was executed in dot cloud with Blender 4.3.2 / bundled Python 3.13.5 / glTF exporter 4.3.47, CPU Cycles 128 samples. Saved editable masters were reopened, rendered, exported, and the actual GLBs imported into clean scenes. Models use meters, Z-up/front −Y; GLB performs one Y-up conversion.

| Gate | Scoped result | Remaining scope |
|---|---|---|
| Export smoke | **Passed with stated limitations** for static geometry, dimensions, hierarchy, materials, independent controls and full port semantics | No supported transform-animation export test or animation clips |
| Reuse | Shared socket/knob helpers used across two original devices; scene appends verified saved masters | Linked-mesh edit propagation and independent animated instances **not run** |
| Practice progression | Original oscilloscope, pulse controller and signal cable created | MCU/FPGA board, wider asset families, RTDS not run |
| Style | **Passed within these samples**: all eight baseline views inspected, neutral QA and actual wireframe included; matching cream/ink orthographic presentation | User scoring/acceptance still pending |
| Transfer | **Not run** | Previously unused photo/reference task required |

Measured placed/exported triangles: oscilloscope **3333**, controller **1588**, cable **1936**, composition **6857**. The cable's measured centerline is 0.60000000075 m and diameter 0.00499999989 m. Counts include evaluated labels, curves and bevels, not merely base meshes. The scene has 112 unique semantic IDs and 5 anchors. Electrical limits are null and physical compatibility unknown.

Evidence in the project bundle: `generic/*/qa/report.json`, `roundtrip.json`, and `preview-provenance.json`; `qa/contract-final.log` (13 tests), `integration-final.log` (six actual Blender checks); `qa/rebuild-comparison.json`; `qa/independent-review.json`; `deliverables/contact-sheet.png` and `qa-all-views.png`. The rebuild comparison records fresh geometry/export for all four and fresh iso renders; some already-inspected baseline diagnostic views are reused only after model-digest equality and explicitly identified, not misreported as new renders.

Independent actual failure probes drove corrections to local-axis motion, complete port metadata comparison, material-slot digesting and physical knob mounting. The top-level skill records those narrow lessons. These results do not establish improvement over the earlier already-passing written baseline, production readiness, or safe electrical interaction. Overall skill status remains **UNVALIDATED** until the unmet practical gates and user review are satisfied.
