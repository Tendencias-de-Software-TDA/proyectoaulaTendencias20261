import ResourceCrudPage from "../components/ResourceCrudPage.jsx";
import { pagoApi } from "../api/crudService.js";

function PagosPage() {
  return (
    <ResourceCrudPage
      service={pagoApi}
      title="Pagos"
      emptyTableMessage="No hay pagos registrados."
    />
  );
}

export default PagosPage;
