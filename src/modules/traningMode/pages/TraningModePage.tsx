import { useCallback, useEffect, useState } from "react";
import {
  createTrainingMode,
  deleteTrainingMode,
  getAllTrainingModes,
  updateTrainingMode,
} from "../services/TrainingModeService";
import TrainingModeTable from "../components/TrainingModeTable";
import { ITButton, ITDialog } from "axzy_ui_system";
import TrainingModeForm from "../components/TrainingModeForm";
import { useDispatch } from "react-redux";
import { showToast } from "@app/core/store/toast/toast.slice";

const TrainingModePage = () => {
  const [trainingModes, setTrainingModes] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedMode, setSelectedMode] = useState<any | null>(null);
  const dispatch = useDispatch();

  const fetchTrainingModes = useCallback(async () => {
    const response = await getAllTrainingModes().catch((error) => {
      console.error("Error fetching training modes:", error);
      return null;
    });

    if (response) {
      setTrainingModes(response.data);
    }
  }, []);

  const handleCreateMode = async (data: any) => {
    console.log("Creating mode with data:", data);
    if (selectedMode) {
      // Update mode logic here
      const response = await updateTrainingMode(selectedMode.id, data).catch(
        (error) => {
          console.error("Error updating training mode:", error);
          return null;
        }
      );
      if (response) {
        console.log("Training mode updated successfully:", response.data);
        setShowAddModal(false);
        setSelectedMode(null);
        fetchTrainingModes();
      }
    } else {
      const response = await createTrainingMode(data).catch((error) => {
        console.error("Error creating training mode:", error);
        return null;
      });

      if (response) {
        console.log("Training mode created successfully:", response.data);
        setShowAddModal(false);
        fetchTrainingModes();
      }
    }
  };

  const handleRemoveMode = async (id: string) => {
    const response = await deleteTrainingMode(id).catch((error: any) => {
      console.error("Error deleting training mode:", error);
      const messages = error?.messages;
      const message = Array.isArray(messages) ? messages[0] : "Error al eliminar";
      
      dispatch(showToast({
        type: "error",
        message: message
      }));
      return null;
    });
    if (response) {
      console.log("Training mode deleted successfully");
      dispatch(showToast({
        type: "success",
        message: "Modo de entrenamiento eliminado correctamente"
      }));
      fetchTrainingModes();
    }
  };

  useEffect(() => {
    fetchTrainingModes();
  }, [fetchTrainingModes]);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold mb-4">Modos de Entrenamiento</h1>
        <div>
          <ITButton
            color="secondary"
            label="Agregar"
            onClick={() => setShowAddModal(true)}
          />
        </div>
      </div>
      <TrainingModeTable
        data={trainingModes}
        onRowDelete={(row) => {
          setSelectedMode(row);
          setShowRemoveModal(true);
        }}
        onRowClick={(row) => {
          setSelectedMode(row);
          setShowAddModal(true);
        }}
      />

      <ITDialog
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setSelectedMode(null);
        }}
        title="Agregar Modo de Entrenamiento"
      >
        <TrainingModeForm
          initialValues={selectedMode}
          onSubmit={(data) => {
            handleCreateMode(data);
          }}
        />
      </ITDialog>

      <ITDialog
        title="Confirmar eliminación"
        isOpen={showRemoveModal}
        onClose={() => {
          setShowRemoveModal(false);
          setSelectedMode(null);
        }}
        className="w-full max-w-md"
      >
        <p className="mb-6 text-gray-600">
          ¿Está seguro de eliminar el modo de entrenamiento: "
          {selectedMode?.name}"?
        </p>

        <div className="flex justify-end gap-3">
          <ITButton
            label="Cancelar"
            color="secondary"
            variant="outlined"
            onClick={() => setShowAddModal(false)}
          />
          <ITButton
            label="Eliminar"
            color="danger"
            onClick={() => {
              handleRemoveMode(selectedMode.id);
              setShowRemoveModal(false);
            }}
          />
        </div>
      </ITDialog>
    </>
  );
};

export default TrainingModePage;
