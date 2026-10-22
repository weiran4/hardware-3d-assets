"""Exact auxiliary populations upgrade stable records, never compatibility gates."""
import json
import unittest
from pathlib import Path

HERE = Path(__file__).parent


class AuxiliaryCatalog(unittest.TestCase):
    def setUp(self):
        self.data = json.loads((HERE / 'manifest.json').read_text())
        self.variants = {v['id']: v for v in self.data['variants']}

    def test_stable_eighteen_entries_and_seven_visual_candidates(self):
        self.assertEqual(len(self.data['variants']), 18)
        self.assertEqual(sum(v['release_gate']['stage'] != 'catalog_only'
                             for v in self.variants.values()), 7)
        for key, asset in [('gtfpi-v2', 'gtfpi-v2-2.01-capped'),
                           ('gtsoc-v2', 'gtsoc-v2-2a-copper16')]:
            v = self.variants[key]
            self.assertIn(asset + '/source/asset.blend', ' '.join(v['notes']))
            self.assertEqual(v['release_gate']['stage'], 'connector_research_candidate')
            self.assertFalse(v['release_gate']['accurate_connector_release_passed'])
            self.assertEqual(v['confidence']['electrical_compatibility']['status'], 'unknown')
        self.assertEqual(self.variants['gtfpi-v1']['release_gate']['stage'], 'catalog_only')
        self.assertEqual(self.variants['gtsoc-v1']['release_gate']['stage'], 'catalog_only')

    def test_gtfpi_counts_do_not_establish_power_pin_order_or_uncapped_geometry(self):
        v = self.variants['gtfpi-v2']
        self.assertIn('2.01', v['identity_scope'])
        self.assertIn('capped', v['identity_scope'])
        facts = json.dumps(v['confidence'])
        for phrase in ['94', '50', '34', 'open two-pin', 'spatial', 'unknown', 'uncapped']:
            self.assertIn(phrase, facts)
        self.assertIn('not itself', ' '.join(v['notes']))

    def test_gtsoc_population_and_rear_face_boundary_are_explicit(self):
        v = self.variants['gtsoc-v2']
        self.assertIn('GTSOC-2A', v['identity_scope'])
        self.assertIn('16 copper', v['identity_scope'])
        facts = json.dumps(v['confidence'])
        for phrase in ['151', '8 white', 'not electrical contacts', 'cap-versus-sleeve',
                       'MONITOR PS', 'MONITOR PL', 'PROG JTAG']:
            self.assertIn(phrase, facts)
        notes = ' '.join(v['notes'])
        for phrase in ['SV', 'firmware', 'modules', 'rear ports 1-4', 'printed p.4']:
            self.assertIn(phrase, notes)

    def test_private_manual_identifier_has_no_source_container_details(self):
        private = [s for s in self.data['sources'] if s['access'] == 'private_user_provided']
        self.assertEqual([s['id'] for s in private], ['MANUAL'])


if __name__ == '__main__':
    unittest.main()
