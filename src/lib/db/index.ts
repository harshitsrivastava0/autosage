/**
 * SQLite database layer using sql.js (pure WASM, no native compilation).
 *
 * Implements a lazy singleton with file persistence:
 *   - Dev:  ./autosage.db
 *   - Prod: /tmp/autosage.db
 *
 * If sql.js WASM fails to initialise, all operations silently fall through to
 * an in-memory Map<string, Session> fallback so the application stays up.
 * isDbDegraded() returns true in that case.
 */

import type { Database } from "sql.js";
import type { Session, ChatMessage, SavedCar, CityId, AdvisorAnswers, ShortlistItem } from "@/types";
import { SCHEMA } from "./schema";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

// ─── Paths ────────────────────────────────────────────────────────────────────

const DB_PATH =
  process.env.NODE_ENV === "production"
    ? "/tmp/autosage.db"
    : path.join(process.cwd(), "autosage.db");

// ─── Singleton state ──────────────────────────────────────────────────────────

let _db: Database | null = null;
let _degraded = false;
const _mem = new Map<string, Session>();

// ─── Init ─────────────────────────────────────────────────────────────────────

async function getDb(): Promise<Database | null> {
  if (_db) return _db;
  if (_degraded) return null;

  try {
    // Dynamic import avoids bundling sql.js into the client bundle
    const { default: initSqlJs } = await import("sql.js");

    const SQL = await initSqlJs({
      locateFile: (filename: string) =>
        path.resolve(process.cwd(), "node_modules/sql.js/dist", filename),
    });

    // Load existing data from disk if available
    let buffer: Buffer | undefined;
    if (fs.existsSync(DB_PATH)) {
      buffer = fs.readFileSync(DB_PATH);
    }

    _db = buffer ? new SQL.Database(buffer) : new SQL.Database();
    _db.run(SCHEMA);
    _flush();
    return _db;
  } catch (err) {
    console.error("[db] sql.js init failed — using in-memory fallback:", err);
    _degraded = true;
    return null;
  }
}

/** Write the current DB state back to the file on disk */
function _flush(): void {
  if (!_db) return;
  try {
    const data = _db.export();
    fs.writeFileSync(DB_PATH, Buffer.from(data));
  } catch {
    // Non-fatal — in-process state is still consistent
  }
}

// ─── Row ↔ Session marshalling ────────────────────────────────────────────────

