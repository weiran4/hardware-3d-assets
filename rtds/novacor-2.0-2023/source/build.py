"""Original NovaCor 2.0 visual reconstruction; see manifest accuracy fields."""
import bpy,sys,math,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3];sys.path.insert(0,str(ROOT/'tools'));sys.path.insert(0,str(ROOT/'rtds/connectors'))
from asset_common import root,box,cylinder,ring,text_label,tag,material
from library import build_connector
A='novacor-2.0-2023'
def rear_text(name,body,x,z,size,parent,y=.2593):
    o=text_label(A,name,body,(x,y,z),size,'rtds_white',parent,'CENTER');o.rotation_euler=(math.pi/2,0,math.pi);return o

def mesh_part(name,verts,faces,parent,mat):
    m=bpy.data.meshes.new(A+'.'+name);m.from_pydata(verts,[],faces);m.update();o=bpy.data.objects.new(A+'.'+name,m);bpy.context.collection.objects.link(o);tag(o,A,name,parent);m.materials.append(material(mat));return o

def build_asset(config):
    r=root(A)
    # Four-sided open shell keeps connector interiors unobstructed.
    w=.450;d=.510;h=.178;t=.0018
    verts=[];faces=[]
    for z in [0,h]:
        for x,y in [(-w/2,-d/2),(w/2,-d/2),(w/2,d/2),(-w/2,d/2)]:verts.append((x,y,z))
    faces=[(0,3,2,1),(4,5,6,7),(0,4,7,3),(1,2,6,5)]
    mesh_part('body',verts,faces,r,'rtds_black')
    # Front rack ears define documented 483 mm overall width; cutout slots are true gaps.
    for s in [-1,1]:
      x=s*.23325
      for k,(z,hh) in enumerate([(.018,.036),(.089,.080),(.160,.036)]):box(A,f'ear_{s}_{k}',(x,-.253,z),(.0165,.005,hh),'rtds_black',r,.0005)
      for k,z in enumerate([.0425,.1355]):
       for sx in [-1,1]:box(A,f'ear_slot_{s}_{k}_{sx}',(x+sx*.0062,-.253,z),(.0041,.005,.013),'rtds_black',r,.0003)
    box(A,'front_base',(0,-.253,.089),(.448,.005,.174),'rtds_black',r,.0012)
    # Front silhouette dividers and 10 open horizontal vent gaps.
    box(A,'vent_recess',(-.119,-.256,.088),(.173,.001,.156),'rtds_well',r,0)
    for i in range(11):box(A,'vent_slats_'+str(i),(-.119,-.258,.009+i*.0155),(.173,.002,.0084),'rtds_edge',r,.0005)
    for x in [-.208,-.030]:box(A,'vent_frame_'+str(x),(x,-.258,.087),(.004,.004,.161),'rtds_edge',r,.0005)
    for z in [.007,.169]:box(A,'vent_frame_z'+str(z),(-.119,-.258,z),(.182,.004,.004),'rtds_edge',r,.0005)
    box(A,'identity_recess',(.015,-.257,.088),(.055,.003,.165),'rtds_edge',r,.001)
    box(A,'identity_strip',(.015,-.259,.088),(.050,.002,.160),'rtds_white',r,.0012)
    text_label(A,'model_label','NovaCor 2.0',(-.007,-.2601,.151),.0064,'rtds_black',r)
    box(A,'screen_bezel',(.130,-.256,.110),(.164,.005,.101),'rtds_edge',r,.0018)
    box(A,'screen',(.130,-.259,.110),(.157,.001,.094),'rtds_screen',r,.0005)
    text_label(A,'ao_title','ANALOGUE OUTPUT',(.055,-.260,.049),.0040,'rtds_white',r)
    text_label(A,'manufacturer_plain','RTDS',(.194,-.260,.050),.0062,'rtds_white',r,'CENTER')
    text_label(A,'gnd_title','GND',(.147,-.260,.028),.0035,'rtds_white',r,'CENTER')
    for x in [.130,.164]:box(A,'gnd_bracket_'+str(x),(x,-.260,.025),(.0005,.0003,.004),'rtds_white',r,0)
    for x in [.135,.159]:box(A,'gnd_line_'+str(x),(x,-.260,.027),(.010,.0003,.0005),'rtds_white',r,0)
    box(A,'power_bezel',(.198,-.256,.020),(.032,.007,.030),'rtds_edge',r,.001)
    box(A,'power_rocker',(.198,-.260,.019),(.024,.0016,.013),'rtds_black',r,.0006)
    text_label(A,'power_off','O',(.192,-.261,.019),.004,'rtds_white',r,'CENTER');text_label(A,'power_on','I',(.204,-.261,.019),.004,'rtds_white',r,'CENTER')
    # Side grooves and visible telescoping slide rails, photo-estimated mechanics.
    for s in [-1,1]:
      for i in range(1,12):box(A,f'side_seam_{s}_{i}',(s*.225,-.002,i*.014),(.0005,.498,.0008),'rtds_edge',r,0)
      box(A,'side_rail_'+str(s),(s*.226,0,.079),(.003,.475,.013),'rtds_plate',r,.0005)
      box(A,'side_rail_groove_'+str(s),(s*.2275,0,.079),(.0005,.463,.002),'rtds_silver',r,0)
      for j,y in enumerate([-.197,-.09,.03,.15,.218]):
        o=cylinder(A,f'side_rail_screw_{s}_{j}',(s*.228,y,.079),.0032,.001,'rtds_silver',r,16,0);o.rotation_euler=(0,math.pi/2,0)
    # Rear perforated cover is original hexagonal lattice geometry, not a manufacturer texture.
    vv=[];ff=[]
    for row in range(17):
      z=.059+row*.0066
      for col in range(62):
        x=-.213+col*.0069+(row%2)*.00345
        if abs(x)<.012 and z<.132:continue
        if x<-.172 and z<.119:continue
        n=len(vv)
        for rad in [.0037,.0027]:
          vv.extend((x+rad*math.cos(math.pi/6+i*math.pi/3),.256,z+rad*math.sin(math.pi/6+i*math.pi/3)) for i in range(6))
        for i in range(6):j=(i+1)%6;ff.append((n+i,n+j,n+6+j,n+6+i))
    mesh_part('rear_perforated_cover',vv,ff,r,'rtds_black')
    # Deep dark backing makes perforations legible while leaving lower connector cavities clear.
    box(A,'rear_dark_interior',(0,.232,.110),(.442,.001,.122),'rtds_well',r,0)
    for x in [.112,-.060]:
      cylinder(A,'rear_fan_'+str(x),(x,.238,.123),.050,.001,'rtds_edge',r,32,0)
      ring(A,'rear_fan_ring_'+str(x),(x,.240,.123),.046,.044,.001,'rtds_black',r,32)
    for x in [-.223,.223]:box(A,'rear_edge_'+str(x),(x,.257,.089),(.004,.002,.178),'rtds_edge',r,.0005)
    for z in [.002,.176]:box(A,'rear_edge_z'+str(z),(0,.257,z),(.450,.002,.004),'rtds_edge',r,.0005)
    box(A,'rear_lower_panel',(0,.250,.029),(.442,.001,.053),'rtds_black',r,0)
    box(A,'rear_centre_spine',(.010,.257,.083),(.016,.003,.112),'rtds_edge',r,0)
    box(A,'rear_psu_panel',(-.202,.251,.091),(.046,.001,.064),'rtds_black',r,0)
    for z in [.038,.102]:
      for j in range(4):box(A,f'psu_vent_{z}_{j}',(-.204,.256,z+(j-1.5)*.005),(.034,.002,.0012),'rtds_edge',r,0)
    box(A,'identity_plate',(-.177,.2575,.100),(.033,.001,.032),'rtds_white',r,.0003)
    rear_text('identity_model','NovaCor 2.0',-.177,.107,.0027,r)
    rear_text('identity_notice','REFERENCE MODEL',-.177,.098,.0021,r)
    # Original text only; no copied logo art or serial/approval marks.
    for x,z in [(.217,.164),(-.217,.164),(.217,.008),(-.217,.008),(.010,.139),(.010,.014)]:
      cylinder(A,'rear_screw_'+str(x)+'_'+str(z),(x,.259,z),.0025,.001,'rtds_silver',r,16,0)
    ports=json.loads((ROOT/'rtds'/A/'metadata/ports.json').read_text())['ports']
    for p in ports:
      a=build_connector(p,r)
      if p['group']=='analogue':
       x,y,z=p['position_m'];text_label(A,'label_'+p['id'].split('.')[-1],p['label'],(x-.0065,-.260,z),.0028,'rtds_white',r,'RIGHT')
      elif p['group'] in ['gtio','aurora','irc']:
       x,y,z=p['position_m'];body=(('GT' if p['channel']==1 else '') if p['group'] in ['gtio','aurora'] else ('IRC' if p['channel']==1 else ''))+str(p['channel'])
       rear_text('label_'+p['id'].split('.')[-1],body,x,.049 if p['channel']%2 else .008,.0031,r)
      elif p['group']=='gtsync':rear_text('label_gtsync','GTSYNC',-.131,.049,.0028,r)
      elif p['group']=='udp':rear_text('label_udp','ETH',-.131,.006,.0029,r)
      elif p['group']=='wif':rear_text('label_wif','WIF\nETHERNET',-.161,.024,.0028,r)
      elif p['group']=='gbh':rear_text('label_gbh','GBH',.188,.030,.0031,r)
      elif p['group']=='front_led_power':rear_text('label_front_led','FP LED\nPOWER',.214,.035,.0030,r)
    cylinder(A,'front_led_selector',(.201,.259,.020),.0026,.001,'rtds_black',r,16,0)
    return {'asset_id':A,'hardware_version':'NovaCor 2.0','purpose':'visual reference only','main_root':r['sid'],'component_style':'source-grounded critical interfaces; estimated noncritical mechanics'}
