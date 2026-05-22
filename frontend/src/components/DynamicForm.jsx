import { useEffect, useState } from "react";
import { isComplexValue } from "../utils/dynamicData.js";
import Button from "./Button.jsx";

function serializeField(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "boolean") return value;
  if (isComplexValue(value)) {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return "";
    }
  }
  return String(value);
}

function getChoiceOptions(metaEntry) {
  if (!metaEntry?.choices || !Array.isArray(metaEntry.choices)) return null;
  const list = metaEntry.choices
    .map((c) => {
      if (c && typeof c === "object" && "value" in c) {
        return {
          value: c.value,
          label: c.display_name ?? c.label ?? String(c.value),
        };
      }
      return null;
    })
    .filter(Boolean);
  return list.length ? list : null;
}

function guessInputKind(key, value, meta) {
  const m = meta?.[key];
  const t = m?.type?.toLowerCase?.() || "";

  /** Campos choice de DRF: lista de valores permitidos (p. ej. activo / inactivo). */
  if (getChoiceOptions(m)) return "choice";

  if (t === "boolean") return "checkbox";
  if (t === "integer" || t === "decimal" || t === "float" || t === "number")
    return "number";

  const lower = key.toLowerCase();
  if (
    lower.includes("fecha") ||
    lower.includes("date") ||
    (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value))
  ) {
    return "date";
  }

  if (typeof value === "boolean") return "checkbox";
  if (typeof value === "number") return "number";
  if (isComplexValue(value)) return "json";

  return "text";
}

function parseOutgoing(key, raw, kind) {
  if (kind === "checkbox") return Boolean(raw);

  if (kind === "number") {
    if (raw === "" || raw === null || raw === undefined) return null;
    const n = Number(raw);
    return Number.isNaN(n) ? raw : n;
  }

  if (kind === "json") {
    const s = typeof raw === "string" ? raw.trim() : "";
    if (s === "") return null;
    try {
      return JSON.parse(s);
    } catch {
      throw new Error(`JSON inválido en «${key}»`);
    }
  }

  if (kind === "date") {
    return raw === "" ? null : raw;
  }

  if (kind === "choice") {
    return raw === "" ? null : raw;
  }

  return raw === "" ? null : raw;
}

function DynamicForm({
  fields,
  fieldMeta,
  mode,
  initialRecord,
  onSubmit,
  onCancel,
  loading,
  submitLabel,
}) {
  const [values, setValues] = useState({});
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    setLocalError("");
    const next = {};
    for (const key of fields) {
      if (mode === "create" && key === "id") continue;
      const source =
        mode === "edit" && initialRecord ? initialRecord[key] : undefined;
      next[key] = serializeField(source);
    }
    setValues(next);
  }, [fields, mode, initialRecord]);

  function setField(key, value) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setLocalError("");
    try {
      const payload = {};
      for (const key of fields) {
        if (mode === "create" && key === "id") continue;

        const raw = values[key];
        const kind = guessInputKind(
          key,
          mode === "edit" && initialRecord ? initialRecord[key] : raw,
          fieldMeta,
        );

        if (kind === "checkbox") {
          payload[key] = Boolean(raw);
          continue;
        }

        if (kind === "choice") {
          const parsed = parseOutgoing(key, raw, kind);
          if (parsed !== null && parsed !== undefined && parsed !== "") {
            payload[key] = parsed;
          } else if (mode === "edit") {
            payload[key] = null;
          }
          continue;
        }

        const parsed = parseOutgoing(key, raw, kind);
        if (parsed !== null && parsed !== undefined && parsed !== "") {
          payload[key] = parsed;
        } else if (kind === "json" && typeof raw === "string" && raw.trim() === "") {
          /* omit */
        } else if (parsed === null && mode === "edit") {
          payload[key] = null;
        }
      }

      if (mode === "create") {
        delete payload.id;
      }

      onSubmit(payload);
    } catch (err) {
      setLocalError(err.message || "No se pudo validar el formulario");
    }
  }

  const labelFor = (key) =>
    key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <form className="dynamic-form" onSubmit={handleSubmit}>
      {fields.map((key) => {
        if (mode === "create" && key === "id") return null;

        const raw = values[key];
        const sample =
          mode === "edit" && initialRecord ? initialRecord[key] : raw;
        const kind = guessInputKind(key, sample, fieldMeta);
        const readOnly = mode === "edit" && key === "id";
        const choiceOptions = getChoiceOptions(fieldMeta?.[key]);

        if (kind === "choice" && choiceOptions) {
          return (
            <label key={key} className="dynamic-form__field">
              <span className="dynamic-form__label">{labelFor(key)}</span>
              <select
                className="dynamic-form__input dynamic-form__select"
                value={
                  raw === true || raw === false
                    ? ""
                    : String(raw ?? "")
                }
                disabled={readOnly || loading}
                onChange={(e) => setField(key, e.target.value)}
              >
                <option value="">— Seleccione —</option>
                {choiceOptions.map((opt) => (
                  <option key={String(opt.value)} value={String(opt.value)}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
          );
        }

        if (kind === "checkbox") {
          return (
            <label key={key} className="dynamic-form__field dynamic-form__check">
              <input
                type="checkbox"
                checked={Boolean(raw)}
                disabled={readOnly || loading}
                onChange={(e) => setField(key, e.target.checked)}
              />
              <span>{labelFor(key)}</span>
            </label>
          );
        }

        if (kind === "json") {
          return (
            <label key={key} className="dynamic-form__field">
              <span className="dynamic-form__label">{labelFor(key)}</span>
              <textarea
                className="dynamic-form__textarea"
                rows={6}
                value={typeof raw === "string" ? raw : String(raw ?? "")}
                disabled={loading}
                onChange={(e) => setField(key, e.target.value)}
                spellCheck={false}
              />
            </label>
          );
        }

        return (
          <label key={key} className="dynamic-form__field">
            <span className="dynamic-form__label">{labelFor(key)}</span>
            <input
              className="dynamic-form__input"
              type={kind === "date" ? "date" : kind === "number" ? "number" : "text"}
              step={kind === "number" ? "any" : undefined}
              value={raw === true || raw === false ? "" : raw ?? ""}
              disabled={readOnly || loading}
              onChange={(e) => setField(key, e.target.value)}
            />
          </label>
        );
      })}

      {localError && (
        <p className="dynamic-form__error" role="alert">
          {localError}
        </p>
      )}

      <div className="dynamic-form__actions">
        <Button type="button" variant="secondary" disabled={loading} onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? "Guardando…" : submitLabel || "Guardar"}
        </Button>
      </div>
    </form>
  );
}

export default DynamicForm;
