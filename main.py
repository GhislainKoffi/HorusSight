"""
HorusSight - Engine Entry Point
================================
Standalone execution entry for testing the security scanning engine.

This file is NOT the frontend.
It is used to manually trigger scans or test the engine independently.
"""

from engine.core.orchestrator import Orchestrator


def print_banner():
    print("\n" + "=" * 60)
    print("𓂀 HORUSSIGHT SECURITY ENGINE")
    print("=" * 60)
    print("Status: Initializing scan engine...\n")


def main():
    print_banner()

    # Initialize orchestrator (core engine controller)
    orchestrator = Orchestrator()

    try:
        # Input target (for CLI testing)
        target = input("Enter target URL to scan: ").strip()

        if not target:
            print("[!] No target provided. Exiting...")
            return

        print(f"\n[+] Starting scan on: {target}\n")

        # Run full scan through engine
        results = orchestrator.run(target)

        # Display results
        print("\n" + "=" * 60)
        print("SCAN RESULTS")
        print("=" * 60)

        if not results:
            print("[-] No vulnerabilities detected.")
        else:
            for i, result in enumerate(results, 1):
                print(f"\n[{i}] {result}")

        print("\n" + "=" * 60)
        print("Scan completed successfully.")
        print("=" * 60)

    except KeyboardInterrupt:
        print("\n[!] Scan interrupted by user.")

    except Exception as e:
        print(f"\n[!] Error during scan: {str(e)}")


if __name__ == "__main__":
    main()
