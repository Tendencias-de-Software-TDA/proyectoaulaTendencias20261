const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const ROL_KEY = "user_rol";
const USERNAME_KEY = "user_username";

export function getStoredRole() {
  return localStorage.getItem(ROL_KEY);
}

export function getStoredUsername() {
  return localStorage.getItem(USERNAME_KEY);
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function saveTokens({ access, refresh, rol, username }) {
  if (access) {
    localStorage.setItem(ACCESS_TOKEN_KEY, access);
  }

  if (refresh) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
  }

  if (rol !== undefined && rol !== null) {
    localStorage.setItem(ROL_KEY, String(rol));
  }

  if (username !== undefined && username !== null) {
    localStorage.setItem(USERNAME_KEY, String(username));
  }
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(ROL_KEY);
  localStorage.removeItem(USERNAME_KEY);
}
