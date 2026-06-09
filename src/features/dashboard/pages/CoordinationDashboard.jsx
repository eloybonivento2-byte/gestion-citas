import { useEffect, useState } from "react";
import { useDashboard } from "../api/hooks/useDashboard";
import { KPICard } from "../components/KPICard";
import { DependencyChart } from "../components/DependencyChart";
import { MonthlyTrendChart } from "../components/MonthlyTrendChart";
import { ProfessionalTable } from "../components/ProfessionalTable";
import { Navbar } from "../../../shared/components/Navbar";
import { Download, RefreshCcw, Calendar } from "lucide-react";
import { format, subMonths } from "date-fns";


export default function CoordinationDashboard() {
  const {
    kpis,
    byDependency,
    monthlyTrend,
    professionals,
    loading,
    fetchAllMetrics,
    exportToCSV,
  } = useDashboard();

  const [dateRange, setDateRange] = useState({
    from: format(subMonths(new Date(), 1), "yyyy-MM-dd"),
    to: format(new Date(), "yyyy-MM-dd"),
  });

  useEffect(() => {
    fetchAllMetrics(dateRange);
  }, [dateRange, fetchAllMetrics]);

  const handleDateChange = (field, value) => {
    setDateRange((prev) => ({ ...prev, [field]: value }));
  };

  if (loading && !kpis) {
    return <div className="loading-screen">Cargando dashboard...</div>;
  }
  return (
    <>
      <Navbar />
      <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1>Panel de Coordinación</h1>
          <p>Vista general de bienestar institucional</p>
        </div>
        <div className="hero-actions">
            <button
            onClick={() => exportToCSV(dateRange)}
            className="btn-secondary"
            >
              <Download size={18} />
              Exportar CSV
            </button>
        </div>
      </header>

      <div className="date-filter">
        <Calendar size={18} />
        <input 
          type="date"
          value={dateRange.from}
          onChange={(e) => handleDateChange("from", e.target.value)}
        />
      </div>

      {kpis && (
        <section className="kpi-grid">
          <KPICard
              title="Total Citas"
              value={kpis.total_appoinments}
              color="#3b82f6"
              subtitle="En periodo seleccionado"
          />

          <KPICard 
            title="Tasa de Cumplimiento"
            value={`${Math.round((kpis.completed_appointments / kpis.total_appoinments) * 100)}%`}
            color="#22c55e"
            subtitle={`${kpis.completed_appointments} completadas`}
          />

          <KPICard 
            title="Tiempo promedio espera"
            value={`${Math.round(kpis.avg_wait_days || 0)} dias`}
            color="#f59e0b"
            subtitle="Desde solicitud de atención"
          />

          <KPICard 
            title="No Asistencias"
            value={kpis.no_show_count}
            color="#ef4444"
            subtitle={`${Math.round((kpis.no_show_count / kpis.total_appoinments) * 100)}% del total`}
          />
        </section>
      )}

      <section className="charts-grid">
        <DependencyChart data={byDependency} />
        <MonthlyTrendChart data={monthlyTrend} />
      </section>

      <section className="professionals-section">
        <ProfessionalTable data={professionals}/>
      </section>
    </div>
    </>
  );
}
