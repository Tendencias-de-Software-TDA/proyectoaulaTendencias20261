import api from "./client.js";

/**
 * Reporte financiero consolidado (backend: rol contador o administrador).
 * @param {{ fechaInicio: string; fechaFin: string }} opts - fechas YYYY-MM-DD
 */
export async function fetchReportesResumen({ fechaInicio, fechaFin }) {
  const { data } = await api.get("/reportes/resumen/", {
    params: {
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
    },
  });
  return data;
}

/** Reporte de cartera: facturas con saldo por cliente y antigüedad */
export async function fetchReportesCartera() {
  const { data } = await api.get("/reportes/cartera/");
  return data;
}
