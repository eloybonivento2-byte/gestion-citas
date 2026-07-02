-- =============================================
-- ESQUEMA DE BASE DE DATOS - GESTIÓN DE CITAS SENA BIENESTAR
-- Ejecutar en Supabase SQL Editor
-- =============================================

-- 1. TABLA DE ROLES
CREATE TABLE IF NOT EXISTS roles (
  id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABLA DE DEPENDENCIAS
CREATE TABLE IF NOT EXISTS dependencies (
  id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name VARCHAR(100) NOT NULL,
  color VARCHAR(7) DEFAULT '#6b7280',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLA DE PERFILES (vinculada a auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(200) NOT NULL,
  document_number VARCHAR(20),
  email VARCHAR(200),
  role_id INT REFERENCES roles(id) DEFAULT 6,
  dependency_id INT REFERENCES dependencies(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLA DE CITAS
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  professional_id UUID REFERENCES profiles(id),
  dependency_id INT REFERENCES dependencies(id) NOT NULL,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
  reason TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABLA DE AUDITORÍA
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id VARCHAR(100),
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABLA DE CONFIGURACIÓN DEL SISTEMA
CREATE TABLE IF NOT EXISTS system_config (
  id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_by UUID REFERENCES profiles(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- DATOS INICIALES
-- =============================================

-- Roles predeterminados
INSERT INTO roles (name, description) VALUES
  ('SUPERADMIN', 'Administrador con acceso total'),
  ('COORDINACION', 'Coordinación de bienestar'),
  ('PSICOLOGIA', 'Profesional de psicología'),
  ('ENFERMERIA', 'Profesional de enfermería'),
  ('TRABAJO_SOCIAL', 'Profesional de trabajo social'),
  ('APRENDIZ', 'Aprendiz SENA')
ON CONFLICT (name) DO NOTHING;

-- Dependencias predeterminadas
INSERT INTO dependencies (name, color) VALUES
  ('Psicología', '#3b82f6'),
  ('Enfermería', '#22c55e'),
  ('Trabajo Social', '#f59e0b')
ON CONFLICT DO NOTHING;

-- Configuración del sistema predeterminada
INSERT INTO system_config (key, value) VALUES
  ('max_appointments_per_day', '30'),
  ('appointment_advance_days', '1'),
  ('enable_notifications', 'true'),
  ('require_approval', 'false')
ON CONFLICT (key) DO NOTHING;

-- =============================================
-- TRIGGER: Auto-crear perfil al registrarse
-- =============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Sin nombre'),
    COALESCE(NEW.email, ''),
    6  -- Rol APRENDIZ por defecto
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger en auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- =============================================
-- FUNCIÓN RPC: Dashboard KPIs
-- =============================================

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

-- =============================================
-- FUNCIÓN RPC: Tendencia mensual de citas
-- =============================================

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

-- =============================================
-- RLS (Row Level Security) - Opcional pero recomendado
-- =============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;

-- Profiles: los usuarios ven su propio perfil, los admin ven todos
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admin can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role_id = 1)
  );

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Appointments: aprendices ven sus citas, profesionales ven citas de su dependencia
CREATE POLICY "Aprendiz can view own appointments" ON appointments
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Professional can view dependency appointments" ON appointments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND role_id IN (2, 3, 4, 5)
        AND (dependency_id = appointments.dependency_id OR role_id IN (1, 2))
    )
  );

CREATE POLICY "Aprendiz can create appointments" ON appointments
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own appointments" ON appointments
  FOR UPDATE USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role_id IN (1, 2, 3, 4, 5)
    )
  );

-- Audit logs: solo admins
CREATE POLICY "Admin can view audit logs" ON audit_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role_id = 1)
  );

-- System config: solo admins
CREATE POLICY "Admin can manage config" ON system_config
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role_id = 1)
  );

-- Dependencies: todos los usuarios autenticados pueden leer
ALTER TABLE dependencies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view dependencies" ON dependencies
  FOR SELECT USING (auth.role() = 'authenticated');
