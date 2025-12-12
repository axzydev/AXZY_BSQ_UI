import { ITCalendar, ITSelect, ITLoader, ITDialog, ITButton } from "axzy_ui_system";
import { format, parseISO } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { FaCalendarAlt, FaTrash } from "react-icons/fa";
import { getAllTrainingModes } from "../../traningMode/services/TrainingModeService";
import { getAllDaySchedules, createDaySchedule, deleteDaySchedule } from "../../daySchedules/services/DayScheduleService";
import { deleteAppointment } from "../../appointments/service/AppointmentService";
import { useSelector, useDispatch } from "react-redux";
import { AppState } from "@app/core/store/store";
import { assignChildToTrainingMode, getChildByUserId, getAllChildren } from "../../children/service/ChildrenService";
import { showToast } from "@app/core/store/toast/toast.slice";

interface CalendarEvent {
  id: string;
  title: string;
  start: Date | string;
  end: Date | string;
  color?: string;
  data?: any;
}

const CalendarPage = () => {
    const user = useSelector((state: AppState) => state.auth);
    const dispatch = useDispatch();

    const [trainingModes, setTrainingModes] = useState<any[]>([]);
    const [daySchedules, setDaySchedules] = useState<any[]>([]);
    const [children, setChildren] = useState<any[]>([]);
    
    const [selectedModeId, setSelectedModeId] = useState<string>("");
    const [loading, setLoading] = useState(false);

    // Dialog State
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [selectedChildId, setSelectedChildId] = useState<string>("");

    // Responsive State
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Initial Fetch
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [modesRes, schedulesRes] = await Promise.all([
                    getAllTrainingModes(),
                    getAllDaySchedules()
                ]);

                if (user?.role === "ADMIN") {
                     // Admin fetches ALL children
                     const allChildrenRes = await getAllChildren();
                     if (allChildrenRes.data) {
                         setChildren(allChildrenRes.data);
                     }
                } else if (user?.id) {
                    const childrenRes = await getChildByUserId(Number(user.id));
                    if (childrenRes.data) {
                        setChildren(childrenRes.data);
                    }
                }
                
                if (modesRes.data) {
                    setTrainingModes(modesRes.data);
                    if (modesRes.data.length > 0) {
                        setSelectedModeId(String(modesRes.data[0].id));
                    }
                }
                if (schedulesRes.data) {
                    setDaySchedules(schedulesRes.data);
                }
            } catch (error) {
                console.error("Error fetching calendar data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user?.id, user?.role]);

    const handleAssign = async () => {
        if (!selectedEvent || !selectedChildId) return;

        // Find the selected child to get their userId
        const childToAssign = children.find(c => String(c.id) === selectedChildId);
        if (!childToAssign) return;

        setLoading(true);
        try {
            await assignChildToTrainingMode({
                userId: Number(childToAssign.userId), // Use the child's parent ID
                childId: Number(selectedChildId),
                dayScheduleId: Number(selectedEvent.id),
                trainingModeId: Number(selectedModeId)
            });
            
            dispatch(showToast({ type: "success", message: "Inscrito correctamente" }));
            setShowAssignModal(false);
            setSelectedChildId("");
            setSelectedEvent(null);
            
            const schedulesRes = await getAllDaySchedules();
            if (schedulesRes.data) setDaySchedules(schedulesRes.data);

        } catch (error: any) {
            console.error("Error assigning child:", error);
            dispatch(showToast({ type: "error", message: error?.message || "Error al inscribir" }));
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedEvent) return;

        setLoading(true);
        try {
            await deleteDaySchedule(Number(selectedEvent.id));
            dispatch(showToast({ type: "success", message: "Eliminado correctamente" }));
            setShowAssignModal(false);
            setSelectedEvent(null);
            
            const schedulesRes = await getAllDaySchedules();
            if (schedulesRes.data) setDaySchedules(schedulesRes.data);

        } catch (error: any) {
            console.error("Error deleting schedule:", error);
            dispatch(showToast({ type: "error", message: error?.message || "Error al eliminar" }));
        } finally {
            setLoading(false);
        }
    };

    const handleUnenroll = async (appointmentId: number) => {
        if (!confirm("¿Estás seguro de que deseas dar de baja a este alumno?")) return;
        
        setLoading(true);
        try {
            await deleteAppointment(appointmentId);
            dispatch(showToast({ type: "success", message: "Alumno dado de baja correctamente" }));
            
            // Refetch schedules to update list (or update local state if preferred, but refetch is safer for now)
            const schedulesRes = await getAllDaySchedules();
            if (schedulesRes.data) {
                setDaySchedules(schedulesRes.data);
                // Also update selectedEvent appointments locally to reflect change immediately in UI if possible
                // But refetching won't update selectedEvent automatically unless we re-find it.
                // Let's re-find the updated schedule and update selectedEvent.
                const updatedSchedule = schedulesRes.data.find((s: any) => String(s.id) === selectedEvent?.id);
                if (updatedSchedule && selectedEvent) {
                     setSelectedEvent({
                         ...selectedEvent,
                         data: updatedSchedule
                     });
                }
            }

        } catch (error: any) {
             console.error("Error unenroll child:", error);
             dispatch(showToast({ type: "error", message: error?.message || "Error al dar de baja" }));
        } finally {
            setLoading(false);
        }
    };

    // ... (Memoized events logic remains same)
    const events = useMemo(() => {
        if (!selectedModeId) return [];
        const filteredSchedules = daySchedules.filter(s => s.modeId === Number(selectedModeId));
        const calendarEvents: CalendarEvent[] = [];

        filteredSchedules.forEach(schedule => {
            try {
                const start = typeof schedule.startTime === 'string' ? parseISO(schedule.startTime) : new Date(schedule.startTime);
                const end = typeof schedule.endTime === 'string' ? parseISO(schedule.endTime) : new Date(schedule.endTime);

                if (isNaN(start.getTime()) || isNaN(end.getTime())) return;

                const available = schedule.capacity - (schedule.appointments?.length || 0);
                const isFull = available <= 0;

                calendarEvents.push({
                    id: schedule.id.toString(),
                    title: isFull ? "LLENO" : `Disponible (${available})`, 
                    start,
                    end,
                    color: isFull ? "#ef4444" : "#2563eb",
                    data: schedule
                });

            } catch (e) {
                console.warn("Failed to parse schedule", schedule, e);
            }
        });

        return calendarEvents;
    }, [daySchedules, selectedModeId]);

    const handleSlotClick = (date: Date) => {
        if (user?.role === "ADMIN") {
             // Default to 30 minutes slot on click
             const end = new Date(date);
             end.setMinutes(end.getMinutes() + 30);
             handleSelectRange(date, end);
        }
    };

    const handleEventClick = (event: CalendarEvent) => {
        setSelectedEvent(event);
        setSelectedChildId("");
        setShowAssignModal(true);
    };

    // Creation Dialog State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createData, setCreateData] = useState<{start: Date | null, end: Date | null, capacity: number}>({ 
        start: null, end: null, capacity: 10 
    });

    const handleSelectRange = (start: Date, end: Date) => {
        console.log("Selected range:", start, end);
        if (user?.role !== "ADMIN") return;
        setCreateData({ start, end, capacity: 10 });
        setShowCreateModal(true);
    };



    return (
        <div className="flex flex-col h-full bg-slate-50 p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-600 p-3 rounded-lg shadow-blue-200 shadow-lg">
                        <FaCalendarAlt className="text-white text-xl" />
                    </div>
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-slate-800">Calendario de Entrenamientos</h1>
                        <p className="text-sm md:text-base text-slate-500">Filtrado por Modo de Entrenamiento</p>
                    </div>
                </div>
                
                <div className="w-full md:w-72">
                     <ITSelect
                        name="trainingMode"
                        label="Modo de Entrenamiento"
                        options={trainingModes.map(m => ({ label: m.name, value: String(m.id) }))}
                        value={selectedModeId}
                        onChange={(e) => setSelectedModeId(e.target.value)}
                        placeholder="Seleccionar modo..."
                     />
                </div>
            </div>

            <div className="flex-1 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden relative">
                {loading && (
                    <div className="absolute inset-0 bg-white/80 z-50 flex items-center justify-center">
                        <ITLoader />
                    </div>
                )}
                
                <ITCalendar 
                    events={events}
                    onSlotClick={handleSlotClick}
                    onEventClick={handleEventClick}
                    onSelectRange={handleSelectRange}
                    mode={isMobile ? 'day' : 'week'}
                />
            </div>

            {/* ASSIGNMENT DIALOG */}
            <ITDialog
                isOpen={showAssignModal}
                title={user?.role === "ADMIN" ? "Gestionar Inscripciones" : "Inscribir a Clase"}
                onClose={() => setShowAssignModal(false)}
                className="w-full max-w-md"
            >
                <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-blue-800 font-semibold">Detalles del Horario:</p>
                        <p className="text-gray-700">
                             Fecha: {selectedEvent?.start ? format(new Date(selectedEvent.start), 'dd/MM/yyyy') : '-'}
                        </p>
                        <p className="text-gray-700">
                             Hora: {selectedEvent?.start ? format(new Date(selectedEvent.start), 'HH:mm') : '-'} - {selectedEvent?.end ? format(new Date(selectedEvent.end), 'HH:mm') : '-'}
                        </p>
                    </div>
                    
                    {/* ENROLLMENT LIST (Admin: All, Parent: Own Children) */}
                    {(() => {
                        const appointments = selectedEvent?.data?.appointments || [];
                        const visibleAppointments = user?.role === "ADMIN" 
                            ? appointments 
                            : appointments.filter((appt: any) => children.some(c => c.id === appt.child.id));

                        if (visibleAppointments.length === 0 && user?.role !== "ADMIN") return null;

                        return (selectedEvent?.data?.appointments && (
                            <div className="border rounded-md p-3">
                                <p className="text-sm font-bold mb-2">
                                    {user?.role === "ADMIN" ? `Inscritos (${appointments.length}):` : "Tus Hijos Inscritos:"}
                                </p>
                                {visibleAppointments.length === 0 ? (
                                    <p className="text-sm text-gray-500">No hay inscritos.</p>
                                ) : (
                                    <ul className="text-sm space-y-2 mt-2">
                                        {visibleAppointments.map((appt: any) => (
                                            <li key={appt.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                                <span>- {appt.child?.name} {appt.child?.lastName}</span>
                                                <button 
                                                    onClick={() => handleUnenroll(appt.id)}
                                                    className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                                                    title="Dar de baja"
                                                >
                                                    <FaTrash size={12} />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ));
                    })()}

                    <ITSelect
                        label={user?.role === "ADMIN" ? "Inscribir Alumno" : "Seleccionar Hijo"}
                        name="childId"
                        options={children.map(c => ({ label: `${c.name} ${c.lastName}`, value: String(c.id) }))}
                        value={selectedChildId}
                        onChange={(e) => setSelectedChildId(e.target.value)}
                        placeholder="-- Seleccione --"
                    />

                     <div className="flex justify-between pt-4 gap-2">
                        {user?.role === "ADMIN" && (
                            <ITButton 
                                label="Eliminar" 
                                variant="outlined" 
                                color="danger"
                                disabled={selectedEvent?.data.appointments.length > 0}
                                onClick={handleDelete} 
                            />
                        )}
                        <div className="flex gap-2">
                             <ITButton 
                                label="Cancelar" 
                                variant="outlined" 
                                color="secondary" 
                                onClick={() => setShowAssignModal(false)} 
                            />
                             <ITButton 
                                label="Inscribir" 
                                color="primary" 
                                onClick={handleAssign}
                                disabled={!selectedChildId}
                            />
                        </div>
                    </div>
                </div>
            </ITDialog>

            {/* CREATE SCHEDULE DIALOG */}
            <ITDialog
                isOpen={showCreateModal}
                title="Crear Nuevo Horario"
                onClose={() => setShowCreateModal(false)}
                className="w-full max-w-md"
            >
                <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                         <p className="text-sm font-semibold text-blue-800">Horario Seleccionado:</p>
                         <p className="text-gray-700">
                            Fecha: {createData.start ? format(createData.start, 'dd/MM/yyyy') : '-'}
                        </p>
                        <p className="text-gray-700">
                            Hora: {createData.start ? format(createData.start, 'HH:mm') : '-'} - {createData.end ? format(createData.end, 'HH:mm') : '-'}
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Capacidad</label>
                        <input
                            type="number"
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                            value={createData.capacity}
                            onChange={(e) => setCreateData({...createData, capacity: Number(e.target.value)})}
                            min={1}
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Modo</label>
                         <input
                            type="text"
                            disabled
                            className="w-full rounded-md border-gray-300 bg-gray-100 text-gray-500 shadow-sm sm:text-sm border p-2"
                            value={trainingModes.find(m => String(m.id) === selectedModeId)?.name || "Seleccionado"}
                        />
                    </div>

                    <div className="flex justify-end pt-4 gap-2">
                        <ITButton 
                            label="Cancelar" 
                            variant="outlined" 
                            color="secondary" 
                            onClick={() => setShowCreateModal(false)} 
                        />
                        <ITButton 
                            label="Guardar Horario" 
                            color="primary" 
                            onClick={async () => {
                                // Inline implementation until imports are fixed
                                if (!createData.start || !createData.end || !selectedModeId) return;
                                setLoading(true);
                                try {
                                     await createDaySchedule({
                                         date: createData.start,
                                         startTime: createData.start,
                                         endTime: createData.end,
                                         capacity: createData.capacity,
                                         modeId: Number(selectedModeId)
                                     });
                                     
                                     dispatch(showToast({ type: "success", message: "Horario creado exitosamente" }));
                                     setShowCreateModal(false);
                                     
                                     const schedulesRes = await getAllDaySchedules();
                                     if (schedulesRes.data) setDaySchedules(schedulesRes.data);

                                } catch(e: any) {
                                     dispatch(showToast({ type: "error", message: e?.message || "Error al crear" }));
                                } finally {
                                    setLoading(false);
                                }
                            }} 
                        />
                    </div>
                </div>
            </ITDialog>
        </div>
    );
};

export default CalendarPage;
