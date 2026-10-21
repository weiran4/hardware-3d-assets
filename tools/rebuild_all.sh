#!/usr/bin/env bash
# New checkpoints only. Sequential Blender processes; no installs, git, network or user computer.
set -euo pipefail
cd "$(dirname "$0")/.."
run="${1:?Usage: tools/rebuild_all.sh UNIQUE_RUN_NAME}"
case "$run" in *[!a-zA-Z0-9_-]*|'') echo 'Invalid run name' >&2; exit 2;; esac
blender="${BLENDER:-/usr/bin/blender}"
for asset in oscilloscope trigger-controller signal-cable sample-scene; do
  out="checkpoints/$run/$asset"
  "$blender" --background --factory-startup --python-exit-code 1 --python tools/build.py -- --asset "$asset" --output "$out" --seed 42
  "$blender" --background --factory-startup --python-exit-code 1 --python tools/qa_asset.py -- --asset-dir "$out"
  "$blender" --background --factory-startup --python-exit-code 1 --python tools/qa_roundtrip.py -- --asset-dir "$out"
  python3 tools/promote.py "$out"
done
python3 -m unittest discover -s tests -p test_contract.py -v