function rowToSession(row: Record<string, unknown>): Session {
  return {
    id: row.id as string,
    city: (row.city as CityId) ?? "delhi",
    createdAt: row.created_at as number,
    updatedAt: row.updated_at as number,
    answers: row.answers ? (JSON.parse(row.answers as string) as AdvisorAnswers) : null,
    shortlist: row.shortlist ? (JSON.parse(row.shortlist as string) as ShortlistItem[]) : null,
    chatHistory: JSON.parse((row.chat_history as string) ?? "[]") as ChatMessage[],
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** Returns true when the SQLite WASM init failed and we are using in-memory storage */
export function isDbDegraded(): boolean {
  return _degraded;
}

/** Fetch a session by ID. Returns null if not found */
export async function getSession(id: string): Promise<Session | null> {
  const db = await getDb();

  if (!db) {
    return _mem.get(id) ?? null;
  }

  const stmt = db.prepare("SELECT * FROM sessions WHERE id = :id");
  stmt.bind({ ":id": id });
  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return rowToSession(row as Record<string, unknown>);
  }
  stmt.free();
  return null;
}

/**
 * Create or update a session.
 * On insert: sets created_at = updated_at = now.
 * On update: preserves created_at, bumps updated_at.
 */
export async function upsertSession(
  partial: Partial<Session> & { id: string }
): Promise<Session> {
  const now = Date.now();
  const db = await getDb();

  if (!db) {
    const existing = _mem.get(partial.id);
    const session: Session = {
      id: partial.id,
      city: partial.city ?? existing?.city ?? "delhi",
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      answers: partial.answers ?? existing?.answers ?? null,
      shortlist: partial.shortlist ?? existing?.shortlist ?? null,
      chatHistory: partial.chatHistory ?? existing?.chatHistory ?? [],
    };
    _mem.set(partial.id, session);
    return session;
  }

  const existing = await getSession(partial.id);

  if (existing) {
    db.run(
      `UPDATE sessions SET
         city = :city, updated_at = :ua,
         answers = :ans, shortlist = :sl
       WHERE id = :id`,
      {
        ":id": partial.id,
        ":city": partial.city ?? existing.city,
        ":ua": now,
        ":ans": partial.answers !== undefined
          ? JSON.stringify(partial.answers)
          : existing.answers ? JSON.stringify(existing.answers) : null,
        ":sl": partial.shortlist !== undefined
          ? JSON.stringify(partial.shortlist)
          : existing.shortlist ? JSON.stringify(existing.shortlist) : null,
      }
    );
  } else {
    db.run(
      `INSERT INTO sessions (id, city, created_at, updated_at, answers, shortlist, chat_history)
       VALUES (:id, :city, :ca, :ua, :ans, :sl, '[]')`,
      {
        ":id": partial.id,
        ":city": partial.city ?? "delhi",
        ":ca": now,
        ":ua": now,
        ":ans": partial.answers ? JSON.stringify(partial.answers) : null,
        ":sl": partial.shortlist ? JSON.stringify(partial.shortlist) : null,
      }
    );
  }

  _flush();
  return (await getSession(partial.id))!;
}

/** Append a single chat message to a session's chat_history array */
export async function appendChatMessage(
  sessionId: string,
  message: ChatMessage
): Promise<void> {
  const db = await getDb();

  if (!db) {
    const s = _mem.get(sessionId);
    if (s) s.chatHistory.push(message);
    return;
  }

  const stmt = db.prepare(
    "SELECT chat_history FROM sessions WHERE id = :id"
  );
  stmt.bind({ ":id": sessionId });
  if (!stmt.step()) {
    stmt.free();
    return;
  }
  const row = stmt.getAsObject();
  stmt.free();

  const history = JSON.parse((row.chat_history as string) ?? "[]") as ChatMessage[];
  history.push(message);

  db.run(
    "UPDATE sessions SET chat_history = :ch, updated_at = :ua WHERE id = :id",
    {
      ":id": sessionId,
      ":ch": JSON.stringify(history),
      ":ua": Date.now(),
    }
  );
  _flush();
}

/** Persist a comparison result */
export async function saveComparison(c: {
  id: string;
  sessionId?: string;
  carIds: string[];
  city?: string;
  aiVerdict: string;
}): Promise<void> {
  const db = await getDb();
  if (!db) return; // In-memory fallback does not persist comparisons

  db.run(
    `INSERT OR REPLACE INTO comparisons (id, session_id, car_ids, city, ai_verdict, created_at)
     VALUES (:id, :sid, :cids, :city, :verdict, :ca)`,
    {
      ":id": c.id,
      ":sid": c.sessionId ?? null,
      ":cids": JSON.stringify(c.carIds),
      ":city": c.city ?? "delhi",
      ":verdict": c.aiVerdict,
      ":ca": Date.now(),
    }
  );
  _flush();
}

/** Save a car to a session's saved list */
export async function saveCar(
  sessionId: string,
  carId: string,
  variant?: string
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  db.run(
    `INSERT INTO saved_cars (session_id, car_id, variant, saved_at)
     VALUES (:sid, :cid, :variant, :sa)`,
    {
      ":sid": sessionId,
      ":cid": carId,
      ":variant": variant ?? null,
      ":sa": Date.now(),
    }
  );
  _flush();
}

/** Return all saved cars for a session */
export async function getSavedCars(sessionId: string): Promise<SavedCar[]> {
  const db = await getDb();
  if (!db) return [];

  const results: SavedCar[] = [];
  const stmt = db.prepare(
    "SELECT * FROM saved_cars WHERE session_id = :sid ORDER BY saved_at DESC"
  );
  stmt.bind({ ":sid": sessionId });
  while (stmt.step()) {
    const row = stmt.getAsObject();
    results.push({
      id: row.id as number,
      sessionId: row.session_id as string,
      carId: row.car_id as string,
      variant: row.variant as string | undefined,
      savedAt: row.saved_at as number,
      notes: row.notes as string | undefined,
    });
  }
  stmt.free();
  return results;
}

/** Generate a new UUID — exported for convenience so callers don't need uuid directly */
export { uuidv4 as generateId };
