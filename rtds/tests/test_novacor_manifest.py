import json, pathlib, unittest, math
ROOT=pathlib.Path(__file__).resolve().parents[1]
P=ROOT/'novacor-2.0-2023/metadata/ports.json'
class TestNovaCorManifest(unittest.TestCase):
    def setUp(self):
        self.assertTrue(P.is_file(), 'source-driven ports manifest does not exist')
        self.doc=json.loads(P.read_text()); self.ports=self.doc['ports']
    def test_counts(self):
        from collections import Counter
        self.assertEqual(Counter(p['group'] for p in self.ports), {'analogue':12,'ground':3,'gtio':20,'aurora':4,'irc':6,'gtsync':1,'udp':1,'wif':1,'gbh':1,'front_led_power':1,'ac_power':1})
    def test_version_and_limits(self):
        self.assertEqual(self.doc['hardware_version'],'NovaCor 2.0')
        self.assertEqual(self.doc['envelope_mm_W_D_H'],[483,522,178])
        for p in self.ports:
            self.assertTrue(p['evidence']); self.assertFalse(p['validated_mating'])
            self.assertEqual(p['physical_compatibility'],'unknown')
            self.assertEqual(p['accuracy']['placement'],'photo_estimated')
    def test_fibre_numbering_and_key(self):
        for g,prefix,n in [('gtio','GT',20),('aurora','GT',4),('irc','IRC',6)]:
            ports=[p for p in self.ports if p['group']==g]
            for p in ports:
                odd=p['channel']%2
                self.assertEqual(p['keyed_up'],[0,0,1 if odd else -1])
                self.assertEqual(p['normal'],[0,1,0]); self.assertEqual(p['visible_contact_count'],2)
        gt={p['channel']:p for p in self.ports if p['group'] in ('gtio','aurora')}
        for a,b in [(1,3),(3,5),(5,7),(9,11),(11,13),(17,19),(21,23)]: self.assertGreater(gt[a]['position_m'][0],gt[b]['position_m'][0])
        for a in range(1,25,2):
            self.assertAlmostEqual(gt[a]['position_m'][0],gt[a+1]['position_m'][0]); self.assertGreater(gt[a]['position_m'][2],gt[a+1]['position_m'][2])
    def test_round_socket_not_bnc(self):
        analog=sorted([p for p in self.ports if p['group']=='analogue'],key=lambda p:p['channel'])
        for p in analog:
            self.assertEqual(p['connector'],'round_single_contact_socket_standard_unknown')
            self.assertEqual(p['visible_contact_count'],1)
        for a in range(0,12,3):
            self.assertGreater(analog[a]['position_m'][2],analog[a+1]['position_m'][2]); self.assertAlmostEqual(analog[a]['position_m'][0],analog[a+2]['position_m'][0])
    def test_distinct_types_and_complete_ids(self):
        self.assertEqual(len(set(p['id'] for p in self.ports)),51)
        by={p['group']:p for p in self.ports}
        self.assertEqual(by['udp']['connector'],'copper_sfp_8p8c')
        self.assertEqual(by['wif']['connector'],'8p8c_ethernet')
        self.assertEqual(by['gbh']['connector'],'gbh_duplex_pof_visual')
        self.assertEqual(by['ac_power']['visible_contact_count'],3)
if __name__=='__main__': unittest.main()
