"""Actual GLB clean-import geometry, semantic hierarchy and material comparison."""
import sys,json,struct
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parent))
from asset_common import dump,roundtrip_errors
from qa_asset import measured_scene

def glb_counts(path):
    blob=Path(path).read_bytes(); length,typ=struct.unpack_from('<II',blob,12); doc=json.loads(blob[20:20+length]); meshes=doc.get('meshes',[])
    counts=[sum(doc['accessors'][p['indices']]['count']//3 for p in m['primitives'] if p.get('mode',4)==4) for m in meshes]
    return {'unique_triangles':sum(counts),'placed_triangles':sum(counts[n['mesh']] for n in doc['nodes'] if 'mesh' in n),'exported_vertices':sum(doc['accessors'][p['attributes']['POSITION']]['count'] for m in meshes for p in m['primitives'])}

def check_roundtrip(asset_dir,config):
    import bpy
    from mathutils import Matrix,Vector
    p=Path(asset_dir); bpy.ops.wm.open_mainfile(filepath=str((p/'source/asset.blend').resolve())); native=measured_scene(config)
    bpy.ops.wm.read_factory_settings(use_empty=True); bpy.ops.import_scene.gltf(filepath=str((p/'exports/asset.glb').resolve())); bpy.context.view_layer.update()
    imported=measured_scene(config)
    n=native['objects']; g=imported['objects']; missing=sorted(set(n)-set(g)); dup=[x for x in imported['all_ids'] if imported['all_ids'].count(x)>1]; parents=[]; materials=[]; dimerr=0.; axisdot=1.; anchorerr=0.
    for sid in set(n)&set(g):
        if n[sid]['parent']!=g[sid]['parent']: parents.append(sid)
        if n[sid].get('materials')!=g[sid].get('materials'): materials.append(sid+':slots')
        if 'bounds' in n[sid] and 'bounds' in g[sid]:
            for i in range(3):
                d=n[sid]['bounds'][1][i]-n[sid]['bounds'][0][i]; v=g[sid]['bounds'][1][i]-g[sid]['bounds'][0][i]; err=abs(d-v); dimerr=max(dimerr,err)
                if err>max(d*.01,.001): materials.append(sid+':dimension')
        a=Matrix(n[sid]['matrix_world']); b=Matrix(g[sid]['matrix_world'])
        for i in range(3): axisdot=min(axisdot,a.to_3x3().col[i].normalized().dot(b.to_3x3().col[i].normalized()))
        if n[sid]['kind']=='anchor': anchorerr=max(anchorerr,(a.translation-b.translation).length)
    for k,v in native['materials'].items():
        other=imported['materials'].get(k)
        if not other or max(abs(a-b) for a,b in zip(v['base_color'],other['base_color']))>1/255 or abs(v['roughness']-other['roughness'])>.001: materials.append(k)
    curve_ids=[sid for sid in n if sid.endswith('.body') and sid.startswith('signal-cable.') or sid.endswith('.trace')]
    curves_present=all(sid in g and g[sid].get('triangles',0)>0 for sid in curve_ids)
    counts=glb_counts(p/'exports/asset.glb'); errors=[]
    for condition,error in [(missing,'missing_ids'),(dup,'duplicate_ids'),(parents,'parents'),(materials,'materials'),(axisdot<=.999,'axes'),(anchorerr>.001,'anchors'),(not curves_present,'curves'),(counts['placed_triangles']>config['triangle_budget'],'budget')]:
        if condition: errors.append(error)
    sidecar=p/'metadata/ports.json'; metadata_errors=list(imported['metadata_errors'])+list(native['metadata_errors'])
    native_ports=sorted(native['port_records'],key=lambda x:x.get('id','')); imported_ports=sorted(imported['port_records'],key=lambda x:x.get('id',''))
    if native_ports!=imported_ports: metadata_errors.append('full native/imported port semantics differ')
    if sidecar.is_file() and sorted(json.loads(sidecar.read_text()).get('ports',[]),key=lambda x:x.get('id',''))!=native_ports: metadata_errors.append('native/authoritative sidecar differ')
    result={'asset_id':config['asset_id'],'status':'PASS' if not errors else 'FAIL','errors':errors,'metadata_errors':metadata_errors,'sidecar_present':sidecar.is_file(),'dimension_error_m':dimerr,'axis_min_dot':axisdot,'anchor_max_error_m':anchorerr,'missing_ids':missing,'duplicate_ids':dup,'parent_mismatches':parents,'material_mismatches':materials,'curve_mesh_present':curves_present,**counts,'imported_object_count':len(imported['all_ids']),'export_settings':{'format':'GLB','export_yup':True,'export_extras':True,'export_apply':True,'export_animations':False,'outline_exported':False,'background_exported':False},'limitations':['Freestyle contours, studio background and illumination are Blender presentation only','No electrical compatibility, simulation or animation clips claimed','Blender round trip is not certification of every external viewer']}
    result['errors']=sorted(set(errors+roundtrip_errors(result,config))); result['status']='PASS' if not result['errors'] else 'FAIL'; return result

if __name__=='__main__':
    import argparse
    parser=argparse.ArgumentParser(); parser.add_argument('--asset-dir',required=True); a=parser.parse_args(sys.argv[sys.argv.index('--')+1:]); p=Path(a.asset_dir); c=json.loads((p/'parameters.json').read_text()); r=check_roundtrip(p,c); dump(p/'qa/roundtrip.json',r); print(r['status'],r)
    if r['errors']: raise RuntimeError(r['errors'])
