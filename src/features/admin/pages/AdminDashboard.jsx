import { useState } from "react";
import { UserManagement } from "./components/UserManagement";
import { AuditLogViewer } from "./components/AuditLogViewer";
import { SystemConfig } from "./components/SystemConfig";
import { Navbar } from "../../../shared/components/Navbar";
import { Users, ClipboardList, Settings } from "lucide-react";

const TABS = [
  { id: "users", label: "Usuarios", icon: Users },
  { id: "audit", label: "Auditoría", icon: ClipboardList },
  { id: "config", label: "Configuración", icon: Settings },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("users");

  return (
    <>
      <Navbar />
      <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Panel de Administración</h1>
      </header>

      <div className="filter-tabs">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={activeTab === tab.id ? "active" : ""}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "users" && <UserManagement />}
      {activeTab === "audit" && <AuditLogViewer />}
      {activeTab === "config" && <SystemConfig />}
    </div>
    </>
  );
}
