# IRC Switch V2 management completion plan

Scope: extend the existing chapter 3 lesson, not a new hardware model. Use original factual summaries from revision 20250910, PDF181 and 188–196. All interactions are offline and never send requests to devices.

1. Add a pure IPv4 management checker with separate PC/switch masks, duplicate-address and host-address checks. Reject noncontiguous masks including the manual's suspect 10.0.0.0 example. Limit this classroom checker to ordinary /1–/30 LANs; /31 and /32 remain out of scope. Same-subnet results prove only addressing prerequisites. Different subnets remain unverified even with a plausible switch gateway, since routes/ACLs/return paths are not known.
2. Add keyboard-accessible normal, mismatch, invalid-mask and routed examples in the chapter's existing scoped layout. Tie results to first-card Ethernet; USB and unknown media cannot receive a LAN match result.
3. Add a clearly dated minimum-version reference and an explicit warning that stop affects every simulation on the switch. No command execution button or firmware upgrade action.
4. Update coverage as core teaching complete but manual only partially covered. Retain optical/geometry/latency uncertainties. Next main chapter: GBH V3.

Acceptance: test-first rule tests; independent source/code review; full tests and build; desktop/mobile, keyboard, fallback and repeated navigation regression; exact-commit existing verify/deploy/smoke-live and anonymous asset matching. Inspect actual CI screenshots when local Chromium cannot render. No workflow/security changes, force push or private-source publication.
