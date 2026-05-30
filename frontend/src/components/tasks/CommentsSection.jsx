import Spinner from "../common/Spinner";

export default function CommentsSection({
  comments,
  commentsLoading,
  user,
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
  return (
    <div
      className="field"
      style={{
        borderTop: "1px solid var(--border)",
        paddingTop: "12px",
        marginTop: "4px",
      }}
    >
      <label className="label">Comentarios ({comments.length})</label>

      {commentError && (
        <p
          style={{
            color: "var(--danger)",
            fontSize: "12px",
            marginBottom: "6px",
          }}
        >
          {commentError}
        </p>
      )}

      {commentsLoading ? (
        <Spinner />
      ) : comments.length === 0 ? (
        <p
          style={{
            fontSize: "12px",
            color: "var(--muted)",
            marginBottom: "8px",
          }}
        >
          No hay comentarios aún.
        </p>
      ) : (
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: "0 0 12px 0",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          {comments.map((comment) => {
            const isOwner = comment.author === user?.id;

            return (
              <li
                key={comment.id}
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "6px",
                  padding: "8px 10px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "10px",
                    marginBottom: "4px",
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: "12px" }}>
                    {comment.author_username}
                  </span>

                  <span
                    style={{
                      fontSize: "11px",
                      color: "var(--muted)",
                    }}
                  >
                    {new Date(comment.created_at).toLocaleString("es-CO")}
                    {comment.updated_at !== comment.created_at && (
                      <em> · editado</em>
                    )}
                  </span>
                </div>

                {editingCommentId === comment.id ? (
                  <div>
                    <textarea
                      className="textarea"
                      rows={2}
                      value={editCommentContent}
                      onChange={(e) =>
                        setEditCommentContent(e.target.value)
                      }
                      style={{ marginBottom: "6px" }}
                    />

                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => onUpdateComment(comment.id)}
                      >
                        Guardar
                      </button>

                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => setEditingCommentId(null)}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <p
                    style={{
                      fontSize: "13px",
                      margin: "0 0 4px 0",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {comment.content}
                  </p>
                )}

                {isOwner && editingCommentId !== comment.id && (
                  <div
                    style={{
                      display: "flex",
                      gap: "6px",
                      marginTop: "4px",
                    }}
                  >
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => {
                        setEditingCommentId(comment.id);
                        setEditCommentContent(comment.content);
                      }}
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => onDeleteComment(comment.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "6px",
        }}
      >
        <textarea
          className="textarea"
          rows={2}
          placeholder="Escribe un comentario…"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          disabled={commentSubmitting}
        />

        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={onAddComment}
          disabled={commentSubmitting || !newComment.trim()}
          style={{ alignSelf: "flex-end" }}
        >
          {commentSubmitting ? <Spinner /> : "Comentar"}
        </button>
      </div>
    </div>
  );
}