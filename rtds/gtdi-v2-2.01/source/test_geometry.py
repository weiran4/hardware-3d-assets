import bpy,sys,json,unittest
from pathlib import Path
from mathutils import Vector
P=Path(__file__).resolve().parents[1]
class PhysicalGTDI(unittest.TestCase):
 def test_all_anchors_and_actual_contacts(self):
  p=json.loads((P/'metadata/ports.json').read_text())['ports'];anchors={o.get('sid'):o for o in bpy.context.scene.objects if o.get('kind')=='anchor'}
  self.assertEqual(set(anchors),{x['id'] for x in p})
  for rec in p:
   a=anchors[rec['id']];self.assertLess((a.matrix_world.translation-Vector(rec['position_m'])).length,1e-5)
   contacts=[o for o in a.children_recursive if o.get('interface_feature')=='contact']
   self.assertEqual(len(contacts),rec['visible_contact_count'] or 0,rec['id'])
   if rec['group']=='digital_input':
    self.assertEqual(len([o for o in a.children_recursive if o.get('interface_feature')=='slotted_screw']),5)
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
  labels=[o for o in bpy.context.scene.objects if '.bank' in o.get('sid','') and '.label' in o.get('sid','')]
  self.assertEqual(len(labels),80)
  for o in labels:self.assertGreater((o.matrix_world.to_quaternion()@Vector((0,0,1))).dot(Vector((0,0,1))),.9999)
 def test_optical_contact_visibility(self):
  d=bpy.context.evaluated_depsgraph_get()
  for a in [o for o in bpy.context.scene.objects if o.get('connector_family')=='lc_duplex_sfp']:
   q=a.matrix_world.to_quaternion();direction=-(q@Vector((0,0,1)))
   for c in [o for o in a.children_recursive if o.get('interface_feature')=='contact']:
    point=c.matrix_world@Vector((.00085,0,0));start=point-direction*.03
    hit,loc,n,idx,obj,mat=bpy.context.scene.ray_cast(d,start,direction,distance=.031)
    self.assertTrue(hit);self.assertEqual(obj.get('sid'),c.get('sid'),'Optical contact is occluded by '+obj.name)
 def test_terminal_contact_visibility(self):
  d=bpy.context.evaluated_depsgraph_get()
  for a in [o for o in bpy.context.scene.objects if o.get('connector_family')=='phoenix_1803604']:
   direction=-(a.matrix_world.to_quaternion()@Vector((0,0,1)))
   for c in [o for o in a.children_recursive if o.get('interface_feature')=='contact']:
    point=c.matrix_world.translation;start=point-direction*.03
    hit,loc,n,idx,obj,mat=bpy.context.scene.ray_cast(d,start,direction,distance=.031)
    self.assertTrue(hit);self.assertEqual(obj.get('sid'),c.get('sid'),'Wire-entry contact is occluded by '+obj.name)
 def test_unknown_lower_power_has_no_electrical_labels(self):
  self.assertFalse([o for o in bpy.context.scene.objects if '.power2.contact_label' in o.get('sid','')])
  a=next(o for o in bpy.context.scene.objects if o.get('sid')=='gtdi-v2-2.01.power2');self.assertEqual(json.loads(a['port_record'])['contact_labels'],[None]*4)
 def test_terminal_headers_reach_pcb(self):
  headers=[o for o in bpy.context.scene.objects if o.get('sid','').endswith('.pcb_header')]
  self.assertEqual(len(headers),16)
  for o in headers:
   low=min((o.matrix_world@Vector(v)).z for v in o.bound_box)
   self.assertAlmostEqual(low,.0076,places=5,msg='Header must meet PCB, not float: '+o.name)
 def test_connector_housings_seated(self):
  housings=[o for o in bpy.context.scene.objects if o.get('sid','').endswith('.keyed_shroud') or (o.parent and o.parent.get('connector_family')=='unresolved_service_outline' and ('.side' in o.get('sid','') or '.edge' in o.get('sid','')))]
  self.assertEqual(len(housings),18)
  for o in housings:self.assertAlmostEqual(min((o.matrix_world@Vector(v)).z for v in o.bound_box),.0076,places=5,msg=o.name)
 def test_power_silkscreen_plane(self):
  labels=[o for o in bpy.context.scene.objects if '.power1.contact_label' in o.get('sid','')]
  self.assertEqual(len(labels),4)
  for o in labels:self.assertAlmostEqual(o.matrix_world.translation.z,.00775,places=5)
 def test_heatsink_core_attachment(self):
  core=next((o for o in bpy.context.scene.objects if o.get('sid')=='gtdi-v2-2.01.heatsink_core'),None)
  self.assertIsNotNone(core)
  z=[(core.matrix_world@Vector(v)).z for v in core.bound_box]
  self.assertAlmostEqual(min(z),.0076,places=5);self.assertGreaterEqual(max(z),.02099)
 def test_no_source_bitmap(self):self.assertFalse([x for x in bpy.data.images if x.source=='FILE'])
if __name__=='__main__':
 r=unittest.TextTestRunner(verbosity=2).run(unittest.defaultTestLoader.loadTestsFromTestCase(PhysicalGTDI))
 if not r.wasSuccessful():raise RuntimeError('GTDI actual geometry failed')
