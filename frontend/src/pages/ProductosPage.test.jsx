import { render, screen } from '@testing-library/react'

import ProductosPage from './ProductosPage'


it("Comprobar renderizado del componente", () => {
  render(<ProductosPage></ProductosPage>)
  expect(screen.getByText("Productos")).toBeInTheDocument()
})