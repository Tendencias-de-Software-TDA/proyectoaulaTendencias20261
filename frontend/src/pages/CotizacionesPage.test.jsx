import { render, screen } from '@testing-library/react'

import CotizacionesPage from './CotizacionesPage'

it("Comprobar renderizado del componente", () => {
  render(<CotizacionesPage></CotizacionesPage>)

  expect(screen.getByText("Cotizaciones")).toBeInTheDocument()
})