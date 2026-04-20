import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import Navbar from "./Navbar";

it("renderiza el navbar", () => {
  render(
    <MemoryRouter>
      <Navbar onLogout={vi.fn()} />
    </MemoryRouter>
  );

  expect(screen.getByText("Panel de ventas")).toBeInTheDocument();
});

it("renderiza los links de navegación", () => {
  render(
    <MemoryRouter>
      <Navbar onLogout={vi.fn()} />
    </MemoryRouter>
  );

  expect(screen.getByText("Dashboard")).toBeInTheDocument();
  expect(screen.getByText("Clientes")).toBeInTheDocument();
  expect(screen.getByText("Productos")).toBeInTheDocument();
  expect(screen.getByText("Facturas")).toBeInTheDocument();
});

it("llama onLogout al hacer click", async () => {
  const mockLogout = vi.fn();

  render(
    <MemoryRouter>
      <Navbar onLogout={mockLogout} />
    </MemoryRouter>
  );

  await userEvent.click(screen.getByText(/cerrar sesión/i));

  expect(mockLogout).toHaveBeenCalled();
});

it("los links tienen las rutas correctas", () => {
  render(
    <MemoryRouter>
      <Navbar onLogout={vi.fn()} />
    </MemoryRouter>
  );

  expect(screen.getByText("Clientes").closest("a")).toHaveAttribute("href", "/clientes");
  expect(screen.getByText("Productos").closest("a")).toHaveAttribute("href", "/productos");
});

it("marca el link activo", () => {
  render(
    <MemoryRouter initialEntries={["/clientes"]}>
      <Navbar onLogout={vi.fn()} />
    </MemoryRouter>
  );

  const link = screen.getByText("Clientes");

  expect(link).toHaveClass("active");
});

it("renderiza el logo", () => {
  render(
    <MemoryRouter>
      <Navbar onLogout={vi.fn()} />
    </MemoryRouter>
  );

  const img = screen.getByRole("img");

  expect(img).toBeInTheDocument();
});