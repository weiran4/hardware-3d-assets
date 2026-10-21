"""Reproducible CLI orchestration. Geometry lives in each asset's source/build.py."""
import sys,json,math,shutil,importlib.util,hashlib
from pathlib import Path
import bpy
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[1]; sys.path.insert(0,str(ROOT/'tools'))
from asset_common import material,dump,validate_contract
from qa_asset import measured_scene

def configure(c):
    import io_scene_gltf2
    assert bpy.app.version_string=='4.3.2',bpy.app.version_string
    assert sys.version_info[:3]==(3,13,5),sys.version
    assert io_scene_gltf2.bl_info['version']==(4,3,47),io_scene_gltf2.bl_info['version']
    print('RUNTIME',bpy.app.version_string,sys.version,io_scene_gltf2.bl_info['version'])
    bpy.ops.wm.read_factory_settings(use_empty=True); sc=bpy.context.scene; sc.unit_settings.system='METRIC'; sc.unit_settings.scale_length=1
    sc.render.engine='CYCLES'; sc.cycles.device='CPU'; sc.cycles.samples=c['render']['samples']; sc.cycles.use_denoising=False; sc.cycles.seed=c['seed']
    sc.render.resolution_x=sc.render.resolution_y=c['render']['resolution']; sc.render.resolution_percentage=100; sc.render.image_settings.file_format='PNG'; sc.render.film_transparent=False
    sc.view_settings.view_transform=c['render']['view_transform']; sc.view_settings.look='Medium High Contrast' if False else 'None'; sc.view_settings.exposure=c['render']['exposure']; sc.view_settings.gamma=1
    sc.world=bpy.data.worlds.new('Cream studio'); sc.world.use_nodes=True; sc.world.node_tree.nodes['Background'].inputs[0].default_value=(.78,.82,.90,1); sc.world.node_tree.nodes['Background'].inputs[1].default_value=c['render'].get('world_strength',.45)
    return sc

def presentation(config,report):
    sc=bpy.context.scene
    bpy.ops.mesh.primitive_plane_add(size=200,location=(0,0,-.0015)); o=bpy.context.object; o.name='STUDIO.ground'; o.data.materials.append(material('paper'))
    for name,pos,energy,size in [('key',config['render']['light_position'],config['render']['light_energy'],config['render']['light_size']),('fill',[1.1,.3,1.2],config['render'].get('fill_energy',5),1.8)]:
        ld=bpy.data.lights.new('STUDIO.'+name,'AREA'); ld.energy=energy; ld.shape='DISK'; ld.size=size; ob=bpy.data.objects.new('STUDIO.'+name,ld); sc.collection.objects.link(ob); ob.location=pos; ob.rotation_euler=(Vector((0,0,.06))-ob.location).to_track_quat('-Z','Y').to_euler()
    cam=bpy.data.cameras.new('STUDIO.ortho'); ob=bpy.data.objects.new('STUDIO.ortho',cam); sc.collection.objects.link(ob); cam.type='ORTHO'; cam.lens=45; cam.clip_start=.001; cam.clip_end=200; sc.camera=ob
    sc.render.use_freestyle=True; fs=bpy.context.view_layer.freestyle_settings; fs.crease_angle=math.radians(110)
    ls=fs.linesets[0] if len(fs.linesets) else fs.linesets.new('Ink contour'); ls.select_silhouette=True; ls.select_border=True; ls.select_crease=False
    if ls.linestyle is None: ls.linestyle=bpy.data.linestyles.new('Ink outline')
    outline=bpy.data.collections.new('STUDIO.outline-members'); sc.collection.children.link(outline)
    for obj in sc.objects:
        if obj.get('sid') and (obj.type=='MESH' or (obj.type=='CURVE' and obj['sid'].endswith('.body'))) and '.grid_' not in obj['sid']: outline.objects.link(obj)
    ls.select_by_collection=True; ls.collection=outline; ls.collection_negation='INCLUSIVE'
    ls.linestyle.color=(.018,.025,.023); ls.linestyle.thickness=config['render'].get('outline_px',1.6)
    orient_camera(config,report,'iso')

def orient_camera(config,report,view):
    sc=bpy.context.scene; bounds=report['asset_bounds_m']; center=Vector([(bounds[0][i]+bounds[1][i])/2 for i in range(3)])
    dirs={'iso':config['render']['camera_direction'],'neutral':config['render']['camera_direction'],'wireframe':config['render']['camera_direction'],'front':[0,-1,0],'rear':[0,1,0],'left':[-1,0,0],'right':[1,0,0],'top':[0,0,1]}
    d=Vector(dirs[view]).normalized(); sc.camera.location=center+d*1.5; sc.camera.rotation_euler=(-d).to_track_quat('-Z','Y').to_euler(); bpy.context.view_layer.update()
    inv=sc.camera.matrix_world.inverted(); corners=[inv@Vector((x,y,z)) for x in [bounds[0][0],bounds[1][0]] for y in [bounds[0][1],bounds[1][1]] for z in [bounds[0][2],bounds[1][2]]]
    span=max(max(p[i] for p in corners)-min(p[i] for p in corners) for i in [0,1]); sc.camera.data.ortho_scale=span*config['render']['camera_margin']

