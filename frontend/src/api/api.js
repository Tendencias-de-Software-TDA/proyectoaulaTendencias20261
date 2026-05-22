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

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      window.location.reload();
    }

    return Promise.reject(error.response || error);
  }
);

export const getUserProfile = () =>
  api.get("/users/profile/");

export const getUsers = () =>
  api.get("/users/");

export const getUserMetrics = (userId) =>
  api.get(`/users/${userId}/metrics/`);

export const logoutUser = (refresh) =>
  api.post("/users/logout/", { refresh });

// Proyectos
export const getProjects = () =>
  api.get("/projects/");

export const createProject = (data) =>
  api.post("/projects/", data);

export const updateProject = (projectId, data) =>
  api.patch(`/projects/${projectId}/`, data);

export const deleteProject = (projectId) =>
  api.delete(`/projects/${projectId}/`);

export const getProjectMetrics = (projectId) =>
  api.get(`/projects/${projectId}/metrics/`);

// Tareas
export const getTasks = (projectId) =>
  api.get(`/tasks/?project=${projectId}`);

export const createTask = (data) =>
  api.post("/tasks/", data);

export const updateTask = (taskId, data) =>
  api.patch(`/tasks/${taskId}/`, data);

export const deleteTask = (taskId) =>
  api.delete(`/tasks/${taskId}/`);

// Comentarios
export const getComments = (taskId) =>
  api.get(`/comments/?task=${taskId}`);

export const createComment = (taskId, content) =>
  api.post("/comments/", { task: taskId, content });

export const updateComment = (commentId, content) =>
  api.patch(`/comments/${commentId}/`, { content });

export const deleteComment = (commentId) =>
  api.delete(`/comments/${commentId}/`);

// Historial
export const getTaskHistory = (taskId) =>
  api.get(`/history/?task=${taskId}`);
// Admin - usuarios
export const createUser = (data) =>
  api.post("/users/", data);

export const toggleUserActive = (userId) =>
  api.post(`/users/${userId}/toggle-active/`);

export default api;