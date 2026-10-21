"""Read saved Blender geometry, motion, materials and semantic anchors independently."""
import sys,json,math
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parent))
from asset_common import BASIS,digest,dump,validate_contract

def measured_scene(config):
    import bpy
    from mathutils import Vector, Quaternion
    deps=bpy.context.evaluated_depsgraph_get(); deps.update()
    obs=sorted([o for o in bpy.context.scene.objects if o.get('sid')],key=lambda o:o['sid'])
    roots=[o for o in obs if o.get('kind')=='root']; primary=next(o for o in roots if o['sid']==config['asset_id']+'.root')
    geometry=[]; unique={}; placed=0; curve_tris=0; allpoints=[]; objects={}; mats={}; bindings={}
    for o in obs:
        sid=o['sid']; rec={'sid':sid,'parent':o.parent.get('sid') if o.parent else None,'kind':o.get('kind'),'matrix_world':[[round(v,6) for v in row] for row in o.matrix_world]}
        if o.type in {'MESH','CURVE','FONT','SURFACE'}:
            ev=o.evaluated_get(deps); me=ev.to_mesh(); me.calc_loop_triangles(); n=len(me.loop_triangles); placed+=n
            if o.type=='CURVE': curve_tris+=n
            pts=[o.matrix_world@v.co for v in me.vertices]; allpoints.extend(pts)
            if pts: rec['bounds']=[[min(p[i] for p in pts) for i in range(3)],[max(p[i] for p in pts) for i in range(3)]]
            geo={'verts':[[round(x,6) for x in v.co] for v in me.vertices],'tris':[list(t.vertices) for t in me.loop_triangles]}
            unique[(o.data.as_pointer(),digest(geo))]=n; geometry.append([sid,rec['matrix_world'],geo]); rec['triangles']=n
            for m in me.materials:
                if not m: continue
                bs=m.node_tree.nodes.get('Principled BSDF') if m.use_nodes else None
                key=m.get('material_id',m.name.split('.00')[0]); mats[key]={'base_color':[round(float(x),7) for x in (bs.inputs['Base Color'].default_value if bs else m.diffuse_color)],'roughness':round(float(bs.inputs['Roughness'].default_value if bs else m.roughness),7)}
            rec['materials']=[m.get('material_id',m.name.split('.00')[0]) for m in me.materials if m]
            bindings[sid]={'slots':rec['materials'],'face_material_indices':[p.material_index for p in me.polygons]}
            ev.to_mesh_clear()
        objects[sid]=rec
    bounds=[[min(p[i] for p in allpoints) for i in range(3)],[max(p[i] for p in allpoints) for i in range(3)]]
    body=next((o for o in obs if o['sid']==config['asset_id']+'.body'),None)
    bodydims=None
    if body and body.type=='MESH':
        ev=body.evaluated_get(deps); me=ev.to_mesh(); vs=[body.matrix_local.to_3x3()@v.co for v in me.vertices]; bodydims=[max(p[i] for p in vs)-min(p[i] for p in vs) for i in range(3)]; ev.to_mesh_clear()
    ports=[]; meta_errors=[]
    for o in obs:
        if o.get('kind')!='anchor': continue
        rec=json.loads(o.get('port_record','{}')); ports.append(rec)
        actual=list(o.location); q=o.rotation_quaternion if o.rotation_mode=='QUATERNION' else o.rotation_euler.to_quaternion()
        if not rec or rec.get('id')!=o['sid'] or rec.get('parent_id')!=(o.parent.get('sid') if o.parent else None): meta_errors.append(o.name+':id/parent')
        if max(abs(a-b) for a,b in zip(actual,rec.get('position_m',[100]*3)))>1e-6: meta_errors.append(o.name+':position')
        normal=q@Vector((0,0,1))
        if normal.dot(Vector(rec.get('normal',[0,0,0])))<.999: meta_errors.append(o.name+':normal')
    missing=[]
    for im in bpy.data.images:
        if im.source=='FILE' and not im.packed_file and im.filepath and not Path(bpy.path.abspath(im.filepath)).is_file(): missing.append(im.filepath)
    for lib in bpy.data.libraries:
        if not Path(bpy.path.abspath(lib.filepath)).is_file(): missing.append(lib.filepath)
    root_drift=0.; other_drift=0.; motions=[]; axis_drift=0.; pivot_drift=0.; marker_displacements=[]
    for o in obs:
        if not o.get('motion'): continue
        before={x.name:x.matrix_world.copy() for x in obs}; loc=o.location.copy(); mode=o.rotation_mode; rot=o.rotation_euler.copy(); quat=o.rotation_quaternion.copy(); base_q=o.rotation_euler.to_quaternion() if mode!='QUATERNION' else quat.copy(); axis_before=o.matrix_world.to_quaternion()@Vector((0,0,1)); pivot_before=o.matrix_world.translation.copy()
        for sign in [-1,1]:
            if o['motion']=='rotation':
                o.rotation_mode='QUATERNION'; o.rotation_quaternion=base_q@Quaternion((0,0,1),sign*math.radians(15))
            else: o.location.y=loc.y+sign*.001
            bpy.context.view_layer.update()
            if o['motion']=='rotation':
                axis_drift=max(axis_drift,((o.matrix_world.to_quaternion()@Vector((0,0,1)))-axis_before).length); pivot_drift=max(pivot_drift,(o.matrix_world.translation-pivot_before).length)
                for child in o.children:
                    if child.get('sid','').endswith('_pointer'): marker_displacements.append((child.matrix_world.translation-before[child.name].translation).length)
            for x in obs:
                if x==o or x in o.children_recursive: continue
                delta=max(abs(x.matrix_world[i][j]-before[x.name][i][j]) for i in range(4) for j in range(4))
                if x in roots: root_drift=max(root_drift,delta)
                else: other_drift=max(other_drift,delta)
        o.location=loc; o.rotation_mode=mode; o.rotation_euler=rot; o.rotation_quaternion=quat; bpy.context.view_layer.update(); motions.append(o['sid'])
    rot=primary.matrix_world.to_quaternion(); basis={k:list(rot@Vector(v)) for k,v in BASIS.items()}
    report={'asset_id':config['asset_id'],'unit_scale':bpy.context.scene.unit_settings.scale_length,'body_dimensions_m':bodydims,'asset_bounds_m':bounds,'basis':basis,'negative_scale_count':sum(any(s<=0 for s in o.scale) for o in obs),'root_drift_m':root_drift,'other_part_drift_m':other_drift,'motion_checked_ids':motions,'motion_axis_max_drift':axis_drift,'motion_pivot_max_drift':pivot_drift,'motion_marker_min_displacement':min(marker_displacements) if marker_displacements else None,'root_at_ground':abs(primary.location.z)<1e-6,'part_ids':[o['sid'] for o in obs if o.get('kind')=='part'],'anchor_ids':[o['sid'] for o in obs if o.get('kind')=='anchor'],'all_ids':[o['sid'] for o in obs],'port_records':ports,'metadata_errors':meta_errors,'sidecar_present':True,'unique_triangles':sum(unique.values()),'placed_triangles':placed,'curve_mesh_triangles':curve_tris,'missing_resources':missing,'geometry_digest':digest(geometry),'semantic_digest':digest([[o['sid'],objects[o['sid']]['parent'],o.get('port_record')] for o in obs]),'material_digest':digest({'values':mats,'bindings':bindings}),'objects':objects,'materials':mats,'material_bindings':bindings,'runtime':{'blender':bpy.app.version_string,'python':sys.version.split()[0],'engine':bpy.context.scene.render.engine,'device':bpy.context.scene.cycles.device}}
    if config['asset_id']=='signal-cable' and body and body.type=='CURVE':
        sp=body.data.splines[0]; coords=[Vector(p.co[:3]) for p in sp.points]
        report.update(cable_length_m=sum((b-a).length for a,b in zip(coords,coords[1:])),cable_diameter_m=2*body.data.bevel_depth,connector_count=sum(o['sid'] in ['signal-cable.connector_a','signal-cable.connector_b'] for o in obs))
    return report

def inspect_asset(asset_dir,config):
    import bpy
    p=Path(asset_dir); bpy.ops.wm.open_mainfile(filepath=str((p/'source/asset.blend').resolve()))
    r=measured_scene(config); side=p/'metadata/ports.json'; r['sidecar_present']=side.is_file()
    if side.is_file():
        data=json.loads(side.read_text()); records=sorted(data['ports'],key=lambda x:x['id']); measured=sorted(r['port_records'],key=lambda x:x['id'])
        if records!=measured: r['metadata_errors'].append('sidecar/object records differ')
    r['errors']=validate_contract(r,config)
    if r['metadata_errors']: r['errors'].append('metadata')
    r['status']='PASS' if not r['errors'] else 'FAIL'; return r

if __name__=='__main__':
    import argparse
    p=argparse.ArgumentParser(); p.add_argument('--asset-dir',required=True); a=p.parse_args(sys.argv[sys.argv.index('--')+1:]); path=Path(a.asset_dir)
    c=json.loads((path/'parameters.json').read_text()); r=inspect_asset(path,c); dump(path/'qa/report.json',r); print(r['status'],c['asset_id'],'triangles',r['placed_triangles'],'errors',r['errors'])
    if r['errors']: raise RuntimeError(r['errors'])
