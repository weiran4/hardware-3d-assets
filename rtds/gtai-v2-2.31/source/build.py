"""Original GTAI V2 PCB 2.31 visual candidate; no copied source textures.
Terminal-plug population follows manual Fig7.8. Service contacts are not invented.
"""
import bpy,sys,math,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
sys.path.insert(0,str(ROOT/'tools'));sys.path.insert(0,str(ROOT/'rtds/connectors'))
from asset_common import material,PALETTE,root,tag
from library import anchor_from_record,sfp_duplex
A='gtai-v2-2.31'
PALETTE.update({'gtai_pcb':(.019,.040,.135,1),'gtai_green':(.10,.36,.22,1),'gtai_carrier':(.055,.28,.17,1),'gtai_silk':(.79,.82,.76,1),'gtai_ceramic':(.47,.38,.23,1),'gtai_chip':(.035,.042,.039,1),'gtai_led':(.08,.18,.10,1)})
CUBE_V=[(-.5,-.5,-.5),(.5,-.5,-.5),(.5,.5,-.5),(-.5,.5,-.5),(-.5,-.5,.5),(.5,-.5,.5),(.5,.5,.5),(-.5,.5,.5)]
CUBE_F=[(0,3,2,1),(4,5,6,7),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7)]
def mesh(name,vs,fs,parent,mat,loc=(0,0,0),feature=None):
 m=bpy.data.meshes.new(A+'.'+name);m.from_pydata(vs,[],fs);m.update();o=bpy.data.objects.new(A+'.'+name,m);bpy.context.collection.objects.link(o);tag(o,A,name,parent);o.location=loc;m.materials.append(material(mat))
 if feature:o['interface_feature']=feature
 return o

def box(name,loc,size,parent,mat='gtai_chip',feature=None):
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

def text(name,body,loc,size,parent,mat='gtai_silk',rotation=None,align='LEFT'):
 cu=bpy.data.curves.new(A+'.'+name,'FONT');cu.body=body;cu.size=size;cu.align_x=align;cu.align_y='CENTER';cu.resolution_u=1
 o=bpy.data.objects.new(A+'.'+name,cu);bpy.context.collection.objects.link(o);tag(o,A,name,parent);o.location=loc;o['surface_annotation']=True;cu.materials.append(material(mat))
 if rotation:o.rotation_euler=rotation
 return o

def terminal(p,r):
 a=anchor_from_record(p,r);a['connector_family']='phoenix_1803581';base=p['id'].removeprefix(A+'.')
 # Local axes: row +X = board +Y; +Y = height; +Z = wire approach/outward.
 # Plug-specific envelope W12.22 × H11.1 × L16.1 mm; installed PCB header is estimated.
 w=.01222; h=.0111; L=.0161
 box(base+'.rear_web',(0,0,-.0108),(w,h,.0008),a,'gtai_green')
 box(base+'.bottom',(0,-h/2+.0004,-.0055),(w,.0008,.011),a,'gtai_green')
 box(base+'.front_upper_band',(0,.0028,-.001),(w,.0055,.002),a,'gtai_green')
 box(base+'.roof_back',(0,.00505,-.0092),(w,.001,.0032),a,'gtai_green')
 for i in range(4):box(base+'.septum'+str(i),((i-1.5)*.00381,0,-.0055),(.00065,h,.011),a,'gtai_green')
 for i,label in enumerate(p['contact_labels']):
  x=(1-i)*.00381
  box(base+'.wire_recess'+str(i),(x,-.002,-.0088),(.0029,.0043,.00035),a,'rtds_well')
  box(base+'.contact'+str(i),(x,-.002,-.0074),(.0023,.0024,.0007),a,'rtds_silver','contact')
  # Screw access rings lie in the horizontal top plane; slotted heads are inset.
  o=ring(base+'.screw_well'+str(i),(x,.0050,-.0054),.00178,.00133,.0011,a,'gtai_green');o.rotation_euler.x=math.pi/2
  o=cyl(base+'.screw'+str(i),(x,.00455,-.0054),.00125,.0006,a,'rtds_silver','slotted_screw');o.rotation_euler.x=math.pi/2
  box(base+'.slot'+str(i),(x,.0049,-.0054),(.0018,.0002,.0003),a,'rtds_well')
  # Female mating-tongue geometry is on the hidden rear side, not the wire-entry mouth.
  box(base+'.mating_finger'+str(i),(x,0,-.0135),(.00275,.0078,.0052),a,'gtai_green')
  # Original annotation on the plug shoulder; ordinal direction matches upright board.
  o=text(base+'.label'+str(i),label,(x,.00562,-.0085),.00145 if len(label)<3 else .00095,a,'rtds_black',align='CENTER');o.rotation_mode='QUATERNION';o.rotation_quaternion=a.rotation_quaternion.inverted()
 # Estimated right-angle PCB header behind each installed removable plug.
 header_h=p['position_m'][2]+.0035-.0076 # Observed tall header silhouette must meet PCB surface.
 box(base+'.pcb_header',(0,.0035-header_h/2,-.0175),(w,header_h,.004),a,'gtai_carrier')
 return a

