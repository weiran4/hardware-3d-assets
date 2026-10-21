import unittest,json
from pathlib import Path
P=Path(__file__).resolve().parents[1]
class Manifest(unittest.TestCase):
 def setUp(self):
  self.assertTrue((P/'metadata/ports.json').exists(),'version-pinned manifest missing')
  self.m=json.loads((P/'metadata/ports.json').read_text()); self.p=self.m['ports']
 def test_revision(self):
  self.assertEqual(self.m['pcb_revision'],'2.20');self.assertEqual(self.m['hardware_version'],'GTAO V2')
 def test_sixteen_two_contact_outputs(self):
  a=[p for p in self.p if p['group']=='analog_output'];self.assertEqual(len(a),16)
  self.assertEqual([p['channel'] for p in a],list(range(1,17)))
  for p in a:
   self.assertEqual(p['visible_contact_count'],2);self.assertEqual(p['contact_labels'],['+','RETURN']);self.assertEqual(p['pitch_mm'],3.81);self.assertEqual(p['plug_part_number'],'1803578')
  self.assertTrue(all(a[i]['position_m'][1]>a[i+1]['position_m'][1] for i in range(15)))
 def test_terminal_array_span_matches_figure(self):
  a=[p for p in self.p if p['group']=='analog_output'];self.assertAlmostEqual(a[-1]['position_m'][1],-.079,places=5)
 def test_secondary_ports(self):
  self.assertEqual(len([p for p in self.p if p['group']=='power']),2);self.assertEqual(len([p for p in self.p if p['group']=='optical']),2)
  self.assertEqual(len(self.p),22)
 def test_unknowns_not_certified(self):
  for p in self.p:self.assertFalse(p['validated_mating']);self.assertEqual(p['physical_compatibility'],'unknown')
  for p in self.p:
   if p['group']=='service_unresolved':self.assertIsNone(p['visible_contact_count']);self.assertFalse(p['interactive'])
if __name__=='__main__':unittest.main()
