/** SQLite DDL executed on first connect to initialise all tables */
export const SCHEMA = `
  CREATE TABLE IF NOT EXISTS sessions (
    id           TEXT    PRIMARY KEY,
    city         TEXT    NOT NULL DEFAULT 'delhi',
    created_at   INTEGER NOT NULL,
    updated_at   INTEGER NOT NULL,
    answers      TEXT,
    shortlist    TEXT,
    chat_history TEXT    NOT NULL DEFAULT '[]'
  );

  CREATE TABLE IF NOT EXISTS saved_cars (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT    NOT NULL,
    car_id     TEXT    NOT NULL,
    variant    TEXT,
    saved_at   INTEGER NOT NULL,
    notes      TEXT,
    FOREIGN KEY (session_id) REFERENCES sessions(id)
  );

  CREATE TABLE IF NOT EXISTS comparisons (
    id          TEXT    PRIMARY KEY,
    session_id  TEXT,
    car_ids     TEXT    NOT NULL,
    city        TEXT,
    ai_verdict  TEXT    NOT NULL,
    created_at  INTEGER NOT NULL
  );
`;
