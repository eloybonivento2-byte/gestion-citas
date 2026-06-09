import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("UseAuth debe usarse dentro de AuthProvider");
  }
  return context;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async (userId) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*, roles (name, permissions), dependencies(name)")
        .eq("id", userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (err) {
      console.error("Error cargando perfil", err);
      setError("No se pudo cargar el perfil de usuario");
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user && mounted) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        }
      } catch (err) {
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    checkSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          setProfile(null);
        }
      },
    );
    const subscription = listener.subscription;

    return () => {
      mounted = false;
      if (subscription) subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signIn = async (email, password) => {
    try {
      setError(null);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      setUser(data.user);
      await fetchProfile(data.user.id);
      return { success: true, data };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const signUp = async (email, password, userData) => {
    try {
      setError(null);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.full_name,
            document_number: userData.document_number,
          },
        },
      });
      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const hasRole = (requiredRoles) => {
    if (!profile?.roles?.name) return false;
    if (Array.isArray(requiredRoles)) {
      return requiredRoles.includes(profile.roles.name);
    }
    return profile.roles.name === requiredRoles;
  };

  const isAdmin = () => hasRole("SUPERADMIN");
  const isCoordination = () => hasRole(["COORDINACION", "SUPERADMIN"]);
  const isProfessional = () =>
    hasRole(["PSICOLOGIA", "ENFERMERIA", "TRABAJO_SOCIAL"]);
  const isAprendiz = () => hasRole("APRENDIZ");

  const value = {
    user,
    profile,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    hasRole,
    isAdmin,
    isCoordination,
    isProfessional,
    isAprendiz,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
