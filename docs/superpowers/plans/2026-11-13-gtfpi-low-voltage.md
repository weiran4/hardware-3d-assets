# GTFPI low-voltage protection loop

Goal: first working 3D unit for slides 18–19; slide20 HV remains pending.
Architecture: preserve actual GTFPI GLB; original functional low-voltage panel and relay dry contact plus 5V-compatible state receiver. Ribbon is a documented connection category, not pin mating. A clearly offline breaker state completes the educational return loop.
Sources: Hardware Manual GTFPI V2 20240924 PDF453–460; presentation18–20. No private source pixels or PDF published.

## Tasks / acceptance
- [x] Pure state with four patch wires, open=1/closed=0, Inv affecting all16 bits (one shown), discrete sample then latched breaker opening, output actively0/5V; no assumed end-to-end delay. Input source conflict, missing reference, incompatible receiver block valid demonstration.
- [x] Original 3D external relay, low-voltage patch panel, receiver, actual card and cable category; terminal selection, no undocumented pin numbers, no high-voltage操作.
- [x] Only selected GTFPI lesson visible; aliases18/19; page20 explicitly pending. One playback button, pause/replay, step, keyboard, reduced-motion, failed model/context retry, hidden/background stop.
- [ ] Unit + browser tests, desktop/mobile pixels, old full regression/build; independent review before parent publication.

Local verification: 741 unit tests and build passed. Desktop/mobile/fallback screenshots inspected; original physical devices and actual GLB render. Independent source and code review passed after mobile playback and pause/resume corrections. Final full browser regression and release gate remain with coordinator.
