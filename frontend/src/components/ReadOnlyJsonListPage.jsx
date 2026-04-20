import { useEffect, useRef, useState } from "react";
import { messageFromApiError } from "../utils/apiMessages.js";
import Spinner from "./Spinner.jsx";

/**
 * Vista de solo lectura: GET al endpoint y muestra JSON (comportamiento original
 * del proyecto antes del CRUD genérico).
 */
function ReadOnlyJsonListPage({
  title,
  subtitle,
  cardHeading = "Respuesta del servidor",
  cardDescription = "Datos tal como los entrega Django REST Framework.",
  emptyMessage,
  loadingMessage,
  fetchList,
}) {
  const [data, setData] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const fetchRef = useRef(fetchList);
  fetchRef.current = fetchList;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setError("");
      setLoading(true);
      try {
        const raw = await fetchRef.current();
        const list = Array.isArray(raw) ? raw : raw?.results ?? [];
        if (!cancelled) {
          setData(list);
        }
      } catch (err) {
        if (!cancelled) {
          setError(messageFromApiError(err));
          setData([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="page">
      <header className="page__header">
        <h1 className="page__title">{title}</h1>
        {subtitle && <p className="page__subtitle">{subtitle}</p>}
      </header>

      {error && (
        <div className="alert alert--error" role="alert">
          {error}
        </div>
      )}

      <section className="card">
        <h2 className="card__heading">{cardHeading}</h2>
        <p className="card__body-text card__body-text--mb">{cardDescription}</p>

        {loading ? (
          <div className="card__loading">
            <Spinner label={loadingMessage} />
          </div>
        ) : data.length === 0 && !error ? (
          <p className="empty-state empty-state--tight">{emptyMessage}</p>
        ) : (
          <pre className="raw-json" tabIndex={0}>
            {JSON.stringify(data, null, 2)}
          </pre>
        )}
      </section>
    </div>
  );
}

export default ReadOnlyJsonListPage;
