import { render, screen } from '@testing-library/react'
import DashboardPage from './DashboardPage'

it("Renderiza el componente Dashboard", () => {
  render(<DashboardPage />)

  expect(screen.getByText("Cargando indicadores…")).toBeInTheDocument()
})