import React, { useEffect, useState } from 'react';
import {
  Users,
  Search,
  Filter,
  UserPlus,
  Shield,
  Edit2,
  Lock,
  Unlock,
  KeyRound,
  Eye,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  X,
  Mail
} from 'lucide-react';
import { superAdminService } from '../../services/superAdminService';
import type { UserAdmin, RoleAdmin } from '../../types/superAdmin';

interface SuperAdminUsersPageProps {
  onNavigate?: (path: string) => void;
}

export const SuperAdminUsersPage: React.FC<SuperAdminUsersPageProps> = ({ onNavigate }) => {
  const [users, setUsers] = useState<UserAdmin[]>([]);
  const [roles, setRoles] = useState<RoleAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserAdmin | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    area: 'Administración',
    rol: 'ADMINISTRADOR',
    activo: true
  });
  const [newPassword, setNewPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [usersRes, rolesRes] = await Promise.all([
        superAdminService.getUsers(),
        superAdminService.getRoles()
      ]);
      setUsers(usersRes);
      setRoles(rolesRes);
    } catch (err: any) {
      console.error('Error loading users:', err);
      setError('Error al conectar con el servidor para cargar usuarios y roles.');
    } finally {
      setLoading(false);
    }
  };

  const handleNav = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.location.hash = path;
    }
  };

  const showNotification = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    const fullName = `${u.nombre} ${u.apellido || ''}`.toLowerCase();
    const matchesSearch =
      fullName.includes(q) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.area && u.area.toLowerCase().includes(q));

    const matchesRole = selectedRole === 'ALL' || u.rol === selectedRole;

    const matchesStatus =
      selectedStatus === 'ALL' ||
      (selectedStatus === 'ACTIVE' && u.activo) ||
      (selectedStatus === 'INACTIVE' && !u.activo);

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Actions
  const handleToggleStatus = async (user: UserAdmin) => {
    try {
      const updated = await superAdminService.updateUserStatus(user.id, !user.activo);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? updated : u)));
      showNotification(`Estado de ${user.nombre} actualizado a ${!user.activo ? 'Activo' : 'Inactivo'}.`);
    } catch (err: any) {
      alert(err.message || 'Error al cambiar estado del usuario.');
    }
  };

  const openCreateModal = () => {
    setFormData({
      nombre: '',
      apellido: '',
      email: '',
      password: '',
      area: 'Administración',
      rol: roles.length > 0 ? roles[0].nombre : 'ADMINISTRADOR',
      activo: true
    });
    setIsCreateModalOpen(true);
  };

  const openEditModal = (user: UserAdmin) => {
    setSelectedUser(user);
    setFormData({
      nombre: user.nombre,
      apellido: user.apellido || '',
      email: user.email || '',
      password: '',
      area: user.area || 'Operaciones',
      rol: user.rol,
      activo: user.activo
    });
    setIsEditModalOpen(true);
  };

  const openResetPasswordModal = (user: UserAdmin) => {
    setSelectedUser(user);
    setNewPassword('');
    setIsResetPasswordModalOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre || !formData.email || !formData.password || !formData.rol) {
      alert('Por favor complete todos los campos obligatorios.');
      return;
    }
    try {
      setSubmitting(true);
      const created = await superAdminService.createUser({
        nombre: formData.nombre,
        apellido: formData.apellido,
        email: formData.email,
        password: formData.password,
        area: formData.area,
        rol: formData.rol
      });
      setUsers((prev) => [created, ...prev]);
      setIsCreateModalOpen(false);
      showNotification(`Usuario "${created.email}" creado exitosamente.`);
    } catch (err: any) {
      alert(err.message || 'Error al crear el usuario.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      setSubmitting(true);
      const updated = await superAdminService.updateUser(selectedUser.id, {
        nombre: formData.nombre,
        apellido: formData.apellido,
        area: formData.area,
        rol: formData.rol,
        activo: formData.activo
      });
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      setIsEditModalOpen(false);
      showNotification(`Usuario "${updated.email}" actualizado.`);
    } catch (err: any) {
      alert(err.message || 'Error al actualizar el usuario.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !newPassword) return;
    if (newPassword.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    try {
      setSubmitting(true);
      await superAdminService.resetPassword(selectedUser.id, newPassword);
      setIsResetPasswordModalOpen(false);
      showNotification(`Contraseña restablecida exitosamente para ${selectedUser.email}.`);
    } catch (err: any) {
      alert(err.message || 'Error al restablecer la contraseña.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-100 text-primary-800">
              Control de Accesos
            </span>
            <span className="text-xs text-slate-500">{filteredUsers.length} de {users.length} cuentas</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Gestión de Usuarios del Sistema
          </h1>
          <p className="text-sm text-slate-500">
            Administración de credenciales, roles operativos, estados de bloqueo y accesos a módulos.
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
          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-semibold transition-all shadow-xs flex items-center space-x-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Nuevo Usuario</span>
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center space-x-3 text-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 flex items-center space-x-3 text-sm">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, correo o área..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center space-x-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400 mr-1" />
            <span className="text-xs font-medium text-slate-500">Rol:</span>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">Todos los Roles</option>
              {roles.map((r) => (
                <option key={r.id} value={r.nombre}>
                  {r.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
            <span className="text-xs font-medium text-slate-500">Estado:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">Todos los Estados</option>
              <option value="ACTIVE">Solo Activos</option>
              <option value="INACTIVE">Solo Inactivos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/80 text-xs font-semibold uppercase text-slate-500 border-b border-slate-200/80 tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Nombre de Usuario</th>
                <th className="px-5 py-3.5">Correo & Área</th>
                <th className="px-5 py-3.5">Rol Asignado</th>
                <th className="px-5 py-3.5">Estado</th>
                <th className="px-5 py-3.5">Último Acceso</th>
                <th className="px-5 py-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-6 h-6 border-2 border-slate-200 border-t-primary-600 rounded-full animate-spin" />
                      <span className="text-xs">Cargando cuentas de usuario...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm font-medium">No se encontraron usuarios</p>
                    <p className="text-xs mt-0.5">Prueba cambiando los filtros de búsqueda.</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs">
                          {u.nombre.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 flex items-center space-x-1.5">
                            <span>{u.nombre} {u.apellido || ''}</span>
                            {u.rol === 'SUPERADMIN' && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-primary-950 text-white tracking-wider">
                                ROOT
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono">UID #{u.id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-800 flex items-center">
                        <Mail className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                        {u.email}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">{u.area || 'Operaciones'}</div>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${
                          u.rol === 'SUPERADMIN'
                            ? 'bg-slate-900 text-white'
                            : u.rol === 'ADMINISTRADOR'
                            ? 'bg-blue-100 text-blue-800'
                            : u.rol === 'QA'
                            ? 'bg-teal-100 text-teal-800'
                            : u.rol === 'PRODUCCION'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        <Shield className="w-3 h-3 mr-1.5 opacity-70" />
                        {u.rol || 'SIN ROL'}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-all hover:opacity-80 ${
                          u.activo
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                        title="Haz clic para cambiar estado"
                      >
                        {u.activo ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                            Activo
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5 mr-1 text-rose-500" />
                            Inactivo
                          </>
                        )}
                      </button>
                    </td>

                    <td className="px-5 py-4 text-xs text-slate-500">
                      {u.ultimoAcceso ? new Date(u.ultimoAcceso).toLocaleDateString() : 'Sin registros'}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => handleNav(`/superadmin/users/${u.id}`)}
                          className="p-1.5 text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="Ver detalle y excepciones de módulos"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(u)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar usuario"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openResetPasswordModal(u)}
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Restablecer contraseña"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE USER MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 animate-scale-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Crear Nueva Cuenta</h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Manuel"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Apellido
                  </label>
                  <input
                    type="text"
                    value={formData.apellido}
                    onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                    placeholder="Gómez"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Correo Electrónico (Login) *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="ej. m.gomez@exportrace.pe"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Contraseña Inicial *
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Área Operativa
                  </label>
                  <input
                    type="text"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    placeholder="ej. Control de Calidad"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Rol del Sistema *
                  </label>
                  <select
                    required
                    value={formData.rol}
                    onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white"
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.nombre}>
                        {r.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-semibold transition-all shadow-xs disabled:opacity-50"
                >
                  {submitting ? 'Creando...' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 animate-scale-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Edit2 className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Editar Usuario: {selectedUser.email}</h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Apellido
                  </label>
                  <input
                    type="text"
                    value={formData.apellido}
                    onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Área Operativa
                  </label>
                  <input
                    type="text"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Rol del Sistema *
                  </label>
                  <select
                    required
                    value={formData.rol}
                    onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white"
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.nombre}>
                        {r.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="edit-active"
                  checked={formData.activo}
                  onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                  className="w-4 h-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500"
                />
                <label htmlFor="edit-active" className="text-sm font-medium text-slate-700 cursor-pointer">
                  Cuenta activa
                </label>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-semibold transition-all shadow-xs disabled:opacity-50"
                >
                  {submitting ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {isResetPasswordModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 animate-scale-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Restablecer Contraseña</h3>
              </div>
              <button
                onClick={() => setIsResetPasswordModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResetPasswordSubmit} className="mt-4 space-y-4">
              <p className="text-xs text-slate-600">
                Ingresa una nueva contraseña para la cuenta <strong>{selectedUser.email}</strong> ({selectedUser.nombre} {selectedUser.apellido || ''}).
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Nueva Contraseña *
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsResetPasswordModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-semibold transition-all shadow-xs disabled:opacity-50"
                >
                  {submitting ? 'Restableciendo...' : 'Restablecer Contraseña'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
