"""Bounded adversarial checks: corrupt live scene copies, never save the master."""
import bpy,sys,importlib.util,json,hashlib
from pathlib import Path
from mathutils import Vector
P=Path(__file__).resolve().parents[1];A=P.name;kind='glb' if '--glb' in sys.argv else 'native'
if kind=='glb':bpy.ops.wm.read_factory_settings(use_empty=True);bpy.ops.import_scene.gltf(filepath=str(P/'exports/asset.glb'))
else:bpy.ops.wm.open_mainfile(filepath=str(P/'source/asset.blend'))
spec=importlib.util.spec_from_file_location('gtfpi_tests',P/'source/test_geometry.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
results=[]
def detect(name,method):
 t=mod.PhysicalGTFPI(method);t.setUp()
 try:getattr(t,method)()
 except AssertionError:results.append({'mutation':name,'caught':True});return
 results.append({'mutation':name,'caught':False})
objs={o.get('sid'):o for o in bpy.context.scene.objects if o.get('sid')}
a=objs[A+'.hv'];pin=next(o for o in a.children_recursive if o.get('interface_feature')=='contact')
old=pin['interface_feature'];pin['interface_feature']='removed_contact';detect('contact missing from actual interface','test_complete_anchors_and_contact_geometry');pin['interface_feature']=old
old=pin.location.copy();pin.location.z+=.01;bpy.context.view_layer.update();detect('pin detached from its base','test_all_pins_reach_own_connector_base');pin.location=old;bpy.context.view_layer.update()
wall=objs[A+'.hv.outer_wall1'];old=wall.location.copy();wall.location.y=-wall.location.y;bpy.context.view_layer.update();detect('physical ribbon key wall on wrong side','test_two_rows_and_outward_physical_key_gap');wall.location=old;bpy.context.view_layer.update()
# Place real opaque geometry over a contact tip and then remove it.
bpy.ops.mesh.primitive_cube_add(size=1,location=pin.matrix_world.translation+Vector((0,0,.012)));block=bpy.context.object;block.scale=(.002,.002,.0005);block['sid']='qa.synthetic_occluder';bpy.context.view_layer.update();detect('opaque plane blocks actual contact','test_all_contact_tips_unoccluded');bpy.data.objects.remove(block,do_unlink=True)
# Labels are tested against every glyph triangle; this blocker covers the complete label bounds.
label=objs[A+'.board_model'];pts=[label.matrix_world@Vector(v) for v in label.bound_box];lo=Vector([min(p[k] for p in pts) for k in range(3)]);hi=Vector([max(p[k] for p in pts) for k in range(3)])
bpy.ops.mesh.primitive_cube_add(size=1,location=(lo+hi)/2+Vector((0,0,.01)));block=bpy.context.object;block.scale=(hi.x-lo.x+.001,hi.y-lo.y+.001,.0005);block['sid']='qa.synthetic_label_occluder';bpy.context.view_layer.update();detect('opaque plane hides annotation glyphs','test_all_annotation_glyphs_visible');bpy.data.objects.remove(block,do_unlink=True)
# Restore clean label report after intentionally failing probe.
bpy.context.view_layer.update();t=mod.PhysicalGTFPI('test_all_annotation_glyphs_visible');t.setUp();t.test_all_annotation_glyphs_visible()
r={'asset_id':A,'scene':kind,'status':'PASS' if all(x['caught'] for x in results) else 'FAIL','mutations':results,'master_modified':False,'source_blend_sha256':hashlib.sha256((P/'source/asset.blend').read_bytes()).hexdigest(),'source_glb_sha256':hashlib.sha256((P/'exports/asset.glb').read_bytes()).hexdigest()};(P/'qa'/('mutation-probes-'+kind+'.json')).write_text(json.dumps(r,indent=2)+'\n');print(r)
if r['status']!='PASS':raise RuntimeError('Mutation survived')
