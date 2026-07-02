-- =============================================
-- SCRIPT COMPLETO DE REPARACIÓN
-- Ejecutar en Supabase SQL Editor
-- IMPORTANTE: Ejecutar en orden
-- =============================================

-- 0. DROP functions existentes con tipo de retorno incorrecto
DROP FUNCTION IF EXISTS get_dashboard_kpis(date, date);
DROP FUNCTION IF EXISTS get_monthly_appointments(int);

-- 1. INSERTAR DEPENDENCIAS FALTANTES
INSERT INTO dependencies (name, color) VALUES
  ('Psicología', '#3b82f6'),
  ('Enfermería', '#22c55e'),
  ('Trabajo Social', '#f59e0b')
ON CONFLICT DO NOTHING;

-- 2. INSERTAR CONFIGURACIÓN DEL SISTEMA
INSERT INTO system_config (key, value) VALUES
  ('max_appointments_per_day', '30'),
  ('appointment_advance_days', '1'),
  ('enable_notifications', 'true'),
  ('require_approval', 'false')
ON CONFLICT (key) DO NOTHING;

-- 3. FUNCIÓN RPC: Dashboard KPIs
CREATE OR REPLACE FUNCTION get_dashboard_kpis(
  start_date DATE DEFAULT NULL,
  end_date DATE DEFAULT NULL
)
RETURNS TABLE (
  total_appoinments BIGINT,
  pending_appointments BIGINT,
  completed_appointments BIGINT,
  cancelled_appointments BIGINT,
  no_show_count BIGINT,
  unique_users BIGINT,
  avg_wait_days NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_appoinments,
    COUNT(*) FILTER (WHERE a.status = 'pending')::BIGINT as pending_appointments,
    COUNT(*) FILTER (WHERE a.status = 'completed')::BIGINT as completed_appointments,
    COUNT(*) FILTER (WHERE a.status = 'cancelled')::BIGINT as cancelled_appointments,
    COUNT(*) FILTER (WHERE a.status = 'no_show')::BIGINT as no_show_count,
    COUNT(DISTINCT a.user_id)::BIGINT as unique_users,
    COALESCE(AVG(EXTRACT(DAY FROM (a.updated_at - a.created_at))), 0)::NUMERIC as avg_wait_days
  FROM appointments a
  WHERE (start_date IS NULL OR a.scheduled_date >= start_date)
    AND (end_date IS NULL OR a.scheduled_date <= end_date);
END;
$$ LANGUAGE plpgsql;

-- 4. FUNCIÓN RPC: Tendencia mensual de citas
CREATE OR REPLACE FUNCTION get_monthly_appointments(year_param INT DEFAULT NULL)
RETURNS TABLE (
  month INT,
  month_name VARCHAR(3),
  total BIGINT,
  completed BIGINT
) AS $$
DECLARE
  target_year INT := COALESCE(year_param, EXTRACT(YEAR FROM CURRENT_DATE));
BEGIN
  RETURN QUERY
  SELECT
    EXTRACT(MONTH FROM a.scheduled_date)::INT as month,
    TO_CHAR(a.scheduled_date, 'Mon')::VARCHAR(3) as month_name,
    COUNT(*)::BIGINT as total,
    COUNT(*) FILTER (WHERE a.status = 'completed')::BIGINT as completed
  FROM appointments a
  WHERE EXTRACT(YEAR FROM a.scheduled_date) = target_year
  GROUP BY EXTRACT(MONTH FROM a.scheduled_date), TO_CHAR(a.scheduled_date, 'Mon')
  ORDER BY month;
END;
$$ LANGUAGE plpgsql;

-- 5. TRIGGER: Auto-crear perfil al registrarse
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Sin nombre'),
    COALESCE(NEW.email, ''),
    6
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- 6. RECARGAR SCHEMA
NOTIFY pgrst, 'reload schema';
