from typing import List, Dict, Any
from engine.modules.sqli_payloads import (
    get_sqli_manager, 
    SQLiPayload, 
    SQLiType
)
from engine.utils.http_client import HTTPClient


class Finding:
    """Vulnerability finding."""
    def __init__(self, title: str, description: str, severity: str, 
                 url: str, parameter: str, payload: str, evidence: str):
        self.title = title
        self.description = description
        self.severity = severity
        self.url = url
        self.parameter = parameter
        self.payload = payload
        self.evidence = evidence


class SQLiDetector:
    """
    Ghost's SQL Injection Detector.
    Uses payloads from SecureScan AI foundation.
    """
    
    def __init__(self, http_client: HTTPClient):
        self.http_client = http_client
        self.payload_manager = get_sqli_manager()
        self.findings: List[Finding] = []
    
    def detect(self, url: str, parameter: str, method: str = "GET") -> List[Finding]:
        """
        Test a parameter for SQL injection vulnerabilities.
        """
        self.findings = []
        
        # First, test elite payloads (highest confidence)
        elite_payloads = self.payload_manager.get_all()[:10]  # Elite are first
        
        for payload in elite_payloads:
            if self._test_payload(url, parameter, payload, method):
                self._add_finding(url, parameter, payload)
                # If we found a high-confidence vuln, we can stop
                if payload.confidence > 0.9:
                    break
        
        return self.findings
    
    def _test_payload(self, url: str, parameter: str, 
                     payload: SQLiPayload, method: str) -> bool:
        """Test a single payload."""
        try:
            # Build request with payload
            if method.upper() == "GET":
                params = {parameter: payload.payload}
                response = self.http_client.get(url, params=params)
            else:
                data = {parameter: payload.payload}
                response = self.http_client.post(url, data=data)
            
            # Analyze response for SQL errors
            return self._analyze_response(response.text, payload)
            
        except Exception:
            return False
    
    def _analyze_response(self, response: str, payload: SQLiPayload) -> bool:
        """Analyze response for SQL injection indicators."""
        sql_errors = [
            "SQL syntax",
            "mysql_fetch",
            "ORA-01756",
            "PostgreSQL",
            "SQLite3",
            "Microsoft SQL",
            "unclosed quotation",
            "You have an error in your SQL syntax",
            "Division by zero",
            "Warning: mysql",
            "valid MySQL result",
            "PostgreSQL query failed",
        ]
        
        response_lower = response.lower()
        for error in sql_errors:
            if error.lower() in response_lower:
                return True
        
        return False
    
    def _add_finding(self, url: str, parameter: str, payload: SQLiPayload):
        """Add a confirmed finding."""
        severity_map = {
            SQLiType.ERROR_BASED: "HIGH",
            SQLiType.UNION_BASED: "CRITICAL",
            SQLiType.BOOLEAN_BLIND: "MEDIUM",
            SQLiType.TIME_BLIND: "MEDIUM",
            SQLiType.STACKED: "CRITICAL",
        }
        
        finding = Finding(
            title=f"SQL Injection in {parameter}",
            description=payload.description,
            severity=severity_map.get(payload.sqli_type, "HIGH"),
            url=url,
            parameter=parameter,
            payload=payload.payload,
            evidence="SQL error detected in response"
        )
        self.findings.append(finding)

    def get_stats(self) -> Dict[str, Any]:
        """Get detector statistics."""
        return {
            "detector": "Ghost - SQLi",
            "payloads_available": self.payload_manager.total_count,
            "elite_payloads": self.payload_manager.elite_count,
            "findings_detected": len(self.findings),
        }