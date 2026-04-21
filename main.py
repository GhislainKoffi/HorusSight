#!/usr/bin/env python3
"""
HorusSight - Main Entry Point
Called by the Next.js API route when a scan is triggered.
Usage: python main.py --url https://target.com --json --user-id u_123
"""

import sys
import json
import argparse
from pathlib import Path

# Add the horussight directory to sys.path so the 'engine' package is importable
sys.path.insert(0, str(Path(__file__).parent / 'horussight'))

def main():
    parser = argparse.ArgumentParser(description='HorusSight Security Scanner — Ewaba Engine')
    parser.add_argument('--url', required=True, help='Target URL to scan')
    parser.add_argument('--json', action='store_true', help='Output results as JSON to stdout')
    parser.add_argument('--user-id', default='system', help='User ID for scan attribution')
    args = parser.parse_args()

    print(f"LOG:Initialisation du moteur Ewaba pour {args.url}", flush=True)

    try:
        from engine.core.orchestrator import Orchestrator

        db_path = str(Path(__file__).parent / 'horussight' / 'horussight.db')
        orchestrator = Orchestrator(db_path=db_path)
        result = orchestrator.run(args.url, user_id=args.user_id)

        if args.json:
            print("===JSON_START===" + json.dumps(result) + "===JSON_END===", flush=True)

    except ImportError as e:
        print(f"LOG:[!] Import Error: {e}", flush=True)
        # Fallback: return a minimal result so the frontend doesn't break
        fallback = {
            "id": f"scan_fallback",
            "user_id": args.user_id,
            "target": args.url,
            "status": "Completed",
            "findings": [],
            "ai_analysis": {
                "overallRiskScore": 0,
                "businessImpactSummary": "Le moteur Python n'a pas pu être chargé. Vérifiez l'installation des dépendances.",
                "simplifiedRiskSummary": "Le scanner est en cours de configuration.",
                "remediationRoadmap": {"immediate": [], "shortTerm": [], "longTerm": []},
                "severityClassification": "Info",
                "exhaustiveSolutions": []
            }
        }
        print("===JSON_START===" + json.dumps(fallback) + "===JSON_END===", flush=True)

    except Exception as e:
        print(f"LOG:[!] Erreur critique: {e}", flush=True)
        sys.exit(1)


if __name__ == '__main__':
    main()
