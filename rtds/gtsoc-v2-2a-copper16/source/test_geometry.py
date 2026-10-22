"""Independent actual native/GLB physical checks, not metadata-only assertions."""
import bpy,sys,json,unittest,hashlib
from pathlib import Path
from mathutils import Vector
P=Path(__file__).resolve().parents[1];A=P.name
class PhysicalGTSOC(unittest.TestCase):
 def objects(self):return [o for o in bpy.context.scene.objects if o.get('sid')]
 def anchors(self):return {o['sid']:o for o in self.objects() if o.get('kind')=='anchor'}
 def test_exact_physical_contacts_and_frames(self):
  recs=json.loads((P/'metadata/ports.json').read_text())['ports'];an=self.anchors();self.assertEqual(set(an),{p['id'] for p in recs})
  for p in recs:
   a=an[p['id']];self.assertEqual(json.loads(a['port_record']),p);self.assertLess((a.matrix_world.translation-Vector(p['position_m'])).length,1e-6)
   q=a.matrix_world.to_quaternion();self.assertGreater((q@Vector((0,0,1))).dot(Vector(p['normal'])),.9999);self.assertGreater((q@Vector((0,1,0))).dot(Vector(p['keyed_up'])),.9999)
   cs=[o for o in a.children_recursive if o.get('interface_feature')=='contact'];self.assertEqual(len(cs),p['visible_contact_count'],p['id'])
 def test_physical_key_direction_and_order(self):
  an=self.anchors()
  for i in range(1,17):
   a=an[A+'.front'+str(i)];key=next(o for o in a.children if o.get('interface_feature')=='key_slot');cs=[o for o in a.children if o.get('interface_feature')=='contact']
   self.assertGreater(key.location.y,0);self.assertTrue(all(c.location.y<0 for c in cs));self.assertGreater((key.matrix_world.translation.z-a.matrix_world.translation.z)*(1 if i%2 else -1),0)
   self.assertEqual(len([o for o in a.children if o.get('interface_feature')=='key_shoulder']),2)
   if i<15 and i%2:self.assertLess(a.matrix_world.translation.x,an[A+'.front'+str(i+2)].matrix_world.translation.x)
  self.assertGreater(an[A+'.rear1'].matrix_world.translation.x,an[A+'.rear3'].matrix_world.translation.x)
 def test_all_contacts_and_optical_faces_unoccluded(self):
  d=bpy.context.evaluated_depsgraph_get()
  for a in self.anchors().values():
   n=a.matrix_world.to_quaternion()@Vector((0,0,1))
   for o in a.children_recursive:
    if o.get('interface_feature') not in ['contact','observed_white_face']:continue
    samples=[Vector((0,0,0))]
    if o.get('interface_feature')=='observed_white_face':samples=[Vector((dx*.0022,dy*.0022,0)) for dx,dy in [(1,0),(-1,0),(0,1),(0,-1)]]
    for loc in samples:
     pt=o.matrix_world@loc;hit,at,no,ix,ob,ma=bpy.context.scene.ray_cast(d,pt+n*.03,-n,distance=.04)
     self.assertTrue(hit,o.name);self.assertEqual(ob.get('sid'),o.get('sid'),o.name+' blocked by '+ob.name)
 def test_every_key_slot_has_outward_clearance(self):
  d=bpy.context.evaluated_depsgraph_get();blocked=[]
  for a in self.anchors().values():
   n=a.matrix_world.to_quaternion()@Vector((0,0,1))
   for o in a.children_recursive:
    if o.get('interface_feature')!='key_slot':continue
    pt=o.matrix_world.translation;hit,at,no,ix,ob,ma=bpy.context.scene.ray_cast(d,pt+n*.03,-n,distance=.04)
    if not hit or ob.get('sid')!=o.get('sid'):blocked.append((o.name,ob.name if hit else 'no hit'))
  self.assertFalse(blocked,str(blocked))
 def test_rear_optical_observed_exterior_not_invented_contacts(self):
  for i in range(1,5):
   a=self.anchors()[A+'.rear'+str(i)]
   self.assertEqual(len([o for o in a.children if o.get('interface_feature')=='observed_white_face']),2)
   self.assertEqual(len([o for o in a.children if o.get('interface_feature')=='neutral_filled_center']),2)
   self.assertFalse([o for o in a.children if o.get('interface_feature')=='contact'])
   self.assertEqual(len([o for o in a.children if o.get('interface_feature')=='key_slot']),2)
 def test_chassis_and_all_connector_mounts_attached(self):
  obs={o['sid']:o for o in self.objects()};self.assertIn(A+'.body',obs);self.assertIn(A+'.front_panel',obs);self.assertIn(A+'.rear_panel',obs)
  for a in self.anchors().values():
   supports=[o for o in a.children if o.get('interface_feature')=='mount_support'];self.assertTrue(supports,a.name)
   for o in supports:
    pts=[o.matrix_world@Vector(v) for v in o.bound_box];lo=min(v.y for v in pts);hi=max(v.y for v in pts)
    plane=.150 if a.location.y>0 else -.150;self.assertLessEqual(lo,plane+.001);self.assertGreaterEqual(hi,plane-.001)
  # All non-port chassis components touch at least one shell/panel component in AABB space.
  structural=[o for o in self.objects() if o.get('chassis_structure')];self.assertGreaterEqual(len(structural),3)
  def bound(o):
   ps=[o.matrix_world@Vector(v) for v in o.bound_box];return [[min(p[i] for p in ps),max(p[i] for p in ps)] for i in range(3)]
  bounds={o.name:bound(o) for o in structural};seen={structural[0].name}
  for _ in structural:
   for o in structural:
    if o.name in seen:continue
    if any(all(bounds[o.name][i][0]<=bounds[s][i][1]+.0001 and bounds[s][i][0]<=bounds[o.name][i][1]+.0001 for i in range(3)) for s in seen):seen.add(o.name)
  self.assertEqual(len(seen),len(structural))
 def test_mount_collars_intersect_actual_panel_geometry(self):
  obs={o['sid']:o for o in self.objects()}
  for a in self.anchors().values():
   panel=obs[A+('.rear_panel' if a.location.y>0 else '.front_panel')];n=a.matrix_world.to_quaternion()@Vector((0,0,1));collars=[o for o in a.children if o.get('interface_feature')=='panel_collar'];self.assertEqual(len(collars),4,a.name);supported=0
   for c in collars:
    axis=int(c['collar_outside_axis']);sign=int(c['collar_outside_sign']);offset=Vector((0,0,0));offset[axis]=sign*.00005;pt=c.matrix_world@offset
    inv=panel.matrix_world.inverted();direction=(inv.to_3x3()@(-n)).normalized();hit,loc,normal,index=panel.ray_cast(inv@(pt+n*.02),direction,distance=.04)
    if not hit:continue # Contiguous multiport openings share the outer mounting boundary.
    supported+=1
    contact=c.matrix_world.inverted()@(panel.matrix_world@loc)
    for i in range(3):self.assertGreaterEqual(contact[i],min(v.co[i] for v in c.data.vertices)-.00001);self.assertLessEqual(contact[i],max(v.co[i] for v in c.data.vertices)+.00001)
   self.assertGreaterEqual(supported,2,a.name+' requires two real-panel attachment sides')
 def test_each_metal_contact_base_is_in_real_insulator(self):
  # Exact base point against a solid cuboid carrier; shell AABBs are not accepted.
  for a in self.anchors().values():
   family=a.get('connector_family');suffix='contact_carrier' if family in ['copper_sfp_visual','ethernet_visual'] else ('tongue' if family=='usb_b_shaped_visual' else 'well')
   cs=[o for o in a.children if o.get('interface_feature')=='contact']
   if not cs:continue
   base=next((o for o in a.children if o.get('sid','').endswith('.'+suffix)),None);self.assertIsNotNone(base,a.name+' missing solid contact support')
   self.assertEqual(len({tuple(round(x,7) for x in v.co) for v in base.data.vertices}),8,base.name+' support must be actual cuboid, not enclosing shell')
   lo=[min(v.co[i] for v in base.data.vertices) for i in range(3)];hi=[max(v.co[i] for v in base.data.vertices) for i in range(3)]
   for c in cs:
    z=min(v.co.z for v in c.data.vertices);point=base.matrix_world.inverted()@(c.matrix_world@Vector((0,0,z)))
    self.assertTrue(all(lo[i]-.00001<=point[i]<=hi[i]+.00001 for i in range(3)),c.name+' base is unsupported')
 def test_each_connector_is_one_connected_assembly(self):
  # Per-piece bounds, not the enclosing empty anchor or whole chassis bounding box.
  disconnected=[]
  for a in self.anchors().values():
   obs=[o for o in a.children_recursive if o.type=='MESH'];bounds={}
   for o in obs:
    ps=[o.matrix_world@Vector(v) for v in o.bound_box];bounds[o.name]=[[min(p[i] for p in ps),max(p[i] for p in ps)] for i in range(3)]
   seen={o.name for o in obs if o.get('interface_feature')=='mount_support'};self.assertTrue(seen)
   for _ in obs:
    for o in obs:
     if o.name in seen:continue
     if any(all(bounds[o.name][i][0]<=bounds[k][i][1]+.00002 and bounds[k][i][0]<=bounds[o.name][i][1]+.00002 for i in range(3)) for k in seen):seen.add(o.name)
   if set(bounds)!=seen:disconnected += sorted(set(bounds)-seen)
  self.assertFalse(disconnected,str(disconnected))
 def test_every_annotation_glyph_unoccluded(self):
  labels=[o for o in self.objects() if o.get('surface_annotation')];self.assertGreaterEqual(len(labels),29)
  d=bpy.context.evaluated_depsgraph_get();blocked=[];samples=0
  for o in labels:
   n=o.matrix_world.to_quaternion()@Vector((0,0,1));ev=o.evaluated_get(d);me=ev.to_mesh();me.calc_loop_triangles();oc=set()
   for tri in me.loop_triangles:
    vs=[o.matrix_world@me.vertices[i].co for i in tri.vertices];center=sum(vs,Vector())/3
    for pt in [center]+[v*.8+center*.2 for v in vs]:
     samples+=1;hit,at,no,ix,ob,ma=bpy.context.scene.ray_cast(d,pt+n*.03,-n,distance=.031)
     if hit and ob.get('sid')!=o.get('sid') and (at-pt).dot(n)>.00004:oc.add(ob.get('sid',ob.name))
   ev.to_mesh_clear()
   if oc:blocked.append({'label':o['sid'],'occluders':sorted(oc)})
  kind='native' if any(o.type=='FONT' for o in labels) else 'glb';report={'status':'PASS' if not blocked else 'FAIL','annotation_count':len(labels),'exact_glyph_triangle_samples':samples,'blocked':blocked,'source_blend_sha256':hashlib.sha256((P/'source/asset.blend').read_bytes()).hexdigest(),'source_glb_sha256':hashlib.sha256((P/'exports/asset.glb').read_bytes()).hexdigest()}
  (P/'qa'/('labels-'+kind+'.json')).write_text(json.dumps(report,indent=2)+'\n');self.assertFalse(blocked,json.dumps(blocked))
 def test_no_source_bitmaps_and_port_apertures(self):
  self.assertFalse([im for im in bpy.data.images if im.source=='FILE'])
  d=bpy.context.evaluated_depsgraph_get()
  for a in self.anchors().values():
   n=a.matrix_world.to_quaternion()@Vector((0,0,1));q=a.matrix_world.to_quaternion()
   for xy in [(-.002,.001),(.002,.001)]:
    pt=a.matrix_world.translation+q@Vector((*xy,0));hit,at,no,ix,ob,ma=bpy.context.scene.ray_cast(d,pt+n*.015,-n,distance=.03)
    self.assertTrue(hit,a.name);self.assertFalse(ob.get('sid','').endswith(('.front_panel','.rear_panel','.body')),a.name+' aperture blocked by chassis')
if __name__=='__main__':
 r=unittest.TextTestRunner(verbosity=2).run(unittest.defaultTestLoader.loadTestsFromTestCase(PhysicalGTSOC))
 if not r.wasSuccessful():raise RuntimeError('GTSOC physical validation failed')
