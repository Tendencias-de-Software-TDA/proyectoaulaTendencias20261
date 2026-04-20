import ResourceCrudPage from "../components/ResourceCrudPage.jsx";
import { clienteApi } from "../api/crudService.js";

function ClientesPage() {
  return (
    <ResourceCrudPage
      service={clienteApi}
      title="Clientes"
      emptyTableMessage="No hay clientes registrados."
    />
  );
}

export default ClientesPage;
