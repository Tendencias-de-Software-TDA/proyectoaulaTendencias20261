import TagInput from "../common/TagInput";
import Spinner from "../common/Spinner";
import Alert from "../common/Alert";
import { PRIORITY_MAP, STATUS_COLS } from "../../constants/taskConstants";
import CommentsSection from "./CommentsSection";
import TaskHistory from "./TaskHistory";
import useEscKey from "../../hooks/useEscKey";

export default function TaskModal({
  taskModal,
  form,
  setForm,
  users,
  user,
  saving,
  formError,
  onClose,
  onSave,
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
  onAddComment,
  onUpdateComment,
  onDeleteComment,
}) {
  const isEditing = Boolean(taskModal.task);
  useEscKey(onClose);
  return (
    <div
      className="overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal">
        <h2 className="modal-title">
          {isEditing ? "Editar tarea" : "Nueva tarea"}
        </h2>

        {formError && <Alert type="error">{formError}</Alert>}

        <form onSubmit={onSave}>
          <div className="field">
            <label className="label">Título</label>
            <input
              className="input"
              value={form.title || ""}
              onChange={(e) =>
                setForm({ ...form, title: e.target.value })
              }
              autoFocus
            />
          </div>

          <div className="field">
            <label className="label">Descripción</label>
            <textarea
              className="textarea"
              value={form.description || ""}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
            }}
          >
            <div className="field">
              <label className="label">Prioridad</label>
              <select
                className="select"
                value={form.priority || "medium"}
                onChange={(e) =>
                  setForm({ ...form, priority: e.target.value })
                }
              >
                {Object.entries(PRIORITY_MAP).map(([value, { label }]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label className="label">Estado</label>
              <select
                className="select"
                value={form.status || "pending"}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value })
                }
              >
                {STATUS_COLS.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
            }}
          >
            <div className="field">
              <label className="label">Fecha límite</label>
              <input
                className="input"
                type="datetime-local"
                value={form.due_date || ""}
                onChange={(e) =>
                  setForm({ ...form, due_date: e.target.value })
                }
              />
            </div>

            <div className="field">
              <label className="label">Asignar a</label>
              <select
                className="select"
                value={form.assigned_to || ""}
                onChange={(e) =>
                  setForm({ ...form, assigned_to: e.target.value })
                }
              >
                <option value="">Sin asignar</option>

                {users.map((projectUser) => (
                  <option key={projectUser.id} value={projectUser.id}>
                    {projectUser.username}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="field">
            <label className="label">Etiquetas</label>
            <TagInput
              value={form.tags || []}
              onChange={(tags) => setForm({ ...form, tags })}
            />
          </div>

          {isEditing && (
            <CommentsSection
              comments={comments}
              commentsLoading={commentsLoading}
              user={user}
              newComment={newComment}
              setNewComment={setNewComment}
              commentSubmitting={commentSubmitting}
              editingCommentId={editingCommentId}
              setEditingCommentId={setEditingCommentId}
              editCommentContent={editCommentContent}
              setEditCommentContent={setEditCommentContent}
              commentError={commentError}
              onAddComment={onAddComment}
              onUpdateComment={onUpdateComment}
              onDeleteComment={onDeleteComment}
            />
          )}

          {isEditing && (
            <div
              className="field"
              style={{
                borderTop: "1px solid var(--border)",
                paddingTop: "12px",
                marginTop: "12px",
              }}
            >
              <label className="label">Historial de cambios</label>

              <TaskHistory taskId={taskModal.task.id} />
            </div>
          )}

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onClose}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? <Spinner /> : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}