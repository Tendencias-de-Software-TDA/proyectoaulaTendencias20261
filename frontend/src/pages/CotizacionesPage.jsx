import { useCallback, useEffect, useMemo, useState } from "react";
import { clienteApi, cotizacionApi, productoApi } from "../api/crudService.js";
import { messageFromApiError } from "../utils/apiMessages.js";
import Button from "../components/Button.jsx";
import Modal from "../components/Modal.jsx";
import Spinner from "../components/Spinner.jsx";

const ESTADOS = [
  { value: "borrador", label: "Borrador" },
  { value: "enviada", label: "Enviada" },
  { value: "aceptada", label: "Aceptada" },
  { value: "rechazada", label: "Rechazada" },
  { value: "vencida", label: "Vencida" },
];

function emptyLine() {
  return { producto: "", cantidad: 1 };
}

function clienteNombre(clientesById, clienteId) {
  if (clienteId == null) return "—";
  const c = clientesById[clienteId];
  return c?.nombre ?? `#${clienteId}`;
}

function productoLabel(productosById, productoId) {
  if (productoId == null) return "—";
  const p = productosById[productoId];
  return p ? `${p.nombre_producto} (${p.codigo})` : `#${productoId}`;
}

function money(n) {
  if (n == null || n === "") return "—";
  const x = Number(n);
  if (Number.isNaN(x)) return String(n);
  return x.toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });
}

function puedeConvertir(estado) {
  return !["borrador", "rechazada", "vencida"].includes(estado);
}

function resolveFk(value) {
  if (value == null) return null;
  if (typeof value === "object") return value.id;
  return value;
}

