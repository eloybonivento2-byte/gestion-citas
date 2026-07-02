import { Link } from "react-router-dom";
import { ShieldX } from "lucide-react";

export default function Unauthorized() {
  return (
    <div className="auth-page">
      <div className="auth-card" style={{ textAlign: "center" }}>
        <ShieldX size={64} color="#ef4444" />
        <h1 style={{ marginTop: "1rem", fontSize: "1.5rem", color: "#374151" }}>
          403 - Acceso Denegado
        </h1>
        <p style={{ color: "#6b7280", marginTop: "0.5rem", marginBottom: "1.5rem" }}>
          No tienes permisos para ver esta página.
        </p>
        <Link to="/" className="btn-primary" style={{ textDecoration: "none", display: "inline-flex" }}>
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
