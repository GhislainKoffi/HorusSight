import requests
from dataclasses import dataclass
from typing import List, Dict
from urllib.parse import urlparse, urlencode, urlunparse, parse_qs

from engine.modules.xss_payloads import get_xss_manager


# =========================
# RESULT MODEL
# =========================

@dataclass
class XSSResult:
    payload: str
    vulnerable: bool
    confidence: str
    evidence: str
    url_tested: str


# =========================
# CORE ENGINE
# =========================

class XSSScanner:
    def __init__(self, timeout: int = 10):
        self.timeout = timeout
        self.session = requests.Session()
        self.payload_manager = get_xss_manager()

    # -------------------------
    # URL INJECTION
    # -------------------------
    def inject_into_url(self, url: str, payload: str) -> str:
        """
        Inject payload into query parameters safely.
        """
        parsed = urlparse(url)
        query = parse_qs(parsed.query)

        # inject into all params (simple demo approach)
        for k in query:
            query[k] = payload

        new_query = urlencode(query, doseq=True)

        return urlunparse((
            parsed.scheme,
            parsed.netloc,
            parsed.path,
            parsed.params,
            new_query,
            parsed.fragment
        ))

    # -------------------------
    # RESPONSE ANALYSIS
    # -------------------------
    def analyze(self, response_text: str, payload: str) -> Dict:
        """
        Basic XSS detection heuristics.
        """

        evidence = []

        # 1. Reflection check
        if payload in response_text:
            evidence.append("Payload reflected in response")

        # 2. Script tag detection
        if "<script" in response_text.lower():
            evidence.append("Script tag detected in response")

        # 3. Event handler detection
        if "onerror=" in response_text.lower() or "onload=" in response_text.lower():
            evidence.append("Event handler detected")

        vulnerable = len(evidence) > 0

        return {
            "vulnerable": vulnerable,
            "confidence": "HIGH" if len(evidence) >= 2 else "MEDIUM" if vulnerable else "LOW",
            "evidence": "; ".join(evidence) if evidence else "No indicators"
        }

    # -------------------------
    # SINGLE TEST
    # -------------------------
    def test_payload(self, url: str, payload: str) -> XSSResult:
        try:
            test_url = self.inject_into_url(url, payload)

            response = self.session.get(test_url, timeout=self.timeout)

            analysis = self.analyze(response.text, payload)

            return XSSResult(
                payload=payload,
                vulnerable=analysis["vulnerable"],
                confidence=analysis["confidence"],
                evidence=analysis["evidence"],
                url_tested=test_url
            )

        except Exception as e:
            return XSSResult(
                payload=payload,
                vulnerable=False,
                confidence="ERROR",
                evidence=str(e),
                url_tested=url
            )

    # -------------------------
    # FULL SCAN
    # -------------------------
    def scan(self, url: str, limit: int = None) -> List[XSSResult]:
        results = []

        all_payloads = self.payload_manager.get_all()
        payloads = all_payloads[:limit] if limit else all_payloads

        print(f"LOG:[+] Starting XSS scan on: {url}")
        print(f"LOG:[+] Payloads loaded: {len(payloads)}")

        for p in payloads:
            # p is an XSSPayload object
            payload_str = p.payload

            result = self.test_payload(url, payload_str)
            results.append(result)

            if result.vulnerable:
                print(f"LOG:[!] VULNERABLE: {payload_str}")

        return results


# =========================
# CLI DEMO
# =========================

if __name__ == "__main__":
    target = input("Enter target URL (with params): ")

    scanner = XSSScanner()

    results = scanner.scan(target, limit=20)

    print("\n=== SCAN SUMMARY ===")
    for r in results:
        print(f"\nPayload: {r.payload}")
        print(f"Vulnerable: {r.vulnerable}")
        print(f"Confidence: {r.confidence}")
        print(f"Evidence: {r.evidence}")
