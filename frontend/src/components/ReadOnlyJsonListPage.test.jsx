import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";

import ReadOnlyJsonListPage from "./ReadOnlyJsonListPage";


vi.mock("../utils/apiMessages.js", () => ({
  messageFromApiError: () => "Error controlado",
}));

describe("ReadOnlyJsonListPage", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });


  it("muestra loading inicialmente", () => {
    render(
      <ReadOnlyJsonListPage
        title="Test"
        fetchList={() => new Promise(() => {})} 
        loadingMessage="Cargando..."
      />
    );

    expect(screen.getByText("Cargando...")).toBeInTheDocument();
  });


  it("muestra los datos cuando la API responde", async () => {
    const mockData = [{ id: 1, nombre: "Juan" }];
    const mockFetch = vi.fn().mockResolvedValue(mockData);

    render(
      <ReadOnlyJsonListPage
        title="Test"
        fetchList={mockFetch}
      />
    );

    expect(await screen.findByText(/Juan/)).toBeInTheDocument();
  });


  it("muestra mensaje vacío cuando no hay datos", async () => {
    const mockFetch = vi.fn().mockResolvedValue([]);

    render(
      <ReadOnlyJsonListPage
        title="Test"
        fetchList={mockFetch}
        emptyMessage="No hay datos"
      />
    );

    expect(await screen.findByText("No hay datos")).toBeInTheDocument();
  });


  it("muestra error cuando falla la API", async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error("Error API"));

    render(
      <ReadOnlyJsonListPage
        title="Test"
        fetchList={mockFetch}
      />
    );

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Error controlado")).toBeInTheDocument();
  });


  it("llama a fetchList al montar", async () => {
    const mockFetch = vi.fn().mockResolvedValue([]);

    render(
      <ReadOnlyJsonListPage
        title="Test"
        fetchList={mockFetch}
        emptyMessage="No hay datos"
      />
    );

    await screen.findByText("No hay datos");

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });


  it("soporta respuesta con results", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      results: [{ id: 1, nombre: "Ana" }],
    });

    render(
      <ReadOnlyJsonListPage
        title="Test"
        fetchList={mockFetch}
      />
    );

    expect(await screen.findByText(/Ana/)).toBeInTheDocument();
  });
});