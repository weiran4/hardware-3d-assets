"""RTDS runner; reuses established rendering/export/measurement code without changing it."""
import sys,json,importlib.util,shutil
from pathlib import Path
import bpy
ROOT=Path(__file__).resolve().parents[2];sys.path.insert(0,str(ROOT/'tools'))
from build import configure,presentation,orient_camera,export_glb,wire_overlay
from qa_asset import measured_scene
from asset_common import dump,validate_contract

def main():
 import argparse
 p=argparse.ArgumentParser();p.add_argument('--asset',default='novacor-2.0-2023');p.add_argument('--views',default='iso');a=p.parse_args(sys.argv[sys.argv.index('--')+1:]);folder=ROOT/'rtds'/a.asset
 c=json.loads((folder/'parameters.json').read_text());configure(c);bpy.context.preferences.filepaths.save_version=0
 spec=importlib.util.spec_from_file_location('rtds_builder',folder/'source/build.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod);parts=mod.build_asset(c);bpy.context.view_layer.update()
 report=measured_scene(c);errors=validate_contract(report,c);dump(folder/'qa/build_measurements.json',report)
 if errors:raise RuntimeError(errors)
 dump(folder/'metadata/parts.json',parts);presentation(c,report);bpy.ops.wm.save_as_mainfile(filepath=str(folder/'source/asset.blend'),compress=True);export_glb(folder/'exports/asset.glb');bpy.ops.wm.open_mainfile(filepath=str(folder/'source/asset.blend'))
 for v in a.views.split(','):
  if not v:continue
  orient_camera(c,report,v);sc=bpy.context.scene;sc.render.use_freestyle=False
  made=[];hidden=[]
  if v=='wireframe':made,hidden=wire_overlay()
  sc.render.filepath=str(folder/'previews'/f'{v}.png');bpy.ops.render.render(write_still=True)
  for o in made:bpy.data.objects.remove(o,do_unlink=True)
  for o in hidden:o.hide_render=False
 print('RTDS BUILD PASS',a.asset,report['placed_triangles'])
if __name__=='__main__':main()
