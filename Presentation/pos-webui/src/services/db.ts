import Database from "@tauri-apps/plugin-sql";
import { type CreateTransactionCommand } from "@/features/sale/types/transaction";

let dbInstance: Database | null = null;

export const getDb = async (): Promise<Database> => {
  if (dbInstance) return dbInstance;
  dbInstance = await Database.load("sqlite:bizflow.db");
  return dbInstance;
};

export const initTables = async (): Promise<void> => {
  const conn = await getDb();
  
  // Transaction Table
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS offline_transactions (
      id TEXT PRIMARY KEY,
      data_json TEXT NOT NULL, 
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT CHECK(status IN ('pending', 'synced', 'failed')) DEFAULT 'pending',
      synced_at DATETIME,
      last_error TEXT,
      retry_count INTEGER DEFAULT 0
    )
  `);

  // Auth Session Table for Rust access
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS auth_session (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      token TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
};

export const saveAuthToken = async (token: string): Promise<void> => {
  const conn = await getDb();
  await conn.execute(
    "INSERT OR REPLACE INTO auth_session (id, token, updated_at) VALUES (1, $1, CURRENT_TIMESTAMP)",
    [token]
  );
};

export const saveOfflineTransaction = async (command: CreateTransactionCommand): Promise<string> => {
  if (!command || !command.items || command.items.length === 0) {
    throw new Error("Cannot save an empty transaction.");
  }
  const conn = await getDb();
  const localId = crypto.randomUUID();
  try {
    const jsonString = JSON.stringify(command);
    await conn.execute(
      `INSERT INTO offline_transactions (id, data_json, status, created_at, retry_count) 
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP, 0)`,
      [localId, jsonString, 'pending']
    );
    return localId;
  } catch (err: unknown) {
    const error = err as Error;
    throw new Error(`Local Database Save Failed: ${error.message}`);
  }
};

export const getPendingTransactions = async () => {
  const conn = await getDb();
  return await conn.select<{ id: string; data_json: string }[]>(
    "SELECT id, data_json FROM offline_transactions WHERE status != 'synced' AND retry_count < 5"
  );
};

export const markAsSynced = async (id: string): Promise<void> => {
  const conn = await getDb();
  await conn.execute(
    "UPDATE offline_transactions SET status = 'synced', synced_at = CURRENT_TIMESTAMP, last_error = NULL WHERE id = $1",
    [id]
  );
};

export const markAsFailed = async (id: string, error: string): Promise<void> => {
  const conn = await getDb();
  await conn.execute(
    "UPDATE offline_transactions SET status = 'failed', last_error = $1, retry_count = retry_count + 1 WHERE id = $2",
    [error, id]
  );
};