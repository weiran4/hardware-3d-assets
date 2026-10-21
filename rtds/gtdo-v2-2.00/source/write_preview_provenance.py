"""Verify/complete preview receipts. Optional private render logs can identify finished views."""
import argparse,hashlib,json,re,struct,datetime
from pathlib import Path
from PIL import Image
P=Path(__file__).resolve().parents[1]
a=argparse.ArgumentParser();a.add_argument('--revision',default='r05');a.add_argument('--logs',nargs='*',default=[]);args=a.parse_args()
master=P/'source/asset.blend';sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest();h=sha(master)
old=json.loads((P/'qa/preview-provenance.json').read_text()) if (P/'qa/preview-provenance.json').exists() else {}
views=[]
if args.logs:
 for name in args.logs:
  log=Path(name);log=log if log.is_absolute() else P/log
  views.extend(re.findall(r'^RENDER PASS ([\w-]+)$',log.read_text(),re.M))
elif old.get('source_blend_sha256')==h:views=list(old.get('previews',{}))
else:raise RuntimeError('No matching master receipts. Render again or supply local run logs.')
d={'source_blend':'source/asset.blend','source_blend_sha256':h,'source_glb_sha256':sha(P/'exports/asset.glb'),'geometry_revision':args.revision,'render_script':'source/render_views.py','render_script_sha256':sha(P/'source/render_views.py'),'reproduction':'From repository root: blender -b --python-exit-code 1 --python rtds/gtdo-v2-2.00/source/render_views.py','local_transient_logs_distributed':False,'previews':{},'expected_standard_views':['iso','neutral','wireframe','front','rear','left','right','top','terminal-closeup','optical-closeup','power-closeup']}
for view in dict.fromkeys(views):
 p=P/'previews'/f'{view}.png'
 rec=old.get('previews',{}).get(view,{})
 if old.get('source_blend_sha256')!=h or rec.get('source_blend_sha256')!=h or rec.get('sha256')!=sha(p):raise RuntimeError('Missing or mismatched per-view source-hash receipt '+view)
 if not p.exists() or p.stat().st_mtime<master.stat().st_mtime:raise RuntimeError('Stale or missing completed preview '+view)
 width,height=struct.unpack('>II',p.read_bytes()[16:24]);pixel_hash=hashlib.sha256(Image.open(p).convert('RGBA').tobytes()).hexdigest()
 d['previews'][view]={'path':str(p.relative_to(P)),'sha256':sha(p),'decoded_rgba_sha256':pixel_hash,'dimensions_px':[width,height],'engine':'CYCLES','device':'CPU','samples':48 if view in ['iso','top'] else 24,'freestyle':False,'denoising':False,'view_transform':'Standard','exposure':0,'camera_roll_top_deg':180 if view=='top' else 0,'source_blend_sha256':h,'render_completed_utc':datetime.datetime.fromtimestamp(p.stat().st_mtime,datetime.timezone.utc).isoformat()}
d['missing_standard_views']=sorted(set(d['expected_standard_views'])-d['previews'].keys());d['review_preferred']=['top','iso','terminal-closeup','optical-closeup','power-closeup']
(P/'qa/preview-provenance.json').write_text(json.dumps(d,indent=2)+'\n');print('PROVENANCE',len(d['previews']),'previews; missing',d['missing_standard_views'])
