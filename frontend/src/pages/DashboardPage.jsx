import { useEffect, useMemo, useState } from "react";
import {
  clienteApi,
  cotizacionApi,
  facturaApi,
  pagoApi,
  productoApi,
} from "../api/crudService.js";
import { messageFromApiError } from "../utils/apiMessages.js";
import Spinner from "../components/Spinner.jsx";

function money(n) {
  if (n == null || Number.isNaN(Number(n))) return "—";
  return Number(n).toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });
}

function safeList(result) {
  if (result.status === "fulfilled") return result.value;
  return [];
}

function buildActivity(facturas, pagos, cotizaciones) {
  const items = [];

  for (const f of facturas) {
    items.push({
      key: `f-${f.id}`,
      label: `Factura #${f.numero ?? f.id}`,
      date: f.fecha_emision || f.fecha_anulacion,
      detail:
        f.total != null
          ? money(f.total)
          : f.estado
            ? String(f.estado)
            : "",
    });
  }

  for (const p of pagos) {
    items.push({
      key: `p-${p.id}`,
      label: `Pago · Factura ${p.factura_numero ?? p.factura ?? ""}`,
      date: p.fecha_pago,
      detail: p.monto != null ? money(p.monto) : p.medio_pago || "",
    });
  }

  for (const c of cotizaciones) {
    items.push({
      key: `c-${c.id}`,
      label: `Cotización #${c.id}`,
      date: c.fecha_emision || c.fecha_vencimiento,
      detail:
        c.total != null
          ? money(c.total)
          : c.estado
            ? String(c.estado)
            : "",
    });
  }

  return items
    .filter((x) => x.date)
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))
    .slice(0, 10);
}

