"""Render the saved candidate, no source photos. Standard views + core-interface closeups."""
import bpy,json,sys,math,hashlib,datetime
from pathlib import Path
from mathutils import Vector,Matrix
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
views=sys.argv[sys.argv.index('--')+1].split(',') if '--' in sys.argv else ['iso','neutral','wireframe','front','rear','left','right','top','terminal-closeup','optical-closeup','power-closeup']
for view in views:
 sc=bpy.context.scene;sc.render.use_freestyle=False;sc.cycles.samples=48 if view in ['iso','top'] else 24
 sc.render.resolution_x=sc.render.resolution_y=1400 if view in ['iso','top'] else 1024
 sc.render.resolution_percentage=100
 if view.endswith('closeup'):
  target,d,scale={'terminal-closeup':((.043,0,.018),(.25,-.15,1),.188),'optical-closeup':((-.056,0,.0125),(-1,-.08,.35),.080),'power-closeup':((.043,-.015,.018),(-.50,-.20,1),.034)}[view]
  target=Vector(target);d=Vector(d).normalized();sc.camera.location=target+d*.8;sc.camera.rotation_euler=(-d).to_track_quat('-Z','Y').to_euler();sc.camera.data.ortho_scale=scale
  if view=='terminal-closeup':
   right=Vector((0,1,0)).cross(d).normalized();up=d.cross(right);sc.camera.rotation_euler=Matrix((right,up,d)).transposed().to_euler()
 else:
  orient_camera(c,r,view)
  if view=='top':sc.camera.rotation_euler.z+=math.pi # Upright PCB text; model and semantic frames unchanged.
 if view=='terminal-closeup':
  from bpy_extras.object_utils import world_to_camera_view
  bpy.context.view_layer.update()
  for o in bpy.context.scene.objects:
   if '.hv.' not in o.get('sid','') and '.lv.' not in o.get('sid',''):continue
   for corner in o.bound_box:
    point=world_to_camera_view(sc,sc.camera,o.matrix_world@Vector(corner))
    if not (.02<point.x<.98 and .02<point.y<.98):raise RuntimeError('Ribbon closeup crops physical connector '+o.name)
 made=[];hidden=[]
 if view=='wireframe':
  made,hidden=wire_overlay()
  # Asset-local diagnostic only: stronger wire contrast; never saved/exported.
  face=bpy.data.materials.new('QA wire surface');face.use_nodes=True;face.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value=(.22,.25,.28,1)
  kept=[]
  for o,original in zip(made,hidden):
   if original.type=='FONT' or original.get('interface_feature')=='printed_label':
    bpy.data.objects.remove(o,do_unlink=True);original.hide_render=False;continue
   o.data.materials[0]=face;o.modifiers['Diagnostic wire only'].thickness=.00024;o.modifiers['Diagnostic wire only'].offset=1;o.modifiers['Diagnostic wire only'].use_even_offset=False;kept.append(o)
  made=kept

 sc.render.filepath=str(P/'previews'/f'{view}.png');bpy.ops.render.render(write_still=True)
 for o in made:bpy.data.objects.remove(o,do_unlink=True)
 for o in hidden:o.hide_render=False
 target=P/'previews'/f'{view}.png'
 provenance['previews'][view]={'path':str(target.relative_to(P)),'sha256':hashlib.sha256(target.read_bytes()).hexdigest(),'dimensions_px':[sc.render.resolution_x,sc.render.resolution_y],'engine':sc.render.engine,'device':'CPU','samples':sc.cycles.samples,'freestyle':False,'denoising':sc.cycles.use_denoising,'view_transform':sc.view_settings.view_transform,'exposure':sc.view_settings.exposure,'source_blend_sha256':blend_hash,'camera_roll_top_deg':180 if view=='top' else 0,'rendered_at_iso_executor_clock':datetime.datetime.now(datetime.timezone.utc).isoformat()}
 provenance_path.write_text(json.dumps(provenance,indent=2)+'\n')
 print('RENDER PASS',view,flush=True)
