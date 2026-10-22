"""Original editable GTSOC V2 copper16 visual reconstruction.
Photographs establish topology, not mechanical-fit dimensions. No source bitmap.
"""
import bpy,sys,math,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3];P=Path(__file__).resolve().parents[1];A=P.name
sys.path.insert(0,str(ROOT/'tools'));sys.path.insert(0,str(ROOT/'rtds/connectors'))
from asset_common import root,tag,material,PALETTE
from library import anchor_from_record
PALETTE.update({'soc_black':(.028,.033,.038,1),'soc_well':(.006,.009,.012,1),'soc_blue':(.015,.24,.49,1),'soc_white':(.84,.86,.82,1),'soc_center':(.34,.42,.50,1),'soc_silver':(.49,.54,.57,1),'soc_gold':(.65,.46,.18,1),'soc_yellow':(.52,.63,.12,1),'soc_red':(.52,.045,.035,1),'soc_led':(.035,.055,.042,1)})
V=[(-.5,-.5,-.5),(.5,-.5,-.5),(.5,.5,-.5),(-.5,.5,-.5),(-.5,-.5,.5),(.5,-.5,.5),(.5,.5,.5),(-.5,.5,.5)];F=[(0,3,2,1),(4,5,6,7),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7)];CACHE={}
def mesh(name,vs,fs,parent,mat,loc=(0,0,0),feature=None):
 key=(tuple(vs),tuple(fs),mat)
 if key not in CACHE:
  me=bpy.data.meshes.new(A+'.mesh.'+name);me.from_pydata(vs,[],fs);me.update();me.materials.append(material(mat));CACHE[key]=me
 o=bpy.data.objects.new(A+'.'+name,CACHE[key]);bpy.context.collection.objects.link(o);tag(o,A,name,parent);o.location=loc
 if feature:o['interface_feature']=feature
 return o
def box(name,loc,size,parent,mat='soc_black',feature=None):return mesh(name,[(v[0]*size[0],v[1]*size[1],v[2]*size[2]) for v in V],F,parent,mat,loc,feature)
def cyl(name,loc,ro,depth,parent,mat='soc_silver',feature=None,n=20):
 vs=[(ro*math.cos(i*2*math.pi/n),ro*math.sin(i*2*math.pi/n),z) for z in [-depth/2,depth/2] for i in range(n)];fs=[tuple(range(n-1,-1,-1)),tuple(range(n,2*n))]+[(i,(i+1)%n,n+(i+1)%n,n+i) for i in range(n)]
 return mesh(name,vs,fs,parent,mat,loc,feature)
def ring(name,loc,ro,ri,depth,parent,mat='soc_silver',feature=None,n=24):
 vs=[(r*math.cos(i*2*math.pi/n),r*math.sin(i*2*math.pi/n),z) for z,r in [(-depth/2,ro),(depth/2,ro),(-depth/2,ri),(depth/2,ri)] for i in range(n)];fs=[]
 for i in range(n):
  j=(i+1)%n;fs.extend([(i,j,n+j,n+i),(n+i,n+j,3*n+j,3*n+i),(2*n+j,2*n+i,3*n+i,3*n+j),(j,i,2*n+i,2*n+j)])
 return mesh(name,vs,fs,parent,mat,loc,feature)
def text(name,body,x,z,size,parent,rear=False,y=None,mat='soc_white',align='CENTER'):
 cu=bpy.data.curves.new(A+'.'+name,'FONT');cu.body=body;cu.size=size;cu.align_x=align;cu.align_y='CENTER';cu.resolution_u=1
 o=bpy.data.objects.new(A+'.'+name,cu);bpy.context.collection.objects.link(o);tag(o,A,name,parent);o.location=(x,y if y is not None else (.15125 if rear else -.15125),z);o.rotation_euler=(math.pi/2,0,math.pi if rear else 0);cu.materials.append(material(mat));o['surface_annotation']=True;return o
