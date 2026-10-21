import importlib.util,unittest
from pathlib import Path
P=Path(__file__).resolve().parents[1]
class ManifestTest(unittest.TestCase):
 def setUp(self):
  sp=importlib.util.spec_from_file_location('gtai_manifest',P/'source/manifest.py');m=importlib.util.module_from_spec(sp);sp.loader.exec_module(m);self.m=m.manifest();self.p=self.m['ports']
 def test_version_and_count(self):
  self.assertEqual(self.m['pcb_revision'],'2.31');self.assertEqual(len(self.p),18)
 def test_inputs(self):
  p=[x for x in self.p if x['group']=='analogue_input'];self.assertEqual(len(p),12)
  self.assertEqual([x['channel'] for x in p],list(range(1,13)))
  for x in p:self.assertEqual(x['contact_labels'],['+','-','GND']);self.assertEqual(x['visible_contact_count'],3);self.assertEqual(x['pitch_mm'],3.81);self.assertEqual(x['plug_part_number'],'1803581')
  self.assertTrue(all(a['position_m'][1]>b['position_m'][1] for a,b in zip(p,p[1:])))
 def test_power_and_optics(self):
  p=[x for x in self.p if x['group']=='power'];self.assertEqual(len(p),2);self.assertEqual(p[0]['contact_labels'],['+24V','GND','GND','NC']);self.assertEqual(p[1]['contact_labels'],[None]*4)
  o=[x for x in self.p if x['group']=='optical'];self.assertEqual(len(o),2);self.assertTrue(all(x['visible_contact_count']==2 for x in o))
 def test_unknowns_not_certified(self):
  self.assertTrue(all(not x['validated_mating'] and x['physical_compatibility']=='unknown' for x in self.p))
  s=[x for x in self.p if x['group']=='service_unresolved'];self.assertEqual(len(s),2);self.assertTrue(all(x['visible_contact_count'] is None and not x['interactive'] for x in s))
if __name__=='__main__':unittest.main()
