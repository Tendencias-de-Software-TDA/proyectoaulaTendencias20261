import { render, screen } from '@testing-library/react'

import AppLayout from '../layouts/AppLayout'

import { AuthProvider } from "../context/AuthContext";
import { BrowserRouter } from "react-router-dom";


it("Comprobar renderizado del componente", () => {
  render(<BrowserRouter><AuthProvider><AppLayout></AppLayout></AuthProvider></BrowserRouter>)
  expect(screen.getByText("Panel de ventas")).toBeInTheDocument()
})