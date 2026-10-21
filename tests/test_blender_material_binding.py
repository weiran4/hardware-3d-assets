"""A reassignment to another existing palette color must change the material digest."""
import sys,json
from pathlib import Path
import bpy
root=Path(__file__).resolve().parents[1];sys.path.insert(0,str(root/'tools'))
from qa_asset import measured_scene
from asset_common import compare_runs
p=Path(sys.argv[sys.argv.index('--')+1]).resolve();bpy.ops.wm.open_mainfile(filepath=str(p/'source/asset.blend'));c=json.loads((p/'parameters.json').read_text())
a=measured_scene(c);o=next(o for o in bpy.data.objects if o.get('sid')=='oscilloscope.knob_time');o.data.materials[0]=bpy.data.materials['palette.blue'];b=measured_scene(c)
assert a['material_digest']!=b['material_digest'],'Existing-palette reassignment was invisible to digest'
assert 'materials' in compare_runs(a,b)
print('PASS existing-palette material binding mutation is detected')
