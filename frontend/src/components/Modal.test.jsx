import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import userEvent from "@testing-library/user-event";

import Modal from "./Modal";

it("no renderiza cuando open es false", () => {
  render(
    <Modal open={false} onClose={vi.fn()}>
      Contenido
    </Modal>
  );

  expect(screen.queryByText("Contenido")).not.toBeInTheDocument();
});

it("renderiza cuando open es true", () => {
  render(
    <Modal open={true} onClose={vi.fn()}>
      Contenido
    </Modal>
  );

  expect(screen.getByText("Contenido")).toBeInTheDocument();
});

it("muestra el título", () => {
  render(
    <Modal open={true} title="Mi modal" onClose={vi.fn()}>
      Contenido
    </Modal>
  );

  expect(screen.getByText("Mi modal")).toBeInTheDocument();
});


it("llama onClose al hacer click en cerrar", async () => {
  const mockClose = vi.fn();

  render(
    <Modal open={true} onClose={mockClose}>
      Contenido
    </Modal>
  );

  await userEvent.click(screen.getByLabelText(/cerrar/i));

  expect(mockClose).toHaveBeenCalled();
});

it("cierra con la tecla Escape", () => {
  const mockClose = vi.fn();

  render(
    <Modal open={true} onClose={mockClose}>
      Contenido
    </Modal>
  );

  window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));

  expect(mockClose).toHaveBeenCalled();
});

it("cierra al hacer click en el backdrop", async () => {
  const mockClose = vi.fn();

  render(
    <Modal open={true} onClose={mockClose}>
      Contenido
    </Modal>
  );

  const backdrop = screen.getByRole("presentation");

  await userEvent.click(backdrop);

  expect(mockClose).toHaveBeenCalled();
});

it("no cierra al hacer click dentro del modal", async () => {
  const mockClose = vi.fn();

  render(
    <Modal open={true} onClose={mockClose}>
      <div>Contenido interno</div>
    </Modal>
  );

  await userEvent.click(screen.getByText("Contenido interno"));

  expect(mockClose).not.toHaveBeenCalled();
});

it("renderiza el footer si se pasa", () => {
  render(
    <Modal
      open={true}
      onClose={vi.fn()}
      footer={<button>Guardar</button>}
    >
      Contenido
    </Modal>
  );

  expect(screen.getByText("Guardar")).toBeInTheDocument();
});