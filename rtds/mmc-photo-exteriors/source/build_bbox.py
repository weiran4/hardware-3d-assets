"""Original B-Box RCP 3.0 visual model. Blender 4.3, meters; no texture inputs.
Source proportions: vendor datasheet rev 02/05/24 pp2,16; photos brochure pp2–3.
"""
import bpy,math,json,sys
from pathlib import Path
from mathutils import Vector
args=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
if len(args)!=1:raise SystemExit('Usage: blender -b --python build_bbox.py -- OUTPUT_DIR')
P=Path(args[0]).resolve()
for name in ('metadata','exports','previews','source'):(P/name).mkdir(parents=True,exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
M={}
for n,c in {'case':(.64,.67,.69),'face':(.82,.84,.84),'black':(.009,.012,.014),'silver':(.42,.47,.49),'red':(.65,.008,.025),'gold':(.45,.27,.055),'lcd':(.20,.36,.39),'ink':(.012,.015,.018),'green':(.05,.32,.08)}.items():
 m=bpy.data.materials.new(n);m.diffuse_color=(*c,1);m.use_nodes=True;p=m.node_tree.nodes['Principled BSDF'];p.inputs['Base Color'].default_value=(*c,1);p.inputs['Roughness'].default_value=.75;p.inputs['Specular IOR Level'].default_value=0 if n in ['ink','black'] else .18;p.inputs['Metallic'].default_value=.55 if n=='silver' else 0;M[n]=m
objects=[]
def box(n,p,s,mat='black',bev=0):
 bpy.ops.mesh.primitive_cube_add(size=1,location=p);o=bpy.context.object;o.name=n;o.dimensions=s;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 if bev:
  mod=o.modifiers.new('edge','BEVEL');mod.width=bev;mod.segments=2;bpy.context.view_layer.objects.active=o;bpy.ops.object.modifier_apply(modifier=mod.name)
 o.data.materials.append(M[mat]);objects.append(o);return o
def cyl(n,x,y,z,r,d,mat='silver',v=16):
 bpy.ops.mesh.primitive_cylinder_add(vertices=v,radius=r,depth=d,location=(x,y,z),rotation=(math.pi/2,0,0));o=bpy.context.object;o.name=n;o.data.materials.append(M[mat]);objects.append(o);return o
def tor(n,x,y,z,r,t,mat='silver'):
 bpy.ops.mesh.primitive_torus_add(major_segments=32,minor_segments=6,location=(x,y,z),major_radius=r,minor_radius=t,rotation=(math.pi/2,0,0));o=bpy.context.object;o.name=n;o.data.materials.append(M[mat]);objects.append(o);return o
def text(n,t,x,z,size=.0022,rear=False,mat='ink'):
 cu=bpy.data.curves.new(n,'FONT');cu.body=t;cu.size=size;cu.align_x='CENTER';cu.align_y='CENTER';cu.resolution_u=3;o=bpy.data.objects.new(n,cu);bpy.context.collection.objects.link(o);o.location=(x,.1303 if rear else -.1303,z);o.rotation_euler=(math.pi/2,0,math.pi if rear else 0);cu.materials.append(M[mat]);objects.append(o);return o
# Plate envelope exactly 480.6 x 256.5 x 41.7 mm; controls project beyond it.
box('folded_chassis',(0,0,.02085),(.428,.2525,.0417),'case',.0005)
for rear in [False,True]:
 y=.12725 if rear else -.12725
 face=box('rear_sheet' if rear else 'front_sheet',(0,y,.02085),(.4806,.002,.0417),'face',.0004)
 for x in [-.232,.232]:
  for z in [.006,.0357]:
   tool=box('slot cutter',(x,y,z),(.009,.008,.006),'black',.0025);bpy.context.view_layer.objects.active=face;mo=face.modifiers.new('rack aperture','BOOLEAN');mo.object=tool;mo.operation='DIFFERENCE';bpy.ops.object.modifier_apply(modifier=mo.name);objects.remove(tool);bpy.data.objects.remove(tool,do_unlink=True)
# Coordinates transcribed from p2 drawing in normalized 0..1 face width.
def X(u,rear=False):return (.5-u if rear else u-.5)*.4806
def port(n,x,z,w,h,rear=False,mat='silver'):
 y=.130 if rear else -.130;sg=1 if rear else -1
 box(n+' surround',(x,y,z),(w,.003,h),mat,.00025);box(n+' recess',(x,y+sg*.0017,z),(w-.0016,.0004,h-.0016),'black')
 return y+sg*.002
# Ethernet and analog RJ45 sockets with latch step and visible contact strip.
def rj(n,u,z,rear=False,w=.0145,h=.012):
 x=X(u,rear);y=port(n,x,z,w,h,rear);sg=1 if rear else -1
 box(n+' latch',(x,y+sg*.0003,z+h*.38),(.004,.0005,.002),'black')
 for k in range(8):box(n+' contact',(x+(k-3.5)*.0012,y+sg*.0003,z+h*.28),(.00045,.0003,.002),'gold')
rj('Ethernet',.112,.0205,w=.016,h=.013);text('eth','ETHERNET',X(.112),.031,.002)
port('USB',X(.152),.0205,.0055,.013);text('usb','USB',X(.152),.031,.002)
cyl('rotary dial',X(.198),-.134,.021,.0094,.010,'black',32)
port('LCD bezel',X(.278),.021,.055,.017,mat='black');box('LCD glass',(X(.278),-.132,.021),(.052,.0006,.014),'lcd');text('lcd','B-Box\nReady',X(.273),.021,.0032,mat='ink').location.y=-.1325;text('config','CONFIG. & STATUS',X(.278),.032,.0022)
text('brand','imperix',X(.038),.025,.006);text('product','B-Box 3.0',X(.038),.015,.003)
for i in range(3):
 x=X(.366+i*.025);cyl('status led',x,-.130,.028,.0016,.002,'green',12);text('led'+str(i),['CORE','SYNC','USER'][i],x,.024,.0016)
for i in range(4):
 x=X(.356+i*.026);cyl('SMA ring',x,-.132,.014,.003,.006,'silver',16);cyl('SMA well',x,-.136,.014,.0016,.0005,'black',12);cyl('SMA pin',x,-.1364,.014,.0005,.0006,'gold',8);text('sma'+str(i),'A'+str(i),x,.0065,.002)
for row in range(2):
 for i in range(8):rj('ADC'+str(row*8+i),.469+i*.032,.030 if row==0 else .012,w=.014,h=.0115)
text('analog','ANALOG INPUTS',X(.58),.039,.0021)
for i in range(8):
 u=.731+i*.0237;x=X(u);text('D'+str(i),'D'+str(i),x,.034,.002)
 for z in [.025,.015]:
  box('POF housing',(x,-.131,z),(.0073,.006,.009),'black',.0006);cyl('POF red protective cap',x,-.136,z,.0034,.004,'red',16)
text('ix','i',X(.935),.016,.039,mat='red');text('ix2','x',X(.971),.013,.033)
# Rear left power bank, two circular fans with grille rings and spokes.
R=True
x=X(.099,R);port('AC rocker frame',x,.021,.019,.022,R,'black');box('AC rocker',(x,.133,.021),(.015,.003,.018),'black',.001);text('power mark','I',x,.026,.003,True,mat='face')
x=X(.169,R);port('IEC C14',x,.021,.030,.021,R,'black')
for dx,dz in [(-.008,0),(0,.004),(.008,0)]:box('AC pin',(x+dx,.1325,.021+dz),(.002,.002,.005),'silver')
for u in [.256,.329]:
 x=X(u,R);cyl('fan dark cavity',x,.130,.021,.012,.002,'black',32)
 for rad in [.006,.009,.012]:tor('fan grille',x,.132,.021,rad,.00055)
 cyl('fan hub',x,.133,.021,.0038,.001,'silver',20)
 for a in [math.pi/4,3*math.pi/4]:
  ob=box('grille crossbar',(x,.133,.021),(.025,.001,.001),'silver');ob.rotation_euler.y=a
 for dx in [-.012,.012]:
  for dz in [-.012,.012]:cyl('fan screw',x+dx,.132,.021+dz,.0015,.001,'silver',12)
# Four distinct VHDCI HD68 horizontal recesses, no invented pin electrical assignment.
for col,u in enumerate([.455,.570]):
 for row,z in enumerate([.023,.016]):
  x=X(u,R);port('VHDCI',x,z,.035,.0055,True)
  for k in range(17):box('VHDCI contact strip',(x+(k-8)*.0018,.132,z),(.0006,.0003,.0018),'gold')
  for dx in [-.019,.019]:cyl('VHDCI jack screw',x+dx,.132,z,.0018,.002,'silver',12)
  text('bank label',('INPUTS' if col==0 else 'OUTPUTS')+' ('+'ABCD'[col*2+row]+')',x,z+(.005 if row==0 else -.005),.002,True)
text('logic','LOGIC LEVEL\nFOR GPI/GPO',X(.39,R),.029,.0017,True);box('logic switch',(X(.394,R),.131,.017),(.002,.002,.005),'black')
port('electrical interlock',X(.632,R),.019,.009,.013,True,'black');text('interlock','INTERLOCK',X(.632,R),.030,.002,True)
port('USB console',X(.727,R),.024,.007,.004,True);text('console','USB\nCONSOLE',X(.727,R),.031,.0019,True)
text('rear brand','imperix',X(.679,R),.011,.006,True)
anchors={}
for i,u in enumerate([.797,.831,.864]):
 x=X(u,R);port('SFP '+str(i),x,.026,.0145,.010,True);text('SFP label'+str(i),['UP','DOWN 0','DOWN 1'][i],x,.035,.002,True)
 box('SFP lower lip',(x,.133,.0218),(.012,.001,.0007),'silver')
 anchors['sfp'+str(i)]={'position_blender_m':[x,.133,.026],'normal_blender':[0,1,0],'label':['UP','DOWN 0','DOWN 1'][i],'source':'Datasheet p2 rear view; PN122 maps SFP2 to DOWN 1'}
for u in [.785,.806]:
 x=X(u,True);box('rear optical interlock housing',(x,.131,.013),(.008,.005,.008),'black',.0004);cyl('rear optical red cap',x,.135,.013,.0032,.003,'red',16)
rj('CAN',.919,.020,True);text('CAN','CAN',X(.919,True),.032,.002,True)
# Small lid screws and side cooling slots, geometric not raster.
for x in [-.18,0,.18]:
 for y in [-.1,.10]:
  ob=cyl('lid screw',x,y,.042,.0016,.0007,'silver',12);ob.rotation_euler=(0,0,0)
for side in [-1,1]:
 for i in range(18):box('side ventilation',(side*.2142,-.105+i*.012,.021),(.0005,.006,.012),'black')
# Bake text and merge by material: no hundreds of WebGL draws.
for o in objects:
 if o.type=='FONT':
  bpy.context.view_layer.objects.active=o;o.select_set(True);bpy.ops.object.convert(target='MESH');o.select_set(False)
for mat in M:
 group=[o for o in bpy.context.scene.objects if o.type=='MESH' and o.data.materials and o.data.materials[0].name==mat]
 if group:
  bpy.ops.object.select_all(action='DESELECT')
  for o in group:o.select_set(True)
  bpy.context.view_layer.objects.active=group[0];bpy.ops.object.join();group[0].name='bbox3.geometry.'+mat
for n,rec in anchors.items():
 o=bpy.data.objects.new('bbox3.anchor.'+n,None);bpy.context.collection.objects.link(o);o.location=rec['position_blender_m'];o['semantic_id']=n;o['kind']='anchor';o['sid']='bbox.'+n;o['port_label']=rec['label'];o['outward_normal_gltf']=[0,0,-1]
o=bpy.data.objects.new('bbox3.anchor.rear_sfp_group',None);bpy.context.collection.objects.link(o);o.location=(X(.831,True),.133,.026);o['semantic_id']='rear_sfp_group';o['kind']='anchor';o['sid']='bbox.sfp-group';o['description']='outside rear panel, three cages; not front PWM'
anchors['rear_sfp_group']={'position_blender_m':list(o.location),'normal_blender':[0,1,0]}
(P/'metadata/anchors.json').write_text(json.dumps({'axis':'Blender Z up, front -Y, rear +Y; GLB exporter maps to Y up, front +Z, rear -Z','nominal_envelope_m':[.4806,.2565,.0417],'anchors':anchors},indent=2))
bpy.ops.export_scene.gltf(filepath=str(P/'exports/imperix-bbox-rcp.glb'),export_format='GLB',export_extras=True)
# Private studio previews. Orthographic face-on matches vendor p2 drawing.
sc=bpy.context.scene;sc.render.engine='CYCLES';sc.cycles.samples=12;sc.cycles.use_denoising=False
sc.world=bpy.data.worlds.new('World');sc.world.color=(.6,.6,.6)
for pos in [(0,-.5,.8),(0,.5,.8)]:
 d=bpy.data.lights.new('studio','AREA');d.energy=12;d.size=.8;o=bpy.data.objects.new('studio',d);sc.collection.objects.link(o);o.location=pos;o.rotation_euler=(Vector((0,0,.02))-o.location).to_track_quat('-Z','Y').to_euler()
d=bpy.data.cameras.new('camera');cam=bpy.data.objects.new('camera',d);sc.collection.objects.link(cam);sc.camera=cam;d.type='ORTHO';d.ortho_scale=.52
sc.view_settings.view_transform='AgX';sc.render.image_settings.file_format='PNG';sc.render.film_transparent=True
bpy.ops.wm.save_as_mainfile(filepath=str(P/'source/bbox3.blend'))
for side,sg in [('front',-1),('rear',1)]:
 cam.location=(0,sg,.02085);cam.rotation_euler=(Vector((0,0,.02085))-cam.location).to_track_quat('-Z','Y').to_euler()
 for w in [1200,390]:
  sc.render.resolution_x=w;sc.render.resolution_y=round(w*.17);sc.render.resolution_percentage=100;sc.render.filepath=str(P/'previews'/f'{side}-{w}.png');bpy.ops.render.render(write_still=True)
