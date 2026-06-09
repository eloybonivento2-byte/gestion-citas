import { useEffect, useState, useMemo } from "react";
import { useAdmin } from "../hooks/useAdmin";
import { Save, RefreshCcw, Settings, Bell, Clock, Shield } from "lucide-react";

const DEFAULT_CONFIG = [
  {
    key: "max_appointments_per_day",
    label: "Máximo de citas por día por dependencia",
    type: "number",
    icon: Clock,
    description: "Limita cuántas citas puede agendar cada dependencia al día",
  },
  {
    key: "appointment_advance_days",
    label: "Días mínimos de anticipación",
    type: "number",
    icon: Clock,
    description: "Número mínimo de días antes para agendar una cita",
  },
  {
    key: "enable_notifications",
    label: "Notificaciones por email",
    type: "toggle",
    icon: Bell,
    description: "Enviar recordatorios por email antes de la cita",
  },
  {
    key: "require_approval",
    label: "Aprobación manual de citas",
    type: "toggle",
    icon: Shield,
    description: "Requiere aprobación de un profesional antes de confirmar",
  },
];

export function SystemConfig() {
  const { config, fetchConfig, updateConfig, loading } = useAdmin();
  const [saving, setSaving] = useState(null);
  const [edits, setEdits] = useState({});

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const localConfig = useMemo(() => {
    if (config && typeof config === "object") {
      const merged = {};
      DEFAULT_CONFIG.forEach((item) => {
        merged[item.key] = config[item.key] ?? "";
      });
      return merged;
    }
    return {};
  }, [config]);

  const getValue = (key) => edits[key] ?? localConfig[key] ?? "";

  const handleChange = (key, value) => {
    setEdits((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (key) => {
    setSaving(key);
    await updateConfig(key, edits[key] ?? localConfig[key]);
    setEdits((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setSaving(null);
  };

  const handleSaveAll = async () => {
    setSaving("all");
    const keysToSave = Object.keys(edits);
    for (const key of keysToSave) {
      await updateConfig(key, edits[key]);
    }
    setEdits({});
    setSaving(null);
  };

  return (
    <div className="admin-section">
      <div className="section-header">
        <h2>
          <Settings size={20} style={{ verticalAlign: "middle", marginRight: "0.5rem" }} />
          Configuración del Sistema
        </h2>
        <button
          className="btn-secondary"
          onClick={fetchConfig}
          disabled={loading}
        >
          <RefreshCcw size={16} className={loading ? "spinning" : ""} />
          Recargar
        </button>
      </div>

      {Object.keys(localConfig).length === 0 ? (
        <p style={{ color: "#6b7280", padding: "2rem", textAlign: "center" }}>
          No hay configuración disponible. Verifica que las tablas existan en Supabase.
        </p>
      ) : (
        <>
          <div className="config-list">
            {DEFAULT_CONFIG.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.key} className="config-item">
                  <div className="config-item-header">
                    <Icon size={18} />
                    <div>
                      <label>{item.label}</label>
                      <p className="config-description">{item.description}</p>
                    </div>
                  </div>
                  <div className="config-controls">
                    {item.type === "toggle" ? (
                      <button
                        className={`status-toggle ${getValue(item.key) === "true" ? "active" : "inactive"}`}
                        onClick={() =>
                          handleChange(
                            item.key,
                            getValue(item.key) === "true" ? "false" : "true",
                          )
                        }
                      >
                        {getValue(item.key) === "true" ? "Activo" : "Inactivo"}
                      </button>
                    ) : (
                      <input
                        type={item.type}
                        value={getValue(item.key)}
                        onChange={(e) => handleChange(item.key, e.target.value)}
                      />
                    )}
                    <button
                      className="btn-secondary"
                      onClick={() => handleSave(item.key)}
                      disabled={saving === item.key}
                    >
                      <Save size={14} />
                      {saving === item.key ? "Guardando..." : "Guardar"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="config-footer">
            <button
              className="btn-primary"
              onClick={handleSaveAll}
              disabled={saving === "all"}
            >
              <Save size={16} />
              {saving === "all" ? "Guardando todo..." : "Guardar todo"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
