import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
/** Logo: `frontend/src/assets/logofondo.png` */
import logoSrc from "../assets/logofondo.png";
import {
  facturaApi,
  cotizacionApi,
  productoApi,
  clienteApi,
} from "../api/crudService.js";

const SECTION_GAP_MM = 7;
const MARGIN_MM = 14;

/** Hueco suave entre columnas de texto (sin cortar el bloque visual) */
const COL_GUTTER_MM = 4;

/** Logo dentro del círculo (manteniendo proporción, sin deformar). */
const LOGO_MAX_W_MM = 18;
const LOGO_MAX_H_MM = 18;

/** Anillo negro muy ajustado al logo (solo un poco más que la imagen) */
const CIRCLE_PADDING_MM = 0.9;

/** Altura de barra igual criterio visual al encabezado de tabla (autoTable ~7mm con padding) */
const SUBHEAD_H_MM = 7;

const C_TEXT = [42, 42, 42];
const C_TEXT_MUTED = [95, 95, 95];
const C_BORDER = [210, 210, 210];
const C_TABLE_HEAD = [60, 60, 60];
const C_ROW_ALT = [248, 248, 248];

function moneyCo(n) {
  if (n == null || Number.isNaN(Number(n))) return "—";
  return Number(n).toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });
}

async function resolveClienteDetalle(factura) {
  const raw = factura?.cliente;
  const id = typeof raw === "number" ? raw : raw?.id;
  if (id != null) {
    try {
      return await clienteApi.retrieve(id);
    } catch {
      return raw && typeof raw === "object" ? raw : null;
    }
  }
  return raw && typeof raw === "object" ? raw : null;
}

/**
 * Bloque superior: Cliente (izq) y Factura (der) en dos columnas.
 */
function drawClienteFacturaUnificado(doc, cliente, factura, margin, pageW, y) {
  const innerW = pageW - margin * 2;
  const colW = (innerW - COL_GUTTER_MM) / 2;
  const x0 = margin;
  const x1 = x0 + colW + COL_GUTTER_MM;
  const midLeft = x0 + colW / 2;
  const midRight = x1 + colW / 2;

  doc.setFillColor(...C_TABLE_HEAD);
  doc.rect(margin, y, innerW, SUBHEAD_H_MM, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("Cliente", midLeft, y + 4.5, { align: "center" });
  doc.text("Factura", midRight, y + 4.5, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...C_TEXT);

  let cyL = y + SUBHEAD_H_MM + 4;
  let cyR = y + SUBHEAD_H_MM + 4;
  const padX = 0;
  const textW = colW - 1;

  const camposCliente = [
    { label: "Nombre", value: cliente?.nombre },
    { label: "Identificación", value: cliente?.identificacion },
    { label: "Dirección", value: cliente?.direccion },
  ];

  for (const { label, value } of camposCliente) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...C_TEXT_MUTED);
    doc.text(label, x0 + padX, cyL);
    cyL += 3.4;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...C_TEXT);
    const txt =
      value != null && String(value).trim() !== "" ? String(value) : "—";
    const wrapped = doc.splitTextToSize(txt, textW);
    doc.text(wrapped, x0 + padX, cyL);
    cyL += wrapped.length * 3.5 + 2.5;
  }

  const estado =
    factura?.estado != null && String(factura.estado).trim() !== ""
      ? String(factura.estado)
      : "—";

  const lineasFactura = [
    { label: "Fecha de vencimiento", value: factura.fecha_vencimiento ?? "—" },
    { label: "Estado", value: estado },
  ];

  for (const { label, value } of lineasFactura) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...C_TEXT_MUTED);
    doc.text(label, x1 + padX, cyR);
    cyR += 3.4;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...C_TEXT);
    const wrapped = doc.splitTextToSize(String(value), textW);
    doc.text(wrapped, x1 + padX, cyR);
    cyR += wrapped.length * 3.5 + 2.5;
  }

  return Math.max(cyL, cyR) + 4;
}

function productoNombre(item, productMap) {
  if (typeof item?.producto === "object" && item.producto != null) {
    const o = item.producto;
    return (
      o.nombre_producto ??
      o.nombre ??
      (o.id != null ? `Producto #${o.id}` : "—")
    );
  }
  const pid = item?.producto;
  if (pid == null) return "—";
  const p = productMap[pid];
  if (p && typeof p === "object") {
    return p.nombre_producto ?? p.nombre ?? `Producto #${pid}`;
  }
  return `Producto #${pid}`;
}

