function Spinner({ label = "Cargando…" }) {
  return (
    <span className="spinner-wrap" role="status" aria-live="polite">
      <span className="spinner" aria-hidden />
      {label && <span className="spinner__label">{label}</span>}
    </span>
  );
}

export default Spinner;
