import json
from datetime import datetime
from engine.core.crawler import Crawler
from engine.modules.sqli import SQLiDetector
from engine.modules.xss import XSSScanner
import concurrent.futures
from threading import Lock
from engine.ai.analyzer import EWABAAnalyzer
from engine.utils.http_client import HTTPClient
from engine.utils.database import Database


class Orchestrator:
    """
    Main controller for the HorusSight scanning engine.
    """
    def __init__(self, db_path="horussight.db"):
        self.http_client = HTTPClient()
        self.sqli_detector = SQLiDetector(self.http_client)
        self.xss_scanner = XSSScanner()
        self.ewaba = EWABAAnalyzer()
        self.db = Database(db_path)
        self.findings_lock = Lock()
        
    def _analyze_single_page(self, page):
        """Worker function for parallel analysis."""
        url = page["url"]
        local_findings = []
        print(f"LOG:Infiltration tactique sur {url}...")
        
        # 1. Test for XSS
        xss_results = self.xss_scanner.scan(url, limit=5)
        for res in xss_results:
            if res.vulnerable:
                local_findings.append({
                    "type": "XSS",
                    "severity": "HIGH",
                    "url": url,
                    "payload": res.payload,
                    "evidence": res.evidence
                })
        
        # 2. Test for SQLi on forms
        for form in page["forms"]:
            action = form["action"]
            for inp in form["inputs"]:
                param = inp["name"]
                if not param: continue
                
                print(f"LOG:Probe SQLi sur {param} ({url.split('/')[-1]})")
                sqli_findings = self.sqli_detector.detect(action, param, method=form["method"])
                for finding in sqli_findings:
                    local_findings.append({
                        "type": "SQL Injection",
                        "severity": finding.severity,
                        "url": action,
                        "parameter": param,
                        "payload": finding.payload,
                        "evidence": finding.evidence
                    })
        
        return local_findings

    def run(self, target_url, user_id="system"):
        print(f"LOG:Démarrage du protocole de scan sur {target_url}")
        print(f"LOG:Déploiement du Crawler...")
        
        # 1. Crawl the target
        crawler = Crawler(target_url)
        crawled_pages = crawler.crawl()
        print(f"LOG:{len(crawled_pages)} points d'entrée identifiés.")
        
        all_findings = []
        
        # 2. Run detectors in parallel (Full Power Mode)
        print(f"LOG:Activation du moteur multi-threadé (Full Power Mode)...")
        with concurrent.futures.ThreadPoolExecutor(max_workers=15) as executor:
            future_to_page = {executor.submit(self._analyze_single_page, page): page for page in crawled_pages}
            for future in concurrent.futures.as_completed(future_to_page):
                page_findings = future.result()
                with self.findings_lock:
                    all_findings.extend(page_findings)

        # 3. EWABA AI Analysis (Expert Security Insight)
        print(f"LOG:Scan technique terminé. Phase d'intelligence EWABA démarrée...")
        ai_analysis = self.ewaba.analyze_vulnerabilities(target_url, all_findings)
        print(f"LOG:Analyse d'expert générée avec succès.")

        result = {
            "id": f"scan_{int(datetime.now().timestamp())}",
            "user_id": user_id,
            "target": target_url,
            "status": "Completed",
            "timestamp": datetime.now().isoformat(),
            "pages_scanned": len(crawled_pages),
            "findings": all_findings,
            "ai_analysis": ai_analysis
        }
        
        # 4. Save to persistent storage
        self.db.save_scan(result, user_id=user_id)
        
        return result
