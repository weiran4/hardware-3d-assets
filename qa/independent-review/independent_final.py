"""Read-only saved native/actual GLB QA; all expected dimensions from approved plan."""
import bpy,json,sys,math,struct,hashlib
from pathlib import Path
(Path(__file__).resolve().parent/'outputs').mkdir(parents=True,exist_ok=True)
from mathutils import Vector,Quaternion
EXPECT={
 'oscilloscope':{'dims':[.28,.16,.13],'budget':8000,'ports':['ch1','trig'],'parts':['body','screen','knob','button']},
 'trigger-controller':{'dims':[.18,.12,.07],'budget':5000,'ports':['out'],'parts':['body','knob','button']},
 'signal-cable':{'budget':2000,'ports':['end_a','end_b'],'parts':['body','connector_a','connector_b']},
 'sample-scene':{'budget':15000,'ports':[],'parts':[]}}
PORT_FIELDS={'id','parent_id','anchor_name','label','connector','signal_type','direction','position_m','orientation_wxyz','normal','physical_compatibility','electrical_constraints'}
def read_scene():
 bpy.context.view_layer.update(); dg=bpy.context.evaluated_depsgraph_get(); objects={}; materials={}; duplicates=[]; total=0; nonunit=[]; missing=[]
 for o in bpy.context.scene.objects:
  if not o.get('sid'):continue
  sid=o['sid']
  if sid in objects: duplicates.append(sid)
  rec={'sid':sid,'type':o.type,'kind':o.get('kind'),'parent':o.parent.get('sid')if o.parent else None,'matrix':o.matrix_world.copy(),'scale':list(o.scale),'motion':o.get('motion'),'port_record':o.get('port_record')}
  if max(abs(s-1)for s in o.scale)>1e-5:nonunit.append(sid)
  if o.type in {'MESH','CURVE','FONT','SURFACE'}:
   ev=o.evaluated_get(dg); me=ev.to_mesh(); me.calc_loop_triangles(); total+=len(me.loop_triangles); rec['triangles']=len(me.loop_triangles)
   points=[o.matrix_world@v.co for v in me.vertices]
   rec['bounds']=[[min(v[i]for v in points)for i in range(3)],[max(v[i]for v in points)for i in range(3)]]
   rec['materials']=[]
   for m in me.materials:
    if m is None: rec['materials'].append(None); continue
    name=m.get('material_id',m.name.split('.00')[0]); rec['materials'].append(name); bs=m.node_tree.nodes.get('Principled BSDF')if m.use_nodes else None
    materials[name]={'color':list(bs.inputs['Base Color'].default_value)if bs else list(m.diffuse_color),'roughness':bs.inputs['Roughness'].default_value if bs else m.roughness,'metallic':bs.inputs['Metallic'].default_value if bs else m.metallic}
   ev.to_mesh_clear()
  objects[sid]=rec
 for img in bpy.data.images:
  if img.source=='FILE'and img.filepath and not img.packed_file and not Path(bpy.path.abspath(img.filepath)).is_file():missing.append(img.filepath)
 for f in bpy.data.fonts:
  if f.filepath and f.filepath not in {'<builtin>','Bfont'} and not f.packed_file and not Path(bpy.path.abspath(f.filepath)).is_file():missing.append(f.filepath)
 for lib in bpy.data.libraries:
  if not Path(bpy.path.abspath(lib.filepath)).is_file():missing.append(lib.filepath)
 return {'objects':objects,'materials':materials,'triangles':total,'duplicates':duplicates,'nonunit':nonunit,'missing':missing}
