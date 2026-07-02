import { supabase } from "../../../lib/supabase";

export class AppointmentRepository {
  // CREATE: Crear nueva cita
  static async create(appointmentData) {
    const { data, error } = await supabase
      .from("appointments")
      .insert([appointmentData])
      .select(
        `
        *,
        dependencies (name, color),
        professional:profiles!professional_id (full_name)
      `,
      )
      .single();

    if (error) throw new Error(`Error creando cita: ${error.message}`);
    return data;
  }

  // READ: Obtener citas según filtros
  static async fetch({ userId, dependencyId, status, dateFrom, dateTo }) {
    let query = supabase.from("appointments").select(`
        *,
        dependencies (name, color),
        user:profiles!appointments_user_id_fkey (full_name, document_number),
        professional:profiles!appointments_professional_id_fkey (full_name)
      `);

    if (userId) query = query.eq("user_id", userId);
    if (dependencyId) query = query.eq("dependency_id", dependencyId);
    if (status) query = query.eq("status", status);
    if (dateFrom) query = query.gte("scheduled_date", dateFrom);
    if (dateTo) query = query.lte("scheduled_date", dateTo + " 23:59:59");

    query = query
      .order("scheduled_date", { ascending: true })
      .order("scheduled_time", { ascending: true });

    const { data, error } = await query;
    if (error) throw new Error(`Error fetching citas: ${error.message}`);
    return data || [];
  }

  // UPDATE: Actualizar estado o notas
  static async update(id, updates) {
    const { data, error } = await supabase
      .from("appointments")
      .update({ ...updates, updated_at: new Date() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(`Error actualizando cita: ${error.message}`);
    return data;
  }

  // CHECK AVAILABILITY: Verificar si horario está libre
  static async checkAvailability(dependencyId, date, time, excludeId = null) {
    let query = supabase
      .from("appointments")
      .select("id")
      .eq("dependency_id", dependencyId)
      .eq("scheduled_date", date)
      .eq("scheduled_time", time)
      .in("status", ["pending", "confirmed"]);

    if (excludeId) query = query.neq("id", excludeId);

    const { data, error } = await query;
    if (error) throw error;
    return data.length === 0;
  }

  // COUNT PENDING: Contar citas pendientes de un usuario (límite de 2)
  static async countPending(userId) {
    const { count, error } = await supabase
      .from("appointments")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "pending");

    if (error) throw error;
    return count;
  }

  // ASSIGN PROFESSIONAL: Asignar profesional a una cita
  static async assignProfessional(appointmentId, professionalId) {
    const { data, error } = await supabase
      .from("appointments")
      .update({ professional_id: professionalId, updated_at: new Date() })
      .eq("id", appointmentId)
      .select(`
        *,
        dependencies (name, color),
        user:profiles!appointments_user_id_fkey (full_name, document_number),
        professional:profiles!appointments_professional_id_fkey (full_name)
      `)
      .single();

    if (error) throw new Error(`Error asignando profesional: ${error.message}`);
    return data;
  }

  // GET PROFESSIONALS BY DEPENDENCY: Obtener profesionales de una dependencia
  static async getProfessionalsByDependency(dependencyId) {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name")
      .eq("dependency_id", dependencyId)
      .eq("is_active", true)
      .in("role_id", [3, 4, 5]);

    if (error) throw error;
    return data || [];
  }

  // RESCHEDULE: Reprogramar una cita (cambiar fecha y hora)
  static async reschedule(appointmentId, newDate, newTime) {
    const { data, error } = await supabase
      .from("appointments")
      .update({
        scheduled_date: newDate,
        scheduled_time: newTime,
        status: "pending",
        professional_id: null,
        notes: null,
        updated_at: new Date(),
      })
      .eq("id", appointmentId)
      .select(
        `*,
        dependencies (name, color),
        user:profiles!appointments_user_id_fkey (full_name, document_number),
        professional:profiles!appointments_professional_id_fkey (full_name)
      `
      )
      .single();

    if (error) throw new Error(`Error reprogramando cita: ${error.message}`);
    return data;
  }

  // EDIT: Editar datos básicos de una cita (motivo, notas)
  static async edit(appointmentId, updates) {
    const { data, error } = await supabase
      .from("appointments")
      .update({
        ...updates,
        updated_at: new Date(),
      })
      .eq("id", appointmentId)
      .select(
        `*,
        dependencies (name, color),
        user:profiles!appointments_user_id_fkey (full_name, document_number),
        professional:profiles!appointments_professional_id_fkey (full_name)
      `
      )
      .single();

    if (error) throw new Error(`Error actualizando cita: ${error.message}`);
    return data;
  }
}
