import ResourceCrudPage from "../components/ResourceCrudPage.jsx";
import { productoApi } from "../api/crudService.js";

function ProductosPage() {
  return (
    <ResourceCrudPage
      service={productoApi}
      title="Productos"
      subtitle="Gestiona tu inventario de productos. Agrega nuevos productos, actualiza precios y mantén el control de lo que tienes disponible."
      emptyTableMessage="No hay productos registrados."
    />
  );
}

export default ProductosPage;
