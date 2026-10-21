"""Original GTAO V2 PCB 2.20 visual candidate; no copied source textures.
Terminal-plug population follows manual Figures6.2 and6.10. Service contacts are not invented.
"""
import bpy,sys,math,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
sys.path.insert(0,str(ROOT/'tools'));sys.path.insert(0,str(ROOT/'rtds/connectors'))
from asset_common import material,PALETTE,root,tag
from library import anchor_from_record,sfp_duplex
A='gtao-v2-2.20'
PALETTE.update({'gtao_pcb':(.019,.040,.135,1),'gtao_green':(.10,.36,.22,1),'gtao_carrier':(.055,.28,.17,1),'gtao_silk':(.79,.82,.76,1),'gtao_ceramic':(.47,.38,.23,1),'gtao_chip':(.035,.042,.039,1),'gtao_led':(.08,.18,.10,1)})
CUBE_V=[(-.5,-.5,-.5),(.5,-.5,-.5),(.5,.5,-.5),(-.5,.5,-.5),(-.5,-.5,.5),(.5,-.5,.5),(.5,.5,.5),(-.5,.5,.5)]
CUBE_F=[(0,3,2,1),(4,5,6,7),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7)]
def mesh(name,vs,fs,parent,mat,loc=(0,0,0),feature=None):
 m=bpy.data.meshes.new(A+'.'+name);m.from_pydata(vs,[],fs);m.update();o=bpy.data.objects.new(A+'.'+name,m);bpy.context.collection.objects.link(o);tag(o,A,name,parent);o.location=loc;m.materials.append(material(mat))
 if feature:o['interface_feature']=feature
 return o

def box(name,loc,size,parent,mat='gtao_chip',feature=None):
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

def text(name,body,loc,size,parent,mat='gtao_silk',rotation=None,align='LEFT'):
 cu=bpy.data.curves.new(A+'.'+name,'FONT');cu.body=body;cu.size=size;cu.align_x=align;cu.align_y='CENTER';cu.resolution_u=1
 o=bpy.data.objects.new(A+'.'+name,cu);bpy.context.collection.objects.link(o);tag(o,A,name,parent);o.location=loc;cu.materials.append(material(mat));o['interface_feature']='printed_label'
 if rotation:o.rotation_euler=rotation
 return o

def terminal(p,r):
 a=anchor_from_record(p,r);a['connector_family']='phoenix_1803578';base=p['id'].removeprefix(A+'.')
 # Local axes: row +X = board +Y; +Y = height; +Z = wire approach/outward.
 # Plug-specific envelope W8.41 × H11.1 × L16.1 mm; installed PCB header is estimated.
 w=.00841; h=.0111; L=.0161
 box(base+'.rear_web',(0,0,-.0108),(w,h,.0008),a,'gtao_green')
 box(base+'.bottom',(0,-h/2+.0004,-.0055),(w,.0008,.011),a,'gtao_green')
 box(base+'.front_upper_band',(0,.0028,-.001),(w,.0055,.002),a,'gtao_green')
 box(base+'.roof_back',(0,.00505,-.0092),(w,.001,.0032),a,'gtao_green')
 for i in range(3):box(base+'.septum'+str(i),((i-1)*.00381,0,-.0055),(.00065,h,.011),a,'gtao_green')
 for i,label in enumerate(p['contact_labels']):
  x=(.5-i)*.00381
  box(base+'.wire_recess'+str(i),(x,-.002,-.0088),(.0029,.0043,.00035),a,'rtds_well')
  box(base+'.contact'+str(i),(x,-.002,-.0074),(.0023,.0024,.0007),a,'rtds_silver','contact')
  # Screw access rings lie in the horizontal top plane; slotted heads are inset.
  o=ring(base+'.screw_well'+str(i),(x,.0050,-.0054),.00178,.00133,.0011,a,'gtao_green');o.rotation_euler.x=math.pi/2
  o=cyl(base+'.screw'+str(i),(x,.00455,-.0054),.00125,.0006,a,'rtds_silver','slotted_screw');o.rotation_euler.x=math.pi/2
  box(base+'.slot'+str(i),(x,.0049,-.0054),(.0018,.0002,.0003),a,'rtds_well')
  # Female mating-tongue geometry is on the hidden rear side, not the wire-entry mouth.
  box(base+'.mating_finger'+str(i),(x,0,-.0135),(.00275,.0078,.0052),a,'gtao_green')
  # Original annotation on the plug shoulder; ordinal direction matches upright board.
  o=text(base+'.label'+str(i),label,(x,.00562,-.0085),.0011 if len(label)<3 else .00065,a,'rtds_black',align='CENTER');o.rotation_mode='QUATERNION';o.rotation_quaternion=a.rotation_quaternion.inverted()
 # Estimated single-tier PCB header behind each installed removable plug.
 header_h=p['position_m'][2]+.0035-.0076 # Observed tall header silhouette must meet PCB surface.
 box(base+'.pcb_header',(0,.0035-header_h/2,-.0175),(w,header_h,.004),a,'gtao_carrier')
 return a

