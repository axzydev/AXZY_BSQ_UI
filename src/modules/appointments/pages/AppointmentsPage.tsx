import { AppState } from "@app/core/store/store";
import { ITButton, ITDialog, ITLoader, ITTable } from "axzy_ui_system";
import { useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";
import { useSelector } from "react-redux";
import { Appointment, deleteAppointment, getAllAppointments, getAppointmentsByUser } from "../service/AppointmentService";

const AppointmentsPage = () => {
    const user = useSelector((state: AppState) => state.auth);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

    const fetchAppointments = async () => {
        if (!user.id) return;
        setLoading(true);
        try {
            let res;
            if (user.role === "ADMIN") {
                res = await getAllAppointments();
            } else {
                res = await getAppointmentsByUser(user.id);
            }

            if (res?.data) {
                setAppointments(res.data);
            }
        } catch (error) {
            console.error("Error fetching appointments", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, [user.id, user.role]);

    const handleDelete = async () => {
        if (!selectedAppointment) return;
        try {
            await deleteAppointment(selectedAppointment.id);
            setShowDeleteModal(false);
            setSelectedAppointment(null);
            fetchAppointments();
        } catch (error) {
            console.error("Error deleting appointment", error);
        }
    };

    const columns: any[] = [
        {
            key: "date",
            label: "Fecha",
            render: (row: Appointment) => new Date(row.schedule.date).toLocaleDateString(),
        },
        {
            key: "startTime",
            label: "Hora Inicio",
            render: (row: Appointment) => {
                // Assuming startTime is "HH:mm" or ISO. If ISO, extract time.
                // Based on previous files, startTime seems to be a string. 
                // If it is ISO, we can use format. 
                // Let's safe-guard:
                const date = new Date(row.schedule.startTime);
                if (isNaN(date.getTime())) return row.schedule.startTime; // Return as is if not date
                return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            },
        },
        {
            key: "endTime",
            label: "Hora Fin",
            render: (row: Appointment) => {
                const date = new Date(row.schedule.endTime);
                if (isNaN(date.getTime())) return row.schedule.endTime;
                return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            },
        },
        {
            key: "child",
            label: "Hijo",
            render: (row: Appointment) => `${row.child.name} ${row.child.lastName}`,
        },
        {
            key: "mode",
            label: "Modo",
            render: (row: Appointment) => row.mode.name,
        },
        // Show parent name if admin
        ...(user.role === "ADMIN" ? [{
            key: "user",
            label: "Padre",
            render: (row: any) => row.user ? `${row.user.name} ${row.user.lastName || ''}` : 'N/A',
        }] : []),
        {
            key: "actions",
            label: "Acciones",
            render: (row: Appointment) => (
                <ITButton
                    color="danger"
                    variant="outlined"
                    className="p-2 min-w-0"
                    onClick={() => {
                        setSelectedAppointment(row);
                        setShowDeleteModal(true);
                    }}
                >
                    <FaTrash />
                </ITButton>
            ),
        },
    ];

    if (loading && appointments.length === 0) {
        return (
            <div className="flex h-full items-center justify-center p-10">
                <ITLoader />
            </div>
        );
    }

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-6">Mis Citas</h1>
            
            <ITTable
                columns={columns}
                data={appointments as any[] }
            />

            <ITDialog
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setSelectedAppointment(null);
                }}
                title="Cancelar Cita"
            >
                <div className="flex flex-col gap-4">
                    <p>¿Estás seguro que deseas cancelar esta cita?</p>
                    <div className="flex justify-end gap-2">
                        <ITButton
                            label="No, volver"
                            variant="outlined"
                            color="secondary"
                            onClick={() => setShowDeleteModal(false)}
                        />
                        <ITButton
                            label="Sí, cancelar"
                            color="danger"
                            onClick={handleDelete}
                        />
                    </div>
                </div>
            </ITDialog>
        </div>
    );
};

export default AppointmentsPage;
