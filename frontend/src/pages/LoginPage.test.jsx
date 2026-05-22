import { describe, it, vi } from "vitest";
import { render, fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import LoginPage from "./LoginPage";
import * as authService from "../api/authService";
import { AuthProvider } from "../context/AuthContext";
import { BrowserRouter } from "react-router-dom";

const mockNavegacion = vi.fn();
vi.mock("react-router-dom", async () => {
	const actual = await vi.importActual("react-router-dom");
	return {
		...actual,
		useNavigate: () => mockNavegacion,
	};
});

describe("Flujo principal del logeo", () => {
	let component;
	beforeEach(() => {
		component = render(
			<BrowserRouter>
				<AuthProvider>
					<LoginPage></LoginPage>
				</AuthProvider>
			</BrowserRouter>,
		);
	});

	it("Probar la conexion con la API", async () => {
		const botonProbarApi = component.getByText("Probar conexión API");

		fireEvent.click(botonProbarApi);

		await screen.findByText("API conectada correctamente");
	});

	it("Intentar iniciar sesion sin ingresar credenciales", async () => {
		const botonEntrar = component.getByText("Entrar");

		fireEvent.click(botonEntrar);

		await screen.findByText("Error de validacion");
	});

	it("Intentar iniciar sesion con credenciales invalidas", async () => {
		vi.spyOn(authService, "login").mockRejectedValue({
			message: "No active account found with the given credentials",
		});

		const username = screen.getByLabelText("Usuario");
		const password = screen.getByLabelText("Contraseña");
		const botonEntrar = component.getByText("Entrar");

		await userEvent.type(username, "pepito");
		await userEvent.type(password, "00000");

		fireEvent.click(botonEntrar);

		await screen.findByText(
			"No active account found with the given credentials",
		);
	});

	it("Intentar iniciar sesion con credenciales validas", async () => {
		vi.spyOn(authService, "login").mockResolvedValue();

		const username = screen.getByLabelText("Usuario");
		const password = screen.getByLabelText("Contraseña");
		const botonEntrar = component.getByText("Entrar");

		await userEvent.type(username, "admin");
		await userEvent.type(password, "1234");

		await userEvent.click(botonEntrar);

		expect(authService.login).toHaveBeenCalledWith("admin", "1234");

		expect(mockNavegacion).toHaveBeenCalledWith("/", { replace: true });
	});
});
