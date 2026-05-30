import { useEffect, useState } from "react";
import { getProjectMetrics } from "../../api/api";
import Alert from "../common/Alert";
import Spinner from "../common/Spinner";

export default function ProjectMetrics({ projectId, onClose }) {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadMetrics = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await getProjectMetrics(projectId);

        if (!cancelled) {
          setMetrics(data);
        }
      } catch {
        if (!cancelled) {
          setError("No se pudieron cargar las métricas del proyecto.");
          setMetrics(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    if (projectId) {
      loadMetrics();
    }

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  return (
    <div
      className="overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal" style={{ maxWidth: "760px" }}>
        <h2 className="modal-title">Métricas del proyecto</h2>

        {loading && <Spinner />}

        {error && <Alert type="error">{error}</Alert>}

        {!loading && !error && metrics && (
          <>
            <p
              style={{
                color: "var(--muted)",
                fontSize: "14px",
                marginBottom: "18px",
              }}
            >
              Resumen de tareas, estados y rendimiento del proyecto.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                gap: "14px",
              }}
            >
              <MetricCard
                value={metrics.total_tasks ?? 0}
                label="Total tareas"
              />

              <MetricCard
                value={metrics.completed ?? 0}
                label="Completadas"
              />

              <MetricCard
                value={metrics.in_progress ?? 0}
                label="En progreso"
              />

              <MetricCard
                value={metrics.in_review ?? 0}
                label="En revisión"
              />

              <MetricCard
                value={metrics.pending ?? 0}
                label="Pendientes"
              />

              <MetricCard
                value={metrics.cancelled ?? 0}
                label="Canceladas"
              />

              <MetricCard
                value={metrics.overdue ?? 0}
                label="Vencidas"
              />

              <MetricCard
                value={
                  metrics.avg_resolution_hours !== null &&
                  metrics.avg_resolution_hours !== undefined
                    ? `${metrics.avg_resolution_hours} h`
                    : "—"
                }
                label="Promedio resolución"
              />

              <MetricCard
                value={`${metrics.completion_rate_percent ?? 0}%`}
                label="Tasa de finalización"
              />
            </div>
          </>
        )}

        {!loading && !error && !metrics && (
          <div className="empty-state">
            <p className="empty-text">
              No hay métricas disponibles para este proyecto.
            </p>
          </div>
        )}

        <div className="modal-footer">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ value, label }) {
  return (
    <article
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "14px",
        padding: "16px",
      }}
    >
      <span
        style={{
          display: "block",
          fontSize: "26px",
          fontWeight: "700",
          marginBottom: "6px",
        }}
      >
        {value}
      </span>

      <span
        style={{
          color: "var(--muted)",
          fontSize: "13px",
        }}
      >
        {label}
      </span>
    </article>
  );
}