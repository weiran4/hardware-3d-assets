import json,unittest
from pathlib import Path
P=Path(__file__).resolve().parents[1]
class ManifestContract(unittest.TestCase):
 def setUp(self):
  self.assertTrue((P/'metadata/ports.json').exists(),'new manifest required')
  self.d=json.loads((P/'metadata/ports.json').read_text());self.p={p['id'].rsplit('.',1)[-1]:p for p in self.d['ports']}
 def test_ribbon_counts_and_outward_key(self):
  for key,n in [('hv',25),('lv',17)]:
   p=self.p[key];self.assertEqual(p['contact_rows'],2);self.assertEqual(p['contacts_per_row'],n);self.assertEqual(p['visible_contact_count'],2*n);self.assertEqual(p['normal'],[0,0,1]);self.assertEqual(p['keyed_up'],[1,0,0])
 def test_capped_ports_have_no_exposed_contacts(self):
  for k in ['gt1','gt2']:
   p=self.p[k];self.assertEqual(p['population'],'black_dust_cap_on');self.assertEqual(p['visible_contact_count'],0);self.assertFalse(p['insertion_animation_ready'])
 def test_power_no_spatial_pinout(self):
  for k in ['power1','power2']:
   p=self.p[k];self.assertEqual(p['visible_contact_count'],4);self.assertEqual(p['contact_labels'],[None]*4);self.assertCountEqual(p['unordered_functions'],['+24V','GND','GND','NC'])
  self.assertEqual(self.p['hv5v']['visible_contact_count'],2);self.assertEqual(self.p['hv5v']['contact_labels'],[None]*2)
 def test_no_compatibility_or_fabricated_service_claim(self):
  for p in self.p.values():self.assertFalse(p['validated_mating']);self.assertEqual(p['physical_compatibility'],'unknown');self.assertFalse(p['insertion_animation_ready'])
  for k in ['service_header','service_receptacle']:self.assertIsNone(self.p[k]['visible_contact_count']);self.assertFalse(self.p[k]['interactive'])
 def test_revision_and_lv_only_numbering(self):
  self.assertEqual(self.d['pcb_revision'],'2.01');self.assertEqual(self.p['lv']['observed_end_marks'],{'board_footer_outer':'1','board_footer_inner':'2'});self.assertEqual(self.p['hv']['observed_end_marks'],{})
 def test_public_sources_are_generic_and_printed_page_based(self):
  s=json.dumps(self.d)
  for forbidden in ['pdf_pages','/workspace/','Library','sha256','private-source','file_']:self.assertNotIn(forbidden,s)
  for p in self.p.values():self.assertTrue(p['evidence'][0]['printed_pages'])
if __name__=='__main__':unittest.main()
