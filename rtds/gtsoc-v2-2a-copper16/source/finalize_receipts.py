"""Validate final saved-master previews and write portable original-artifact hashes."""
import hashlib,json,re,sys
from pathlib import Path
from PIL import Image
P=Path(__file__).resolve().parents[1]
EXPECTED={'iso','neutral','wireframe','front','rear','left','right','top','copper-closeup','rear-closeup','service-closeup'}
def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()
def main():
 master=sha(P/'source/asset.blend');glb=sha(P/'exports/asset.glb');f=P/'qa/preview-provenance.json';prov=json.loads(f.read_text())
 assert prov['source_blend_sha256']==master
 assert set(prov['previews'])==EXPECTED
 prov['source_glb_sha256']=glb;prov['ports_sha256']=sha(P/'metadata/ports.json')
 for name,r in prov['previews'].items():
  path=P/r['path'];assert r['source_blend_sha256']==master;assert r['sha256']==sha(path)
  im=Image.open(path);assert list(im.size)==r['dimensions_px']==[1400,1400];assert im.mode in ['RGB','RGBA']
  r['decoded_pixel_sha256']=hashlib.sha256(im.tobytes()).hexdigest();r['decoded_pixel_mode']=im.mode;r['decoded_rgba_sha256']=hashlib.sha256(im.convert('RGBA').tobytes()).hexdigest()
 f.write_text(json.dumps(prov,indent=2)+'\n')
 for name in ['labels-native.json','labels-glb.json','mutation-probes.json','verification-summary.json','independent-review.json','rebuild.json','visual-review.json']:
  rec=json.loads((P/'qa'/name).read_text());assert rec['status']=='PASS';assert rec['source_blend_sha256']==master;assert rec['source_glb_sha256']==glb
 audit=json.loads((P/'qa/independent-preview-review.json').read_text());assert audit['passed'] and audit['count']==11 and audit['master_sha256']==master and audit['glb_sha256']==glb
 assert json.loads((P/'qa/roundtrip.json').read_text())['status']=='PASS';assert json.loads((P/'qa/report.json').read_text())['status']=='PASS'
 for kind in ['native','glb']:
  rec=json.loads((P/'qa'/('independent-'+kind+'.json')).read_text());assert rec['passed'] and rec['check_count']==669 and all(c['passed'] for c in rec['checks']);assert rec['blend_sha256']==master and rec['glb_sha256']==glb
 leaks=[]
 for path in P.rglob('*'):
  if not path.is_file():continue
  assert path.suffix not in ['.log','.pyc'],str(path.relative_to(P))
  if path.suffix in ['.json','.md','.py']:
   text=path.read_text()
   # Generic patterns only; no private identifier is embedded in this fixture.
   if any(re.search(pattern,text) for pattern in [r'/work'+'space/',r'/ho'+'me/',r'pdf-'+'[0-9]{3}',r'private-source-'+'cache']):leaks.append(str(path.relative_to(P)))
 assert not leaks,leaks
 if '--receipts-only' in sys.argv:
  print('PASS verified11 preview receipts; delivery inventory not written');return
 files={str(path.relative_to(P)):{'sha256':sha(path),'bytes':path.stat().st_size} for path in sorted(P.rglob('*')) if path.is_file() and path.name!='delivery-manifest.json'}
 result={'asset_id':P.name,'status':'FROZEN','geometry_revision':'r04','source_blend_sha256':master,'source_glb_sha256':glb,'preview_count':len(EXPECTED),'public_original_artifact_only':True,'inventory_excludes':['qa/delivery-manifest.json'],'files':files}
 (P/'qa/delivery-manifest.json').write_text(json.dumps(result,indent=2)+'\n');print('PASS final receipts',len(files),'files',len(EXPECTED),'previews')
if __name__=='__main__':main()
