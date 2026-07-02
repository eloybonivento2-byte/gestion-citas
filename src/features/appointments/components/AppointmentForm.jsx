import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { appointmentSchema } from "../validations/appointment.schema";
import { useAppointments } from "../hooks/useAppointments";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { AlertCircle, RefreshCw } from "lucide-react";

export function AppointmentForm({ onSuccess }) {
  const { createAppointment, isCreating } = useAppointments();
  const [dependencies, setDependencies] = useState([]);
  const [loadingDeps, setLoadingDeps] = useState(true);
  const [errorDeps, setErrorDeps] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      dependency_id: "",
      scheduled_date: "",
      scheduled_time: "08:00",
      reason: "",
    },
  });

  // Cargar dependencias disponibles
  const loadDependencies = async () => {
    setLoadingDeps(true);
    setErrorDeps(null);
    try {
      const { data, error } = await supabase.from("dependencies").select("*");
      if (error) {
        console.error("Error cargando dependencias:", error.message);
        setErrorDeps("No se pudieron cargar las dependencias. Verifica que la tabla exista en la base de datos.");
        return;
      }
      setDependencies(data || []);
    } catch (err) {
      console.error("Error inesperado cargando dependencias:", err);
      setErrorDeps("Error de conexión al cargar dependencias.");
    } finally {
      setLoadingDeps(false);
    }
  };

  useEffect(() => {
    loadDependencies();
  }, []);

  const onSubmit = async (data) => {
    const result = await createAppointment(data);
    if (result.success) {
      onSuccess?.();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="appointment-form form-field">
      <div className="field">
        <label>Dependencia</label>
        <select
          {...register("dependency_id", { valueAsNumber: true })}
          disabled={loadingDeps || isCreating}
        >
          <option value="">
            {loadingDeps ? "Cargando dependencias..." : "Selecciona una dependencia..."}
          </option>
          {dependencies.map((dep) => (
            <option key={dep.id} value={dep.id}>
              {dep.name}
            </option>
          ))}
        </select>
        {errors.dependency_id && (
          <span className="error">
            <AlertCircle size={14} />
            {errors.dependency_id.message}
          </span>
        )}
        {errorDeps && (
          <div className="field-error">
            <AlertCircle size={14} />
            <span>{errorDeps}</span>
            <button
              type="button"
              onClick={loadDependencies}
              className="btn-link"
              style={{ marginLeft: "0.5rem" }}
            >
              <RefreshCw size={14} />
              Reintentar
            </button>
          </div>
        )}
      </div>

      <div className="field-row form-field-row">
        <div className="field form-field">
          <label>Fecha</label>
          <input type="date" {...register("scheduled_date")} disabled={isCreating} />
          {errors.scheduled_date && (
            <span className="error">
              <AlertCircle size={14} />
              {errors.scheduled_date.message}
            </span>
          )}
        </div>

        <div className="field form-field">
          <label>Hora</label>
          <select {...register("scheduled_time")} disabled={isCreating}>
            {Array.from({ length: 9 }, (_, i) => {
              const hour = (8 + i).toString().padStart(2, "0");
              return (
                <option key={hour} value={`${hour}:00`}>
                  {hour}:00
                </option>
              );
            })}
          </select>
          {errors.scheduled_time && (
            <span className="error">
              <AlertCircle size={14} />
              {errors.scheduled_time.message}
            </span>
          )}
        </div>
      </div>

      <div className="field">
        <label>Motivo de consulta</label>
        <textarea
          {...register("reason")}
          rows="4"
          placeholder="Describe brevemente por qué necesitas la cita (mínimo 10 caracteres)..."
          disabled={isCreating}
        />
        {errors.reason && (
          <span className="error">
            <AlertCircle size={14} />
            {errors.reason.message}
          </span>
        )}
      </div>

      <button
        type="submit"
        disabled={isCreating || loadingDeps || dependencies.length === 0}
        className="btn-primary"
      >
        {isCreating ? "Agendando..." : "Solicitar Cita"}
      </button>
    </form>
  );
}