def export_glb(path):
    bpy.ops.object.select_all(action='DESELECT')
    curves=[o for o in bpy.context.scene.objects if o.get('sid') and o.type in {'CURVE','FONT'}]
    for o in curves:
        bpy.ops.object.select_all(action='DESELECT'); o.select_set(True); bpy.context.view_layer.objects.active=o; bpy.ops.object.convert(target='MESH')
    bpy.ops.object.select_all(action='DESELECT')
    for o in bpy.context.scene.objects:
        if o.get('sid'): o.select_set(True)
    bpy.ops.export_scene.gltf(filepath=str(path),export_format='GLB',use_selection=True,export_yup=True,export_apply=True,export_extras=True,export_animations=False,export_cameras=False,export_lights=False)

def wire_overlay():
    deps=bpy.context.evaluated_depsgraph_get(); made=[]; hidden=[]
    for o in list(bpy.context.scene.objects):
        if not o.get('sid') or o.type not in {'MESH','CURVE','FONT'}: continue
        mesh=bpy.data.meshes.new_from_object(o.evaluated_get(deps)); copy=bpy.data.objects.new('WIRE.'+o.name,mesh); bpy.context.collection.objects.link(copy); copy.matrix_world=o.matrix_world.copy(); mesh.materials.clear(); mesh.materials.append(material('white')); mesh.materials.append(material('ink'))
        for poly in mesh.polygons: poly.material_index=0
        w=copy.modifiers.new('Diagnostic wire only','WIREFRAME'); w.thickness=.00010; w.use_replace=False; w.material_offset=1; w.use_even_offset=True
        o.hide_render=True; hidden.append(o); made.append(copy)
    return made,hidden

def main():
    import argparse
    parser=argparse.ArgumentParser(); parser.add_argument('--asset',required=True); parser.add_argument('--output',required=True); parser.add_argument('--seed',type=int,default=42); parser.add_argument('--views',default='iso,neutral,wireframe,front,rear,left,right,top'); args=parser.parse_args(sys.argv[sys.argv.index('--')+1:])
    source=ROOT/'generic'/args.asset; output=Path(args.output).resolve()
    if output.exists(): raise RuntimeError('Refusing to overwrite checkpoint '+str(output))
    c=json.loads((source/'parameters.json').read_text()); assert args.seed==c['seed']; c['project_root']=str(ROOT)
    output.mkdir(parents=True)
    for folder in ['source','exports','previews','qa','references','metadata','snapshot/tools']: (output/folder).mkdir(parents=True,exist_ok=True)
    shutil.copy2(source/'parameters.json',output/'parameters.json'); shutil.copy2(source/'references/manifest.json',output/'references/manifest.json'); shutil.copy2(source/'source/build.py',output/'source/build.py')
    for f in (ROOT/'tools').glob('*.py'): shutil.copy2(f,output/'snapshot/tools'/f.name)
    configure(c); spec=importlib.util.spec_from_file_location('asset_builder',source/'source/build.py'); mod=importlib.util.module_from_spec(spec); spec.loader.exec_module(mod); built=mod.build_asset(c); bpy.context.view_layer.update()
    authority=source/'metadata/ports.json'
    if authority.is_file():
        portdata=json.loads(authority.read_text()); anchors={o['sid']:o for o in bpy.context.scene.objects if o.get('kind')=='anchor'}
        if set(anchors)!=set(p['id'] for p in portdata['ports']): raise RuntimeError('Authoritative sidecar IDs do not match geometry')
        for record in portdata['ports']: anchors[record['id']]['port_record']=json.dumps(record,sort_keys=True)
    report=measured_scene(c); errors=validate_contract(report,c); dump(output/'qa/build_measurements.json',report)
    if errors: raise RuntimeError(errors)
    dump(output/'metadata/ports.json',{'asset_id':args.asset,'unit':'m','frame':'BLENDER_Z_UP_FRONT_NEG_Y','ports':report['port_records']}); dump(output/'metadata/parts.json',built)
    presentation(c,report); bpy.ops.wm.save_as_mainfile(filepath=str(output/'source/asset.blend')); export_glb(output/'exports/asset.glb'); bpy.ops.wm.open_mainfile(filepath=str(output/'source/asset.blend'))
    for view in args.views.split(','):
        orient_camera(c,report,view); sc=bpy.context.scene; sc.render.use_freestyle=view not in {'neutral','wireframe'}; made=[]; hidden=[]
        if view=='wireframe': made,hidden=wire_overlay()
        sc.render.filepath=str(output/'previews'/f'{view}.png'); bpy.ops.render.render(write_still=True)
        for ob in made: bpy.data.objects.remove(ob,do_unlink=True)
        for ob in hidden: ob.hide_render=False
        print('RENDER',view,sc.render.filepath,flush=True)
    files={str(f.relative_to(output)):hashlib.sha256(f.read_bytes()).hexdigest() for f in output.rglob('*') if f.is_file()}
    dump(output/'checkpoint.json',{'asset_id':args.asset,'seed':args.seed,'status':'built; external reopen and roundtrip QA required','files_sha256':files}); print('PASS BUILD',args.asset,report['placed_triangles'],flush=True)
if __name__=='__main__': main()
