import { supabase } from "../../../lib/supabase";

export class DashboardRepository {
  // KPI: Conteos generales
  static async getKPIs(dateRange) {
    const { data, error } = await supabase.rpc("get_dashboard_kpis", {
      start_date: dateRange.from,
      end_date: dateRange.to,
    });

    if (error) throw new Error(`Error KPIs: ${error.message}`);
    return data;
  }

  // Citas por dependencia (para gráfico de barras)
  static async getAppointmentsByDependency(dateRange) {
    const { data, error } = await supabase
      .from("appointments")
      .select(
        `
        dependency_id,
        dependencies (name, color),
        status
      `,
      )
      .gte("scheduled_date", dateRange.from)
      .lte("scheduled_date", dateRange.to);

    if (error) throw error;

    const grouped = data.reduce((acc, curr) => {
      const depName = curr.dependencies.name;
      const color = curr.dependencies.color;

      if (!acc[depName]) {
        acc[depName] = {
          name: depName,
          color,
          total: 0,
          completed: 0,
          cancelled: 0,
        };
      }

      acc[depName].total++;
      if (curr.status === "completed") acc[depName].completed++;
      if (curr.status === "cancelled") acc[depName].cancelled++;

      return acc;
    }, {});

    return Object.values(grouped);
  }

  // Evolución mensual (línea de tiempo)
  static async getMonthlyTrend(year) {
    const { data, error } = await supabase.rpc("get_monthly_appointments", {
      year_param: year,
    });

    if (error) throw error;
    return data;
  }

  // Ranking de profesionales
  static async getProfessionalPerformance(dateRange) {
    const { data, error } = await supabase
      .from("appointments")
      .select(
        `
        professional_id,
        professional:profiles!professional_id (full_name),
        status,
        scheduled_date
      `,
      )
      .not("professional_id", "is", null)
      .gte("scheduled_date", dateRange.from)
      .lte("scheduled_date", dateRange.to);

    if (error) throw error;

    const grouped = data.reduce((acc, curr) => {
      const profId = curr.professional_id;
      const name = curr.professional?.full_name || "Sin asignar";

      if (!acc[profId]) {
        acc[profId] = {
          id: profId,
          name,
          total: 0,
          completed: 0,
        };
      }

      acc[profId].total++;
      if (curr.status === "completed") acc[profId].completed++;

      return acc;
    }, {});

    return Object.values(grouped)
      .sort((a, b) => b.completed - a.completed)
      .slice(0, 10);
  }

  // Datos crudos para exportar a Excel
  static async getRawDataForExport(dateRange) {
    const { data, error } = await supabase
      .from("appointments")
      .select(
        `
        *,
        dependencies (name),
        aprendiz:profiles!user_id (full_name, document_number),
        professional:profiles!professional_id (full_name)
      `,
      )
      .gte("scheduled_date", dateRange.from)
      .lte("scheduled_date", dateRange.to)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  }
}
