from typing import Dict, Any

class AdvancedSymbolicReasoner:
    def __init__(self):
        self.medical_context = {
            "glioma": {
                "origin": "Originates from glial cells.",
                "etiology": "Linked to IDH mutations. Infiltrative behavior.",
                "behavior": "Can be low-grade or high-grade (Glioblastoma)."
            },
            "meningioma": {
                "origin": "Arises from the meninges.",
                "etiology": "Linked to NF2 gene. Often benign.",
                "behavior": "Compresses brain tissue."
            },
            "pituitary": {
                "origin": "Arises from pituitary gland.",
                "etiology": "Hormonal imbalances.",
                "behavior": "Visual field defects."
            },
            "notumor": {
                "origin": "Normal tissue.",
                "etiology": "N/A",
                "behavior": "N/A"
            }
        }

    def generate_explanation(self, ai_facts: Dict[str, Any], genetics: Dict[str, str] = None) -> str:
        """
        Generates explanation combining Visual AI Facts + Multi-modal Genetic Data.
        """
        pred_class = ai_facts.get("predicted_class", "notumor").lower()
        confidence = ai_facts.get("confidence", 0) * 100
        volume = ai_facts.get("tumor_volume_cm2", 0)
        
        explanation = f"Diagnosis: {pred_class.capitalize()}. Confidence: {confidence:.1f}%. "
        
        if pred_class != "notumor":
            explanation += f"Tumor volume is {volume} cm². "
            explanation += self.medical_context.get(pred_class, {}).get("behavior", "") + " "
        
        if genetics:
            explanation += "\n[Multi-modal Analysis]: "
            idh = genetics.get("idh_status", "Unknown")
            mgmt = genetics.get("mgmt_status", "Unknown")

            if pred_class == "glioma":
                if idh == "Mutant":
                    explanation += "Presence of IDH Mutation suggests a better prognosis and responsiveness to therapy (Low Grade Glioma). "
                elif idh == "Wildtype":
                    explanation += "IDH Wildtype suggests an aggressive course (Glioblastoma-like). "
                
                if mgmt == "Methylated":
                    explanation += "MGMT Methylation indicates better response to Temozolomide chemotherapy."
                elif mgmt == "Unmethylated":
                    explanation += "Unmethylated MGMT implies resistance to standard chemotherapy."
            
            else:
                explanation += f"Genetic markers ({idh}, {mgmt}) noted for clinical correlation."

        return explanation

    def generate_treatment_plan(self, ai_facts: Dict[str, Any], genetics: Dict[str, str] = None) -> Dict[str, Any]:
        """Returns structured clinical recommendations."""
        pred_class = ai_facts.get("predicted_class", "notumor").lower()
        volume = ai_facts.get("tumor_volume_cm2", 0)
        
        plan = { "severity_score": 0, "action": "None", "follow_up": "Routine checkup", "protocol": [] }

        if pred_class == "glioma":
            base_score = 75
            if genetics and genetics.get("idh_status") == "Wildtype":
                base_score += 15 # More severe
                plan["action"] = "Aggressive Resection + Radiation"
                plan["follow_up"] = "MRI every 2-3 months"
            else:
                plan["action"] = "Surgical Resection"
                plan["follow_up"] = "MRI every 3-6 months"
            
            plan["severity_score"] = min(base_score + (volume * 0.5), 99)
            plan["protocol"] = ["Maximal safe resection", "Adjuvant Radiotherapy"]

        elif pred_class == "meningioma":
            plan["severity_score"] = 40 if volume < 3 else 65
            if volume < 3:
                plan["action"] = "Active Surveillance"
                plan["follow_up"] = "MRI in 6-12 months"
            else:
                plan["action"] = "Surgery"
                plan["follow_up"] = "Post-op MRI in 3 months"
            plan["protocol"] = ["Monitor growth"]

        elif pred_class == "pituitary":
            plan["severity_score"] = 30 if volume < 1 else 60
            if volume < 1:
                plan["action"] = "Endocrine Eval"
                plan["follow_up"] = "MRI + Labs in 6-12 months"
            else:
                plan["action"] = "Ophthalmology + Endocrine Consult"
                plan["follow_up"] = "MRI in 3 months, Visual fields"
            plan["protocol"] = ["Hormone testing"]

        return plan


simple_reasoner = AdvancedSymbolicReasoner()