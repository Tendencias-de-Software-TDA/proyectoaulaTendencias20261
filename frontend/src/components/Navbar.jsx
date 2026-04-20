import { NavLink } from "react-router-dom";
import Button from "./Button.jsx";
import logo from "../assets/logofondo.png";

function navClass({ isActive }) {
  return isActive ? "active" : undefined;
}

function Navbar({ onLogout }) {
  return (
    <header className="app-navbar">
      <div className="app-navbar__brand">
      <img 
       src={logo} 
       className="app-navbar__logo" 
      />
        <span>Panel de ventas</span>
      </div>

      <nav className="app-navbar__links" aria-label="Principal">
        <NavLink to="/" end className={navClass}>
          Dashboard
        </NavLink>
        <NavLink to="/clientes" className={navClass}>
          Clientes
        </NavLink>
        <NavLink to="/productos" className={navClass}>
          Productos
        </NavLink>
        <NavLink to="/cotizaciones" className={navClass}>
          Cotizaciones
        </NavLink>
        <NavLink to="/facturas" className={navClass}>
          Facturas
        </NavLink>
        <NavLink to="/pagos" className={navClass}>
          Pagos
        </NavLink>
        <Button type="button" variant="ghost" size="sm" onClick={onLogout}>
          Cerrar sesión
        </Button>
      </nav>
    </header>
  );
}

export default Navbar;
