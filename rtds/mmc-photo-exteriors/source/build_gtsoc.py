"""Remove inserted copper module details, retaining original photo-based outer cage apertures.
An unpopulated illustrative modular-front state, NOT an installed optical transceiver.
No vendor bitmap or private document consumed or embedded.
"""
import json,struct,pathlib,hashlib,re,copy,sys
if len(sys.argv)!=3:raise SystemExit('Usage: python build_gtsoc.py SOURCE_COPPER16_GLB OUTPUT_DIR')
SRC=pathlib.Path(sys.argv[1])
P=pathlib.Path(sys.argv[2]);P.mkdir(parents=True,exist_ok=True)
b=SRC.read_bytes();jl=struct.unpack_from('<I',b,12)[0];j=json.loads(b[20:20+jl]);binary=b[28+jl:];original=copy.deepcopy(j)
pat=re.compile(r'\.front\d+\.')
removed=[];keep=[]
for i,n in enumerate(j['nodes']):
 name=n.get('name','')
 if pat.search(name) and any(t in name for t in ['.contact','.key_','.bail_']):removed.append(name)
 else:keep.append(i)
nmap={old:new for new,old in enumerate(keep)};nodes=[]
for i in keep:
 n=j['nodes'][i]
 if 'children'in n:n['children']=[nmap[c] for c in n['children'] if c in nmap]
 e=n.setdefault('extras',{})
 # Existing numbered/physical anchors become noninteractive rendering transforms.
 if e.get('kind')=='anchor':
  e.clear();e.update(kind='rendering_transform',sid='render-only.'+n.get('name',''),selectable=False)
 else:
  e.pop('port_record',None);e.pop('asset_id',None)
 nodes.append(n)
for s in j['scenes']:s['nodes']=[nmap[n] for n in s['nodes'] if n in nmap]
# center of observed 16-aperture group; floating front-plane marker, not a jack
pos=[-.0315,.033,.155]
nodes.append({'name':'gtsoc.front-sfp-group','translation':pos,'extras':{'kind':'anchor','sid':'gtsoc.front-sfp-group','scope':'functional_group_only','physical_jack':False,'normal':[0,0,1],'transceiver_modeled':False}})
j['scenes'][j.get('scene',0)]['nodes'].append(len(nodes)-1);j['nodes']=nodes
# Remove unused meshes/accessors/buffer views and reassemble untouched retained bytes.
usedm=sorted({n['mesh'] for n in nodes if 'mesh'in n});mm={v:i for i,v in enumerate(usedm)}
for n in nodes:
 if 'mesh'in n:n['mesh']=mm[n['mesh']]
j['meshes']=[j['meshes'][i] for i in usedm]
useda=set()
for m in j['meshes']:
 for p in m['primitives']:
  useda.update(p['attributes'].values())
  if 'indices'in p:useda.add(p['indices'])
useda=sorted(useda);am={v:i for i,v in enumerate(useda)}
for m in j['meshes']:
 for p in m['primitives']:
  p['attributes']={k:am[v] for k,v in p['attributes'].items()}
  if 'indices'in p:p['indices']=am[p['indices']]
j['accessors']=[j['accessors'][i] for i in useda]
usedv=sorted({a['bufferView'] for a in j['accessors'] if 'bufferView'in a});vm={v:i for i,v in enumerate(usedv)}
for a in j['accessors']:
 if 'bufferView'in a:a['bufferView']=vm[a['bufferView']]
newbin=bytearray();views=[];identical=True
for vi in usedv:
 v=copy.deepcopy(j['bufferViews'][vi]);oldbytes=binary[v.get('byteOffset',0):v.get('byteOffset',0)+v['byteLength']]
 while len(newbin)%4:newbin.append(0)
 v['byteOffset']=len(newbin);v['buffer']=0;newbin.extend(oldbytes);identical &= bytes(newbin[v['byteOffset']:v['byteOffset']+v['byteLength']])==oldbytes;views.append(v)
j['bufferViews']=views;j['buffers']=[{'byteLength':len(newbin)}]
j['asset']['extras']={'description':'GTSOC V2 representative unpopulated modular SFP apertures. Optical transceiver and physical plug NOT modeled. Chassis/rear retained from original copper-populated reference. Not an installed variant or part-number claim.'}
s=json.dumps(j,separators=(',',':')).encode();s+=b' '*((-len(s))%4);newbin+=b'\0'*((-len(newbin))%4)
out=struct.pack('<4sII',b'glTF',2,28+len(s)+len(newbin))+struct.pack('<II',len(s),0x4e4f534a)+s+struct.pack('<II',len(newbin),0x004e4942)+newbin
(P/'gtsoc-v2-optical.glb').write_bytes(out)
receipt={'source_sha256':hashlib.sha256(b).hexdigest(),'output_sha256':hashlib.sha256(out).hexdigest(),'source_bytes':len(b),'output_bytes':len(out),'removed_nodes':removed,'all_retained_geometry_byte_identical':identical,'changed_geometry_scope':'front inserted-module details only','rear_geometry_changed':False,'axes':'+Y up, +Z front','functional_anchor':{'sid':'gtsoc.front-sfp-group','position_m':pos,'normal':[0,0,1],'physical_jack':False},'scope':'representative unpopulated cage outer apertures, not manufacturer-certified internal cage geometry'}
(P/'preservation.json').write_text(json.dumps(receipt,indent=2));print(json.dumps({k:v for k,v in receipt.items() if k!='removed_nodes'},indent=2))
