import { Column, ITButton, ITTable } from "axzy_ui_system";
import { FaPencilAlt, FaTrash } from "react-icons/fa";

interface TrainingModeTableProps {
  data: any[];
  onRowClick: (rowData: any) => void;
  onRowDelete: (rowData: any) => void;
}

const TrainingModeTable = ({ data, onRowClick, onRowDelete }: TrainingModeTableProps) => {
  const actions = (row: any) => {
    return (
      <div className="flex flex-row gap-2 justify-center">
        <ITButton
          color="primary"
          variant="outlined"
          onClick={() => onRowClick(row)}
          className="min-w-0 p-2"
        >
          <FaPencilAlt />
        </ITButton>

        <ITButton
          color="primary"
          variant="outlined"
          onClick={() => onRowDelete(row)}
          className="min-w-0 p-2"
        >
          <FaTrash />
        </ITButton>
      </div>
    );
  };

  const columns: Column[] = [
    {
      key: "id",
      label: "ID",
      type: "string",
    },
    {
      key: "name",
      label: "Nombre",
      type: "string",
    },
    {
      key: "description",
      label: "Descripción",
      type: "string",
    },
    {
      key: "coachCost",
      label: "Costo ($)",
      type: "number",
    },
    {
      key: "isActive",
      label: "Activo",
      type: "boolean",
    },
    {
      key: "actions",
      label: "Acciones",
      type: "actions",
      className: "w-[150px]",
      actions: (row: any) => actions(row),
    },
  ];

  return <ITTable columns={columns} data={data} />;
};

export default TrainingModeTable;
