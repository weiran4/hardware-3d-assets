"""Every rotary control must visibly bridge its body to the front panel."""
import sys
from pathlib import Path
import bpy
p=Path(sys.argv[sys.argv.index('--')+1]).resolve();bpy.ops.wm.open_mainfile(filepath=str(p/'source/asset.blend'));deps=bpy.context.evaluated_depsgraph_get()
def yrange(o):
 ev=o.evaluated_get(deps);me=ev.to_mesh();v=[(o.matrix_world@x.co).y for x in me.vertices];ev.to_mesh_clear();return min(v),max(v)
for o in bpy.context.scene.objects:
 if o.get('motion')!='rotation':continue
 shaft=next((x for x in o.children if x.get('sid','').endswith('_shaft')),None)
 assert shaft is not None,('Floating knob lacks a connecting shaft',o.name)
 panel=next(x for x in bpy.context.scene.objects if x.get('sid')==o.get('asset_id')+'.panel_front')
 s=yrange(shaft);k=yrange(o);p=yrange(panel)
 assert s[0]<k[1]-.0001 and s[1]>p[0]+.0001,(o.name,s,k,p)
print('PASS knob shafts physically bridge faceplate and knob')
