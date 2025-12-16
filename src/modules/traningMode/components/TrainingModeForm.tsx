import {
  FieldConfig,
  ITButton,
  ITFormBuilder,
  createValidationSchema,
} from "axzy_ui_system";
import { Form, Formik } from "formik";
import { FaClipboardList } from "react-icons/fa";
import * as Yup from "yup";

export interface ITrainingModeForm {
  name: string;
  description?: string | null;
  isActive: boolean;
  coachCost: number;
}

const TrainingModeForm = ({
  initialValues,
  onSubmit,
}: {
  initialValues?: ITrainingModeForm;
  onSubmit: (values: ITrainingModeForm) => void;
}) => {
  const defaultValues: ITrainingModeForm = initialValues || {
    name: "",
    description: "",
    isActive: true,
    coachCost: 0,
  };

  // ---------------------------
  // Campos del formulario
  // ---------------------------
  const fields: FieldConfig[] = [
    {
      name: "name",
      label: "Nombre del Modo",
      type: "text",
      required: true,
      column: 12,
      minLength: 3,
      maxLength: 50,
      validation: Yup.string()
        .required("El nombre es requerido")
        .min(3, "Mínimo 3 caracteres"),
      rightIcon: <FaClipboardList />,
    },
    {
      name: "description",
      label: "Descripción",
      type: "text",
      required: false,
      column: 12,
      maxLength: 200,
      validation: Yup.string().nullable(),
    },
    {
      name: "coachCost",
      label: "Costo Entrenador ($)",
      type: "number",
      required: true,
      column: 12,
      validation: Yup.number().min(0, "El costo debe ser mayor o igual a 0").required("Requerido"),
    },
  ];

  return (
    <Formik
      initialValues={defaultValues}
      enableReinitialize
      validationSchema={createValidationSchema(fields)}
      onSubmit={onSubmit}
    >
      {({
        handleSubmit,
        values,
        touched,
        errors,
        handleChange,
        handleBlur,
        isValid,
      }) => (
        <Form onSubmit={handleSubmit} className="w-full p-2">
          <ITFormBuilder
            fields={fields}
            columns={2}
            handleChange={handleChange}
            handleBlur={handleBlur}
            values={values}
            touched={touched}
            errors={errors}
          />

          <div className="mt-4">
            <ITButton type="submit" disabled={!isValid} className="w-full">
              {initialValues ? "Actualizar Modo" : "Crear Modo"}
            </ITButton>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default TrainingModeForm;
