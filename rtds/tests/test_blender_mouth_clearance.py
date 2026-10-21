"""Ray-cast actual visible contact surfaces to catch opaque panels blocking mouths."""
import bpy,unittest
from mathutils import Vector
class MouthClearance(unittest.TestCase):
 def test_all_optical_contact_rims_visible_from_outside(self):
  bpy.context.view_layer.update();d=bpy.context.evaluated_depsgraph_get()
  fibres=[a for a in bpy.context.scene.objects if a.get('connector_family')=='lc_duplex_sfp']
  self.assertEqual(len(fibres),31)
  for a in fibres:
   for c in [o for o in a.children if o.get('interface_feature')=='contact']:
    normal=c.matrix_world.to_quaternion()@Vector((0,0,1))
    for x,y in [(.00085,0),(-.00085,0),(0,.00085),(0,-.00085)]:
     origin=c.matrix_world@Vector((x,y,.05))
     hit,loc,n,idx,obj,mat=bpy.context.scene.ray_cast(d,origin,-normal,distance=.06)
     self.assertTrue(hit,c.name)
     self.assertEqual(obj.get('sid'),c.get('sid'),f'{c.name} occluded by {obj.name}')
 def test_front_light_jack_clear_of_side_edge(self):
  jack=bpy.data.objects.get('novacor-2.0-2023.front_led_power')
  self.assertIsNotNone(jack)
  self.assertLess(jack.location.x+.0045,.221)
if __name__=='__main__':
 result=unittest.TextTestRunner(verbosity=2).run(unittest.defaultTestLoader.loadTestsFromTestCase(MouthClearance))
 if not result.wasSuccessful():raise RuntimeError('Mouth clearance test failed')
