# Course 36: MMC hardware exteriors
The two chassis models are original meshes. Their starting view shows the GTSOC V2 front application SFP group and the imperix B-Box RCP (B-Box 3.0) rear interconnect group. The separate SV mode still shows the unmodified copper16 exterior.

## Reference and limits
- [RTDS GTSOC V2](https://knowledge.rtds.com/hc/en-us/articles/7817390306199-GTSOC-V2-Multi-Function-Auxiliary-Simulation-Hardware): 16 front SFP positions; four rear host fibre positions. The vendor stock front photo is copper populated. The MMC view preserves the existing chassis/rear meshes and shows representative empty SFP apertures, **not** installed optical transceivers, an established populated variant, or exact internal cage geometry.
- [imperix PN122](https://imperix.com/doc/help/sfp-communication-with-an-rtds-mmc-simulator): the B-Box RCP and GTSOC V2 communicate over SFP using the MMC-specific Aurora link. The supplied controller project uses **rear SFP2 (DOWN 1)**, not the red front optical PWM connectors. See also [datasheet](https://imperix.com/wp-content/uploads/document/B-Box_Datasheet.pdf) pp. 2 and 16 and the [brochure](https://imperix.com/wp-content/uploads/document/B-Box_Brochure.pdf) for enclosure and panel references.
- The two visible connection markers are group locations, not numbered jack positions or mating datums. No insertion, measured protocol timing, project-specific installed optical module, physical power-stage switching or EMC tolerance is simulated. Device face silhouettes are instructional, not manufacturing CAD.
- No vendor photos, textures, source manuals, vendor hardware design files, or private material are included.

## Rebuild
From the repository root, use a private output directory:
```bash
python rtds/mmc-photo-exteriors/source/build_gtsoc.py web/public/assets/rtds/gtsoc-v2-2a-copper16.glb /tmp/gtsoc-mmc-mesh
blender -b -t 4 --python rtds/mmc-photo-exteriors/source/build_bbox.py -- /tmp/bbox-rcp-mesh
```
The build puts the GTSOC GLB at the output root and the B-Box GLB in its output's exports folder. The site loads the two curated binaries from web/public/models/photo-bench. Both use metres, +Y up and +Z front; no manufacturer assets are required to rebuild.
