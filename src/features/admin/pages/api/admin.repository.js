import { supabase } from '../../../../lib/supabase';

export class AdminRepository {
    // USUARIOS: Listar con filtros y paginación
    static async getUsers({ role, status, search, page = 1, limit = 20 }) {
        let query = supabase
        .from('profiles')
        .select(`
            *,
            roles (name, description),
            dependencies (name)
            `, { count: 'exact' });

        if (role) query = query.eq('roles.name', role);
        if (status !== undefined) query = query.eq('is_active', status);
        if (search) {
            query = query.or(`full_name.ilike.%${search}%.document_number.ilike.%${search}%`);
        }

        const from = (page - 1) * limit;
        const to = from + limit - 1;

        const { data, error, count } = await query.range(from, to);

        if (error) throw new Error(`Error fetching users: ${error.message}`);
        return { users: data, total: count, page, totalPages: Math.ceil(count / limit) };
    }

    // USUARIOS: Actualizar rol, dependencia o Estado
    static async updateUser(userId, updates, adminId) {
        // 1. Obtener datos actuales para auditoria
        const { data: oldData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        // 2. Aplicar cambios 
        const { data: newData, error } = await supabase
            .from('profiles')
            .update({...updates, updated_at: new Date() })
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;

        // 3. Registrar en auditoria
        await this.logAction({
            userId: adminId,
            action: 'UPDATE_USER',
            entityType: 'user',
            entityId: userId,
            oldData,
            newData
        });

        return newData;
    }

    // USUARIOS: Crear nuevo usuario (invitación)
    static async createUser({ email, password, fullName, roleId, dependencyId }, adminId) {
        // 1. Crear en auth.users
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: fullName }
        });

        if (authError) throw authError;

        // 2. El trigger creará el perfil, pero actualizamos rol/dependencia
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .update({ role_id: roleId, dependencyId})
            .eq('id', authData.user.id)
            .select()
            .single();
        if (profileError) throw profileError;

        // 3. Auditar
        await this.logAction({
            userId: adminId,
            action: 'CREATE_USER',
            entityType: 'user',
            entityId: authData.user.id,
            newData: profile
        });

        return profile;
    }

    // AUDITORIA: Obtener logs con filtros
    static async getAuditLogs({ action, userId, dateFrom, dateTo, page = 1, limit = 50}) {
        let query = supabase
            .from('audit_logs')
            .select(`
                *,
                admin:profiles!user_id (full_name, email)
                `, { count: 'exact' });

        if (action) query = query.eq('action', action);
        if (userId) query = query.eq('user_id', userId);
        if (dateFrom) query = query.gte('created_at', dateFrom);
        if (dateTo) query = query.lte('created_at', dateTo);

        const from = (page - 1) * limit;
        const { data, error, count } = await query
            .order('created_at', { ascending: false })
            .range(from, from +  limit - 1);
        if (error) throw error;
        return { logs: data, total: count };
    }

    // CONFIGURACIÓN: Obtener y Actualizar
    static async getConfig() {
        const { data, error } = await supabase
            .from('system_config')
            .select('*');
        if (error) throw error;
        return data.reduce((acc, item) => ({ ...acc, [item.key]: item.value }), {});
    }

    static async updateConfig(key, value, adminId) {
        const { data: oldConfig } = await supabase
            .from('system_config')
            .select('*')
            .eq('key', key)
            .single();

        const { data, error } = await supabase
            .from('system_config')
            .update({
                value,
                updated_by: adminId,
                updated_at: new Date()
            })
            .eq('key', key)
            .select()
            .single();

        if (error) throw error;

        await this.logAction({
            userId: adminId,
            action: 'UPDATE_CONFIG',
            entityType: 'config',
            entityId: key,
            oldData: oldConfig,
            newData: data
        });

        return data;
    }
}
