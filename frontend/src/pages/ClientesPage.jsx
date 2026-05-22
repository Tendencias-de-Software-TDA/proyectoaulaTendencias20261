import ResourceCrudPage from "../components/ResourceCrudPage.jsx";
import { clienteApi } from "../api/crudService.js";

function ClientesPage() {
  return (
    <ResourceCrudPage
      service={clienteApi}
      title="Clientes"
      subtitle="Administra la información de tus clientes. Crea, edita y consulta sus datos"
      emptyTableMessage="No hay clientes registrados."
    />
  );
}

export default ClientesPage;
