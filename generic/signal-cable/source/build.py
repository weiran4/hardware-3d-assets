import math
from mathutils import Vector, Quaternion
from asset_common import *
def build_asset(config):
    a=config['asset_id']; r=root(a)
    # 0.60m centerline including short upward approaches, no connector extensions.
    points=[]
    for i in range(65):
        t=.18*math.pi+1.64*math.pi*i/64
        z=.0025+.005*(max(0,1-i/4)+max(0,1-(64-i)/4))
        points.append(Vector((.11*math.cos(t),.075*math.sin(t),z)))
    length=sum((b-a).length for a,b in zip(points,points[1:])); factor=config['cable_length_m']/length
    points=[Vector((p.x*factor,p.y*factor,.0025+(p.z-.0025)*factor)) for p in points]
    body=path_curve(a,'body',points,config['cable_diameter_m']/2,'blue',r); body.data.bevel_resolution=1
    for suffix,index,other in [('a',0,1),('b',-1,-2)]:
        endpoint=points[index]; outward=(endpoint-points[other]); outward.z=0; outward.normalize(); q=outward.to_track_quat('Z','Y')
        center=endpoint+outward*.013
        conn=ring(a,'connector_'+suffix,center,.0064,.0045,.014,'metal',r,n=16); conn.rotation_mode='QUATERNION'; conn.rotation_quaternion=q
        # Child components are in connector-local shaft coordinates.
        boot=cylinder(a,'boot_'+suffix,(0,0,-.012),.0042,.012,'rubber',conn,12,.0004); boot.rotation_euler=(0,0,0)
        for j in range(3):
            rib=ring(a,f'boot_{suffix}_rib{j}',(0,0,-.010-j*.002),.0046,.0038,.001,'rubber',conn,12); rib.rotation_euler=(0,0,0)
        well=cylinder(a,'plug_well_'+suffix,(0,0,.002),.0044,.002,'ink',conn,12,0); well.rotation_euler=(0,0,0)
        pin=cylinder(a,'plug_pin_'+suffix,(0,0,.006),.0012,.007,'gold',conn,8,0); pin.rotation_euler=(0,0,0)
        anchor(a,'end_'+suffix,(0,0,.0095),conn,'END '+suffix.upper(),'bidirectional',Quaternion((1,0,0,0)))
    return result(a,r)
