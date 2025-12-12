import { Column, ITButton, ITTable } from "axzy_ui_system";
import { FaPencilAlt, FaTrash } from "react-icons/fa";

interface DayScheduleTableProps {
  data: any[];
  onRowClick: (rowData: any) => void;
  onRowDelete: (rowData: any) => void;
}

const DayScheduleTable = ({
  data,
  onRowClick,
  onRowDelete,
}: DayScheduleTableProps) => {
  const actions = (row: any) => (
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
        color="danger"
        variant="outlined"
        onClick={() => onRowDelete(row)}
        className="min-w-0 p-2"
      >
        <FaTrash />
      </ITButton>
    </div>
  );

  const columns: Column[] = [
    { key: "id", label: "ID", type: "string" },
    {
      key: "date",
      label: "Fecha",
      type: "date",
      render: (row: any) => {
        const d = new Date(row.date);
        return `${d.getUTCDate().toString().padStart(2, "0")}/${(
          d.getUTCMonth() + 1
        )
          .toString()
          .padStart(2, "0")}/${d.getUTCFullYear()}`;
      },
    },
    {
      key: "startTime",
      label: "Inicio",
      type: "string",
      render: (value: any) => {
        const date = new Date(value.startTime);
        return date.toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
        });
      },
    },
    {
      key: "endTime",
      label: "Fin",
      type: "string",
      render: (value: any) => {
        const date = new Date(value.endTime);
        return date.toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
        });
      },
    },
    { key: "capacity", label: "Capacidad", type: "number" },
    {
      key: "reserved",
      type: "number",
      label: "Reservados",
      render: (row: any) => row.appointments ? row.appointments.length : 0,
    },
    { key: "mode.name", label: "Modo Entrenamiento", type: "string" },
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

export default DayScheduleTable;
