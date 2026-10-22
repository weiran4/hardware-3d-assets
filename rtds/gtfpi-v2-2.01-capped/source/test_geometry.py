"""Physical evidence tests for native saved master and actual GLB import."""
import bpy,json,unittest,hashlib
from pathlib import Path
from mathutils import Vector
P=Path(__file__).resolve().parents[1];A=P.name
class PhysicalGTFPI(unittest.TestCase):
 def setUp(self):self.obs={o.get('sid'):o for o in bpy.context.scene.objects if o.get('sid')};self.ports=json.loads((P/'metadata/ports.json').read_text())['ports']
 def test_complete_anchors_and_contact_geometry(self):
  self.assertEqual({o['sid'] for o in self.obs.values() if o.get('kind')=='anchor'},{p['id'] for p in self.ports})
  for p in self.ports:
   a=self.obs[p['id']];cs=[o for o in a.children_recursive if o.get('interface_feature')=='contact'];self.assertEqual(len(cs),p['visible_contact_count'] or 0,p['id'])
   self.assertLess((a.matrix_world.translation-Vector(p['position_m'])).length,1e-5)
   self.assertGreater((a.matrix_world.to_quaternion()@Vector((0,0,1))).dot(Vector(p['normal'])),.99999)
   self.assertGreater((a.matrix_world.to_quaternion()@Vector((0,1,0))).dot(Vector(p['keyed_up'])),.99999)
 def test_two_rows_and_outward_physical_key_gap(self):
  for pid,n in [('hv',25),('lv',17)]:
   a=self.obs[A+'.'+pid];cs=[o for o in a.children_recursive if o.get('interface_feature')=='contact'];self.assertEqual(len(cs),n*2)
   ys=sorted(set(round((a.matrix_world.inverted()@c.matrix_world.translation).y,5) for c in cs));self.assertEqual(ys,[-.00127,.00127])
   walls=[o for o in a.children_recursive if o.get('interface_feature')=='ribbon_outer_wall'];self.assertEqual(len(walls),2)
   for o in walls:
    vs=[a.matrix_world.inverted()@o.matrix_world@Vector(v) for v in o.bound_box];self.assertGreater(min(v.y for v in vs),.003);self.assertTrue(max(v.x for v in vs)<-.0019 or min(v.x for v in vs)>.0019)
   # Real central notch free at top; opposite wall remains continuous.
   dep=bpy.context.evaluated_depsgraph_get()
   pt=a.matrix_world@Vector((0,.0042,.001));hit,*_=bpy.context.scene.ray_cast(dep,pt,Vector((0,0,-1)),distance=.003)
   self.assertFalse(hit,'central outer key gap must be physically open')
 def test_all_contact_tips_unoccluded(self):
  dep=bpy.context.evaluated_depsgraph_get()
  for o in self.obs.values():
   if o.get('interface_feature')!='contact':continue
   pt=o.matrix_world.translation;hit,loc,n,ix,ob,ma=bpy.context.scene.ray_cast(dep,pt+Vector((0,0,.05)),Vector((0,0,-1)),distance=.051)
   self.assertTrue(hit);self.assertEqual(ob.get('sid'),o.get('sid'),o.name+' blocked by '+ob.name)
 def test_gt_caps_not_invented_uncovered_connectors(self):
  for i in [1,2]:
   a=self.obs[A+'.gt'+str(i)];self.assertEqual(a.get('connector_family'),'observed_capped_sfp');self.assertEqual(len([o for o in a.children_recursive if o.get('interface_feature')=='dust_cap']),1)
   self.assertFalse([o for o in a.children_recursive if o.get('interface_feature') in {'contact','ferrule_bore','optical_inner_socket'}])
 def test_green_header_has_observed_twin_lobe_inner_wall(self):
  a=self.obs[A+'.hv5v'];walls=[o for o in a.children_recursive if o.get('interface_feature')=='two_lobe_inner_wall'];self.assertEqual(len(walls),1,'green mouth must not be a plain rectangle')
  vs=[v.co for v in walls[0].data.vertices];center=max(v.x for v in vs if abs(v.y)<.0001)
  for y in [-.003,.003]:
   lobe=max(v.x for v in vs if abs(v.y-y)<.0001);self.assertGreater(center-lobe,.001,'two observed scallops must be physical geometry')
 def test_power_poles_unlabelled_and_green_not_screws(self):
  self.assertFalse([o for o in self.obs.values() if 'contact_label' in o['sid']]);a=self.obs[A+'.hv5v'];self.assertFalse([o for o in a.children_recursive if o.get('interface_feature')=='slotted_screw'])
 def test_board_connected_assemblies(self):
  seated=[o for o in self.obs.values() if o.get('seated_on_pcb')];self.assertGreaterEqual(len(seated),15)
  for o in seated:self.assertAlmostEqual(min((o.matrix_world@Vector(v)).z for v in o.bound_box),.0076,places=5,msg=o.name)
  core=self.obs[A+'.heatsink_core'];top=max((core.matrix_world@Vector(v)).z for v in core.bound_box)
  for o in self.obs.values():
   if o.get('interface_feature')=='heatsink_fin':self.assertLessEqual(min((o.matrix_world@Vector(v)).z for v in o.bound_box),top+.00001)
 def test_all_pins_reach_own_connector_base(self):
  for p in self.ports:
   if p['group'] not in {'ribbon_header','power','aux_power'}:continue
   a=self.obs[p['id']];base=self.obs[p['id']+'.base'];top=max((base.matrix_world@Vector(v)).z for v in base.bound_box)
   for o in a.children_recursive:
    if o.get('interface_feature')=='contact':self.assertLessEqual(min((o.matrix_world@Vector(v)).z for v in o.bound_box),top+.00001,o.name+' must reach own base, not just shroud AABB')
 def test_every_physical_component_connected_to_pcb_or_carrier(self):
  # Full physical component graph, excluding only printed ink; no self-reported seating subset.
  parts=[o for o in self.obs.values() if o.type=='MESH' and o.get('interface_feature')!='printed_label'];bounds={o['sid']:([min((o.matrix_world@Vector(v))[k] for v in o.bound_box) for k in range(3)],[max((o.matrix_world@Vector(v))[k] for v in o.bound_box) for k in range(3)]) for o in parts};known={A+'.body',A+'.carrier'};pending=set(bounds)-known
  while True:
   reached={p for p in pending if any(all(min(bounds[p][1][k],bounds[q][1][k])-max(bounds[p][0][k],bounds[q][0][k])>=-.000015 for k in range(3)) for q in known)}
   if not reached:break
   known|=reached;pending-=reached
  self.assertFalse(pending,'Unconnected physical bounds: '+str(sorted(pending)))
 def test_dip_and_status_counts(self):
  for feature in ['dip_switch','status_led']:self.assertEqual(len([o for o in self.obs.values() if o.get('interface_feature')==feature]),8)
 def test_all_annotation_glyphs_visible(self):
  labels=[o for o in self.obs.values() if o.type=='FONT' or o.get('interface_feature')=='printed_label'];self.assertGreaterEqual(len(labels),20)
  deps=bpy.context.evaluated_depsgraph_get();blocked=[];samples=0
  for o in labels:
   ev=o.evaluated_get(deps);me=ev.to_mesh();me.calc_loop_triangles();bad=set();normal=o.matrix_world.to_quaternion()@Vector((0,0,1))
   for tri in me.loop_triangles:
    pts=[o.matrix_world@me.vertices[i].co for i in tri.vertices];ctr=sum(pts,Vector())/3
    for pt in [ctr]+[v*.8+ctr*.2 for v in pts]:
     samples+=1;hit,loc,n,ix,ob,ma=bpy.context.scene.ray_cast(deps,pt+normal*.06,-normal,distance=.061)
     if hit and ob.get('sid')!=o.get('sid') and (loc-pt).dot(normal)>.00005:bad.add(ob.get('sid'))
   ev.to_mesh_clear()
   if bad:blocked.append({'label':o['sid'],'occluders':sorted(bad)})
  kind='native' if any(o.type=='FONT' for o in labels) else 'glb'
  d={'asset_id':A,'status':'FAIL' if blocked else 'PASS','scope':'Every annotation glyph triangle centroid and three inset-vertex rays along label normal','label_count':len(labels),'sample_count':samples,'blocked':blocked}
  for fn in ['source/asset.blend','exports/asset.glb']:
   if (P/fn).exists():d[fn+'_sha256']=hashlib.sha256((P/fn).read_bytes()).hexdigest()
  (P/'qa'/('label-visibility-'+kind+'.json')).write_text(json.dumps(d,indent=2)+'\n');self.assertFalse(blocked,json.dumps(blocked))
 def test_no_source_bitmap_or_external_resources(self):
  self.assertFalse([im for im in bpy.data.images if im.source=='FILE']);self.assertFalse(list(bpy.data.libraries))
if __name__=='__main__':
 r=unittest.TextTestRunner(verbosity=2).run(unittest.defaultTestLoader.loadTestsFromTestCase(PhysicalGTFPI))
 if not r.wasSuccessful():raise RuntimeError('GTFPI geometry regression failed')
