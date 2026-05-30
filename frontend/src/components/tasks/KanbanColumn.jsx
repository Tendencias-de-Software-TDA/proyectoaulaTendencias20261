import TaskCard from "./TaskCard";

export default function KanbanColumn({
  column,
  tasks,
  user,
  getUserName,
  onEditTask,
  onDeleteTask,
  onMoveTask,
}) {
  return (
    <div className="kanban-col">
      <div className="kanban-col-header">
        <div className="col-label">
          <span
            className="col-dot"
            style={{ background: column.color }}
          />
          <span>{column.label}</span>
        </div>

        <span className="col-count">{tasks.length}</span>
      </div>

      <div className="kanban-cards">
        {tasks.length === 0 ? (
          <div className="empty-state" style={{ padding: "24px 12px" }}>
            <p className="empty-text">Sin tareas</p>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              user={user}
              getUserName={getUserName}
              onEditTask={onEditTask}
              onDeleteTask={onDeleteTask}
              onMoveTask={onMoveTask}
            />
          ))
        )}
      </div>
    </div>
  );
}