# HorusSight

### AI-Powered Web Vulnerability Intelligence Platform

HorusSight is a cybersecurity platform designed to detect, analyze, and prioritize web application vulnerabilities. It combines OWASP-based automated scanning with AI-driven risk analysis to transform technical findings into actionable security insights.


## Overview

Organizations today face thousands of web-based cyberattacks every week. Traditional security tools generate raw vulnerability data but fail to answer a critical question:

 **Which vulnerabilities actually matter for the business?**

HorusSight bridges this gap by combining detection with intelligent analysis.



##  System Architecture

HorusSight is built on three main technical layers:

**Frontend Layer** : User interface & visualization

**Backend Layer** : API, orchestration, AI risk engine

**Security Engine** : OWASP-based vulnerability detection



##  Features

###  Vulnerability Scanning

-SQL Injection
- Cross-Site Scripting (XSS)
- Server-Side Request Forgery (SSRF)
- Command Injection
- Path Traversal
- XML External Entity (XXE)



###  AI Risk Engine

- Severity classification (Critical → Low)
- Risk scoring (0–100)
- Business impact analysis
- Vulnerability prioritization



### Dashboard & Reports

- Interactive dashboard
- Risk visualization charts
- Human-readable reports
- Technical report export



##  How It Works

1. User submits a website URL
2. Backend sends request to the scanning engine
3. Vulnerabilities are detected and collected
4. AI engine analyzes and prioritizes risks
5. Results are displayed in the dashboard

##  Example Output

```json
{
  "vulnerability": "SQL Injection",
  "severity": "CRITICAL",
  "risk_score": 92,
  "business_impact": "Potential database compromise leading to financial data exposure",
  "recommendation": "Use parameterized queries"
}
```

---

##  Tech Stack

 **Frontend:** React, TailwindCSS
 
 **Backend:** FastAPI (Python)
 
 **Security Engine:** Python (OWASP-based scanners)
 
 **AI Layer:** Custom risk analysis engine
  
 **Infrastructure:** Docker, GitHub Actions



##  Vision

To make cybersecurity **clear, actionable, and business-focused**, helping organizations prevent financial losses before attacks occur.



