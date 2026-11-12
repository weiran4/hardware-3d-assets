# GTNETx2 第5B章核心接线基础版设计

## Intent and scope

Continue the approved chapter sequence after 5A release acceptance. Bind only the existing `gtnet-x2` catalog entry to `#rtds-chapter-5b`, lesson key `gtnetX2`. Teach four functional ports, not mechanical geometry: GT A, LAN A, GT B, LAN B. Source: Chapter 5B, revision 20250318, PDF249–275. Publish only original explanations and code. No source pages/images, private paths, credentials or unrelated files.

## Approach

Use an independent pure checker and independent lesson DOM, with the established gallery/context routing and shared white responsive chapter layout. This is preferred over reusing the v3 checker, whose six ports and PRP resource rules are incompatible, and over adding a generalized protocol engine, which would expand beyond verified evidence. No dependency, hardware model or broad architecture refactor.

## Domain and interaction

Normal fixed teaching example: A publishes SV and B subscribes GOOSE, each with a dedicated GT connection to the same NovaCor. LAN A carries SV outward, LAN B carries GOOSE inward through the selected network connection. These roles are an example, not permanent hardware roles. Installed firmware is not active firmware; each module runs one active protocol, two protocols per card in normal mode. Factory protocol SKT. Never daisy-chain GT.

PRP: one selected teaching protocol (SV) occupies both modules. Do not depict a same-card SV/GOOSE loop. LAN A and LAN B connect to independent PRP networks; redundant branches represent the same data, not sequential sends. Distinguish initial configuration from runtime: the example checks both GT connections for initial module access/firmware/PRP configuration (not a claim they must remain simultaneously attached throughout every configuration step); runtime requires GT A but not GT B. Show a configuration-ready result without a running signal animation during initial configuration. Only runtime can animate. Include explicit offline current-settings-effective condition because changed redundancy settings need card reset; this does not require a reset every run. Runtime playback additionally requires configurationComplete, without auto-confirming it when the stage changes; no real device operation.

Checker state: mode normal/prp; stage runtime/setup; gtA/gtB; lanA/lanB; activeA/activeB (normal SV/GOOSE only); prpSingleProtocol (SV whole-card vs unsupported dual-protocol attempt); prpProtocolVerified (the applicable active protocol and compatible firmware checked, without inventing a paired-firmware activation recipe or equal-version rule); configurationComplete; independent; versionsVerified; resetApplied (current redundancy settings have taken effect following any required reset); medium copper/fx/sx; speed 100/1000; duplex full; direct; crossoverVerified. Strict validation rejects unknown fields' values, missing required fields, null inputs and non-boolean confirmations. Returns status invalid/unverified/match, explanatory message, and links. Invalid or unverified means links empty. Setup match also has links empty because it is not runtime. Defaults are clearly labeled prefilled teaching conditions, never measured hardware state.

Full PRP minimum conditions adjacent to confirmation: RSCAD FX2.3; x2 FPGA0061; NovaCor1.0 OS5.144 build6/FPGA363 or NovaCor2.0 OS6.144 build6/FPGA363 as applicable; PB3.26, SKT2.12, DNP4.22, MODBUS1.28, IEC1044.12, SV6.14, GSE7.25, PMU3.25, MU1.19. The confirmation covers all applicable conditions, not merely software installation. No v3 RSCAD2.8 rule. No universal GTSYNC or RED box requirement.

Ethernet: 100/1000Base-T, optional 100Base-FX/1000Base-SX, matching speed and full duplex. Reject 10Mbps and half duplex. Unconfirmed applicable setup/version/protocol conditions are unverified, not claims of a physical failure. Unknown direct copper wiring stays unverified, even when other checks match. No automatic MDI/MDIX; certain direct devices need crossover wiring. Same SFP model does not make GT and Ethernet interchangeable. Post-May-2022 hardware/new SFP firmware limits are a caveat, not a procurement list. USB is optional diagnostics, never replacement GT/LAN; power comes from enclosure. Some protocols need licenses; no complete license matrix.

Playback supports play/pause/replay/manual next, immediately stops on parameter change, hidden chapter, generic mode, background document, or reduced-motion change. Reduced motion disables autoplay but leaves manual steps. No numeric hardware/network/loop delay, no timing scale, no use of USB115200bps or GSE troubleshooting frequency as latency. Do not calculate from the questionable PDF263 mask.

## Integration and non-goals

Register app initializer before gallery init, hidden section in index, context mapping/hash parser, gallery visible section/description/focus/PiP suppression. Add 5B chapter navigation and update 5A wording from “5B not complete” to an explicit cross-link only as part of this substantial increment. Preserve all existing models, routes, keyboard/mobile and WebGL fallback behavior. No reserved right column. Document core-basic/partial coverage and no communication-success guarantee. Full protocol settings, real timing, dimensions, pinouts, firmware writes and commissioning are excluded. Local completion is not release; exact-SHA Pages verify, deploy and anonymous smoke-live gates are required.

## Follow-up boundary

Continue5B with path availability after a correctly configured PRP network loses and regains one LAN before evaluating6A. This increment checks initial wiring and runtime prerequisites, not fault/recovery behavior. Do not infer zero packet loss, zero delay, recovery time, or released protocol resources from single-network failure.
