import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { fetchReportesCartera } from "../api/reportService.js";
import { getStoredRole } from "../api/tokenStorage.js";
import { messageFromApiError } from "../utils/apiMessages.js";
import Spinner from "../components/Spinner.jsx";
import Button from "../components/Button.jsx";

const TRAMO_KEYS = [
  "por_vencer",
  "0_30",
  "31_60",
  "61_90",
  "mas_90",
];

function money(n) {
  if (n == null || n === "") return "—";
  const num = Number(n);
  if (Number.isNaN(num)) return "—";
  return num.toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });
}

/** Texto legible para dias_para_vencer: (fecha_venc - fecha_corte).days */
export function textoDiasParaVencer(dias) {
  if (dias == null || Number.isNaN(Number(dias))) return "—";
  const n = Number(dias);
  if (n > 0) return `Vence en ${n} día${n === 1 ? "" : "s"}`;
  if (n === 0) return "Vence hoy";
  const m = Math.abs(n);
  return `Vencido hace ${m} día${m === 1 ? "" : "s"}`;
}

function CarteraPage() {
  const esVendedor = getStoredRole() === "vendedor";

  const [loading, setLoading] = useState(!esVendedor);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const load = useCallback(async () => {
    if (esVendedor) {
      setData(null);
      setInfo("");
      setError("");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const resp = await fetchReportesCartera();
      setInfo("");
      setData(resp);
    } catch (err) {
      const st = err?.status;
      if (st === 403) {
        setInfo(
          "No tiene permisos para el reporte de cartera (contador o administrador). Solicite acceso si lo requiere.",
        );
      } else {
        setError(messageFromApiError(err));
      }
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [esVendedor]);

  useEffect(() => {
    if (esVendedor) return;
    void load();
  }, [esVendedor, load]);

  const catalog = data?.catalogo_tramos ?? {};
  const clientes = useMemo(() => {
    const list = data?.clientes;
    return Array.isArray(list) ? list : [];
  }, [data]);

  const totGlobal = data?.totales_global_por_tramo;

  return (
    <div className="page cartera-page">
      <header className="page__header">
        <h1 className="page__title">Reporte de cartera</h1>
        <p className="page__subtitle">
          Facturas <strong>pendientes de cobro</strong> (estado pendiente con
          saldo) agrupadas por cliente, saldo adeudado, vencimiento y tramo de{" "}
          <strong>antigüedad de la mora</strong>.
        </p>
      </header>

      {!esVendedor ? (
        <div style={{ marginBottom: "1rem" }}>
          <Button type="button" variant="secondary" onClick={() => load()} disabled={loading}>
            {loading ? "Cargando…" : "Actualizar cartera"}
          </Button>
        </div>
      ) : null}

      {esVendedor ? (
        <div className="feedback feedback--warning" role="status">
          Este reporte está restringido a <strong>contador</strong> y{" "}
          <strong>administrador</strong>. Puede revisar cotizaciones y facturas en{" "}
          <Link to="/cotizaciones">Cotizaciones</Link> y{" "}
          <Link to="/facturas">Facturas</Link>.
        </div>
      ) : null}

      {!esVendedor && info ? (
        <div className="feedback feedback--warning" role="status">
          {info}
        </div>
      ) : null}

      {error ? (
        <div className="feedback feedback--error" role="alert">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="card card__loading">
          <Spinner label="Generando reporte de cartera…" />
        </div>
      ) : null}

      {!loading && data && (
        <>
          <p className="cartera-meta">
            Fecha de corte: <strong>{data.fecha_corte}</strong>
            {" · "}Total adeudado:{" "}
            <strong>{money(data.total_cartera_adeudado)}</strong>
          </p>

          <section className="dashboard-metrics" aria-label="Totales por tramo">
            {TRAMO_KEYS.map((k) => (
              <article key={k} className="card card--flat dashboard-metric">
                <p className="card__title">{catalog[k] ?? k}</p>
                <p className="card__value">{money(totGlobal?.[k])}</p>
              </article>
            ))}
          </section>

          {clientes.length === 0 ? (
            <p className="empty-state">No hay facturas con saldo pendiente.</p>
          ) : (
            clientes.map((bloque) => (
              <section
                key={`cli-${bloque.cliente_id}`}
                className="card cartera-cliente-box"
              >
                <header className="cartera-cliente-header">
                  <h2 className="card__heading">{bloque.cliente_nombre}</h2>
                  <p className="cartera-cliente-saldo">
                    Adeudado: <strong>{money(bloque.saldo_total_adeudado)}</strong>
                  </p>
                </header>

                <div className="cartera-tramos-mini">
                  {TRAMO_KEYS.filter(
                    (k) => Number(bloque.totales_por_tramo?.[k] ?? 0) > 0,
                  ).map((k) => (
                    <span key={k} className="cartera-tramo-chip">
                      {catalog[k] ?? k}: {money(bloque.totales_por_tramo[k])}
                    </span>
                  ))}
                </div>

                <table className="report-table">
                  <thead>
                    <tr>
                      <th>Factura</th>
                      <th>Emisión</th>
                      <th>Vencimiento</th>
                      <th>Saldo</th>
                      <th>Vencimiento (días)</th>
                      <th>Antigüedad</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(bloque.facturas || []).map((f) => (
                      <tr key={f.id}>
                        <td>#{f.numero ?? f.id}</td>
                        <td>{f.fecha_emision ?? "—"}</td>
                        <td>{f.fecha_vencimiento ?? "—"}</td>
                        <td>{money(f.saldo_pendiente)}</td>
                        <td>{textoDiasParaVencer(f.dias_para_vencer)}</td>
                        <td>{catalog[f.clasificacion_antiguedad] ?? f.clasificacion_antiguedad}</td>
                        <td>{f.estado ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            ))
          )}
        </>
      )}
    </div>
  );
}

export default CarteraPage;
