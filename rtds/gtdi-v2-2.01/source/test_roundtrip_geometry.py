"""Run physical-interface regressions on a fresh import of the actual delivered GLB."""
import bpy,runpy
from pathlib import Path
P=Path(__file__).resolve().parents[1]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(P/'exports/asset.glb'))
runpy.run_path(str(P/'source/test_geometry.py'),run_name='__main__')
