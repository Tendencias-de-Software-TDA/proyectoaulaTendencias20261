import api from "./client.js";

function normalizeListPayload(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return [];
}

/**
 * @param {string} path - ej. "/cliente/" (con slash final)
 */
export function createCrudService(path) {
  const base = path.startsWith("/") ? path : `/${path}`;
  const trimmed = base.endsWith("/") ? base.slice(0, -1) : base;

  return {
    path: base,

    async list() {
      const { data } = await api.get(base);
      return normalizeListPayload(data);
    },

    async retrieve(id) {
      const { data } = await api.get(`${trimmed}/${id}/`);
      return data;
    },

    async options() {
      try {
        const { data } = await api.request({ method: "OPTIONS", url: base });
        return data;
      } catch {
        return null;
      }
    },

    /** Extrae nombres de campos para POST desde metadata DRF */
    postFieldNamesFromOptions(optionsPayload) {
      const post = optionsPayload?.actions?.POST;
      if (!post || typeof post !== "object") return [];
      return Object.keys(post).filter((k) => k !== "__str__");
    },

    /** Claves permitidas para PATCH/PUT según metadata DRF (si existe). */
    fieldNamesForAction(optionsPayload, action) {
      const block = optionsPayload?.actions?.[action];
      if (!block || typeof block !== "object") return null;
      return Object.keys(block).filter((k) => k !== "__str__");
    },

    async create(body) {
      const { data } = await api.post(base, body);

      if (data?.pago && typeof data.pago === "object") {
        return data.pago;
      }
      if (data?.nota_credito && typeof data.nota_credito === "object") {
        return data.nota_credito;
      }
      return data;
    },

    async update(id, body, method = "patch") {
      const m = method.toLowerCase() === "put" ? "put" : "patch";
      const { data } = await api[m](`${trimmed}/${id}/`, body);
      return data;
    },

    async destroy(id) {
      await api.delete(`${trimmed}/${id}/`);
    },
  };
}

export const clienteApi = createCrudService("/cliente/");
export const productoApi = createCrudService("/producto/");
const cotizacionCrud = createCrudService("/cotizacion/");

/** CRUD + acción personalizada del ViewSet. */
export const cotizacionApi = {
  ...cotizacionCrud,
  async convertirAFactura(id) {
    const { data } = await api.post(`/cotizacion/${id}/convertir_a_factura/`);
    return data;
  },
};

const facturaCrud = createCrudService("/factura/");

/** CRUD + acción de conversión desde cotización (backend facturación). */
export const facturaApi = {
  ...facturaCrud,
  async convertirDesdeCotizacion(cotizacion_id) {
    const { data } = await api.post("/factura/convertir/", { cotizacion_id });
    return data;
  },

  /** Anula la factura (obliga motivo; validación en servidor). */
  async anular(id, motivo) {
    const { data } = await api.post(`/factura/${id}/anular/`, { motivo });
    return data;
  },
};
export const pagoApi = createCrudService("/pago/");
export const notaCreditoApi = createCrudService("/nota-credito/");
