import { useLocation, useNavigate } from "react-router-dom";
import { Calendar, Home, User, LogOut } from "lucide-react";
import { useAuth } from "../../providers/AuthProvider";

const NAV_ITEMS = [
  { path: "/dashboard", label: "Mis Citas", icon: Calendar, roles: ["APRENDIZ"] },
  { path: "/professional", label: "Citas", icon: Calendar, roles: ["PSICOLOGIA", "ENFERMERIA", "TRABAJO_SOCIAL"] },
  { path: "/coordination", label: "Panel", icon: Home, roles: ["COORDINACION", "SUPERADMIN"] },
  { path: "/admin", label: "Admin", icon: Home, roles: ["SUPERADMIN"] },
  { path: "/profile", label: "Perfil", icon: User, roles: ["*"] },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const roleName = profile?.roles?.name;

  const items = NAV_ITEMS.filter(
    (item) => item.roles.includes("*") || item.roles.includes(roleName)
  );

  return (
    <nav className="bottom-nav" role="navigation" aria-label="Navegación principal">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <button
            key={item.path}
            className={`bottom-nav-item ${isActive ? "active" : ""}`}
            onClick={() => navigate(item.path)}
            aria-label={item.label}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
            <span>{item.label}</span>
          </button>
        );
      })}
      <button
        className="bottom-nav-item logout"
        onClick={signOut}
        aria-label="Cerrar sesión"
      >
        <LogOut size={22} strokeWidth={1.8} />
        <span>Salir</span>
      </button>
    </nav>
  );
}
