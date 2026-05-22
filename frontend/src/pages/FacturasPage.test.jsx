import { render, screen } from '@testing-library/react'

import FacturasPage from './FacturasPage'

it("Comprobar renderizado del componente", () => {
  render(<FacturasPage></FacturasPage>)
  expect(screen.getByText("Facturas")).toBeInTheDocument()
})