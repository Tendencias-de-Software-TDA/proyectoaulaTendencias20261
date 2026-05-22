import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import userEvent from "@testing-library/user-event";

import DynamicForm from "./DynamicForm";

it("renderiza los campos del formulario", () => {
	render(
		<DynamicForm
			fields={["username", "password"]}
			mode="create"
			onSubmit={vi.fn()}
			onCancel={vi.fn()}
		/>,
	);

	expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
	expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
});

it("envía datos correctamente", async () => {
  const mockSubmit = vi.fn()

  render(
    <DynamicForm
      fields={["username"]}
      mode="create"
      onSubmit={mockSubmit}
      onCancel={vi.fn()}
    />
  )

  const input = screen.getByLabelText(/username/i)

  await userEvent.type(input, "pepito")
  await userEvent.click(screen.getByRole("button", { name: /guardar/i }))

  expect(mockSubmit).toHaveBeenCalledWith({
    username: "pepito",
  })
})

it("muestra error si JSON es inválido", async () => {
  render(
    <DynamicForm
      fields={["data"]}
      mode="create"
      onSubmit={vi.fn()}
      onCancel={vi.fn()}
      fieldMeta={{ data: { type: "json" } }}
    />
  )

  const textarea = screen.getByRole("textbox")

  await userEvent.paste(textarea, "{mal json")
  await userEvent.click(screen.getByRole("button", { name: /guardar/i }))

  expect(await screen.findByText("Cancelar")).toBeInTheDocument()
})

it("renderiza checkbox para boolean", () => {
  render(
    <DynamicForm
      fields={["activo"]}
      fieldMeta={{ activo: { type: "boolean" } }}
      mode="create"
      onSubmit={vi.fn()}
      onCancel={vi.fn()}
    />
  )

  expect(screen.getByRole("checkbox")).toBeInTheDocument()
})
