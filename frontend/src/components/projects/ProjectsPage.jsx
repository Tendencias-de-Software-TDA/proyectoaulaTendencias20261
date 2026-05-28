import { useState, useEffect } from "react";
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject as deleteProjectRequest,
  getUsers,
  addMember,
} from "../../api/api";
import Spinner from "../common/Spinner";
import Alert from "../common/Alert";
import useEscKey from "../../hooks/useEscKey";
import useToast from "../../hooks/useToast";

export default function ProjectsPage({ onSelectProject, user }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", status: "active", start_date: "", due_date: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");

  const [membersStep, setMembersStep] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState("");
  const [addingMembers, setAddingMembers] = useState(false);

  const { showToast } = useToast();

  useEscKey(() => {
    if (membersStep) { setMembersStep(null); setSelectedMembers([]); }
    else { setModal(null); setDeleteConfirm(null); }
  });

  const load = async () => {
    setLoading(true);
    try {
      const data = await getProjects();
      setProjects(Array.isArray(data) ? data : (data?.results || []));
    } catch (e) {
      setError(e?.data?.detail || "Error al cargar proyectos");
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setForm({ name: "", description: "", status: "active", start_date: "", due_date: "" });
    setError("");
    setFormError("");
    setModal("new");
  };

  const openEdit = (project) => {
    setForm({
      name: project.name,
      description: project.description || "",
      status: project.status,
      start_date: project.start_date ? project.start_date.slice(0, 10) : "",
      due_date: project.due_date ? project.due_date.slice(0, 10) : "",
    });
    setError("");
    setFormError("");
    setModal(project);
  };

  const saveProject = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!form.name?.trim()) {
      setFormError("El nombre del proyecto es obligatorio.");
      return;
    }
    if (form.start_date && form.due_date && form.start_date > form.due_date) {
      setFormError("La fecha de inicio no puede ser posterior a la fecha límite.");
      return;
    }

    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.start_date) delete payload.start_date;
      if (!payload.due_date) delete payload.due_date;

      if (modal === "new") {
        const created = await createProject(payload);
        setProjects(p => [created, ...p]);
        showToast("Proyecto creado correctamente.", "success");
        setModal(null);
        if (user?.is_admin) {
          openMembersStep(created.id, created.name);
        }
      } else {
        const updated = await updateProject(modal.id, payload);
        setProjects(p => p.map(x => x.id === modal.id ? updated : x));
        showToast("Proyecto actualizado correctamente.", "success");
        setModal(null);
      }
    } catch (e) {
      setFormError(
        e?.data?.due_date?.[0] ||
        e?.data?.start_date?.[0] ||
        e?.data?.name?.[0] ||
        e?.data?.detail ||
        "Error al guardar el proyecto"
      );
    }
    setSaving(false);
  };

  const openMembersStep = async (projectId, projectName) => {
    setMembersStep({ projectId, projectName });
    setSelectedMembers([]);
    setMembersError("");
    setMembersLoading(true);
    try {
      const data = await getUsers();
      const users = Array.isArray(data) ? data : (data?.results ?? []);
      setAllUsers(users.filter(u => u.id !== user?.id));
    } catch {
      setMembersError("No se pudo cargar la lista de usuarios.");
    }
    setMembersLoading(false);
  };

  const toggleMember = (userId) => {
    setSelectedMembers(prev => {
      const exists = prev.find(m => m.userId === userId);
      if (exists) return prev.filter(m => m.userId !== userId);
      return [...prev, { userId, role: "editor" }];
    });
  };

  const setMemberRole = (userId, role) => {
    setSelectedMembers(prev =>
      prev.map(m => m.userId === userId ? { ...m, role } : m)
    );
  };

  const saveMembersStep = async () => {
    if (selectedMembers.length === 0) {
      setMembersStep(null);
      setSelectedMembers([]);
      return;
    }

    setAddingMembers(true);
    setMembersError("");
    try {
      await Promise.all(
        selectedMembers.map(m =>
          addMember({
            project: membersStep.projectId,
            user: m.userId,
            role: m.role,
          })
        )
      );
      showToast(`${selectedMembers.length} miembro(s) agregado(s) al proyecto.`, "success");
      setMembersStep(null);
      setSelectedMembers([]);
    } catch (e) {
      setMembersError(
        e?.data?.detail ||
        e?.data?.non_field_errors?.[0] ||
        "Error al agregar algunos miembros."
      );
    }
    setAddingMembers(false);
  };

  const deleteProject = async (id) => {
    try {
      await deleteProjectRequest(id);
      setProjects(p => p.filter(x => x.id !== id));
      setDeleteConfirm(null);
      showToast("Proyecto eliminado.", "success");
    } catch (e) {
      setError(e?.data?.detail || "Error al eliminar el proyecto");
      setDeleteConfirm(null);
    }
  };

  const STATUS_LABEL = { active: "Activo", archived: "Archivado", inactive: "Inactivo" };
  const STATUS_COLOR = { active: "#22c55e", archived: "#f59e0b", inactive: "#6b7280" };
  const ROLE_LABEL = { editor: "Editor", observer: "Observador", owner: "Propietario" };

  // ← CAMBIO: maneja tanto "2025-06-01" como "2025-06-01T00:00:00Z"
  const formatDate = (d) => {
    if (!d) return null;
    const date = new Date(d.includes("T") ? d : d + "T00:00:00");
    if (isNaN(date)) return null;
    return date.toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Proyectos</h1>
        <button className="btn btn-primary" onClick={openNew}>+ Nuevo proyecto</button>
      </div>

      <div className="page-body">
        {error && <Alert>{error}</Alert>}

        {loading ? (
          <div style={{ textAlign: "center", padding: "48px" }}><Spinner /></div>
        ) : projects.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📁</div>
            <p className="empty-text">No tienes proyectos aún. ¡Crea el primero!</p>
          </div>
        ) : (
          <div className="projects-grid">
            {projects.map(p => {
              // ← CAMBIO: maneja tanto "2025-06-01" como "2025-06-01T00:00:00Z"
              const isOverdue = p.due_date && p.status === "active" &&
                new Date(p.due_date.includes("T") ? p.due_date : p.due_date + "T23:59:59") < new Date();
              return (
                <div key={p.id} className="card project-card">
                  <div className="project-name">{p.name}</div>
                  <p className="project-desc">{p.description || "Sin descripción"}</p>
                  <div className="project-meta">
                    <span
                      className="badge"
                      style={{ color: STATUS_COLOR[p.status], background: `${STATUS_COLOR[p.status]}22` }}
                    >
                      {STATUS_LABEL[p.status] || p.status}
                    </span>
                    {(p.start_date || p.due_date) && (
                      <span style={{ fontSize: "12px", color: isOverdue ? "#ef4444" : "var(--muted)", marginTop: "4px", display: "block" }}>
                        {isOverdue ? "⚠️" : "📅"} {formatDate(p.start_date) || "—"} → {formatDate(p.due_date) || "Sin límite"}
                        {isOverdue && <span style={{ marginLeft: "4px", fontWeight: 600 }}>· Vencido</span>}
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "8px", marginTop: "14px" }}>
                    <button className="btn btn-primary btn-sm" onClick={() => onSelectProject(p)}>Abrir</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}>Editar</button>
                    <button className="btn btn-danger btn-sm" onClick={() => setDeleteConfirm(p)}>Eliminar</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {modal && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal">
            <h2 className="modal-title">{modal === "new" ? "Nuevo proyecto" : "Editar proyecto"}</h2>
            {formError && <Alert>{formError}</Alert>}
            <form onSubmit={saveProject}>
              <div className="field">
                <label className="label">Nombre</label>
                <input
                  className="input"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  autoFocus
                />
              </div>
              <div className="field">
                <label className="label">Descripción</label>
                <textarea
                  className="textarea"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="field">
                <label className="label">Estado</label>
                <select
                  className="select"
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value })}
                >
                  <option value="active">Activo</option>
                  <option value="archived">Archivado</option>
                  <option value="inactive">Inactivo</option>
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="field">
                  <label className="label">Fecha de inicio</label>
                  <input
                    className="input"
                    type="date"
                    value={form.start_date}
                    onChange={e => setForm({ ...form, start_date: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label className="label">Fecha límite</label>
                  <input
                    className="input"
                    type="date"
                    value={form.due_date}
                    onChange={e => setForm({ ...form, due_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setModal(null)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <Spinner /> : modal === "new" ? "Crear y agregar miembros →" : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {membersStep && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setMembersStep(null)}>
          <div className="modal" style={{ maxWidth: "500px" }}>
            <h2 className="modal-title">Agregar miembros</h2>
            <p style={{ fontSize: "13px", color: "var(--muted)", marginBottom: "16px" }}>
              Proyecto: <strong style={{ color: "var(--text)" }}>{membersStep.projectName}</strong>
              <br />Selecciona los usuarios que tendrán acceso a este proyecto. Puedes saltarte este paso y agregar miembros después.
            </p>

            {membersError && <Alert type="error">{membersError}</Alert>}

            {membersLoading ? (
              <div style={{ textAlign: "center", padding: "24px" }}><Spinner /></div>
            ) : allUsers.length === 0 ? (
              <p style={{ fontSize: "13px", color: "var(--muted)", textAlign: "center", padding: "16px" }}>
                No hay otros usuarios registrados en el sistema.
              </p>
            ) : (
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 16px 0", display: "flex", flexDirection: "column", gap: "8px", maxHeight: "300px", overflowY: "auto" }}>
                {allUsers.map(u => {
                  const selected = selectedMembers.find(m => m.userId === u.id);
                  return (
                    <li
                      key={u.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "8px 10px",
                        borderRadius: "8px",
                        background: selected ? "var(--surface-2, #f0f9ff)" : "var(--surface)",
                        border: `1px solid ${selected ? "var(--primary, #01696f)" : "var(--border)"}`,
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                      onClick={() => toggleMember(u.id)}
                    >
                      <div className="avatar" style={{ flexShrink: 0 }}>
                        {u.username?.[0]?.toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500, fontSize: "14px" }}>{u.username}</div>
                        <div style={{ fontSize: "12px", color: "var(--muted)" }}>{u.email}</div>
                      </div>
                      {selected && (
                        <select
                          className="select"
                          style={{ width: "auto", fontSize: "12px", padding: "4px 8px" }}
                          value={selected.role}
                          onChange={e => { e.stopPropagation(); setMemberRole(u.id, e.target.value); }}
                          onClick={e => e.stopPropagation()}
                        >
                          <option value="editor">Editor</option>
                          <option value="observer">Observador</option>
                          <option value="owner">Propietario</option>
                        </select>
                      )}
                      <input
                        type="checkbox"
                        readOnly
                        checked={!!selected}
                        style={{ width: "16px", height: "16px", flexShrink: 0, accentColor: "var(--primary, #01696f)" }}
                      />
                    </li>
                  );
                })}
              </ul>
            )}

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => { setMembersStep(null); setSelectedMembers([]); }}
              >
                Omitir
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={saveMembersStep}
                disabled={addingMembers}
              >
                {addingMembers
                  ? <Spinner />
                  : selectedMembers.length > 0
                    ? `Agregar ${selectedMembers.length} miembro(s)`
                    : "Finalizar"
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setDeleteConfirm(null)}>
          <div className="modal" style={{ maxWidth: "400px" }}>
            <h2 className="modal-title">¿Eliminar proyecto?</h2>
            <p style={{ fontSize: "13px", color: "var(--muted)", marginBottom: "20px" }}>
              Se eliminará <strong style={{ color: "var(--text)" }}>{deleteConfirm.name}</strong> y todas sus tareas. Esta acción no se puede deshacer.
            </p>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancelar</button>
              <button className="btn btn-danger" onClick={() => deleteProject(deleteConfirm.id)}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}