function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [warn, setWarn] = useState("");
  const [snapshot, setSnapshot] = useState({
    clientes: [],
    productos: [],
    cotizaciones: [],
    facturas: [],
    pagos: [],
  });

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      setWarn("");
      try {
        const settled = await Promise.allSettled([
          clienteApi.list(),
          productoApi.list(),
          cotizacionApi.list(),
          facturaApi.list(),
          pagoApi.list(),
        ]);

        if (cancelled) return;

        const errors = settled
          .map((r, i) =>
            r.status === "rejected"
              ? `${["clientes", "productos", "cotizaciones", "facturas", "pagos"][i]}: ${messageFromApiError(r.reason)}`
              : null,
          )
          .filter(Boolean);

        if (errors.length) {
          setWarn(
            `Algunos datos no pudieron cargarse (${errors.length}/5). Verifique su rol o permisos.`,
          );
        }

        setSnapshot({
          clientes: safeList(settled[0]),
          productos: safeList(settled[1]),
          cotizaciones: safeList(settled[2]),
          facturas: safeList(settled[3]),
          pagos: safeList(settled[4]),
        });
      } catch (err) {
        setWarn(messageFromApiError(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const metrics = useMemo(() => {
    const { clientes, productos, cotizaciones, facturas, pagos } = snapshot;

    const facturasValidas = facturas.filter((f) => f.estado !== "anulada");
    const totalFacturado = facturasValidas.reduce(
      (s, f) => s + Number(f.total || 0),
      0,
    );

    const totalCobrado = pagos.reduce((s, p) => s + Number(p.monto || 0), 0);

    const pendientes = facturas.filter(
      (f) =>
        f.estado === "pendiente" && Number(f.saldo_pendiente || 0) > 0,
    ).length;

    const cotizacionesAbiertas = cotizaciones.filter((c) =>
      ["borrador", "enviada"].includes(c.estado),
    ).length;

    return {
      totalFacturado,
      totalCobrado,
      nClientes: clientes.length,
      nProductos: productos.length,
      nCotizaciones: cotizaciones.length,
      nFacturas: facturas.length,
      nPagos: pagos.length,
      pendientes,
      cotizacionesAbiertas,
    };
  }, [snapshot]);

  const chartData = useMemo(
    () => [
      { label: "Clientes", value: metrics.nClientes },
      { label: "Productos", value: metrics.nProductos },
      { label: "Cotizaciones", value: metrics.nCotizaciones },
      { label: "Facturas", value: metrics.nFacturas },
      { label: "Pagos", value: metrics.nPagos },
    ],
    [metrics],
  );

  const activity = useMemo(
    () =>
      buildActivity(
        snapshot.facturas,
        snapshot.pagos,
        snapshot.cotizaciones,
      ),
    [snapshot],
  );

  const maxBar = Math.max(...chartData.map((d) => d.value), 1);

  if (loading) {
    return (
      <div className="page dashboard">
        <div className="card card__loading">
          <Spinner label="Cargando indicadores…" />
        </div>
      </div>
    );
  }

  return (
    <div className="page dashboard">
      <header className="page__header">
        <h1 className="page__title">Panel comercial</h1>
        <p className="page__subtitle">
          Visión general de ventas, cobros y operaciones. Datos en vivo desde la
          API.
        </p>
      </header>

      {warn && (
        <div className="feedback feedback--warning" role="status">
          {warn}
        </div>
      )}

      <section className="dashboard-metrics" aria-label="Métricas principales">
        <article className="card card--flat dashboard-metric">
          <p className="card__title">Ventas facturadas</p>
          <p className="card__value">{money(metrics.totalFacturado)}</p>
          <p className="dashboard-metric__hint">Total histórico (no anuladas)</p>
        </article>
        <article className="card card--flat dashboard-metric">
          <p className="card__title">Cobros registrados</p>
          <p className="card__value">{money(metrics.totalCobrado)}</p>
          <p className="dashboard-metric__hint">Suma de pagos cargados</p>
        </article>
        <article className="card card--flat dashboard-metric">
          <p className="card__title">Clientes</p>
          <p className="card__value">{metrics.nClientes}</p>
          <p className="dashboard-metric__hint">Base registrada</p>
        </article>
        <article className="card card--flat dashboard-metric">
          <p className="card__title">Productos</p>
          <p className="card__value">{metrics.nProductos}</p>
          <p className="dashboard-metric__hint">Catálogo activo</p>
        </article>
      </section>

      <div className="dashboard-columns">
        <section className="card dashboard-panel">
          <h2 className="card__heading">Volumen por módulo</h2>
          <p className="card__body-text dashboard-panel__intro">
            Comparación rápida de registros por área operativa.
          </p>
          <div className="bar-chart" role="img" aria-label="Gráfico de barras">
            {chartData.map((d) => (
              <div key={d.label} className="bar-chart__row">
                <span className="bar-chart__label">{d.label}</span>
                <div className="bar-chart__track">
                  <div
                    className="bar-chart__fill"
                    style={{ width: `${(d.value / maxBar) * 100}%` }}
                  />
                </div>
                <span className="bar-chart__value">{d.value}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="card dashboard-panel">
          <h2 className="card__heading">Alertas</h2>
          <ul className="alert-list">
            <li>
              <strong>{metrics.pendientes}</strong> factura
              {metrics.pendientes === 1 ? "" : "s"} con saldo pendiente
            </li>
            <li>
              <strong>{metrics.cotizacionesAbiertas}</strong> cotización
              {metrics.cotizacionesAbiertas === 1 ? "" : "es"} en borrador o
              enviada
            </li>
          </ul>
        </section>
      </div>

      <section className="card">
        <h2 className="card__heading">Actividad reciente</h2>
        <p className="card__body-text card__body-text--mb">
          Últimos movimientos combinados (facturas, pagos y cotizaciones).
        </p>
        {activity.length === 0 ? (
          <p className="empty-state empty-state--tight">
            No hay actividad reciente para mostrar.
          </p>
        ) : (
          <ul className="activity-list">
            {activity.map((item) => (
              <li key={item.key} className="activity-list__item">
                <div>
                  <span className="activity-list__label">{item.label}</span>
                  {item.detail && (
                    <span className="activity-list__detail">{item.detail}</span>
                  )}
                </div>
                <time className="activity-list__date" dateTime={String(item.date)}>
                  {item.date}
                </time>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default DashboardPage;
