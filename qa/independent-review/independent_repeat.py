import bpy,json,sys,hashlib
from pathlib import Path
(Path(__file__).resolve().parent/'outputs').mkdir(parents=True,exist_ok=True)
ROOT=Path(__file__).resolve().parents[2]
BASE={'oscilloscope':'final-baseline','trigger-controller':'final-baseline','signal-cable':'t2-r02','sample-scene':'t3-r01'}
def dg(v):return hashlib.sha256(json.dumps(v,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def measure(p):
 bpy.ops.wm.open_mainfile(filepath=str(p/'source/asset.blend'));bpy.context.view_layer.update();deps=bpy.context.evaluated_depsgraph_get();geo=[];sem=[];mats=[]
 for o in sorted((o for o in bpy.context.scene.objects if o.get('sid')),key=lambda o:o['sid']):
  sid=o['sid'];sem.append([sid,o.parent.get('sid')if o.parent else None,o.get('kind'),o.get('asset_id'),o.get('motion'),o.get('motion_axis_local'),json.loads(o.get('port_record','null'))]);rec=[sid,[[round(x,6)for x in row]for row in o.matrix_world]]
  if o.type in {'MESH','CURVE','FONT','SURFACE'}:
   ev=o.evaluated_get(deps);me=ev.to_mesh();me.calc_loop_triangles();rec.extend([[[round(x,6)for x in v.co]for v in me.vertices],[list(t.vertices)for t in me.loop_triangles]])
   mr=[sid,[],[p.material_index for p in me.polygons]]
   for m in me.materials:
    bs=m.node_tree.nodes.get('Principled BSDF')if m.use_nodes else None
    mr[1].append([m.get('material_id',m.name),list(bs.inputs['Base Color'].default_value)if bs else list(m.diffuse_color),float(bs.inputs['Roughness'].default_value)if bs else m.roughness,float(bs.inputs['Metallic'].default_value)if bs else m.metallic])
   mats.append(mr);ev.to_mesh_clear()
  geo.append(rec)
 sc=bpy.context.scene;presentation={'engine':sc.render.engine,'device':sc.cycles.device,'samples':sc.cycles.samples,'seed':sc.cycles.seed,'resolution':[sc.render.resolution_x,sc.render.resolution_y,sc.render.resolution_percentage],'view':[sc.view_settings.view_transform,sc.view_settings.exposure,sc.view_settings.gamma],'camera':[sc.camera.data.type,sc.camera.data.ortho_scale,[[round(x,7)for x in row]for row in sc.camera.matrix_world]],'lights':sorted([[o.name,list(o.location),o.data.energy,o.data.size]for o in bpy.context.scene.objects if o.type=='LIGHT'])}
 return {'geometry':dg(geo),'semantics':dg(sem),'materials_and_bindings':dg(mats),'presentation':dg(presentation),'parameters':dg(json.loads((p/'parameters.json').read_text()))}
results=[]
for asset in sys.argv[sys.argv.index('--')+1:]:
 baseline=ROOT/'checkpoints'/BASE[asset]/asset;candidate=ROOT/'checkpoints/t4-r02'/asset;a=measure(baseline);b=measure(candidate);diff=[k for k in a if a[k]!=b[k]];r={'asset_id':asset,'baseline':str(baseline.relative_to(ROOT)),'candidate':str(candidate.relative_to(ROOT)),'status':'PASS'if not diff else'FAIL','differences':diff,'baseline_digests':a,'candidate_digests':b};results.append(r)
print('INDEPENDENT_REPEAT',json.dumps(results));(Path(__file__).resolve().parent/'outputs/independent-repeat.json').write_text(json.dumps(results,indent=2))
if any(r['differences']for r in results):raise RuntimeError('repeat differs')
