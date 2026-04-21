#!/usr/bin/env python3
"""
HorusSight - Engine Verification Test
======================================
Simple test to verify the engine architecture is working.
No external dependencies required beyond what you already have.
"""

import sys
import os
from pathlib import Path

# Add project to path
sys.path.insert(0, str(Path(__file__).parent))

# ANSI colors for nice output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'
BOLD = '\033[1m'


def print_header(text):
    print(f"\n{BOLD}{BLUE}{'='*60}{RESET}")
    print(f"{BOLD}{BLUE}  𓂀 {text}{RESET}")
    print(f"{BOLD}{BLUE}{'='*60}{RESET}\n")


def print_pass(text):
    print(f"  {GREEN}✅ PASS{RESET} | {text}")


def print_fail(text):
    print(f"  {RED}❌ FAIL{RESET} | {text}")


def print_warn(text):
    print(f"  {YELLOW}⚠️  WARN{RESET} | {text}")


def print_info(text):
    print(f"  {BLUE}ℹ️  INFO{RESET} | {text}")


def test_imports():
    """Test that all required modules can be imported."""
    print_header("TEST 1: Module Imports")
    
    tests = []
    
    # Test 1.1: HTTP Client
    try:
        from engine.utils.http_client import HTTPClient
        client = HTTPClient()
        print_pass("HTTP Client imported")
        tests.append(True)
    except Exception as e:
        print_fail(f"HTTP Client import failed: {e}")
        tests.append(False)
    
    # Test 1.2: SQLi Payloads
    try:
        from engine.modules.sqli_payloads import (
            SQLiPayloadManager, SQLiType, DatabaseType, get_sqli_manager
        )
        print_pass("SQLi Payloads imported")
        tests.append(True)
    except Exception as e:
        print_fail(f"SQLi Payloads import failed: {e}")
        tests.append(False)
    
    # Test 1.3: XSS Payloads
    try:
        from engine.modules.xss_payloads import (
            XSSPayloadManager, XSSType, XSSContext, get_xss_manager
        )
        print_pass("XSS Payloads imported")
        tests.append(True)
    except Exception as e:
        print_fail(f"XSS Payloads import failed: {e}")
        tests.append(False)
    
    # Test 1.4: SQLi Detector
    try:
        from engine.modules.sqli import SQLiDetector
        print_pass("SQLi Detector imported")
        tests.append(True)
    except Exception as e:
        print_fail(f"SQLi Detector import failed: {e}")
        tests.append(False)
    
    return all(tests)


