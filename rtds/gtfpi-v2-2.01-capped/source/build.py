"""Original photo-grounded GTFPI PCB 2.01 capped variant, no source textures."""
import bpy,sys,math,json
from pathlib import Path
P=Path(__file__).resolve().parents[1];ROOT=P.parents[1];A=P.name
sys.path.insert(0,str(ROOT/'tools'));sys.path.insert(0,str(ROOT/'rtds/connectors'));sys.path.insert(0,str(P/'source'))
from asset_common import root,PALETTE
from library import anchor_from_record
from geometry import box,cyl,ring,mesh,text
PALETTE.update({'gf_pcb':(.021,.052,.13,1),'gf_carrier':(.15,.42,.28,1),'gf_green':(.15,.49,.31,1),'gf_silk':(.82,.84,.78,1),'gf_chip':(.028,.036,.037,1),'gf_ceramic':(.42,.34,.22,1),'gf_led':(.10,.21,.13,1),'gf_blue':(.06,.23,.62,1)})
Z=.0076

def seated(o):o['seated_on_pcb']=True;return o

def ribbon(p,r):
 a=anchor_from_record(p,r);a['connector_family']='observed_shrouded_ribbon';pid=p['id'].removeprefix(A+'.');n=p['contacts_per_row'];L=(n-1)*.00254+.007;h=p['position_m'][2]-Z
 seated(box(pid+'.base',(0,0,-h+.001),(L,.009,.002),a,'rtds_black'))
 # Actual outer (+localY = board +X) long wall has a central open key gap.
 for s in [-1,1]:
  box(pid+'.outer_wall'+str(s),(s*(L/4+.001),.0042,-h/2),((L-.004)/2,.0008,h),a,'rtds_black','ribbon_outer_wall')
 box(pid+'.inner_wall',(0,-.0042,-h/2),(L,.0008,h),a,'rtds_black','ribbon_inner_wall')
 for s in [-1,1]:box(pid+'.end'+str(s),(s*(L/2-.0004),0,-h/2),(.0008,.008,h),a,'rtds_black')
 # Gold square pins; no guessed electrical contact numbering.
 for row,y in enumerate([-.00127,.00127]):
  for col in range(n):
   o=box(pid+f'.pin_{row}_{col}',((col-(n-1)/2)*.00254,y,-.0056),(.00058,.00058,.0100),a,'rtds_contact','contact');o['row_index']=row;o['column_index']=col
 return a

def white_power(p,r):
 a=anchor_from_record(p,r);a['connector_family']='observed_1x4_power';pid=p['id'].removeprefix(A+'.');h=p['position_m'][2]-Z
 # Chamfered paired corners on board -X/outside long wall. Pin order withheld.
 xy=[(-.0036,-.012),(.0044,-.012),(.0044,.012),(-.0036,.012),(-.005,.0106),(-.005,-.0106)];inside=[(x*.77,y*.92) for x,y in xy];v=[]
 for z,pts in [(-h,xy),(0,xy),(0,inside),(-h+.001,inside)]:v.extend((x,y,z) for x,y in pts)
 f=[]
 for i in range(6):j=(i+1)%6;f.extend([(i,j,6+j,6+i),(6+i,6+j,12+j,12+i),(12+i,12+j,18+j,18+i)])
 seated(mesh(pid+'.shroud',v,f,a,'rtds_white'));box(pid+'.base',(0,0,-h+.0005),(.007,.021,.001),a,'rtds_white')
 for i in range(4):
  # Round visible pin topology; split-tip microgeometry is not resolved in this low-poly variant.
  y=.009-i*.006;cyl(pid+'.pin'+str(i),(0,y,-.0074),.00072,.0128,a,'rtds_silver','contact',16)
 return a

def green_power(p,r):
 a=anchor_from_record(p,r);a['connector_family']='observed_green_2pin';pid='hv5v';h=p['position_m'][2]-Z
 seated(box(pid+'.base',(0,0,-h+.0006),(.0095,.013,.0012),a,'gf_green'))
 box(pid+'.outer_wall',(.00435,0,-h/2),(.0008,.013,h),a,'gf_green')
 # Actual visible inner (-X) mouth edge has two concave lobes, not rectangular clearance.
 profile=[(-.0032+.0007*math.cos(2*math.pi*y/.006),y) for y in [-.006+i*.0005 for i in range(25)]]
 v=[]
 for z in [-h,0]:
  for x,y in profile:v.extend([(-.00475,y,z),(x,y,z)])
 m=len(profile)*2;f=[]
 for i in range(len(profile)-1):
  j=i*2;k=j+2;f.extend([(j,k,k+m,j+m),(j+1,j+1+m,k+1+m,k+1),(j+m,k+m,k+1+m,j+1+m),(j,j+1,k+1,k)])
 f.extend([(0,m,m+1,1),(m-2,m-1,2*m-1,2*m-2)])
 mesh(pid+'.scalloped_inner_wall',v,f,a,'gf_green',feature='two_lobe_inner_wall')
 for y in [-.0061,.0061]:box(pid+'.wally'+str(y),(0,y,-h/2),(.0087,.0008,h),a,'gf_green')
 for i,y in enumerate([.003,-.003]):cyl(pid+'.pin'+str(i),(0,y,-.005825),.00065,.00955,a,'rtds_silver','contact',16)
 return a

