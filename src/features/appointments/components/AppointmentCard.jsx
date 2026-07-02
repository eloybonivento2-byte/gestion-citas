import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import {
  Calendar,
  Clock,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

const STATUS_CONFIG = {
  pending: { label: "Pendiente", color: "#f59e0b", icon: AlertCircle },
  confirmed: { label: "Confirmada", color: "#3b82f6", icon: CheckCircle },
  completed: { label: "Completada", color: "#22c55e", icon: CheckCircle },
  cancelled: { label: "Cancelada", color: "#ef4444", icon: XCircle },
  no_show: { label: "No asistió", color: "#6b7280", icon: XCircle },
};

export function AppointmentCard({ appointment, onCancel, isAprendiz, onAssignProfessional, onReschedule, onEdit }) {
  const {
    dependencies,
    scheduled_date,
    scheduled_time,
    status,
    reason,
    user,
    professional,
  } = appointment || {};
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = config.icon;

  return (
    <article
      className="appointment-card"
      style={{ borderLeft: `4px solid ${dependencies?.color || "#ccc"}` }}
      aria-label={`Cita ${config.label} en ${dependencies?.name || "sin dependencia"}`}
    >
      <div className="card-header">
        <div
          className="dependency-badge"
          style={{ background: dependencies?.color }}
        >
          {dependencies?.name}
        </div>
        <div className="status-badge" style={{ color: config.color }}>
          <Icon size={16} aria-hidden="true" />
          <span>{config.label}</span>
        </div>
      </div>

      <div className="card-datetime">
        <div className="datetime-item">
          <Calendar size={16} aria-hidden="true" />
          <time dateTime={scheduled_date}>
            {scheduled_date ? format(parseISO(scheduled_date), "PPP", { locale: es }) : "Sin fecha"}
          </time>
        </div>
        <div className="datetime-item">
          <Clock size={16} aria-hidden="true" />
          <span>{scheduled_time}</span>
        </div>
      </div>

      <div className="card-body">
        <p className="reason">{reason}</p>
        {isAprendiz && professional && (
          <div className="aprendiz-info">
            <User size={14} aria-hidden="true" />
            <span>Prof. {professional.full_name}</span>
          </div>
        )}
        {!isAprendiz && user && (
          <div className="aprendiz-info">
            <User size={14} aria-hidden="true" />
            <span>{user.full_name}</span>
          </div>
        )}
      </div>

      {isAprendiz && (status === "pending" || status === "confirmed") && (
        <div className="card-actions">
          {onReschedule && (
            <button
              onClick={() => onReschedule(appointment)}
              className="btn-secondary"
              aria-label={`Reprogramar cita en ${dependencies?.name}`}
            >
              Reprogramar
            </button>
          )}
          {onCancel && (
            <button
              onClick={() => onCancel(appointment.id)}
              className="btn-danger"
              aria-label={`Cancelar cita en ${dependencies?.name}`}
            >
              Cancelar
            </button>
          )}
          {isAprendiz && status !== "cancelled" && status !== "no_show" && status !== "completed" && onEdit && (
            <button
              onClick={() => onEdit(appointment)}
              className="btn-secondary"
              aria-label={`Editar datos de cita en ${dependencies?.name}`}
            >
              Editar
            </button>
          )}
        </div>
      )}

      {!isAprendiz && status === "pending" && !professional && onAssignProfessional && (
        <div className="card-actions">
          <button
            onClick={() => onAssignProfessional(appointment)}
            className="btn-primary"
            aria-label={`Asignar profesional a cita en ${dependencies?.name}`}
          >
            Asignar Profesional
          </button>
        </div>
      )}

      {!isAprendiz && (status === "pending" || status === "confirmed") && professional && onReschedule && (
        <div className="card-actions">
          <button
            onClick={() => onReschedule(appointment)}
            className="btn-secondary"
            aria-label={`Reprogramar cita en ${dependencies?.name}`}
          >
            Reprogramar
          </button>
        </div>
      )}
    </article>
  );
}
