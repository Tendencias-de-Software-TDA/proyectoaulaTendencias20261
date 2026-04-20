import ResourceCrudPage from "../components/ResourceCrudPage.jsx";
import { facturaApi } from "../api/crudService.js";

function FacturasPage() {
  return (
    <ResourceCrudPage
      service={facturaApi}
      title="Facturas"
      emptyTableMessage="No hay facturas registradas."
      hideCreateButton = {true}
    />
  );
}

export default FacturasPage;
