"""Final PNG receipts must bind exact model, metadata and rendered pixel content."""
import hashlib,json,unittest
from pathlib import Path
from PIL import Image
P=Path(__file__).resolve().parents[1]
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
class PreviewContract(unittest.TestCase):
 def test_complete_exact_artifact_receipts(self):
  d=json.loads((P/'qa/preview-provenance.json').read_text());self.assertEqual(d['source_blend_sha256'],sha(P/'source/asset.blend'));self.assertEqual(d['source_glb_sha256'],sha(P/'exports/asset.glb'));self.assertEqual(d['ports_sha256'],sha(P/'metadata/ports.json'))
  self.assertEqual(set(d['previews']),{'iso','neutral','wireframe','front','rear','left','right','top','copper-closeup','rear-closeup','service-closeup'})
  for v,r in d['previews'].items():
   p=P/r['path'];self.assertEqual(r['sha256'],sha(p));self.assertEqual(r['source_blend_sha256'],d['source_blend_sha256']);self.assertEqual(r['dimensions_px'],[1400,1400])
   with Image.open(p) as im:
    self.assertEqual(r['decoded_rgba_sha256'],hashlib.sha256(im.convert('RGBA').tobytes()).hexdigest());self.assertEqual(r['dimensions_px'],list(im.size))
 def test_exact_delivery_inventory(self):
  d=json.loads((P/'qa/delivery-manifest.json').read_text());self.assertEqual(d['status'],'FROZEN');files={str(p.relative_to(P)) for p in P.rglob('*') if p.is_file() and p.name!='delivery-manifest.json'};self.assertEqual(set(d['files']),files)
  for rel,r in d['files'].items():self.assertEqual(r['sha256'],sha(P/rel),rel);self.assertEqual(r['bytes'],(P/rel).stat().st_size,rel)
if __name__=='__main__':unittest.main()
