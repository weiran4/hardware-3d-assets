import json,sys,struct,shutil
from pathlib import Path
(Path(__file__).resolve().parent/'outputs').mkdir(parents=True,exist_ok=True)
ROOT=Path(__file__).resolve().parents[2]
sys.path.insert(0,str(ROOT/'tools'))
from qa_roundtrip import check_roundtrip
src=ROOT/'checkpoints/t1-r07/oscilloscope'; results=[]
for case in ['remove_record','alter_direction','alter_constraints','remove_sidecar','alter_material']:
 dest=(Path(__file__).resolve().parent/'outputs')/('regression_'+case);dest.mkdir(exist_ok=True)
 for name in ['source','exports','metadata']:(dest/name).mkdir(exist_ok=True)
 for name in ['source/asset.blend','exports/asset.glb','metadata/ports.json','parameters.json']:shutil.copy2(src/name,dest/name)
 if case=='remove_sidecar':(dest/'metadata/ports.json').unlink()
 else:
  p=dest/'exports/asset.glb';blob=p.read_bytes();length,kind=struct.unpack_from('<II',blob,12);doc=json.loads(blob[20:20+length]);anchor=next(n for n in doc['nodes']if n.get('extras',{}).get('kind')=='anchor')
  if case=='remove_record':del anchor['extras']['port_record']
  elif case=='alter_material':doc['materials'][0]['pbrMetallicRoughness']['baseColorFactor']=[1,0,0,1]
  else:
   rec=json.loads(anchor['extras']['port_record']);rec['direction']='output'if case=='alter_direction'else rec['direction'];rec['electrical_constraints']={'max_voltage':100}if case=='alter_constraints'else rec['electrical_constraints'];anchor['extras']['port_record']=json.dumps(rec)
  j=json.dumps(doc,separators=(',',':')).encode();j+=b' '*((-len(j))%4);rest=blob[20+length:];p.write_bytes(struct.pack('<4sII',b'glTF',2,20+len(j)+len(rest))+struct.pack('<II',len(j),kind)+j+rest)
 r=check_roundtrip(dest,json.loads((dest/'parameters.json').read_text()));results.append({'case':case,'status':r['status'],'errors':r['errors'],'metadata_errors':r.get('metadata_errors')});assert r['status']=='FAIL',(case,r)
out=(Path(__file__).resolve().parent/'outputs/mutation-regressions.json');out.write_text(json.dumps(results,indent=2));print('REGRESSION_RESULTS',json.dumps(results))
