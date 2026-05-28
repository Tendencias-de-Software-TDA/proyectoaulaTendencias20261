import { useEffect, useState } from "react";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask as deleteTaskRequest,
  getMembers,
} from "../api/api";
import useTaskComments from "./useTaskComments";

export default function useKanbanBoard(project, user, showToast) {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [taskModal, setTaskModal] = useState(null);
  const [membersOpen, setMembersOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [form, setForm] = useState({});
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");

  const {
    comments,
    commentsLoading,
    newComment,
    setNewComment,
    commentSubmitting,
    editingCommentId,
    setEditingCommentId,
    editCommentContent,
    setEditCommentContent,
    commentError,
    resetCommentState,
    loadComments,
    handleAddComment,
    handleUpdateComment,
    handleDeleteComment,
  } = useTaskComments();

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      setError("");

      try {
        const [tasksResponse, membersResponse] = await Promise.allSettled([
          getTasks(project.id),
          getMembers(project.id),
        ]);

        if (cancelled) return;

        const loadedTasks =
          tasksResponse.status === "fulfilled"
            ? Array.isArray(tasksResponse.value)
              ? tasksResponse.value
              : tasksResponse.value?.results ?? []
            : [];

        // Membresías → [{ id, user (UUID), username, role, ... }]
        // Mapeamos a [{ id: UUID, username: string }] para el selector
        const rawMembers =
          membersResponse.status === "fulfilled"
            ? Array.isArray(membersResponse.value)
              ? membersResponse.value
              : membersResponse.value?.results ?? []
            : [];

        const loadedUsers = rawMembers.map((m) => ({
          id: m.user,
          username: m.username,
        }));

        setTasks(loadedTasks);
        setUsers(loadedUsers);
      } catch (e) {
        if (!cancelled) {
          setError(e?.data?.detail || "Error al cargar tareas");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, [project.id]);

  const buildForm = (task, defaultStatus) => {
    if (task) {
      return {
        title: task.title,
        description: task.description || "",
        priority: task.priority,
        status: task.status,
        due_date: task.due_date ? task.due_date.slice(0, 16) : "",
        assigned_to: task.assigned_to || "",
        tags: task.tags || [],
      };
    }
    return {
      title: "",
      description: "",
      priority: "medium",
      status: defaultStatus || "pending",
      due_date: "",
      assigned_to: "",
      tags: [],
    };
  };

  const openTaskModal = (task, defaultStatus) => {
    setForm(buildForm(task, defaultStatus));
    setFormError("");
    setTaskModal({ task, defaultStatus });
    resetCommentState();
    if (task) loadComments(task.id);
  };

  const closeTaskModal = () => {
    setTaskModal(null);
    setFormError("");
    resetCommentState();
  };

  const saveTask = async (e) => {
    e.preventDefault();

    if (!form.title?.trim()) {
      setFormError("El título es obligatorio.");
      return;
    }

    if (form.title.trim().length > 200) {
      setFormError("El título no puede superar los 200 caracteres.");
      return;
    }

    setSaving(true);
    setFormError("");

    const payload = {
      ...form,
      project: project.id,
      due_date: form.due_date || null,
      assigned_to: form.assigned_to || null,
      tags: (form.tags || []).map((tag) =>
        typeof tag === "string" ? tag : tag.name
      ),
    };

    try {
      if (taskModal.task) {
        const updatedTask = await updateTask(taskModal.task.id, payload);
        setTasks((currentTasks) =>
          currentTasks.map((task) =>
            task.id === updatedTask.id ? updatedTask : task
          )
        );
      } else {
        const createdTask = await createTask(payload);
        setTasks((currentTasks) => [...currentTasks, createdTask]);
      }

      closeTaskModal();
      showToast?.(
        taskModal.task ? "Tarea actualizada correctamente." : "Tarea creada correctamente.",
        "success"
      );
    } catch (e) {
      setFormError(
        e?.data?.detail ||
        e?.data?.title?.[0] ||
        e?.data?.status?.[0] ||
        "Error al guardar la tarea."
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteTask = async (id) => {
    try {
      await deleteTaskRequest(id);
      setTasks((currentTasks) => currentTasks.filter((task) => task.id !== id));
      setDeleteConfirm(null);
      showToast?.("Tarea eliminada.", "success");
    } catch (e) {
      setError(e?.data?.detail || "Error al eliminar la tarea");
      setDeleteConfirm(null);
    }
  };

  const moveTask = async (task, newStatus) => {
    try {
      await updateTask(task.id, { status: newStatus });
      setTasks((currentTasks) =>
        currentTasks.map((currentTask) =>
          currentTask.id === task.id
            ? { ...currentTask, status: newStatus }
            : currentTask
        )
      );
    } catch (e) {
      setError(e?.data?.detail || "Error al mover la tarea");
    }
  };

  const getUserName = (id) => {
    return users.find((u) => u.id === id)?.username || "";
  };

  const addCommentToCurrentTask = () => {
    handleAddComment(taskModal?.task?.id);
  };

  const refreshMembers = async () => {
    try {
      const mems = await getMembers(project.id);
      const raw = Array.isArray(mems) ? mems : mems?.results ?? [];
      setUsers(raw.map((m) => ({ id: m.user, username: m.username })));
    } catch {
      setError("No se pudo actualizar la lista de miembros. Recarga la página.");
    }
  };

  return {
    tasks,
    users,
    loading,
    saving,
    taskModal,
    membersOpen,
    deleteConfirm,
    form,
    error,
    formError,
    setForm,
    setMembersOpen,
    setDeleteConfirm,
    openTaskModal,
    closeTaskModal,
    saveTask,
    deleteTask,
    moveTask,
    getUserName,
    refreshMembers,
    comments,
    commentsLoading,
    newComment,
    setNewComment,
    commentSubmitting,
    editingCommentId,
    setEditingCommentId,
    editCommentContent,
    setEditCommentContent,
    commentError,
    handleAddComment: addCommentToCurrentTask,
    handleUpdateComment,
    handleDeleteComment,
  };
}