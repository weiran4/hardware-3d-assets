"""Shared pure contract plus lazy-import Blender construction helpers (meters)."""
import json, math, hashlib
from pathlib import Path

BASIS={'right':[1,0,0],'up':[0,0,1],'front':[0,-1,0]}
PORT_FIELDS={'id','parent_id','anchor_name','label','connector','signal_type','direction','position_m','orientation_wxyz','normal','physical_compatibility','electrical_constraints'}
def validate_contract(r,c):
    e=[]
    if abs(r.get('unit_scale',0)-1)>1e-8: e.append('units')
    if any(sum(a*b for a,b in zip(r.get('basis',{}).get(k,[0,0,0]),v))<=.999 for k,v in BASIS.items()): e.append('axes')
    if 'body_dimensions_m' in c and any(abs(a-b)>max(b*.01,.001) for a,b in zip(r.get('body_dimensions_m',[0,0,0]),c['body_dimensions_m'])): e.append('dimensions')
    if not set(c.get('required_part_ids',[]))<=set(r.get('part_ids',[])): e.append('parts')
    if not set(c.get('required_anchor_ids',[]))<=set(r.get('anchor_ids',[])): e.append('anchors')
    ids=r.get('all_ids',r.get('part_ids',[])+r.get('anchor_ids',[]))
    if len(ids)!=len(set(ids)): e.append('duplicate_ids')
    if r.get('placed_triangles',float('inf'))>c['triangle_budget']: e.append('budget')
    if r.get('missing_resources'): e.append('resources')
    if r.get('negative_scale_count',0): e.append('negative_scale')
    if r.get('root_drift_m',0)>1e-6: e.append('root_motion')
    if r.get('other_part_drift_m',0)>1e-6: e.append('part_motion')
    if any(not PORT_FIELDS<=set(p) for p in r.get('port_records',[])): e.append('metadata')
    if 'cable_length_m' in c:
        if abs(r.get('cable_length_m',0)-c['cable_length_m'])>.006: e.append('cable_length')
        if abs(r.get('cable_diameter_m',0)-c['cable_diameter_m'])>.0001: e.append('cable_diameter')
        if r.get('connector_count')!=2: e.append('connectors')
    if r.get('metadata_errors') or not r.get('sidecar_present',False): e.append('metadata')
    if 'roundtrip' in r: e.extend(roundtrip_errors(r['roundtrip'],c))
    return sorted(set(e))

def roundtrip_errors(r,c):
    mapping={'missing_ids':'anchors','duplicate_ids':'duplicate_ids','parent_mismatches':'parents','material_mismatches':'materials','metadata_errors':'metadata'}
    e=[code for key,code in mapping.items() if r.get(key)]
    if not r.get('sidecar_present',False): e.append('metadata')
    if not r.get('curve_mesh_present',False): e.append('curves')
    if r.get('axis_min_dot',0)<=.999: e.append('axes')
    if r.get('anchor_max_error_m',float('inf'))>.001: e.append('anchors')
    if r.get('placed_triangles',float('inf'))>c['triangle_budget']: e.append('budget')
    return sorted(set(e))

def compare_runs(a,b):
    e=[]
    for key,code in [('geometry_digest','geometry'),('semantic_digest','metadata'),('material_digest','materials')]:
        if not a.get(key) or a.get(key)!=b.get(key): e.append(code)
    if a.get('missing_resources') or b.get('missing_resources'): e.append('resources')
    return e

def digest(value):
    return hashlib.sha256(json.dumps(value,sort_keys=True,separators=(',',':')).encode()).hexdigest()

def dump(path,value):
    p=Path(path); p.parent.mkdir(parents=True,exist_ok=True); p.write_text(json.dumps(value,indent=2,ensure_ascii=False)+'\n')

PALETTE={'cream':(.76,.75,.64,1),'paper':(.80,.75,.64,1),'ink':(.035,.046,.050,1),'blue':(.29,.40,.43,1),'coral':(.72,.25,.14,1),'sage':(.39,.54,.40,1),'screen':(.065,.12,.105,1),'grid':(.16,.25,.19,1),'trace':(.72,.85,.43,1),'metal':(.52,.59,.56,1),'rubber':(.075,.095,.10,1),'gold':(.73,.55,.24,1),'white':(.86,.87,.80,1)}
def material(key):
    import bpy
    name='palette.'+key
    if name in bpy.data.materials: return bpy.data.materials[name]
    m=bpy.data.materials.new(name); m.use_nodes=True; m.diffuse_color=PALETTE[key]; m['material_id']=name
    bs=m.node_tree.nodes.get('Principled BSDF'); bs.inputs['Base Color'].default_value=PALETTE[key]; bs.inputs['Roughness'].default_value=.82
    bs.inputs['Metallic'].default_value=0
    return m

def root(asset_id):
    import bpy
    o=bpy.data.objects.new(asset_id+'.root',None); bpy.context.collection.objects.link(o); o['sid']=asset_id+'.root'; o['asset_id']=asset_id; o['kind']='root'; o.empty_display_size=.03
    return o

def tag(o,asset_id,part,parent,kind='part'):
    o.name=asset_id+'.'+part; o['sid']=o.name; o['asset_id']=asset_id; o['kind']=kind; o.parent=parent
    return o

def box(asset,part,loc,size,mat,parent,bevel=.0015):
    import bpy
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc); o=bpy.context.object; o.dimensions=size
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    tag(o,asset,part,parent); o.data.materials.append(material(mat))
    if bevel:
        mod=o.modifiers.new('Edge bevel | 1 segment','BEVEL'); mod.width=bevel; mod.segments=1
        mod=o.modifiers.new('Weighted face normals','WEIGHTED_NORMAL'); mod.keep_sharp=True; mod.weight=50
    return o

