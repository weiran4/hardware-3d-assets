"""Verify/complete preview receipts. Optional private render logs can identify finished views."""
import argparse,hashlib,json,re,struct,datetime
from PIL import Image
from pathlib import Path
P=Path(__file__).resolve().parents[1]
a=argparse.ArgumentParser();a.add_argument('--revision',default='r04');a.add_argument('--logs',nargs='*',default=[]);args=a.parse_args()
master=P/'source/asset.blend';sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest();h=sha(master)
old=json.loads((P/'qa/preview-provenance.json').read_text()) if (P/'qa/preview-provenance.json').exists() else {}
views=[]
if args.logs:
 for name in args.logs:
  log=Path(name);log=log if log.is_absolute() else P/log
  views.extend(re.findall(r'^RENDER PASS ([\w-]+)$',log.read_text(),re.M))
elif old.get('source_blend_sha256')==h:views=list(old.get('previews',{}))
else:raise RuntimeError('No matching master receipts. Render again or supply local run logs.')
required={'iso','neutral','wireframe','front','rear','left','right','top','terminal-closeup','optical-closeup','power-closeup'}
if set(views)!=required:raise RuntimeError('Final receipt requires exactly all11 canonical views, not diagnostics or partial runs: '+str(set(views)^required))
d={'source_blend':'source/asset.blend','source_blend_sha256':h,'source_glb_sha256':sha(P/'exports/asset.glb'),'ports_sha256':sha(P/'metadata/ports.json'),'geometry_revision':args.revision,'render_script':'source/render_views.py','reproduction':'From repository root: blender -b --python rtds/gtfpi-v2-2.01-capped/source/render_views.py','local_transient_logs_distributed':False,'previews':{},'expected_views':sorted(required),'expected_standard_views':['iso','neutral','wireframe','front','rear','left','right','top']}
for view in dict.fromkeys(views):
 p=P/'previews'/f'{view}.png'
 if not p.exists() or p.stat().st_mtime<master.stat().st_mtime:raise RuntimeError('Stale or missing completed preview '+view)
 receipt=old.get('previews',{}).get(view)
 if not receipt or receipt.get('source_blend_sha256')!=h:raise RuntimeError('Missing/mismatched renderer master receipt '+view)
 actual_sha=sha(p)
 if receipt.get('sha256')!=actual_sha:raise RuntimeError('Renderer receipt PNG hash mismatch '+view)
 width,height=struct.unpack('>II',p.read_bytes()[16:24])
 if receipt.get('dimensions_px')!=[width,height]:raise RuntimeError('Renderer receipt dimensions mismatch '+view)
 if receipt.get('samples')!=(48 if view in ['iso','top'] else 24):raise RuntimeError('Renderer sample receipt mismatch '+view)
 d['previews'][view]={'path':str(p.relative_to(P)),'sha256':actual_sha,'renderer_receipt_file_hash_verified':True,'decoded_rgba_sha256':hashlib.sha256(Image.open(p).convert('RGBA').tobytes()).hexdigest(),'dimensions_px':[width,height],'engine':'CYCLES','device':'CPU','samples':48 if view in ['iso','top'] else 24,'freestyle':False,'denoising':False,'view_transform':'Standard','exposure':0,'camera_roll_top_deg':180 if view=='top' else 0,'source_blend_sha256':h,'render_file_mtime_iso_executor_clock':datetime.datetime.fromtimestamp(p.stat().st_mtime,datetime.timezone.utc).isoformat()}
d['missing_standard_views']=sorted(set(d['expected_standard_views'])-d['previews'].keys());d['review_preferred']=['top','iso','terminal-closeup','optical-closeup','power-closeup']
if sha(master)!=h:raise RuntimeError('Master changed during receipt verification')
(P/'qa/preview-provenance.json').write_text(json.dumps(d,indent=2)+'\n');print('PROVENANCE',len(d['previews']),'previews; missing',d['missing_standard_views'])
