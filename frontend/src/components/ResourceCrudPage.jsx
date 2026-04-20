import { useCallback, useEffect, useMemo, useState } from "react";
import { inferColumnKeys } from "../utils/dynamicData.js";
import { messageFromApiError } from "../utils/apiMessages.js";
import Button from "./Button.jsx";
import Modal from "./Modal.jsx";
import DynamicForm from "./DynamicForm.jsx";
import DynamicTable from "./DynamicTable.jsx";
import Spinner from "./Spinner.jsx";

function computeFormFields(
	mode,
	rows,
	optionsPayload,
	editingRow,
	service,
	extraFormFields = [],
) {
	const fromOptions = service.postFieldNamesFromOptions(optionsPayload);
	const fromList = inferColumnKeys(rows).filter((k) => k !== "id");

	const keys = new Set();
	if (mode === "edit" && editingRow && typeof editingRow === "object") {
		Object.keys(editingRow).forEach((k) => keys.add(k));
	}
	fromOptions.forEach((k) => keys.add(k));
	fromList.forEach((k) => keys.add(k));
	extraFormFields.forEach((k) => keys.add(k));

	if (mode === "create") {
		keys.delete("id");
	}

	const list = [...keys];
	list.sort((a, b) => {
		if (a === "id") return -1;
		if (b === "id") return 1;
		return a.localeCompare(b);
	});

	if (mode === "create") {
		return list.filter((k) => k !== "id");
	}
	return list;
}