def combine_boxes(name,items,parent,mat='soc_black'):
 vs=[];fs=[]
 for loc,size in items:
  n=len(vs);vs += [(loc[0]+v[0]*size[0],loc[1]+v[1]*size[1],loc[2]+v[2]*size[2]) for v in V];fs += [tuple(n+i for i in f) for f in F]
 o=mesh(name,vs,fs,parent,mat);o['chassis_structure']=True;return o
def panel(name,y,w,h,holes,parent):
 xs=sorted(set([-w/2,w/2]+[x for l,r,b,t in holes for x in [l,r]]));zs=sorted(set([0,h]+[z for l,r,b,t in holes for z in [b,t]]));boxes=[]
 for x1,x2 in zip(xs,xs[1:]):
  for z1,z2 in zip(zs,zs[1:]):
   x=(x1+x2)/2;z=(z1+z2)/2
   if not any(l<x<r and b<z<t for l,r,b,t in holes):boxes.append(((x,y,z),(x2-x1,.002,z2-z1)))
 return combine_boxes(name,boxes,parent)
def copper(a,sfp=True):
 b=a['idpart'];a['connector_family']='copper_sfp_visual' if sfp else 'ethernet_visual'
 w=.014;h=.015 if sfp else .013
 for side in [-1,1]:box(b+'.side'+str(side),(side*w/2,0,-.005),(.0007,h,.010),a,'soc_silver' if sfp else 'soc_black','mount_support')
 for side in [-1,1]:box(b+'.edge'+str(side),(0,side*h/2,-.005),(w+.0007,.0007,.010),a,'soc_silver' if sfp else 'soc_black','mount_support')
 box(b+'.well',(0,0,-.0095),(w,.013,.001),a,'soc_well')
 box(b+'.key_slot',(0,.0045,-.0084),(.004,.004,.0022),a,'soc_well','key_slot')
 for side in [-1,1]:box(b+'.key_shoulder'+str(side),(side*.0046,.0049,-.004),(.0047,.0035,.008),a,'soc_black','key_shoulder')
 box(b+'.contact_bed',(0,-.005,-.005),(.011,.0025,.008),a,'soc_black')
 box(b+'.contact_carrier',(0,-.0027,-.0088),(.011,.002,.0014),a,'soc_black')
 for i in range(8):
  o=box(b+'.contact'+str(i+1),((i-3.5)*.001,-.0032,-.0047),(.00040,.00042,.0078),a,'soc_gold','contact');o.rotation_euler.x=.20
 if sfp:
  for side in [-1,1]:
   box(b+'.bail_arm'+str(side),(side*.0058,.0064,.00055),(.0007,.0024,.0012),a,'soc_silver')
   box(b+'.bail_marker'+str(side),(side*.0052,.0072,.0012),(.0014,.0014,.001),a,'soc_yellow')
  box(b+'.bail_crossbar',(0,.0076,.0007),(.0114,.00075,.0009),a,'soc_silver')
 else:
  for side in [-1,1]:box(b+'.led'+str(side),(side*.005,-.0058,.0001),(.0013,.0007,.0005),a,'soc_led')
def usb(a):
 b=a['idpart'];a['connector_family']='usb_b_shaped_visual';outer=[(-.0057,-.0056),(.0057,-.0056),(.0057,.0027),(.0035,.0056),(-.0035,.0056),(-.0057,.0027)];inner=[(x*.85,y*.83) for x,y in outer];vs=[]
 for z,pts in [(-.009,outer),(0,outer),(0,inner),(-.009,inner)]:vs += [(x,y,z) for x,y in pts]
 fs=[]
 for i in range(6):j=(i+1)%6;fs.extend([(i,j,6+j,6+i),(6+i,6+j,12+j,12+i),(12+i,12+j,18+j,18+i)])
 mesh(b+'.shell',vs,fs,a,'soc_silver',feature='mount_support');box(b+'.well',(0,0,-.009),(.010,.010,.0005),a,'soc_well');box(b+'.tongue',(0,-.0005,-.0065),(.0064,.0048,.005),a,'soc_black')
 for i,(x,y) in enumerate([(-.002,-.0015),(.002,-.0015),(-.002,.0005),(.002,.0005)],1):box(b+'.contact'+str(i),(x,y,-.0039),(.0008,.0007,.0005),a,'soc_gold','contact')
