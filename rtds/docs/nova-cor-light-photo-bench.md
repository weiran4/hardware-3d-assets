# Photo-referenced hardware in the NovaCor Light wiring lessons

Course pages 38 and 39 use original exterior models of NovaCor Light, Global Bus
Hub (GBH V3), and IRC Switch V2. The GLBs are bundled in
`web/public/models/photo-bench/`. They contain geometry and materials, not photos.
GBH is transported as a gzip-compressed GLB; decompression preserves the
release geometry and reduces the opt-in download.

| Hardware | Manufacturer reference | What to recognize |
| --- | --- | --- |
| NovaCor Light | [NovaCor Light](https://knowledge.rtds.com/hc/en-us/articles/22241195047959-NovaCor-Light) | Split front grille, upper DB25 and blue Internal I/O groups, lower compute optics, separate WIF Ethernet and ETH |
| GBH V3 | [Global Bus Hub](https://knowledge.rtds.com/hc/en-us/articles/360034815313-Global-Bus-Hub) | Three rows of 12 paired optical channels, small Ethernet/USB ports, and front display |
| IRC Switch V2 | [IRC Switch](https://knowledge.rtds.com/hc/en-us/articles/360034814853-IRC-Switch) | Six optical cards with ejectors, upper modules and rack handles, side fan grille |

These are recognizable teaching exteriors, not certified dimensions, hidden
boards, pinouts or assembly models. The overview sizes devices to fit the
lesson; use a device's closer view to inspect connectors. The Light opens at
the rear for wiring. WIF is separate from the built-in Ethernet UDP path.
Digital/analog DB25 points identify groups only, not individual contact pins.

GBH/IRC optical caps are shown installed. Lines to their markers illustrate
the logical relationship, not an insertion operation, channel/polarity
assignment, or a recommendation for a particular live unit. Front optical
marker positions in `anchors.json` refer to the exact exported GLBs.
The rear IRC inlet points in that file are for orientation verification only.
Unmodeled peripherals and assets that fail to load remain explicitly schematic;
the lesson's existing wiring rules and statuses remain available.
