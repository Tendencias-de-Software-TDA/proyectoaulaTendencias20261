import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Spinner from "./Spinner";

describe("Spinner", () => {
	it("renderiza el spinner con label por defecto", () => {
		render(<Spinner />);

		// role de accesibilidad
		const status = screen.getByRole("status");
		expect(status).toBeInTheDocument();

		// label por defecto
		expect(screen.getByText("Cargando…")).toBeInTheDocument();
	});

	it("renderiza el spinner con label personalizado", () => {
		render(<Spinner label="Procesando datos" />);

		expect(screen.getByText("Procesando datos")).toBeInTheDocument();
	});

	it("no rompe si label es string vacío", () => {
		render(<Spinner label="" />);

		const status = screen.getByRole("status");

		expect(status).toBeInTheDocument();
		expect(screen.queryByText("Cargando…")).not.toBeInTheDocument();
		expect(screen.queryByText(/spinner__label/i)).not.toBeInTheDocument();
	});

	it("tiene estructura accesible correcta", () => {
		render(<Spinner label="Loading" />);

		const status = screen.getByRole("status");

		expect(status).toHaveAttribute("aria-live", "polite");

		// spinner decorativo
		const spinner = status.querySelector(".spinner");
		expect(spinner).toBeInTheDocument();
		expect(spinner).toHaveAttribute("aria-hidden", "true");
	});
});