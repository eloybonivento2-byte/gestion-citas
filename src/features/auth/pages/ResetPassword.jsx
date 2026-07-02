import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabase";
import { Lock, Eye, EyeOff } from "lucide-react";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [validSession, setValidSession] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setValidSession(true);
      } else {
        navigate("/login");
      }
    };
    checkSession();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });
      if (updateError) throw updateError;
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.message || "Error al actualizar la contraseña");
    } finally {
      setLoading(false);
    }
  };

  if (!validSession) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <p>Verificando sesión...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div style={{ textAlign: "center" }}>
            <Lock size={48} color="#22c55e" />
            <h2 style={{ marginTop: "1rem", color: "#374151" }}>Contraseña actualizada</h2>
            <p style={{ color: "#6b7280", marginTop: "0.5rem" }}>
              Serás redirigido al inicio de sesión en unos segundos.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <Lock size={48} color="var(--sena-green)" />
          <h2 style={{ marginTop: "1rem", color: "#374151" }}>Restablecer contraseña</h2>
          <p style={{ color: "#6b7280", marginTop: "0.5rem" }}>
            Ingresa tu nueva contraseña
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}

          <div className="field">
            <label>Nueva contraseña</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "0.75rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#9ca3af",
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="field">
            <label>Confirmar contraseña</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repite la contraseña"
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Actualizando..." : "Actualizar contraseña"}
          </button>
        </form>
      </div>
    </div>
  );
}
