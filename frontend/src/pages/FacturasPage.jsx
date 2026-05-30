import ResourceCrudPage from "../components/ResourceCrudPage.jsx";
import { facturaApi } from "../api/crudService.js";
import { downloadFacturaPdf } from "../utils/invoicePdf.js";

function FacturasPage() {
  return (
    <ResourceCrudPage
      service={facturaApi}
      title="Facturas"
      subtitle="Genera y consulta facturas a partir de cotizaciones. Lleva el control de pagos, estados y saldos pendientes de tus clientes. Editar permite cambiar la fecha de vencimiento; si escribes un motivo de anulación, se ejecuta la acción 'anular' en la API (no aplica si la factura ya está anulada)."
      emptyTableMessage="No hay facturas registradas."
      hideCreateButton={false}
      createFields={["cotizacion_id"]}
      editFields={["fecha_vencimiento", "motivo_anulacion"]}
      onCreate={async (payload) => {
        const id = Number(payload?.cotizacion_id);
        if (!id || Number.isNaN(id)) {
          throw new Error("Ingrese un ID de cotización válido.");
        }
        await facturaApi.convertirDesdeCotizacion(id);
      }}
      onUpdate={async (id, payload, row = {}) => {
        const fechaVenc = payload?.fecha_vencimiento;

        /** Motivo nuevo: solo se usa para llamar `anular`; no va en PATCH (read-only en DRF). */
        const motivo = String(payload?.motivo_anulacion ?? "").trim();
        const estado = String(row?.estado ?? "");
        const yaAnulada = estado === "anulada";

        const patchBody = {};
        if (fechaVenc != null && String(fechaVenc).trim() !== "") {
          patchBody.fecha_vencimiento = fechaVenc;
        }

        if (Object.keys(patchBody).length > 0) {
          await facturaApi.update(id, patchBody);
        }

        if (motivo.length > 0 && !yaAnulada) {
          await facturaApi.anular(id, motivo);
        }

        if (Object.keys(patchBody).length === 0 && (motivo.length === 0 || yaAnulada)) {
          throw new Error(
            yaAnulada
              ? "Indique una nueva fecha de vencimiento si desea actualizar la factura anulada."
              : "Indique fecha de vencimiento o un motivo de anulación para aplicar cambios.",
          );
        }
      }}
      extraRowActions={(row) => (
        <button
          type="button"
          className="btn--link"
          onClick={async () => {
            try {
              await downloadFacturaPdf(row);
            } catch (err) {
              // Fallback simple para que el usuario no quede “sin respuesta”.
              // eslint-disable-next-line no-alert
              alert(err?.message || "No se pudo generar el PDF.");
              // eslint-disable-next-line no-console
              console.error(err);
            }
          }}
        >
          PDF
        </button>
      )}
    />
  );
}

export default FacturasPage;