def test_sqli_payloads():
    """Test SQLi payload manager functionality."""
    print_header("TEST 2: SQLi Payload Manager")
    
    try:
        from engine.modules.sqli_payloads import get_sqli_manager, SQLiType
        
        manager = get_sqli_manager()
        
        # Test payload count
        total = manager.total_count
        if total > 0:
            print_pass(f"Loaded {total} SQLi payloads")
        else:
            print_fail("No payloads loaded")
            return False
        
        # Test elite payloads
        elite = manager.elite_count
        print_info(f"Elite payloads: {elite}")
        print_info(f"Inherited payloads: {total - elite}")
        
        # Test getting payloads
        all_payloads = manager.get_all()
        if len(all_payloads) == total:
            print_pass("get_all() returns correct count")
        else:
            print_fail("get_all() count mismatch")
            return False
        
        # Test getting strings
        strings = manager.get_strings()
        if len(strings) == total:
            print_pass("get_strings() returns correct count")
        else:
            print_fail("get_strings() count mismatch")
            return False
        
        # Test first payload structure
        first = all_payloads[0]
        if hasattr(first, 'payload') and hasattr(first, 'description'):
            print_pass(f"Payload structure OK (Example: {first.payload[:30]}...)")
        else:
            print_fail("Payload missing required attributes")
            return False
        
        # Test filtering by type
        error_based = manager.get_by_type(SQLiType.ERROR_BASED)
        print_info(f"Error-based payloads: {len(error_based)}")
        
        union_based = manager.get_by_type(SQLiType.UNION_BASED)
        print_info(f"Union-based payloads: {len(union_based)}")
        
        # Test WAF bypass
        waf = manager.get_waf_bypass()
        print_info(f"WAF bypass payloads: {len(waf)}")
        
        # Test auth bypass
        auth = manager.get_auth_bypass()
        print_info(f"Auth bypass payloads: {len(auth)}")
        
        # Test quick tests
        quick = manager.get_quick_tests()
        if len(quick) > 0 and len(quick) <= 15:
            print_pass(f"Quick tests: {len(quick)} payloads")
        else:
            print_warn(f"Quick tests count ({len(quick)}) may need adjustment")
        
        # Test stats
        stats = manager.get_stats()
        if 'total' in stats and 'elite' in stats:
            print_pass("get_stats() working")
        else:
            print_fail("get_stats() missing fields")
            return False
        
        return True
        
    except Exception as e:
        print_fail(f"SQLi payload test failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_xss_payloads():
    """Test XSS payload manager functionality."""
    print_header("TEST 3: XSS Payload Manager")
    
    try:
        from engine.modules.xss_payloads import get_xss_manager, XSSContext
        
        manager = get_xss_manager()
        
        # Test payload count
        total = manager.total_count
        if total > 0:
            print_pass(f"Loaded {total} XSS payloads")
        else:
            print_fail("No payloads loaded")
            return False
        
        # Test elite payloads
        elite = manager.elite_count
        print_info(f"Elite payloads: {elite}")
        print_info(f"Inherited payloads: {total - elite}")
        
        # Test getting payloads
        all_payloads = manager.get_all()
        if len(all_payloads) == total:
            print_pass("get_all() returns correct count")
        else:
            print_fail("get_all() count mismatch")
            return False
        
        # Test first payload structure
        first = all_payloads[0]
        if hasattr(first, 'payload') and hasattr(first, 'description'):
            print_pass(f"Payload structure OK (Example: {first.payload[:30]}...)")
        else:
            print_fail("Payload missing required attributes")
            return False
        
        # Test filtering by context
        html = manager.get_by_context(XSSContext.HTML_BODY)
        print_info(f"HTML context payloads: {len(html)}")
        
        js = manager.get_by_context(XSSContext.JAVASCRIPT)
        print_info(f"JavaScript context payloads: {len(js)}")
        
        universal = manager.get_by_context(XSSContext.UNIVERSAL)
        print_info(f"Universal payloads: {len(universal)}")
        
        # Test WAF bypass
        waf = manager.get_waf_bypass()
        print_info(f"WAF bypass payloads: {len(waf)}")
        
        # Test quick tests
        quick = manager.get_quick_tests()
        if len(quick) > 0:
            print_pass(f"Quick tests: {len(quick)} payloads")
        
        # Test stats
        stats = manager.get_stats()
        if 'total' in stats and 'elite' in stats:
            print_pass("get_stats() working")
        else:
            print_fail("get_stats() missing fields")
            return False
        
        return True
        
    except Exception as e:
        print_fail(f"XSS payload test failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_http_client():
    """Test HTTP client functionality."""
    print_header("TEST 4: HTTP Client")
    
    try:
        from engine.utils.http_client import HTTPClient
        
        # Test initialization
        client = HTTPClient(timeout=10)
        print_pass("HTTP Client initialized")
        
        # Test default values
        if client.timeout == 10:
            print_pass("Timeout set correctly")
        else:
            print_warn(f"Timeout is {client.timeout}, expected 10")
        
        if client.user_agent == "HorusSight/0.1":
            print_pass("User-Agent set correctly")
        else:
            print_warn(f"User-Agent is {client.user_agent}")
        
        # Test session creation
        session = client.session
        if session is not None:
            print_pass("Session created")
        else:
            print_fail("Session is None")
            return False
        
        # Test header building
        headers = client._build_headers()
        if 'User-Agent' in headers:
            print_pass("Headers built correctly")
        else:
            print_fail("Headers missing User-Agent")
            return False
        
        # Optional: Test actual HTTP request (may fail without internet)
        try:
            response = client.get("https://httpbin.org/get", timeout=5)
            if response.status_code == 200:
                print_pass("HTTP GET request successful")
            else:
                print_warn(f"HTTP GET returned {response.status_code}")
        except Exception as e:
            print_warn(f"HTTP test skipped (network issue): {str(e)[:50]}")
        
        # Test close
        client.close()
        print_pass("Session closed")
        
        return True
        
    except Exception as e:
        print_fail(f"HTTP client test failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_sqli_detector():
    """Test SQLi detector initialization."""
    print_header("TEST 5: SQLi Detector")
    
    try:
        from engine.modules.sqli import SQLiDetector, Finding
        from engine.utils.http_client import HTTPClient
        
        # Create client and detector
        client = HTTPClient()
        detector = SQLiDetector(client)
        print_pass("SQLi Detector initialized")
        
        # Test payload manager access
        if detector.payload_manager is not None:
            print_pass(f"Payload manager accessible ({detector.payload_manager.total_count} payloads)")
        else:
            print_fail("Payload manager is None")
            return False
        
        # Test findings list
        if detector.findings == []:
            print_pass("Findings list initialized empty")
        else:
            print_warn("Findings list not empty on init")
        
        # Test stats
        stats = detector.get_stats()
        if stats['detector'] == "Ghost - SQLi":
            print_pass("Detector stats correct")
        else:
            print_warn(f"Detector stats: {stats}")
        
        # Test response analysis (mock)
        sql_error = "You have an error in your SQL syntax"
        from engine.modules.sqli_payloads import SQLiPayload, SQLiType, DatabaseType
        
        payload = SQLiPayload(
            payload="'",
            description="Test",
            sqli_type=SQLiType.ERROR_BASED,
            database=DatabaseType.GENERIC
        )
        
        result = detector._analyze_response(sql_error, payload)
        if result is True:
            print_pass("SQL error detection working")
        else:
            print_warn("SQL error detection returned False")
        
        normal_response = "Welcome to our website"
        result = detector._analyze_response(normal_response, payload)
        if result is False:
            print_pass("Normal response correctly ignored")
        else:
            print_warn("Normal response incorrectly flagged")
        
        return True
        
    except Exception as e:
        print_fail(f"SQLi detector test failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_file_structure():
    """Test that all required files exist."""
    print_header("TEST 6: File Structure")
    
    required_files = [
        "engine/__init__.py",
        "engine/modules/__init__.py",
        "engine/modules/sqli.py",
        "engine/modules/sqli_payloads.py",
        "engine/modules/xss.py",
        "engine/modules/xss_payloads.py",
        "engine/core/__init__.py",
        "engine/core/orchestrator.py",
        "engine/core/crawler.py",
        "engine/utils/__init__.py",
        "engine/utils/http_client.py",
        "engine/utils/config.py",
        "engine/ai/__init__.py",
        "engine/payloads/__init__.py",
    ]
    
    root = Path(__file__).parent
    all_exist = True
    
    for file_path in required_files:
        full_path = root / file_path
        if full_path.exists():
            print_pass(f"Found: {file_path}")
        else:
            print_warn(f"Missing: {file_path} (will be needed later)")
            # Don't fail on missing optional files
    
    # Check essential files (must exist)
    essential = [
        "engine/modules/sqli_payloads.py",
        "engine/modules/xss_payloads.py",
        "engine/utils/http_client.py",
    ]
    
    for file_path in essential:
        full_path = root / file_path
        if not full_path.exists():
            print_fail(f"ESSENTIAL FILE MISSING: {file_path}")
            all_exist = False
    
    return all_exist


def main():
    """Run all tests."""
    print("\n")
    print(f"{BOLD}{BLUE}╔{'═'*58}╗{RESET}")
    print(f"{BOLD}{BLUE}║{RESET} {BOLD}HorusSight Engine - Architecture Verification{RESET}{' ' * 11}{BOLD}{BLUE}║{RESET}")
    print(f"{BOLD}{BLUE}║{RESET} Foundation: SecureScan AI v5.0 (MIT License){' ' * 13}{BOLD}{BLUE}║{RESET}")
    print(f"{BOLD}{BLUE}╚{'═'*58}╝{RESET}")
    
    results = {}
    
    # Run all tests
    results['imports'] = test_imports()
    results['sqli_payloads'] = test_sqli_payloads()
    results['xss_payloads'] = test_xss_payloads()
    results['http_client'] = test_http_client()
    results['sqli_detector'] = test_sqli_detector()
    results['file_structure'] = test_file_structure()
    
    # Summary
    print_header("TEST SUMMARY")
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    print(f"\n  Tests Passed: {GREEN}{passed}/{total}{RESET}")
    
    for name, result in results.items():
        if result:
            print(f"    {GREEN}✅{RESET} {name}")
        else:
            print(f"    {RED}❌{RESET} {name}")
    
    print()
    
    if passed == total:
        print(f"{GREEN}{BOLD}  ✅ ALL TESTS PASSED!{RESET}")
        print(f"\n  {BLUE}𓂀 HorusSight Engine is READY for the next phase.{RESET}")
        print(f"\n  Next steps for the team:")
        print(f"    1. Ghost: Complete XSS detector and add more vulnerability types")
        print(f"    2. EWABA: Build AI risk engine in engine/ai/")
        print(f"    3. Hackus_Man: Curate elite payloads for CMDi, Path Traversal, SSRF")
        print(f"    4. Chaminade: Start building the dashboard")
        print(f"\n  Run a real scan: python main.py --target http://testphp.vulnweb.com")
        return 0
    else:
        print(f"{RED}{BOLD}  ❌ SOME TESTS FAILED{RESET}")
        print(f"\n  Please fix the issues above before proceeding.")
        return 1


if __name__ == "__main__":
    sys.exit(main())