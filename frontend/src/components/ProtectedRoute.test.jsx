import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { vi } from "vitest";
import * as authHook from "../context/useAuth.js";

import ProtectedRoute from "./ProtectedRoute";

describe("ProtectedRoute", () => {

  it("redirige a login si no está autenticado", () => {
    vi.spyOn(authHook, "useAuth").mockReturnValue({
      isAuthenticated: false,
    });

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div>Dashboard</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });

  it("renderiza children si está autenticado", () => {
    vi.spyOn(authHook, "useAuth").mockReturnValue({
      isAuthenticated: true,
    });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Contenido privado</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText("Contenido privado")).toBeInTheDocument();
  });

  it("permite acceso a ruta protegida si está autenticado", () => {
    vi.spyOn(authHook, "useAuth").mockReturnValue({
      isAuthenticated: true,
    });

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div>Dashboard Privado</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Dashboard Privado")).toBeInTheDocument();
  });

  
  it("no renderiza children si no está autenticado", () => {
    vi.spyOn(authHook, "useAuth").mockReturnValue({
      isAuthenticated: false,
    });

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div>Dashboard Privado</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.queryByText("Dashboard Privado")).not.toBeInTheDocument();
  });

});