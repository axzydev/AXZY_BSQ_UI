import { useCallback, useEffect, useState } from "react";
import {
  getAllDaySchedules,
  createDaySchedule,
  updateDaySchedule,
  deleteDaySchedule,
} from "../services/DayScheduleService";

import DayScheduleForm from "../components/DayScheduleForm";
import DayScheduleTable from "../components/DayScheduleTable";

import { ITButton, ITDialog } from "axzy_ui_system";
import { convertToISODateTime } from "@app/core/utils/dateFormatter";
import { format } from "date-fns";
import { useDispatch } from "react-redux";
import { showToast } from "@app/core/store/toast/toast.slice";

const DaySchedulePage = () => {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selected, setSelected] = useState<any | null>(null);
  const dispatch = useDispatch();
  const fetchSchedules = useCallback(async () => {
    const response = await getAllDaySchedules().catch(() => null);
    if (response) setSchedules(response.data);
  }, []);

  const handleCreate = async (data: any) => {
    const body = {
      capacity: Number(data.capacity),
      date: new Date(data.date).toLocaleDateString("en-CA"),
      startTime: convertToISODateTime(data.date, data.startTime),
      endTime: convertToISODateTime(data.date, data.endTime),
      modeId: Number(data.modeId),
    };
    if (selected) {
      const response = await updateDaySchedule(selected.id, body);
      if (response) {
        setShowAddModal(false);
        setSelected(null);
        fetchSchedules();
      }
    } else {
      const response = await createDaySchedule(body);
      if (response) {
        setShowAddModal(false);
        fetchSchedules();
      }
    }
  };

  const handleDelete = async (id: number) => {
    const response = await deleteDaySchedule(id).catch((error) => {
      console.log(error);
      dispatch(showToast({
        message: error?.message || "Error al eliminar horario",
        type: "error",
      }));
    });
    if (response) fetchSchedules();
  };

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Horarios por Día</h1>
        <ITButton label="Agregar" onClick={() => setShowAddModal(true)} />
      </div>

      <DayScheduleTable
        data={schedules}
        onRowClick={(row) => {
          setSelected(row);
          setShowAddModal(true);
        }}
        onRowDelete={(row) => {
          setSelected(row);
          setShowRemoveModal(true);
        }}
      />

      {/* ADD/EDIT */}
      <ITDialog
        isOpen={showAddModal}
        title={selected ? "Editar Horario" : "Agregar Horario"}
        onClose={() => {
          setSelected(null);
          setShowAddModal(false);
        }}
      >
        <DayScheduleForm initialValues={selected} onSubmit={handleCreate} />
      </ITDialog>

      {/* DELETE */}
      <ITDialog
        isOpen={showRemoveModal}
        title="Confirmar eliminación"
        onClose={() => {
          setSelected(null);
          setShowRemoveModal(false);
        }}
      >
        <p className="mb-4 text-gray-700">
          ¿Eliminar horario del{" "}
          <span className="font-bold">
            {selected?.date
              ? format(new Date(selected.date), "dd/MM/yyyy")
              : ""}
          </span>{" "}
          de{" "}
          <span className="font-bold">
            {selected?.startTime
              ? format(new Date(selected.startTime), "HH:mm")
              : ""}
          </span>{" "}
          a{" "}
          <span className="font-bold">
            {selected?.endTime
              ? format(new Date(selected.endTime), "HH:mm")
              : ""}
          </span>
          ?
        </p>

        <div className="flex justify-end gap-3">
          <ITButton
            label="Cancelar"
            color="secondary"
            variant="outlined"
            onClick={() => setShowRemoveModal(false)}
          />
          <ITButton
            label="Eliminar"
            color="danger"
            onClick={() => {
              handleDelete(selected.id);
              setShowRemoveModal(false);
            }}
          />
        </div>
      </ITDialog>
    </>
  );
};

export default DaySchedulePage;