def cylinder(asset,part,loc,radius,depth,mat,parent,vertices=16,bevel=.0006):
    import bpy
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices,radius=radius,depth=depth,location=loc,rotation=(math.pi/2,0,0))
    o=bpy.context.object; tag(o,asset,part,parent); o.data.materials.append(material(mat))
    if bevel:
        mod=o.modifiers.new('Rim bevel | 1 segment','BEVEL'); mod.width=bevel; mod.segments=1
        mod=o.modifiers.new('Weighted face normals','WEIGHTED_NORMAL'); mod.keep_sharp=True
    return o

def ring(asset,part,loc,outer,inner,depth,mat,parent,n=16):
    import bpy
    verts=[]
    for z,r in [(-depth/2,outer),(depth/2,outer),(-depth/2,inner),(depth/2,inner)]:
        verts += [(r*math.cos(i*2*math.pi/n),r*math.sin(i*2*math.pi/n),z) for i in range(n)]
    faces=[]
    for i in range(n):
        j=(i+1)%n
        faces.extend([(i,j,n+j,n+i),(n+i,n+j,3*n+j,3*n+i),(2*n+j,2*n+i,3*n+i,3*n+j),(j,i,2*n+i,2*n+j)])
    me=bpy.data.meshes.new(asset+'.'+part); me.from_pydata(verts,[],faces); me.update()
    o=bpy.data.objects.new(asset+'.'+part,me); bpy.context.collection.objects.link(o); o.location=loc; o.rotation_euler=(math.pi/2,0,0); tag(o,asset,part,parent); me.materials.append(material(mat)); return o

def text_label(asset,part,body,loc,size,mat,parent,align='LEFT'):
    import bpy
    cu=bpy.data.curves.new(asset+'.'+part,'FONT'); cu.body=body; cu.size=size; cu.align_x=align; cu.align_y='CENTER'; cu.resolution_u=1; cu.extrude=0
    o=bpy.data.objects.new(asset+'.'+part,cu); bpy.context.collection.objects.link(o); o.location=loc; o.rotation_euler=(math.pi/2,0,0); tag(o,asset,part,parent); cu.materials.append(material(mat)); return o

def path_curve(asset,part,points,radius,mat,parent,cyclic=False):
    import bpy
    cu=bpy.data.curves.new(asset+'.'+part,'CURVE'); cu.dimensions='3D'; cu.resolution_u=1; cu.bevel_depth=radius; cu.bevel_resolution=0; cu.resolution_u=1; cu.use_fill_caps=True
    sp=cu.splines.new('POLY'); sp.points.add(len(points)-1)
    for p,co in zip(sp.points,points): p.co=(*co,1)
    sp.use_cyclic_u=cyclic
    o=bpy.data.objects.new(asset+'.'+part,cu); bpy.context.collection.objects.link(o); tag(o,asset,part,parent); cu.materials.append(material(mat)); return o

def knob(asset,part,loc,r,parent,mat='cream'):
    o=cylinder(asset,part,loc,r,.014,mat,parent,24,.001)
    o['motion']='rotation'; o['motion_axis_local']='Z'
    shaft=cylinder(asset,part+'_shaft',(0,0,-.008),r*.32,.008,'rubber',o,12,0); shaft.rotation_euler=(0,0,0)
    # Marker is parented in shaft-local coordinates, so turning the knob carries it only.
    marker=box(asset,part+'_pointer',(0,r*.58,.0077),(.0013,r*.55,.0008),'ink',o,.0002)
    return o

def anchor(asset,pid,position,parent,label,direction,rotation=None):
    import bpy
    from mathutils import Quaternion
    o=bpy.data.objects.new(asset+'.'+pid,None); bpy.context.collection.objects.link(o); tag(o,asset,pid,parent,'anchor'); o.location=position; o.rotation_mode='QUATERNION'; o.rotation_quaternion=rotation or Quaternion((1,0,0),math.pi/2); o.empty_display_type='ARROWS'; o.empty_display_size=.012
    record={'id':asset+'.'+pid,'parent_id':parent['sid'],'anchor_name':o.name,'label':label,'connector':'generic_coaxial_visual','signal_type':'unknown','direction':direction,'position_m':list(position),'orientation_wxyz':list(o.rotation_quaternion),'normal':list(o.rotation_quaternion@__import__('mathutils').Vector((0,0,1))),'physical_compatibility':'unknown','electrical_constraints':None}
    o['port_record']=json.dumps(record,sort_keys=True); return o

def socket(asset,pid,loc,parent,label,direction,accent='cream'):
    x,y,z=loc
    cylinder(asset,'port_'+pid+'_base',(x,y+.002,z),.0095,.005,accent,parent,16)
    ring(asset,'port_'+pid,(x,y-.004,z),.0074,.0049,.010,'metal',parent)
    cylinder(asset,'port_'+pid+'_well',(x,y-.0008,z),.0048,.001,'ink',parent,16,0)
    cylinder(asset,'port_'+pid+'_pin',(x,y-.0022,z),.0011,.003,'gold',parent,8,0)
    for sign in [-1,1]: box(asset,'port_'+pid+'_lug_'+str(sign),(x+sign*.0076,y-.003,z),(.003,.003,.003),'metal',parent,.0003)
    return anchor(asset,pid,(x,y-.009,z),parent,label,direction)

def result(asset,r):
    import bpy
    obs=[o for o in bpy.data.objects if o.get('asset_id')==asset]
    return {'asset_id':asset,'root':r.name,'parts':{o['sid']:o.name for o in obs if o.get('kind')=='part'},'anchors':{o['sid']:o.name for o in obs if o.get('kind')=='anchor'}}
