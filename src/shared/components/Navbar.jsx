import { useAuth } from "../../providers/AuthProvider";
import { useNavigate } from "react-router-dom";
import { LogOut, Heart } from "lucide-react";

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
        <button onClick={handleLogout} className="btn-logout" title="Cerrar sesión">
          <LogOut size={20} />
        </button>
      </div>
    </nav>
  );
}
