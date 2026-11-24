const { DatabaseSync } = require("node:sqlite");
const fs = require("node:fs"),
  path = require("node:path");
const filename = process.env.DATABASE_URL || "data/harfchi.sqlite";
if (filename !== ":memory:")
  fs.mkdirSync(path.dirname(path.resolve(filename)), { recursive: true });
const db = new DatabaseSync(filename);
db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;
CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY,telegram_id TEXT UNIQUE NOT NULL,username TEXT COLLATE NOCASE UNIQUE,display_name TEXT NOT NULL,avatar_url TEXT,region TEXT,daily_goal INTEGER DEFAULT 3,current_streak INTEGER DEFAULT 0,best_streak INTEGER DEFAULT 0,last_test_date TEXT,created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS test_results(id INTEGER PRIMARY KEY,user_id INTEGER NOT NULL REFERENCES users(id),client_id TEXT NOT NULL,mode TEXT NOT NULL,mode_value TEXT NOT NULL,language TEXT NOT NULL,wpm INTEGER,raw_wpm INTEGER,accuracy INTEGER,consistency INTEGER,correct_chars INTEGER,incorrect_chars INTEGER,extra_chars INTEGER,missed_chars INTEGER,duration_sec REAL,weak_keys_json TEXT,created_at TEXT NOT NULL,day TEXT NOT NULL,ranked INTEGER NOT NULL,UNIQUE(user_id,client_id));
CREATE INDEX IF NOT EXISTS results_user_day ON test_results(user_id,day);
CREATE INDEX IF NOT EXISTS board ON test_results(mode,mode_value,language,ranked,day,wpm);
CREATE TABLE IF NOT EXISTS personal_bests(user_id INTEGER REFERENCES users(id),mode_key TEXT,language TEXT,best_wpm INTEGER,best_accuracy INTEGER,result_id INTEGER REFERENCES test_results(id),updated_at TEXT,PRIMARY KEY(user_id,mode_key,language));
CREATE TABLE IF NOT EXISTS auth_receipts(hash TEXT PRIMARY KEY,expires INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS challenges(id TEXT PRIMARY KEY,user_id INTEGER REFERENCES users(id),value INTEGER,language TEXT,target TEXT,issued INTEGER);`);
module.exports = db;
