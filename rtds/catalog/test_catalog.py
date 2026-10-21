"""Offline contract checks for the source-only RTDS catalog (no Blender required)."""
import json
import pathlib
import unittest

HERE = pathlib.Path(__file__).resolve().parent
EXPECTED = {
    'novacor-2.0', 'novacor-light', 'novacor-1.0',
    'gtdi-v2', 'gtdi-v1', 'gtdo-v2', 'gtdo-v1',
    'gtai-v2', 'gtai-v1', 'gtao-v2', 'gtao-v1',
    'gtsoc-v2', 'gtsoc-v1', 'gtnet-v3', 'gtnet-x2', 'gtnet-legacy',
    'gtfpi-v2', 'gtfpi-v1',
}
DIMENSIONS = {'count', 'layout', 'keying', 'contacts', 'physical_dimensions', 'electrical_compatibility'}
STATES = {'documented', 'observed', 'partial', 'unknown', 'conflicting'}

class CatalogContract(unittest.TestCase):
    def test_catalog_exists(self):
        self.assertTrue((HERE / 'manifest.json').is_file(), 'source-driven catalog missing')

    def load(self):
        return json.loads((HERE / 'manifest.json').read_text())

    def test_required_versions_are_distinct(self):
        data = self.load()
        ids = [a['id'] for a in data['variants']]
        self.assertEqual(set(ids), EXPECTED)
        self.assertEqual(len(ids), len(set(ids)))

    def test_every_fact_has_source_and_each_gate_is_conservative(self):
        data = self.load()
        source_ids = {s['id'] for s in data['sources']}
        for a in data['variants']:
            self.assertEqual(set(a['confidence']), DIMENSIONS, a['id'])
            self.assertFalse(a['release_gate']['accurate_connector_release_passed'], a['id'])
            self.assertEqual(a['confidence']['electrical_compatibility']['status'], 'unknown')
            self.assertTrue(a['release_gate']['blockers'])
            for dim in a['confidence'].values():
                self.assertIn(dim['status'], STATES)
                for fact in dim['facts']:
                    self.assertTrue(fact['source_refs'])
                    self.assertLessEqual(set(fact['source_refs']), source_ids)
                    self.assertTrue(fact['locator'])
            for ref in a['evidence']:
                self.assertIn(ref['source_id'], source_ids)

    def test_no_private_media_or_path_is_published(self):
        data = self.load()
        content = json.dumps(data)
        for forbidden in ['/workspace/', 'private-source-cache', 'file://', 'data:image', 'library_file_id']:
            self.assertNotIn(forbidden, content)
        self.assert_no_private_file_identity(data['manual_reference'])
        for source in data['sources']:
            if source['access'] == 'private_user_provided':
                self.assert_no_private_file_identity(source)
                self.assertIsNone(source['date'])
                self.assertIsNone(source['url'])
        for f in HERE.rglob('*'):
            self.assertNotIn(f.suffix.lower(), {'.pdf', '.png', '.jpg', '.jpeg', '.blend', '.glb'})

    def assert_no_private_file_identity(self, record):
        forbidden = {
            'filename', 'sha256', 'pagecount', 'pages', 'fileid',
            'libraryfileid', 'privatepath', 'workspacepath',
            'modificationdate', 'modified', 'moddate',
        }
        if isinstance(record, dict):
            for key, value in record.items():
                normalized = ''.join(c for c in key.lower() if c.isalnum())
                self.assertNotIn(normalized, forbidden, key)
                self.assert_no_private_file_identity(value)
        elif isinstance(record, list):
            for value in record:
                self.assert_no_private_file_identity(value)

    def test_private_manual_source_records_are_minimal(self):
        root = HERE.parent
        facts = json.loads((root / 'docs/batch-2-source-facts.json').read_text())
        self.assert_no_private_file_identity(facts['manual'])
        self.assertEqual(facts['manual']['title'], 'RTDS Hardware Manual')
        for asset in ['gtdo-v2-2.00', 'gtai-v2-2.31', 'gtao-v2-2.20']:
            refs = json.loads((root / asset / 'references/manifest.json').read_text())
            sources = [s for s in refs['sources'] if 'manual' in s['id']]
            self.assertTrue(sources, asset)
            for source in sources:
                self.assert_no_private_file_identity(source)
                self.assertEqual(source['title'], 'RTDS Hardware Manual')
                self.assertTrue(source['chapter_revision'])
                self.assertTrue(source['pdf_page_range'])
                self.assertTrue(source['key_pages'])

    def test_manual_reference_schema_rejects_identity_fields(self):
        import jsonschema
        schema = json.loads((HERE / 'schema.json').read_text())['properties']['manual_reference']
        validator = jsonschema.Draft202012Validator(schema)
        minimal = {'title': 'RTDS Hardware Manual', 'access': 'private_user_provided',
                   'redistribution': 'Private reference only; not included'}
        self.assertEqual(list(validator.iter_errors(minimal)), [])
        for key in ['filename', 'sha256', 'page_count', 'file_id', 'library_file_id',
                    'private_path', 'workspace_path', 'modification_date']:
            with self.subTest(key=key):
                record = dict(minimal, **{key: 'not-public'})
                self.assertTrue(any(e.validator == 'additionalProperties'
                                    for e in validator.iter_errors(record)))

    def test_source_specific_dimension_conflict_is_not_erased(self):
        a = next(a for a in self.load()['variants'] if a['id'] == 'novacor-light')
        self.assertEqual(a['confidence']['physical_dimensions']['status'], 'conflicting')
        self.assertGreaterEqual(len(a['confidence']['physical_dimensions']['facts']), 2)

    def test_refreshed_core_assets_keep_remaining_gaps(self):
        data = self.load()
        source_ids = {s['id'] for s in data['sources']}
        self.assertIn('PHOENIX-1803604', source_ids)
        variants = {a['id']: a for a in data['variants']}
        gtdi = variants['gtdi-v2']
        layout = json.dumps(gtdi['confidence']['layout'])
        self.assertIn('connector-end', layout)
        self.assertIn('inner tier', layout)
        self.assertIn('outer tier', layout)
        contacts = json.dumps(gtdi['confidence']['contacts'])
        self.assertIn('lower power header pin order remains unknown', contacts)
        physical = json.dumps(gtdi['confidence']['physical_dimensions'])
        for value in ['3.81', '19.84', '11.1', '16.1']:
            self.assertIn(value, physical)
        notes = ' '.join(gtdi['notes'])
        for text in ['gtdi-v2-2.01/source/asset.blend', 'four service', 'eight DIP']:
            self.assertIn(text, notes)
        self.assertIn('novacor-2.0-2023/source/asset.blend', ' '.join(variants['novacor-2.0']['notes']))
        for a in [gtdi, variants['novacor-2.0']]:
            self.assertFalse(a['release_gate']['accurate_connector_release_passed'])

    def test_json_schema(self):
        import jsonschema
        data = self.load()
        schema = json.loads((HERE / 'schema.json').read_text())
        jsonschema.Draft202012Validator.check_schema(schema)
        jsonschema.validate(data, schema)

if __name__ == '__main__':
    unittest.main()
