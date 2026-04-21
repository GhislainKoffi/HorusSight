import sqlite3
import json
import os
from datetime import datetime

class Database:
    def __init__(self, db_path="horussight.db"):
        self.db_path = db_path
        self._init_db()

    def _init_db(self):
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            # Table for scans - added user_id for multi-tenancy
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS scans (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    target TEXT NOT NULL,
                    status TEXT NOT NULL,
                    timestamp TEXT NOT NULL,
                    pages_scanned INTEGER DEFAULT 0
                )
            ''')
            # Table for findings
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS findings (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    scan_id TEXT NOT NULL,
                    vulnerability_type TEXT NOT NULL,
                    severity TEXT NOT NULL,
                    url TEXT NOT NULL,
                    payload TEXT,
                    evidence TEXT,
                    ai_analysis TEXT,
                    FOREIGN KEY (scan_id) REFERENCES scans (id)
                )
            ''')
            conn.commit()

    def save_scan(self, scan_data, user_id="system"):
        scan_id = scan_data.get("id", f"scan_{int(datetime.now().timestamp())}")
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO scans (id, user_id, target, status, timestamp, pages_scanned)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                scan_id,
                user_id,
                scan_data.get("target"),
                scan_data.get("status"),
                scan_data.get("timestamp", datetime.now().isoformat()),
                scan_data.get("pages_scanned", 0)
            ))
            
            for finding in scan_data.get("findings", []):
                cursor.execute('''
                    INSERT INTO findings (scan_id, vulnerability_type, severity, url, payload, evidence)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (
                    scan_id,
                    finding.get("type"),
                    finding.get("severity"),
                    finding.get("url"),
                    finding.get("payload"),
                    finding.get("evidence")
                ))
            conn.commit()
        return scan_id

    def get_scan(self, scan_id, user_id=None):
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            query = "SELECT * FROM scans WHERE id = ?"
            params = [scan_id]
            if user_id:
                query += " AND user_id = ?"
                params.append(user_id)
                
            cursor.execute(query, tuple(params))
            scan = cursor.fetchone()
            if not scan:
                return None
                
            cursor.execute("SELECT * FROM findings WHERE scan_id = ?", (scan_id,))
            findings = cursor.fetchall()
            
            return {
                "id": scan["id"],
                "user_id": scan["user_id"],
                "target": scan["target"],
                "status": scan["status"],
                "timestamp": scan["timestamp"],
                "pages_scanned": scan["pages_scanned"],
                "findings": [dict(f) for f in findings]
            }

    def get_all_scans(self, user_id=None):
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            query = "SELECT * FROM scans"
            params = []
            if user_id:
                query += " WHERE user_id = ?"
                params.append(user_id)
            
            query += " ORDER BY timestamp DESC"
            cursor.execute(query, tuple(params))
            
            scans = cursor.fetchall()
            return [dict(s) for s in scans]
