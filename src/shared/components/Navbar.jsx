import { useState } from "react";
import { useAuth } from "../../providers/AuthProvider";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { LogOut, Heart, User, Menu, X, Calendar, Home, Settings } from "lucide-react";

const NAV_ROUTES = [
  { path: "/dashboard", label: "Mis Citas", icon: Calendar, roles: ["APRENDIZ"] },
  { path: "/professional", label: "Citas", icon: Calendar, roles: ["PSICOLOGIA", "ENFERMERIA", "TRABAJO_SOCIAL"] },
  { path: "/coordination", label: "Panel", icon: Home, roles: ["COORDINACION", "SUPERADMIN"] },
  { path: "/admin", label: "Admin", icon: Settings, roles: ["SUPERADMIN"] },
  { path: "/profile", label: "Mi Perfil", icon: User, roles: ["*"] },
];

export function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const roleName = profile?.roles?.name;

  const handleLogout = async () => {
    setDrawerOpen(false);
    await signOut();
    navigate("/login");
  };

  const handleNavigate = (path) => {
    setDrawerOpen(false);
    navigate(path);
  };

  const getRoleLabel = (name) => {
    const labels = {
      SUPERADMIN: "Administrador",
      COORDINACION: "Coordinación",
      PSICOLOGIA: "Psicología",
      ENFERMERIA: "Enfermería",
      TRABAJO_SOCIAL: "Trabajo Social",
      APRENDIZ: "Aprendiz",
    };
    return labels[name] || name;
  };

  const navItems = NAV_ROUTES.filter(
    (item) => item.roles.includes("*") || item.roles.includes(roleName)
  );

  return (
    <>
      <a href="#main-content" className="skip-link">
        Saltar al contenido principal
      </a>

      <nav className="navbar" role="navigation" aria-label="Barra de navegación principal">
        {/* Hamburger (mobile) */}
        <button
          className="navbar-hamburger"
          onClick={() => setDrawerOpen(true)}
          aria-label="Abrir menú"
          aria-expanded={drawerOpen}
        >
          <Menu size={24} />
        </button>

        <div className="navbar-brand">
          <Heart size={24} className="navbar-logo" />
          <span className="navbar-title">SENA Bienestar</span>
        </div>

        <div className="navbar-user">
          <div className="navbar-profile hide-mobile">
            <span className="navbar-name">{profile?.full_name}</span>
            <span className="navbar-role">{getRoleLabel(roleName)}</span>
          </div>
          <Link
            to="/profile"
            className="btn-logout hide-mobile"
            title="Mi perfil"
            aria-label="Mi perfil"
          >
            <User size={20} />
          </Link>
          <button
            onClick={handleLogout}
            className="btn-logout hide-mobile"
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
          >
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      {/* Drawer overlay */}
      <div
        className={`drawer-overlay ${drawerOpen ? "open" : ""}`}
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside className={`drawer ${drawerOpen ? "open" : ""}`} aria-label="Menú de navegación">
        <div className="drawer-header">
          <h2>{profile?.full_name}</h2>
          <p>{getRoleLabel(roleName)}</p>
        </div>

        <nav className="drawer-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                className={`drawer-nav-item ${isActive ? "active" : ""}`}
                onClick={() => handleNavigate(item.path)}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="drawer-footer">
          <button className="drawer-logout" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
}
