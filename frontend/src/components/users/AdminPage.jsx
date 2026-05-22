import { useEffect, useState } from "react";
import { getUsers, createUser, toggleUserActive } from "../../api/api";
import Alert from "../common/Alert";
import Spinner from "../common/Spinner";

const EMPTY_FORM = { username: "", email: "", password: "", role: "member" };

export default function AdminPage() {
  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [success, setSuccess]     = useState("");
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const fetchUsers = async () => {
        setLoading(true);
        setError("");
        try {
            const data = await getUsers();
                if (!cancelled) {
                    setUsers(Array.isArray(data) ? data : data?.results ?? []);
            }
        } catch {
            if (!cancelled) setError("No se pudieron cargar los usuarios.");
        } finally {
            if (!cancelled) setLoading(false);
        }
    };

    fetchUsers();
    return () => { cancelled = true; };
}, []);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      const newUser = await createUser(form);
      setUsers((prev) => [...prev, newUser]);
      setForm(EMPTY_FORM);
      setShowForm(false);
      setSuccess("Usuario creado correctamente.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      const d = e?.data;
      setFormError(
        d?.username?.[0] || d?.email?.[0] || d?.password?.[0] ||
        d?.detail || "Error al crear el usuario."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (user) => {
    try {
      const updated = await toggleUserActive(user.id);
      setUsers((prev) =>
        prev.map((u) => u.id === updated.id ? { ...u, is_active: updated.is_active } : u)
      );
    } catch {
      setError("No se pudo cambiar el estado del usuario.");
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Panel de administración</h1>
          <p style={{ color: "var(--muted)", marginTop: "6px" }}>
            Gestión de usuarios del sistema.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => { setShowForm(true); setFormError(""); }}
        >
          + Nuevo usuario
        </button>
      </div>

      <div className="page-body">
        {error   && <Alert type="error">{error}</Alert>}
        {success && <Alert type="success">{success}</Alert>}

        {showForm && (
          <div style={{
            background: "var(--card)", border: "1px solid var(--border)",
            borderRadius: "14px", padding: "20px", marginBottom: "22px"
          }}>
            <h2 style={{ fontSize: "16px", marginBottom: "14px" }}>Crear usuario</h2>
            {formError && <Alert type="error">{formError}</Alert>}
            <form onSubmit={handleCreate}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="field">
                  <label className="label">Usuario</label>
                  <input className="input" name="username" value={form.username}
                    onChange={handleChange} required />
                </div>
                <div className="field">
                  <label className="label">Correo</label>
                  <input className="input" name="email" type="email" value={form.email}
                    onChange={handleChange} required />
                </div>
                <div className="field">
                  <label className="label">Contraseña</label>
                  <input className="input" name="password" type="password" value={form.password}
                    onChange={handleChange} required />
                </div>
                <div className="field">
                  <label className="label">Rol</label>
                  <select className="input" name="role" value={form.role} onChange={handleChange}>
                    <option value="member">Miembro</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px", marginTop: "14px" }}>
                <button className="btn btn-primary" disabled={saving}>
                  {saving ? <Spinner /> : "Crear"}
                </button>
                <button type="button" className="btn btn-ghost"
                  onClick={() => { setShowForm(false); setFormError(""); }}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? <Spinner /> : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {users.map((u) => (
              <div key={u.id} style={{
                background: "var(--card)", border: "1px solid var(--border)",
                borderRadius: "12px", padding: "16px",
                display: "flex", alignItems: "center", justifyContent: "space-between"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{
                    width: "40px", height: "40px", borderRadius: "50%",
                    background: u.is_active ? "var(--primary)" : "var(--muted)",
                    color: "#fff", display: "flex", alignItems: "center",
                    justifyContent: "center", fontWeight: "700", fontSize: "16px"
                  }}>
                    {u.username?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: "600" }}>{u.username}</div>
                    <div style={{ fontSize: "13px", color: "var(--muted)" }}>{u.email}</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span className="badge">{u.role}</span>
                  <span style={{
                    fontSize: "12px", padding: "3px 10px", borderRadius: "20px",
                    background: u.is_active ? "#d1fae5" : "#fee2e2",
                    color: u.is_active ? "#065f46" : "#991b1b"
                  }}>
                    {u.is_active ? "Activo" : "Inactivo"}
                  </span>
                  <button
                    className="btn btn-ghost"
                    style={{ fontSize: "13px" }}
                    onClick={() => handleToggle(u)}
                  >
                    {u.is_active ? "Desactivar" : "Activar"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}