def optical(a):
 b=a['idpart'];a['connector_family']='blue_duplex_observed_exterior';a['cap_status']='unknown'
 box(b+'.back',(0,0,-.0035),(.014,.009,.005),a,'soc_blue','mount_support')
 for side in [-1,1]:box(b+'.side'+str(side),(side*.0069,0,-.0005),(.0008,.009,.002),a,'soc_blue')
 box(b+'.bottom',(0,-.00415,-.0005),(.014,.0007,.002),a,'soc_blue');box(b+'.middle',(0,0,-.0005),(.0006,.008,.002),a,'soc_blue')
 for i,x in enumerate([-.0034,.0034],1):
  for side in [-1,1]:box(b+f'.key_shoulder{i}_{side}',(x+side*.00225,.0038,-.0005),(.0018,.001,.002),a,'soc_blue')
  box(b+'.key_slot'+str(i),(x,.0032,-.00085),(.0025,.002,.0005),a,'soc_well','key_slot')
  ring(b+'.white_face'+str(i),(x,-.00045,-.0004),.00275,.00155,.002,a,'soc_white','observed_white_face')
  cyl(b+'.neutral_center'+str(i),(x,-.00045,-.0004),.00154,.0014,a,'soc_center','neutral_filled_center')
def ac(a):
 b=a['idpart'];a['connector_family']='switched_fused_ac_inlet_visual';outer=[(-.014,-.012),(.014,-.012),(.018,-.004),(.018,.044),(.014,.048),(-.014,.048),(-.018,.044),(-.018,-.004)];vs=[]
 for z in [-.009,-.003]:vs += [(x,y,z) for x,y in outer]
 fs=[tuple(range(7,-1,-1)),tuple(range(8,16))]+[(i,(i+1)%8,8+(i+1)%8,8+i) for i in range(8)]
 mesh(b+'.housing',vs,fs,a,'soc_black',feature='mount_support')
 # Open chamfered inlet is in front of the mounting housing; its well is behind blades.
 pts=[(-.012,-.008),(.012,-.008),(.012,.004),(.008,.008),(-.008,.008),(-.012,.004)]
 vv=[(x,y,z) for z in [-.002,0] for x,y in pts];ff=[(i,(i+1)%6,6+(i+1)%6,6+i) for i in range(6)];mesh(b+'.inlet_rim',vv,ff,a,'soc_black');box(b+'.well',(0,0,-.0025),(.023,.015,.0012),a,'soc_well')
 for i,(x,y) in enumerate([(-.006,-.003),(.006,-.003),(0,.0035)],1):box(b+'.blade'+str(i),(x,y,-.0007),(.0013,.003,.0025),a,'soc_silver','contact')
 box(b+'.switch_bezel',(0,.024,-.001),(.025,.017,.004),a,'soc_well');box(b+'.rocker',(0,.024,.0012),(.021,.012,.001),a,'soc_black');box(b+'.fuse_drawer',(0,.040,-.0007),(.026,.010,.005),a,'soc_well');box(b+'.fuse_mark',(0,.040,.0014),(.006,.0025,.0004),a,'soc_red')
def mounting_collar(a,p):
 # Estimated hidden mechanical support, not a claim about manufacturer's fastening design.
 group=p['group'];w,h,cy={'front_sfp':(.0148,.0158,0),'service':(.012,.012,0),'rear_eth':(.0152,.014,0),'rear_optical':(.015,.0092,0),'ac_power':(.037,.061,.018)}[group]
 panel_y=.150 if p['position_m'][1]>0 else -.150;z=(panel_y-p['position_m'][1])*p['normal'][1]
 for axis in [0,1]:
  for sign in [-1,1]:
   loc=(sign*w/2,cy,z) if axis==0 else (0,cy+sign*h/2,z);size=(.0012,h+.0012,.0025) if axis==0 else (w+.0012,.0012,.0025)
   o=box(a['idpart']+'.panel_collar_'+str(axis)+'_'+str(sign),loc,size,a,'soc_black','panel_collar');o['collar_outside_axis']=axis;o['collar_outside_sign']=sign

