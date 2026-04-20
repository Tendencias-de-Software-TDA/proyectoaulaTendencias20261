import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <div className="not-found">
      <div className="not-found__inner card">
        <p className="not-found__code" aria-hidden>
          404
        </p>
        <h1 className="not-found__title">Página no encontrada</h1>
        <p className="not-found__text">
          La ruta que buscas no existe o fue movida. Vuelve al panel para seguir
          trabajando.
        </p>
        <Link className="btn btn--primary" to="/">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;
