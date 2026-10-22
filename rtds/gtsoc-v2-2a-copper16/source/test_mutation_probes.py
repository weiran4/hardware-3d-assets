"""Deliberately corrupt in-memory native and delivered GLB scenes; never save mutations."""
import bpy,sys,json,runpy,unittest,io,hashlib
from pathlib import Path
from mathutils import Vector,Quaternion
P=Path(__file__).resolve().parents[1];A=P.name
ns=runpy.run_path(str(P/'source/test_geometry.py'));Case=ns['PhysicalGTSOC']
def open_scene(kind):
 if kind=='native':bpy.ops.wm.open_mainfile(filepath=str(P/'source/asset.blend'))
 else:bpy.ops.wm.read_factory_settings(use_empty=True);bpy.ops.import_scene.gltf(filepath=str(P/'exports/asset.glb'))
 bpy.context.view_layer.update()
def obj(suffix):return next(o for o in bpy.context.scene.objects if o.get('sid')==A+'.'+suffix)
def block(loc,size):
 bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.dimensions=size;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o['sid']='mutation.blocker';return o
def missing_contact():bpy.data.objects.remove(obj('front1.contact1'),do_unlink=True)
def flipped_key():
 a=obj('front1');a.rotation_mode='QUATERNION';a.rotation_quaternion=a.rotation_quaternion@Quaternion((0,0,1),3.141592653589793)
def blocked_key():
 a=obj('front2');n=a.matrix_world.to_quaternion()@Vector((0,0,1));block(obj('front2.key_slot').matrix_world.translation+n*.003,(.003,.002,.003))
def blocked_label():block((0,-.154,.081),(.070,.002,.012))
def detached_base():obj('front1.contact_carrier').location.z+=.003
def detached_collar():
 for o in obj('front1').children:
  if o.get('interface_feature')=='panel_collar':o.location.z+=.01
cases=[('missing_contact',missing_contact,'test_exact_physical_contacts_and_frames'),('flipped_key',flipped_key,'test_exact_physical_contacts_and_frames'),('blocked_key',blocked_key,'test_every_key_slot_has_outward_clearance'),('blocked_glyph',blocked_label,'test_every_annotation_glyph_unoccluded'),('detached_contact_base',detached_base,'test_each_metal_contact_base_is_in_real_insulator'),('detached_panel_collars',detached_collar,'test_mount_collars_intersect_actual_panel_geometry')]
hashes={k:hashlib.sha256((P/v).read_bytes()).hexdigest() for k,v in [('source_blend_sha256','source/asset.blend'),('source_glb_sha256','exports/asset.glb')]};results=[]
for kind in ['native','glb']:
 for name,mutate,method in cases:
  open_scene(kind);mutate();bpy.context.view_layer.update();stream=io.StringIO();res=unittest.TextTestRunner(stream=stream).run(Case(method));detected=bool(res.failures) and not res.errors;results.append({'source':kind,'mutation':name,'test':method,'detected':detected,'unexpected_error':bool(res.errors)})
  if not detected:raise RuntimeError('Mutation not caught: '+kind+' '+name+' '+stream.getvalue())
 open_scene(kind);res=unittest.TextTestRunner().run(unittest.defaultTestLoader.loadTestsFromTestCase(Case))
 if not res.wasSuccessful():raise RuntimeError('Restored baseline failed '+kind)
report={'status':'PASS','probes':results,'mutations_saved':False,**hashes};(P/'qa/mutation-probes.json').write_text(json.dumps(report,indent=2)+'\n');print('PASS',len(results),'mutation probes')
