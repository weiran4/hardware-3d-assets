"""Read-only QA sensitivity probes: mutate clean GLB imports in memory, never save."""
import bpy,runpy,unittest,json,hashlib
from pathlib import Path
P=Path(__file__).resolve().parents[1]
T=runpy.run_path(str(P/'source/test_geometry.py'),run_name='gtao_physical_tests')['PhysicalGTAO']
def obj(suffix):return next(o for o in bpy.context.scene.objects if o.get('sid')=='gtao-v2-2.20.'+suffix)
def load():
 bpy.ops.wm.read_factory_settings(use_empty=True);bpy.ops.import_scene.gltf(filepath=str(P/'exports/asset.glb'));bpy.context.view_layer.update()
probes=[('deleted terminal contact','test_all_anchors_and_actual_contacts',lambda:bpy.data.objects.remove(obj('channel1.contact0'),do_unlink=True)),('floating terminal header','test_terminal_headers_reach_pcb',lambda:setattr(obj('channel1.pcb_header').location,'y',obj('channel1.pcb_header').location.y+.003)),('optical contact behind its well','test_optical_contact_visibility',lambda:setattr(obj('gt1.contact1').location,'z',obj('gt1.contact1').location.z-.020)),('coplanar heatsink cap','test_heatsink_no_coplanar_top_faces',lambda:setattr(obj('heatsink_core').location,'z',obj('heatsink_core').location.z+.001))]
out=[]
for label,test,mutate in probes:
 load();mutate();bpy.context.view_layer.update();result=unittest.TextTestRunner(verbosity=1).run(unittest.TestSuite([T(test)]));caught=not result.wasSuccessful();out.append({'mutation':label,'regression':test,'detected':caught});assert caught,label
(P/'qa/mutation-probes.json').write_text(json.dumps({'asset_id':'gtao-v2-2.20','status':'PASS','source_glb_sha256':hashlib.sha256((P/'exports/asset.glb').read_bytes()).hexdigest(),'scope':'Each deliberate in-memory mutation of actual delivered GLB was rejected; neither master nor export saved.','probes':out},indent=2)+'\n');print('PASS: all four deliberate geometry mutations detected')
