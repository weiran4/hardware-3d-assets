import unittest,json,pathlib
P=pathlib.Path(__file__).resolve().parents[1]/'metadata/ports.json'
class GTDOManifest(unittest.TestCase):
 def setUp(self):
  self.assertTrue(P.exists(),'source-driven GTDO manifest is missing');self.d=json.loads(P.read_text());self.p=self.d['ports']
 def test_evidence_ids_resolve(self):
  refs=json.loads((P.parents[1]/'references/manifest.json').read_text());ids={s['id'] for s in refs['sources']}
  for port in self.p:
   for evidence in port['evidence']:self.assertIn(evidence['source_id'],ids)
 def test_version_not_legacy(self):
  self.assertEqual(self.d['hardware_version'],'GTDO V2');self.assertEqual(self.d['pcb_revision'],'2.00')
 def test_terminal_banks_and_channels(self):
  p=[x for x in self.p if x['group']=='digital_output'];self.assertEqual(len(p),16)
  self.assertEqual(sum(x['visible_contact_count'] for x in p),80)
  channels=[]
  for b in range(1,9):
   pair=[x for x in p if x['bank']==b];self.assertEqual(len(pair),2)
   odd=next(x for x in pair if x['tier']=='odd');even=next(x for x in pair if x['tier']=='even')
   self.assertEqual(odd['contact_labels'],[str((b-1)*8+i) for i in [1,3,5,7]]+['V+'])
   self.assertEqual(even['contact_labels'],[str((b-1)*8+i) for i in [2,4,6,8]]+['V-'])
   channels+=odd['contact_labels'][:4]+even['contact_labels'][:4]
  self.assertEqual(sorted(map(int,channels)),list(range(1,65)))
 def test_power_and_optics(self):
  power=[x for x in self.p if x['group']=='power'];self.assertEqual(len(power),2)
  for x in power:self.assertEqual(x['visible_contact_count'],4)
  self.assertEqual(next(x for x in power if x['label']=='POWER 1')['contact_labels'],['+24V','GND','GND','NC'])
  self.assertEqual(next(x for x in power if x['label']=='POWER 2')['contact_labels'],[None]*4)
  optic=[x for x in self.p if x['group']=='optical'];self.assertEqual(len(optic),2)
  self.assertEqual({x['label'] for x in optic},{'GT1','GT2'})
  self.assertTrue(all(x['normal']==[-1,0,0] for x in optic))
 def test_plug_dimensions_and_limits(self):
  for p in self.p:
   self.assertFalse(p['validated_mating']);self.assertEqual(p['physical_compatibility'],'unknown');self.assertTrue(p['evidence'])
   if p['group']=='digital_output':
    self.assertEqual(p['plug_part_number'],'1803604');self.assertEqual(p['pitch_mm'],3.81);self.assertEqual(p['plug_dimensions_mm_W_H_L'],[19.84,11.1,16.1])
 def test_unresolved_service_never_claims_pinout(self):
  for p in self.p:
   if p['group']=='service_unresolved':
    self.assertIsNone(p['visible_contact_count']);self.assertFalse(p['interactive']);self.assertEqual(p['accuracy']['contact_geometry'],'unresolved_not_modelled')
if __name__=='__main__':unittest.main()
