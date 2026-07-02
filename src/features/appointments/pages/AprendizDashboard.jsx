import { useEffect, useState } from "react";
import { useAppointments } from "../hooks/useAppointments";
import { AppointmentForm } from "../components/AppointmentForm";
import { AppointmentCard } from "../components/AppointmentCard";
import { Navbar } from "../../../shared/components/Navbar";
import { BottomNav } from "../../../shared/components/BottomNav";
import { Plus, Calendar, X } from "lucide-react";

export default function AprendizDashboard() {
  const { appointments, fetchAppointments, cancelAppointment, rescheduleAppointment, editAppointment, isLoading } =
    useAppointments();
  const [showForm, setShowForm] = useState(false);
  const [showRescheduleForm, setShowRescheduleForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("08:00");
  const [editFormData, setEditFormData] = useState({ reason: "" });

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleReschedule = (appointment) => {
    setSelectedAppointment(appointment);
    setShowRescheduleForm(true);
  };

  const handleEdit = (appointment) => {
    setSelectedAppointment(appointment);
    setEditFormData({ reason: appointment.reason || "" });
    setShowEditForm(true);
  };

  const handleEditSubmit = async () => {
    if (!selectedAppointment || !editFormData.reason) return;
    const result = await editAppointment(selectedAppointment.id, editFormData);
    if (result.success) {
      setShowEditForm(false);
      setSelectedAppointment(null);
      setEditFormData({ reason: "" });
      fetchAppointments();
    }
  };

  return (
    <>
      <Navbar />
      <main id="main-content" className="dashboard-container" role="main">
        <header className="dashboard-header">
          <div className="header-content">
            <div className="header-icon">
              <Calendar size={32} />
            </div>
            <div className="header-text">
              <h1 className="main-title">Gestión de Citas</h1>
              <p className="subtitle">Administra tus citas de bienestar</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary create-appointment-btn"
            aria-label="Crear nueva cita"
          >
            <Plus size={20} />
            <span>Nueva Cita</span>
          </button>
        </header>

        {showForm && (
          <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Nueva cita">
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Solicitar Nueva Cita</h2>
              <AppointmentForm
                onSuccess={() => {
                  setShowForm(false);
                  fetchAppointments();
                }}
              />
            </div>
          </div>
        )}

        {showRescheduleForm && selectedAppointment && (
          <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Reprogramar cita">
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <header className="section-header">
                <h2>Reprogramar Cita</h2>
                <button className="btn-icon" onClick={() => setShowRescheduleForm(false)} aria-label="Cerrar">
                  <X size={20} />
                </button>
              </header>

              <div style={{ marginBottom: "1rem", padding: "1rem", background: "#f9fafb", borderRadius: "var(--radius-md)" }}>
                <p style={{ margin: 0, fontSize: "0.875rem", color: "#6b7280" }}>Cita actual:</p>
                <p style={{ margin: "0.25rem 0 0", fontWeight: 600 }}>{selectedAppointment?.dependencies?.name}</p>
                <p style={{ margin: "0.25rem 0 0", fontSize: "0.875rem", color: "#6b7280" }}>
                  {selectedAppointment?.scheduled_date} a las {selectedAppointment?.scheduled_time}
                </p>
              </div>

              <div className="field-row">
                <div className="field">
                  <label htmlFor="reschedule-date">Nueva Fecha</label>
                  <input
                    id="reschedule-date"
                    type="date"
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="field">
                  <label htmlFor="reschedule-time">Nueva Hora</label>
                  <select
                    id="reschedule-time"
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                  >
                    {Array.from({ length: 9 }, (_, i) => {
                      const hour = (8 + i).toString().padStart(2, "0");
                      return (
                        <option key={hour} value={`${hour}:00`}>
                          {hour}:00
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
                <button
                  onClick={async () => {
                    if (!rescheduleDate) return;
                    const result = await rescheduleAppointment(selectedAppointment.id, rescheduleDate, rescheduleTime);
                    if (result.success) {
                      setShowRescheduleForm(false);
                      setSelectedAppointment(null);
                      setRescheduleDate("");
                      setRescheduleTime("08:00");
                      fetchAppointments();
                    }
                  }}
                  className="btn-primary"
                  disabled={!rescheduleDate}
                >
                  Confirmar Reprogramación
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setShowRescheduleForm(false);
                    setSelectedAppointment(null);
                    setRescheduleDate("");
                    setRescheduleTime("08:00");
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {showEditForm && selectedAppointment && (
          <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Editar cita">
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Editar Datos de la Cita</h2>
              <div className="field">
                <label htmlFor="edit-reason">Motivo</label>
                <textarea
                  id="edit-reason"
                  value={editFormData.reason}
                  onChange={(e) => setEditFormData({ ...editFormData, reason: e.target.value })}
                  rows="4"
                />
              </div>
              <button
                onClick={handleEditSubmit}
                className="btn-primary"
                disabled={!editFormData.reason}
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        )}

        <section className="appointments-list" aria-label="Lista de citas">
          {isLoading ? (
            <div className="loading-screen" role="status">
              <div className="loading-spinner" />
              <p>Cargando tus citas...</p>
            </div>
          ) : appointments.length === 0 ? (
            <div className="empty-state">
              <Calendar size={48} style={{ margin: "0 auto 1rem", color: "#9ca3af" }} />
              <p>No tienes citas agendadas</p>
              <button onClick={() => setShowForm(true)} className="btn-link">
                Agenda tu primera cita aquí
              </button>
            </div>
          ) : (
            appointments.map((apt) => (
              <AppointmentCard
                key={apt.id}
                appointment={apt}
                isAprendiz={true}
                onCancel={() => cancelAppointment(apt.id)}
                onReschedule={handleReschedule}
                onEdit={handleEdit}
              />
            ))
          )}
        </section>
      </main>
      <BottomNav />
    </>
  );
}
