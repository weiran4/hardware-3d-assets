"""Final delivery hashes, public-source hygiene and artifact set."""
import json,hashlib,struct,unittest
from pathlib import Path
P=Path(__file__).resolve().parents[1]
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
class PackageContract(unittest.TestCase):
 def test_final_eleven_views_match_exact_master(self):
  f=P/'qa/preview-provenance.json';self.assertTrue(f.is_file());d=json.loads(f.read_text());self.assertEqual(d['source_blend_sha256'],sha(P/'source/asset.blend'));self.assertEqual(d.get('source_glb_sha256'),sha(P/'exports/asset.glb'))
  expected={'iso','neutral','wireframe','front','rear','left','right','top','terminal-closeup','optical-closeup','power-closeup'};self.assertEqual(set(d['previews']),expected)
  for v,r in d['previews'].items():
   p=P/r['path'];self.assertEqual(r['sha256'],sha(p));self.assertEqual(r['source_blend_sha256'],d['source_blend_sha256']);self.assertEqual(r['dimensions_px'],list(struct.unpack('>II',p.read_bytes()[16:24])))
 def test_all_reports_pass_and_frozen_hashes_agree(self):
  for name in ['report','roundtrip','independent-native','independent-glb','mutation-probes-native','mutation-probes-glb','label-visibility-native','label-visibility-glb','rebuild','independent-preview-review','visual-review']:
   d=json.loads((P/'qa'/(name+'.json')).read_text());self.assertTrue(d.get('status')=='PASS' or d.get('passed') is True,name)
   for key in ['blend_sha256','source_blend_sha256','source/asset.blend_sha256']:
    if key in d:self.assertEqual(d[key],sha(P/'source/asset.blend'),name)
   for key in ['glb_sha256','source_glb_sha256','exports/asset.glb_sha256']:
    if key in d:self.assertEqual(d[key],sha(P/'exports/asset.glb'),name)
 def test_delivery_inventory_is_exact(self):
  d=json.loads((P/'qa/delivery-manifest.json').read_text());expected={str(p.relative_to(P)) for p in P.rglob('*') if p.is_file() and p.name!='delivery-manifest.json'};self.assertEqual(set(d['files']),expected)
  for rel,r in d['files'].items():self.assertEqual(r['sha256'],sha(P/rel),rel);self.assertEqual(r['bytes'],(P/rel).stat().st_size,rel)
 def test_public_folder_has_no_transient_logs_or_bytecode(self):
  bad=[str(p.relative_to(P)) for p in P.rglob('*') if p.is_file() and p.suffix in {'.log','.pyc','.pdf','.jpeg','.jpg'}];self.assertFalse(bad)
 def test_public_provenance_no_source_container_ids(self):
  # Generic tokens, never actual private document identifiers in a fixture.
  for folder in ['metadata','references','qa','docs']:
   for p in (P/folder).glob('*.json'):
    s=p.read_text()
    for key in ['library_file_id','private-source-cache','pdf_pages','source_pdf_sha256','workspace_path']:
     self.assertNotIn(key,s,str(p.relative_to(P)))
if __name__=='__main__':unittest.main()
