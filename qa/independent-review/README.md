# Independent review evidence

These are public, path-sanitized copies of the three historical read-only review scripts. Only workspace/output path handling was changed for publication; the audit logic and original measured outcomes were not changed or rerun merely by publishing. The original script hashes remain in `../independent-review.json` as historical evidence; hashes for these public copies are recorded in `../publication-audit.json` and the current payload manifest.

`independent_final.py` accepts asset-directory arguments after Blender's `--` and writes reports into the ignored `outputs/` subdirectory. The repeat and mutation scripts refer to historical relative checkpoint paths that are intentionally not included. They preserve the audit implementation, not a new supported CLI. Do not mistake historical paths for external asset dependencies.

Use `tools/rebuild_all.sh` and `tools/qa_asset.py` / `tools/qa_roundtrip.py` as the portable project-relative regeneration and validation entrypoints. The self-contained final review JSON retains the actual results, artifact hashes, measurements and limitations.
