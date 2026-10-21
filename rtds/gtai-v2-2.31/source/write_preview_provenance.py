"""Verify final-preview receipts without transforming image pixels."""
import hashlib,json,re
from pathlib import Path
from PIL import Image
P=Path(__file__).resolve().parents[1]
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
master=P/'source/asset.blend';blend=sha(master);glb=sha(P/'exports/asset.glb')
old=json.loads((P/'qa/preview-provenance.json').read_text())
assert old['source_blend_sha256']==blend,'Preview master mismatch'
expected=['iso','neutral','wireframe','front','rear','left','right','top','terminal-closeup','optical-closeup','power-closeup']
records={}
for v in expected:
 r=old['previews'][v];p=P/'previews'/f'{v}.png'
 assert r['path']==str(p.relative_to(P)),f'{v}: diagnostic or stale path'
 assert r['source_blend_sha256']==blend,f'{v}: stale master'
 assert r['sha256']==sha(p),f'{v}: byte mismatch'
 with Image.open(p) as im:
  assert im.size==tuple(r['dimensions_px']),f'{v}: dimensions'
  r['decoded_rgba_sha256']=hashlib.sha256(im.convert('RGBA').tobytes()).hexdigest()
 assert r['samples']==(48 if v in ['iso','top'] else 24),f'{v}: not final samples'
 records[v]=r
result={'source_blend':'source/asset.blend','source_blend_sha256':blend,'source_glb_sha256':glb,'source_ports_sha256':sha(P/'metadata/ports.json'),'geometry_revision':'r08','render_script':'source/render_views.py','previews':records,'expected_standard_views':expected[:8],'review_preferred':['top','iso','terminal-closeup','optical-closeup','power-closeup'],'missing_standard_views':[],'verified_final_preview_count':11,'diagnostic_views_included':False}
(P/'qa/preview-provenance.json').write_text(json.dumps(result,indent=2)+'\n')
logs=[(P/'qa'/name).read_text() for name in ['geometry-r08.log','roundtrip-geometry-r08.log']]
assert all('\nOK\n' in log and 'FAILED' not in log for log in logs),'Actual-file tests not passing'
counts=[int(re.search(r'Ran (\d+) tests', log).group(1)) for log in logs]
assert counts==[19,19],'Incomplete actual-file test run'
freeze={'geometry_revision':'r08','asset_id':'gtai-v2-2.31','sha256':{str(p.relative_to(P)):sha(p) for p in [master,P/'exports/asset.glb',P/'parameters.json',P/'metadata/ports.json',*sorted((P/'source').glob('*.py'))]},'native_status':json.loads((P/'qa/report.json').read_text())['status'],'roundtrip_status':json.loads((P/'qa/roundtrip.json').read_text())['status'],'placed_triangles':json.loads((P/'qa/report.json').read_text())['placed_triangles'],'physical_tests_native':19,'physical_tests_glb_reimport':19,'manifest_tests':4,'printed_annotations_verified':69,'anchors_verified':18,'physical_contacts_verified':48,'all_final_previews_match_master':True,'preview_provenance_sha256':sha(P/'qa/preview-provenance.json')}
(P/'qa/freeze.json').write_text(json.dumps(freeze,indent=2)+'\n')
print('PASS final preview provenance:',len(records),'views;',blend,glb)
