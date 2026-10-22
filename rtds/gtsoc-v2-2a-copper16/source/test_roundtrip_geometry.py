"""Import actual delivered GLB into an empty scene, then apply identical physical checks."""
import bpy,runpy
from pathlib import Path
P=Path(__file__).resolve().parents[1]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(P/'exports/asset.glb'))
bpy.context.scene.unit_settings.system='METRIC';bpy.context.scene.unit_settings.scale_length=1
runpy.run_path(str(P/'source/test_geometry.py'),run_name='__main__')
