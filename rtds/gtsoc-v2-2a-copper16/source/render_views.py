"""Saved-master renders; final provenance is per-view and source-hash matched."""
import bpy,json,sys,hashlib,math
from pathlib import Path
from mathutils import Vector
P=Path(__file__).resolve().parents[1];ROOT=P.parents[1];sys.path.insert(0,str(ROOT/'tools'))
from build import orient_camera,wire_overlay
from qa_asset import measured_scene
c=json.loads((P/'parameters.json').read_text());bpy.ops.wm.open_mainfile(filepath=str(P/'source/asset.blend'));report=measured_scene(c)
args=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else [];cheap='--cheap' in args;views=next((x.split(',') for x in args if not x.startswith('--')),['iso','neutral','wireframe','front','rear','left','right','top','copper-closeup','rear-closeup','service-closeup'])
master=hashlib.sha256((P/'source/asset.blend').read_bytes()).hexdigest();provpath=P/'qa/preview-provenance.json';prov=json.loads(provpath.read_text()) if provpath.exists() else {}
if prov.get('source_blend_sha256')!=master:prov={'source_blend':'source/asset.blend','source_blend_sha256':master,'previews':{}}
for view in views:
 sc=bpy.context.scene;sc.render.use_freestyle=False;sc.cycles.samples=8 if cheap else (48 if view in ['iso','neutral','front','rear'] else 32);sc.render.resolution_x=sc.render.resolution_y=600 if cheap else 1400;sc.render.resolution_percentage=100
 if view.endswith('closeup'):
  target,d,scale={'copper-closeup':((-.031,-.154,.036),(0,-1,.15),.150),'rear-closeup':((-.026,.154,.045),(0,1,.05),.105),'service-closeup':((-.150,-.153,.029),(0,-1,.10),.105)}[view];d=Vector(d).normalized();sc.camera.location=Vector(target)+d;sc.camera.rotation_euler=(-d).to_track_quat('-Z','Y').to_euler();sc.camera.data.ortho_scale=scale
 else:orient_camera(c,report,view)
 made=[];hidden=[]
 if view=='wireframe':
  made,hidden=wire_overlay()
  # Diagnostic-only contrast, never saved into master/export geometry.
  face=bpy.data.materials.new('QA wire surface');face.use_nodes=True;face.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value=(.22,.25,.28,1)
  kept=[]
  for o,original in zip(made,hidden):
   if original.type=='FONT' or original.get('interface_feature')=='printed_label':
    bpy.data.objects.remove(o,do_unlink=True);original.hide_render=False;continue
   o.data.materials[0]=face;o.modifiers['Diagnostic wire only'].thickness=.00024;o.modifiers['Diagnostic wire only'].offset=1;o.modifiers['Diagnostic wire only'].use_even_offset=False;kept.append(o)
  made=kept
 folder=P/('qa/cheap-views' if cheap else 'previews');folder.mkdir(parents=True,exist_ok=True);path=folder/(view+'.png');sc.render.filepath=str(path);bpy.ops.render.render(write_still=True)
 for o in made:bpy.data.objects.remove(o,do_unlink=True)
 for o in hidden:o.hide_render=False
 if not cheap:
  prov['previews'][view]={'path':str(path.relative_to(P)),'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'source_blend_sha256':master,'dimensions_px':[sc.render.resolution_x,sc.render.resolution_y],'engine':'CYCLES','device':'CPU','samples':sc.cycles.samples,'denoising':False,'freestyle':False,'view_transform':sc.view_settings.view_transform};provpath.write_text(json.dumps(prov,indent=2)+'\n')
 print('RENDER PASS',view,flush=True)
