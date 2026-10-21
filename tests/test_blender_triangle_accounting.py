"""Identical but distinct mesh datablocks are not silently deduplicated in native counts."""
import sys,json
from pathlib import Path
import bpy
root=Path(__file__).resolve().parents[1];sys.path.insert(0,str(root/'tools'))
from qa_asset import measured_scene
p=Path(sys.argv[sys.argv.index('--')+1]).resolve();bpy.ops.wm.open_mainfile(filepath=str(p/'source/asset.blend'));c=json.loads((p/'parameters.json').read_text());r=measured_scene(c)
seen=set();expected=0;deps=bpy.context.evaluated_depsgraph_get()
for o in bpy.context.scene.objects:
 if not o.get('sid') or o.type not in {'MESH','CURVE','FONT'}:continue
 key=o.data.as_pointer()
 if key in seen:continue
 seen.add(key);ev=o.evaluated_get(deps);me=ev.to_mesh();me.calc_loop_triangles();expected+=len(me.loop_triangles);ev.to_mesh_clear()
assert r['unique_triangles']==expected,(r['unique_triangles'],expected)
print('PASS unique datablock accounting:',expected)
