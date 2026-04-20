import axios from "axios";
import { clearTokens, getAccessToken, getRefreshToken, saveTokens } from "./tokenStorage";

const apiBaseUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: `${apiBaseUrl}/v1`,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let pendingRequests = [];

function resolvePendingRequests(error, token = null) {
  pendingRequests.forEach((promise) => {
    if (error) {
      promise.reject(error);
      return;
    }
    promise.resolve(token);
  });

  pendingRequests = [];
}

function normalizeError(error) {
  const status = error?.response?.status || 500;
  const data = error?.response?.data;

  const detail = data?.detail ?? data?.message;
  const message =
    typeof detail === "string"
      ? detail
      : Array.isArray(detail)
        ? detail.map((d) => (typeof d === "string" ? d : d?.string || "")).join(" ")
        : "Error de conexion con el servidor";

  return {
    status,
    message,
    errors: data?.errors || [],
    raw: data || null,
  };
}

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error?.response?.status;
    const refreshToken = getRefreshToken();

    if (
      status === 401 &&
      refreshToken &&
      !originalRequest?._retry &&
      !originalRequest?.url?.includes("/login/refresh/")
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingRequests.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(`${apiBaseUrl}/v1/login/refresh/`, {
          refresh: refreshToken,
        });

        saveTokens({ access: data.access, refresh: data.refresh || refreshToken });
        resolvePendingRequests(null, data.access);

        originalRequest.headers.Authorization = `Bearer ${data.access}`;
        return api(originalRequest);
      } catch (refreshError) {
        clearTokens();
        resolvePendingRequests(refreshError, null);
        return Promise.reject(normalizeError(refreshError));
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(normalizeError(error));
  },
);

export default api;
