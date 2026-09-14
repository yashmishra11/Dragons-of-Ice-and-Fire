export type UserRole = "admin" | "viewer";

export interface CitadelUser {
  id: string;
  actualName: string;
  username: string; // unique, case-insensitive (e.g. "Jonsnow")
  age: number;
  email: string; // unique, verified
  phone: string;
  role: UserRole;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
}

export type SafeUser = Omit<CitadelUser, "passwordHash">;

export interface SessionData {
  user: SafeUser;
  expiresAt: number;
}
