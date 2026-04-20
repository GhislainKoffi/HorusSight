from engine.core.crawler import crawl
from engine.detectors import sqli, xss

def run_scan(target_url):
    endpoints = crawl(target_url)

    findings = []

    for endpoint in endpoints:
        findings.extend(sqli.scan(endpoint))
        findings.extend(xss.scan(endpoint))

    return {
        "target": target_url,
        "findings": findings
    }
