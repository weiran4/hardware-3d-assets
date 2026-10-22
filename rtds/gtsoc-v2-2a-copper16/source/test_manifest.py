import unittest,importlib.util,math
from pathlib import Path
P=Path(__file__).parent
class Manifest(unittest.TestCase):
 def manifest(self):
  self.assertTrue((P/'manifest.py').is_file(),'source-grounded manifest builder missing')
  spec=importlib.util.spec_from_file_location('gtsoc_manifest',P/'manifest.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m.build_manifest()
 def test_exact_inventory(self):
  m=self.manifest();p=m['ports'];self.assertEqual(len(p),25);self.assertEqual(len(set(x['id'] for x in p)),25)
  self.assertEqual(m['model_plate'],'GTSOC-2A');self.assertEqual(m['front_population'],'16 copper RJ45 SFP modules')
  groups={g:[x for x in p if x['group']==g] for g in ['front_sfp','service','rear_optical','rear_eth','ac_power']}
  self.assertEqual([len(x) for x in groups.values()],[16,3,4,1,1])
  self.assertTrue(all(x['visible_contact_count']==8 for x in groups['front_sfp']+groups['rear_eth']))
  self.assertTrue(all(x['visible_contact_count']==4 for x in groups['service']))
  self.assertTrue(all(x['visible_contact_count']==0 and x['visible_face_feature_count']==2 and x['cap_status']=='unknown' for x in groups['rear_optical']))
 def test_source_order_and_no_certification(self):
  p=self.manifest()['ports'];front=[x for x in p if x['group']=='front_sfp'];rear=[x for x in p if x['group']=='rear_optical']
  for x in front+rear:self.assertEqual(x['keyed_up'],[0,0,1 if x['channel']%2 else -1])
  for a,b in zip(front[::2],front[2::2]):self.assertLess(a['position_m'][0],b['position_m'][0])
  self.assertGreater(rear[0]['position_m'][0],rear[2]['position_m'][0])
  self.assertTrue(all(x['physical_compatibility']=='unknown' and not x['validated_mating'] and not x['insertion_animation_ready'] for x in p))
  self.assertTrue(all(x['electrical_constraints'] is None for x in p))
if __name__=='__main__':unittest.main()
