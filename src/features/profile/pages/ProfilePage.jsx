import { useState } from "react";
import { useAuth } from "../../../providers/AuthProvider";
import { supabase } from "../../../lib/supabase";
import { Navbar } from "../../../shared/components/Navbar";
import { User, Save, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ProfilePage() {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [documentNumber, setDocumentNumber] = useState(profile?.document_number || "");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          document_number: documentNumber,
          updated_at: new Date(),
        })
        .eq("id", user.id);

      if (error) throw error;
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Error actualizando el perfil");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="dashboard-container">
        <header className="dashboard-header">
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <button className="btn-icon" onClick={() => navigate(-1)}>
              <ArrowLeft size={20} />
            </button>
            <h1>Mi Perfil</h1>
          </div>
        </header>

        <div className="admin-section" style={{ maxWidth: "600px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
            <div className="avatar" style={{ width: "64px", height: "64px", fontSize: "1.5rem" }}>
              {fullName?.[0] || <User size={32} />}
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: "1.25rem" }}>{fullName}</h2>
              <p style={{ margin: 0, color: "#6b7280", fontSize: "0.875rem" }}>{profile?.roles?.name}</p>
            </div>
          </div>

          {success && (
            <div style={{ padding: "0.75rem", background: "#dcfce7", color: "#166534", borderRadius: "var(--radius-sm)", marginBottom: "1rem" }}>
              Perfil actualizado correctamente
            </div>
          )}

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div className="field">
              <label htmlFor="profile-name">Nombre completo</label>
              <input
                id="profile-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="profile-doc">Número de documento</label>
              <input
                id="profile-doc"
                type="text"
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                required
              />
            </div>

            <div className="field">
              <label>Email</label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                style={{ background: "#f9fafb", cursor: "not-allowed" }}
              />
              <small style={{ color: "#6b7280", fontSize: "0.75rem" }}>El email no se puede modificar</small>
            </div>

            <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
              <button type="submit" className="btn-primary" disabled={loading}>
                <Save size={18} />
                {loading ? "Guardando..." : "Guardar Cambios"}
              </button>
              <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
