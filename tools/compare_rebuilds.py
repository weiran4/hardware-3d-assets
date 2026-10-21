"""Compare same-schema native measurements plus fixed-view rendered evidence."""
from pathlib import Path
import json,sys
from PIL import Image,ImageChops,ImageStat
from asset_common import compare_runs,dump
root=Path(__file__).resolve().parents[1]
baselines=json.loads((root/'qa/baseline-paths.json').read_text()); second=sys.argv[1] if len(sys.argv)>1 else 't4-r02'; rows={}; failed=[]
for asset,baseline in baselines.items():
 a=root/baseline;b=root/'checkpoints'/second/asset
 first=json.loads((a/'qa/report.json').read_text());last=json.loads((b/'qa/report.json').read_text());errors=compare_runs(first,last)
 if first['status']!='PASS' or last['status']!='PASS':errors.append('native_qa')
 for p in [a,b]:
  if json.loads((p/'qa/roundtrip.json').read_text())['status']!='PASS':errors.append('roundtrip')
 images={}
 provenance=json.loads((b/'qa/preview-provenance.json').read_text())['views']
 for view in ['iso','neutral','wireframe','front','rear','left','right','top']:
  im1=Image.open(a/'previews'/f'{view}.png').convert('RGB');im2=Image.open(b/'previews'/f'{view}.png').convert('RGB')
  if im1.size!=im2.size:errors.append('image_size:'+view);continue
  diff=ImageChops.difference(im1,im2);images[view]={'coverage':provenance[view]['source'],'independent_rerender':provenance[view]['source']=='rendered_this_candidate','mean_absolute_rgb_0_255':ImageStat.Stat(diff).mean,'max_channel_difference':max(x[1] for x in diff.getextrema())}
 rows[asset]={'status':'PASS' if not errors else 'FAIL','errors':errors,'baseline':baseline,'repeat':str(b.relative_to(root)),'geometry_digest_equal':first['geometry_digest']==last['geometry_digest'],'semantic_digest_equal':first['semantic_digest']==last['semantic_digest'],'material_digest_equal':first['material_digest']==last['material_digest'],'placed_triangles':last['placed_triangles'],'render_comparison':images}
 failed.extend(asset+':'+e for e in errors)
dump(root/'qa/rebuild-comparison.json',{'status':'PASS' if not failed else 'FAIL','errors':failed,'seed':42,'method':'fresh Blender processes; measured vertex/topology/transform, full semantics, material values+bindings; iso freshly rerendered for all4; scope8 and controller3 rerendered before optimization, remaining diagnostic PNGs reused from independently reviewed identical baselines with explicit provenance; no binary-hash identity requirement','assets':rows})
print('PASS' if not failed else 'FAIL',rows)
if failed:raise SystemExit(1)
