"""
HorusSight - Engine Entry Point
================================
Standalone execution entry for the security scanning engine.
"""

import sys
import json
import argparse
from engine.core.orchestrator import Orchestrator


def print_banner():
    print("\n" + "=" * 60)
    print("𓂀 HORUSSIGHT SECURITY ENGINE")
    print("=" * 60)
    print("Status: Initializing scan engine...\n")


def main():
    parser = argparse.ArgumentParser(description="HorusSight Security Engine")
    parser.add_argument("--url", help="Target URL to scan")
    parser.add_argument("--json", action="store_true", help="Output results in JSON format")
    parser.add_argument("--user-id", default="system", help="ID of the user initiating the scan")
    
    args = parser.parse_args()

    # Manual input if no URL provided
    if not args.url:
        if not args.json:
            print_banner()
            target = input("Enter target URL to scan: ").strip()
        else:
            # If JSON mode and no URL, we can't do much
            print(json.dumps({"error": "No target URL provided"}))
            return
    else:
        target = args.url

    if not target:
        if args.json:
            print(json.dumps({"error": "No target URL provided"}))
        else:
            print("[!] No target provided. Exiting...")
        return

    if not args.json:
        print_banner()
        print(f"\n[+] Starting scan on: {target}\n")

    # Initialize orchestrator
    orchestrator = Orchestrator()

    try:
        # Run full scan
        results = orchestrator.run(target)

        # Output results
        if args.json:
            print(json.dumps(results, indent=2))
        else:
            print("\n" + "=" * 60)
            print("SCAN RESULTS")
            print("=" * 60)
            
            findings = results.get("findings", [])
            if not findings:
                print("[-] No vulnerabilities detected.")
            else:
                for i, result in enumerate(findings, 1):
                    print(f"\n[{i}] {result['type']} at {result['url']}")
                    print(f"    Severity: {result['severity']}")
                    print(f"    Evidence: {result['evidence']}")

            print("\n" + "=" * 60)
            print(f"Scan completed. Pages scanned: {results.get('pages_scanned')}")
            print("=" * 60)

    except KeyboardInterrupt:
        if not args.json:
            print("\n[!] Scan interrupted by user.")
        else:
            print(json.dumps({"error": "Scan interrupted"}))

    except Exception as e:
        if not args.json:
            print(f"\n[!] Error during scan: {str(e)}")
        else:
            print(json.dumps({"error": str(e)}))


if __name__ == "__main__":
    main()