def capped_optical(p,r):
 a=anchor_from_record(p,r);a['connector_family']='observed_capped_sfp';pid=p['id'].removeprefix(A+'.')
 # Local +Z outward (-X board), +Y board-up. No hidden LC/ferrule features.
 for x in [-.0072,.0072]:box(pid+'.cage_side'+str(x),(x,0,-.027),(.00055,.0098,.054),a,'rtds_silver')
 for y in [-.00465,.00465]:box(pid+'.cage_edge'+str(y),(0,y,-.027),(.0145,.0005,.054),a,'rtds_silver')
 box(pid+'.cap_body',(0,0,.0010),(.0138,.0088,.006),a,'rtds_black','dust_cap')
 box(pid+'.cap_pull',(0,.0026,.0041),(.0065,.0014,.0015),a,'rtds_black')
 for s in [-1,1]:box(pid+'.bail_arm'+str(s),(s*.0061,-.0036,.0005),(.0006,.001,.007),a,'rtds_silver')
 box(pid+'.bail_crossbar',(0,-.0036,.0037),(.0128,.0006,.0006),a,'rtds_silver')
 return a

def service(p,r):
 a=anchor_from_record(p,r);a['connector_family']='unresolved_service_outline';pid=p['id'].removeprefix(A+'.');w=.017 if 'header' in pid else .0075;d=.006 if 'header' in pid else .0035;h=p['position_m'][2]-Z
 for s in [-1,1]:seated(box(pid+'.x'+str(s),(s*w/2,0,-h/2),(.00065,d,h),a,'rtds_black' if 'header' in pid else 'rtds_silver'));seated(box(pid+'.y'+str(s),(0,s*d/2,-h/2),(w,.00065,h),a,'rtds_black' if 'header' in pid else 'rtds_silver'))
 box(pid+'.unresolved_well',(0,0,-h+.00015),(w-.001,d-.001,.0003),a,'rtds_well');return a

