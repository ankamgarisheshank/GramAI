import json
from typing import List, Dict

class DatasetValidator:
    def check_missing_fields(self, data: List[Dict], required_fields: List[str]) -> List[Dict]:
        errors = []
        for idx, item in enumerate(data):
            missing = [f for f in required_fields if not item.get(f)]
            if missing:
                errors.append({"index": idx, "missing_fields": missing})
        return errors

    def detect_duplicates(self, data: List[Dict], key: str) -> List[str]:
        seen = set()
        duplicates = []
        for item in data:
            val = item.get(key)
            if val in seen:
                duplicates.append(val)
            seen.add(val)
        return duplicates
