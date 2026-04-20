/**
 * Extrae mensaje legible desde errores normalizados de axios/api.
 */
export function messageFromApiError(error) {
  if (!error) return "Error desconocido";
  const raw = error.raw;

  if (typeof raw?.detail === "string") return raw.detail;
  if (Array.isArray(raw?.detail)) {
    return raw.detail
      .map((d) => (typeof d === "string" ? d : d?.string || JSON.stringify(d)))
      .join(" · ");
  }

  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const parts = [];
    for (const [key, val] of Object.entries(raw)) {
      if (key === "detail") continue;
      if (Array.isArray(val)) {
        parts.push(`${key}: ${val.join(", ")}`);
      } else if (typeof val === "object") {
        parts.push(`${key}: ${JSON.stringify(val)}`);
      } else {
        parts.push(`${key}: ${val}`);
      }
    }
    if (parts.length) return parts.join(" · ");
  }

  return error.message || "Error de conexión con el servidor";
}
