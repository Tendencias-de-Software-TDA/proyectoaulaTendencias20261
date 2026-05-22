/**
 * Infiere columnas a partir de una lista de objetos (unión de claves).
 */
export function inferColumnKeys(rows) {
  if (!Array.isArray(rows) || rows.length === 0) return [];
  const keys = new Set();
  for (const row of rows) {
    if (row && typeof row === "object") {
      Object.keys(row).forEach((k) => keys.add(k));
    }
  }
  const list = [...keys];
  list.sort((a, b) => {
    if (a === "id") return -1;
    if (b === "id") return 1;
    return a.localeCompare(b);
  });
  return list;
}

export function isComplexValue(value) {
  return value !== null && typeof value === "object";
}

export function formatCellValue(value) {
  if (value === null || value === undefined) return "—";
  if (isComplexValue(value)) {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

/**
 * Une claves de varias filas para formularios (incluye anidados).
 */
export function mergeKeysFromRows(rows) {
  return inferColumnKeys(rows);
}
