import ResourceCrudPage from "../components/ResourceCrudPage.jsx";
import { pagoApi } from "../api/crudService.js";

function PagosPage() {
  return (
    <ResourceCrudPage
      service={pagoApi}
      title="Pagos"
      subtitle="Registra y gestiona los pagos realizados por tus clientes."
      emptyTableMessage="No hay pagos registrados."
    />
  );
}

export default PagosPage;
