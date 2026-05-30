import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { healthCheck } from "../api/authService";
import { useAuth } from "../context/useAuth.js";
import logo from "../assets/logofondo.png";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [healthStatus, setHealthStatus] = useState("");
  const [localError, setLocalError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login, authError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo = location.state?.from?.pathname || "/";

  async function handleHealthCheck() {
    setLocalError("");
    setHealthStatus("Verificando conexión...");
    try {
      const data = await healthCheck();
      setHealthStatus(data.message || "Conexión correcta");
    } catch (error) {
      setHealthStatus("");
      setLocalError(error.message);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLocalError("");
    setIsLoading(true);

    const ok = await login(username, password);
    setIsLoading(false);

    if (ok) {
      navigate(redirectTo, { replace: true });
    }
  }

  const displayError = localError || authError;

  return (
    <div className="login-page">
      <div className="login-card">
        <img
          src={logo}
          alt="Logo empresa"
          className="login-card__brand-logo"
        />
        <h1 className="login-card__title">Inicio de sesión</h1>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <label htmlFor="username">Usuario</label>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            placeholder="Username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
          />

          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          <button className="btn btn--primary" type="submit" disabled={isLoading}>
            {isLoading ? "Ingresando…" : "Entrar"}
          </button>
        </form>

        <div className="login-card__actions">
          <button
            className="btn btn--secondary"
            type="button"
            onClick={handleHealthCheck}
          >
            Probar conexión API
          </button>
          {healthStatus && (
            <p className="login-card__status">{healthStatus}</p>
          )}
          {displayError && (
            <p className="login-card__error" role="alert">
              {displayError}
            </p>
          )}
          <p className="login-card__hint">
            Gestión de inventario · acceso restringido
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
