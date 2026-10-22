"""Asset-local original mesh vocabulary; no source images or certified dimensions."""
import bpy,math,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3];sys.path.insert(0,str(ROOT/"tools"))
from asset_common import tag,material,PALETTE
A="gtfpi-v2-2.01-capped"
CUBE_V=[(-.5,-.5,-.5),(.5,-.5,-.5),(.5,.5,-.5),(-.5,.5,-.5),(-.5,-.5,.5),(.5,-.5,.5),(.5,.5,.5),(-.5,.5,.5)]
CUBE_F=[(0,3,2,1),(4,5,6,7),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7)]
def mesh(name,vs,fs,parent,mat,loc=(0,0,0),feature=None):
 m=bpy.data.meshes.new(A+'.'+name);m.from_pydata(vs,[],fs);m.update();o=bpy.data.objects.new(A+'.'+name,m);bpy.context.collection.objects.link(o);tag(o,A,name,parent);o.location=loc;m.materials.append(material(mat))
 if feature:o['interface_feature']=feature
 return o

def box(name,loc,size,parent,mat='gf_chip',feature=None):
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

def text(name,body,loc,size,parent,mat='gf_silk',rotation=None,align='LEFT'):
 cu=bpy.data.curves.new(A+'.'+name,'FONT');cu.body=body;cu.size=size;cu.align_x=align;cu.align_y='CENTER';cu.resolution_u=1
 o=bpy.data.objects.new(A+'.'+name,cu);bpy.context.collection.objects.link(o);tag(o,A,name,parent);o.location=loc;cu.materials.append(material(mat));o['interface_feature']='printed_label'
 if rotation:o.rotation_euler=rotation
 return o

