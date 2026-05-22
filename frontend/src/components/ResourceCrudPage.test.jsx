import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import ResourceCrudPage from "./ResourceCrudPage";


vi.mock("../utils/dynamicData.js", () => ({
	inferColumnKeys: (rows) =>
		rows?.length ? Object.keys(rows[0]) : ["name"],
}));

vi.mock("../utils/apiMessages.js", () => ({
	messageFromApiError: (err) => err?.message || "Error API",
}));

vi.mock("./Spinner.jsx", () => ({
	default: () => <div data-testid="spinner">loading...</div>,
}));

vi.mock("./DynamicTable.jsx", () => ({
	default: ({ rows, onEdit, onDelete }) => (
		<div>
			<div data-testid="table-length">{rows.length}</div>
			<button onClick={() => onEdit(rows[0] || { id: 1, name: "A" })}>
				edit
			</button>
			<button onClick={() => onDelete(rows[0] || { id: 1 })}>
				delete
			</button>
		</div>
	),
}));

vi.mock("./Modal.jsx", () => ({
	default: ({ open, children, footer }) =>
		open ? (
			<div data-testid="modal">
				{children}
				{footer}
			</div>
		) : null,
}));

vi.mock("./DynamicForm.jsx", () => ({
	default: ({ onSubmit, onCancel }) => (
		<div data-testid="form">
			<button onClick={() => onSubmit({ name: "test" })}>
				submit
			</button>
			<button onClick={onCancel}>cancel</button>
		</div>
	),
}));

vi.mock("./Button.jsx", () => ({
	default: ({ children, onClick }) => (
		<button onClick={onClick}>{children}</button>
	),
}));


const mockService = {
	options: vi.fn(),
	list: vi.fn(),
	create: vi.fn(),
	update: vi.fn(),
	destroy: vi.fn(),
	fieldNamesForAction: vi.fn(() => ["name"]),
	postFieldNamesFromOptions: vi.fn(() => ["name"]),
};

const baseProps = {
	service: mockService,
	title: "Test CRUD",
};


describe("ResourceCrudPage", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("muestra loading inicialmente", async () => {
		mockService.options.mockResolvedValue({
			actions: {},
		});
		mockService.list.mockResolvedValue([]);

		render(<ResourceCrudPage {...baseProps} />);

		expect(screen.getByTestId("spinner")).toBeInTheDocument();
	});

	it("renderiza tabla con datos", async () => {
		mockService.options.mockResolvedValue({
			actions: {},
		});
		mockService.list.mockResolvedValue([{ id: 1, name: "A" }]);

		render(<ResourceCrudPage {...baseProps} />);

		await waitFor(() => {
			expect(screen.getByTestId("table-length")).toHaveTextContent("1");
		});
	});

	it("abre modal de creación", async () => {
		mockService.options.mockResolvedValue({
			actions: {
				POST: { name: {} },
				PATCH: { name: {} },
			},
		});

		mockService.list.mockResolvedValue([]);

		render(<ResourceCrudPage {...baseProps} />);

		fireEvent.click(screen.getByText("Agregar nuevo"));

		await screen.findByTestId("modal");

		expect(screen.getByTestId("form")).toBeInTheDocument();
	});

	it("crea un registro", async () => {
		mockService.options.mockResolvedValue({
			actions: {
				POST: { name: {} },
			},
			PATCH: {},
		});

		mockService.list.mockResolvedValue([]);
		mockService.create.mockResolvedValue({});

		render(<ResourceCrudPage {...baseProps} />);

		fireEvent.click(screen.getByText("Agregar nuevo"));

		await screen.findByTestId("modal");

		fireEvent.click(screen.getByText("submit"));

		await waitFor(() => {
			expect(mockService.create).toHaveBeenCalled();
		});
	});

	it("edita un registro", async () => {
		mockService.options.mockResolvedValue({
			actions: {
				POST: { name: {} },
				PATCH: { name: {} },
			},
		});

		mockService.list.mockResolvedValue([{ id: 1, name: "A" }]);
		mockService.update.mockResolvedValue({});

		render(<ResourceCrudPage {...baseProps} />);

		await screen.findByTestId("table-length");

		fireEvent.click(screen.getByText("edit"));

		await screen.findByTestId("modal");

		fireEvent.click(screen.getByText("submit"));

		await waitFor(() => {
			expect(mockService.update).toHaveBeenCalledWith(
				1,
				expect.objectContaining({ name: "test" }),
			);
		});
	});

	it("elimina un registro", async () => {
		mockService.options.mockResolvedValue({
			actions: {
				POST: {},
				PATCH: {},
			},
		});

		mockService.list.mockResolvedValue([{ id: 1 }]);
		mockService.destroy.mockResolvedValue({});

		render(<ResourceCrudPage {...baseProps} />);

		await screen.findByTestId("table-length");

		fireEvent.click(screen.getByText("delete"));

		await screen.findByTestId("modal");

		fireEvent.click(screen.getByText("Eliminar"));

		await waitFor(() => {
			expect(mockService.destroy).toHaveBeenCalledWith(1);
		});
	});
});