function unitPrice(item, productMap) {
  const pid =
    typeof item?.producto === "object" ? item?.producto?.id : item?.producto;
  const prod = pid != null ? productMap[pid] : null;
  const precioRaw =
    prod?.precio_unitario != null
      ? Number(prod.precio_unitario)
      : item?.precio != null
        ? Number(item.precio)
        : null;
  if (precioRaw == null || Number.isNaN(precioRaw)) return null;
  return precioRaw;
}

function lineaImporte(item, productMap) {
  const st = item?.subtotal;
  if (st != null && !Number.isNaN(Number(st))) return moneyCo(st);
  const cant = Number(item?.cantidad);
  const precioRaw = unitPrice(item, productMap);
  if (precioRaw != null && !Number.isNaN(cant) && !Number.isNaN(precioRaw)) {
    return moneyCo(precioRaw * cant);
  }
  return "—";
}

async function getImageAspectRatio(src) {
  try {
    const img = new Image();
    img.decoding = "async";
    img.src = src;
    await new Promise((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("No se pudo cargar el logo."));
    });
    const w = Number(img.naturalWidth || 0);
    const h = Number(img.naturalHeight || 0);
    if (w > 0 && h > 0) return w / h;
  } catch {
    // ignore
  }
  return null;
}

function fitBoxPreserveAspect(maxW, maxH, aspectWH) {
  if (!aspectWH || Number.isNaN(aspectWH) || aspectWH <= 0) {
    return { w: maxW, h: maxH };
  }
  // aspectWH = width / height
  let w = maxW;
  let h = w / aspectWH;
  if (h > maxH) {
    h = maxH;
    w = h * aspectWH;
  }
  return { w, h };
}

/**
 * Encabezado: izquierda "FACTURA" y número en recuadro; derecha logo en círculo negro.
 */
function drawHeaderRow(doc, pageW, margin, yStart, numeroFactura, logoDims) {
  const leftX = margin;
  const rightX = pageW - margin;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...C_TEXT);
  doc.text("FACTURA", leftX, yStart + 8);

  const numText =
    numeroFactura != null && String(numeroFactura).trim() !== ""
      ? `N.º ${numeroFactura}`
      : "N.º —";

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const pillH = 9;
  const pillPadX = 4.5;
  const pillW = doc.getTextWidth(numText) + pillPadX * 2;
  const pillY = yStart + 12;
  doc.setDrawColor(...C_BORDER);
  doc.setLineWidth(0.35);
  doc.roundedRect(leftX, pillY, pillW, pillH, 2.5, 2.5, "S");
  doc.text(numText, leftX + pillPadX, pillY + 6.2);

  const { w: logoW, h: logoH } = logoDims || {
    w: LOGO_MAX_W_MM,
    h: LOGO_MAX_H_MM,
  };

  const circleR =
    Math.max(logoW, logoH) / 2 + CIRCLE_PADDING_MM;
  const cx = rightX - circleR;
  const cy = yStart + circleR + 2;

  doc.setFillColor(0, 0, 0);
  doc.circle(cx, cy, circleR, "F");

  const logoX = cx - logoW / 2;
  const logoY = cy - logoH / 2;
  try {
    doc.addImage(logoSrc, "PNG", logoX, logoY, logoW, logoH);
  } catch {
    try {
      doc.addImage(logoSrc, "JPEG", logoX, logoY, logoW, logoH);
    } catch {
      /* sin logo */
    }
  }

  // línea separadora horizontal (bajo el encabezado)
  const circleBottom = cy + circleR;
  const pillBottom = pillY + pillH;
  const lineY = Math.max(yStart + 30, pillBottom + 7, circleBottom + 7);
  doc.setDrawColor(...C_BORDER);
  doc.setLineWidth(0.35);
  doc.line(margin, lineY, pageW - margin, lineY);

  return lineY + SECTION_GAP_MM;
}

