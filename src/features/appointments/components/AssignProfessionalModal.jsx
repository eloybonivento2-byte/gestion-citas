import { useState } from "react";
import { X, UserCheck } from "lucide-react";

export function AssignProfessionalModal({ appointment, professionals, onClose, onAssign }) {
  const [selectedProfessional, setSelectedProfessional] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProfessional) return;

    setLoading(true);
    await onAssign(appointment.id, selectedProfessional);
    setLoading(false);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <header className="section-header" style={{ marginBottom: "1.5rem" }}>
          <h2>Asignar Profesional</h2>
          <button className="btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </header>

        <div style={{ marginBottom: "1rem", padding: "1rem", background: "#f9fafb", borderRadius: "var(--radius-md)" }}>
          <p style={{ margin: 0, fontSize: "0.875rem", color: "#6b7280" }}>Cita de:</p>
          <p style={{ margin: "0.25rem 0 0", fontWeight: 600 }}>{appointment.user?.full_name}</p>
          <p style={{ margin: "0.25rem 0 0", fontSize: "0.875rem", color: "#6b7280" }}>
            {appointment.scheduled_date} a las {appointment.scheduled_time}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="professional">Seleccionar profesional</label>
            <select
              id="professional"
              value={selectedProfessional}
              onChange={(e) => setSelectedProfessional(e.target.value)}
              required
            >
              <option value="">Seleccionar...</option>
              {professionals.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
            <button type="submit" className="btn-primary" disabled={loading || !selectedProfessional}>
              <UserCheck size={18} />
              {loading ? "Asignando..." : "Asignar"}
            </button>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