function CotizacionesPage() {
  const [rows, setRows] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorBanner, setErrorBanner] = useState("");
  const [feedback, setFeedback] = useState(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [createSaving, setCreateSaving] = useState(false);
  const [createForm, setCreateForm] = useState({
    cliente: "",
    fecha_vencimiento: "",
    estado: "borrador",
    items: [emptyLine(), emptyLine()],
  });

  const [editOpen, setEditOpen] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editDetail, setEditDetail] = useState(null);
  const [editForm, setEditForm] = useState({
    cliente: "",
    fecha_vencimiento: "",
    estado: "borrador",
  });

  const [deleteRow, setDeleteRow] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [convertingId, setConvertingId] = useState(null);

  const clientesById = useMemo(() => {
    const m = {};
    for (const c of clientes) {
      if (c?.id != null) m[c.id] = c;
    }
    return m;
  }, [clientes]);

  const productosById = useMemo(() => {
    const m = {};
    for (const p of productos) {
      if (p?.id != null) m[p.id] = p;
    }
    return m;
  }, [productos]);

  const productosActivos = useMemo(
    () => productos.filter((p) => p.estado !== "inactivo"),
    [productos],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setErrorBanner("");
    try {
      const [list, cl, pr] = await Promise.all([
        cotizacionApi.list(),
        clienteApi.list(),
        productoApi.list(),
      ]);
      setRows(Array.isArray(list) ? list : []);
      setClientes(Array.isArray(cl) ? cl : []);
      setProductos(Array.isArray(pr) ? pr : []);
    } catch (err) {
      setErrorBanner(messageFromApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!feedback) return undefined;
    const t = setTimeout(() => setFeedback(null), 5000);
    return () => clearTimeout(t);
  }, [feedback]);

  function openCreate() {
    setCreateForm({
      cliente: "",
      fecha_vencimiento: "",
      estado: "borrador",
      items: [emptyLine(), emptyLine()],
    });
    setCreateOpen(true);
  }

  async function submitCreate(event) {
    event.preventDefault();
    const items = createForm.items
      .filter((i) => i.producto && Number(i.cantidad) > 0)
      .map((i) => ({
        producto: Number(i.producto),
        cantidad: Number(i.cantidad),
      }));

    if (!createForm.cliente) {
      setFeedback({ type: "error", message: "Seleccione un cliente." });
      return;
    }
    if (!createForm.fecha_vencimiento) {
      setFeedback({ type: "error", message: "Indique la fecha de vencimiento." });
      return;
    }
    if (items.length === 0) {
      setFeedback({
        type: "error",
        message: "Agregue al menos una línea con producto y cantidad.",
      });
      return;
    }

    setCreateSaving(true);
    try {
      await cotizacionApi.create({
        cliente: Number(createForm.cliente),
        fecha_vencimiento: createForm.fecha_vencimiento,
        estado: createForm.estado,
        items,
      });
      setFeedback({ type: "success", message: "Cotización creada correctamente." });
      setCreateOpen(false);
      await load();
    } catch (err) {
      setFeedback({ type: "error", message: messageFromApiError(err) });
    } finally {
      setCreateSaving(false);
    }
  }

  async function openEdit(row) {
    setEditId(row.id);
    setEditOpen(true);
    setEditDetail(null);
    try {
      const detail = await cotizacionApi.retrieve(row.id);
      setEditDetail(detail);
      const clienteId =
        typeof detail.cliente === "object" && detail.cliente != null
          ? detail.cliente.id
          : detail.cliente;
      setEditForm({
        cliente: String(clienteId ?? ""),
        fecha_vencimiento: detail.fecha_vencimiento || "",
        estado: detail.estado || "borrador",
      });
    } catch (err) {
      setFeedback({ type: "error", message: messageFromApiError(err) });
      setEditOpen(false);
    }
  }

  async function submitEdit(event) {
    event.preventDefault();
    if (editId == null) return;
    setEditSaving(true);
    try {
      await cotizacionApi.update(editId, {
        cliente: Number(editForm.cliente),
        fecha_vencimiento: editForm.fecha_vencimiento,
        estado: editForm.estado,
      });
      setFeedback({ type: "success", message: "Cotización actualizada." });
      setEditOpen(false);
      setEditDetail(null);
      await load();
    } catch (err) {
      setFeedback({ type: "error", message: messageFromApiError(err) });
    } finally {
      setEditSaving(false);
    }
  }

  async function handleConvertir(row) {
    if (!row?.id) return;
    setConvertingId(row.id);
    try {
      const data = await cotizacionApi.convertirAFactura(row.id);
      const num = data?.numero != null ? ` N.º ${data.numero}` : "";
      setFeedback({
        type: "success",
        message: data?.message
          ? `${data.message}${num}`
          : `Factura creada${num}.`,
      });
      await load();
    } catch (err) {
      setFeedback({ type: "error", message: messageFromApiError(err) });
    } finally {
      setConvertingId(null);
    }
  }

  async function confirmDelete() {
    if (deleteRow?.id == null) return;
    setDeleteLoading(true);
    try {
      await cotizacionApi.destroy(deleteRow.id);
      setFeedback({ type: "success", message: "Cotización eliminada." });
      setDeleteRow(null);
      await load();
    } catch (err) {
      setFeedback({ type: "error", message: messageFromApiError(err) });
    } finally {
      setDeleteLoading(false);
    }
  }

  function updateCreateItem(index, patch) {
    setCreateForm((prev) => {
      const items = [...prev.items];
      items[index] = { ...items[index], ...patch };
      return { ...prev, items };
    });
  }

  function addCreateLine() {
    setCreateForm((prev) => ({
      ...prev,
      items: [...prev.items, emptyLine()],
    }));
  }

  function removeCreateLine(index) {
    setCreateForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  }

  return (
    <div className="page">
      <header className="page__header page__header--row">
        <div>
          <h1 className="page__title">Cotizaciones</h1>
          <p className="page__subtitle">
            Crea y administra cotizaciones para tus clientes. Define productos, cantidades y genera propuestas claras antes de facturar.
          </p>
        </div>
        <Button type="button" onClick={openCreate}>
          Nueva cotización
        </Button>
      </header>

      {feedback && (
        <div className={`feedback feedback--${feedback.type}`} role="status">
          {feedback.message}
        </div>
      )}

      {errorBanner && (
        <div className="alert alert--error" role="alert">
          {errorBanner}
        </div>
      )}

      <div className="card card--flush card--table">
        {loading ? (
          <div className="card__loading">
            <Spinner label="Cargando cotizaciones…" />
          </div>
        ) : rows.length === 0 ? (
          <p className="empty-state">No hay cotizaciones registradas.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Cliente</th>
                  <th>Emisión</th>
                  <th>Vence</th>
                  <th>Estado</th>
                  <th>Total</th>
                  <th className="data-table__actions">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td>
                      {clienteNombre(clientesById, resolveFk(row.cliente))}
                    </td>
                    <td>{row.fecha_emision ?? "—"}</td>
                    <td>{row.fecha_vencimiento ?? "—"}</td>
                    <td>{row.estado ?? "—"}</td>
                    <td>{money(row.total)}</td>
                    <td className="data-table__actions-cell">
                      <div className="table-actions">
                        <button
                          type="button"
                          className="btn--link"
                          onClick={() => openEdit(row)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="btn--link"
                          disabled={
                            !puedeConvertir(row.estado) || convertingId === row.id
                          }
                          title={
                            puedeConvertir(row.estado)
                              ? "Generar factura"
                              : "No aplica en este estado"
                          }
                          onClick={() => handleConvertir(row)}
                        >
                          {convertingId === row.id ? "…" : "A factura"}
                        </button>
                        <button
                          type="button"
                          className="btn--link btn--link--danger"
                          onClick={() => setDeleteRow(row)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        open={createOpen}
        onClose={() => !createSaving && setCreateOpen(false)}
        title="Nueva cotización"
        ariaLabel="Formulario nueva cotización"
      >
        <form className="dynamic-form" onSubmit={submitCreate}>
          <label className="dynamic-form__field">
            <span className="dynamic-form__label">Cliente</span>
            <select
              className="dynamic-form__input dynamic-form__select"
              value={createForm.cliente}
              required
              disabled={createSaving}
              onChange={(e) =>
                setCreateForm((p) => ({ ...p, cliente: e.target.value }))
              }
            >
              <option value="">— Seleccione —</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre} · {c.identificacion}
                </option>
              ))}
            </select>
          </label>

          <label className="dynamic-form__field">
            <span className="dynamic-form__label">Fecha de vencimiento</span>
            <input
              className="dynamic-form__input"
              type="date"
              required
              value={createForm.fecha_vencimiento}
              disabled={createSaving}
              onChange={(e) =>
                setCreateForm((p) => ({
                  ...p,
                  fecha_vencimiento: e.target.value,
                }))
              }
            />
          </label>

          <label className="dynamic-form__field">
            <span className="dynamic-form__label">Estado inicial</span>
            <select
              className="dynamic-form__input dynamic-form__select"
              value={createForm.estado}
              disabled={createSaving}
              onChange={(e) =>
                setCreateForm((p) => ({ ...p, estado: e.target.value }))
              }
            >
              {ESTADOS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>

          <div className="cotizacion-lines">
            <span className="dynamic-form__label">Líneas (producto y cantidad)</span>
            {createForm.items.map((line, index) => (
              <div key={index} className="cotizacion-lines__row">
                <select
                  className="dynamic-form__input dynamic-form__select"
                  value={line.producto}
                  disabled={createSaving}
                  onChange={(e) =>
                    updateCreateItem(index, { producto: e.target.value })
                  }
                >
                  <option value="">— Producto —</option>
                  {productosActivos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre_producto} — {money(p.precio_unitario)}
                    </option>
                  ))}
                </select>
                <input
                  className="dynamic-form__input cotizacion-lines__qty"
                  type="number"
                  min={1}
                  step={1}
                  value={line.cantidad}
                  disabled={createSaving}
                  onChange={(e) =>
                    updateCreateItem(index, {
                      cantidad: Number(e.target.value) || 1,
                    })
                  }
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={createSaving || createForm.items.length <= 1}
                  onClick={() => removeCreateLine(index)}
                >
                  Quitar
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={createSaving}
              onClick={addCreateLine}
            >
              + Agrerar producto
            </Button>
          </div>

          <div className="dynamic-form__actions">
            <Button
              type="button"
              variant="secondary"
              disabled={createSaving}
              onClick={() => setCreateOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={createSaving}>
              {createSaving ? "Guardando…" : "Crear cotización"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={editOpen}
        onClose={() => !editSaving && setEditOpen(false)}
        title="Editar cotización"
        ariaLabel="Editar cotización"
      >
        {!editDetail ? (
          <div className="card__loading">
            <Spinner label="Cargando detalle…" />
          </div>
        ) : (
          <form className="dynamic-form" onSubmit={submitEdit}>
            <p className="modal__text modal__text--mb">
              Totales e ítems se calculan en el servidor. Aquí puede cambiar
              cliente, fechas de vencimiento y estado.
            </p>

            <label className="dynamic-form__field">
              <span className="dynamic-form__label">Cliente</span>
              <select
                className="dynamic-form__input dynamic-form__select"
                value={editForm.cliente}
                required
                disabled={editSaving}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, cliente: e.target.value }))
                }
              >
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </label>

            <label className="dynamic-form__field">
              <span className="dynamic-form__label">Fecha de vencimiento</span>
              <input
                className="dynamic-form__input"
                type="date"
                required
                value={editForm.fecha_vencimiento}
                disabled={editSaving}
                onChange={(e) =>
                  setEditForm((p) => ({
                    ...p,
                    fecha_vencimiento: e.target.value,
                  }))
                }
              />
            </label>

            <label className="dynamic-form__field">
              <span className="dynamic-form__label">Estado</span>
              <select
                className="dynamic-form__input dynamic-form__select"
                value={editForm.estado}
                disabled={editSaving}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, estado: e.target.value }))
                }
              >
                {ESTADOS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>

            {editDetail.items?.length > 0 && (
              <div className="cotizacion-items-readonly">
                <span className="dynamic-form__label">Ítems actuales</span>
                <ul className="cotizacion-items-readonly__list">
                  {editDetail.items.map((it, i) => {
                    const pid =
                      typeof it.producto === "object" && it.producto != null
                        ? it.producto.id
                        : it.producto;
                    return (
                      <li key={i}>
                        {productoLabel(productosById, pid)} × {it.cantidad} — Subt.{" "}
                        {money(it.subtotal)}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            <div className="dynamic-form__actions">
              <Button
                type="button"
                variant="secondary"
                disabled={editSaving}
                onClick={() => setEditOpen(false)}
              >
                Cerrar
              </Button>
              <Button type="submit" variant="primary" disabled={editSaving}>
                {editSaving ? "Guardando…" : "Guardar cambios"}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      <Modal
        open={Boolean(deleteRow)}
        onClose={() => !deleteLoading && setDeleteRow(null)}
        title="Eliminar cotización"
        footer={
          <div className="modal__footer-actions">
            <Button
              variant="secondary"
              disabled={deleteLoading}
              onClick={() => setDeleteRow(null)}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              disabled={deleteLoading}
              onClick={confirmDelete}
            >
              {deleteLoading ? "Eliminando…" : "Eliminar"}
            </Button>
          </div>
        }
      >
        <p className="modal__text">
          ¿Eliminar la cotización #{deleteRow?.id}? Esta acción no se puede
          deshacer.
        </p>
      </Modal>
    </div>
  );
}

export default CotizacionesPage;