function ResourceCrudPage({
	service,
	title,
	subtitle,
	emptyTableMessage = "Sin registros.",
	/** Campos extra en formulario (p. ej. `items` en cotización: no siempre vienen en OPTIONS). */
	extraFormFields = [],
	hideCreateButton = false,
}) {
	const [rows, setRows] = useState([]);
	const [loading, setLoading] = useState(true);
	const [optionsPayload, setOptionsPayload] = useState(null);
	const [errorBanner, setErrorBanner] = useState("");
	const [feedback, setFeedback] = useState(null);

	const [formOpen, setFormOpen] = useState(false);
	const [formMode, setFormMode] = useState("create");
	const [editingRow, setEditingRow] = useState(null);
	const [saving, setSaving] = useState(false);

	const [deleteRow, setDeleteRow] = useState(null);
	const [deleteLoading, setDeleteLoading] = useState(false);

	const load = useCallback(async () => {
		setLoading(true);
		setErrorBanner("");
		try {
			const [opt, list] = await Promise.all([
				service.options(),
				service.list(),
			]);
			setOptionsPayload(opt);
			setRows(Array.isArray(list) ? list : []);
		} catch (err) {
			setErrorBanner(messageFromApiError(err));
		} finally {
			setLoading(false);
		}
	}, [service]);

	useEffect(() => {
		load();
	}, [load]);

	useEffect(() => {
		if (!feedback) return undefined;
		const t = setTimeout(() => setFeedback(null), 4500);
		return () => clearTimeout(t);
	}, [feedback]);

	const columnKeys = useMemo(() => inferColumnKeys(rows), [rows]);
	const camposOcultosFormulario = ["factura_numero"];

	const formFields = useMemo(
		() =>
			computeFormFields(
				formMode,
				rows,
				optionsPayload,
				editingRow,
				service,
				extraFormFields,
			).filter((field) => !camposOcultosFormulario.includes(field)),
		[formMode, rows, optionsPayload, editingRow, service, extraFormFields],
	);

	/** POST + PATCH: los choice fields pueden declararse en cualquiera de las dos acciones. */
	const fieldMeta = useMemo(
		() => ({
			...optionsPayload?.actions?.POST,
			...optionsPayload?.actions?.PATCH,
		}),
		[optionsPayload],
	);

	function openCreate() {
		setFormMode("create");
		setEditingRow(null);
		setFormOpen(true);
	}

	function openEdit(row) {
		setFormMode("edit");
		setEditingRow(row);
		setFormOpen(true);
	}

	function closeForm() {
		if (saving) return;
		setFormOpen(false);
		setEditingRow(null);
	}

	async function handleFormSubmit(payload) {
		setSaving(true);
		setErrorBanner("");
		try {
			if (formMode === "create") {
				const postKeys = service.fieldNamesForAction(
					optionsPayload,
					"POST",
				);
				let body = { ...payload };
				if (postKeys?.length) {
					body = Object.fromEntries(
						Object.entries(body).filter(([k]) =>
							postKeys.includes(k),
						),
					);
				}
				for (const k of extraFormFields) {
					if (Object.prototype.hasOwnProperty.call(payload, k)) {
						body[k] = payload[k];
					}
				}
				await service.create(body);
				setFeedback({
					type: "success",
					message: "Registro creado correctamente.",
				});
			} else if (editingRow?.id != null) {
				let body = { ...payload };
				delete body.id;
				const patchKeys =
					service.fieldNamesForAction(optionsPayload, "PATCH") ||
					service.fieldNamesForAction(optionsPayload, "PUT");
				if (patchKeys?.length) {
					body = Object.fromEntries(
						Object.entries(body).filter(([k]) =>
							patchKeys.includes(k),
						),
					);
				}
				await service.update(editingRow.id, body);
				setFeedback({
					type: "success",
					message: "Registro actualizado.",
				});
			}
			setFormOpen(false);
			setEditingRow(null);
			await load();
		} catch (err) {
			setFeedback({
				type: "error",
				message: messageFromApiError(err),
			});
		} finally {
			setSaving(false);
		}
	}

	async function confirmDelete() {
		if (deleteRow?.id == null) return;
		setDeleteLoading(true);
		setErrorBanner("");
		try {
			await service.destroy(deleteRow.id);
			setFeedback({ type: "success", message: "Registro eliminado." });
			setDeleteRow(null);
			await load();
		} catch (err) {
			setFeedback({
				type: "error",
				message: messageFromApiError(err),
			});
		} finally {
			setDeleteLoading(false);
		}
	}

	return (
		<div className="page">
			<header className="page__header page__header--row">
				<div>
					<h1 className="page__title">{title}</h1>
					{subtitle && <p className="page__subtitle">{subtitle}</p>}
				</div>
				{!hideCreateButton && (
					<Button type="button" onClick={openCreate}>
						Agregar nuevo
					</Button>
				)}
			</header>

			{feedback && (
				<div
					className={`feedback feedback--${feedback.type}`}
					role="status"
				>
					{feedback.message}
				</div>
			)}

			{errorBanner && (
				<div className="alert alert--error" role="alert">
					{errorBanner}
				</div>
			)}

			<div className="card card--flush card--table">
				{loading ? (
					<div className="card__loading">
						<Spinner label="Cargando datos…" />
					</div>
				) : (
					<DynamicTable
						rows={rows}
						columnKeys={columnKeys}
						onEdit={openEdit}
						onDelete={(row) => setDeleteRow(row)}
						emptyMessage={emptyTableMessage}
					/>
				)}
			</div>

			<Modal
				open={formOpen}
				onClose={closeForm}
				title={
					formMode === "create" ? "Nuevo registro" : "Editar registro"
				}
				ariaLabel={
					formMode === "create"
						? "Formulario nuevo"
						: "Formulario edición"
				}
			>
				{formFields.length === 0 ? (
					<p className="dynamic-form__empty">
						No se pudieron inferir campos. Verifique permisos o cree
						un registro desde el administrador de Django para
						inicializar el esquema.
					</p>
				) : (
					<DynamicForm
						key={`${formMode}-${editingRow?.id ?? "new"}`}
						fields={formFields}
						fieldMeta={fieldMeta}
						mode={formMode}
						initialRecord={editingRow}
						loading={saving}
						onSubmit={handleFormSubmit}
						onCancel={closeForm}
						submitLabel={
							formMode === "create" ? "Guardar" : "Actualizar"
						}
					/>
				)}
			</Modal>

			<Modal
				open={Boolean(deleteRow)}
				onClose={() => !deleteLoading && setDeleteRow(null)}
				title="Confirmar eliminación"
				footer={
					<div className="modal__footer-actions">
						<Button
							variant="secondary"
							disabled={deleteLoading}
							onClick={() => setDeleteRow(null)}
						>
							Cancelar
						</Button>
						<Button
							variant="primary"
							disabled={deleteLoading}
							onClick={confirmDelete}
						>
							{deleteLoading ? "Eliminando…" : "Eliminar"}
						</Button>
					</div>
				}
			>
				<p className="modal__text">
					¿Eliminar este registro de forma permanente? Esta acción no
					se puede deshacer.
				</p>
			</Modal>
		</div>
	);
}

export default ResourceCrudPage;
