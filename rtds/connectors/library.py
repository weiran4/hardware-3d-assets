"""Editable visual connector vocabulary. Local +Z out, +Y keyed-up.
Physical-fit dimensions remain estimates unless a record explicitly says otherwise.
"""
import bpy,math,json,sys
from mathutils import Quaternion
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[2]/'tools'))
from asset_common import box,ring,cylinder,tag,PALETTE,material
PALETTE.update({'rtds_black':(.028,.033,.038,1),'rtds_edge':(.045,.052,.060,1),'rtds_well':(.006,.009,.011,1),'rtds_silver':(.55,.60,.63,1),'rtds_contact':(.67,.57,.31,1),'rtds_white':(.8,.82,.79,1),'rtds_screen':(.035,.065,.09,1),'rtds_plate':(.66,.68,.65,1)})
def local_box(a,name,loc,size,mat='rtds_silver',bevel=.00015,feature=None):
    o=box(a['asset_id'],a['idpart']+'.'+name,loc,size,mat,a,bevel)
    if feature:o['interface_feature']=feature
    return o

def local_ring(a,name,loc,outer,inner,depth,mat='rtds_silver',feature=None,n=16):
    o=ring(a['asset_id'],a['idpart']+'.'+name,loc,outer,inner,depth,mat,a,n); o.rotation_euler=(0,0,0)
    if feature:o['interface_feature']=feature
    return o

def local_cyl(a,name,loc,radius,depth,mat='rtds_well',feature=None,n=16):
    o=cylinder(a['asset_id'],a['idpart']+'.'+name,loc,radius,depth,mat,a,n,0);o.rotation_euler=(0,0,0)
    if feature:o['interface_feature']=feature
    return o

def anchor_from_record(record,parent):
    a=bpy.data.objects.new(record['id'],None);bpy.context.collection.objects.link(a); a.parent=parent
    for k,v in {'sid':record['id'],'asset_id':parent['asset_id'],'kind':'anchor','idpart':record['id'].split('.',1)[1] if False else record['id'].removeprefix(parent['asset_id']+'.')}.items():a[k]=v
    a.location=record['position_m'];a.rotation_mode='QUATERNION';a.rotation_quaternion=record['orientation_wxyz'];a.empty_display_size=.008
    a['port_record']=json.dumps(record,sort_keys=True);a['visible_contact_count']=record['visible_contact_count']; return a

def round_single_socket(a):
    a['connector_family']='round_single_socket'
    local_ring(a,'insulator',(0,0,-.0015),.0042,.00255,.003,'rtds_black',n=24)
    local_ring(a,'contact',(0,0,-.0019),.0026,.00185,.0028,'rtds_contact',feature='contact',n=24)
    local_cyl(a,'dark_recess',(0,0,-.00345),.0018,.0002)

def sfp_duplex(a):
    a['connector_family']='lc_duplex_sfp'
    # Optical mouths are two physically distinct receptacles, not a single black rectangle.
    # Cage outline and latch slots reproduce observed topology, not a certified SFP drawing.
    local_box(a,'cage_left',(-.007,0,-.005),(.00055,.0095,.010))
    local_box(a,'cage_right',(.007,0,-.005),(.00055,.0095,.010))
    local_box(a,'cage_top',(0,.0046,-.005),(.014,.0005,.010))
    local_box(a,'cage_bottom',(0,-.0046,-.005),(.014,.0005,.010))
    local_box(a,'centre_rib',(0,0,-.0036),(.00075,.008,.0072),'rtds_black')
    for i,x in enumerate([-.00345,.00345],1):
        local_box(a,'well'+str(i),(x,0,-.0068),(.0058,.0076,.0005),'rtds_well',0)
        for side in [-1,1]: local_box(a,f'inner_{i}_{side}',(x+side*.0029,0,-.0032),(.0004,.0073,.006),'rtds_edge',0)
        local_box(a,'lower_lip'+str(i),(x,-.0034,-.0024),(.0058,.0006,.0048),'rtds_edge',0)
        # Separate slot cut-out is surrounded by upper rim shoulders.
        for side in [-1,1]:local_box(a,f'key_shoulder_{i}_{side}',(x+side*.0022,.0034,-.0025),(.0013,.001,.005),'rtds_edge',0)
        local_box(a,'key_slot'+str(i),(x,.0036,-.0057),(.0023,.0013,.0003),'rtds_well',0,'key_slot')
        local_ring(a,'contact'+str(i),(x,-.0001,-.0061),.00105,.00066,.0005,'rtds_plate','contact',n=16)
        local_cyl(a,'ferrule_dark'+str(i),(x,-.0001,-.0065),.00065,.0003)
    local_box(a,'bail_crossbar',(0,-.0043,-.0004),(.011,.00065,.0007),'rtds_silver')
    for side in [-1,1]:local_box(a,'bail_arm'+str(side),(side*.0053,-.0036,-.0012),(.00065,.0017,.0018),'rtds_silver')