function drawTotales(doc, factura, pageW, margin, yStart) {
  const blockW = 72;
  const xRight = pageW - margin;
  const xLeft = xRight - blockW;
  const labelPad = 2;
  let ty = yStart + 1;

  function sep() {
    doc.setDrawColor(...C_BORDER);
    doc.setLineWidth(0.1);
    doc.line(xLeft, ty, xRight, ty);
    ty += 4;
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...C_TEXT_MUTED);
  doc.text("Subtotal", xLeft + labelPad, ty);
  doc.setTextColor(...C_TEXT);
  doc.text(moneyCo(factura.subtotal), xRight - labelPad, ty, {
    align: "right",
  });
  ty += 5.5;
  sep();

  doc.setTextColor(...C_TEXT_MUTED);
  doc.text("IVA", xLeft + labelPad, ty);
  doc.setTextColor(...C_TEXT);
  doc.text(moneyCo(factura.iva), xRight - labelPad, ty, { align: "right" });
  ty += 5.5;
  sep();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...C_TEXT);
  doc.text("TOTAL", xLeft + labelPad, ty);
  doc.text(moneyCo(factura.total), xRight - labelPad, ty, { align: "right" });
  ty += 6;
  sep();

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...C_TEXT_MUTED);
  doc.text("Saldo pendiente", xLeft + labelPad, ty);
  doc.setTextColor(...C_TEXT);
  doc.text(moneyCo(factura.saldo_pendiente), xRight - labelPad, ty, {
    align: "right",
  });

  return ty + 6;
}

function drawFooter(doc, pageW, margin) {
  const pageH = doc.internal.pageSize.getHeight();
  const y = pageH - margin + 2;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...C_TEXT_MUTED);
  doc.text("Gracias por su compra", margin, y - 6);
  doc.text("Nota: documento generado por el sistema.", margin, y - 1);
  doc.setTextColor(0, 0, 0);
}

export async function downloadFacturaPdf(row) {
  const factura = await facturaApi.retrieve(row.id);
  const cliente = await resolveClienteDetalle(factura);

  const cotId =
    typeof factura.cotizacion === "object"
      ? factura.cotizacion?.id
      : factura.cotizacion;
  const [cotizacion, productos] = await Promise.all([
    cotId != null ? cotizacionApi.retrieve(cotId) : Promise.resolve(null),
    productoApi.list(),
  ]);
  const productMap = Object.fromEntries(
    (Array.isArray(productos) ? productos : []).map((p) => [p.id, p]),
  );

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = MARGIN_MM;

  let y = margin;

  const aspect = await getImageAspectRatio(logoSrc);
  const logoDims = fitBoxPreserveAspect(LOGO_MAX_W_MM, LOGO_MAX_H_MM, aspect);
  y = drawHeaderRow(doc, pageW, margin, y, factura?.numero, logoDims);

  y = drawClienteFacturaUnificado(doc, cliente, factura, margin, pageW, y);
  y += SECTION_GAP_MM;

  const items = Array.isArray(cotizacion?.items) ? cotizacion.items : [];
  if (items.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [["Producto", "Cantidad", "Precio unitario", "Subtotal"]],
      body: items.map((it) => [
        productoNombre(it, productMap),
        String(it?.cantidad ?? "—"),
        (() => {
          const u = unitPrice(it, productMap);
          return u == null ? "—" : moneyCo(u);
        })(),
        lineaImporte(it, productMap),
      ]),
      theme: "plain",
      headStyles: {
        fillColor: C_TABLE_HEAD,
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 8.5,
        lineColor: C_BORDER,
        lineWidth: 0.08,
      },
      styles: {
        fontSize: 8.5,
        cellPadding: 3,
        lineColor: C_BORDER,
        lineWidth: 0.08,
        textColor: C_TEXT,
        fillColor: [255, 255, 255],
      },
      alternateRowStyles: {
        fillColor: C_ROW_ALT,
      },
      columnStyles: {
        0: { cellWidth: pageW - margin * 2 - 22 - 30 - 30 },
        1: { halign: "center", cellWidth: 22 },
        2: { halign: "right", cellWidth: 30 },
        3: { halign: "right", cellWidth: 30 },
      },
      margin: { left: margin, right: margin },
    });
    y =
      doc.lastAutoTable?.finalY != null
        ? doc.lastAutoTable.finalY + SECTION_GAP_MM
        : y + 40;
  } else {
    doc.setFontSize(8);
    doc.setTextColor(...C_TEXT_MUTED);
    doc.text("Sin detalle de ítems en la cotización vinculada.", margin, y);
    doc.setTextColor(0, 0, 0);
    y += SECTION_GAP_MM;
  }

  drawTotales(doc, factura, pageW, margin, y);
  drawFooter(doc, pageW, margin);

  const filename = `factura-${factura.numero ?? factura.id}.pdf`;

  // Descarga robusta (evita que algunos navegadores bloqueen `doc.save()`).
  try {
    const blob = doc.output("blob");
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  } catch {
    // Fallback
    doc.save(filename);
  }
}
