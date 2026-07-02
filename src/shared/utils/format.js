import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export function formatDate(dateString) {
  try {
    return format(parseISO(dateString), "PPP", { locale: es });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString) {
  try {
    return format(parseISO(dateString), "PPP p", { locale: es });
  } catch {
    return dateString;
  }
}

export const ROLE_LABELS = {
  SUPERADMIN: "Administrador",
  COORDINACION: "Coordinación",
  PSICOLOGIA: "Psicología",
  ENFERMERIA: "Enfermería",
  TRABAJO_SOCIAL: "Trabajo Social",
  APRENDIZ: "Aprendiz",
};

export function getRoleLabel(roleName) {
  return ROLE_LABELS[roleName] || roleName;
}

export const STATUS_LABELS = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  completed: "Completada",
  cancelled: "Cancelada",
  no_show: "No asistió",
};

export function getStatusLabel(status) {
  return STATUS_LABELS[status] || status;
}
