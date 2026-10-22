"""Rebuild into memory, compare full geometry/semantics/materials; never replace frozen files."""
import bpy,sys,json,importlib.util,hashlib
from pathlib import Path
sys.dont_write_bytecode=True
P=Path(__file__).resolve().parents[1];ROOT=P.parents[1];sys.path.insert(0,str(ROOT/'tools'))
from build import configure
from qa_asset import measured_scene
from asset_common import compare_runs,validate_contract
c=json.loads((P/'parameters.json').read_text());expected=json.loads((P/'qa/build_measurements.json').read_text());configure(c)
spec=importlib.util.spec_from_file_location('gtfpi_rebuilder',P/'source/build.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);m.build_asset(c);bpy.context.view_layer.update();actual=measured_scene(c);errors=compare_runs(expected,actual)+validate_contract(actual,c)
r={'asset_id':P.name,'status':'FAIL' if errors else 'PASS','errors':errors,'geometry_digest':actual['geometry_digest'],'semantic_digest':actual['semantic_digest'],'material_digest':actual['material_digest'],'placed_triangles':actual['placed_triangles'],'master_replaced':False,'source_blend_sha256':hashlib.sha256((P/'source/asset.blend').read_bytes()).hexdigest(),'source_glb_sha256':hashlib.sha256((P/'exports/asset.glb').read_bytes()).hexdigest()};(P/'qa/rebuild.json').write_text(json.dumps(r,indent=2)+'\n');print(r)
if errors:raise RuntimeError(errors)
