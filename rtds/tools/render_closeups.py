"""Render source-review closeups from a saved master, without modifying the asset."""
import bpy,sys,json
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[2];sys.path.insert(0,str(ROOT/'tools'))
from qa_asset import measured_scene
folder=Path(sys.argv[sys.argv.index('--')+1]).resolve();bpy.ops.wm.open_mainfile(filepath=str(folder/'source/asset.blend'))
sc=bpy.context.scene;sc.render.use_freestyle=False;sc.cycles.samples=96;sc.render.resolution_x=1800;sc.render.resolution_y=1000
views={
 'front-interfaces':((.133,-.261,.032),(0,-1,.08),.200),
 'rear-interfaces':((.020,.261,.031),(0,1,.12),.470),
 'optical-keying':((.138,.261,.029),(.12,1,.12),.075),
 'copper-and-sync':((-.145,.261,.029),(-.1,1,.12),.077),
}
for name,(center,direction,width) in views.items():
 c=Vector(center);d=Vector(direction).normalized();sc.camera.location=c+d*.9;sc.camera.rotation_euler=(-d).to_track_quat('-Z','Y').to_euler();sc.camera.data.ortho_scale=width;sc.camera.data.lens=60
 sc.render.filepath=str(folder/'previews'/f'{name}.png');bpy.ops.render.render(write_still=True);print('CLOSEUP',name,flush=True)
