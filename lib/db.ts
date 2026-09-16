import { neon } from "@neondatabase/serverless";
import { CitadelUser } from "@/types/user";
import { DragonChangeSubmission } from "@/types/submission";

export function getDatabaseUrl(): string | null {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || null;
}

export function isDatabaseConfigured(): boolean {
  return Boolean(getDatabaseUrl());
}

let tablesInitialized = false;

/**
 * Ensures PostgreSQL tables exist on startup if running with a database.
 */
export async function initTablesIfNecessary(): Promise<void> {
  const url = getDatabaseUrl();
  if (!url || tablesInitialized) return;

  const sql = neon(url);
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS citadel_users (
        id TEXT PRIMARY KEY,
        actual_name TEXT NOT NULL,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS dragon_submissions (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        dragon_id TEXT NOT NULL,
        dragon_name TEXT NOT NULL,
        proposed_changes JSONB NOT NULL,
        reason TEXT NOT NULL,
        submitted_by JSONB NOT NULL,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL,
        reviewed_at TEXT,
        acknowledged_at TEXT,
        reviewer_notes TEXT
      );
    `;
    tablesInitialized = true;
  } catch (error) {
    console.error("Failed to initialize database tables:", error);
  }
}

function mapRowToUser(row: Record<string, unknown>): CitadelUser {
  return {
    id: String(row.id),
    actualName: String(row.actual_name),
    username: String(row.username),
    email: String(row.email),
    passwordHash: String(row.password_hash),
    role: row.role as CitadelUser["role"],
    createdAt: String(row.created_at),
  };
}

function mapRowToSubmission(row: Record<string, unknown>): DragonChangeSubmission {
  return {
    id: String(row.id),
    type: "edit-dragon",
    dragonId: String(row.dragon_id),
    dragonName: String(row.dragon_name),
    proposedChanges: (typeof row.proposed_changes === "string"
      ? JSON.parse(row.proposed_changes)
      : row.proposed_changes) as DragonChangeSubmission["proposedChanges"],
    reason: String(row.reason),
    submittedBy: (typeof row.submitted_by === "string"
      ? JSON.parse(row.submitted_by)
      : row.submitted_by) as DragonChangeSubmission["submittedBy"],
    status: row.status as DragonChangeSubmission["status"],
    createdAt: String(row.created_at),
    reviewedAt: row.reviewed_at ? String(row.reviewed_at) : undefined,
    acknowledgedAt: row.acknowledged_at ? String(row.acknowledged_at) : undefined,
    reviewerNotes: row.reviewer_notes ? String(row.reviewer_notes) : undefined,
  };
}

// -------------------------------------------------------------
// USER OPERATIONS
// -------------------------------------------------------------

export async function dbGetAllUsers(): Promise<CitadelUser[]> {
  const url = getDatabaseUrl();
  if (!url) return [];
  await initTablesIfNecessary();

  const sql = neon(url);
  const rows = await sql`
    SELECT id, actual_name, username, email, password_hash, role, created_at 
    FROM citadel_users 
    ORDER BY created_at ASC;
  `;
  return rows.map((r) => mapRowToUser(r as Record<string, unknown>));
}

export async function dbFindUserByUsername(username: string): Promise<CitadelUser | undefined> {
  const url = getDatabaseUrl();
  if (!url) return undefined;
  await initTablesIfNecessary();

  const sql = neon(url);
  const rows = await sql`
    SELECT id, actual_name, username, email, password_hash, role, created_at 
    FROM citadel_users 
    WHERE LOWER(username) = LOWER(${username.trim()}) 
    LIMIT 1;
  `;
  if (rows.length === 0) return undefined;
  return mapRowToUser(rows[0] as Record<string, unknown>);
}

export async function dbFindUserByEmail(email: string): Promise<CitadelUser | undefined> {
  const url = getDatabaseUrl();
  if (!url) return undefined;
  await initTablesIfNecessary();

  const sql = neon(url);
  const rows = await sql`
    SELECT id, actual_name, username, email, password_hash, role, created_at 
    FROM citadel_users 
    WHERE LOWER(email) = LOWER(${email.trim()}) 
    LIMIT 1;
  `;
  if (rows.length === 0) return undefined;
  return mapRowToUser(rows[0] as Record<string, unknown>);
}

export async function dbFindUserById(id: string): Promise<CitadelUser | undefined> {
  const url = getDatabaseUrl();
  if (!url) return undefined;
  await initTablesIfNecessary();

  const sql = neon(url);
  const rows = await sql`
    SELECT id, actual_name, username, email, password_hash, role, created_at 
    FROM citadel_users 
    WHERE id = ${id} 
    LIMIT 1;
  `;
  if (rows.length === 0) return undefined;
  return mapRowToUser(rows[0] as Record<string, unknown>);
}

export async function dbCreateUser(user: CitadelUser): Promise<void> {
  const url = getDatabaseUrl();
  if (!url) return;
  await initTablesIfNecessary();

  const sql = neon(url);
  await sql`
    INSERT INTO citadel_users (id, actual_name, username, email, password_hash, role, created_at)
    VALUES (${user.id}, ${user.actualName}, ${user.username}, ${user.email}, ${user.passwordHash}, ${user.role}, ${user.createdAt})
    ON CONFLICT (id) DO NOTHING;
  `;
}

export async function dbUpdateUser(
  id: string,
  updates: Partial<Pick<CitadelUser, "actualName" | "username" | "passwordHash" | "role">>
): Promise<void> {
  const url = getDatabaseUrl();
  if (!url) return;
  await initTablesIfNecessary();

  const sql = neon(url);
  if (updates.actualName) {
    await sql`UPDATE citadel_users SET actual_name = ${updates.actualName} WHERE id = ${id}`;
  }
  if (updates.username) {
    await sql`UPDATE citadel_users SET username = ${updates.username} WHERE id = ${id}`;
  }
  if (updates.passwordHash) {
    await sql`UPDATE citadel_users SET password_hash = ${updates.passwordHash} WHERE id = ${id}`;
  }
  if (updates.role) {
    await sql`UPDATE citadel_users SET role = ${updates.role} WHERE id = ${id}`;
  }
}

// -------------------------------------------------------------
// SUBMISSION OPERATIONS
// -------------------------------------------------------------

export async function dbGetAllSubmissions(): Promise<DragonChangeSubmission[]> {
  const url = getDatabaseUrl();
  if (!url) return [];
  await initTablesIfNecessary();

  const sql = neon(url);
  const rows = await sql`
    SELECT id, type, dragon_id, dragon_name, proposed_changes, reason, submitted_by, status, created_at, reviewed_at, acknowledged_at, reviewer_notes
    FROM dragon_submissions
    ORDER BY created_at DESC;
  `;
  return rows.map((r) => mapRowToSubmission(r as Record<string, unknown>));
}

export async function dbGetSubmissionById(id: string): Promise<DragonChangeSubmission | undefined> {
  const url = getDatabaseUrl();
  if (!url) return undefined;
  await initTablesIfNecessary();

  const sql = neon(url);
  const rows = await sql`
    SELECT id, type, dragon_id, dragon_name, proposed_changes, reason, submitted_by, status, created_at, reviewed_at, acknowledged_at, reviewer_notes
    FROM dragon_submissions
    WHERE id = ${id}
    LIMIT 1;
  `;
  if (rows.length === 0) return undefined;
  return mapRowToSubmission(rows[0] as Record<string, unknown>);
}

export async function dbCreateSubmission(sub: DragonChangeSubmission): Promise<void> {
  const url = getDatabaseUrl();
  if (!url) return;
  await initTablesIfNecessary();

  const sql = neon(url);
  await sql`
    INSERT INTO dragon_submissions (
      id, type, dragon_id, dragon_name, proposed_changes, reason, submitted_by, status, created_at
    ) VALUES (
      ${sub.id}, ${sub.type}, ${sub.dragonId}, ${sub.dragonName}, ${JSON.stringify(sub.proposedChanges)},
      ${sub.reason}, ${JSON.stringify(sub.submittedBy)}, ${sub.status}, ${sub.createdAt}
    );
  `;
}

export async function dbUpdateSubmissionStatus(
  id: string,
  status: DragonChangeSubmission["status"],
  metadata?: { reviewedAt?: string; acknowledgedAt?: string; reviewerNotes?: string }
): Promise<void> {
  const url = getDatabaseUrl();
  if (!url) return;
  await initTablesIfNecessary();

  const sql = neon(url);
  await sql`
    UPDATE dragon_submissions
    SET status = ${status},
        reviewed_at = COALESCE(${metadata?.reviewedAt ?? null}, reviewed_at),
        acknowledged_at = COALESCE(${metadata?.acknowledgedAt ?? null}, acknowledged_at),
        reviewer_notes = COALESCE(${metadata?.reviewerNotes ?? null}, reviewer_notes)
    WHERE id = ${id};
  `;
}

export async function dbDeleteSubmission(id: string): Promise<void> {
  const url = getDatabaseUrl();
  if (!url) return;
  await initTablesIfNecessary();

  const sql = neon(url);
  await sql`DELETE FROM dragon_submissions WHERE id = ${id};`;
}
