"""Cheap saved-file assembly seating views, before beauty renders."""
import bpy,json,sys,math
from pathlib import Path
from mathutils import Vector
P=Path(__file__).resolve().parents[1];ROOT=P.parents[1];sys.path.insert(0,str(ROOT/'tools'))
from build import orient_camera
from qa_asset import measured_scene
c=json.loads((P/'parameters.json').read_text());bpy.ops.wm.open_mainfile(filepath=str(P/'source/asset.blend'));r=measured_scene(c)
(P/'qa/diagnostics').mkdir(exist_ok=True)
views=sys.argv[sys.argv.index('--')+1].split(',') if '--' in sys.argv else ['front','rear','left','right','top','iso','terminal-closeup','optical-closeup','power-closeup']
for view in views:
 s=bpy.context.scene;s.render.use_freestyle=False;s.cycles.samples=4;s.render.resolution_x=s.render.resolution_y=640
 if view.endswith('closeup'):
  target,d,scale={'terminal-closeup':((.055,.063,.012),(1,.10,.15),.058),'optical-closeup':((-.053,.001,.012),(-1,-.05,.12),.080),'power-closeup':((-.043,.075,.02),(-.3,-.1,1),.046)}[view]
  target=Vector(target);d=Vector(d).normalized();s.camera.location=target+d*.8;s.camera.rotation_euler=(-d).to_track_quat('-Z','Y').to_euler();s.camera.data.ortho_scale=scale
 else:
  orient_camera(c,r,view)
  if view=='top':s.camera.rotation_euler.z+=math.pi
 s.render.filepath=str(P/'qa/diagnostics'/f'{view}.png');bpy.ops.render.render(write_still=True);print('DIAGNOSTIC',view,flush=True)
