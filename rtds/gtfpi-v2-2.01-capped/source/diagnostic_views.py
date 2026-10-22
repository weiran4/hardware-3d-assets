"""Cheap six-view review from saved master; never presented as final preview receipts."""
import bpy,sys,json,math
from pathlib import Path
P=Path(__file__).resolve().parents[1];ROOT=P.parents[1];sys.path.insert(0,str(ROOT/'tools'))
from build import orient_camera
from qa_asset import measured_scene
bpy.ops.wm.open_mainfile(filepath=str(P/'source/asset.blend'));c=json.loads((P/'parameters.json').read_text());r=measured_scene(c);out=P/'qa/diagnostics';out.mkdir(exist_ok=True)
for v in ['top','iso','front','rear','left','right']:
 orient_camera(c,r,v);sc=bpy.context.scene;sc.render.use_freestyle=False;sc.cycles.samples=8;sc.render.resolution_x=sc.render.resolution_y=512;sc.render.resolution_percentage=100
 if v=='top':sc.camera.rotation_euler.z+=math.pi
 sc.render.filepath=str(out/(v+'.png'));bpy.ops.render.render(write_still=True);print('DIAGNOSTIC',v,flush=True)
