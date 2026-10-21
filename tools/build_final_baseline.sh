#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
for asset in oscilloscope trigger-controller; do
  out="checkpoints/final-baseline/$asset"
  /usr/bin/blender -b --factory-startup --python-exit-code 1 --python tools/build.py -- --asset "$asset" --output "$out" --seed 42
  /usr/bin/blender -b --factory-startup --python-exit-code 1 --python tools/qa_asset.py -- --asset-dir "$out"
  /usr/bin/blender -b --factory-startup --python-exit-code 1 --python tools/qa_roundtrip.py -- --asset-dir "$out"
  /usr/bin/blender -b --factory-startup --python-exit-code 1 --python tests/test_blender_knob_mount.py -- "$out"
  /usr/bin/blender -b --factory-startup --python-exit-code 1 --python tests/test_blender_motion.py -- "$out"
  python3 tools/promote.py "$out"
done
