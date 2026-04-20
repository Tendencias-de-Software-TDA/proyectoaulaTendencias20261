import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/useAuth.js";
import AppLayout from "./layouts/AppLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import ClientesPage from "./pages/ClientesPage.jsx";
import ProductosPage from "./pages/ProductosPage.jsx";
import CotizacionesPage from "./pages/CotizacionesPage.jsx";
import FacturasPage from "./pages/FacturasPage.jsx";
import PagosPage from "./pages/PagosPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
      />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="clientes" element={<ClientesPage />} />
        <Route path="productos" element={<ProductosPage />} />
        <Route path="cotizaciones" element={<CotizacionesPage />} />
        <Route path="facturas" element={<FacturasPage />} />
        <Route path="pagos" element={<PagosPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
