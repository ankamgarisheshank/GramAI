from typing import Dict, Any
import datetime

class MetadataGenerator:
    @staticmethod
    def generate_scheme_metadata(scheme: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "Category": scheme.get("Category", "General"),
            "Department": scheme.get("Department", "General"),
            "Language": "en,te",
            "District": scheme.get("District Applicability", "All"),
            "Beneficiary Type": scheme.get("Beneficiary Type", "Citizen"),
            "Tags": [scheme.get("Category"), "Govt Scheme", "Telangana"],
            "Source": scheme.get("Official Website", "Telangana Govt Portal"),
            "Version": datetime.datetime.now().strftime("%Y-%m-%d"),
            "Document_Type": "Scheme"
        }