def power(p,r):
 a=anchor_from_record(p,r);a['connector_family']='keyed_1x4_power';a['key_profile']='left_chamfered_1x4';base=p['id'].removeprefix(A+'.')
 # Component-side outline has corner chamfers on left long side, seen in manual Fig7.3.
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
  # Pin assignments remain in metadata; no invented silkscreen printed behind DC/DC module.
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
 box('carrier',(0,0,.003),(.104,.184,.006),r,'gtai_carrier')
 box('body',(0,0,.0068),(.100,.180,.0016),r,'gtai_pcb')
 for x in [-.051,.051]:box('carrier_lip'+str(x),(x,0,.006),(.002,.184,.006),r,'gtai_green')
 for y in [-.091,.091]:box('carrier_end'+str(y),(0,y,.006),(.104,.002,.006),r,'gtai_green')
 for y in [-.058,.058]:box('underside_support'+str(y),(0,y,.001),(.070,.009,.002),r,'gtai_carrier')
 # Observable board border; no speculative reverse-side DIN locking mechanism.
 for x in [-.0485,.0475]:box('border_x'+str(x),(x,0,.00765),(.0025,.178,.0001),r,'rtds_contact')
 for y in [-.0885,.0885]:box('border_y'+str(y),(0,y,.00765),(.098,.0025,.0001),r,'rtds_contact')
 for x,y in [(-.043,.085),(-.043,.054),(-.043,-.0005),(-.043,-.055),(-.043,-.085),(.044,.085),(.044,-.001),(.044,-.085)]:
  ring('mount_ring'+str(x)+str(y),(x,y,.0078),.0025,.0015,.0006,r,'rtds_contact');cyl('screw'+str(x)+str(y),(x,y,.0081),.0018,.0007,r,'rtds_silver',n=16)
 for i,y in [(1,.023),(2,-.025)]:
  for z in [.00755,.01605]:box('optical_cage_'+str(i)+'_z'+str(z),(-.024,y,z),(.054,.015,.0005),r,'rtds_silver')
  for sy in [-1,1]:box('optical_cage_'+str(i)+'_side'+str(sy),(-.024,y+sy*.00725,.0118),(.054,.0005,.009),r,'rtds_silver')
  for row in range(3):
   for col in range(5):cyl(f'cage_{i}_vent_{row}_{col}',(-.045+col*.009,y+(row-1)*.0045,.01635),.00075,.00015,r,'rtds_well',n=12)
  text('gt_label'+str(i),'GT'+str(i),(-.045,y-.010,.00775),.0018,r)
  box('link_led'+str(i),(-.037,y-.010,.0081),(.0025,.0012,.001),r,'gtai_led')
 # Round fin stack supported continuously down to PCB, not floating discs.
 cyl('heatsink_core',(-.013,-.001,.0138),.0145,.0124,r,'rtds_black',n=40)
 for i in range(5):cyl('heatsink_fin'+str(i),(-.013,-.001,.009+i*.0023),.0185,.0015,r,'rtds_black',n=40)
 ring('heatsink_top',(-.013,-.001,.020),.0185,.0015,.002,r,'rtds_black',n=40)
 for i,y in [(1,.073),(2,-.074)]:
  box('dcdc_module'+str(i),(-.023,y,.0146),(.026,.029,.014),r,'rtds_black')
  box('dcdc_top'+str(i),(-.023,y,.02165),(.024,.027,.00015),r,'gtai_chip')
  text('dcdc_label'+str(i),'DC / DC',(-.023,y+.003,.02185),.0028,r,'rtds_white',align='CENTER')
  text('dcdc_sub'+str(i),'POWER MODULE',(-.023,y-.002,.02185),.00145,r,'rtds_white',align='CENTER')
 box('dip_body',(-.017,.037,.0106),(.022,.009,.006),r,'rtds_black')
 for i in range(8):
  x=-.0265+i*.0027;box('dip_switch'+str(i+1),(x,.037,.0142),(.0015,.0045,.0012),r,'rtds_white','dip_switch');text('dip_label'+str(i+1),str(i+1),(x,.0318,.00775),.0013,r,align='CENTER')
 text('dip_on','ON',(-.027,.0426,.00775),.0016,r)
 box('id_display',(-.003,.069,.010),(.0085,.013,.0048),r,'rtds_black')
 for i,(x,y,sx,sy) in enumerate([(0,.004,.005,.00065),(0,0,.005,.00065),(0,-.004,.005,.00065),(-.0028,.002,.00065,.0033),(.0028,.002,.00065,.0033),(-.0028,-.002,.00065,.0033),(.0028,-.002,.00065,.0033)]):box('display_segment'+str(i),(-.003+x,.069+y,.0125),(sx,sy,.00025),r,'rtds_white')
 text('card_id','CARD ID',(-.007,.059,.00775),.0018,r)
 # Twelve repeated analogue sections; components are representative, not a circuit BOM.
 for ch in range(1,13):
  y=.075-(ch-1)*.0134-(.0062 if ch>6 else 0)
  for j,x in enumerate([.010,.021,.030]):
   box(f'channel{ch}_ic{j}',(x,y,.0087),(.0055,.006,.0022),r,'gtai_chip')
   for side in [-1,1]:
    for pin in range(4):box(f'channel{ch}_leg{j}_{side}_{pin}',(x+side*.0032,y+(pin-1.5)*.0012,.00815),(.0012,.0004,.0006),r,'rtds_silver')
  for k in range(8):
   if ch==12 and k in [1,2]:continue # Keep lower ADC ACTIVE glyphs clear.
   box(f'channel{ch}_passive{k}',(.007+(k%4)*.0075,y-.0045+(k//4)*.009,.0081),(.002,.0011,.001),r,'gtai_ceramic')
  text('channel_label'+str(ch),str(ch),(.032,y+.0052,.00775),.0016,r,align='CENTER')
 for x,y,w,h in [(-.005,.051,.008,.014),(-.033,.049,.007,.007),(-.041,.005,.010,.012),(-.041,-.012,.010,.011),(-.018,-.045,.010,.007),(-.002,-.073,.008,.008)]:box('ic'+str(x)+str(y),(x,y,.0091),(w,h,.003),r,'gtai_chip')
 for k in range(30):
  x=-.031+(k%6)*.006;y=-.037-(k//6)*.004
  if -.056<=y<=-.041 and x>=-.014:continue # Keep identity/reset silkscreen clear of decorative passives.
  box('lower_passive'+str(k),(x,y,.0081),(.0018,.001,.001),r,'gtai_ceramic')
 for x,y in [(-.042,.043),(-.040,-.057)]:
  cyl('electrolytic'+str(y),(x,y,.0121),.0044,.009,r,'rtds_silver',n=24);cyl('cap_top'+str(y),(x,y,.0167),.004,.0004,r,'rtds_plate',n=24)
 box('reset_switch',(-.005,-.048,.0098),(.006,.0038,.0044),r,'rtds_plate');box('reset_button',(-.005,-.048,.0123),(.0028,.0028,.001),r,'rtds_black')
 text('board_model','GTAI Version 2.31',(-.011,-.054,.00775),.0023,r)
 text('maker_plain','RTDS',(-.011,-.044,.00775),.0033,r)
 text('power_label','POWER\n+24V\n+5V\nBANK 1\nBANK 2\nRUN\nERROR',(-.047,-.044,.00775),.00155,r)
 for y in [.084,-.084]:
  text('activity_label'+str(y),'ADC ACTIVE',(.018,y,.00775),.00165,r,align='CENTER')
  for i in range(6):box('adc_led'+str(y)+str(i),(.004+i*.006,y-.003 if y>0 else y+.003,.0081),(.0012,.002,.001),r,'gtai_led')
 ports=json.loads((ROOT/'rtds'/A/'metadata/ports.json').read_text())['ports']
 for p in ports:
  if p['group']=='analogue_input':terminal(p,r)
  elif p['group']=='power':power(p,r)
  elif p['group']=='optical':sfp_duplex(anchor_from_record(p,r))
  else:service(p,r)
 return {'asset_id':A,'hardware_version':'GTAI V2','pcb_revision':'2.31','asset_state':'visual_candidate_with_service_detail_gaps','population':'12 installed Phoenix1803581 removable plugs; visual PCB headers estimated','source_photo_reproduction':False,'service_interfaces':'two hollow silhouettes; exact contacts and key inserts intentionally unmodelled'}
