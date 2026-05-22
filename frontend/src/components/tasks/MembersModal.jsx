export default function MembersModal({ users, onClose }) {
  return (
    <div
      className="overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal" style={{ maxWidth: "400px" }}>
        <h2 className="modal-title">Miembros del proyecto</h2>

        {users.length === 0 ? (
          <p style={{ fontSize: "13px", color: "var(--muted)" }}>
            No hay miembros registrados.
          </p>
        ) : (
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            {users.map((projectUser) => (
              <li
                key={projectUser.id}
                className="member-row"
              >
                <div className="avatar">
                  {projectUser.username?.[0]?.toUpperCase() || "?"}
                </div>

                <div className="member-info">
                  <div className="member-name">
                    {projectUser.username}
                  </div>

                  <div className="member-email">
                    {projectUser.role || projectUser.email || ""}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}