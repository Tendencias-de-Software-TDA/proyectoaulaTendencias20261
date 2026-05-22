import { describe, it, vi, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

import DashboardPage from "./DashboardPage";

vi.mock("../api/tokenStorage.js", () => ({
  getStoredRole: vi.fn(() => null),
}));

vi.mock("../api/reportService.js", () => ({
  fetchReportesResumen: vi.fn().mockResolvedValue({
    ventas_totales: 1000,
    productos_top: [],
    clientes_top: [],
    tasa_cobro: {
      porcentaje: 50,
      facturas_emitidas: 10,
      facturas_pagadas: 5,
    },
  }),
}));

describe("DashboardPage (Reporte financiero)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("muestra el título Reporte financiero", async () => {
    render(<DashboardPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: /reporte financiero/i }),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.queryByText(/cargando reporte financiero/i),
      ).not.toBeInTheDocument();
    });
  });
});
