import ResourceCrudPage from "../components/ResourceCrudPage.jsx";
import { productoApi } from "../api/crudService.js";

function ProductosPage() {
  return (
    <ResourceCrudPage
      service={productoApi}
      title="Productos"
      emptyTableMessage="No hay productos registrados."
    />
  );
}

export default ProductosPage;
