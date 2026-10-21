import sys,unittest
from pathlib import Path
import bpy
ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT/'connectors'));sys.path.insert(0,str(ROOT.parent/'tools'));sys.path.insert(0,str(ROOT/'tools'))
from library import build_connector
from asset_common import root
from novacor_manifest import build_manifest
class EthernetKey(unittest.TestCase):
 def test_physical_latch_and_contact_match_frame(self):
  bpy.ops.wm.read_factory_settings(use_empty=True);r=root('novacor-2.0-2023')
  for p in build_manifest()['ports']:
   if p['group'] not in ['udp','wif']:continue
   a=build_connector(p,r)
   slots=[o for o in a.children if o.get('interface_feature')=='key_slot']
   contacts=[o for o in a.children if o.get('interface_feature')=='contact']
   self.assertEqual(len(slots),1);self.assertEqual(len(contacts),8)
   self.assertGreater(slots[0].location.y,0,'latch must be local +Y keyed side')
   self.assertTrue(all(o.location.y<0 for o in contacts),'contacts opposite latch')
   shoulders=[o for o in a.children if o.get('interface_feature')=='key_shoulder']
   self.assertEqual(len(shoulders),2,'stepped latch mouth requires two physical shoulders')
   self.assertTrue(all(o.location.y>0 for o in shoulders))
   self.assertLess(shoulders[0].location.x*shoulders[1].location.x,0)
if __name__=='__main__':
 result=unittest.TextTestRunner(verbosity=2).run(unittest.defaultTestLoader.loadTestsFromTestCase(EthernetKey))
 if not result.wasSuccessful():raise RuntimeError('Ethernet key test failed')
