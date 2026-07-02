import { useEffect, useState } from "react";
import { useAppointments } from "../hooks/useAppointments";
import { AppointmentCard } from "../components/AppointmentCard";
import { AssignProfessionalModal } from "../components/AssignProfessionalModal";
import { useAuth } from "../../../providers/AuthProvider";
import { Navbar } from "../../../shared/components/Navbar";
import { UserCheck } from "lucide-react";

export default function ProfessionalDashboard() {
  const {
    appointments,
    fetchAppointments,
    updateStatus,
    assignProfessional,
    getProfessionals,
    isLoading,
  } = useAppointments();
  const { profile } = useAuth();
  const [filter, setFilter] = useState("pending");
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [professionals, setProfessionals] = useState([]);

  useEffect(() => {
    fetchAppointments({ status: filter });
  }, [filter, fetchAppointments]);

  const handleConfirm = (id) => updateStatus(id, "confirmed");
  const handleComplete = (id, notes) => updateStatus(id, "completed", notes);
  const handleNoShow = (id) => updateStatus(id, "no_show");

  const handleOpenAssignModal = async (appointment) => {
    setSelectedAppointment(appointment);
    const profs = await getProfessionals(profile.dependency_id);
    setProfessionals(profs);
    setShowAssignModal(true);
  };

  return (
    <>
      <Navbar />
      <div className="dashboard-container">
        <header className="dashboard-header">
          <div className="header-content">
            <div className="header-icon">
              <UserCheck size={32} />
            </div>
            <div className="header-text">
              <h1 className="main-title">Citas - {profile?.dependencies?.name}</h1>
              <p className="subtitle">Gestiona y coordina las citas para tu dependencia de bienestar SENA</p>
            </div>
          </div>
          <div className="filter-tabs">
            {["pending", "confirmed", "completed", "cancelled", "no_show"].map((status) => (
              <button
                key={status}
                className={filter === status ? "active" : ""}
                onClick={() => setFilter(status)}
              >
                {status === "pending" && "Pendientes"}
                {status === "confirmed" && "Confirmadas"}
                {status === "completed" && "Historial"}
                {status === "cancelled" && "Canceladas"}
                {status === "no_show" && "No asistió"}
              </button>
            ))}
          </div>
        </header>

        <div className="appointments-grid">
          {isLoading ? (
            <p>Cargando citas...</p>
          ) : (
            appointments.map((apt) => (
              <div key={apt.id} className="appointment-wrapper">
                <AppointmentCard
                  appointment={apt}
                  isAprendiz={false}
                  onAssignProfessional={handleOpenAssignModal}
                />

                {filter === "pending" && (
                  <div className="professional-actions">
                    <button
                      onClick={() => handleConfirm(apt.id)}
                      className="btn-success"
                    >
                      Confirmar
                    </button>
                    <button
                      onClick={() => handleNoShow(apt.id)}
                      className="btn-secondary"
                    >
                      No asistió
                    </button>
                  </div>
                )}

                {filter === "confirmed" && (
                  <div className="professional-actions">
                    <button
                      onClick={() =>
                        handleComplete(apt.id, "Atención completada")
                      }
                      className="btn-primary"
                    >
                      Completar Atención
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {showAssignModal && selectedAppointment && (
        <AssignProfessionalModal
          appointment={selectedAppointment}
          professionals={professionals}
          onClose={() => {
            setShowAssignModal(false);
            setSelectedAppointment(null);
          }}
          onAssign={assignProfessional}
        />
      )}
    </>
  );
}
