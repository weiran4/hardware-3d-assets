"""Render the saved candidate, no source photos. Standard views + core-interface closeups."""
import bpy,json,sys,math,hashlib,datetime
from pathlib import Path
from mathutils import Vector
P=Path(__file__).resolve().parents[1];ROOT=P.parents[1]
sys.path.insert(0,str(ROOT/'tools'))
from build import orient_camera,wire_overlay
from qa_asset import measured_scene
c=json.loads((P/'parameters.json').read_text())
blend_hash=hashlib.sha256((P/'source/asset.blend').read_bytes()).hexdigest()
provenance_path=P/'qa/preview-provenance.json'
provenance=json.loads(provenance_path.read_text()) if provenance_path.exists() else {}
if provenance.get('source_blend_sha256')!=blend_hash:provenance={'source_blend':'source/asset.blend','source_blend_sha256':blend_hash,'previews':{}}
bpy.ops.wm.open_mainfile(filepath=str(P/'source/asset.blend'));r=measured_scene(c)
diagnostic='--diagnostic' in sys.argv
views=sys.argv[sys.argv.index('--')+1].split(',') if '--' in sys.argv else ['iso','neutral','wireframe','front','rear','left','right','top','terminal-closeup','optical-closeup','power-closeup']
for view in views:
 sc=bpy.context.scene;sc.render.use_freestyle=False;sc.cycles.samples=48 if view in ['iso','top'] else 24
 sc.render.resolution_x=sc.render.resolution_y=1400 if view in ['iso','top'] else 1024
 sc.render.resolution_percentage=100
 if diagnostic:sc.cycles.samples=4;sc.render.resolution_x=sc.render.resolution_y=640
 if view.endswith('closeup'):
  target,d,scale={'terminal-closeup':((.046,.060,.018),(1,.08,.12),.064),'optical-closeup':((-.057,.001,.012),(-1,-.05,.12),.080),'power-closeup':((-.047,.073,.02),(-.3,-.1,1),.046)}[view]
  target=Vector(target);d=Vector(d).normalized();sc.camera.location=target+d*.8;sc.camera.rotation_euler=(-d).to_track_quat('-Z','Y').to_euler();sc.camera.data.ortho_scale=scale
 else:
  orient_camera(c,r,view)
  if view=='top':sc.camera.rotation_euler.z+=math.pi # Upright PCB text; model and semantic frames unchanged.
 made=[];hidden=[]
 if view=='wireframe':made,hidden=wire_overlay()
 sc.render.filepath=str(P/('qa' if diagnostic else 'previews')/(f'diagnostic-{view}.png' if diagnostic else f'{view}.png'));bpy.ops.render.render(write_still=True)
 for o in made:bpy.data.objects.remove(o,do_unlink=True)
 for o in hidden:o.hide_render=False
 target=P/('qa' if diagnostic else 'previews')/(f'diagnostic-{view}.png' if diagnostic else f'{view}.png')
 provenance['previews'][('diagnostic-' if diagnostic else '')+view]={'path':str(target.relative_to(P)),'sha256':hashlib.sha256(target.read_bytes()).hexdigest(),'dimensions_px':[sc.render.resolution_x,sc.render.resolution_y],'engine':sc.render.engine,'device':'CPU','samples':sc.cycles.samples,'freestyle':False,'denoising':sc.cycles.use_denoising,'view_transform':sc.view_settings.view_transform,'exposure':sc.view_settings.exposure,'source_blend_sha256':blend_hash,'camera_roll_top_deg':180 if view=='top' else 0,'verified_at_utc':datetime.datetime.now(datetime.timezone.utc).isoformat()}
 provenance_path.write_text(json.dumps(provenance,indent=2)+'\n')
 print('RENDER PASS',view,flush=True)
