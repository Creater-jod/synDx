#!/usr/bin/env python3
"""
SynDx Backend API - ADR Signal Service
Handles storage, retrieval, conflict resolution, and audit tracking for Adverse Drug Reaction signals.
"""

import json
from datetime import datetime
from typing import Dict, List, Optional, Any

# In-memory store fallback for backend service runtime
ADR_SIGNALS_DATABASE: List[Dict[str, Any]] = [
    {
        "signalId": "adr-signal-9901",
        "caseId": "case-adr-001",
        "patientCode": "PAT-ANM-4412",
        "prescribedDrug": "Imiglucerase ERT",
        "daysPostPrescription": 14,
        "suspectedReaction": "Acute Hepatocellular Injury & Transaminase Elevation",
        "severityTier": "Tier A",
        "confidence": 91,
        "vitalsDelta": [
            {"marker": "Serum ALT", "baseline": "28 U/L", "current": "142 U/L", "status": "Critical"},
            {"marker": "Eosinophils", "baseline": "1.8%", "current": "8.5%", "status": "Elevated"}
        ],
        "shapReasons": [
            {"feature": "Serum ALT Elevation", "impact": 38, "description": "Acute ALT spike (142 U/L) 14 days post-Imiglucerase ERT initiation."},
            {"feature": "Eosinophil Spike", "impact": 26, "description": "Eosinophil count 8.5% indicates drug reaction."}
        ],
        "timestamp": "2026-08-03T14:22:00Z",
        "syncStatus": "Synced",
        "status": "Pending Review"
    },
    {
        "signalId": "adr-signal-9902",
        "caseId": "case-adr-002",
        "patientCode": "PAT-VLP-8819",
        "prescribedDrug": "Miglustat 100mg",
        "daysPostPrescription": 21,
        "suspectedReaction": "Gastrointestinal Intolerance & Tremors",
        "severityTier": "Tier B",
        "confidence": 76,
        "vitalsDelta": [
            {"marker": "Body Weight", "baseline": "58 kg", "current": "54.2 kg", "status": "Elevated"}
        ],
        "shapReasons": [
            {"feature": "Weight Drop", "impact": 24, "description": "Rapid weight loss post-Miglustat start."}
        ],
        "timestamp": "2026-08-02T09:15:00Z",
        "syncStatus": "Synced",
        "status": "Confirmed ADR"
    }
]

class ADRSignalService:
    @staticmethod
    def save_adr_signal(signal: Dict[str, Any]) -> Dict[str, Any]:
        """
        Saves or updates an ADR signal in the backend database.
        """
        signal_id = signal.get("signalId") or f"adr-sig-{int(datetime.now().timestamp())}"
        signal["signalId"] = signal_id
        signal["timestamp"] = signal.get("timestamp") or datetime.utcnow().isoformat() + "Z"
        signal["syncStatus"] = "Synced"

        # Check for existing record
        for idx, existing in enumerate(ADR_SIGNALS_DATABASE):
            if existing["signalId"] == signal_id or existing.get("caseId") == signal.get("caseId"):
                ADR_SIGNALS_DATABASE[idx] = signal
                return signal

        ADR_SIGNALS_DATABASE.insert(0, signal)
        return signal

    @staticmethod
    def get_adr_signals(status_filter: Optional[str] = None, tier_filter: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Retrieves ADR signals with optional filtering by review status or severity tier.
        """
        results = ADR_SIGNALS_DATABASE
        if status_filter and status_filter != "All":
            results = [s for s in results if s.get("status") == status_filter]
        if tier_filter and tier_filter != "All":
            results = [s for s in results if s.get("severityTier") == tier_filter]
        return results

    @staticmethod
    def get_signal_by_id(signal_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieves a single ADR signal by unique signal ID or case ID.
        """
        for signal in ADR_SIGNALS_DATABASE:
            if signal.get("signalId") == signal_id or signal.get("caseId") == signal_id:
                return signal
        return None

    @staticmethod
    def update_signal_status(signal_id: str, new_status: str, doctor_notes: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """
        Updates physician review status and clinical observations.
        """
        for signal in ADR_SIGNALS_DATABASE:
            if signal.get("signalId") == signal_id or signal.get("caseId") == signal_id:
                signal["status"] = new_status
                if doctor_notes:
                    signal["doctorNotes"] = doctor_notes
                return signal
        return None

    @staticmethod
    def resolve_sync_conflict(client_signal: Dict[str, Any], server_signal: Dict[str, Any]) -> Dict[str, Any]:
        """
        Resolves sync conflict between client offline queue and backend store.
        """
        if client_signal.get("status") in ["Confirmed ADR", "Dismissed", "Dose Adjusted"]:
            # Client has explicit physician authorization
            ADRSignalService.save_adr_signal(client_signal)
            return {"resolved": True, "winner": "client", "activeSignal": client_signal}
        else:
            return {"resolved": True, "winner": "server", "activeSignal": server_signal}

    @staticmethod
    def get_adr_summary_metrics() -> Dict[str, Any]:
        """
        Returns summary statistics for the doctor console dashboard.
        """
        total = len(ADR_SIGNALS_DATABASE)
        pending = sum(1 for s in ADR_SIGNALS_DATABASE if s.get("status") == "Pending Review")
        tier_a = sum(1 for s in ADR_SIGNALS_DATABASE if s.get("severityTier") in ["Tier A", "Emergency"])
        return {
            "totalADRCount": total,
            "pendingReviewCount": pending,
            "urgentTierACount": tier_a
        }

if __name__ == "__main__":
    signals = ADRSignalService.get_adr_signals()
    print("Backend ADR Signals Loaded:", len(signals))
    print(json.dumps(ADRSignalService.get_adr_summary_metrics(), indent=2))
