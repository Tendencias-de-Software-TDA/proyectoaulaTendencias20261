import { render, screen } from '@testing-library/react'

import NotFoundPage from './NotFoundPage'
import { BrowserRouter } from "react-router-dom";

it("Comprobar renderizado del componente", () => {
  render(<BrowserRouter><NotFoundPage></NotFoundPage></BrowserRouter>)
  expect(screen.getByText("Página no encontrada")).toBeInTheDocument()
})