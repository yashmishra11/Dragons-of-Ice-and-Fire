import fs from "fs";
import path from "path";
import crypto from "crypto";
import { CitadelUser, SafeUser } from "@/types/user";
import {
  isDatabaseConfigured,
  dbGetAllUsers,
  dbFindUserByUsername,
  dbFindUserByEmail,
  dbFindUserById,
  dbCreateUser,
  dbUpdateUser,
} from "@/lib/db";

const USERS_FILE_PATH = path.join(process.cwd(), "data", "users.json");

/**
 * Ensures data/users.json exists with initial structure for local disk fallback.
 */
function ensureUsersFile(): void {
  try {
    const dir = path.dirname(USERS_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(USERS_FILE_PATH)) {
      fs.writeFileSync(USERS_FILE_PATH, JSON.stringify([], null, 2), "utf-8");
    }
  } catch {
    // Non-fatal if filesystem is read-only (e.g. Vercel serverless)
  }
}

/**
 * Secure password hashing with salt using standard Node crypto.
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 10000, 64, "sha512")
    .toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash || !storedHash.includes(":")) return false;
  const [salt, originalHash] = storedHash.split(":");
  const computedHash = crypto
    .pbkdf2Sync(password, salt, 10000, 64, "sha512")
    .toString("hex");
  return computedHash === originalHash;
}

/**
 * Enforces rule: password cannot contain any word (length >= 2) from actual name (case-insensitive).
 */
export function doesPasswordContainActualName(
  password: string,
  actualName: string
): boolean {
  const cleanPass = password.toLowerCase();
  const nameParts = actualName
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter((part) => part.length >= 2);

  for (const part of nameParts) {
    if (cleanPass.includes(part)) {
      return true;
    }
  }
  return false;
}

/**
 * Enforces alphanumeric rule (must contain letters and numbers).
 */
export function isAlphanumeric(str: string): boolean {
  return /^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9]+$/.test(str);
}

function getLocalUsers(): CitadelUser[] {
  ensureUsersFile();
  try {
    const raw = fs.readFileSync(USERS_FILE_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveLocalUsers(users: CitadelUser[]): void {
  ensureUsersFile();
  try {
    fs.writeFileSync(USERS_FILE_PATH, JSON.stringify(users, null, 2), "utf-8");
  } catch {
    // Non-fatal in read-only environment
  }
}

export async function getAllUsers(): Promise<CitadelUser[]> {
  if (isDatabaseConfigured()) {
    try {
      const users = await dbGetAllUsers();
      if (users.length > 0) return users;
    } catch (error) {
      console.error("Database query failed in getAllUsers:", error);
    }
  }
  return getLocalUsers();
}

export async function saveAllUsers(users: CitadelUser[]): Promise<void> {
  saveLocalUsers(users);
}

export async function findUserByUsername(username: string): Promise<CitadelUser | undefined> {
  if (isDatabaseConfigured()) {
    try {
      const user = await dbFindUserByUsername(username);
      if (user) return user;
    } catch (error) {
      console.error("Database query failed in findUserByUsername:", error);
    }
  }
  const users = getLocalUsers();
  const lower = username.trim().toLowerCase();
  return users.find((u) => u.username.toLowerCase() === lower);
}

export async function findUserByEmail(email: string): Promise<CitadelUser | undefined> {
  if (isDatabaseConfigured()) {
    try {
      const user = await dbFindUserByEmail(email);
      if (user) return user;
    } catch (error) {
      console.error("Database query failed in findUserByEmail:", error);
    }
  }
  const users = getLocalUsers();
  const lower = email.trim().toLowerCase();
  return users.find((u) => u.email.toLowerCase() === lower);
}

export async function findUserById(id: string): Promise<CitadelUser | undefined> {
  if (isDatabaseConfigured()) {
    try {
      const user = await dbFindUserById(id);
      if (user) return user;
    } catch (error) {
      console.error("Database query failed in findUserById:", error);
    }
  }
  const users = getLocalUsers();
  return users.find((u) => u.id === id);
}

export async function createUser(user: CitadelUser): Promise<void> {
  if (isDatabaseConfigured()) {
    try {
      await dbCreateUser(user);
    } catch (error) {
      console.error("Database insert failed in createUser:", error);
    }
  }
  const users = getLocalUsers();
  users.push(user);
  saveLocalUsers(users);
}

export async function updateUser(
  id: string,
  updates: Partial<Pick<CitadelUser, "actualName" | "username" | "passwordHash" | "role">>
): Promise<CitadelUser | undefined> {
  if (isDatabaseConfigured()) {
    try {
      await dbUpdateUser(id, updates);
    } catch (error) {
      console.error("Database update failed in updateUser:", error);
    }
  }

  const users = getLocalUsers();
  const idx = users.findIndex((u) => u.id === id);
  if (idx !== -1) {
    users[idx] = { ...users[idx], ...updates, updatedAt: new Date().toISOString() };
    saveLocalUsers(users);
    return users[idx];
  }

  if (isDatabaseConfigured()) {
    return await dbFindUserById(id);
  }
  return undefined;
}

export function toSafeUser(user: CitadelUser): SafeUser {
  const safe = { ...user };
  delete (safe as Partial<CitadelUser>).passwordHash;
  return safe as SafeUser;
}

export async function seedInitialUserIfMissing(): Promise<void> {
  const existing =
    (await findUserByUsername("Jonsnow")) ||
    (await findUserByEmail("mr.yashofficial1102@gmail.com"));

  if (!existing) {
    const newUser: CitadelUser = {
      id: "usr_jonsnow_001",
      actualName: "Yash Mishra",
      username: "Jonsnow",
      age: 23,
      email: "mr.yashofficial1102@gmail.com",
      phone: "8827895934",
      role: "admin",
      passwordHash: hashPassword("fatherofDragons11"),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await createUser(newUser);
    console.log("Seeded default admin user: Jonsnow (Yash Mishra)");
  }
}
