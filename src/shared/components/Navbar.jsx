import { useAuth } from "../../providers/AuthProvider";
import { useNavigate, Link } from "react-router-dom";
import { LogOut, Heart, User } from "lucide-react";

export function Navbar() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const getRoleLabel = (roleName) => {
    const labels = {
      SUPERADMIN: "Administrador",
      COORDINACION: "Coordinación",
      PSICOLOGIA: "Psicología",
      ENFERMERIA: "Enfermería",
      TRABAJO_SOCIAL: "Trabajo Social",
      APRENDIZ: "Aprendiz",
    };
    return labels[roleName] || roleName;
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Heart size={24} className="navbar-logo" />
        <span className="navbar-title">SENA Bienestar</span>
      </div>

      <div className="navbar-user">
        <div className="navbar-profile">
          <span className="navbar-name">{profile?.full_name}</span>
          <span className="navbar-role">{getRoleLabel(profile?.roles?.name)}</span>
        </div>
        <Link to="/profile" className="btn-logout" title="Mi perfil" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "36px", height: "36px", background: "rgba(255, 255, 255, 0.1)", borderRadius: "var(--radius-sm)", color: "white", textDecoration: "none" }}>
          <User size={20} />
        </Link>
        <button onClick={handleLogout} className="btn-logout" title="Cerrar sesión">
          <LogOut size={20} />
        </button>
      </div>
    </nav>
  );
}
