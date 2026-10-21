"""Render missing diagnostic views from the saved master; never overwrite a PNG."""
import sys,json
from pathlib import Path
import bpy
sys.path.insert(0,str(Path(__file__).resolve().parent))
from build import orient_camera,wire_overlay
from qa_asset import measured_scene
p=Path(sys.argv[sys.argv.index('--')+1]).resolve(); c=json.loads((p/'parameters.json').read_text())
bpy.ops.wm.open_mainfile(filepath=str(p/'source/asset.blend')); r=measured_scene(c)
for view in ['iso','neutral','wireframe','front','rear','left','right','top']:
    target=p/'previews'/f'{view}.png'
    if target.exists(): continue
    orient_camera(c,r,view); sc=bpy.context.scene; sc.render.use_freestyle=view not in {'neutral','wireframe'}; made=[]; hidden=[]
    if view=='wireframe': made,hidden=wire_overlay()
    sc.render.filepath=str(target); bpy.ops.render.render(write_still=True)
    for ob in made: bpy.data.objects.remove(ob,do_unlink=True)
    for ob in hidden: ob.hide_render=False
    print('RENDER',view,target,flush=True)
print('PASS missing-view render from saved .blend')
