#!/usr/bin/env python3
"""
SynDx Decision Router Extension - Adverse Drug Reaction (ADR) Triage Engine
Extends SynDx decision routing tiers for ADR signals based on organ toxicity,
vitals instability, and AI model confidence.
"""

from typing import Dict, Any

class ADRRouterExtension:
    """
    Evaluates ADR signal severity and maps to appropriate clinical action tiers.
    """

    @staticmethod
    def route_adr_signal(adr_data: Dict[str, Any]) -> Dict[str, Any]:
        vitals = adr_data.get("vitals", {})
        labs = adr_data.get("labs", {})
        confidence = adr_data.get("confidence", 80)
        
        o2_sat = vitals.get("oxygenSat", 98)
        sys_bp = vitals.get("sysBP", 120)
        alt_ast = labs.get("altAst", 35)
        eosinophils = labs.get("eosinophils", 2.0)
        platelets = labs.get("platelets", 250)

        # 1. Emergency Override Trigger
        if o2_sat < 90 or sys_bp < 85 or sys_bp > 180 or alt_ast > 250:
            return {
                "tier": "Emergency",
                "action": "CRITICAL EMERGENCY: Immediate Drug Cessation & Tertiary ICU Transfer",
                "reason": f"Life-threatening vital instability or severe organ toxicity detected (O2: {o2_sat}%, SysBP: {sys_bp}mmHg, ALT: {alt_ast}U/L).",
                "doctorQueuePriority": "P0_IMMEDIATE"
            }

        # 2. Tier A: High Confidence ADR
        if confidence >= 85 or alt_ast >= 120 or eosinophils >= 8.0 or platelets <= 80:
            return {
                "tier": "Tier A",
                "action": "Direct Specialist ADR Consultation & Immediate Drug Hold",
                "reason": f"High probability of severe drug-induced organ reaction ({confidence}% confidence, ALT: {alt_ast}U/L, Eosinophils: {eosinophils}%).",
                "doctorQueuePriority": "P1_URGENT"
            }

        # 3. Tier B: Moderate ADR Signal
        if 60 <= confidence < 85 or alt_ast >= 50 or eosinophils >= 4.0:
            return {
                "tier": "Tier B",
                "action": "Priority Doctor Console Queue for Dose Adjustment & Lab Re-test",
                "reason": f"Moderate ADR suspicion ({confidence}% confidence). Requires physician review before next dose.",
                "doctorQueuePriority": "P2_ROUTINE"
            }

        # 4. Tier C: Mild / Sub-clinical Signal
        return {
            "tier": "Tier C",
            "action": "Routine Follow-up & Symptom Observation Log",
            "reason": f"Low ADR confidence ({confidence}%). Maintain prescribed regimen with 7-day re-assessment.",
            "doctorQueuePriority": "P3_MONITORING"
        }

if __name__ == "__main__":
    test_adr = {
        "confidence": 92,
        "vitals": {"oxygenSat": 96, "sysBP": 124},
        "labs": {"altAst": 145, "eosinophils": 8.5, "platelets": 110}
    }
    result = ADRRouterExtension.route_adr_signal(test_adr)
    print("ADR Routing Tier Output:", result)
