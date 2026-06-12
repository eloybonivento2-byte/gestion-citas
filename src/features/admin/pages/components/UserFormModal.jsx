import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X } from "lucide-react";

const schema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres").optional().or(z.literal("")),
  fullName: z.string().min(3, "Nombre requerido"),
  documentNumber: z.string().min(5, "Documento requerido"),
  roleId: z.number({ required_error: "Rol requerido" }),
  dependencyId: z.number().optional().nullable(),
});

const ROLES = [
  { id: 1, name: "SUPERADMIN", label: "SuperAdmin" },
  { id: 2, name: "COORDINACION", label: "Coordinación" },
  { id: 3, name: "PSICOLOGIA", label: "Psicología" },
  { id: 4, name: "ENFERMERIA", label: "Enfermería" },
  { id: 5, name: "TRABAJO_SOCIAL", label: "Trabajo Social" },
  { id: 6, name: "APRENDIZ", label: "Aprendiz" },
];

const DEPENDENCIES = [
  { id: 1, name: "Psicología" },
  { id: 2, name: "Enfermería" },
  { id: 3, name: "Trabajo Social" },
];

export function UserFormModal({ user, onClose, onSubmit }) {
  const isEditing = !!user;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    control,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
      fullName: "",
      documentNumber: "",
      roleId: "",
      dependencyId: null,
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        email: user.email || "",
        password: "",
        fullName: user.full_name || "",
        documentNumber: user.document_number || "",
        roleId: user.role_id || "",
        dependencyId: user.dependency_id || null,
      });
    }
  }, [user, reset]);

  const selectedRole = useWatch({ control, name: "roleId" });

  const showDependency = [3, 4, 5].includes(Number(selectedRole));

  const onFormSubmit = (data) => {
    const payload = { ...data };
    if (isEditing && !payload.password) {
      delete payload.password;
    }
    if (!showDependency) {
      payload.dependencyId = null;
    }
    onSubmit(payload);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <header className="section-header" style={{ marginBottom: "1.5rem" }}>
          <h2>{isEditing ? "Editar Usuario" : "Nuevo Usuario"}</h2>
          <button className="btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </header>

        <form className="auth-form" onSubmit={handleSubmit(onFormSubmit)}>
          <div className="field">
            <label htmlFor="fullName">Nombre completo</label>
            <input
              id="fullName"
              type="text"
              {...register("fullName")}
              placeholder="Ej: Juan Pérez"
            />
            {errors.fullName && (
              <span className="field-error">{errors.fullName.message}</span>
            )}
          </div>

          <div className="field">
            <label htmlFor="documentNumber">Número de documento</label>
            <input
              id="documentNumber"
              type="text"
              {...register("documentNumber")}
              placeholder="Ej: 1234567890"
            />
            {errors.documentNumber && (
              <span className="field-error">{errors.documentNumber.message}</span>
            )}
          </div>

          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              {...register("email")}
              placeholder="correo@ejemplo.com"
            />
            {errors.email && (
              <span className="field-error">{errors.email.message}</span>
            )}
          </div>

          <div className="field">
            <label htmlFor="password">
              {isEditing ? "Nueva contraseña (dejar vacío para no cambiar)" : "Contraseña"}
            </label>
            <input
              id="password"
              type="password"
              {...register("password")}
              placeholder={isEditing ? "••••••" : "Mínimo 6 caracteres"}
            />
            {errors.password && (
              <span className="field-error">{errors.password.message}</span>
            )}
          </div>

          <div className="field">
            <label htmlFor="roleId">Rol</label>
            <select id="roleId" {...register("roleId", { valueAsNumber: true })}>
              <option value="">Seleccionar rol</option>
              {ROLES.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
            {errors.roleId && (
              <span className="field-error">{errors.roleId.message}</span>
            )}
          </div>

          {showDependency && (
            <div className="field">
              <label htmlFor="dependencyId">Dependencia</label>
              <select
                id="dependencyId"
                {...register("dependencyId", { valueAsNumber: true })}
              >
                <option value="">Seleccionar dependencia</option>
                {DEPENDENCIES.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : isEditing ? "Guardar Cambios" : "Crear Usuario"}
            </button>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
