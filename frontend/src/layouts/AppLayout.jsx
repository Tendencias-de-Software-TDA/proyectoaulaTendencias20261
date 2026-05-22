import { Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth.js";
import Navbar from "../components/Navbar.jsx";

function AppLayout() {
  const { logout } = useAuth();

  return (
    <div className="app-layout">
      <Navbar onLogout={logout} />
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;
