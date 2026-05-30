import { useState } from "react";
import {
  getComments,
  createComment,
  updateComment,
  deleteComment,
} from "../api/api";

export default function useTaskComments() {
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentContent, setEditCommentContent] = useState("");
  const [commentError, setCommentError] = useState("");

  const resetCommentState = () => {
    setComments([]);
    setNewComment("");
    setEditingCommentId(null);
    setEditCommentContent("");
    setCommentError("");
  };

  const loadComments = async (taskId) => {
    setCommentsLoading(true);
    setCommentError("");

    try {
      const data = await getComments(taskId);
      setComments(Array.isArray(data) ? data : data?.results ?? []);
    } catch {
      setCommentError("No se pudieron cargar los comentarios.");
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleAddComment = async (taskId) => {
    const trimmedComment = newComment.trim();

    if (!trimmedComment || !taskId) return;

    setCommentSubmitting(true);
    setCommentError("");

    try {
      const createdComment = await createComment(taskId, trimmedComment);

      setComments((currentComments) => [
        ...currentComments,
        createdComment,
      ]);

      setNewComment("");
    } catch {
      setCommentError("No se pudo agregar el comentario.");
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleUpdateComment = async (commentId) => {
    const trimmedComment = editCommentContent.trim();

    if (!trimmedComment) return;

    setCommentError("");

    try {
      const updatedComment = await updateComment(commentId, trimmedComment);

      setComments((currentComments) =>
        currentComments.map((comment) =>
          comment.id === commentId ? updatedComment : comment
        )
      );

      setEditingCommentId(null);
      setEditCommentContent("");
    } catch {
      setCommentError("No se pudo editar el comentario.");
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("¿Eliminar este comentario?")) return;

    setCommentError("");

    try {
      await deleteComment(commentId);

      setComments((currentComments) =>
        currentComments.filter((comment) => comment.id !== commentId)
      );
    } catch {
      setCommentError("No se pudo eliminar el comentario.");
    }
  };

  return {
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
  };
}