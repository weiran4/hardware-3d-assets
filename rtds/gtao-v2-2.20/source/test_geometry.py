import bpy,sys,json,unittest,hashlib
from pathlib import Path
from mathutils import Vector
P=Path(__file__).resolve().parents[1]
class PhysicalGTAO(unittest.TestCase):
 def test_all_anchors_and_actual_contacts(self):
  p=json.loads((P/'metadata/ports.json').read_text())['ports'];anchors={o.get('sid'):o for o in bpy.context.scene.objects if o.get('kind')=='anchor'}
  self.assertEqual(set(anchors),{x['id'] for x in p})
  for rec in p:
   a=anchors[rec['id']];self.assertLess((a.matrix_world.translation-Vector(rec['position_m'])).length,1e-5)
   contacts=[o for o in a.children_recursive if o.get('interface_feature')=='contact']
   self.assertEqual(len(contacts),rec['visible_contact_count'] or 0,rec['id'])
   if rec['group']=='analog_output':
    self.assertEqual(len([o for o in a.children_recursive if o.get('interface_feature')=='slotted_screw']),2)
    ordered=sorted(contacts,key=lambda x:x.location.x)
    for a,b in zip(ordered,ordered[1:]):self.assertAlmostEqual(b.location.x-a.location.x,.00381,places=6)
 def test_dip_and_key_profile(self):
  self.assertEqual(len([o for o in bpy.context.scene.objects if o.get('interface_feature')=='dip_switch']),8)
  self.assertEqual(len([o for o in bpy.context.scene.objects if o.get('key_profile')=='left_chamfered_1x4']),2)
 def test_native_port_frames(self):
  for o in bpy.context.scene.objects:
   if o.get('kind')!='anchor':continue
   p=json.loads(o['port_record']);q=o.matrix_world.to_quaternion()
   self.assertGreater((q@Vector((0,0,1))).dot(Vector(p['normal'])),.9999)
   self.assertGreater((q@Vector((0,1,0))).dot(Vector(p['keyed_up'])),.9999)
 def test_terminal_labels_face_component_side(self):
  labels=[o for o in bpy.context.scene.objects if '.channel' in o.get('sid','') and '.label' in o.get('sid','')]
  self.assertEqual(len(labels),32)
  for o in labels:self.assertGreater((o.matrix_world.to_quaternion()@Vector((0,0,1))).dot(Vector((0,0,1))),.9999)
 def test_optical_contact_visibility(self):
  d=bpy.context.evaluated_depsgraph_get()
  for a in [o for o in bpy.context.scene.objects if o.get('connector_family')=='lc_duplex_sfp']:
   q=a.matrix_world.to_quaternion();direction=-(q@Vector((0,0,1)))
   for c in [o for o in a.children_recursive if o.get('interface_feature')=='contact']:
    for dx,dy in [(1,0),(-1,0),(0,1),(0,-1)]:
     point=c.matrix_world@Vector((dx*.00085,dy*.00085,0));start=point-direction*.03
     hit,loc,n,idx,obj,mat=bpy.context.scene.ray_cast(d,start,direction,distance=.031)
     self.assertTrue(hit);self.assertEqual(obj.get('sid'),c.get('sid'),'Optical contact is occluded by '+obj.name)
 def test_terminal_contact_visibility(self):
  d=bpy.context.evaluated_depsgraph_get()
  for a in [o for o in bpy.context.scene.objects if o.get('connector_family')=='phoenix_1803578']:
   direction=-(a.matrix_world.to_quaternion()@Vector((0,0,1)))
   for c in [o for o in a.children_recursive if o.get('interface_feature')=='contact']:
    point=c.matrix_world.translation;start=point-direction*.03
    hit,loc,n,idx,obj,mat=bpy.context.scene.ray_cast(d,start,direction,distance=.031)
    self.assertTrue(hit);self.assertEqual(obj.get('sid'),c.get('sid'),'Wire-entry contact is occluded by '+obj.name)
 def test_unknown_lower_power_has_no_electrical_labels(self):
  self.assertFalse([o for o in bpy.context.scene.objects if '.power2.contact_label' in o.get('sid','')])
  a=next(o for o in bpy.context.scene.objects if o.get('sid')=='gtao-v2-2.20.power2');self.assertEqual(json.loads(a['port_record'])['contact_labels'],[None]*4)
 def test_terminal_headers_reach_pcb(self):
  headers=[o for o in bpy.context.scene.objects if o.get('sid','').endswith('.pcb_header')]
  self.assertEqual(len(headers),16)
  for o in headers:
   low=min((o.matrix_world@Vector(v)).z for v in o.bound_box)
   self.assertAlmostEqual(low,.0076,places=5,msg='Header must meet PCB, not float: '+o.name)
 def test_connector_housings_seated(self):
  housings=[o for o in bpy.context.scene.objects if o.get('sid','').endswith('.keyed_shroud') or (o.parent and o.parent.get('connector_family')=='unresolved_service_outline' and ('.side' in o.get('sid','') or '.edge' in o.get('sid','')))]
  self.assertEqual(len(housings),10)
  for o in housings:self.assertAlmostEqual(min((o.matrix_world@Vector(v)).z for v in o.bound_box),.0076,places=5,msg=o.name)
 def test_power_silkscreen_plane(self):
  labels=[o for o in bpy.context.scene.objects if '.power1.contact_label' in o.get('sid','')]
  self.assertEqual(len(labels),4)
  for o in labels:self.assertAlmostEqual(o.matrix_world.translation.z,.00775,places=5)
 def test_heatsink_core_attachment(self):
  core=next((o for o in bpy.context.scene.objects if o.get('sid')=='gtao-v2-2.20.heatsink_core'),None)
  self.assertIsNotNone(core)
  z=[(core.matrix_world@Vector(v)).z for v in core.bound_box]
  self.assertAlmostEqual(min(z),.0076,places=5);self.assertGreaterEqual(max(z),.01999)
 def test_unlit_display_contrast(self):
  face=next(o for o in bpy.context.scene.objects if o.get('sid')=='gtao-v2-2.20.id_display')
  self.assertEqual(face.data.materials[0].get('material_id'),'palette.gtao_chip')
 def test_major_decorative_assemblies_seated(self):
  for name in ['dip_body','id_display','lower_heatsink_base','reset_switch']:
   o=next(o for o in bpy.context.scene.objects if o.get('sid')=='gtao-v2-2.20.'+name)
   self.assertAlmostEqual(min((o.matrix_world@Vector(v)).z for v in o.bound_box),.0076,places=5,msg=name)
  base=next(o for o in bpy.context.scene.objects if o.get('sid')=='gtao-v2-2.20.lower_heatsink_base')
  top=max((base.matrix_world@Vector(v)).z for v in base.bound_box)
  for o in bpy.context.scene.objects:
   if '.lower_heatsink_fin_' in o.get('sid',''):self.assertAlmostEqual(min((o.matrix_world@Vector(v)).z for v in o.bound_box),top,places=5)
 def test_power_contacts_visible(self):
  d=bpy.context.evaluated_depsgraph_get()
  for a in [o for o in bpy.context.scene.objects if o.get('connector_family')=='keyed_1x4_power']:
   for c in [o for o in a.children_recursive if o.get('interface_feature')=='contact']:
    start=c.matrix_world.translation+Vector((0,0,.03));hit,loc,n,idx,obj,mat=bpy.context.scene.ray_cast(d,start,Vector((0,0,-1)),distance=.04)
    self.assertTrue(hit);self.assertEqual(obj.get('sid'),c.get('sid'))
 def test_power_physical_chamfer_negative_x(self):
  for o in bpy.context.scene.objects:
   if not o.get('sid','').endswith('.keyed_shroud'):continue
   # Inspect real vertex shape, not the descriptive key_profile extra.
   vs=[v.co for v in o.data.vertices];xs=[v.x for v in vs];lo=min(xs);hi=max(xs)
   self.assertAlmostEqual(lo,-.005,places=5);self.assertAlmostEqual(hi,.0044,places=5)
   ys=[abs(v.y) for v in vs if abs(v.x-lo)<1e-6];self.assertTrue(ys);self.assertLess(max(ys),.012)
 def test_all_components_within_board_envelope(self):
  for o in bpy.context.scene.objects:
   if not o.get('sid') or o.type not in {'MESH','FONT'}:continue
   pts=[o.matrix_world@Vector(v) for v in o.bound_box]
   self.assertGreaterEqual(min(v.z for v in pts),-.00001,o.name)
   self.assertLessEqual(max(abs(v.y) for v in pts),.09701,o.name)
   self.assertLessEqual(max(abs(v.x) for v in pts),.059,o.name)
 def test_heatsink_no_coplanar_top_faces(self):
  core=next(o for o in bpy.context.scene.objects if o.get('sid')=='gtao-v2-2.20.heatsink_core');ring=next(o for o in bpy.context.scene.objects if o.get('sid')=='gtao-v2-2.20.heatsink_top')
  zc=max((core.matrix_world@Vector(v)).z for v in core.bound_box);zr=max((ring.matrix_world@Vector(v)).z for v in ring.bound_box)
  self.assertGreater(zr-zc,.0009,'core and ring must not have coplanar top surfaces')
 def test_optical_labels_clear_link_leds(self):
  for i in [1,2]:
   a=next(o for o in bpy.context.scene.objects if o.get('sid')=='gtao-v2-2.20.gt_label'+str(i));b=next(o for o in bpy.context.scene.objects if o.get('sid')=='gtao-v2-2.20.link_led'+str(i))
   pa=[a.matrix_world@Vector(v) for v in a.bound_box];pb=[b.matrix_world@Vector(v) for v in b.bound_box]
   overlap=[min(max(v[k] for v in pa),max(v[k] for v in pb))-max(min(v[k] for v in pa),min(v[k] for v in pb)) for k in [0,1]]
   self.assertFalse(all(v>0.00001 for v in overlap),'GT label overlaps link LED '+str(i))
 def test_all_printed_labels_unoccluded(self):
  # Includes port-parented labels and converted GLB label meshes, not only root FONT.
  labels=[o for o in bpy.context.scene.objects if o.type=='FONT' or o.get('interface_feature')=='printed_label']
  self.assertEqual(len(labels),86,'All 50 PCB +32 terminal +4 power annotations must be inspected')
  deps=bpy.context.evaluated_depsgraph_get();blocked=[];sample_count=0
  for o in labels:
   ev=o.evaluated_get(deps);me=ev.to_mesh();me.calc_loop_triangles();occluders=set()
   for tri in me.loop_triangles:
    points=[o.matrix_world@me.vertices[i].co for i in tri.vertices];center=sum(points,Vector((0,0,0)))/3
    for pt in [center]+[v*.8+center*.2 for v in points]:
     sample_count+=1
     hit,loc,n,ix,ob,mat=bpy.context.scene.ray_cast(deps,pt+Vector((0,0,.06)),Vector((0,0,-1)),distance=.061)
     if hit and ob.get('sid')!=o.get('sid') and loc.z>pt.z+.00005:occluders.add(ob.get('sid'))
   ev.to_mesh_clear()
   if occluders:blocked.append({'label':o.get('sid'),'occluders':sorted(occluders)})
  kind='native' if any(o.type=='FONT' for o in labels) else 'glb'
  report={'asset_id':'gtao-v2-2.20','status':'FAIL' if blocked else 'PASS','label_count':len(labels),'triangle_sample_count':sample_count,'scope':'ALL printed labels, including port-parented power/terminal labels; exact glyph triangle centroid plus three interior-vertex samples; upward component-side visibility.','source_blend_sha256':hashlib.sha256((P/'source/asset.blend').read_bytes()).hexdigest(),'source_glb_sha256':hashlib.sha256((P/'exports/asset.glb').read_bytes()).hexdigest(),'blocked':blocked}
  (P/'qa'/('label-visibility-'+kind+'.json')).write_text(json.dumps(report,indent=2)+'\n')
  self.assertFalse(blocked,'Exact glyph samples are occluded: '+json.dumps(blocked))
 def test_no_source_bitmap(self):self.assertFalse([x for x in bpy.data.images if x.source=='FILE'])
if __name__=='__main__':
 r=unittest.TextTestRunner(verbosity=2).run(unittest.defaultTestLoader.loadTestsFromTestCase(PhysicalGTAO))
 if not r.wasSuccessful():raise RuntimeError('GTAO actual geometry failed')
