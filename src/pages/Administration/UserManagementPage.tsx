import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { adminService } from '../../services/adminService';
import { UserAdmin, CreateUserPayload, UpdateUserPayload } from '../../types/admin';
import {
  Users,
  Plus,
  Search,
  Filter,
  UserCheck,
  UserX,
  KeyRound,
  Edit,
  History,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  Lock,
  Mail,
  Building2,
  Shield,
  Eye,
} from 'lucide-react';

interface UserManagementPageProps {
  onNavigate: (path: string) => void;
}

export const UserManagementPage: React.FC<UserManagementPageProps> = ({ onNavigate }) => {
  const [users, setUsers] = useState<UserAdmin[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [statusModalOpen, setStatusModalOpen] = useState<boolean>(false);
  const [resetPassModalOpen, setResetPassModalOpen] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<UserAdmin | null>(null);

  // Form states
  const [createForm, setCreateForm] = useState<CreateUserPayload>({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    area: 'Operaciones',
    rol: 'PRODUCCION',
  });

  const [editForm, setEditForm] = useState<UpdateUserPayload>({
    nombre: '',
    apellido: '',
    area: '',
    rol: '',
    activo: true,
  });

  const [newPassword, setNewPassword] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getUsers(search, roleFilter, statusFilter);
      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [roleFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadUsers();
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setError(null);
    try {
      await adminService.createUser(createForm);
      setCreateModalOpen(false);
      setCreateForm({
        nombre: '',
        apellido: '',
        email: '',
        password: '',
        area: 'Operaciones',
        rol: 'PRODUCCION',
      });
      setSuccessMessage('Usuario creado exitosamente con credenciales encriptadas.');
      setTimeout(() => setSuccessMessage(null), 4000);
      loadUsers();
    } catch (err: any) {
      setError(err.message || 'Error al crear usuario');
    } finally {
      setActionLoading(false);
    }
  };

  const openEditModal = (user: UserAdmin) => {
    setSelectedUser(user);
    setEditForm({
      nombre: user.nombre,
      apellido: user.apellido || '',
      area: user.area,
      rol: user.rol,
      activo: user.activo,
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setActionLoading(true);
    setError(null);
    try {
      await adminService.updateUser(selectedUser.id, editForm);
      setEditModalOpen(false);
      setSuccessMessage(`Usuario ${selectedUser.email} actualizado correctamente.`);
      setTimeout(() => setSuccessMessage(null), 4000);
      loadUsers();
    } catch (err: any) {
      setError(err.message || 'Error al actualizar usuario');
    } finally {
      setActionLoading(false);
    }
  };

  const openStatusModal = (user: UserAdmin) => {
    setSelectedUser(user);
    setStatusModalOpen(true);
  };

  const handleStatusConfirm = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    setError(null);
    try {
      const newStatus = !selectedUser.activo;
      await adminService.updateUserStatus(selectedUser.id, newStatus);
      setStatusModalOpen(false);
      setSuccessMessage(
        `Cuenta ${selectedUser.email} ${newStatus ? 'activada' : 'desactivada'} correctamente.`
      );
      setTimeout(() => setSuccessMessage(null), 4000);
      loadUsers();
    } catch (err: any) {
      setError(err.message || 'Error al cambiar estado de la cuenta');
    } finally {
      setActionLoading(false);
    }
  };

  const openResetPassModal = (user: UserAdmin) => {
    setSelectedUser(user);
    setNewPassword(`ExporTrace${Math.floor(1000 + Math.random() * 9000)}!`);
    setResetPassModalOpen(true);
  };

  const handleResetPassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setActionLoading(true);
    setError(null);
    try {
      await adminService.resetPassword(selectedUser.id, newPassword);
      setResetPassModalOpen(false);
      setSuccessMessage(
        `Contraseña restablecida exitosamente para ${selectedUser.email}. Nueva contraseña temporal: ${newPassword}`
      );
      loadUsers();
    } catch (err: any) {
      setError(err.message || 'Error al restablecer contraseña');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title="Gestión Integral de Usuarios"
        subtitle="Control de cuentas, asignación de roles, activación/desactivación y restablecimiento de credenciales"
        breadcrumbs={[
          { label: 'Inicio', onClick: () => onNavigate('/dashboard') },
          { label: 'Administración', onClick: () => onNavigate('/admin') },
          { label: 'Usuarios' },
        ]}
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={loadUsers}
              icon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
            >
              Actualizar
            </Button>
            <Button
              variant="teal"
              size="md"
              onClick={() => setCreateModalOpen(true)}
              icon={<Plus className="w-4 h-4" />}
            >
              + Nuevo Usuario
            </Button>
          </div>
        }
      />

      {/* Messages */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{successMessage}</span>
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

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nombre, apellido, correo o área..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0F6CBD] text-slate-800"
            />
          </div>
          <Button variant="secondary" size="md" type="submit">
            Buscar
          </Button>
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Role Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-[#0F6CBD] font-medium"
            >
              <option value="ALL">Todos los Roles</option>
              <option value="ADMINISTRADOR">Administrador</option>
              <option value="PRODUCCION">Producción</option>
              <option value="QA">Control de Calidad (QA)</option>
              <option value="LOGISTICA">Logística / Comex</option>
              <option value="GERENCIA">Gerencia General</option>
            </select>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-[#0F6CBD] font-medium"
          >
            <option value="ALL">Todos los Estados</option>
            <option value="ACTIVO">Activos</option>
            <option value="INACTIVO">Inactivos</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Usuario</th>
                <th className="py-3 px-4">Área / Departamento</th>
                <th className="py-3 px-4">Rol Asignado</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4">Último Acceso</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#0F6CBD]" />
                    Cargando usuarios del sistema...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No se encontraron usuarios con los criterios de búsqueda especificados.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-[#0F6CBD] font-bold text-xs flex items-center justify-center border border-slate-200">
                          {user.nombre.charAt(0)}
                          {user.apellido ? user.apellido.charAt(0) : ''}
                        </div>
                        <div>
                          <button
                            onClick={() => onNavigate(`/admin/users/${user.id}`)}
                            className="font-bold text-slate-900 hover:text-[#0F6CBD] text-left block cursor-pointer"
                          >
                            {user.nombre} {user.apellido || ''}
                          </button>
                          <span className="text-[11px] text-slate-400 font-mono block">
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {user.area}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
                          user.rol === 'ADMINISTRADOR'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : user.rol === 'QA'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : user.rol === 'PRODUCCION'
                            ? 'bg-blue-50 text-[#0F6CBD] border-blue-200'
                            : user.rol === 'LOGISTICA'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        }`}
                      >
                        {user.rol}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {user.activo ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          ACTIVO
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          INACTIVO
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-[11px] font-mono">
                      {user.ultimoAcceso
                        ? new Date(user.ultimoAcceso).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
                        : 'Sin accesos'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onNavigate(`/admin/users/${user.id}`)}
                          title="Ver Detalle e Historial de Actividad"
                          icon={<Eye className="w-3.5 h-3.5" />}
                        >
                          Detalle
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(user)}
                          title="Editar Datos del Usuario"
                          icon={<Edit className="w-3.5 h-3.5" />}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openResetPassModal(user)}
                          title="Restablecer Contraseña"
                          icon={<KeyRound className="w-3.5 h-3.5 text-amber-600" />}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openStatusModal(user)}
                          title={user.activo ? 'Desactivar Cuenta' : 'Activar Cuenta'}
                          icon={
                            user.activo ? (
                              <UserX className="w-3.5 h-3.5 text-rose-600" />
                            ) : (
                              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                            )
                          }
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Crear Usuario */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Crear Nuevo Usuario del Sistema"
        subtitle="Registra un trabajador autorizado. El rol determinará sus permisos en el sistema."
        maxWidth="md"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="outline" size="sm" onClick={() => setCreateModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="teal"
              size="md"
              onClick={handleCreateSubmit}
              disabled={actionLoading}
              icon={actionLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : undefined}
            >
              Crear Usuario
            </Button>
          </div>
        }
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs font-sans">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Nombre *</label>
              <input
                type="text"
                required
                value={createForm.nombre}
                onChange={(e) => setCreateForm({ ...createForm, nombre: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-[#0F6CBD]"
                placeholder="Ej. Carlos"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Apellido</label>
              <input
                type="text"
                value={createForm.apellido}
                onChange={(e) => setCreateForm({ ...createForm, apellido: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-[#0F6CBD]"
                placeholder="Ej. Mendoza"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Correo Electrónico Corporativo *</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-[#0F6CBD]"
                placeholder="usuario@exportrace.pe"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Contraseña Inicial *</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={6}
                value={createForm.password}
                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-[#0F6CBD]"
                placeholder="Mínimo 6 caracteres (encriptada con BCrypt)"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Área / Departamento *</label>
              <input
                type="text"
                required
                value={createForm.area}
                onChange={(e) => setCreateForm({ ...createForm, area: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-[#0F6CBD]"
                placeholder="Ej. Control de Calidad"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Rol RBAC *</label>
              <select
                value={createForm.rol}
                onChange={(e) => setCreateForm({ ...createForm, rol: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-[#0F6CBD] font-semibold"
              >
                <option value="ADMINISTRADOR">ADMINISTRADOR</option>
                <option value="PRODUCCION">PRODUCCION</option>
                <option value="QA">QA (Calidad)</option>
                <option value="LOGISTICA">LOGISTICA</option>
                <option value="GERENCIA">GERENCIA</option>
              </select>
            </div>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: Editar Usuario */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={`Editar Usuario: ${selectedUser?.email}`}
        subtitle="Actualiza datos generales, departamento o asignación de rol"
        maxWidth="md"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="outline" size="sm" onClick={() => setEditModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="teal"
              size="md"
              onClick={handleEditSubmit}
              disabled={actionLoading}
              icon={actionLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : undefined}
            >
              Guardar Cambios
            </Button>
          </div>
        }
      >
        <form onSubmit={handleEditSubmit} className="space-y-4 text-xs font-sans">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Nombre</label>
              <input
                type="text"
                value={editForm.nombre}
                onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-[#0F6CBD]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Apellido</label>
              <input
                type="text"
                value={editForm.apellido}
                onChange={(e) => setEditForm({ ...editForm, apellido: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-[#0F6CBD]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Área / Departamento</label>
            <input
              type="text"
              value={editForm.area}
              onChange={(e) => setEditForm({ ...editForm, area: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-[#0F6CBD]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Rol RBAC</label>
            <select
              value={editForm.rol}
              onChange={(e) => setEditForm({ ...editForm, rol: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-[#0F6CBD] font-semibold"
            >
              <option value="ADMINISTRADOR">ADMINISTRADOR</option>
              <option value="PRODUCCION">PRODUCCION</option>
              <option value="QA">QA (Calidad)</option>
              <option value="LOGISTICA">LOGISTICA</option>
              <option value="GERENCIA">GERENCIA</option>
            </select>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: Activar / Desactivar Confirmación */}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title={selectedUser?.activo ? 'Confirmar Desactivación de Cuenta' : 'Confirmar Activación de Cuenta'}
        subtitle="Operación de seguridad sobre el estado de acceso del usuario"
        maxWidth="sm"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="outline" size="sm" onClick={() => setStatusModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant={selectedUser?.activo ? 'danger' : 'teal'}
              size="md"
              onClick={handleStatusConfirm}
              disabled={actionLoading}
            >
              {selectedUser?.activo ? 'Sí, Desactivar Cuenta' : 'Sí, Activar Cuenta'}
            </Button>
          </div>
        }
      >
        <div className="space-y-3 text-xs text-slate-700 font-sans">
          <p>
            ¿Está seguro de {selectedUser?.activo ? 'desactivar' : 'activar'} la cuenta de{' '}
            <strong>{selectedUser?.nombre} {selectedUser?.apellido}</strong> ({selectedUser?.email})?
          </p>
          {selectedUser?.activo && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-[11px] flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                El usuario no podrá iniciar sesión y sus tokens activos quedarán bloqueados inmediatamente. Todo su historial de auditoría y trazabilidad se conservará intacto.
              </span>
            </div>
          )}
        </div>
      </Modal>

      {/* MODAL 4: Resetear Contraseña */}
      <Modal
        isOpen={resetPassModalOpen}
        onClose={() => setResetPassModalOpen(false)}
        title="Restablecer Contraseña"
        subtitle={`Generar nueva clave de acceso para ${selectedUser?.email}`}
        maxWidth="sm"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="outline" size="sm" onClick={() => setResetPassModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="teal"
              size="md"
              onClick={handleResetPassSubmit}
              disabled={actionLoading}
            >
              Restablecer Contraseña
            </Button>
          </div>
        }
      >
        <form onSubmit={handleResetPassSubmit} className="space-y-3 text-xs font-sans">
          <p className="text-slate-600">
            Se actualizará la contraseña encriptada con <strong>BCrypt</strong>. Proporcione una contraseña temporal o utilice la sugerida:
          </p>
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Nueva Contraseña Temporal
            </label>
            <input
              type="text"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold focus:bg-white focus:ring-2 focus:ring-[#0F6CBD]"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
