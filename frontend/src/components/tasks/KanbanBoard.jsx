import { useState, useEffect } from "react";
import Spinner from "../common/Spinner";
import { STATUS_COLS } from "../../constants/taskConstants";

import KanbanColumn from "./KanbanColumn";
import TaskModal from "./TaskModal";
import DeleteTaskModal from "./DeleteTaskModal";
import MembersModal from "./MembersModal";
import ProjectMetrics from "../projects/ProjectMetrics";
import Toast from "../common/Toast";
import useToast from "../../hooks/useToast";
import useKanbanBoard from "../../hooks/useKanbanBoard";

export default function KanbanBoard({ project, user, onBack }) {
  const [metricsOpen, setMetricsOpen] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  const {
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
    handleAddComment,
    handleUpdateComment,
    handleDeleteComment,
  } = useKanbanBoard(project, user, showToast);

  useEffect(() => {
    if (error) showToast(error, "error");
  }, [error, showToast]);

  return (
    <div>
      <div className="topbar">
        <button type="button" className="back-btn" onClick={onBack}>
          ← Volver
        </button>

        <div className="breadcrumb">
          <span>Proyectos</span>
          <span className="sep">/</span>
          <span className="current">{project.name}</span>
        </div>
      </div>

      <div className="page-header">
        <h1 className="page-title">{project.name}</h1>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setMetricsOpen(true)}
          >
            Ver métricas
          </button>

          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setMembersOpen(true)}
          >
            Miembros
          </button>

          {user?.role !== "observer" && project.status !== "archived" && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => openTaskModal(null, "pending")}
            >
              + Nueva tarea
            </button>
          )}
        </div>
        {metricsOpen && (
          <ProjectMetrics
            projectId={project.id}
            onClose={() => setMetricsOpen(false)}
          />
        )}
      </div>

      <div className="page-body">
        {loading ? (
          <Spinner />
        ) : (
          <div className="kanban-board">
            {STATUS_COLS.map((column) => {
              const columnTasks = tasks.filter(
                (task) => task.status === column.value
              );

              return (
                <KanbanColumn
                  key={column.value}
                  column={column}
                  tasks={columnTasks}
                  user={user}
                  getUserName={getUserName}
                  onEditTask={openTaskModal}
                  onDeleteTask={setDeleteConfirm}
                  onMoveTask={moveTask}
                  onCreateTask={openTaskModal}
                />
              );
            })}
          </div>
        )}
      </div>

      {taskModal && (
        <TaskModal
          taskModal={taskModal}
          form={form}
          setForm={setForm}
          users={users}
          user={user}
          saving={saving}
          formError={formError}
          onClose={closeTaskModal}
          onSave={saveTask}
          comments={comments}
          commentsLoading={commentsLoading}
          newComment={newComment}
          setNewComment={setNewComment}
          commentSubmitting={commentSubmitting}
          editingCommentId={editingCommentId}
          setEditingCommentId={setEditingCommentId}
          editCommentContent={editCommentContent}
          setEditCommentContent={setEditCommentContent}
          commentError={commentError}
          onAddComment={handleAddComment}
          onUpdateComment={handleUpdateComment}
          onDeleteComment={handleDeleteComment}
        />
      )}

      {deleteConfirm && (
        <DeleteTaskModal
          task={deleteConfirm}
          onCancel={() => setDeleteConfirm(null)}
          onConfirm={() => deleteTask(deleteConfirm.id)}
        />
      )}

      {membersOpen && (
        <MembersModal
          users={users}
          onClose={() => setMembersOpen(false)}
        />
      )}

      <Toast message={toast.message} type={toast.type} onClose={hideToast} />
    </div>
  );
}