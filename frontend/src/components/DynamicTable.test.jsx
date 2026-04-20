import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import userEvent from "@testing-library/user-event";

import DynamicTable from "./DynamicTable";

it("muestra mensaje cuando no hay filas", () => {
  render(
    <DynamicTable
      rows={[]}
      emptyMessage="No hay datos"
    />
  )

  expect(screen.getByText("No hay datos")).toBeInTheDocument()
})

it("renderiza filas y columnas", () => {
  const rows = [
    { id: 1, nombre: "Juan", edad: 30 },
  ]

  render(
    <DynamicTable
      rows={rows}
      columnKeys={["nombre", "edad"]}
    />
  )

  expect(screen.getByText("Juan")).toBeInTheDocument()
  expect(screen.getByText("30")).toBeInTheDocument()
})

it("infiere columnas automáticamente", () => {
  const rows = [
    { id: 1, nombre: "Ana", edad: 25 },
  ]

  render(<DynamicTable rows={rows} />)

  expect(screen.getByText("nombre")).toBeInTheDocument()
  expect(screen.getByText("edad")).toBeInTheDocument()
})

it("llama onEdit al hacer click", async () => {
  const mockEdit = vi.fn()

  const row = { id: 1, nombre: "Carlos" }

  render(
    <DynamicTable
      rows={[row]}
      columnKeys={["nombre"]}
      onEdit={mockEdit}
      onDelete={vi.fn()}
    />
  )

  await userEvent.click(screen.getByText("Editar"))

  expect(mockEdit).toHaveBeenCalledWith(row)
})

it("llama onDelete al hacer click", async () => {
  const mockDelete = vi.fn()

  const row = { id: 1, nombre: "Carlos" }

  render(
    <DynamicTable
      rows={[row]}
      columnKeys={["nombre"]}
      onEdit={vi.fn()}
      onDelete={mockDelete}
    />
  )

  await userEvent.click(screen.getByText("Eliminar"))

  expect(mockDelete).toHaveBeenCalledWith(row)
})

it("muestra botones de acciones", () => {
  const rows = [{ id: 1, nombre: "Test" }]

  render(
    <DynamicTable
      rows={rows}
      columnKeys={["nombre"]}
    />
  )

  expect(screen.getByText("Editar")).toBeInTheDocument()
  expect(screen.getByText("Eliminar")).toBeInTheDocument()
})