def build_asset(config):
 r=root(A);r['asset_state']='source_grounded_visual_variant_with_secondary_gaps';r['mating_certified']=False
 combine_boxes('body',[((0,0,.001),(.426,.300,.002)),((0,0,.087),(.426,.300,.002)),((-.212,0,.044),(.002,.300,.088)),((.212,0,.044),(.002,.300,.088))],r)
 ps=json.loads((P/'metadata/ports.json').read_text())['ports'];front=[];rear=[]
 for p in ps:
  x,y,z=p['position_m'];group=p['group']
  if y<0:
   ww,hh=(.0148,.0158) if group=='front_sfp' else (.012,.012);front.append((x-ww/2,x+ww/2,z-hh/2,z+hh/2))
  elif group=='ac_power':rear.append((x-.0185,x+.0185,z-.0125,z+.0485))
  elif group=='rear_optical':rear.append((x-.0075,x+.0075,z-.0046,z+.0046))
  else:rear.append((x-.0076,x+.0076,z-.007,z+.007))
 # True rack-ear holes, not painted circles.
 for x in [-.232,.232]:
  for z in [.006,.082]:front.append((x-.0055,x+.0055,z-.003,z+.003))
 rear.append((.103,.159,.015,.073));panel('front_panel',-.150,.483,.088,front,r);panel('rear_panel',.150,.426,.088,rear,r)
 # Narrow white source-layout border and grouping boxes; these are original mesh lines.
 def frame(name,x,z,w,h,rearview=False):
  # Printed ink exists only on the real panel, clipped around actual apertures.
  y=.15112 if rearview else -.15112;holes=rear if rearview else front
  def pieces(lo,hi,spans):
   cuts=sorted(set([lo,hi]+[max(lo,min(hi,v)) for ab in spans for v in ab]))
   return [(a,b) for a,b in zip(cuts,cuts[1:]) if b>a and not any(l<(a+b)/2<r for l,r in spans)]
  for s in [-1,1]:
   zz=z+s*h/2;xx=x+s*w/2
   for j,(a,b) in enumerate(pieces(x-w/2,x+w/2,[(l,r) for l,r,bt,t in holes if bt-.00018<zz<t+.00018])):box(name+'h'+str(s)+'_'+str(j),((a+b)/2,y,zz),(b-a,.00015,.00035),r,'soc_white')
   for j,(a,b) in enumerate(pieces(z-h/2,z+h/2,[(bt,t) for l,r,bt,t in holes if l-.00018<xx<r+.00018])):box(name+'v'+str(s)+'_'+str(j),(xx,y,(a+b)/2),(.00035,.00015,b-a),r,'soc_white')
 frame('front_border',0,.044,.408,.061)
 text('model','GTSOC V2',0,.081,.0078,r);text('front_title','SFP PORTS',-.030,.067,.0070,r);text('brand_original','RTDS',.162,.060,.014,r)
 for col,x in enumerate([-.090,-.075,-.060,-.045,-.018,-.003,.012,.027]):
  text('upper_number'+str(col),str(col*2+1),x,.0545,.0046,r);text('lower_number'+str(col),str(col*2+2),x,.0482,.0046,r)
 frame('sfp_group_left',-.0675,.036,.064,.047);frame('sfp_group_right',.0045,.036,.064,.047)
 text('monitor','MONITOR',-.1475,.0425,.0052,r);text('ps','PS',-.157,.0357,.0048,r);text('pl','PL',-.138,.0357,.0048,r);text('prog','PROG',-.119,.0425,.0052,r);text('jtag','JTAG',-.119,.0357,.0048,r)
 text('pwr','PWR',-.189,.029,.0048,r);text('rst','RST',-.173,.029,.0048,r)
 box('pwr_led',(-.189,-.1519,.020),(.005,.002,.003),r,'soc_led');box('reset',(-.173,-.152,.021),(.0034,.002,.0034),r,'soc_white')
 for p in ps:
  a=anchor_from_record(p,r)
  if p['group'] in ['front_sfp','rear_eth']:copper(a,p['group']=='front_sfp')
  elif p['group']=='service':usb(a)
  elif p['group']=='rear_optical':optical(a)
  else:ac(a)
  mounting_collar(a,p)
 # Rear fan grille: open annuli and diagonal struts over a dark fan, not a flat label.
 for rad in [.026,.019,.011]:
  o=ring('fan_ring'+str(rad),(.131,.153,.044),rad,rad-.0012,.0015,r,'soc_black',n=32);o.rotation_euler.x=math.pi/2
 for z in [.015,.073]:box('fan_h'+str(z),(.131,.152,z),(.058,.003,.003),r,'soc_black')
 for x in [.103,.159]:box('fan_v'+str(x),(x,.152,.044),(.003,.003,.058),r,'soc_black')
 o=cyl('fan_deep',(.131,.141,.044),.027,.002,r,'soc_well',n=32);o.rotation_euler.x=math.pi/2
 for s in [-1,1]:
  o=box('fan_strut'+str(s),(.131,.153,.044),(.064,.002,.0018),r,'soc_black');o.rotation_euler.y=s*math.pi/4
 for x in [.105,.157]:
  for z in [.018,.070]:
   o=cyl('fan_screw'+str(x)+str(z),(x,.154,.001+z),.0025,.001,r,'soc_silver',n=16);o.rotation_euler.x=math.pi/2
 for rad,depth,mat in [(.018,.003,'soc_black'),(.0145,.0032,'soc_well'),(.012,.0034,'soc_black')]:
  o=cyl('rear_blank'+str(rad),(.040,.1515,.044),rad,depth,r,mat,n=32);o.rotation_euler.x=math.pi/2
 text('rear_eth','ETH',.002,.027,.007,r,True);text('rear_ports','PORTS',-.038,.078,.007,r,True)
 frame('rear_port_border',-.038,.046,.033,.048,True)
 for n,x,z in [(1,-.031,.065),(3,-.045,.065),(2,-.031,.027),(4,-.045,.027)]:text('rear_number'+str(n),str(n),x,z,.0063,r,True)
 box('model_plate',(-.123,.1512,.046),(.039,.0003,.042),r,'soc_white');text('plate_brand','RTDS',-.123,.059,.0063,r,True,y=.15145,mat='soc_black');text('plate_model','GTSOC-2A',-.123,.048,.0042,r,True,y=.15145,mat='soc_black');text('plate_input','100-240 V\n50 / 60 Hz',-.123,.036,.0032,r,True,y=.15145,mat='soc_black')
 # Original power-state lettering is not a certification or copied label.
 text('ac_state','I  O',-.184,.049,.0035,r,True,y=.156)
 for rearview in [False,True]:
  for x in [-.207,.207]:
   for z in [.012,.076]:
    o=cyl('panel_screw'+str(rearview)+str(x)+str(z),(x,.152 if rearview else -.152,z),.0024,.001,r,'soc_black',n=16);o.rotation_euler.x=math.pi/2
 return {'asset_id':A,'model_plate':'GTSOC-2A','front_population':'16 copper RJ45 SFP modules','purpose':'visual reference; all insertion/mating validation disabled','original_geometry':True,'source_bitmaps':False,'parts':{o['sid']:o.name for o in bpy.context.scene.objects if o.get('kind')=='part'},'unknowns':['enclosure exact dimensions and side/underside construction','rear white-feature cap-versus-sleeve state','manufacturer part IDs and mating tolerances','electrical and optical compatibility']}
