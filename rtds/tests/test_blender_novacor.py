"""Run against actual saved master or reimported GLB, not builder declarations."""
import sys,json,unittest
from pathlib import Path
import bpy
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[1]; A='novacor-2.0-2023'
class NovaCorGeometry(unittest.TestCase):
 def test_anchors_and_contact_geometry(self):
  records=json.loads((ROOT/A/'metadata/ports.json').read_text())['ports']
  anchors={o.get('sid'):o for o in bpy.context.scene.objects if o.get('kind')=='anchor'}
  self.assertEqual(set(anchors),{p['id'] for p in records})
  for p in records:
   a=anchors[p['id']]
   self.assertLess((a.matrix_world.translation-Vector(p['position_m'])).length,1e-5)
   self.assertGreater((a.matrix_world.to_quaternion()@Vector((0,0,1))).dot(Vector(p['normal'])),.9999)
   self.assertGreater((a.matrix_world.to_quaternion()@Vector((0,1,0))).dot(Vector(p['keyed_up'])),.9999)
   contacts=[o for o in a.children_recursive if o.get('interface_feature')=='contact']
   self.assertEqual(len(contacts),p['visible_contact_count'],p['id'])
   self.assertTrue(all(o.type=='MESH' and len(o.data.polygons)>0 for o in contacts))
 def test_fibre_key_slots_are_physical_and_flip(self):
  fibres=[o for o in bpy.context.scene.objects if o.get('connector_family')=='lc_duplex_sfp']
  self.assertEqual(len(fibres),31)
  for a in fibres:
   slots=[o for o in a.children_recursive if o.get('interface_feature')=='key_slot']
   self.assertEqual(len(slots),2)
   self.assertTrue(all(o.location.y>0 for o in slots))
 def test_copper_keyed_mouth_geometry(self):
  copper=[o for o in bpy.context.scene.objects if o.get('connector_family') in ['copper_sfp','8p8c']]
  self.assertEqual(len(copper),2)
  for a in copper:
   slots=[o for o in a.children if o.get('interface_feature')=='key_slot']
   shoulders=[o for o in a.children if o.get('interface_feature')=='key_shoulder']
   contacts=[o for o in a.children if o.get('interface_feature')=='contact']
   self.assertEqual(len(shoulders),2)
   self.assertGreater(slots[0].location.y,0)
   self.assertTrue(all(o.location.y<0 for o in contacts))
 def test_no_textures_and_no_bnc_lugs(self):
  self.assertFalse([im for im in bpy.data.images if im.source=='FILE'])
  self.assertFalse([o for o in bpy.context.scene.objects if 'bnc' in o.name.lower()])
 def test_envelope(self):
  pts=[]; d=bpy.context.evaluated_depsgraph_get()
  for o in bpy.context.scene.objects:
   if not o.get('sid') or o.type not in {'MESH','FONT','CURVE'}: continue
   ev=o.evaluated_get(d); me=ev.to_mesh(); pts.extend(o.matrix_world@v.co for v in me.vertices); ev.to_mesh_clear()
  self.assertTrue(pts,'No geometry')
  dims=[max(p[i] for p in pts)-min(p[i] for p in pts) for i in range(3)]
  for got,want in zip(dims,[.483,.522,.178]): self.assertAlmostEqual(got,want,places=5)
if __name__=='__main__':
 result=unittest.TextTestRunner(verbosity=2).run(unittest.defaultTestLoader.loadTestsFromTestCase(NovaCorGeometry))
 if not result.wasSuccessful(): raise RuntimeError('NovaCor geometry checks failed')