def build_asset(config):
 r=root(A);r['asset_state']='photo_matching_visual_variant_not_insertion_ready'
 box('carrier',(0,0,.003),(.110,.202,.006),r,'gf_carrier');box('body',(0,0,.0068),(.104,.196,.0016),r,'gf_pcb')
 for x in [-.054,.054]:box('carrier_lip'+str(x),(x,0,.006),(.002,.202,.006),r,'gf_green')
 for y in [-.100,.100]:box('carrier_end'+str(y),(0,y,.006),(.110,.002,.006),r,'gf_green')
 for y in [-.061,.061]:box('underside_support'+str(y),(0,y,.001),(.070,.009,.002),r,'gf_carrier')
 for x,y in [(-.046,.093),(.047,.093),(-.046,.055),(-.046,-.001),(.047,.003),(-.046,-.062),(-.046,-.093),(.047,-.093)]:
  ring('mount_ring'+str(x)+str(y),(x,y,.0078),.0025,.0015,.0006,r,'rtds_contact');cyl('screw'+str(x)+str(y),(x,y,.0081),.0018,.0007,r,'rtds_silver',n=16)
 # Supported optical cage base plates meet board; metal shell connects to these.
 for i,y in [(1,.026),(2,-.026)]:
  seated(box('optical_support'+str(i),(-.027,y,.00785),(.054,.015,.0005),r,'rtds_silver'))
  for row in range(3):
   for col in range(5):cyl(f'cage_vent_{i}_{row}_{col}',(-.047+col*.009,y+(row-1)*.0045,.01745),.0007,.00013,r,'rtds_well',n=12)
  text('gt_label'+str(i),'GT '+str(i),(-.037,y-.010,.00775),.002,r)
 # Central heat sink: connected hub with low-poly radial stack, not floating discs.
 seated(cyl('heatsink_core',(-.014,0,.0143),.014,.0134,r,'rtds_black',n=40))
 for i in range(5):cyl('heatsink_fin'+str(i),(-.014,0,.0095+i*.0023),.018,.0015,r,'rtds_black','heatsink_fin',40)
 ring('heatsink_top',(-.014,0,.0211),.018,.0014,.0017,r,'rtds_black',n=40)
 seated(box('dip_body',(-.019,.0405,.0106),(.025,.009,.006),r,'rtds_black'))
 for i in range(8):
  x=-.0295+i*.003;box('dip_switch'+str(i+1),(x,.0405,.0142),(.0015,.0045,.0012),r,'rtds_white','dip_switch');text('dip_label'+str(i+1),str(i+1),(x,.0348,.00775),.0013,r,align='CENTER')
  seated(box('status_led'+str(i+1),(x,.048,.0082),(.0015,.002,.0012),r,'gf_led','status_led'))
 text('dip_on','ON',(-.034,.0405,.00775),.0015,r,align='RIGHT')
 seated(box('id_display',(.002,.076,.0106),(.009,.013,.006),r,'rtds_white'));box('display_face',(.002,.076,.0137),(.0078,.0118,.0002),r,'gf_chip')
 for i,(x,y,sx,sy) in enumerate([(0,.004,.005,.00065),(0,0,.005,.00065),(0,-.004,.005,.00065),(-.0028,.002,.00065,.0033),(.0028,.002,.00065,.0033),(-.0028,-.002,.00065,.0033),(.0028,-.002,.00065,.0033)]):box('display_segment'+str(i),(.002+x,.076+y,.01385),(sx,sy,.0002),r,'rtds_plate')
 text('card_id','CARD ID',(-.003,.0685,.00775),.0017,r)
 # Upright photo positions; small circuit details decorative, not a bill of materials.
 for x,y,w,h in [(-.003,.059,.011,.015),(-.035,.008,.009,.010),(-.035,-.013,.009,.010),(.008,-.043,.014,.014),(.010,-.063,.014,.016)]:seated(box('ic'+str(x)+str(y),(x,y,.0086),(w,h,.002),r,'gf_chip'))
 for y in [.068,.058,.048,.038,.028,.018,-.040,-.049,-.058,-.067,-.076]:
  seated(box('panel_buffer'+str(y),(.027,y,.0086),(.005,.007,.002),r,'gf_chip'))
  for j in range(4):box('buffer_leg'+str(y)+str(j),(.0237,y+(j-1.5)*.0015,.0081),(.0015,.0004,.001),r,'rtds_silver')
 for k in range(65):
  x=-.032+(k%8)*.0057;y=-.039-(k//8)*.0027
  if x>-.008:continue
  seated(box('passive'+str(k),(x,y,.0081),(.0018,.001,.001),r,'gf_ceramic'))
 seated(cyl('electrolytic',(-.026,.080,.0126),.004,.010,r,'rtds_silver',n=24));cyl('electrolytic_top',(-.026,.080,.01775),.0036,.0003,r,'rtds_plate',n=24)
 # Blue protective disc connects to board on two visible short leads.
 for y in [.077,.083]:seated(cyl('disc_lead'+str(y),(-.035,y,.0106),.00035,.006,r,'rtds_silver',n=12))
 o=cyl('blue_disc',(-.035,.080,.016),.0056,.0018,r,'gf_blue',n=24);o.rotation_euler.y=math.pi/2
 seated(box('reset_switch',(.002,-.058,.0096),(.006,.004,.004),r,'rtds_plate'));box('reset_button',(.002,-.058,.0121),(.0028,.0028,.001),r,'rtds_black');text('reset_label','CARD RESET',(-.005,-.074,.00775),.0015,r)
 text('board_model','GTFPI Version 2.01',(-.022,-.089,.00775),.0026,r);text('maker_plain','RTDS',(-.024,-.080,.00775),.005,r)
 text('hv_legend','TO HIGH VOLTAGE INTERFACE PANEL',(.035,.079,.00775),.0016,r,rotation=(0,0,-math.pi/2))
 text('lv_legend','TO LOW VOLTAGE INTERFACE PANEL',(.035,-.033,.00775),.00155,r,rotation=(0,0,-math.pi/2))
 text('lv_end_1','1',(.0445,-.082,.00775),.0016,r);text('lv_end_2','2',(.041,-.082,.00775),.0016,r)
 text('hv5v_label','+5V RET',(.036,-.024,.00775),.0015,r)
 text('power_status','POWER\n+24V\n+5V\nBANK 1\nBANK 2',(-.048,-.041,.00775),.0016,r)
 text('config_error','CONFIG\nERROR',(-.048,.051,.00775),.0013,r);text('run_error','RUN\nERROR',(-.048,.044,.00775),.0013,r)
 for p in json.loads((P/'metadata/ports.json').read_text())['ports']:
  {'ribbon_header':ribbon,'power':white_power,'aux_power':green_power,'optical':capped_optical,'service_unresolved':service}[p['group']](p,r)
 return {'asset_id':A,'hardware_version':'GTFPI V2','pcb_revision':'2.01','population':'Two capped GT optical assemblies; observed HV50/LV34 male ribbon headers','source_photo_reproduction':False,'asset_state':'visual_candidate_not_insertion_animation_ready','uncertainties':['Power diagrams lack aligned viewing direction; no spatial electrical pinout','Optical interior hidden by photographed dust caps and intentionally absent','Service interfaces show outlines only','Dimensions and decorative electronics estimated']}
