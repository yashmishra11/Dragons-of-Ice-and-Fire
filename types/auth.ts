import { SafeUser, UserRole } from "./user";

export type Role = UserRole;
export type ClientRole = "visitor" | "viewer" | "admin";
export type User = SafeUser;
