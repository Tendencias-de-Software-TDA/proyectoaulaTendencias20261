import { useEffect, useState } from "react";
import { getTaskHistory } from "../../api/api";
import Alert from "../common/Alert";
import Spinner from "../common/Spinner";

export default function TaskHistory({ taskId }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadHistory = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await getTaskHistory(taskId);

        if (!cancelled) {
          setHistory(Array.isArray(data) ? data : data?.results ?? []);
        }
      } catch {
        if (!cancelled) {
          setError("No se pudo cargar el historial de cambios.");
          setHistory([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    if (taskId) {
      loadHistory();
    }

    return () => {
      cancelled = true;
    };
  }, [taskId]);

  if (loading) return <Spinner />;

  if (error) return <Alert type="error">{error}</Alert>;

  if (history.length === 0) {
    return (
      <p
        style={{
          color: "var(--muted)",
          fontSize: "13px",
          marginTop: "8px",
        }}
      >
        Sin cambios registrados.
      </p>
    );
  }

  return (
    <ul
      style={{
        listStyle: "none",
        padding: 0,
        margin: "10px 0 0 0",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}
    >
      {history.map((item) => (
        <li
          key={item.id}
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            padding: "10px",
          }}
        >
          <div
            style={{
              fontSize: "13px",
              fontWeight: 700,
              marginBottom: "4px",
            }}
          >
            {item.field_changed}
          </div>

          <div
            style={{
              color: "var(--muted)",
              fontSize: "12px",
              marginBottom: "4px",
            }}
          >
            <strong>{item.old_value || "—"}</strong> →{" "}
            <strong>{item.new_value || "—"}</strong>
          </div>

          <div
            style={{
              color: "var(--muted)",
              fontSize: "11px",
            }}
          >
            {item.changed_by_username || "Usuario desconocido"} ·{" "}
            {new Date(item.changed_at).toLocaleString("es-CO")}
          </div>
        </li>
      ))}
    </ul>
  );
}