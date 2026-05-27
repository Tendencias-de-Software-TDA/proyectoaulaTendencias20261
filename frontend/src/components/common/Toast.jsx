import { useEffect } from "react";

export default function Toast({ message, type = "error", onClose, duration = 4000 }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [message, duration, onClose]);

  if (!message) return null;

  const colors = {
    error:   { bg: "#fef2f2", border: "#fca5a5", text: "#b91c1c", icon: "✕" },
    success: { bg: "#f0fdf4", border: "#86efac", text: "#15803d", icon: "✓" },
    info:    { bg: "#eff6ff", border: "#93c5fd", text: "#1d4ed8", icon: "ℹ" },
  };
  const c = colors[type] || colors.error;

  return (
    <div style={{
      position: "fixed", bottom: "24px", right: "24px", zIndex: 9999,
      display: "flex", alignItems: "center", gap: "10px",
      background: c.bg, border: `1px solid ${c.border}`, color: c.text,
      borderRadius: "10px", padding: "12px 16px", maxWidth: "360px",
      boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
      animation: "slideIn 0.2s ease",
    }}>
      <style>{`@keyframes slideIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }`}</style>
      <span style={{ fontWeight: 700, fontSize: "15px" }}>{c.icon}</span>
      <span style={{ fontSize: "13px", flex: 1 }}>{message}</span>
      <button onClick={onClose} style={{
        background: "none", border: "none", cursor: "pointer",
        color: c.text, fontSize: "16px", lineHeight: 1, opacity: 0.6,
      }}>×</button>
    </div>
  );
}