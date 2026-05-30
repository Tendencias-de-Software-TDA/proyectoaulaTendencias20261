import { useEffect, useState } from "react";
import { getMembers, addMember, updateMember, removeMember, getUsers } from "../../api/api";
import Spinner from "../common/Spinner";
import Alert from "../common/Alert";

const ROLE_LABEL = { owner: "Propietario", editor: "Editor", observer: "Observador" };
const ROLE_COLOR = { owner: "#f59e0b", editor: "#22c55e", observer: "#6b7280" };

export default function MembersModal({ project, user, onClose }) {
  const [memberships, setMemberships] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addForm, setAddForm] = useState({ user: "", role: "editor" });
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");

  const isOwnerOrAdmin = user?.is_admin ||
    memberships.some(m => m.user === user?.id && m.role === "owner");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const [mems, users] = await Promise.all([
          getMembers(project.id),
          getUsers(),
        ]);
        if (!cancelled) {
          setMemberships(Array.isArray(mems) ? mems : mems?.results ?? []);
          setAllUsers(Array.isArray(users) ? users : users?.results ?? []);
        }
      } catch {
        if (!cancelled) setError("No se pudieron cargar los miembros.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [project.id]);

  const memberIds = memberships.map(m => m.user);
  const availableUsers = allUsers.filter(u => !memberIds.includes(u.id));

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!addForm.user) { setAddError("Selecciona un usuario."); return; }
    setAdding(true);
    setAddError("");
    try {
      const created = await addMember({
        project: project.id,
        user: addForm.user,
        role: addForm.role,
      });
      setMemberships(prev => [...prev, created]);
      setAddForm({ user: "", role: "editor" });
    } catch (e) {
      setAddError(e?.data?.detail || e?.data?.non_field_errors?.[0] || "Error al agregar miembro.");
    }
    setAdding(false);
  };

  const handleRoleChange = async (membershipId, newRole) => {
    try {
      const updated = await updateMember(membershipId, { role: newRole });
      setMemberships(prev => prev.map(m => m.id === membershipId ? updated : m));
    } catch {
      setError("No se pudo cambiar el rol.");
    }
  };

  const handleRemove = async (membershipId) => {
    try {
      await removeMember(membershipId);
      setMemberships(prev => prev.filter(m => m.id !== membershipId));
    } catch {
      setError("No se pudo eliminar el miembro.");
    }
  };

  const getUsername = (userId) => allUsers.find(u => u.id === userId)?.username || "Usuario";

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: "500px" }}>
        <h2 className="modal-title">Miembros del proyecto</h2>

        {error && <Alert type="error">{error}</Alert>}

        {loading ? (
          <div style={{ textAlign: "center", padding: "24px" }}><Spinner /></div>
        ) : (
          <>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 20px 0", display: "flex", flexDirection: "column", gap: "8px" }}>
              {memberships.map(m => {
                const isMe = m.user === user?.id;
                const isThisOwner = m.role === "owner";
                const canModify = isOwnerOrAdmin && !isMe;
                return (
                  <li key={m.id} className="member-row" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div className="avatar">{getUsername(m.user)?.[0]?.toUpperCase()}</div>
                    <div className="member-info" style={{ flex: 1 }}>
                      <div className="member-name">
                        {getUsername(m.user)} {isMe && <span style={{ color: "var(--muted)", fontWeight: 400, fontSize: "12px" }}>(tú)</span>}
                      </div>
                      <div style={{ fontSize: "12px", color: ROLE_COLOR[m.role], fontWeight: 600 }}>
                        {ROLE_LABEL[m.role]}
                      </div>
                    </div>
                    {canModify && (
                      <>
                        <select
                          className="select"
                          style={{ width: "auto", fontSize: "12px", padding: "4px 8px" }}
                          value={m.role}
                          onChange={e => handleRoleChange(m.id, e.target.value)}
                          disabled={isThisOwner}
                        >
                          <option value="owner">Propietario</option>
                          <option value="editor">Editor</option>
                          <option value="observer">Observador</option>
                        </select>
                        {!isThisOwner && (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleRemove(m.id)}
                            title="Eliminar miembro"
                          >✕</button>
                        )}
                      </>
                    )}
                  </li>
                );
              })}
            </ul>

            {isOwnerOrAdmin && availableUsers.length > 0 && (
              <form onSubmit={handleAdd} style={{ borderTop: "1px solid var(--border)", paddingTop: "16px" }}>
                <p style={{ fontSize: "13px", fontWeight: 600, marginBottom: "10px" }}>Agregar miembro</p>
                {addError && <Alert type="error">{addError}</Alert>}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "8px", alignItems: "end" }}>
                  <div className="field" style={{ margin: 0 }}>
                    <label className="label">Usuario</label>
                    <select
                      className="select"
                      value={addForm.user}
                      onChange={e => setAddForm({ ...addForm, user: e.target.value })}
                    >
                      <option value="">Seleccionar...</option>
                      {availableUsers.map(u => (
                        <option key={u.id} value={u.id}>{u.username}</option>
                      ))}
                    </select>
                  </div>
                  <div className="field" style={{ margin: 0 }}>
                    <label className="label">Rol</label>
                    <select
                      className="select"
                      value={addForm.role}
                      onChange={e => setAddForm({ ...addForm, role: e.target.value })}
                    >
                      <option value="editor">Editor</option>
                      <option value="observer">Observador</option>
                      <option value="owner">Propietario</option>
                    </select>
                  </div>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={adding}>
                    {adding ? <Spinner /> : "Agregar"}
                  </button>
                </div>
              </form>
            )}
          </>
        )}

        <div className="modal-footer" style={{ marginTop: "16px" }}>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}