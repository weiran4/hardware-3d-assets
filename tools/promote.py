"""Promote only a checked candidate; keep build source/parameters untouched."""
import json,sys,shutil,hashlib,argparse
from asset_common import compare_runs
from pathlib import Path
root=Path(__file__).resolve().parents[1]
ap=argparse.ArgumentParser(); ap.add_argument('candidate'); ap.add_argument('--reuse-baseline-previews'); args=ap.parse_args()
p=Path(args.candidate).resolve(); c=json.loads((p/'parameters.json').read_text()); asset=c['asset_id']
for name in ['report','roundtrip']:
    r=json.loads((p/'qa'/f'{name}.json').read_text()); assert r['status']=='PASS' and not r['errors'],r
views=['front','rear','left','right','top','iso','neutral','wireframe']
provenance={name:{'source':'rendered_this_candidate','path':str((p/'previews'/f'{name}.png').relative_to(root))} for name in views if (p/'previews'/f'{name}.png').is_file()}
if args.reuse_baseline_previews:
    baseline=Path(args.reuse_baseline_previews).resolve()
    first=json.loads((baseline/'qa/report.json').read_text());last=json.loads((p/'qa/report.json').read_text())
    assert first['status']=='PASS' and not compare_runs(first,last),'Cannot reuse previews of a differing model'
    assert json.loads((baseline/'qa/roundtrip.json').read_text())['status']=='PASS'
    for name in views:
        if name not in provenance:
            src=baseline/'previews'/f'{name}.png';assert src.is_file()
            shutil.copy2(src,p/'previews'/src.name)
            provenance[name]={'source':'verified_baseline_render','path':str(src.relative_to(root)),'sha256':hashlib.sha256(src.read_bytes()).hexdigest()}
for name in views: assert (p/'previews'/f'{name}.png').is_file(),name
(p/'qa/preview-provenance.json').write_text(json.dumps({'method':'Fresh candidate geometry/export; baseline diagnostic PNGs reused only when geometry, semantic and material digests match exactly. Reused views are not second renders.','views':provenance},indent=2)+'\n')
q=p/'qa/tools-used'; q.mkdir(exist_ok=True)
for f in (root/'tools').glob('*.py'): shutil.copy2(f,q/f.name)
dst=root/'generic'/asset
for folder in ['exports','previews','qa','metadata']:
    shutil.copytree(p/folder,dst/folder,dirs_exist_ok=True)
shutil.copy2(p/'source/asset.blend',dst/'source/asset.blend')
files={str(f.relative_to(p)):hashlib.sha256(f.read_bytes()).hexdigest() for f in p.rglob('*') if f.is_file() and f.name!='checkpoint.json'}
(p/'checkpoint.json').write_text(json.dumps({'asset_id':asset,'seed':c['seed'],'status':'PASS native + actual GLB roundtrip; user acceptance pending','files_sha256':files},indent=2)+'\n')
print('PROMOTED',asset,'from',p)
