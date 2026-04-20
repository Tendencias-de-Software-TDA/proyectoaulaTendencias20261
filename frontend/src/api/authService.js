import api from "./client";
import { clearTokens, getAccessToken, saveTokens } from "./tokenStorage";

export async function healthCheck() {
  const { data } = await api.get("/health/");
  return data;
}

export async function login(username, password) {
  const { data } = await api.post("/login/", { username, password });
  saveTokens({ access: data.access, refresh: data.refresh });
  return data;
}

export function logout() {
  clearTokens();
}

export function isLoggedIn() {
  return Boolean(getAccessToken());
}
