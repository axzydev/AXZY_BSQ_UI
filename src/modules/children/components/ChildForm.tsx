import { ITButton, ITDatePicker, ITInput } from "axzy_ui_system";
import { Form, Formik } from "formik";
import { useEffect, useState } from "react";
import * as Yup from "yup";
import { ChildrenCreate } from "../types/children.types";

const validationSchema = Yup.object({
  name: Yup.string().required("El nombre es requerido"),
  lastName: Yup.string().required("El apellido es requerido"),
  birthDate: Yup.string().required("La fecha de nacimiento es requerida"),
});

interface ChildFormProps {
  initialValues?: any;
  onSubmit: (values: Partial<ChildrenCreate>) => void;
  isLoading?: boolean;
}

const ChildForm = ({ initialValues, onSubmit, isLoading }: ChildFormProps) => {
  const defaultValues = {
    name: "",
    lastName: "",
    birthDate: new Date(),
  };

  const [formValues, setFormValues] = useState<any>(defaultValues);

  useEffect(() => {
    if (initialValues) {
      setFormValues({
        name: initialValues.name || "",
        lastName: initialValues.lastName || "",
        birthDate: initialValues.birthDate ? new Date(initialValues.birthDate) : new Date(),
      });
    }
  }, [initialValues]);

  return (
    <Formik
      initialValues={formValues}
      enableReinitialize
      validationSchema={validationSchema}
      onSubmit={(values) => {
        onSubmit({
            ...values,
            birthDate: values.birthDate.toISOString()
        });
      }}
    >
      {({ handleChange, handleBlur, values, errors, touched, isValid }) => (
        <Form className="flex flex-col gap-4">
          <ITInput
            name="name"
            label="Nombre"
            value={values.name}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.name as string}
            touched={touched.name as boolean}
            required
          />
          <ITInput
            name="lastName"
            label="Apellido"
            value={values.lastName}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.lastName as string}
            touched={touched.lastName as boolean}
            required
          />
          <ITDatePicker
            name="birthDate"
            label="Fecha de Nacimiento"
            value={values.birthDate}
            onChange={handleChange}
            onBlur={handleBlur}
            required
          />

          <div className="flex justify-end mt-4">
            <ITButton
              type="submit"
              disabled={!isValid || isLoading}
              label={initialValues ? "Actualizar" : "Guardar"}
            />
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default ChildForm;
