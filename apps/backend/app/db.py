import sqlite3
import os
from datetime import datetime
from pathlib import Path

# Ensure the data directory exists
DB_DIR = Path("/app/data")
DB_PATH = DB_DIR / "stats.db"

def init_db():
    """Initialize the SQLite database and create tables if they don't exist."""
    try:
        # Create directory if it doesn't exist (in case volume mapping fails or local run)
        if not DB_DIR.exists():
            # Fallback for local development if /app/data is not writable/mapped
            local_db_dir = Path("data")
            local_db_dir.mkdir(parents=True, exist_ok=True)
            global DB_PATH
            DB_PATH = local_db_dir / "stats.db"

        conn = sqlite3.connect(str(DB_PATH))
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS conversion_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                filename TEXT NOT NULL,
                file_extension TEXT,
                file_size_bytes INTEGER,
                client_ip TEXT,
                user_agent TEXT,
                accept_language TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Check and migrate columns
        cursor.execute("PRAGMA table_info(conversion_logs)")
        columns = [info[1] for info in cursor.fetchall()]
        
        if "client_ip" not in columns:
            print("Migrating: adding client_ip column...")
            cursor.execute("ALTER TABLE conversion_logs ADD COLUMN client_ip TEXT")
            
        if "user_agent" not in columns:
            print("Migrating: adding user_agent column...")
            cursor.execute("ALTER TABLE conversion_logs ADD COLUMN user_agent TEXT")
            
        if "accept_language" not in columns:
            print("Migrating: adding accept_language column...")
            cursor.execute("ALTER TABLE conversion_logs ADD COLUMN accept_language TEXT")

        conn.commit()
        conn.close()
        print(f"Database initialized at {DB_PATH}")
    except Exception as e:
        print(f"Failed to initialize database: {e}")

def log_conversion(filename: str, file_size_bytes: int, client_ip: str = None, user_agent: str = None, accept_language: str = None):
    """Log a conversion event to the database."""
    try:
        file_ext = filename.split(".")[-1].lower() if "." in filename else ""
        
        conn = sqlite3.connect(str(DB_PATH))
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO conversion_logs (filename, file_extension, file_size_bytes, client_ip, user_agent, accept_language, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (filename, file_ext, file_size_bytes, client_ip, user_agent, accept_language, datetime.now()))
        
        conn.commit()
        conn.close()
        print(f"Logged conversion: {filename} ({file_size_bytes} bytes) from {client_ip}")
    except Exception as e:
        print(f"Failed to log conversion: {e}")

def get_stats():
    """Get aggregated stats."""
    try:
        conn = sqlite3.connect(str(DB_PATH))
        cursor = conn.cursor()
        
        cursor.execute('SELECT COUNT(*), SUM(file_size_bytes) FROM conversion_logs')
        count, total_size = cursor.fetchone()
        
        conn.close()
        return {
            "total_conversions": count or 0,
            "total_size_bytes": total_size or 0,
            "total_size_mb": round((total_size or 0) / (1024 * 1024), 2)
        }
    except Exception as e:
        return {"error": str(e)}
