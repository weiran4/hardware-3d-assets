"""Version isolation and conservative release gates for the second original batch."""
import json,unittest
from pathlib import Path
P=Path(__file__).parent
class Batch2Catalog(unittest.TestCase):
 def setUp(self):self.d=json.loads((P/'manifest.json').read_text());self.v={v['id']:v for v in self.d['variants']}
 def test_exact_variants_and_deliverable_paths(self):
  for family,rev in [('gtdo','2.00'),('gtai','2.31'),('gtao','2.20')]:
   v=self.v[family+'-v2'];self.assertIn(rev,v['identity_scope']);self.assertEqual(v['release_gate']['stage'],'connector_research_candidate')
   self.assertIn(f'rtds/{family}-v2-{rev}/source/asset.blend',' '.join(v['notes']))
 def test_not_mating_or_electrical_certification(self):
  for k in ['gtdo-v2','gtai-v2','gtao-v2']:
   v=self.v[k];self.assertFalse(v['release_gate']['accurate_connector_release_passed']);self.assertEqual(v['confidence']['electrical_compatibility']['status'],'unknown')
   t=json.dumps(v);self.assertIn('lower power',t);self.assertIn('service',t)
 def test_connector_source_separation(self):
  ids={s['id'] for s in self.d['sources']};self.assertLessEqual({'PHOENIX-1803604','PHOENIX-1803581','PHOENIX-1803578'},ids)
  for k,pn,pcs in [('gtdo-v2','1803604','80'),('gtai-v2','1803581','36'),('gtao-v2','1803578','32')]:
   t=json.dumps(self.v[k]['confidence']);self.assertIn(pn,t);self.assertIn(pcs,t);self.assertIn('3.81',t)
  self.assertIn('2.21',' '.join(self.v['gtai-v2']['notes']))
 def test_previous_and_legacy_variant_states_retained(self):
  self.assertEqual(len(self.v),18)
  for k in ['gtdo-v1','gtai-v1','gtao-v1']:self.assertEqual(self.v[k]['release_gate']['stage'],'catalog_only')
  self.assertIn('gtdi-v2-2.01',' '.join(self.v['gtdi-v2']['notes']))
if __name__=='__main__':unittest.main()
