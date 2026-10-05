import React, { useEffect, useState } from 'react';
import {
  Shield,
  Key,
  Plus,
  Lock,
  CheckCircle2,
  RefreshCw,
  Search,
  Save,
  Info
} from 'lucide-react';
import { superAdminService } from '../../services/superAdminService';
import type { RoleAdmin, PermissionItem } from '../../types/superAdmin';

interface SuperAdminRolesPageProps {
  onNavigate?: (path: string) => void;
}

export const SuperAdminRolesPage: React.FC<SuperAdminRolesPageProps> = () => {
  const [roles, setRoles] = useState<RoleAdmin[]>([]);
  const [permissions, setPermissions] = useState<PermissionItem[]>([]);
  const [selectedRole, setSelectedRole] = useState<RoleAdmin | null>(null);
  const [selectedPermCodes, setSelectedPermCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [searchPerm, setSearchPerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [rolesRes, permsRes] = await Promise.all([
        superAdminService.getRoles(),
        superAdminService.getPermissions()
      ]);
      setRoles(rolesRes);
      setPermissions(permsRes);
      if (rolesRes.length > 0) {
        setSelectedRole(rolesRes[0]);
        setSelectedPermCodes(rolesRes[0].permissions || []);
      }
    } catch (err: any) {
      console.error('Error loading roles & permissions:', err);
      setError('Error al cargar la matriz de roles y permisos.');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleSelectRole = (role: RoleAdmin) => {
    setSelectedRole(role);
    if (role.nombre === 'SUPERADMIN') {
      setSelectedPermCodes(permissions.map((p) => p.codigo));
    } else {
      setSelectedPermCodes(role.permissions || []);
    }
  };

  const togglePermission = (permCode: string) => {
    if (selectedRole?.nombre === 'SUPERADMIN') return;
    setSelectedPermCodes((prev) =>
      prev.includes(permCode) ? prev.filter((c) => c !== permCode) : [...prev, permCode]
    );
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) return;
    if (selectedRole.nombre === 'SUPERADMIN') {
      alert('El rol SUPERADMIN posee privilegios globales inmutables del sistema.');
      return;
    }
    try {
      setSaving(true);
      const updated = await superAdminService.updateRolePermissions(selectedRole.id, selectedPermCodes);
      setRoles((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      setSelectedRole(updated);
      showNotification(`Permisos actualizados para el rol "${selectedRole.nombre}".`);
    } catch (err: any) {
      alert(err.message || 'Error al guardar los permisos del rol.');
    } finally {
      setSaving(false);
    }
  };

  // Group permissions by category or moduleCodigo
  const groupedPermissions = permissions
    .filter(
      (p) =>
        p.nombre.toLowerCase().includes(searchPerm.toLowerCase()) ||
        p.codigo.toLowerCase().includes(searchPerm.toLowerCase()) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(searchPerm.toLowerCase()))
    )
    .reduce<Record<string, PermissionItem[]>>((acc, perm) => {
      const category = perm.moduleCodigo || perm.codigo.split('_')[0] || 'GENERAL';
      if (!acc[category]) acc[category] = [];
      acc[category].push(perm);
      return acc;
    }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
              Seguridad Basada en Roles (RBAC)
            </span>
            <span className="text-xs text-slate-500">{roles.length} roles configurados</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Matriz de Roles y Permisos del Sistema
          </h1>
          <p className="text-sm text-slate-500">
            Definición granular de privilegios y separación estricta entre gobierno técnico y roles operativos.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-xs"
            title="Recargar datos"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center space-x-3 text-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Master-Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Roles Master List (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Catálogo de Roles Disponibles
            </h3>
          </div>

          <div className="divide-y divide-slate-100">
            {roles.map((r) => {
              const isSelected = selectedRole?.id === r.id;
              const isSuper = r.nombre === 'SUPERADMIN';
              return (
                <div
                  key={r.id}
                  onClick={() => handleSelectRole(r)}
                  className={`p-4 cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-purple-50/80 border-l-4 border-purple-600'
                      : 'hover:bg-slate-50 border-l-4 border-transparent'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-bold ${isSelected ? 'text-purple-900' : 'text-slate-800'}`}>
                        {r.nombre}
                      </span>
                      {isSuper && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-900 text-white tracking-wider">
                          ROOT
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1 truncate">
                      {r.descripcion || 'Rol operativo estándar de la organización'}
                    </p>
                  </div>
                  <Shield
                    className={`w-4 h-4 flex-shrink-0 ${
                      isSelected ? 'text-purple-600' : 'text-slate-300'
                    }`}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Permission Matrix Detail (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200/80 shadow-xs flex flex-col">
          {selectedRole ? (
            <>
              {/* Detail Header */}
              <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-lg font-bold text-slate-900">
                      Permisos del Rol: <span className="text-purple-700">{selectedRole.nombre}</span>
                    </h2>
                    {selectedRole.nombre === 'SUPERADMIN' ? (
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200 flex items-center">
                        <Lock className="w-3 h-3 mr-1" /> Protegido
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700">
                        Configurable
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {selectedRole.descripcion || 'Configuración de permisos y privilegios del rol seleccionado.'}
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleSavePermissions}
                    disabled={saving || selectedRole.nombre === 'SUPERADMIN'}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold transition-all shadow-xs flex items-center space-x-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{saving ? 'Guardando...' : 'Guardar Matriz'}</span>
                  </button>
                </div>
              </div>

              {/* Notice for SUPERADMIN */}
              {selectedRole.nombre === 'SUPERADMIN' && (
                <div className="m-6 mb-0 p-4 bg-purple-50 border border-purple-200 rounded-xl text-purple-900 text-xs flex items-start space-x-2.5">
                  <Info className="w-4 h-4 text-purple-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Rol SuperAdministrador Inmutable</p>
                    <p className="mt-0.5 text-purple-800">
                      El rol SUPERADMIN tiene asignados todos los privilegios de forma permanente e irrestricta. No se pueden desmarcar permisos de este rol por seguridad de la arquitectura.
                    </p>
                  </div>
                </div>
              )}

              {/* Permission Filter Search */}
              <div className="p-4 px-6 border-b border-slate-100 flex items-center justify-between gap-4">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchPerm}
                    onChange={(e) => setSearchPerm(e.target.value)}
                    placeholder="Filtrar permisos por código, nombre o descripción..."
                    className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  {selectedPermCodes.length} seleccionados
                </span>
              </div>

              {/* Grouped Permissions Checklist */}
              <div className="p-6 space-y-6 max-h-[520px] overflow-y-auto">
                {Object.keys(groupedPermissions).length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    No se encontraron permisos que coincidan con la búsqueda.
                  </div>
                ) : (
                  Object.entries(groupedPermissions).map(([category, perms]) => (
                    <div key={category} className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
                        <Key className="w-3.5 h-3.5 text-purple-600" />
                        <span>Módulo / Categoría: {category}</span>
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {perms.map((p) => {
                          const isChecked = selectedPermCodes.includes(p.codigo);
                          const isSuper = selectedRole.nombre === 'SUPERADMIN';
                          return (
                            <label
                              key={p.id}
                              className={`p-3 rounded-xl border flex items-start space-x-3 cursor-pointer transition-all ${
                                isChecked
                                  ? 'bg-purple-50/50 border-purple-200 text-purple-950'
                                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                              } ${isSuper ? 'cursor-not-allowed opacity-90' : ''}`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                disabled={isSuper}
                                onChange={() => togglePermission(p.codigo)}
                                className="w-4 h-4 mt-0.5 text-purple-600 rounded border-slate-300 focus:ring-purple-500 disabled:opacity-50"
                              />
                              <div className="min-w-0">
                                <span className="font-semibold text-xs block font-mono">
                                  {p.codigo}
                                </span>
                                <span className="text-[11px] text-slate-600 block mt-0.5">
                                  {p.nombre}
                                </span>
                                {p.descripcion && (
                                  <span className="text-[10px] text-slate-400 block mt-0.5 line-clamp-1">
                                    {p.descripcion}
                                  </span>
                                )}
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-slate-400 text-sm">
              Seleccione un rol de la lista para ver y editar sus permisos.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
