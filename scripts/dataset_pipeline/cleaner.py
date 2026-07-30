import json
import os
from typing import List, Dict

class DatasetCleaner:
    def __init__(self, raw_dir: str, processed_dir: str):
        self.raw_dir = raw_dir
        self.processed_dir = processed_dir

    def remove_duplicates(self, data: List[Dict], unique_key: str) -> List[Dict]:
        seen = set()
        unique = []
        for item in data:
            val = item.get(unique_key)
            if val not in seen:
                seen.add(val)
                unique.append(item)
        return unique

    def normalize_fields(self, data: List[Dict]) -> List[Dict]:
        for item in data:
            if 'description' in item:
                item['description'] = item['description'].strip().replace('\n', ' ')
        return data

    def handle_missing_values(self, data: List[Dict], defaults: Dict) -> List[Dict]:
        for item in data:
            for key, default in defaults.items():
                if item.get(key) is None:
                    item[key] = default
        return data
