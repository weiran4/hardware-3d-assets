# GS316v3 WIF Management Switch Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans for inline execution.

1. Confirm GS316v3's exact NETGEAR front and rear photos and manufacturer guide. Keep original photos external.
2. Add a failing specimen test: sixteen numbered, recessed copper jacks in four groups; two LEDs and eight contacts per jack; rear vent field, security slot and DC jack; nine existing teaching endpoints land at unique jacks 1–9.
3. Model the photographed thin, fanless shell and details in original Three.js geometry. Replace only the Ethernet LAN switch in the NovaCor three-network scene, preserving its existing port IDs and all state/projection logic. All other models and schematic endpoints stay unchanged. Use independent front/rear presets in the same canvas and restore the saved wiring view without resetting the lesson.
4. Test at 1200 and 390 px; compare front and rear model renders to the official photos. Verify 2/3/8 chassis, keyboard, wire count, inactive view, wrong WIF/UDP case, route changes, and recovery. Run full unit suite and build, then verify exact unchanged-main release workflow and anonymous build.

## Photo and interface record

- Source: NETGEAR public [GS316v3 product page](https://www.netgear.com/business/wired/switches/unmanaged/gs316/), [top/front photo](https://assets.netgear.com/transform/pdp-desktop/42cf7a0a-d43f-48be-b3a7-a8332aaee2cc/gs316v3_wshadow_topfront_image), [right/rear photo](https://assets.netgear.com/transform/pdp-desktop/c688a1f1-bfaa-4049-9ab4-8e5bb9db3186/gs316v3_wshadow_backright_image), and [GS316v3 installation guide](https://www.downloads.netgear.com/files/GDC/GS316v3/GS316v3_IG_EN.pdf).
- Chassis width × depth × height is 286 × 102 × 27 mm. Four front banks have four numbered copper jacks each, with twin lenses, recessed openings and contact geometry. The back has a staggered vent field, a security slot and a right-side DC barrel jack. The visible side vent field and front/rear markings are derived from the photos; internal structure, individual perforation dimensions, the unseen side and mechanical clearances are not certified. No photos are distributed with the app.
- Visual acceptance: desktop and phone front/rear crops checked against the two manufacturer angles for overall silhouette, port layout, vents, DC input/lock position, and markings. The original WIF-only teaching behavior is kept. Physical switch numbers 1–9 are sample assignment only; GBH, IRC, and PC retain their schematic status. No performance or live RTDS compatibility test is implied.
