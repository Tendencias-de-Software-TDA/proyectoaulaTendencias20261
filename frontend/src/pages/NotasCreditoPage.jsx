import ResourceCrudPage from "../components/ResourceCrudPage.jsx";
import { notaCreditoApi } from "../api/crudService.js";

function NotasCreditoPage() {
  return (
    <ResourceCrudPage
      service={notaCreditoApi}
      title="Notas crédito"
      subtitle="Registra notas crédito sobre facturas pagadas (devolución, descuento posterior o corrección). El monto se asocia a la factura y aumenta el saldo pendiente del cliente."
      emptyTableMessage="No hay notas crédito registradas."
      hideCreateButton={false}
      createFields={["factura", "motivo", "monto", "fecha", "observaciones"]}
    />
  );
}

export default NotasCreditoPage;
