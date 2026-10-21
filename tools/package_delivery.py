"""Package verified final masters, source, skill and evidence, without old candidates."""
from pathlib import Path
import hashlib,json,zipfile,shutil
from asset_common import dump
R=Path(__file__).resolve().parents[1];O=R/'deliverables';O.mkdir(exist_ok=True)
comparison=json.loads((R/'qa/rebuild-comparison.json').read_text());assert comparison['status']=='PASS',comparison
independent=json.loads((R/'qa/independent-review.json').read_text());assert independent.get('status') in {'PASS','PASS_WITH_STATED_LIMITATIONS'} and not independent.get('errors') and not independent.get('blocking_findings_remaining'),independent
assets=['oscilloscope','trigger-controller','signal-cable','sample-scene'];summaries={};accepted={}
for asset in assets:
 p=R/'generic'/asset;report=json.loads((p/'qa/report.json').read_text());rt=json.loads((p/'qa/roundtrip.json').read_text())
 assert report['status']==rt['status']=='PASS'
 for ext in ['source/asset.blend','exports/asset.glb','metadata/ports.json']:
  assert (p/ext).is_file(),ext
 for view in ['front','rear','left','right','top','iso','neutral','wireframe']:
  assert (p/'previews'/f'{view}.png').is_file(),view
 summaries[asset]={'native_triangles':report['placed_triangles'],'exported_triangles':rt['placed_triangles'],'unique_ids':len(report['all_ids']),'part_count':len(report['part_ids']),'anchor_count':len(report['anchor_ids']),'missing_resources':report['missing_resources'],'body_dimensions_m':report.get('body_dimensions_m'),'cable_length_m':report.get('cable_length_m'),'cable_diameter_m':report.get('cable_diameter_m'),'max_roundtrip_dimension_error_m':rt['dimension_error_m'],'max_anchor_error_m':rt['anchor_max_error_m']}
 candidate=R/'checkpoints/t4-r02'/asset
 assert candidate.is_dir()
 source_checks={}
 for name in ['build.py','asset_common.py','qa_asset.py','qa_roundtrip.py']:
  a=(R/'tools'/name).read_bytes();b=(candidate/'snapshot/tools'/name).read_bytes();assert a==b,('Model tool changed since final build',name)
  source_checks[name]=hashlib.sha256(a).hexdigest()
 assert (p/'source/build.py').read_bytes()==(candidate/'source/build.py').read_bytes()
 accepted[asset]={'candidate':str(candidate.relative_to(R)),'checkpoint_sha256':hashlib.sha256((candidate/'checkpoint.json').read_bytes()).hexdigest(),'model_tools_sha256':source_checks,'asset_source_sha256':hashlib.sha256((p/'source/build.py').read_bytes()).hexdigest()}
dump(R/'qa/accepted-checkpoints.json',accepted)
dump(R/'qa/delivery-summary.json',{'status':'ready_for_user_review','user_acceptance':'pending','independent_review':independent['status'],'clean_rebuild':'PASS','runtime':{'blender':'4.3.2','bundled_python':'3.13.5','gltf_exporter':'4.3.47','engine':'Cycles CPU','samples':128,'resolution':[1024,1024]},'assets':summaries,'limitations':['Original fictional dimensions, not manufacturer facts','Physical compatibility unknown; electrical constraints null','No circuit simulation, safe real-device wiring claims or animation clips','Freestyle outline, cream studio floor, cameras and lighting not exported to GLB','Only Blender clean reimport verified; other viewers not certified','Historical QA completed before public repository publication; original outcomes retained']})
shutil.copy2(R/'generic/sample-scene/previews/iso.png',O/'hero.png')
files=[R/'README.md']
for directory in ['generic','tools','tests','skills','docs']:
 files.extend(p for p in (R/directory).rglob('*') if p.is_file() and '__pycache__' not in p.parts and p.suffix not in ['.pyc','.blend1'])
for name in ['progress.md','baseline-paths.json','accepted-checkpoints.json','delivery-summary.json','rebuild-comparison.json','independent-review.json','contract-final.log','integration-final.log']:
 p=R/'qa'/name
 if p.is_file():files.append(p)
files.extend(p for p in (R/'qa/independent-review').rglob('*') if p.is_file() and '__pycache__' not in p.parts)
files.extend(O/name for name in ['hero.png','contact-sheet.png','qa-all-views.png'])
core_tools={'build.py','asset_common.py','qa_asset.py','qa_roundtrip.py'}
# Retain the exact final model/QA snapshot, not redundant historical orchestration copies.
files=[p for p in files if 'tools-used' not in p.parts or p.name in core_tools]
files=sorted(set(files));manifest={str(p.relative_to(R)):hashlib.sha256(p.read_bytes()).hexdigest() for p in files};dump(O/'payload-sha256.json',manifest);files.append(O/'payload-sha256.json')
zip_path=O/'hardware-practice-stage1.zip'
with zipfile.ZipFile(zip_path,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
 for p in files:z.write(p,str(p.relative_to(R)))
with zipfile.ZipFile(zip_path) as z:
 assert z.testzip() is None
 for key,sha in manifest.items():assert hashlib.sha256(z.read(key)).hexdigest()==sha,key
sha=hashlib.sha256(zip_path.read_bytes()).hexdigest();(O/'hardware-practice-stage1.zip.sha256').write_text(sha+'  hardware-practice-stage1.zip\n')
print('PASS PACKAGE',len(files),'files',zip_path.stat().st_size,'bytes',sha)
