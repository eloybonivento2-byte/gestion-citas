import { Link } from "react-router-dom";
import { Calendar, Shield, Clock, Users } from "lucide-react";

export default function HomePage() {
  return (
    <div className="auth-page" style={{ flexDirection: "column", gap: "2rem" }}>
      <div className="auth-card" style={{ maxWidth: "600px", textAlign: "center" }}>
        <div style={{ marginBottom: "1.5rem" }}>
          <Calendar size={48} color="var(--sena-green)" />
        </div>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--sena-dark)", margin: "0 0 0.5rem" }}>
          SENA Bienestar
        </h1>
        <p className="auth-subtitle" style={{ fontSize: "1rem", marginBottom: "2rem" }}>
          Plataforma de gestión de citas para el bienestar de los aprendices
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1.5rem", marginBottom: "2rem", textAlign: "center" }}>
          <div style={{ padding: "1rem" }}>
            <Shield size={32} color="var(--sena-green)" style={{ marginBottom: "0.5rem" }} />
            <h3 style={{ fontSize: "0.875rem", fontWeight: 600, margin: "0 0 0.25rem" }}>Seguro</h3>
            <p style={{ fontSize: "0.75rem", color: "#6b7280", margin: 0 }}>Tus datos están protegidos</p>
          </div>
          <div style={{ padding: "1rem" }}>
            <Clock size={32} color="var(--sena-green)" style={{ marginBottom: "0.5rem" }} />
            <h3 style={{ fontSize: "0.875rem", fontWeight: 600, margin: "0 0 0.25rem" }}>Rápido</h3>
            <p style={{ fontSize: "0.75rem", color: "#6b7280", margin: 0 }}>Agenda en minutos</p>
          </div>
          <div style={{ padding: "1rem" }}>
            <Users size={32} color="var(--sena-green)" style={{ marginBottom: "0.5rem" }} />
            <h3 style={{ fontSize: "0.875rem", fontWeight: 600, margin: "0 0 0.25rem" }}>Personalizado</h3>
            <p style={{ fontSize: "0.75rem", color: "#6b7280", margin: 0 }}>Atención especializada</p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/login" className="btn-primary" style={{ textDecoration: "none", padding: "0.75rem 2rem" }}>
            Iniciar Sesión
          </Link>
          <Link to="/register" className="btn-secondary" style={{ textDecoration: "none", padding: "0.75rem 2rem" }}>
            Crear Cuenta
          </Link>
        </div>
      </div>
    </div>
  );
}
