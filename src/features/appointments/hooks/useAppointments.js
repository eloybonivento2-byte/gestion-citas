import { useState, useCallback } from "react";
import { AppointmentRepository } from "../api/appointments.repository";
import { toast } from "sonner";
import { useAuth } from "../../../providers/AuthProvider";

// ESTADOS DE CARGA ESPECÍFICOS (mejor UX que un genérico "loading")
const STATUS = {
  IDLE: "idle",
  CREATING: "creating",
  FETCHING: "fetching",
  UPDATING: "updating",
  ERROR: "error",
};

export function useAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [status, setStatus] = useState(STATUS.IDLE);
  const [error, setError] = useState(null);
  const { user, profile, isAprendiz } = useAuth();

  // FETCH: Obtener citas según el rol automáticamente
  const fetchAppointments = useCallback(
    async (filters = {}) => {
      setStatus(STATUS.FETCHING);
      setError(null);

      try {
        // RBAC implícito: los filtros dependen del rol
        const roleFilters = isAprendiz()
          ? { userId: user.id }
          : { dependencyId: profile.dependency_id };

        const data = await AppointmentRepository.fetch({
          ...roleFilters,
          ...filters,
        });
        setAppointments(data);
        return data;
      } catch (err) {
        console.error("Error fetching appointments:", err);
        setError(err.message);
        toast.error(`Error cargando citas: ${err.message}`);
        return [];
      } finally {
        setStatus(STATUS.IDLE);
      }
    },
    [user, profile, isAprendiz],
  );

  // CREATE: Crear cita con validaciones de negocio
  const createAppointment = async (formData) => {
    setStatus(STATUS.CREATING);

    try {
      // Regla de negocio: Máximo 2 citas pendientes
      if (isAprendiz()) {
        const pendingCount = await AppointmentRepository.countPending(user.id);
        if (pendingCount >= 2) {
          throw new Error(
            "Ya tienes 2 citas pendientes. Espera a que se atienda una.",
          );
        }
      }

      // Verificar disponibilidad de horario
      const isAvailable = await AppointmentRepository.checkAvailability(
        formData.dependency_id,
        formData.scheduled_date,
        formData.scheduled_time,
      );

      if (!isAvailable) {
        throw new Error("Este horario ya está ocupado. Selecciona otro.");
      }

      // Crear la cita
      const newAppointment = await AppointmentRepository.create({
        ...formData,
        user_id: user.id,
        status: "pending",
      });

      // OPTIMISTIC UPDATE: Actualizamos UI inmediatamente
      setAppointments((prev) => [...prev, newAppointment]);
      toast.success("Cita agendada correctamente");
      return { success: true, data: newAppointment };
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
      return { success: false, error: err.message };
    } finally {
      setStatus(STATUS.IDLE);
    }
  };

  // RESCHEDULE: Reprogramar una cita con validación de disponibilidad
  const rescheduleAppointment = async (appointmentId, newDate, newTime) => {
    setStatus(STATUS.UPDATING);
    
    try {
      // Verificar disponibilidad para el nuevo horario (excluyendo la cita actual)
      const isAvailable = await AppointmentRepository.checkAvailability(
        appointmentId,
        newDate,
        newTime,
      );
      
      if (!isAvailable) {
        throw new Error("Este horario ya está ocupado. Selecciona otro.");
      }
      
      const updated = await AppointmentRepository.reschedule(
        appointmentId,
        newDate,
        newTime,
      );
      
      // Actualizar estado local sin recargar todo
      setAppointments((prev) =>
        prev.map((app) => (app.id === appointmentId ? updated : app)),
      );
      
      toast.success("Cita reprogramada exitosamente");
      return { success: true };
    } catch (err) {
      setError(err.message);
      toast.error("Error reprogramando cita");
      return { success: false, error: err.message };
    } finally {
      setStatus(STATUS.IDLE);
    }
  };

  // EDIT: Editar datos básicos de una cita (sin cambiar fecha/hora)
  const editAppointment = async (appointmentId, updates) => {
    setStatus(STATUS.UPDATING);
    
    try {
      const updated = await AppointmentRepository.edit(appointmentId, updates);
      
      // Actualizar estado local sin recargar todo
      setAppointments((prev) =>
        prev.map((app) => (app.id === appointmentId ? updated : app)),
      );
      
      toast.success("Cita actualizada exitosamente");
      return { success: true };
    } catch (err) {
      setError(err.message);
      toast.error("Error actualizando cita");
      return { success: false, error: err.message };
    } finally {
      setStatus(STATUS.IDLE);
    }
  };

  // UPDATE STATUS: Cambiar estado (confirmar, completar, cancelar)
  const updateStatus = async (appointmentId, newStatus, notes = null) => {
    setStatus(STATUS.UPDATING);

    try {
      const updates = { status: newStatus };
      if (notes) updates.notes = notes;

      const updated = await AppointmentRepository.update(
        appointmentId,
        updates,
      );

      // Actualizar estado local sin recargar todo
      setAppointments((prev) =>
        prev.map((app) => (app.id === appointmentId ? updated : app)),
      );

      toast.success(
        newStatus === "cancelled"
          ? "Cita cancelada"
          : newStatus === "confirmed"
            ? "Cita confirmada"
            : "Cita actualizada",
      );
      return { success: true };
    } catch (err) {
      toast.error("Error actualizando cita");
      return { success: false, error: err.message };
    } finally {
      setStatus(STATUS.IDLE);
    }
  };

  // CANCEL: Cancelar cita (solo si está pending)
  const cancelAppointment = async (appointmentId) => {
    const appointment = appointments.find((a) => a.id === appointmentId);

    if (!appointment) {
      toast.error("Cita no encontrada");
      return { success: false };
    }

    if (appointment.status !== "pending") {
      toast.error("Solo puedes cancelar citas pendientes");
      return { success: false };
    }

    const confirmed = window.confirm("¿Estás seguro de que deseas cancelar esta cita?");
    if (!confirmed) {
      return { success: false };
    }

    return updateStatus(appointmentId, "cancelled");
  };

  // ASSIGN PROFESSIONAL: Asignar profesional a una cita
  const assignProfessional = async (appointmentId, professionalId) => {
    setStatus(STATUS.UPDATING);

    try {
      const updated = await AppointmentRepository.assignProfessional(
        appointmentId,
        professionalId,
      );

      setAppointments((prev) =>
        prev.map((app) => (app.id === appointmentId ? updated : app)),
      );

      toast.success("Profesional asignado correctamente");
      return { success: true };
    } catch (err) {
      toast.error("Error asignando profesional");
      return { success: false, error: err.message };
    } finally {
      setStatus(STATUS.IDLE);
    }
  };

  // GET PROFESSIONALS: Obtener profesionales de una dependencia
  const getProfessionals = async (dependencyId) => {
    try {
      return await AppointmentRepository.getProfessionalsByDependency(dependencyId);
    } catch {
      toast.error("Error cargando profesionales");
      return [];
    }
  };

  return {
    appointments,
    status,
    error,
    isLoading: status === STATUS.FETCHING,
    isCreating: status === STATUS.CREATING,
    fetchAppointments,
    createAppointment,
    updateStatus,
    cancelAppointment,
    assignProfessional,
    rescheduleAppointment,
    editAppointment,
    getProfessionals,
  };
}
