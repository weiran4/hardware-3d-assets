import bpy,sys,json,unittest
from pathlib import Path
from mathutils import Vector
P=Path(__file__).resolve().parents[1]
class PhysicalGTAI(unittest.TestCase):
 def test_all_anchors_and_actual_contacts(self):
  p=json.loads((P/'metadata/ports.json').read_text())['ports'];anchors={o.get('sid'):o for o in bpy.context.scene.objects if o.get('kind')=='anchor'}
  self.assertEqual(set(anchors),{x['id'] for x in p})
  for rec in p:
   a=anchors[rec['id']];self.assertLess((a.matrix_world.translation-Vector(rec['position_m'])).length,1e-5)
   contacts=[o for o in a.children_recursive if o.get('interface_feature')=='contact']
   self.assertEqual(len(contacts),rec['visible_contact_count'] or 0,rec['id'])
   if rec['group']=='analogue_input':
    self.assertEqual(len([o for o in a.children_recursive if o.get('interface_feature')=='slotted_screw']),3)
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
  labels=[o for o in bpy.context.scene.objects if '.input' in o.get('sid','') and '.label' in o.get('sid','')]
  self.assertEqual(len(labels),36)
  for o in labels:self.assertGreater((o.matrix_world.to_quaternion()@Vector((0,0,1))).dot(Vector((0,0,1))),.9999)
 def test_optical_contact_visibility(self):
  d=bpy.context.evaluated_depsgraph_get()
  anchors=[o for o in bpy.context.scene.objects if o.get('connector_family')=='lc_duplex_sfp'];self.assertEqual(len(anchors),2)
  for a in anchors:
   q=a.matrix_world.to_quaternion();direction=-(q@Vector((0,0,1)))
   for c in [o for o in a.children_recursive if o.get('interface_feature')=='contact']:
    for offset in [( .00085,0,0),(-.00085,0,0),(0,.00085,0),(0,-.00085,0)]:
     point=c.matrix_world@Vector(offset);start=point-direction*.03
     hit,loc,n,idx,obj,mat=bpy.context.scene.ray_cast(d,start,direction,distance=.031)
     self.assertTrue(hit);self.assertEqual(obj.get('sid'),c.get('sid'),'Optical contact is occluded by '+obj.name)
 def test_terminal_contact_visibility(self):
  d=bpy.context.evaluated_depsgraph_get()
  anchors=[o for o in bpy.context.scene.objects if o.get('connector_family')=='phoenix_1803581'];self.assertEqual(len(anchors),12)
  for a in anchors:
   direction=-(a.matrix_world.to_quaternion()@Vector((0,0,1)))
   for c in [o for o in a.children_recursive if o.get('interface_feature')=='contact']:
    point=c.matrix_world.translation;start=point-direction*.03
    hit,loc,n,idx,obj,mat=bpy.context.scene.ray_cast(d,start,direction,distance=.031)
    self.assertTrue(hit);self.assertEqual(obj.get('sid'),c.get('sid'),'Wire-entry contact is occluded by '+obj.name)
 def test_power_contacts_visible(self):
  deps=bpy.context.evaluated_depsgraph_get()
  anchors=[o for o in bpy.context.scene.objects if o.get('connector_family')=='keyed_1x4_power'];self.assertEqual(len(anchors),2)
  for a in anchors:
   direction=-(a.matrix_world.to_quaternion()@Vector((0,0,1)))
   for c in [o for o in a.children_recursive if o.get('interface_feature')=='contact']:
    hit,loc,n,idx,obj,mat=bpy.context.scene.ray_cast(deps,c.matrix_world.translation-direction*.03,direction,distance=.031)
    self.assertTrue(hit);self.assertEqual(obj.get('sid'),c.get('sid'),'Power contact hidden by '+obj.name)
 def test_unknown_lower_power_has_no_electrical_labels(self):
  self.assertFalse([o for o in bpy.context.scene.objects if '.power2.contact_label' in o.get('sid','')])
  a=next(o for o in bpy.context.scene.objects if o.get('sid')=='gtai-v2-2.31.power2');self.assertEqual(json.loads(a['port_record'])['contact_labels'],[None]*4)
 def test_terminal_headers_reach_pcb(self):
  headers=[o for o in bpy.context.scene.objects if o.get('sid','').endswith('.pcb_header')]
  self.assertEqual(len(headers),12)
  for o in headers:
   low=min((o.matrix_world@Vector(v)).z for v in o.bound_box)
   self.assertAlmostEqual(low,.0076,places=5,msg='Header must meet PCB, not float: '+o.name)
 def test_connector_housings_seated(self):
  housings=[o for o in bpy.context.scene.objects if o.get('sid','').endswith('.keyed_shroud') or (o.parent and o.parent.get('connector_family')=='unresolved_service_outline' and ('.side' in o.get('sid','') or '.edge' in o.get('sid','')))]
  self.assertEqual(len(housings),10)
  for o in housings:self.assertAlmostEqual(min((o.matrix_world@Vector(v)).z for v in o.bound_box),.0076,places=5,msg=o.name)
 def test_no_invented_power_silkscreen(self):
  labels=[o for o in bpy.context.scene.objects if '.power1.contact_label' in o.get('sid','')]
  self.assertEqual(len(labels),0)
  for o in labels:self.assertAlmostEqual(o.matrix_world.translation.z,.00775,places=5)
 def test_heatsink_core_attachment(self):
  core=next((o for o in bpy.context.scene.objects if o.get('sid')=='gtai-v2-2.31.heatsink_core'),None)
  self.assertIsNotNone(core)
  z=[(core.matrix_world@Vector(v)).z for v in core.bound_box]
  self.assertAlmostEqual(min(z),.0076,places=5);self.assertAlmostEqual(max(z),.020,places=5)
  ring=next(o for o in bpy.context.scene.objects if o.get('sid')=='gtai-v2-2.31.heatsink_top')
  top=max((ring.matrix_world@Vector(v)).z for v in ring.bound_box)
  self.assertGreater(top-max(z),.0009,'No coplanar cap/ring top overlap')
 def test_primary_components_seated_and_inside_board(self):
  for suffix in ['dip_body','id_display','reset_switch','dcdc_module1','dcdc_module2']:
   o=next(o for o in bpy.context.scene.objects if o.get('sid')=='gtai-v2-2.31.'+suffix)
   pts=[o.matrix_world@Vector(v) for v in o.bound_box]
   self.assertAlmostEqual(min(v.z for v in pts),.0076,places=5,msg=suffix+' seating')
   self.assertTrue(all(abs(v.x)<.05001 and abs(v.y)<.09001 for v in pts),suffix+' over board edge')
 def test_keyed_mouth_shoulders(self):
  anchors=[o for o in bpy.context.scene.objects if o.get('connector_family')=='lc_duplex_sfp'];self.assertEqual(len(anchors),2)
  for a in anchors:
   shoulders=[o for o in a.children_recursive if '.key_shoulder_' in o.get('sid','')]
   self.assertEqual(len(shoulders),4)
   self.assertTrue(all(o.location.y>0 for o in shoulders))
 def test_signal_label_sequence_geometric(self):
  anchors=[o for o in bpy.context.scene.objects if o.get('connector_family')=='phoenix_1803581'];self.assertEqual(len(anchors),12)
  for a in anchors:
   cs=sorted([o for o in a.children_recursive if o.get('interface_feature')=='contact'],key=lambda o:o.matrix_world.translation.y,reverse=True)
   self.assertEqual([o.get('sid').split('contact')[-1] for o in cs],['0','1','2'])
 def test_whole_board_root_mesh_seating_graph(self):
  # Root-level visible assemblies must touch the PCB/carrier or a connected support.
  # Connector-internal contacts are assessed separately by mouth/visibility tests.
  obs=[o for o in bpy.context.scene.objects if o.type=='MESH' and o.parent and o.parent.get('kind')=='root' and not o.get('surface_annotation')]
  bounds={o.get('sid'):[[min((o.matrix_world@Vector(v))[k] for v in o.bound_box) for k in range(3)],[max((o.matrix_world@Vector(v))[k] for v in o.bound_box) for k in range(3)]] for o in obs}
  connected={'gtai-v2-2.31.body','gtai-v2-2.31.carrier'};pending=set(bounds)-connected
  while pending:
   found={sid for sid in pending if any(all(bounds[sid][0][k]<=bounds[t][1][k]+.00005 and bounds[t][0][k]<=bounds[sid][1][k]+.00005 for k in range(3)) for t in connected)}
   if not found:break
   connected.update(found);pending-=found
  self.assertFalse(pending,'Unseated root meshes: '+str(sorted(pending)))
 def test_board_identity_and_port_labels_unobstructed(self):
  for suffix in ['board_model','maker_plain','gt_label1','gt_label2','power_label']:
   label=next(o for o in bpy.context.scene.objects if o.get('sid')=='gtai-v2-2.31.'+suffix)
   pts=[label.matrix_world@Vector(v) for v in label.bound_box];lo=[min(v[k] for v in pts) for k in range(3)];hi=[max(v[k] for v in pts) for k in range(3)]
   conflicts=[]
   for o in bpy.context.scene.objects:
    if o.type!='MESH' or not o.get('sid') or o.get('surface_annotation'):continue
    p=[o.matrix_world@Vector(v) for v in o.bound_box]
    if max(v.z for v in p)>hi[2]+.0001 and all(min(v[k] for v in p)<hi[k] and max(v[k] for v in p)>lo[k] for k in [0,1]):conflicts.append(o.get('sid'))
   self.assertFalse(conflicts,suffix+' silkscreen occluders: '+str(conflicts))
 def test_all_printed_annotations_visible(self):
  deps=bpy.context.evaluated_depsgraph_get()
  labels=[o for o in bpy.context.scene.objects if o.get('surface_annotation')]
  self.assertEqual(len(labels),69)
  def bounds(o):
   pts=[o.matrix_world@Vector(v) for v in o.bound_box]
   return [min(p[i] for p in pts) for i in range(3)],[max(p[i] for p in pts) for i in range(3)]
  solid=[(o,*bounds(o)) for o in bpy.context.scene.objects if o.type=='MESH' and not o.get('surface_annotation')]
  issues={}
  for label in labels:
   lo,hi=bounds(label)
   candidates=[o for o,mn,mx in solid if mx[2]>lo[2]+.0001 and all(min(hi[i],mx[i])-max(lo[i],mn[i])>.00003 for i in range(2))]
   if not candidates:continue
   ev=label.evaluated_get(deps);mesh=ev.to_mesh();mesh.calc_loop_triangles();blocked=set()
   for tri in mesh.loop_triangles:
    pt=label.matrix_world@(sum((mesh.vertices[i].co for i in tri.vertices),Vector((0,0,0)))/3)
    hit,loc,n,ix,obj,mat=bpy.context.scene.ray_cast(deps,pt+Vector((0,0,.08)),Vector((0,0,-1)),distance=.081)
    if hit and obj.get('sid')!=label.get('sid') and loc.z>pt.z+.0001:blocked.add(obj.get('sid'))
   ev.to_mesh_clear()
   if blocked:issues[label.get('sid')]=sorted(blocked)
  self.assertFalse(issues,'Annotation occlusion: '+repr(issues))
 def test_no_source_bitmap(self):self.assertFalse([x for x in bpy.data.images if x.source=='FILE'])
if __name__=='__main__':
 r=unittest.TextTestRunner(verbosity=2).run(unittest.defaultTestLoader.loadTestsFromTestCase(PhysicalGTAI))
 if not r.wasSuccessful():raise RuntimeError('GTAI actual geometry failed')
