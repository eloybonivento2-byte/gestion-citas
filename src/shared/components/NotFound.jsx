import { Link } from "react-router-dom";
import { AlertTriangle, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="auth-page">
      <div className="auth-card" style={{ textAlign: "center" }}>
        <div style={{ marginBottom: "1.5rem" }}>
          <AlertTriangle size={64} color="#f59e0b" />
        </div>
        <h1 style={{ fontSize: "3rem", fontWeight: 800, color: "var(--sena-dark)", margin: "0 0 0.5rem" }}>
          404
        </h1>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--sena-dark)", margin: "0 0 0.5rem" }}>
          Página no encontrada
        </h2>
        <p className="auth-subtitle">
          La página que buscas no existe o fue movida a otra ubicación.
        </p>
        <Link to="/" className="btn-primary" style={{ textDecoration: "none", display: "inline-flex", marginTop: "1rem" }}>
          <Home size={18} />
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
