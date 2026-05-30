import useEscKey from "../../hooks/useEscKey";

export default function DeleteTaskModal({ task, onCancel, onConfirm }) {
  useEscKey(onCancel);

  return (
    <div
      className="overlay"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div className="modal" style={{ maxWidth: "400px" }}>
        <h2 className="modal-title">¿Eliminar tarea?</h2>

        <p
          style={{
            fontSize: "13px",
            color: "var(--muted)",
            marginBottom: "20px",
          }}
        >
          Esta acción no se puede deshacer.
          <br />
          Tarea:{" "}
          <strong style={{ color: "var(--text)" }}>{task.title}</strong>
        </p>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onCancel}
          >
            Cancelar
          </button>

          <button
            type="button"
            className="btn btn-danger"
            onClick={onConfirm}
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}