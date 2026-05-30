import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const refreshToken = localStorage.getItem("refresh_token");

    if (
      status === 401 &&
      !originalRequest._retry &&
      refreshToken &&
      !originalRequest.url.includes("/token/") &&
      !originalRequest.url.includes("/users/logout/") &&
      !originalRequest.url.includes("/users/login/")
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api"}/token/refresh/`,
          { refresh: refreshToken }
        );
        const newAccessToken = response.data.access;

        localStorage.setItem("access_token", newAccessToken);
        api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error.response || error);
  }
);

export const getUserProfile = () => api.get("/users/profile/");
export const getUsers = () => api.get("/users/");
export const getUserMetrics = (userId) => api.get(`/users/${userId}/metrics/`);
export const logoutUser = (refresh) => api.post("/users/logout/", { refresh });

// Proyectos
export const getProjects = () => api.get("/projects/");
export const createProject = (data) => api.post("/projects/", data);
export const updateProject = (projectId, data) => api.patch(`/projects/${projectId}/`, data);
export const deleteProject = (projectId) => api.delete(`/projects/${projectId}/`);
export const getProjectMetrics = (projectId) => api.get(`/projects/${projectId}/metrics/`);

// Tareas
export const getTasks = (projectId) => api.get(`/tasks/?project=${projectId}`);
export const createTask = (data) => api.post("/tasks/", data);
export const updateTask = (taskId, data) => api.patch(`/tasks/${taskId}/`, data);
export const deleteTask = (taskId) => api.delete(`/tasks/${taskId}/`);

// Comentarios
export const getComments = (taskId) => api.get(`/comments/?task=${taskId}`);
export const createComment = (taskId, content) => api.post("/comments/", { task: taskId, content });
export const updateComment = (commentId, content) => api.patch(`/comments/${commentId}/`, { content });
export const deleteComment = (commentId) => api.delete(`/comments/${commentId}/`);

// Historial
export const getTaskHistory = (taskId) => api.get(`/history/?task=${taskId}`);

// Etiquetas
export const getTags = () => api.get("/tags/");
export const createTag = (data) => api.post("/tags/", data);

// Membresías
export const getMembers = (projectId) => api.get(`/memberships/?project=${projectId}`);
export const addMember = (data) => api.post("/memberships/", data);
export const updateMember = (membershipId, data) => api.patch(`/memberships/${membershipId}/`, data);
export const removeMember = (membershipId) => api.delete(`/memberships/${membershipId}/`);

// Admin
export const createUser = (data) => api.post("/users/", data);
export const toggleUserActive = (userId) => api.post(`/users/${userId}/toggle-active/`);

export default api;