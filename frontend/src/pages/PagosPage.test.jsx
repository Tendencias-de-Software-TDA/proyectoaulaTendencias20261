import { render, screen } from '@testing-library/react'

import PagosPage from './PagosPage'


it("Comprobar renderizado del componente", () => {
  render(<PagosPage></PagosPage>)
  expect(screen.getByText("Pagos")).toBeInTheDocument()
})