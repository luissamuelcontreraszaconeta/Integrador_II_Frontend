import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { adminService } from '../../services/adminService';
import { RoleAdmin, PermissionItem, ModuleItem } from '../../types/admin';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Save,
  Users,
  Layers,
  Sliders,
  Check,
  X,
  Info,
} from 'lucide-react';

interface RoleManagementPageProps {
  onNavigate: (path: string) => void;
}

export const RoleManagementPage: React.FC<RoleManagementPageProps> = ({ onNavigate }) => {
  const [roles, setRoles] = useState<RoleAdmin[]>([]);
  const [permissions, setPermissions] = useState<PermissionItem[]>([]);
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Selected role to edit
  const [selectedRole, setSelectedRole] = useState<RoleAdmin | null>(null);
  const [selectedPerms, setSelectedPerms] = useState<Set<string>>(new Set());

  // Save Confirmation Modal
  const [confirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [rData, pData, mData] = await Promise.all([
        adminService.getRoles(),
        adminService.getPermissions(),
        adminService.getModules(),
      ]);
      setRoles(rData);
      setPermissions(pData);
      setModules(mData);

      if (rData.length > 0) {
        const defaultRole = rData[0];
        setSelectedRole(defaultRole);
        setSelectedPerms(new Set(defaultRole.permissions || []));
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar roles y permisos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectRole = (role: RoleAdmin) => {
    setSelectedRole(role);
    setSelectedPerms(new Set(role.permissions || []));
    setSuccessMsg(null);
    setError(null);
  };

  const handleTogglePerm = (code: string) => {
    const updated = new Set(selectedPerms);
    if (updated.has(code)) {
      updated.delete(code);
    } else {
      updated.add(code);
    }
    setSelectedPerms(updated);
  };

  const handleToggleModuleAll = (modulePerms: PermissionItem[]) => {
    const allChecked = modulePerms.every((p) => selectedPerms.has(p.codigo));
    const updated = new Set(selectedPerms);

    if (allChecked) {
      modulePerms.forEach((p) => updated.delete(p.codigo));
    } else {
      modulePerms.forEach((p) => updated.add(p.codigo));
    }
    setSelectedPerms(updated);
  };

  const handleSaveConfirm = async () => {
    if (!selectedRole) return;
    setSaving(true);
    setError(null);
    try {
      const permList = Array.from(selectedPerms);
      const updated = await adminService.updateRolePermissions(selectedRole.id, permList);
      setSelectedRole(updated);
      setConfirmModalOpen(false);
      setSuccessMsg(`Permisos guardados y auditados exitosamente para el rol ${updated.nombre}.`);
      setTimeout(() => setSuccessMsg(null), 4000);

      // Refresh roles list
      const rData = await adminService.getRoles();
      setRoles(rData);
    } catch (err: any) {
      setError(err.message || 'Error al guardar permisos');
    } finally {
      setSaving(false);
    }
  };

  // Group permissions by Module
  const permsByModule = permissions.reduce<Record<string, PermissionItem[]>>((acc, p) => {
    const mod = p.moduleCodigo || 'GENERAL';
    if (!acc[mod]) acc[mod] = [];
    acc[mod].push(p);
    return acc;
  }, {});

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title="Gestión de Roles y Matriz de Permisos RBAC"
        subtitle="Configuración de privilegios de acceso granulares para cada perfil de la organización"
        breadcrumbs={[
          { label: 'Inicio', onClick: () => onNavigate('/dashboard') },
          { label: 'Administración', onClick: () => onNavigate('/admin') },
          { label: 'Roles & Permisos' },
        ]}
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              icon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
            >
              Actualizar
            </Button>
            {selectedRole && (
              <Button
                variant="teal"
                size="md"
                onClick={() => setConfirmModalOpen(true)}
                icon={<Save className="w-4 h-4" />}
              >
                Guardar Permisos ({selectedPerms.size})
              </Button>
            )}
          </div>
        }
      />

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => setError(null)}>
            Cerrar
          </Button>
        </div>
      )}

      {/* Main Grid: Left Roles Selector | Right Permissions Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Col: Roles Catalog */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3 lg:col-span-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#0F6CBD]" />
            Perfiles de Rol
          </h3>

          <div className="space-y-2">
            {roles.map((role) => {
              const isSelected = selectedRole?.id === role.id;
              return (
                <button
                  key={role.id}
                  onClick={() => handleSelectRole(role)}
                  className={`w-full p-3 rounded-lg text-left transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-blue-50/80 border-[#0F6CBD] shadow-xs'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{role.nombre}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                      {role.userCount} usuarios
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                    {role.descripcion}
                  </p>
                  <div className="mt-2 text-[10px] font-semibold text-[#0F6CBD]">
                    {role.permissions?.length || 0} permisos asignados
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Col: Permissions Matrix for Selected Role */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase">Configurando Rol:</span>
                <span className="text-base font-black text-slate-900">{selectedRole?.nombre}</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Marque los permisos que los usuarios con rol <strong>{selectedRole?.nombre}</strong> podrán ejecutar.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600">
                Seleccionados: <strong className="text-[#0F6CBD]">{selectedPerms.size}</strong> de {permissions.length}
              </span>
            </div>
          </div>

          {/* Modules Permission Groups */}
          <div className="space-y-6">
            {Object.entries(permsByModule).map(([modCode, modPerms]) => {
              const allChecked = modPerms.every((p) => selectedPerms.has(p.codigo));
              const someChecked = modPerms.some((p) => selectedPerms.has(p.codigo)) && !allChecked;

              return (
                <div key={modCode} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-[#0F9D8A]" />
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                        {modPerms[0]?.moduleNombre || modCode} ({modCode})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleModuleAll(modPerms)}
                      className="text-[11px] font-semibold text-[#0F6CBD] hover:underline cursor-pointer"
                    >
                      {allChecked ? 'Desmarcar todos' : 'Marcar todos'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {modPerms.map((perm) => {
                      const isChecked = selectedPerms.has(perm.codigo);
                      return (
                        <label
                          key={perm.id}
                          className={`flex items-start gap-3 p-2.5 rounded-lg border cursor-pointer transition-all ${
                            isChecked
                              ? 'bg-white border-[#0F6CBD]/40 shadow-xs'
                              : 'bg-white/60 border-slate-200 hover:bg-white'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleTogglePerm(perm.codigo)}
                            className="mt-0.5 w-4 h-4 rounded text-[#0F6CBD] focus:ring-[#0F6CBD] cursor-pointer"
                          />
                          <div className="min-w-0">
                            <span className="font-mono font-bold text-xs text-slate-900 block truncate">
                              {perm.codigo}
                            </span>
                            <span className="text-[11px] text-slate-500 block leading-tight">
                              {perm.descripcion || perm.nombre}
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title="Confirmar Actualización de Permisos"
        subtitle={`Rol: ${selectedRole?.nombre}`}
        maxWidth="sm"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="outline" size="sm" onClick={() => setConfirmModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="teal"
              size="md"
              onClick={handleSaveConfirm}
              disabled={saving}
              icon={saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : undefined}
            >
              Confirmar y Guardar
            </Button>
          </div>
        }
      >
        <div className="space-y-3 text-xs text-slate-700 font-sans">
          <p>
            ¿Está seguro de actualizar los permisos para el rol <strong>{selectedRole?.nombre}</strong> a un total de{' '}
            <strong>{selectedPerms.size}</strong> permisos?
          </p>
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-[#0F6CBD] text-[11px] flex items-start gap-2">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Los cambios entrarán en vigencia inmediatamente para todos los usuarios asignados a este rol y se registrará un evento de auditoría de seguridad.
            </span>
          </div>
        </div>
      </Modal>
    </div>
  );
};