def ethernet(a,sfp=False):
    a['connector_family']='copper_sfp' if sfp else '8p8c'
    w=.014 if sfp else .0152; h=.012
    for x in [-w/2,w/2]:local_box(a,'side'+str(x),(x,0,-.004),(.0008,h,.008),'rtds_silver' if sfp else 'rtds_black')
    for y in [-h/2,h/2]:local_box(a,'edge'+str(y),(0,y,-.004),(w,.0008,.008),'rtds_silver' if sfp else 'rtds_black')
    local_box(a,'well',(0,0,-.008),(w-.001,.011,.0003),'rtds_well',0)
    local_box(a,'latch_slot',(0,.0049,-.0055),(.004,.002,.0003),'rtds_well',0,'key_slot')
    for sign in [-1,1]:
        local_box(a,'key_shoulder'+str(sign),(sign*(w/4+.001),.0045,-.0039),(w/2-.002,.0029,.0078),'rtds_black',.0001,'key_shoulder')
    for i in range(8):
        o=local_box(a,'contact'+str(i+1),((i-3.5)*.001,-.0029,-.0038),(.00038,.00042,.0064),'rtds_contact',.00008,'contact');o.rotation_euler.x=.23
    if not sfp:
        for i,x in enumerate([-.006,.006]):local_box(a,'unlit_led'+str(i),(x,-.0053,-.0005),(.0017,.001,.001),'rtds_plate',0)

def gbh(a):
    a['connector_family']='gbh_pof_visual'
    local_box(a,'outer',(0,0,-.006),(.017,.008,.003),'rtds_black')
    for i,x in enumerate([-.0047,.0047],1):
        local_ring(a,'receptacle'+str(i),(x,0,-.0031),.0035,.00265,.0055,'rtds_black',n=16)
        local_ring(a,'contact'+str(i),(x,0,-.004),.0018,.0011,.0004,'rtds_plate','contact',n=16)
        local_cyl(a,'deep'+str(i),(x,0,-.0045),.0011,.0004)
    local_box(a,'tab_slot',(0,.003,-.002),(.003,.0015,.004),'rtds_well',0,'key_slot')

def dc_power(a):
    a['connector_family']='dc_round_visual'
    local_ring(a,'barrel',(0,0,-.0016),.0045,.0031,.003,'rtds_silver','contact',n=24)
    local_cyl(a,'recess',(0,0,-.0032),.003,.0003)
    local_cyl(a,'centre_pin',(0,0,-.0017),.0008,.0022,'rtds_contact','contact',n=12)

def ac_power(a):
    a['connector_family']='three_blade_power_visual'
    # Distinct chamfered mouth; three rectangular blades, not cylindrical pins.
    pts=[(-.012,-.008),(.012,-.008),(.012,.004),(.008,.008),(-.008,.008),(-.012,.004)]
    verts=[]
    for z in [-.008,0]:verts += [(x,y,z) for x,y in pts]
    faces=[]
    for i in range(6):j=(i+1)%6;faces.append((i,j,6+j,6+i))
    me=bpy.data.meshes.new(a.name+'.rim');me.from_pydata(verts,[],faces);me.update();o=bpy.data.objects.new(a.name+'.rim',me);bpy.context.collection.objects.link(o);tag(o,a['asset_id'],a['idpart']+'.rim',a);me.materials.append(material('rtds_black'))
    local_box(a,'back',(0,0,-.008),(.022,.014,.0004),'rtds_well',0)
    for i,(x,y) in enumerate([(-.006,-.003),(.006,-.003),(0,.0035)],1):local_box(a,'blade'+str(i),(x,y,-.0034),(.0013,.003,.006),'rtds_silver',.0001,'contact')

def build_connector(record,parent):
    a=anchor_from_record(record,parent);t=record['connector']
    if t.startswith('round_single'):round_single_socket(a)
    elif t.startswith('lc_duplex'):sfp_duplex(a)
    elif t=='copper_sfp_8p8c':ethernet(a,True)
    elif t=='8p8c_ethernet':ethernet(a)
    elif t.startswith('gbh'):gbh(a)
    elif t.startswith('round_dc'):dc_power(a)
    elif t.startswith('three_blade'):ac_power(a)
    else:raise ValueError('Unverified connector family '+t)
    return a
