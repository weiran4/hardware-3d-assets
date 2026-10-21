"""Independent hand-authored fixtures; the builders are deliberately not imported."""
import copy, sys, unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'tools'))
try:
    from asset_common import validate_contract, compare_runs
except ImportError:
    # Only the initial RED phase uses these explicit not-implemented stubs.
    def validate_contract(*args): raise NotImplementedError('contract not implemented')
    def compare_runs(*args): raise NotImplementedError('comparison not implemented')

PORT={'id':'oscilloscope.ch1','parent_id':'oscilloscope.root','anchor_name':'oscilloscope.ch1','label':'CH1','connector':'generic_coaxial_visual','signal_type':'unknown','direction':'input','position_m':[.08,-.10,.03],'orientation_wxyz':[.70710678,.70710678,0,0],'normal':[0,-1,0],'physical_compatibility':'unknown','electrical_constraints':None}
CFG={'asset_id':'oscilloscope','body_dimensions_m':[.28,.16,.13],'triangle_budget':8000,'required_part_ids':['oscilloscope.body','oscilloscope.knob','oscilloscope.screen'],'required_anchor_ids':['oscilloscope.ch1']}
REPORT={'asset_id':'oscilloscope','unit_scale':1,'body_dimensions_m':[.28,.16,.13],'basis':{'right':[1,0,0],'up':[0,0,1],'front':[0,-1,0]},'negative_scale_count':0,'root_drift_m':0,'other_part_drift_m':0,'part_ids':['oscilloscope.body','oscilloscope.knob','oscilloscope.screen'],'anchor_ids':['oscilloscope.ch1'],'all_ids':['oscilloscope.root','oscilloscope.body','oscilloscope.knob','oscilloscope.screen','oscilloscope.ch1'],'port_records':[PORT],'sidecar_present':True,'unique_triangles':3000,'placed_triangles':3000,'missing_resources':[],'geometry_digest':'abc','semantic_digest':'def','material_digest':'ghi','root_at_ground':True}

def changed(key,value,report=REPORT):
    r=copy.deepcopy(report); r[key]=value; return r

class TestScope(unittest.TestCase):
    def test_valid(self): self.assertEqual(validate_contract(REPORT,CFG),[])
    def test_units_axes_dimensions(self):
        self.assertIn('units',validate_contract(changed('unit_scale',.01),CFG))
        self.assertIn('axes',validate_contract(changed('basis',{'right':[1,0,0],'up':[0,0,1],'front':[0,1,0]}),CFG))
        self.assertIn('dimensions',validate_contract(changed('body_dimensions_m',[.56,.16,.13]),CFG))
    def test_budget(self): self.assertIn('budget',validate_contract(changed('placed_triangles',8001),CFG))
    def test_required_parts(self):
        for p in CFG['required_part_ids']:
            self.assertIn('parts',validate_contract(changed('part_ids',[x for x in REPORT['part_ids'] if x!=p]),CFG))
    def test_anchor(self): self.assertIn('anchors',validate_contract(changed('anchor_ids',[]),CFG))
    def test_duplicate(self): self.assertIn('duplicate_ids',validate_contract(changed('all_ids',REPORT['all_ids']+['oscilloscope.body']),CFG))

class TestReuse(unittest.TestCase):
    def test_scale_pivot_isolation(self):
        self.assertIn('negative_scale',validate_contract(changed('negative_scale_count',1),CFG))
        self.assertIn('root_motion',validate_contract(changed('root_drift_m',.001),CFG))
        self.assertIn('part_motion',validate_contract(changed('other_part_drift_m',.001),CFG))
    def test_cable_length_and_connectors(self):
        c=copy.deepcopy(CFG); c.pop('body_dimensions_m'); c.update(cable_length_m=.6,cable_diameter_m=.005)
        r=copy.deepcopy(REPORT); r.update(cable_length_m=.6,cable_diameter_m=.005,connector_count=2)
        self.assertEqual(validate_contract(r,c),[])
        self.assertIn('cable_length',validate_contract(changed('cable_length_m',.5,r),c))
        self.assertIn('cable_diameter',validate_contract(changed('cable_diameter_m',.006,r),c))
        self.assertIn('connectors',validate_contract(changed('connector_count',1,r),c))
    def test_unknown_constraints_present_not_missing(self):
        self.assertEqual(validate_contract(REPORT,CFG),[])
        r=copy.deepcopy(REPORT); del r['port_records'][0]['electrical_constraints']
        self.assertIn('metadata',validate_contract(r,CFG))

RT={'missing_ids':[],'duplicate_ids':[],'parent_mismatches':[],'material_mismatches':[],'curve_mesh_present':True,'axis_min_dot':1,'anchor_max_error_m':0,'metadata_errors':[],'sidecar_present':True,'placed_triangles':3000}
class TestDelivery(unittest.TestCase):
    def test_anchor_metadata_roundtrip(self):
        self.assertIn('metadata',validate_contract(changed('sidecar_present',False),CFG))
        self.assertIn('metadata',validate_contract(changed('metadata_errors',['wrong parent']),CFG))
        for key,value,error in [('missing_ids',['a'],'anchors'),('duplicate_ids',['a'],'duplicate_ids'),('parent_mismatches',['a'],'parents'),('material_mismatches',['a'],'materials'),('curve_mesh_present',False,'curves'),('metadata_errors',['deleted port_record'],'metadata'),('sidecar_present',False,'metadata')]:
            r=copy.deepcopy(REPORT); r['roundtrip']=dict(RT,**{key:value})
            self.assertIn(error,validate_contract(r,CFG),key)
    def test_placed_geometry_budget(self):
        r=changed('unique_triangles',8000); r['placed_triangles']=16000
        c=copy.deepcopy(CFG); c['triangle_budget']=15000
        self.assertIn('budget',validate_contract(r,c))
    def test_roundtrip_good(self):
        r=copy.deepcopy(REPORT); r['roundtrip']=copy.deepcopy(RT)
        self.assertEqual(validate_contract(r,CFG),[])

class TestRepeat(unittest.TestCase):
    def test_clean_rerun_resources(self):
        self.assertEqual(compare_runs(REPORT,copy.deepcopy(REPORT)),[])
        for key,value,error in [('geometry_digest','changed','geometry'),('semantic_digest','changed','metadata'),('material_digest','changed','materials'),('missing_resources',['lost.png'],'resources')]:
            self.assertIn(error,compare_runs(REPORT,changed(key,value)),key)

if __name__=='__main__': unittest.main()
