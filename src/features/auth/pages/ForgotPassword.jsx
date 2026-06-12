import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../../lib/supabase";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      });

      if (error) throw error;
      setSent(true);
    } catch (err) {
      setError(err.message || "Error enviando el correo de recuperación");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ textAlign: "center" }}>
          <div style={{ marginBottom: "1.5rem" }}>
            <CheckCircle size={48} color="var(--sena-green)" />
          </div>
          <h1>Correo enviado</h1>
          <p className="auth-subtitle">
            Hemos enviado un enlace de recuperación a <strong>{email}</strong>. 
            Revisa tu bandeja de entrada y sigue las instrucciones.
          </p>
          <Link to="/login" className="btn-primary" style={{ textDecoration: "none", display: "inline-flex", marginTop: "1rem" }}>
            <ArrowLeft size={18} />
            Volver al login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Recuperar contraseña</h1>
        <p className="auth-subtitle">
          Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
        </p>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="forgot-email">Email</label>
            <div style={{ position: "relative" }}>
              <Mail size={18} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
              <input
                id="forgot-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                required
                style={{ paddingLeft: "2.5rem" }}
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Enviando..." : "Enviar enlace de recuperación"}
          </button>
        </form>

        <p className="auth-footer">
          <Link to="/login" className="auth-link" style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
            <ArrowLeft size={16} />
            Volver al login
          </Link>
        </p>
      </div>
    </div>
  );
}
