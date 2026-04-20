import { render, screen } from '@testing-library/react'

import ClientesPage from './ClientesPage'

it("Comprobar renderizado del componente", () => {
  render(<ClientesPage></ClientesPage>)

  expect(screen.getByText("Clientes")).toBeInTheDocument()
})