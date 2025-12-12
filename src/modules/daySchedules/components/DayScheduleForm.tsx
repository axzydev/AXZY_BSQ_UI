import { getAllTrainingModes } from "@app/modules/traningMode/services/TrainingModeService";
import {
  ITButton,
  ITDatePicker,
  ITInput,
  ITSelect,
  ITTimePicker,
} from "axzy_ui_system";
import { Form, Formik } from "formik";
import { useEffect, useState } from "react";
import * as Yup from "yup";

export interface IDayScheduleForm {
  date: Date;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  capacity: number;
  modeId: number;
}

// Normaliza antes de enviar al backend
const normalizeSchedulePayload = (values: IDayScheduleForm) => {
  return {
    ...values,
    date: new Date(values.date), // YYYY-MM-DD
    startTime: values.startTime?.slice(0, 5), // HH:mm
    endTime: values.endTime?.slice(0, 5), // HH:mm
  };
};
const isoToTime = (isoString: string) => {
  const date = new Date(isoString);
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
};

const validationSchema = Yup.object({
  date: Yup.string().required("La fecha es requerida"),
  startTime: Yup.string()
    .required("La hora de inicio es requerida")
    .test(
      "is-less",
      "La hora de inicio debe ser menor que la hora de fin",
      function (value) {
        const { endTime } = this.parent;
        return value < endTime;
      }
    ),
  endTime: Yup.string()
    .required("La hora de fin es requerida")
    .test(
      "is-greater",
      "La hora de fin debe ser mayor que la hora de inicio",
      function (value) {
        const { startTime } = this.parent;
        return value > startTime;
      }
    ),
  capacity: Yup.number()
    .min(1, "Mínimo 1")
    .required("La capacidad es obligatoria"),
  modeId: Yup.number()
    .moreThan(0, "Debe seleccionar un modo")
    .required("El modo es requerido"),
});

const DayScheduleForm = ({
  initialValues,
  onSubmit,
}: {
  initialValues?: IDayScheduleForm;
  onSubmit: (values: IDayScheduleForm) => void;
}) => {
  const defaultValues: IDayScheduleForm = initialValues || {
    date: new Date(),
    startTime: "",
    endTime: "",
    capacity: 1,
    modeId: 0,
  };
  const [normalizedValues, setNormalizedValues] = useState(defaultValues);

  useEffect(() => {
    if (initialValues) {
      setNormalizedValues({
        date: initialValues.date, // YYYY-MM-DD
        startTime: isoToTime(initialValues.startTime),
        endTime: isoToTime(initialValues.endTime),
        capacity: initialValues.capacity,
        modeId: initialValues.modeId,
      });
    }
  }, [initialValues]);

  const [trainingModes, setTrainingModes] = useState<any[]>([]);

  const handleGetTrainingModes = async () => {
    const response = await getAllTrainingModes().catch(() => null);
    if (response) setTrainingModes(response.data);
  };

  useEffect(() => {
    handleGetTrainingModes();
  }, []);

  return (
    <Formik
      initialValues={normalizedValues}
      enableReinitialize
      validationSchema={validationSchema}
      validateOnMount
      onSubmit={(values) => onSubmit(normalizeSchedulePayload(values))}
    >
      {({
        handleChange,
        handleBlur,
        values,
        errors,
        touched,
        isValid,
        setFieldValue,
      }) => (
        <Form>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Fecha */}
            <ITDatePicker
              name="date"
              label="Fecha"
              value={values.date}
              onChange={handleChange}
              onBlur={handleBlur}
              required
            />

            <ITTimePicker
              name="startTime"
              label="Hora Inicio"
              value={values.startTime}
              onChange={handleChange}
              onBlur={handleBlur}
              touched={touched.startTime}
              error={errors.startTime}
            />

            <ITTimePicker
              name="endTime"
              label="Hora Fin"
              value={values.endTime}
              onChange={handleChange}
              onBlur={handleBlur}
              touched={touched.endTime}
              error={errors.endTime}
            />

            {/* Capacidad */}
            <ITInput
              name="capacity"
              label="Capacidad"
              type="number"
              min={1}
              value={values.capacity}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              error={errors.capacity}
              touched={touched.capacity}
            />

            {/* Modo */}
            <ITSelect
              name="modeId"
              label="Modo de Entrenamiento"
              value={String(values.modeId)}
              onChange={({ target }) =>
                setFieldValue("modeId", Number(target.value))
              }
              required
              touched={touched.modeId}
              error={errors.modeId}
              onBlur={handleBlur}
              options={trainingModes}
              labelField="name"
              valueField="id"
            />
          </div>

          <div className="flex justify-end mt-4">
            <ITButton
              className="w-full md:w-1/4"
              disabled={!isValid}
              type="submit"
            >
              {initialValues ? "Actualizar Horario" : "Crear Horario"}
            </ITButton>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default DayScheduleForm;