def power(p,r):
 a=anchor_from_record(p,r);a['connector_family']='keyed_1x4_power';a['key_profile']='left_chamfered_1x4';base=p['id'].removeprefix(A+'.')
 # Component-side outline has corner chamfers on left long side, seen in manual Fig6.4.
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
  if label is not None:text(base+'.contact_label'+str(i),label,(.006,y,.00775-p['position_m'][2]),.0015,a,'gtao_silk')
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
 box('carrier',(0,0,.003),(.104,.194,.006),r,'gtao_carrier');box('body',(0,0,.0068),(.100,.190,.0016),r,'gtao_pcb')
 for x in [-.051,.051]:box('carrier_lip'+str(x),(x,0,.006),(.002,.194,.006),r,'gtao_green')
 for y in [-.096,.096]:box('carrier_end'+str(y),(0,y,.006),(.104,.002,.006),r,'gtao_green')
 for y in [-.061,.061]:box('underside_support'+str(y),(0,y,.001),(.070,.009,.002),r,'gtao_carrier')
 for x,y in [(-.043,.091),(-.043,.052),(-.043,-.002),(-.043,-.062),(-.043,-.091),(.044,.091),(.044,-.002),(.044,-.091)]:
  ring('mount_ring'+str(x)+str(y),(x,y,.0078),.0025,.0015,.0006,r,'rtds_contact');cyl('screw'+str(x)+str(y),(x,y,.0081),.0018,.0007,r,'rtds_silver',n=16)
 for i,y in [(1,.026),(2,-.025)]:
  for z in [.00755,.01605]:box('optical_cage_'+str(i)+'_z'+str(z),(-.024,y,z),(.054,.015,.0005),r,'rtds_silver')
  for sy in [-1,1]:box('optical_cage_'+str(i)+'_side'+str(sy),(-.024,y+sy*.00725,.0118),(.054,.0005,.009),r,'rtds_silver')
  for row in range(3):
   for col in range(5):cyl(f'cage_{i}_vent_{row}_{col}',(-.045+col*.009,y+(row-1)*.0045,.01635),.00075,.00015,r,'rtds_well',n=12)
  text('gt_label'+str(i),'GT'+str(i),(-.034,y-.010,.00775),.0020,r)
  box('link_led'+str(i),(-.039,y-.010,.0081),(.0025,.0012,.001),r,'gtao_led')
 cyl('heatsink_core',(-.013,.0005,.0138),.0145,.0124,r,'rtds_black',n=40)
 for i in range(5):cyl('heatsink_fin'+str(i),(-.013,.0005,.009+i*.0023),.0185,.0015,r,'rtds_black',n=40)
 ring('heatsink_top',(-.013,.0005,.020),.0185,.0015,.002,r,'rtds_black',n=40)
 box('lower_heatsink_base',(-.010,-.079,.0091),(.028,.028,.003),r,'rtds_black')
 for i in range(6):
  for j in range(6):box(f'lower_heatsink_fin_{i}_{j}',(-.022+i*.0048,-.091+j*.0048,.0154),(.0024,.0024,.0096),r,'rtds_black')
 box('dip_body',(-.019,.070,.0106),(.022,.009,.006),r,'rtds_black')
 for i in range(8):
  x=-.0285+i*.0027;box('dip_switch'+str(i+1),(x,.070,.0142),(.0015,.0045,.0012),r,'rtds_white','dip_switch');text('dip_label'+str(i+1),str(i+1),(x,.0646,.00775),.0013,r,align='CENTER')
 text('dip_on','ON',(-.029,.0756,.00775),.0016,r)
 box('id_display',(.003,.075,.010),(.0085,.013,.0048),r,'gtao_chip')
 for i,(x,y,sx,sy) in enumerate([(0,.004,.005,.00065),(0,0,.005,.00065),(0,-.004,.005,.00065),(-.0028,.002,.00065,.0033),(.0028,.002,.00065,.0033),(-.0028,-.002,.00065,.0033),(.0028,-.002,.00065,.0033)]):box('display_segment'+str(i),(.003+x,.075+y,.0125),(sx,sy,.00025),r,'rtds_plate')
 text('card_id','CARD ID',(-.001,.065,.00775),.0017,r)
 # Repeated analogue-channel circuitry: intentionally decorative, not a BOM.
 for ch in range(16):
  y=.0815-ch*.0103-(.006 if ch>=8 else 0)
  for j,x in enumerate([.018,.029]):
   box(f'channel_ic_{ch}_{j}',(x,y,.0086),(.006,.005,.002),r,'gtao_chip')
   for side in [-1,1]:
    for pin in range(4):box(f'channel_leg_{ch}_{j}_{side}_{pin}',(x+side*.0035,y+(pin-1.5)*.001,.0081),(.001,.00035,.001),r,'rtds_silver')
  for k in range(4):box(f'channel_passive_{ch}_{k}',(.011+(k%2)*.024,y+(k//2-.5)*.006,.0081),(.002,.001,.001),r,'gtao_ceramic')
  text('channel_number'+str(ch+1),str(ch+1),(.0372,y,.00775),.0018,r,align='CENTER')
 for row,y in [('top',.089),('bottom',-.089)]:
  for i in range(8):
   x=.018+i*.0031;box(f'activity_led_{row}_{i}',(x,y,.0081),(.0015,.002,.001),r,'gtao_led');text(f'activity_label_{row}_{i}',str(i+1 if row=='top' else i+9),(x,y+(.003 if row=='top' else -.003),.00775),.0012,r,align='CENTER')
 for x,y,w,h in [(-.025,.052,.014,.013),(-.009,.051,.011,.012),(-.024,.035,.010,.010),(-.040,.009,.010,.012),(-.040,-.010,.010,.012),(-.025,-.043,.012,.010),(-.010,-.051,.013,.010)]:box('ic'+str(x)+str(y),(x,y,.0091),(w,h,.003),r,'gtao_chip')
 for k in range(60):
  x=-.036+(k%8)*.0055;y=.060-(k//8)*.0031
  if -.033<x<.003 and y>.033:continue
  box('passive'+str(k),(x,y,.0081),(.0018,.001,.001),r,'gtao_ceramic')
 for k in range(55):
  x=-.038+(k%8)*.0058;y=-.040-(k//8)*.003
  box('lower_passive'+str(k),(x,y,.0081),(.0018,.001,.001),r,'gtao_ceramic')
 for x,y in [(-.029,-.086),(-.031,-.062)]:
  cyl('electrolytic'+str(y),(x,y,.0121),.0035,.009,r,'rtds_silver',n=24);cyl('electrolytic_cap'+str(y),(x,y,.0167),.0031,.0003,r,'rtds_plate',n=24)
 box('reset_switch',(.005,-.058,.0096),(.006,.0038,.004),r,'rtds_plate');box('reset_button',(.005,-.058,.0121),(.0028,.0028,.001),r,'rtds_black')
 text('reset_label','RESET',(.000,-.063,.00775),.0015,r)
 text('board_model','GTAO Version 2.20',(.008,-.037,.00775),.0023,r,rotation=(0,0,math.pi/2))
 text('maker_plain','RTDS',(-.029,.083,.00775),.004,r)
 text('power_label','POWER\n+24V\n+5V\nBANK 1\nBANK 2',(-.046,-.042,.00775),.0017,r)
 text('config_error','CONFIG\nERROR',(-.047,.0475,.00775),.0014,r);text('run_error','RUN\nERROR',(-.046,.037,.00775),.0014,r)
 ports=json.loads((ROOT/'rtds'/A/'metadata/ports.json').read_text())['ports']
 for p in ports:
  if p['group']=='analog_output':terminal(p,r)
  elif p['group']=='power':power(p,r)
  elif p['group']=='optical':sfp_duplex(anchor_from_record(p,r))
  else:service(p,r)
 return {'asset_id':A,'hardware_version':'GTAO V2','pcb_revision':'2.20','asset_state':'visual_candidate_with_service_detail_gaps','population':'16 Phoenix1803578 plugs installed as manual Fig6.2/6.10; PCB headers estimated','source_photo_reproduction':False,'service_interfaces':'2 hollow silhouettes; contact geometry intentionally absent pending close-ups'}
