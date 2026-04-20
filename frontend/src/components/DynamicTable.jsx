import { formatCellValue, inferColumnKeys } from "../utils/dynamicData.js";

function DynamicTable({ rows, columnKeys, onEdit, onDelete, emptyMessage }) {
  if (!rows?.length) {
    return <p className="empty-state">{emptyMessage}</p>;
  }

  const keys =
    columnKeys?.length > 0 ? columnKeys : inferColumnKeys(rows);

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {keys.map((key) => (
              <th key={key}>{key}</th>
            ))}
            <th className="data-table__actions">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row?.id ?? index}>
              {keys.map((key) => (
                <td key={key}>{formatCellValue(row[key])}</td>
              ))}
              <td className="data-table__actions-cell">
                <div className="table-actions">
                  <button
                    type="button"
                    className="btn--link"
                    onClick={() => onEdit(row)}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="btn--link btn--link--danger"
                    onClick={() => onDelete(row)}
                  >
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DynamicTable;
