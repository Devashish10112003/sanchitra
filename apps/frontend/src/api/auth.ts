import { apiFetch } from "./client";

export type AuthUser = {
  id: string;
  username: string;
  email: string;
};

export function login(email: string, password: string) {
  return apiFetch<{ success: boolean; message: string }>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function signup(email: string, username: string, password: string) {
  return apiFetch<{ success: boolean; message: string }>("/api/v1/auth/signup", {
    method: "POST",
    body: JSON.stringify({ email, username, password }),
  });
}

export function logout() {
  return apiFetch<{ success: boolean }>("/api/v1/auth/logout", { method: "POST" });
}

export function getMe() {
  return apiFetch<{ success: boolean; user: AuthUser }>("/api/v1/auth/me");
}
