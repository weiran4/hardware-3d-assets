"""Original GTDI V2 PCB 2.01 visual candidate; no copied source textures.
Terminal-plug population follows manual Fig9.9. Service contacts are not invented.
"""
import bpy,sys,math,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
sys.path.insert(0,str(ROOT/'tools'));sys.path.insert(0,str(ROOT/'rtds/connectors'))
from asset_common import material,PALETTE,root,tag
from library import anchor_from_record,sfp_duplex
A='gtdi-v2-2.01'
PALETTE.update({'gtdi_pcb':(.019,.040,.135,1),'gtdi_green':(.10,.36,.22,1),'gtdi_carrier':(.055,.28,.17,1),'gtdi_silk':(.79,.82,.76,1),'gtdi_ceramic':(.47,.38,.23,1),'gtdi_chip':(.035,.042,.039,1),'gtdi_led':(.08,.18,.10,1)})
CUBE_V=[(-.5,-.5,-.5),(.5,-.5,-.5),(.5,.5,-.5),(-.5,.5,-.5),(-.5,-.5,.5),(.5,-.5,.5),(.5,.5,.5),(-.5,.5,.5)]
CUBE_F=[(0,3,2,1),(4,5,6,7),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7)]
def mesh(name,vs,fs,parent,mat,loc=(0,0,0),feature=None):
 m=bpy.data.meshes.new(A+'.'+name);m.from_pydata(vs,[],fs);m.update();o=bpy.data.objects.new(A+'.'+name,m);bpy.context.collection.objects.link(o);tag(o,A,name,parent);o.location=loc;m.materials.append(material(mat))
 if feature:o['interface_feature']=feature
 return o

def box(name,loc,size,parent,mat='gtdi_chip',feature=None):
 return mesh(name,[(v[0]*size[0],v[1]*size[1],v[2]*size[2]) for v in CUBE_V],CUBE_F,parent,mat,loc,feature)

def cyl(name,loc,r,d,parent,mat='rtds_silver',feature=None,n=20):
 v=[(r*math.cos(2*math.pi*i/n),r*math.sin(2*math.pi*i/n),z) for z in [-d/2,d/2] for i in range(n)];f=[tuple(range(n-1,-1,-1)),tuple(range(n,2*n))]
 f += [(i,(i+1)%n,n+(i+1)%n,n+i) for i in range(n)]
 return mesh(name,v,f,parent,mat,loc,feature)

def ring(name,loc,ro,ri,d,parent,mat='rtds_silver',feature=None,n=20):
 v=[(r*math.cos(2*math.pi*i/n),r*math.sin(2*math.pi*i/n),z) for z,r in [(-d/2,ro),(d/2,ro),(-d/2,ri),(d/2,ri)] for i in range(n)];f=[]
 for i in range(n):
  j=(i+1)%n;f += [(i,j,n+j,n+i),(n+i,n+j,3*n+j,3*n+i),(2*n+j,2*n+i,3*n+i,3*n+j),(j,i,2*n+i,2*n+j)]
 return mesh(name,v,f,parent,mat,loc,feature)

def text(name,body,loc,size,parent,mat='gtdi_silk',rotation=None,align='LEFT'):
 cu=bpy.data.curves.new(A+'.'+name,'FONT');cu.body=body;cu.size=size;cu.align_x=align;cu.align_y='CENTER';cu.resolution_u=1
 o=bpy.data.objects.new(A+'.'+name,cu);bpy.context.collection.objects.link(o);tag(o,A,name,parent);o.location=loc;cu.materials.append(material(mat))
 if rotation:o.rotation_euler=rotation
 return o

