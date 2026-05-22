import { useEffect, useState } from "react";
import { getUserMetrics } from "../../api/api";
import Alert from "../common/Alert";
import Spinner from "../common/Spinner";

export default function ProfilePage({ user }) {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadMetrics = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await getUserMetrics(user.id);

        if (!cancelled) {
          setMetrics(data);
        }
      } catch {
        if (!cancelled) {
          setError("No se pudieron cargar las métricas del usuario.");
          setMetrics(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    if (user?.id) {
      loadMetrics();
    }

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const getMetricValue = (key, fallback = 0) => {
    return metrics?.[key] ?? fallback;
  };

  const fulfillmentRate = getMetricValue("fulfillment_rate_percent", 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Mi perfil</h1>
          <p style={{ color: "var(--muted)", marginTop: "6px" }}>
            Información personal y resumen de tareas asignadas.
          </p>
        </div>
      </div>

      <div className="page-body">
        <section
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "16px",
            padding: "22px",
            marginBottom: "22px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              background: "var(--primary)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "26px",
              fontWeight: "700",
              flexShrink: 0,
            }}
          >
            {user?.username?.[0]?.toUpperCase() || "?"}
          </div>

          <div>
            <h2 style={{ margin: 0, fontSize: "24px" }}>
              {user?.username}
            </h2>

            <p
              style={{
                margin: "6px 0",
                color: "var(--muted)",
                fontSize: "14px",
              }}
            >
              {user?.email || "Sin correo registrado"}
            </p>

            <span className="badge">
              {user?.is_admin ? "Administrador" : "Miembro"}
            </span>
          </div>
        </section>

        {error && <Alert type="error">{error}</Alert>}

        {loading ? (
          <Spinner />
        ) : (
          <section>
            <h2
              style={{
                fontSize: "18px",
                marginBottom: "14px",
              }}
            >
              Métricas personales
            </h2>

            {metrics ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: "14px",
                }}
              >
                <MetricCard
                  value={getMetricValue("total_assigned")}
                  label="Tareas asignadas"
                />

                <MetricCard
                  value={getMetricValue("completed")}
                  label="Completadas"
                />

                <MetricCard
                  value={getMetricValue("in_progress")}
                  label="En progreso"
                />

                <MetricCard
                  value={getMetricValue("pending")}
                  label="Pendientes"
                />

                <MetricCard
                  value={getMetricValue("cancelled")}
                  label="Canceladas"
                />

                <MetricCard
                  value={getMetricValue("overdue")}
                  label="Vencidas"
                />

                <MetricCard
                  value={`${fulfillmentRate}%`}
                  label="Tasa de cumplimiento"
                />
              </div>
            ) : (
              <div className="empty-state">
                <p className="empty-text">
                  No hay métricas disponibles para este usuario.
                </p>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

function MetricCard({ value, label }) {
  return (
    <article
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: "14px",
        padding: "18px",
      }}
    >
      <span
        style={{
          display: "block",
          fontSize: "28px",
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