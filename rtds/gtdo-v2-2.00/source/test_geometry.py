import bpy,sys,json,unittest
from pathlib import Path
from mathutils import Vector
P=Path(__file__).resolve().parents[1]
class PhysicalGTDO(unittest.TestCase):
 def test_all_anchors_and_actual_contacts(self):
  p=json.loads((P/'metadata/ports.json').read_text())['ports'];anchors={o.get('sid'):o for o in bpy.context.scene.objects if o.get('kind')=='anchor'}
  self.assertEqual(set(anchors),{x['id'] for x in p})
  for rec in p:
   a=anchors[rec['id']];self.assertLess((a.matrix_world.translation-Vector(rec['position_m'])).length,1e-5)
   contacts=[o for o in a.children_recursive if o.get('interface_feature')=='contact']
   self.assertEqual(len(contacts),rec['visible_contact_count'] or 0,rec['id'])
   if rec['group']=='digital_output':
    self.assertEqual(len([o for o in a.children_recursive if o.get('interface_feature')=='slotted_screw']),5)
    ordered=sorted(contacts,key=lambda x:x.location.x)
    for a,b in zip(ordered,ordered[1:]):self.assertAlmostEqual(b.location.x-a.location.x,.00381,places=6)
 def test_known_connector_family_populations(self):
  from collections import Counter
  self.assertEqual(Counter(o.get('connector_family') for o in bpy.context.scene.objects if o.get('kind')=='anchor'),{'phoenix_1803604':16,'lc_duplex_sfp':2,'keyed_1x4_power':2,'unresolved_service_outline':4})
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
    for offset in [(.00085,0,0),(-.00085,0,0),(0,.00085,0),(0,-.00085,0)]:
     point=c.matrix_world@Vector(offset);start=point-direction*.03
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
  a=next(o for o in bpy.context.scene.objects if o.get('sid')=='gtdo-v2-2.00.power2');self.assertEqual(json.loads(a['port_record'])['contact_labels'],[None]*4)
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
  core=next((o for o in bpy.context.scene.objects if o.get('sid')=='gtdo-v2-2.00.heatsink_core'),None)
  self.assertIsNotNone(core)
  z=[(core.matrix_world@Vector(v)).z for v in core.bound_box]
  self.assertAlmostEqual(min(z),.0076,places=5);self.assertGreaterEqual(max(z),.01999);self.assertLessEqual(max(z),.02001,msg='Hidden core top must not be coplanar with visible cap at .021m')
 def test_power_contact_visibility(self):
  d=bpy.context.evaluated_depsgraph_get()
  for a in [o for o in bpy.context.scene.objects if o.get('connector_family')=='keyed_1x4_power']:
   for c in [o for o in a.children_recursive if o.get('interface_feature')=='contact']:
    start=c.matrix_world.translation+Vector((0,0,.03))
    hit,loc,n,idx,obj,mat=bpy.context.scene.ray_cast(d,start,Vector((0,0,-1)),distance=.04)
    self.assertTrue(hit);self.assertEqual(obj.get('sid'),c.get('sid'))
 def test_major_board_components_seated(self):
  names=['dip_body','id_display','electrolytic']+['output_driver_'+str(i) for i in range(8)]
  for name in names:
   o=next(o for o in bpy.context.scene.objects if o.get('sid')=='gtdo-v2-2.00.'+name)
   self.assertAlmostEqual(min((o.matrix_world@Vector(v)).z for v in o.bound_box),.0076,places=5,msg=name)
  body=next(o for o in bpy.context.scene.objects if o.get('sid')=='gtdo-v2-2.00.body')
  b=[body.matrix_world@Vector(v) for v in body.bound_box]
  self.assertAlmostEqual(max(v.y for v in b)-min(v.y for v in b),.197,places=5)
 def test_keyed_optical_mouth_has_physical_shoulders(self):
  for a in [o for o in bpy.context.scene.objects if o.get('connector_family')=='lc_duplex_sfp']:
   shoulders=[o for o in a.children if 'key_shoulder' in o.get('sid','')]
   slots=[o for o in a.children if o.get('interface_feature')=='key_slot']
   self.assertEqual(len(shoulders),4);self.assertEqual(len(slots),2)
   for o in shoulders:self.assertGreater(o.location.y,0)
 def test_gt_labels_do_not_overlap_link_leds(self):
  for i in [1,2]:
   label=next(o for o in bpy.context.scene.objects if o.get('sid')=='gtdo-v2-2.00.gt_label'+str(i))
   led=next(o for o in bpy.context.scene.objects if o.get('sid')=='gtdo-v2-2.00.link_led'+str(i))
   def bounds(o):
    vs=[o.matrix_world@Vector(v) for v in o.bound_box];return [(min(v[j] for v in vs),max(v[j] for v in vs)) for j in [0,1]]
   a,b=bounds(label),bounds(led);overlap=[max(0,min(a[j][1],b[j][1])-max(a[j][0],b[j][0])) for j in [0,1]]
   self.assertFalse(all(x>.00005 for x in overlap),'GT label overlaps its link LED')
 def test_all_printed_annotations_unobstructed_in_top_projection(self):
  names=['gt_label1','gt_label2','dip_on','card_id','board_model','maker_plain','power_label','error_labelCONFIG ERROR','error_labelRUN ERROR']+['dip_label'+str(i) for i in range(1,9)]+['bank_label_'+str(i) for i in range(8)]
  ids={'gtdo-v2-2.00.'+n for n in names};ids.update(o.get('sid') for o in bpy.context.scene.objects if ('.bank' in o.get('sid','') and '.label' in o.get('sid','')) or '.power1.contact_label' in o.get('sid',''));labels=[o for o in bpy.context.scene.objects if o.get('sid') in ids]
  self.assertEqual(len(labels),109)
  def bounds(o):
   v=[o.matrix_world@Vector(x) for x in o.bound_box];return [(min(p[j] for p in v),max(p[j] for p in v)) for j in range(3)]
  solids=[(o,bounds(o)) for o in bpy.context.scene.objects if o.type=='MESH' and o.get('sid') not in ids]
  for o in labels:
   a=bounds(o)
   for t,b in solids:
    if b[2][1]<a[2][0]+.0001:continue
    overlap=[min(a[j][1],b[j][1])-max(a[j][0],b[j][0]) for j in [0,1]]
    self.assertFalse(all(x>.0001 for x in overlap),o.name+' obscured by '+t.name)
 def test_no_source_bitmap(self):self.assertFalse([x for x in bpy.data.images if x.source=='FILE'])
if __name__=='__main__':
 r=unittest.TextTestRunner(verbosity=2).run(unittest.defaultTestLoader.loadTestsFromTestCase(PhysicalGTDO))
 if not r.wasSuccessful():raise RuntimeError('GTDO actual geometry failed')
