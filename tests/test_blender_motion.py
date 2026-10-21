"""Integration regression: scope knobs must spin, not tilt their world-space shafts."""
import sys,json
from pathlib import Path
root=Path(__file__).resolve().parents[1]; sys.path.insert(0,str(root/'tools'))
import bpy
from qa_asset import measured_scene
path=Path(sys.argv[sys.argv.index('--')+1]); bpy.ops.wm.open_mainfile(filepath=str((path/'source/asset.blend').resolve()))
c=json.loads((path/'parameters.json').read_text()); r=measured_scene(c)
assert r.get('motion_axis_max_drift',1)<1e-6,('shaft axis moved or was not measured',r.get('motion_axis_max_drift'))
assert r.get('motion_pivot_max_drift',1)<1e-6
assert r.get('motion_marker_min_displacement',0)>1e-4
assert r['root_drift_m']<=1e-6 and r['other_part_drift_m']<=1e-6
print('PASS local shaft spin + pivot invariance + visible pointer movement')
