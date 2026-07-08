import unittest
import json
from app import app

class BioHelixTestCase(unittest.TestCase):
    def setUp(self):
        app.config['TESTING'] = True
        self.client = app.test_client()

    def test_presets_endpoint(self):
        response = self.client.get('/api/presets')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('insulin', data)
        self.assertIn('hemoglobin', data)
        self.assertEqual(data['insulin']['name'], 'Human Insulin')

    def test_translation_success(self):
        # Human Insulin sequence
        payload = {"sequence": "ATGGCCTGTGGATGCGCCTCCTGCCCCTGCTGCGGCGGCCTCCTCTAA"}
        response = self.client.post('/api/translate', 
                                    data=json.dumps(payload),
                                    content_type='application/json')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertTrue(data['success'])
        self.assertEqual(data['dna'], "ATGGCCTGTGGATGCGCCTCCTGCCCCTGCTGCGGCGGCCTCCTCTAA")
        self.assertEqual(data['mrna'], "AUGGCCUGUGGAUGCGCCUCCUGCCCCUGCUGCGGCGGCCUCCUCUAA")
        self.assertEqual(data['status'], "completed")
        self.assertGreater(len(data['amino_acids']), 0)
        self.assertEqual(data['amino_acids'][0]['codon'], 'AUG')
        self.assertEqual(data['amino_acids'][0]['symbol'], 'Met')

    def test_translation_no_start_codon(self):
        # A sequence with no ATG (AUG) at all
        payload = {"sequence": "CCCGGGCCCGGGCCCGGG"}
        response = self.client.post('/api/translate', 
                                    data=json.dumps(payload),
                                    content_type='application/json')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertTrue(data['success'])
        self.assertEqual(data['status'], "error")
        self.assertEqual(len(data['amino_acids']), 0)
        self.assertTrue(any(step['phase'] == 'Initiation Failure' for step in data['steps']))

    def test_translation_invalid_bases(self):
        payload = {"sequence": "ATGCXTAGCTAA"}
        response = self.client.post('/api/translate', 
                                    data=json.dumps(payload),
                                    content_type='application/json')
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertFalse(data['success'])
        self.assertIn("Invalid", data['error'])

    def test_translation_empty_sequence(self):
        payload = {"sequence": "   "}
        response = self.client.post('/api/translate', 
                                    data=json.dumps(payload),
                                    content_type='application/json')
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertFalse(data['success'])

if __name__ == '__main__':
    unittest.main()
