import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  clienteApi,
  cotizacionApi,
  facturaApi,
  productoApi,
} from "../api/crudService.js";
import { fetchReportesResumen } from "../api/reportService.js";
import { getStoredRole } from "../api/tokenStorage.js";
import { messageFromApiError } from "../utils/apiMessages.js";
import Spinner from "../components/Spinner.jsx";
import Button from "../components/Button.jsx";

/** Fecha local YYYY-MM-DD (evita desfases UTC de `toISOString`). */
function isoDateLocal(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

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

function inDateRange(dateStr, desde, hasta) {
  if (dateStr == null || dateStr === "") return false;
  const s = String(dateStr).slice(0, 10);
  return s >= desde && s <= hasta;
}

function DashboardPage() {
  const diaDefault = useMemo(() => isoDateLocal(), []);

  const [fechaInicio, setFechaInicio] = useState(diaDefault);
  const [fechaFin, setFechaFin] = useState(diaDefault);

  const [loading, setLoading] = useState(true);
  const [errorBanner, setErrorBanner] = useState("");
  const [infoBanner, setInfoBanner] = useState("");

  const rolStored = typeof window !== "undefined" ? getStoredRole() : null;
  const esVendedor = rolStored === "vendedor";

  const [modoLimitado, setModoLimitado] = useState(() => esVendedor);
  const [reporte, setReporte] = useState(null);
  const [snap, setSnap] = useState({
    clientes: [],
    productos: [],
    cotizaciones: [],
    facturas: [],
  });

  const resumenOperativo = useMemo(() => {
    const facturasPeriodo = (snap.facturas || []).filter(
      (f) =>
        f.estado !== "anulada" &&
        inDateRange(f.fecha_emision ?? f.fechaEmision, fechaInicio, fechaFin),
    );
    const totalFacturado = facturasPeriodo.reduce(
      (s, f) => s + Number(f.total ?? 0),
      0,
    );
    const cotPeriodo = (snap.cotizaciones || []).filter((c) =>
      inDateRange(c.fecha_emision, fechaInicio, fechaFin),
    );
    return {
      nClientes: (snap.clientes || []).length,
      nProductos: (snap.productos || []).length,
      cotizacionesEnPeriodo: cotPeriodo.length,
      facturasEnPeriodo: facturasPeriodo.length,
      totalFacturadoPeriodo: totalFacturado,
    };
  }, [snap, fechaInicio, fechaFin]);

  const cargarSnapOperativo = useCallback(async () => {
    const settled = await Promise.allSettled([
      clienteApi.list(),
      productoApi.list(),
      cotizacionApi.list(),
      facturaApi.list(),
    ]);

    setSnap({
      clientes: settled[0].status === "fulfilled" ? settled[0].value || [] : [],
      productos:
        settled[1].status === "fulfilled" ? settled[1].value || [] : [],
      cotizaciones:
        settled[2].status === "fulfilled" ? settled[2].value || [] : [],
      facturas: settled[3].status === "fulfilled" ? settled[3].value || [] : [],
    });

    const fallosIdx = settled
      .map((r, i) => (r.status === "rejected" ? i : null))
      .filter((x) => x != null);

    if (!fallosIdx.length) return "";

    const nombres = ["clientes", "productos", "cotizaciones", "facturas"];
    const detalle = fallosIdx
      .map(
        (i) =>
          `${nombres[i]}: ${messageFromApiError(settled[i]?.reason ?? null)}`,
      )
      .join(" · ");
    return `Algún listado no pudo cargarse: ${detalle}`;
  }, []);

  const ejecutarConsulta = useCallback(
    async (desde, hasta) => {
      setErrorBanner("");
      setLoading(true);
      try {
        const vendedor = getStoredRole() === "vendedor";
        if (vendedor) {
          setModoLimitado(true);
          setReporte(null);
          setInfoBanner(
            "Rol vendedor: el reporte financiero consolidado (ventas agregadas, tasa de cobro real y rankings oficiales) solo lo sirve la API para contador o administrador. Aquí tienes un resumen operativo aproximado con los listados permitidos para tu cuenta; no equivale al cuadro de mandos financiero ni incluye información de tesorería o pagos.",
          );
          const opErr = await cargarSnapOperativo();
          setErrorBanner(opErr || "");
          return;
        }

        setInfoBanner("");
        try {
          const data = await fetchReportesResumen({
            fechaInicio: desde,
            fechaFin: hasta,
          });
          setReporte(data);
          setModoLimitado(false);
        } catch (err) {
          const status = err?.status;
          if (status === 403) {
            setModoLimitado(true);
            setReporte(null);
            setInfoBanner(
              "Este reporte financiero requiere rol contador o administrador. Mostramos un resumen operativo con los datos disponibles.",
            );
            const opErr = await cargarSnapOperativo();
            setErrorBanner(opErr || "");
          } else {
            setReporte(null);
            setErrorBanner(messageFromApiError(err));
          }
        }
      } finally {
        setLoading(false);
      }
    },
    [cargarSnapOperativo],
  );
 
  /* Carga inicial con día actual. El formulario de fechas refresca solo al pulsar el botón. */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    void ejecutarConsulta(diaDefault, diaDefault);
  }, []);
  const muestraInformeCompleto =
    reporte != null && !modoLimitado && getStoredRole() !== "vendedor";

  async function actualizarInforme() {
    await ejecutarConsulta(fechaInicio, fechaFin);
  }

  const tasa = reporte?.tasa_cobro;
  const ventasTotales = reporte?.ventas_totales;
  const productosTop = Array.isArray(reporte?.productos_top)
    ? reporte.productos_top
    : [];
  const clientesTop = Array.isArray(reporte?.clientes_top)
    ? reporte.clientes_top
    : [];

  return (
    <div className="page dashboard">
      <header className="page__header">
        <h1 className="page__title">Reporte financiero</h1>
        <p className="page__subtitle">
          {esVendedor ? (
            <>
              No tiene permiso para el reporte financiero oficial del servidor. Use
              el rango de fechas abajo solo para revisar rápidamente un{" "}
              <strong>resumen operativo</strong> derivado de clientes, productos,
              cotizaciones y facturas; para el detalle día a día trabaje sobre{" "}
              <Link to="/cotizaciones">Cotizaciones</Link> y{" "}
              <Link to="/facturas">Facturas</Link>. Pulse «Actualizar resumen»
              cuando cambie las fechas. Por defecto hoy mismo.
            </>
          ) : (
            <>
              Ventas totales por período, productos más facturados, clientes con
              mayor volumen de compras y tasa de cobro (facturas pagadas vs
              emitidas). Por defecto el período es el día actual; cambie las fechas si
              no le sirve ese rango y pulse «Actualizar informe».
            </>
          )}
        </p>
      </header>

      <section className="card card--flush reporte-financiero__filtros">
        <div className="reporte-financiero__filtros-inner">
          <label className="dynamic-form__field reporte-financiero__date">
            <span>Desde</span>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              max={fechaFin}
            />
          </label>
          <label className="dynamic-form__field reporte-financiero__date">
            <span>Hasta</span>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              min={fechaInicio}
            />
          </label>
          <Button
            type="button"
            onClick={() => actualizarInforme()}
            disabled={loading}
          >
            {loading
              ? "Actualizando…"
              : esVendedor
                ? "Actualizar resumen"
                : "Actualizar informe"}
          </Button>
        </div>
      </section>

      {loading ? (
        <div className="card card__loading" style={{ marginTop: "1rem" }}>
          <Spinner label="Cargando reporte financiero…" />
        </div>
      ) : null}

      {infoBanner ? (
        <div className="feedback feedback--warning" role="status">
          {infoBanner}
        </div>
      ) : null}

      {errorBanner ? (
        <div className="feedback feedback--error" role="alert">
          {errorBanner}
        </div>
      ) : null}

      {muestraInformeCompleto ? (
        <>
          <section
            className="dashboard-metrics"
            aria-label="Ventas totales y tasa de cobro"
          >
            <article className="card card--flat dashboard-metric">
              <p className="card__title">Ventas totales (período)</p>
              <p className="card__value">{money(ventasTotales)}</p>
              <p className="dashboard-metric__hint">
                Suma total de facturas emitidas no anuladas en el período
              </p>
            </article>
            <article className="card card--flat dashboard-metric">
              <p className="card__title">Tasa de cobro</p>
              <p className="card__value">{tasa?.porcentaje ?? "—"}%</p>
              <p className="dashboard-metric__hint">
                Facturas consideradas emitidas en período:{" "}
                {tasa?.facturas_emitidas ?? "—"} · Pagadas:{" "}
                {tasa?.facturas_pagadas ?? "—"}
              </p>
            </article>
          </section>

          <div className="dashboard-columns">
            <section className="card dashboard-panel">
              <h2 className="card__heading">
                Productos y servicios más facturados
              </h2>
              <p className="card__body-text dashboard-panel__intro">
                Productos líderes por volumen facturado (vía cotización
                facturada en el período).
              </p>
              {productosTop.length === 0 ? (
                <p className="empty-state empty-state--tight">
                  Sin datos en este período.
                </p>
              ) : (
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Cantidad</th>
                      <th>Total facturado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productosTop.map((row, idx) => (
                      <tr key={row.id_producto ?? `p-${idx}`}>
                        <td>{row.nombre_producto ?? "—"}</td>
                        <td>{row.cantidad_vendida ?? "—"}</td>
                        <td>{money(row.total_facturado)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>

            <section className="card dashboard-panel">
              <h2 className="card__heading">
                Clientes con mayor volumen de compras
              </h2>
              <p className="card__body-text dashboard-panel__intro">
                Total compras y número de facturas en el período.
              </p>
              {clientesTop.length === 0 ? (
                <p className="empty-state empty-state--tight">
                  Sin datos en este período.
                </p>
              ) : (
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th># Facturas</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientesTop.map((row, idx) => (
                      <tr key={row.id_cliente ?? `c-${idx}`}>
                        <td>{row.nombre_cliente ?? "—"}</td>
                        <td>{row.cantidad_facturas ?? "—"}</td>
                        <td>{money(row.total_compras)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
          </div>
        </>
      ) : null}

      {modoLimitado ? (
        <section className="card reporte-financiero__operativo">
          <h2 className="card__heading">
            {esVendedor ? "Resumen operativo (vendedor)" : "Resumen operativo"}
          </h2>
          <p className="card__body-text dashboard-panel__intro">
            Las cifras se calculan aquí mismo con datos de lista (no usa el endpoint
            de reportes financieros). Cotizaciones y facturas cuentan solo dentro del rango{" "}
            <strong>{fechaInicio}</strong> — <strong>{fechaFin}</strong>.
          </p>
          <div className="dashboard-metrics">
            <article className="card card--flat dashboard-metric">
              <p className="card__title">Clientes registrados</p>
              <p className="card__value">{resumenOperativo.nClientes}</p>
            </article>
            <article className="card card--flat dashboard-metric">
              <p className="card__title">Productos en catálogo</p>
              <p className="card__value">{resumenOperativo.nProductos}</p>
            </article>
            <article className="card card--flat dashboard-metric">
              <p className="card__title">Cotizaciones en período</p>
              <p className="card__value">
                {resumenOperativo.cotizacionesEnPeriodo}
              </p>
            </article>
            <article className="card card--flat dashboard-metric">
              <p className="card__title">Facturas en período (no anuladas)</p>
              <p className="card__value">
                {resumenOperativo.facturasEnPeriodo}
              </p>
            </article>
            <article className="card card--flat dashboard-metric">
              <p className="card__title">Ventas totales período</p>
              <p className="card__value">
                {money(resumenOperativo.totalFacturadoPeriodo)}
              </p>
              <p className="dashboard-metric__hint">
                Suma de totales facturados (no anuladas) dentro del rango.
              </p>
            </article>
          </div>
        </section>
      ) : null}
    </div>
  );
}

export default DashboardPage;
