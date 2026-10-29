# Hardware-scoped lessons implementation plan

Goal: replace the global teaching stack with one contextual teaching region inside the selected hardware workbench. User requested hardware-click disclosure, not unrelated redesign.

Architecture: preserve existing lesson DOM, model controllers and numerical code. A small pure routing/eligibility module maps hardware versions and legacy deep links to a single active lesson. Mark every lesson hidden in initial HTML. Explicit hardware selection activates applicable teaching; the implicit initial NovaCor selection does not. Move the contextual teaching region into the workbench (full-width for existing one-screen lesson layouts), before version provenance. Add a Cubicle V2 parameter-only catalog entry; never substitute an invented cabinet model.

Mapping: NovaCor 2.0 → existing analog lesson; GTAO/GTAI/GTDI/GTDO V2 → existing GTAO dual-card power example with explicit example/version boundary; Cubicle V2 → 1A budget and lighting. Other versions → no lesson. Links between lessons navigate to matching hardware first; no cabinetV2-to-V1 relabeling.

- [ ] Pure tests first: exact version eligibility, initial hidden state, known/unknown route parsing, lesson aliases and route restoration.
- [ ] Implement router and contextual region; hidden lessons receive setActive(false) and pause, async old model completions cannot reactivate them.
- [ ] Preserve legacy lesson deep links; add per-hardware hashes. Use browser history for explicit hardware/lesson navigation; Back/Forward restore exact context without duplicate history entries.
- [ ] Adjust existing tests for contextual entry, retaining all numerical, rendered-model, layout and PiP assertions. Add repeated switches, deep links, history, keyboard, mobile and no-flash/hidden-playback tests.
- [ ] Independent review, complete unit suite/build, unchanged verify → deploy → smoke-live; inspect desktop/mobile screenshots for exact commit. Do not overlap pipelines or claim source commit alone is publication.

Non-goals: new models, source factual changes, new firmware/wiring procedures, changing values or geometry, reconstructing removed GTDI abstract flow. Private manuals and images remain excluded.

Review focus: late async model loads after switches; stale hidden animation frames; legacy hash aliases/back-forward; hardware-version mismatches; PiP/canvas identity and one-screen teaching layout.

Visual acceptance update: when a contextual teaching result occupies the upper reading band, temporarily return the same gallery canvas inline so it cannot obscure waveforms/results. Keep user minimized/dismissed preferences and normal PiP behavior outside teaching. Existing 1A suppression uses the same controller mechanism; no reserved gutter or renderer recreation. Cover automatic yield and preference restoration in browser tests.
