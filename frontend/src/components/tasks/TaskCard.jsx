import { PRIORITY_MAP, STATUS_COLS } from "../../constants/taskConstants";

export default function TaskCard({
  task,
  user,
  getUserName,
  onEditTask,
  onDeleteTask,
  onMoveTask,
}) {
  const priority = PRIORITY_MAP[task.priority];

  return (
    <article className="task-card">
      <h3 className="task-title">{task.title}</h3>

      {task.description && (
        <p
          style={{
            fontSize: "12px",
            color: "var(--muted)",
            lineHeight: 1.5,
            marginBottom: "10px",
          }}
        >
          {task.description}
        </p>
      )}

      <div className="task-footer">
        <span className="priority-label">
          <span
            className="priority-dot"
            style={{ background: priority?.color }}
          />
          {priority?.label || task.priority}
        </span>

        {task.assigned_to && (
          <span className="assignee-chip">
            {getUserName(task.assigned_to)}
          </span>
        )}
      </div>

      {task.tags?.length > 0 && (
        <div className="tags-row">
          {task.tags.map((tag, index) => {
            const label = typeof tag === "string" ? tag : tag.name;
            const key = typeof tag === "string" ? tag : tag.id ?? index;

            return (
              <span key={key} className="tag">
                {label}
              </span>
            );
          })}
        </div>
      )}

      <div
        style={{
          display: "flex",
          gap: "6px",
          flexWrap: "wrap",
          marginTop: "12px",
        }}
      >
        {user?.role !== "observer" && (
          <>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => onEditTask(task, task.status)}
            >
              Editar
            </button>

            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={() => onDeleteTask(task)}
            >
              Eliminar
            </button>
          </>
        )}

        {STATUS_COLS.filter((status) => status.value !== task.status).map(
          (status) => (
            <button
              key={status.value}
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => onMoveTask(task, status.value)}
            >
              → {status.label}
            </button>
          )
        )}
      </div>
    </article>
  );
}