def check(directory):
 p=Path(directory).resolve(); c=json.loads((p/'parameters.json').read_text()); aid=c['asset_id']; exp=EXPECT[aid]; errs=[]; result={'asset_id':aid,'path':str(p)}
 bpy.ops.wm.open_mainfile(filepath=str(p/'source/asset.blend')); native=read_scene(); n=native['objects']; root=n.get(aid+'.root')
 if not root: errs.append('native root missing')
 elif root['matrix'].translation.length>1e-6:errs.append('native primary root not origin')
 if abs(bpy.context.scene.unit_settings.scale_length-1)>1e-8:errs.append('units')
 if native['nonunit']:errs.append('nonunit scales')
 if native['duplicates']:errs.append('native duplicate IDs')
 if native['missing']:errs.append('missing dependencies')
 if native['triangles']>exp['budget']:errs.append('native placed budget')
 if not bpy.context.scene.camera or bpy.context.scene.camera.data.type!='ORTHO':errs.append('nonorthographic camera')
 for suffix in exp['parts']:
  if aid+'.'+suffix not in n:errs.append('missing part '+suffix)
 if 'dims'in exp:
  o=bpy.data.objects.get(aid+'.body'); ev=o.evaluated_get(bpy.context.evaluated_depsgraph_get()); me=ev.to_mesh(); pts=[o.matrix_local.to_3x3()@v.co for v in me.vertices]; dims=[max(v[i]for v in pts)-min(v[i]for v in pts)for i in range(3)]; ev.to_mesh_clear(); result['body_dimensions_m']=dims
  if any(abs(a-b)>max(.001,b*.01)for a,b in zip(dims,exp['dims'])):errs.append('body dimensions')
 if aid=='signal-cable':
  o=bpy.data.objects.get(aid+'.body'); pts=[o.matrix_world@Vector(pt.co[:3])for pt in o.data.splines[0].points]; length=sum((b-a).length for a,b in zip(pts,pts[1:])); diameter=2*o.data.bevel_depth; result.update(cable_length_m=length,cable_diameter_m=diameter)
  if abs(length-.60)>.006:errs.append('cable length')
  if abs(diameter-.005)>.0001:errs.append('cable diameter')
 side=json.loads((p/'metadata/ports.json').read_text()); sideports={x['id']:x for x in side['ports']}; anchors={sid:r for sid,r in n.items()if r['kind']=='anchor'}
 if side.get('unit')!='m'or side.get('frame')!='BLENDER_Z_UP_FRONT_NEG_Y':errs.append('sidecar frame')
 if set(sideports)!=set(anchors):errs.append('sidecar anchor inventory')
 for suffix in exp['ports']:
  if aid+'.'+suffix not in anchors:errs.append('missing anchor '+suffix)
 for sid,r in anchors.items():
  o=bpy.data.objects.get(sid); port=json.loads(r['port_record']or'{}')
  if port!=sideports.get(sid):errs.append('sidecar/native mismatch '+sid)
  if not PORT_FIELDS<=set(port):errs.append('missing port fields '+sid);continue
  if port['physical_compatibility']!='unknown'or port['electrical_constraints']is not None or port['signal_type']!='unknown':errs.append('unapproved compatibility assertion '+sid)
  if port['parent_id']!=r['parent']:errs.append('anchor parent '+sid)
  if (o.location-Vector(port['position_m'])).length>1e-6:errs.append('anchor position '+sid)
  q=o.rotation_quaternion if o.rotation_mode=='QUATERNION'else o.rotation_euler.to_quaternion()
  if (q@Vector((0,0,1))).dot(Vector(port['normal']))<.999:errs.append('anchor normal '+sid)
  if abs(q.dot(Quaternion(port['orientation_wxyz'])))<.999:errs.append('anchor quaternion '+sid)
 motions=[]
 for sid,r in n.items():
  if not r['motion']:continue
  o=next(o for o in bpy.context.scene.objects if o.get('sid')==sid); before={x.name:x.matrix_world.copy()for x in bpy.context.scene.objects if x.get('sid')}; mode=o.rotation_mode; quat=o.rotation_quaternion.copy(); euler=o.rotation_euler.copy(); loc=o.location.copy(); axis=(o.matrix_world.to_quaternion()@Vector((0,0,1))).normalized(); pivot=o.matrix_world.translation.copy(); q0=o.rotation_quaternion.copy()if mode=='QUATERNION'else o.rotation_euler.to_quaternion()
  for sign in [-1,1]:
   if r['motion']=='rotation':o.rotation_mode='QUATERNION';o.rotation_quaternion=q0@Quaternion(Vector((0,0,1)),sign*math.radians(15))
   else:o.location=loc+Vector((0,sign*.001,0))
   bpy.context.view_layer.update()
   if r['motion']=='rotation':
    if (o.matrix_world.translation-pivot).length>1e-6 or axis.dot(o.matrix_world.to_quaternion()@Vector((0,0,1)))<.999999:errs.append('shaft/pivot drift '+sid)
   for x in bpy.context.scene.objects:
    if x.name not in before or x==o or x in o.children_recursive:continue
    if max(abs(x.matrix_world[i][j]-before[x.name][i][j])for i in range(4)for j in range(4))>1e-6:errs.append('motion leaks '+sid)
  o.rotation_mode=mode;o.rotation_quaternion=quat;o.rotation_euler=euler;o.location=loc;bpy.context.view_layer.update();motions.append(sid)
 blob=(p/'exports/asset.glb').read_bytes(); length,kind=struct.unpack_from('<II',blob,12); doc=json.loads(blob[20:20+length]); counts=[sum(doc['accessors'][pr['indices']]['count']//3 for pr in m['primitives'] if pr.get('mode',4)==4)for m in doc.get('meshes',[])]; actual_count=sum(counts[n['mesh']]for n in doc['nodes']if'mesh'in n)
 if actual_count>exp['budget']:errs.append('export placed budget')
 if doc.get('images')or doc.get('textures'):errs.append('unexpected texture dependency')
 if any(node.get('name','').startswith('STUDIO.')for node in doc['nodes']):errs.append('studio exported')
 bpy.ops.wm.read_factory_settings(use_empty=True);bpy.ops.import_scene.gltf(filepath=str(p/'exports/asset.glb')); imported=read_scene();g=imported['objects']; maxdim=0;maxanchor=0;minaxis=1
 if set(n)!=set(g):errs.append('import ID inventory')
 if imported['duplicates']:errs.append('import duplicate IDs')
 for sid in set(n)&set(g):
  a,b=n[sid],g[sid]
  if a['parent']!=b['parent']:errs.append('import parent '+sid)
  if a.get('materials')!=b.get('materials'):errs.append('import material slots '+sid)
  if a['kind']=='anchor':
   if json.loads(a['port_record']or'{}')!=json.loads(b['port_record']or'{}'):errs.append('import port semantics '+sid)
   maxanchor=max(maxanchor,(a['matrix'].translation-b['matrix'].translation).length)
  for i in range(3):minaxis=min(minaxis,a['matrix'].to_3x3().col[i].normalized().dot(b['matrix'].to_3x3().col[i].normalized()))
  if'bounds'in a and'bounds'in b:
   for i in range(3):
    da=a['bounds'][1][i]-a['bounds'][0][i];db=b['bounds'][1][i]-b['bounds'][0][i];maxdim=max(maxdim,abs(da-db))
    if abs(da-db)>max(.001,da*.01):errs.append('import bounds '+sid)
 if maxanchor>.001:errs.append('import anchor drift')
 if minaxis<=.999:errs.append('import axis drift')
 for name,a in native['materials'].items():
  b=imported['materials'].get(name)
  if not b or max(abs(x-y)for x,y in zip(a['color'],b['color']))>1/255 or abs(a['roughness']-b['roughness'])>.001 or abs(a['metallic']-b['metallic'])>.001:errs.append('import material '+name)
 result.update(status='PASS'if not errs else'FAIL',errors=sorted(set(errs)),native_triangles=native['triangles'],glb_unique_triangles=sum(counts),glb_placed_triangles=actual_count,objects=len(n),parts=sum(r['kind']=='part'for r in n.values()),anchors=len(anchors),motion_checked=motions,material_count=len(native['materials']),max_dimension_error_m=maxdim,max_anchor_error_m=maxanchor,min_axis_dot=minaxis,missing_dependencies=native['missing'],hashes={rel:hashlib.sha256((p/rel).read_bytes()).hexdigest()for rel in ['source/asset.blend','exports/asset.glb','metadata/ports.json']},runtime={'blender':bpy.app.version_string,'python':sys.version.split()[0]})
 return result
if __name__=='__main__':
 paths=sys.argv[sys.argv.index('--')+1:];results=[check(p)for p in paths];out=(Path(__file__).resolve().parent/'outputs')/('independent-'+ '-'.join(Path(p).parent.name+'_'+Path(p).name for p in paths)+'.json');out.write_text(json.dumps(results,indent=2));print('INDEPENDENT_RESULT',json.dumps(results));print('OUTPUT',out)
 if any(r['errors']for r in results):raise RuntimeError('independent QA failed')