def terminal(p,r):
 a=anchor_from_record(p,r);a['connector_family']='phoenix_1803604';base=p['id'].removeprefix(A+'.')
 # Local axes: row +X = board +Y; +Y = height; +Z = wire approach/outward.
 # Plug-specific envelope W19.84 × H11.1 × L16.1 mm; installed PCB header is estimated.
 w=.01984; h=.0111; L=.0161
 box(base+'.rear_web',(0,0,-.0108),(w,h,.0008),a,'gtdi_green')
 box(base+'.bottom',(0,-h/2+.0004,-.0055),(w,.0008,.011),a,'gtdi_green')
 box(base+'.front_upper_band',(0,.0028,-.001),(w,.0055,.002),a,'gtdi_green')
 box(base+'.roof_back',(0,.00505,-.0092),(w,.001,.0032),a,'gtdi_green')
 for i in range(6):box(base+'.septum'+str(i),((i-2.5)*.00381,0,-.0055),(.00065,h,.011),a,'gtdi_green')
 for i,label in enumerate(p['contact_labels']):
  x=(2-i)*.00381
  box(base+'.wire_recess'+str(i),(x,-.002,-.0088),(.0029,.0043,.00035),a,'rtds_well')
  box(base+'.contact'+str(i),(x,-.002,-.0074),(.0023,.0024,.0007),a,'rtds_silver','contact')
  # Screw access rings lie in the horizontal top plane; slotted heads are inset.
  o=ring(base+'.screw_well'+str(i),(x,.0050,-.0054),.00178,.00133,.0011,a,'gtdi_green');o.rotation_euler.x=math.pi/2
  o=cyl(base+'.screw'+str(i),(x,.00455,-.0054),.00125,.0006,a,'rtds_silver','slotted_screw');o.rotation_euler.x=math.pi/2
  box(base+'.slot'+str(i),(x,.0049,-.0054),(.0018,.0002,.0003),a,'rtds_well')
  # Female mating-tongue geometry is on the hidden rear side, not the wire-entry mouth.
  box(base+'.mating_finger'+str(i),(x,0,-.0135),(.00275,.0078,.0052),a,'gtdi_green')
  # Original annotation on the plug shoulder; ordinal direction matches upright board.
  o=text(base+'.label'+str(i),label,(x,.00562,-.0085),.00145 if len(label)<3 else .00095,a,'rtds_black',align='CENTER');o.rotation_mode='QUATERNION';o.rotation_quaternion=a.rotation_quaternion.inverted()
 # Estimated dual-tier PCB header behind each installed removable plug.
 header_h=p['position_m'][2]+.0035-.0076 # Observed tall header silhouette must meet PCB surface.
 box(base+'.pcb_header',(0,.0035-header_h/2,-.0175),(w,header_h,.004),a,'gtdi_carrier')
 return a

def power(p,r):
 a=anchor_from_record(p,r);a['connector_family']='keyed_1x4_power';a['key_profile']='left_chamfered_1x4';base=p['id'].removeprefix(A+'.')
 # Component-side outline has corner chamfers on left long side, seen in manual Fig9.4.
 xy=[(-.0036,-.012),(.0044,-.012),(.0044,.012),(-.0036,.012),(-.005,.0106),(-.005,-.0106)]
 inner=[(x*.78,y*.92) for x,y in xy];v=[]
 for z,pts in [(.0076-p['position_m'][2],xy),(0,xy),(0,inner),(-.007,inner)]:v += [(x,y,z) for x,y in pts]
 f=[]
 for i in range(6):j=(i+1)%6;f.extend([(i,j,6+j,6+i),(6+i,6+j,12+j,12+i),(12+i,12+j,18+j,18+i)])
 mesh(base+'.keyed_shroud',v,f,a,'rtds_white')
 box(base+'.well',(0,0,-.0075),(.007,.021,.001),a,'rtds_plate')
 for i,label in enumerate(p['contact_labels']):
  y=.009-i*.006
  cyl(base+'.contact'+str(i),(0,y,-.004),.00085,.006,a,'rtds_silver','contact',16)
  if label is not None:text(base+'.contact_label'+str(i),label,(.006,y,.00775-p['position_m'][2]),.0015,a,'gtdi_silk')
 return a

