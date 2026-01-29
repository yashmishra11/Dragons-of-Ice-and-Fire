export type Role = "viewer" | "admin";

export type User = {
  id: string;
  email: string;
  role: Role;
};
