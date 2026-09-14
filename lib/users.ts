import fs from "fs";
import path from "path";
import crypto from "crypto";
import { CitadelUser, SafeUser } from "@/types/user";

const USERS_FILE_PATH = path.join(process.cwd(), "data", "users.json");

/**
 * Ensures data/users.json exists with initial structure.
 */
function ensureUsersFile(): void {
  const dir = path.dirname(USERS_FILE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(USERS_FILE_PATH)) {
    fs.writeFileSync(USERS_FILE_PATH, JSON.stringify([], null, 2), "utf-8");
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

export function getAllUsers(): CitadelUser[] {
  ensureUsersFile();
  try {
    const raw = fs.readFileSync(USERS_FILE_PATH, "utf-8");
    return JSON.parse(raw);
  } catch (error) {
    console.error("Error reading users.json:", error);
    return [];
  }
}

export function saveAllUsers(users: CitadelUser[]): void {
  ensureUsersFile();
  fs.writeFileSync(USERS_FILE_PATH, JSON.stringify(users, null, 2), "utf-8");
}

export function findUserByUsername(username: string): CitadelUser | undefined {
  const users = getAllUsers();
  const lower = username.trim().toLowerCase();
  return users.find((u) => u.username.toLowerCase() === lower);
}

export function findUserByEmail(email: string): CitadelUser | undefined {
  const users = getAllUsers();
  const lower = email.trim().toLowerCase();
  return users.find((u) => u.email.toLowerCase() === lower);
}

export function findUserById(id: string): CitadelUser | undefined {
  const users = getAllUsers();
  return users.find((u) => u.id === id);
}

export function toSafeUser(user: CitadelUser): SafeUser {
  const { passwordHash: _, ...safe } = user;
  return safe;
}

export function seedInitialUserIfMissing(): void {
  ensureUsersFile();
  const users = getAllUsers();

  const jonsnow = users.find(
    (u) =>
      u.username.toLowerCase() === "jonsnow" ||
      u.email.toLowerCase() === "mr.yashofficial1102@gmail.com"
  );

  if (!jonsnow) {
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
    users.push(newUser);
    saveAllUsers(users);
    console.log("Seeded default admin user: Jonsnow (Yash Mishra)");
  }
}