def service(p,r):
 a=anchor_from_record(p,r);a['connector_family']='unresolved_service_outline';base=p['id'].removeprefix(A+'.')
 # No hypothetical contact count, keyed insert or pinout is added.
 w=.015 if 'usb' not in base else .0075;d=.0065 if 'usb' not in base else .0034;h=p['position_m'][2]-.0076
 for x in [-w/2,w/2]:box(base+'.side'+str(x),(x,0,-h/2),(.0007,d,h),a,'rtds_black' if 'usb' not in base else 'rtds_silver')
 for y in [-d/2,d/2]:box(base+'.edge'+str(y),(0,y,-h/2),(w,.0007,h),a,'rtds_black' if 'usb' not in base else 'rtds_silver')
 box(base+'.dark_unresolved_well',(0,0,-h+.0002),(w-.001,d-.001,.0002),a,'rtds_well')
 return a

def build_asset(config):
 r=root(A);r['asset_state']='visual_candidate_with_service_detail_gaps'
 # Photo-estimated PCB dimensions and carrier, not a manufacturer mechanical drawing.
 box('carrier',(0,0,.003),(.104,.194,.006),r,'gtdi_carrier')
 box('body',(0,0,.0068),(.100,.190,.0016),r,'gtdi_pcb')
 for x in [-.051,.051]:box('carrier_lip'+str(x),(x,0,.006),(.002,.194,.006),r,'gtdi_green')
 for y in [-.096,.096]:box('carrier_end'+str(y),(0,y,.006),(.104,.002,.006),r,'gtdi_green')
 # DIN attachment underside is not visible in reference: no invented latch mechanism.
 for y in [-.061,.061]:box('underside_support'+str(y),(0,y,.001),(.070,.009,.002),r,'gtdi_carrier')
 for x,y in [(-.043,.091),(-.043,.052),(-.043,-.002),(-.043,-.062),(-.043,-.091),(.044,.091),(.044,-.002),(.044,-.091)]:
  ring('mount_ring'+str(x)+str(y),(x,y,.0078),.0025,.0015,.0006,r,'rtds_contact');cyl('screw'+str(x)+str(y),(x,y,.0081),.0018,.0007,r,'rtds_silver',n=16)
 # Two large metal optical cages flank a round finned heat sink.
 for i,y in [(1,.027),(2,-.025)]:
  # Open metal shell: never put a solid wall across the optical receptacle.
  for z in [.00755,.01605]:box('optical_cage_'+str(i)+'_z'+str(z),(-.024,y,z),(.054,.015,.0005),r,'rtds_silver')
  for sy in [-1,1]:box('optical_cage_'+str(i)+'_side'+str(sy),(-.024,y+sy*.00725,.0118),(.054,.0005,.009),r,'rtds_silver')
  for row in range(3):
   for col in range(5):
    cyl(f'cage_{i}_vent_{row}_{col}',(-.045+col*.009,y+(row-1)*.0045,.01635),.00075,.00015,r,'rtds_well',n=12)
  text('gt_label'+str(i),'GT PORT '+str(i),(-.044,y-.010,.00775),.0020,r)
  box('link_led'+str(i),(-.037,y-.010,.009),(.0025,.0012,.001),r,'gtdi_led')
 cyl('heatsink_core',(-.013,-.0005,.0143),.0145,.0134,r,'rtds_black',n=40) # Hidden support joins existing fins to the PCB.
 for i in range(5):
  cyl('heatsink_fin'+str(i),(-.013,-.0005,.009+i*.0023),.0185,.0015,r,'rtds_black',n=40)
 ring('heatsink_top',(-.013,-.0005,.020),.0185,.0015,.002,r,'rtds_black',n=40)
 # DIP switches: eight physical rockers, no claimed configuration/state.
 box('dip_body',(-.009,.042,.0108),(.022,.009,.006),r,'rtds_black')
 for i in range(8):
  x=-.0185+i*.0027
  box('dip_switch'+str(i+1),(x,.042,.0142),(.0015,.0045,.0012),r,'rtds_white','dip_switch')
  text('dip_label'+str(i+1),str(i+1),(x,.0368,.00775),.0013,r,align='CENTER')
 text('dip_on','ON',(-.019,.0476,.00775),.0016,r)
 # ID display is unlit; segments model topology without an invented running card number.
 box('id_display',(.003,.072,.010),(.0085,.013,.0048),r,'rtds_plate')
 for i,(x,y,sx,sy) in enumerate([(0,.004,.005,.00065),(0,0,.005,.00065),(0,-.004,.005,.00065),(-.0028,.002,.00065,.0033),(.0028,.002,.00065,.0033),(-.0028,-.002,.00065,.0033),(.0028,-.002,.00065,.0033)]):box('display_segment'+str(i),(.003+x,.072+y,.0125),(sx,sy,.00025),r,'rtds_white')
 text('card_id','CARD ID',(-.001,.062,.00775),.0019,r)
 # Simplified semiconductor rows preserve blue-board rhythm without reproducing unknown circuitry.
 for col,x in enumerate([.014,.022]):
  for i in range(32):
   y=.089-i*.00565
   box(f'input_ic_{col}_{i}',(x,y,.0088),(.005,.0031,.002),r,'gtdi_chip')
   for side in [-1,1]:
    for pin in range(3):box(f'input_leg_{col}_{i}_{side}_{pin}',(x+side*.003,y+(pin-1)*.00085,.0084),(.0011,.00032,.00045),r,'rtds_silver')
 for x,y,w,h in [(-.027,.069,.012,.013),(-.028,.049,.008,.009),(.005,.052,.009,.009),(.005,-.052,.010,.012),(-.017,-.066,.012,.009),(-.040,.007,.010,.012),(-.040,-.012,.010,.011)]:
  box('ic'+str(x)+str(y),(x,y,.0092),(w,h,.003),r,'gtdi_chip')
 for k in range(52):
  x=-.032+(k%7)*.0058;y=.083-(k//7)*.004
  if -.02<x<.015 and .035<y<.077:continue
  box('passive'+str(k),(x,y,.0081),(.002,.001,.001),r,'gtdi_ceramic')
 for k in range(50):
  x=-.032+(k%7)*.006;y=-.042-(k//7)*.0048
  if abs(x+.011)<.010 and y<-.071:continue
  box('lower_passive'+str(k),(x,y,.0081),(.0018,.001,.001),r,'gtdi_ceramic')
 cyl('electrolytic',(-.027,.071,.013),.005,.009,r,'rtds_silver',n=24)
 cyl('electrolytic_cap',(-.027,.071,.0176),.0045,.0004,r,'rtds_plate',n=24)
 box('reset_switch',(.003,-.062,.010),(.006,.0038,.004),r,'rtds_plate');box('reset_button',(.003,-.062,.0123),(.0028,.0028,.001),r,'rtds_black')
 text('reset_label','CARD RESET',(-.003,-.067,.00775),.0016,r)
 text('board_model','GTDI Version 2.01',(-.027,-.088,.00775),.0029,r)
 text('maker_plain','RTDS',(-.019,-.082,.00775),.004,r)
 text('power_label','POWER\n+24V\n+5V\nBANK 1\nBANK 2',(-.046,-.044,.00775),.0017,r)
 # All inspectable/interactive metadata stays separate from cosmetic geometry.
 ports=json.loads((ROOT/'rtds'/A/'metadata/ports.json').read_text())['ports']
 for p in ports:
  if p['group']=='digital_input':terminal(p,r)
  elif p['group']=='power':power(p,r)
  elif p['group']=='optical':sfp_duplex(anchor_from_record(p,r))
  else:service(p,r)
 return {'asset_id':A,'hardware_version':'GTDI V2','pcb_revision':'2.01','asset_state':'visual_candidate_with_service_detail_gaps','population':'16 Phoenix1803604 plugs installed as manual Fig9.9; PCB headers estimated','source_photo_reproduction':False,'service_interfaces':'hollow silhouettes; contact geometry intentionally absent pending close-ups'}
