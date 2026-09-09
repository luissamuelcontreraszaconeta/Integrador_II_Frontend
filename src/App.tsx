import { useState, ReactNode } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
type Screen =
  | "login"
  | "dashboard-prod"
  | "register-lot"
  | "lot-detail"
  | "dashboard-qa"
  | "quality-control"
  | "cold-chain"
  | "smart-validation"
  | "dashboard-logistics"
  | "certification-mgmt"
  | "digital-file"
  | "dispatch"
  | "dashboard-mgmt";

type Role = "Producción" | "QA" | "Logística" | "Gerencia" | "Administrador";

// ─── Design System Components ─────────────────────────────────────────────────

function Badge({
  color,
  children,
}: {
  color: "green" | "amber" | "red" | "blue" | "gray" | "teal";
  children: ReactNode;
}) {
  const colors = {
    green: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    amber: "bg-amber-50 text-amber-700 border border-amber-200",
    red: "bg-red-50 text-red-700 border border-red-200",
    blue: "bg-blue-50 text-blue-700 border border-blue-200",
    gray: "bg-slate-100 text-slate-600 border border-slate-200",
    teal: "bg-teal-50 text-teal-700 border border-teal-200",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[color]}`}
    >
      {children}
    </span>
  );
}

function Btn({
  variant = "primary",
  size = "md",
  children,
  onClick,
  full,
  disabled,
}: {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
  onClick?: () => void;
  full?: boolean;
  disabled?: boolean;
}) {
  const variants = {
    primary:
      "bg-[#1a3a5c] hover:bg-[#0f2240] text-white shadow-sm",
    secondary:
      "bg-[#0ea5a0] hover:bg-[#0d9490] text-white shadow-sm",
    outline:
      "border border-[#1a3a5c] text-[#1a3a5c] hover:bg-slate-50",
    ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-800",
    danger: "bg-red-600 hover:bg-red-700 text-white shadow-sm",
  };
  const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm", lg: "px-6 py-3 text-sm" };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${full ? "w-full" : ""}`}
    >
      {children}
    </button>
  );
}

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

function Input({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  required,
}: {
  label?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-slate-700">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0ea5a0] focus:border-transparent transition-all"
      />
    </div>
  );
}

function Select({
  label,
  options,
  required,
}: {
  label?: string;
  options: string[];
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-slate-700">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <select className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0ea5a0] focus:border-transparent bg-white transition-all">
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

function Textarea({ label, placeholder, rows = 3, required }: { label?: string; placeholder?: string; rows?: number; required?: boolean }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-slate-700">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <textarea
        rows={rows}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0ea5a0] focus:border-transparent resize-none transition-all"
      />
    </div>
  );
}

function Alert({ type, title, children }: { type: "error" | "warning" | "success" | "info"; title: string; children?: ReactNode }) {
  const styles = {
    error: { wrap: "bg-red-50 border-red-200", icon: "⛔", title: "text-red-800", body: "text-red-700" },
    warning: { wrap: "bg-amber-50 border-amber-200", icon: "⚠️", title: "text-amber-800", body: "text-amber-700" },
    success: { wrap: "bg-emerald-50 border-emerald-200", icon: "✅", title: "text-emerald-800", body: "text-emerald-700" },
    info: { wrap: "bg-blue-50 border-blue-200", icon: "ℹ️", title: "text-blue-800", body: "text-blue-700" },
  };
  const s = styles[type];
  return (
    <div className={`rounded-lg border p-4 ${s.wrap}`}>
      <div className="flex items-start gap-3">
        <span className="text-base">{s.icon}</span>
        <div>
          <p className={`text-sm font-semibold ${s.title}`}>{title}</p>
          {children && <p className={`text-sm mt-0.5 ${s.body}`}>{children}</p>}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color = "blue",
  trend,
}: {
  label: string;
  value: string | number;
  icon: string;
  color?: "blue" | "teal" | "amber" | "green" | "red";
  trend?: string;
}) {
  const colors = {
    blue: "from-[#1a3a5c] to-[#2b7dd4]",
    teal: "from-[#0ea5a0] to-[#14b8b2]",
    amber: "from-amber-500 to-amber-400",
    green: "from-emerald-600 to-emerald-500",
    red: "from-red-600 to-red-500",
  };
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 font-medium">{label}</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
          {trend && <p className="text-xs text-slate-400 mt-1">{trend}</p>}
        </div>
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center text-xl shadow-sm`}>
          {icon}
        </div>
      </div>
    </Card>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const navGroups = [
  {
    label: "PRODUCCIÓN",
    items: [
      { id: "dashboard-prod", label: "Dashboard", icon: "🏭" },
      { id: "register-lot", label: "Registrar Lote", icon: "➕" },
      { id: "lot-detail", label: "Detalle de Lote", icon: "📋" },
    ],
  },
  {
    label: "Módulo de Calidad",
    items: [
      { id: "dashboard-qa", label: "Dashboard QA", icon: "🔬" },
      { id: "quality-control", label: "Control de Calidad", icon: "✅" },
      { id: "cold-chain", label: "Cadena de Frío", icon: "❄️" },
      { id: "smart-validation", label: "Validación Inteligente", icon: "🧠" },
    ],
  },
  {
    label: "Módulo de Logística",
    items: [
      { id: "dashboard-logistics", label: "Dashboard Logística", icon: "🚢" },
      { id: "certification-mgmt", label: "Gestión Certificación", icon: "📜" },
      { id: "digital-file", label: "Expediente Digital", icon: "🗂️" },
      { id: "dispatch", label: "Despacho", icon: "📦" },
    ],
  },
  {
    label: "GERENCIA",
    items: [{ id: "dashboard-mgmt", label: "Dashboard Gerencial", icon: "📊" }],
  },
];

function Sidebar({
  current,
  onNav,
}: {
  current: Screen;
  onNav: (s: Screen) => void;
}) {
  return (
    <aside className="w-64 min-h-screen bg-[#0a1628] flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#0ea5a0] flex items-center justify-center text-white font-bold text-sm shadow-md">
            ET
          </div>
          <div>
            <p className="text-white font-bold text-base tracking-tight">ExporTrace</p>
            <p className="text-slate-400 text-[10px] leading-tight">Sistema de Trazabilidad</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-5">
            <p className="text-[10px] font-semibold tracking-widest text-slate-500 uppercase px-3 mb-2">
              {group.label}
            </p>
            {group.items.map((item) => {
              const active = current === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNav(item.id as Screen)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all mb-0.5 cursor-pointer ${
                    active
                      ? "bg-[#0ea5a0]/20 text-[#5eead4] font-medium"
                      : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  {item.label}
                  {active && (
                    <div className="ml-auto w-1 h-4 rounded-full bg-[#0ea5a0]" />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#0ea5a0] flex items-center justify-center text-white text-xs font-bold">
            MR
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">Mayra Bustamente</p>
            <p className="text-slate-500 text-[10px] truncate">Gerencia</p>
          </div>
          <span className="text-slate-500 text-xs">›</span>
        </div>
      </div>
    </aside>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────

function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="h-14 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
      <div>
        <h1 className="text-base font-semibold text-slate-800">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
          <span className="text-lg">🔔</span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <div className="text-xs text-slate-500 mono">
          {new Date().toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" })}
        </div>
      </div>
    </div>
  );
}

// ─── Screen: Login ────────────────────────────────────────────────────────────

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0f2240] to-[#1a3a5c] flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#0ea5a0] shadow-xl mb-5">
            <span className="text-white font-black text-2xl">ET</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">ExporTrace</h1>
          <p className="text-slate-400 text-sm mt-2 leading-relaxed max-w-xs mx-auto">
            Sistema inteligente de trazabilidad y certificación sanitaria
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-6">Iniciar sesión</h2>
          <div className="flex flex-col gap-4">
            <Input label="Correo electrónico" type="email" placeholder="usuario@exportrace.pe" />
            <Input label="Contraseña" type="password" placeholder="••••••••" />

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                <input type="checkbox" className="rounded border-slate-300 accent-[#0ea5a0]" />
                Recordar sesión
              </label>
              <button className="text-[#0ea5a0] hover:text-[#0d9490] font-medium transition-colors cursor-pointer">
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <Btn variant="primary" full onClick={onLogin} size="lg">
              Iniciar sesión
            </Btn>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-xs text-slate-400 text-center">
              ¿Problemas para acceder? Contacta al administrador del sistema (972548838)
            </p>
          </div>
        </div>

        {/* Roles hint */}
        <div className="mt-6 flex flex-wrap gap-2 justify-center">
          {(["Administrador", "Producción", "QA", "Logística", "Gerencia"] as Role[]).map((r) => (
            <span key={r} className="px-2.5 py-1 rounded-full bg-white/10 text-white/60 text-xs">
              {r}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Screen: Dashboard Producción ─────────────────────────────────────────────

const LOTS = [
  { code: "LT-001", product: "Conchas de Abanico", species: "Argopecten purpuratus", date: "10/09/2026", qty: "10,500 kg", status: "En Produccion", statusColor: "gray" as const },
  { code: "LT-002", product: "Anchoveta HGT", species: "Engraulis ringens", date: "01/01/2026", qty: "8,500 kg", status: "En Calidad", statusColor: "blue" as const },
  { code: "LT-003", product: "Calamar tubo IQF", species: "Loligo gahi", date: "30/08/2026", qty: "10,400 kg", status: "Observado", statusColor: "amber" as const },
  { code: "LT-004", product: "Langostino ", species: "Litopenaeus vannamei", date: "28/08/2026", qty: "3,800 kg", status: "En Logística", statusColor: "teal" as const },
  { code: "LT-005", product: "Perico", species: "Coryphaena hippurus", date: "10/08/2026", qty: "6,100 kg", status: "En Despacho", statusColor: "teal" as const },
];

function DashboardProd({ onNav }: { onNav: (s: Screen) => void }) {
  return (
    <div className="flex-1 flex flex-col overflow-auto bg-slate-50">
      <Header title="Dashboard Producción" subtitle="Gestión de lotes hidrobiológicos" />
      <div className="flex-1 p-8 flex flex-col gap-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-5">
          <StatCard label="Lotes Registrados" value="15" icon="📦" color="blue" trend="Este mes" />
          <StatCard label="En Proceso" value="10" icon="⚙️" color="teal" trend="Activos ahora" />
          <StatCard label="Enviados a QA" value="8" icon="🔬" color="green" trend="Pendientes revisión" />
          <StatCard label="Observados" value="1" icon="⚠️" color="amber" trend="Requieren atención" />
        </div>

        {/* Table */}
        <Card className="flex-1">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-800">Lotes de producción</h2>
              <p className="text-sm text-slate-500 mt-0.5">Registro y seguimiento por lote</p>
            </div>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Buscar lote..."
                className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0ea5a0]"
              />
              <Btn variant="primary" onClick={() => onNav("register-lot")}>
                + Registrar nuevo lote
              </Btn>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  {["Código Lote", "Producto / Especie", "Fecha Prod.", "Cantidad", "Estado", "Acciones"].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {LOTS.map((lot, i) => (
                  <tr key={lot.code} className={`border-b border-slate-50 hover:bg-slate-50 transition-colors ${i % 2 === 0 ? "" : ""}`}>
                    <td className="px-6 py-4">
                      <span className="mono text-sm font-semibold text-[#1a3a5c]">{lot.code}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-800">{lot.product}</p>
                      <p className="text-xs text-slate-400 italic">{lot.species}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 mono">{lot.date}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-700">{lot.qty}</td>
                    <td className="px-6 py-4">
                      <Badge color={lot.statusColor}>{lot.status}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Btn variant="ghost" size="sm" onClick={() => onNav("lot-detail")}>Ver detalle</Btn>
                        <Btn variant="ghost" size="sm">QR</Btn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 flex items-center justify-between border-t border-slate-100">
            <p className="text-sm text-slate-500">Mostrando 1 de 3 lotes</p>
            <div className="flex gap-2">
              <Btn variant="ghost" size="sm">← Anterior</Btn>
              <Btn variant="ghost" size="sm">Siguiente →</Btn>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── Screen: Registrar Lote ───────────────────────────────────────────────────

function RegisterLot({ onNav }: { onNav: (s: Screen) => void }) {
  const [registered, setRegistered] = useState(false);

  if (registered) {
    return (
      <div className="flex-1 flex flex-col overflow-auto bg-slate-50">
        <Header title="Lote Registrado" subtitle="Código generado exitosamente" />
        <div className="flex-1 p-8 flex items-center justify-center">
          <Card className="max-w-lg w-full p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4 text-3xl">✅</div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Lote registrado exitosamente</h2>
            <p className="text-slate-500 text-sm mb-6">El lote ha sido creado y está pendiente de inspección QA</p>

            <div className="bg-[#0a1628] rounded-xl p-6 mb-6 text-left">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">Código de lote</p>
                  <p className="text-white text-2xl font-bold mono">EX-2026-006</p>
                </div>
                {/* QR simulado */}
                <div className="w-20 h-20 bg-white rounded-lg p-1.5">
                  <div className="w-full h-full grid grid-cols-7 gap-0.5">
                    {Array.from({ length: 49 }).map((_, i) => (
                      <div key={i} className={`rounded-[1px] ${Math.random() > 0.5 ? "bg-[#0a1628]" : "bg-white"}`} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-slate-500 text-xs">Producto</p><p className="text-white font-medium">Merluza HGT</p></div>
                <div><p className="text-slate-500 text-xs">Cantidad</p><p className="text-white font-medium">6,200 kg</p></div>
                <div><p className="text-slate-500 text-xs">Estado</p><p className="text-[#5eead4] font-medium">⏳ Pendiente QA</p></div>
                <div><p className="text-slate-500 text-xs">Responsable</p><p className="text-white font-medium">C. Torres</p></div>
              </div>
            </div>

            <div className="flex gap-3">
              <Btn variant="outline" full onClick={() => setRegistered(false)}>Registrar otro lote</Btn>
              <Btn variant="primary" full onClick={() => onNav("dashboard-prod")}>Ver dashboard</Btn>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto bg-slate-50">
      <Header title="Registrar Nuevo Lote" subtitle="Ingrese la información de producción" />
      <div className="flex-1 p-8">
        <div className="max-w-3xl mx-auto">
          <Card className="p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 rounded-lg bg-[#1a3a5c] flex items-center justify-center text-white text-sm font-bold">1</div>
              <div>
                <h2 className="text-base font-semibold text-slate-800">Información del lote</h2>
                <p className="text-xs text-slate-500">Campos con * son obligatorios</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <Select label="Producto" required options={["Seleccionar...", "Pota entera congelada", "Anchoveta HGT", "Calamar tubo IQF", "Langostino pelado", "Caballa HGT", "Merluza HGT"]} />
              <Input label="Especie (nombre científico)" placeholder="Ej: Dosidicus gigas" required />
              <Input label="Fecha de producción" type="date" required />
              <div className="flex gap-3">
                <div className="flex-1">
                  <Input label="Cantidad" type="number" placeholder="0" required />
                </div>
                <Select label="Unidad" options={["kg", "TM", "cajas", "unidades"]} />
              </div>
              <Input label="Proveedor / Embarcación" placeholder="Ej: Embarcación Señor de los Milagros" required />
              <Input label="Fecha de recepción" type="date" required />
              <Select label="Tipo de procesamiento" required options={["Seleccionar...", "Congelado entero", "Congelado HGT", "IQF", "Fresco refrigerado", "Cocido congelado"]} />
              <Input label="Responsable de producción" placeholder="Nombre completo" required />
              <div className="col-span-2">
                <Textarea label="Observaciones" placeholder="Condiciones de recepción, observaciones iniciales del lote..." />
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end gap-3">
              <Btn variant="ghost" onClick={() => onNav("dashboard-prod")}>Cancelar</Btn>
              <Btn variant="primary" onClick={() => setRegistered(true)} size="lg">
                Registrar lote y generar QR
              </Btn>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── Screen: Detalle Integral del Lote ───────────────────────────────────────

const LOT_TABS = ["Resumen", "Producción", "Calidad", "Cadena de frío", "Documentos", "Certificación", "Historial"];

function LotDetail({ onNav }: { onNav: (s: Screen) => void }) {
  const [activeTab, setActiveTab] = useState("Resumen");

  const timeline = [
    { label: "Producción", icon: "🏭", status: "done" },
    { label: "QA", icon: "🔬", status: "done" },
    { label: "Cadena de frío", icon: "❄️", status: "warning" },
    { label: "Validación", icon: "🧠", status: "pending" },
    { label: "Certificación", icon: "📜", status: "locked" },
    { label: "Despacho", icon: "📦", status: "locked" },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-auto bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <button onClick={() => onNav("dashboard-prod")} className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer">← Volver</button>
              <span className="text-slate-200">|</span>
              <h1 className="text-xl font-bold text-[#0a1628] mono">Lote EX-2026-001</h1>
              <Badge color="amber">⚠ Observado — Cadena de frío</Badge>
            </div>
            <p className="text-sm text-slate-500">Pota entera congelada · Dosidicus gigas · 12,500 kg · Creado 28/08/2026</p>
          </div>
          <div className="flex gap-3">
            <Btn variant="outline" size="sm">🖨️ Imprimir QR</Btn>
            <Btn variant="secondary" size="sm">📤 Exportar</Btn>
          </div>
        </div>

        {/* Timeline */}
        <div className="mt-5 flex items-center gap-0">
          {timeline.map((step, i) => {
            const isLast = i === timeline.length - 1;
            const statusStyles = {
              done: { dot: "bg-emerald-500", text: "text-emerald-700", line: "bg-emerald-300" },
              warning: { dot: "bg-amber-400", text: "text-amber-600", line: "bg-slate-200" },
              pending: { dot: "bg-slate-300", text: "text-slate-500", line: "bg-slate-200" },
              locked: { dot: "bg-slate-200", text: "text-slate-400", line: "bg-slate-200" },
            };
            const s = statusStyles[step.status as keyof typeof statusStyles];
            const icon = step.status === "done" ? "✓" : step.status === "warning" ? "!" : "–";
            return (
              <div key={step.label} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full ${s.dot} flex items-center justify-center text-white text-xs font-bold shadow-sm`}>
                    {icon}
                  </div>
                  <p className={`text-[10px] font-medium mt-1 ${s.text}`}>{step.icon} {step.label}</p>
                </div>
                {!isLast && <div className={`w-16 h-0.5 ${s.line} mx-1 mb-4`} />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200 px-8">
        <div className="flex gap-1">
          {LOT_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                activeTab === tab
                  ? "border-[#0ea5a0] text-[#0a1628]"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-8 flex gap-6">
        <div className="flex-1 flex flex-col gap-5">
          {activeTab === "Resumen" && (
            <>
              {/* Status grid */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Producción", status: "✓ Conforme", color: "green" as const },
                  { label: "Calidad QA", status: "✓ Conforme", color: "green" as const },
                  { label: "Cadena de frío", status: "⚠ Con observaciones", color: "amber" as const },
                  { label: "Documentación", status: "✓ Completa", color: "green" as const },
                  { label: "Validación", status: "⏳ Pendiente", color: "gray" as const },
                  { label: "Certificación", status: "🔒 No iniciada", color: "gray" as const },
                ].map((item) => (
                  <Card key={item.label} className="p-4 flex items-center gap-3">
                    <Badge color={item.color}>{item.status}</Badge>
                    <span className="text-sm font-medium text-slate-700">{item.label}</span>
                  </Card>
                ))}
              </div>

              <Alert type="warning" title="Observación en cadena de frío">
                Registro de las 14:30 del 29/08/2026 muestra temperatura de -14.2°C (límite: -18°C). Requiere justificación del responsable.
              </Alert>

              {/* Info cards */}
              <div className="grid grid-cols-2 gap-5">
                <Card className="p-5">
                  <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">🏭 Información de Producción</h3>
                  <dl className="grid grid-cols-2 gap-3 text-sm">
                    {[
                      ["Producto", "Pota entera congelada"],
                      ["Especie", "Dosidicus gigas"],
                      ["Cantidad", "12,500 kg"],
                      ["Procesamiento", "Congelado entero"],
                      ["Embarcación", "Señor del Mar I"],
                      ["Responsable", "Carlos Torres"],
                    ].map(([k, v]) => (
                      <div key={k}><dt className="text-slate-500 text-xs">{k}</dt><dd className="font-medium text-slate-800 mt-0.5">{v}</dd></div>
                    ))}
                  </dl>
                </Card>
                <Card className="p-5">
                  <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">🔬 Control de Calidad</h3>
                  <dl className="grid grid-cols-2 gap-3 text-sm">
                    {[
                      ["Inspector", "María Ríos"],
                      ["Fecha inspección", "28/08/2026"],
                      ["Apariencia", "Buena"],
                      ["Textura", "Firme"],
                      ["Color", "Característico"],
                      ["Resultado", "✓ Conforme"],
                    ].map(([k, v]) => (
                      <div key={k}><dt className="text-slate-500 text-xs">{k}</dt><dd className="font-medium text-slate-800 mt-0.5">{v}</dd></div>
                    ))}
                  </dl>
                </Card>
              </div>
            </>
          )}

          {activeTab === "Cadena de frío" && (
            <div className="flex flex-col gap-5">
              <Alert type="warning" title="Registro con temperatura fuera de rango">
                El registro del 29/08/2026 a las 14:30 muestra -14.2°C. El límite es -18°C. Se requiere justificación.
              </Alert>
              <Card className="p-5">
                <h3 className="text-sm font-semibold text-slate-700 mb-4">Historial de temperaturas</h3>
                {/* Gráfico simple */}
                <div className="h-40 bg-slate-50 rounded-lg p-4 flex items-end gap-2 mb-4">
                  {[-19.1, -18.8, -18.5, -19.0, -14.2, -18.3, -18.9].map((temp, i) => {
                    const isAlert = temp > -18;
                    const height = Math.min(100, Math.abs((-22 - temp) / (-22 - -14)) * 100);
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div
                          style={{ height: `${height}%` }}
                          className={`w-full rounded-t-sm ${isAlert ? "bg-amber-400" : "bg-[#0ea5a0]"}`}
                        />
                        <span className="text-[9px] text-slate-400 mono">{temp}°</span>
                      </div>
                    );
                  })}
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      {["Fecha", "Hora", "Temp. (°C)", "Ubicación", "Responsable", "Estado"].map((h) => (
                        <th key={h} className="text-left pb-2 text-xs text-slate-500 font-semibold uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["28/08/2026", "08:00", "-19.1", "Cámara 1", "J. Pérez", "normal"],
                      ["28/08/2026", "14:00", "-18.8", "Cámara 1", "J. Pérez", "normal"],
                      ["29/08/2026", "08:00", "-18.5", "Cámara 1", "A. López", "normal"],
                      ["29/08/2026", "14:30", "-14.2", "Cámara 1", "A. López", "warning"],
                      ["29/08/2026", "16:00", "-18.3", "Cámara 1", "A. López", "normal"],
                      ["30/08/2026", "08:00", "-18.9", "Cámara 2", "J. Pérez", "normal"],
                    ].map(([date, time, temp, loc, resp, status]) => (
                      <tr key={`${date}-${time}`} className="border-b border-slate-50 hover:bg-slate-50">
                        <td className="py-2 mono text-xs">{date}</td>
                        <td className="py-2 mono text-xs">{time}</td>
                        <td className="py-2 font-semibold mono">{temp}°C</td>
                        <td className="py-2 text-slate-600">{loc}</td>
                        <td className="py-2 text-slate-600">{resp}</td>
                        <td className="py-2">
                          <Badge color={status === "normal" ? "teal" : status === "warning" ? "amber" : "red"}>
                            {status === "normal" ? "Normal" : status === "warning" ? "Advertencia" : "Crítico"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </div>
          )}

          {activeTab === "Documentos" && (
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-700">Documentos del lote</h3>
                <Btn variant="outline" size="sm">+ Adjuntar documento</Btn>
              </div>
              <div className="flex flex-col gap-3">
                {[
                  { name: "Guía de remisión EX-001.pdf", type: "PDF", size: "324 KB", status: "Verificado" },
                  { name: "Informe de inspección QA.pdf", type: "PDF", size: "1.2 MB", status: "Verificado" },
                  { name: "Registro de cadena de frío.xlsx", type: "Excel", size: "87 KB", status: "Verificado" },
                  { name: "Foto lote - apariencia.jpg", type: "Imagen", size: "2.1 MB", status: "Verificado" },
                  { name: "Certificado de origen embarcación.pdf", type: "PDF", size: "456 KB", status: "Verificado" },
                ].map((doc) => (
                  <div key={doc.name} className="flex items-center gap-4 p-3 rounded-lg border border-slate-100 hover:bg-slate-50">
                    <span className="text-2xl">{doc.type === "PDF" ? "📄" : doc.type === "Excel" ? "📊" : "🖼️"}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-800">{doc.name}</p>
                      <p className="text-xs text-slate-400">{doc.type} · {doc.size}</p>
                    </div>
                    <Badge color="green">{doc.status}</Badge>
                    <Btn variant="ghost" size="sm">Ver</Btn>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {(activeTab === "Producción" || activeTab === "Calidad" || activeTab === "Certificación" || activeTab === "Historial") && (
            <Card className="p-8 flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-4xl mb-3">📋</p>
                <p className="text-slate-500 text-sm">Vista {activeTab} — contenido disponible</p>
                <p className="text-slate-400 text-xs mt-1">Selecciona Resumen, Cadena de frío o Documentos para ver datos detallados</p>
              </div>
            </Card>
          )}
        </div>

        {/* Validación panel */}
        <div className="w-72 shrink-0">
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">🧠 Validación inteligente</h3>
            <div className="flex flex-col gap-2 mb-5">
              {[
                { label: "Información de producción", ok: true },
                { label: "Control QA completo", ok: true },
                { label: "Cadena de frío", ok: false },
                { label: "Documentación", ok: true },
                { label: "Responsable asignado", ok: true },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${item.ok ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"}`}>
                    {item.ok ? "✓" : "!"}
                  </span>
                  <span className={`text-xs ${item.ok ? "text-slate-700" : "text-amber-700 font-medium"}`}>{item.label}</span>
                </div>
              ))}
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
              <p className="text-xs font-semibold text-amber-800 mb-1">⚠ Estado: OBSERVADO</p>
              <p className="text-xs text-amber-700">1 inconsistencia en cadena de frío requiere acción</p>
            </div>

            <Btn variant="outline" full size="sm" onClick={() => onNav("smart-validation")}>
              Ver validación completa
            </Btn>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── Screen: Dashboard QA ─────────────────────────────────────────────────────

function DashboardQA({ onNav }: { onNav: (s: Screen) => void }) {
  return (
    <div className="flex-1 flex flex-col overflow-auto bg-slate-50">
      <Header title="QualityTrac — Dashboard QA" subtitle="Control de calidad e inspecciones" />
      <div className="flex-1 p-8 flex flex-col gap-6">
        <div className="grid grid-cols-4 gap-5">
          <StatCard label="Pendientes de inspección" value="6" icon="⏳" color="blue" />
          <StatCard label="Conformes" value="31" icon="✅" color="green" />
          <StatCard label="Observados" value="4" icon="⚠️" color="amber" />
          <StatCard label="Alertas activas" value="2" icon="🚨" color="red" />
        </div>

        <Alert type="warning" title="Alerta activa: Temperatura fuera de rango">
          Lote EX-2026-001 — Registro de cadena de frío requiere revisión inmediata. Inspector: María Ríos
        </Alert>

        <Card>
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-800">Cola de inspecciones QA</h2>
            <Btn variant="primary" size="sm" onClick={() => onNav("quality-control")}>+ Nueva inspección</Btn>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                {["Lote", "Producto", "Prod. Fecha", "Est. QA", "Cadena de frío", "Prioridad", "Acciones"].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { code: "EX-2026-001", product: "Pota congelada", date: "28/08/2026", qa: "Conforme", qa_color: "green" as const, cold: "⚠ Observada", cold_color: "amber" as const, priority: "Alta" },
                { code: "EX-2026-002", product: "Anchoveta HGT", date: "29/08/2026", qa: "Conforme", qa_color: "green" as const, cold: "✓ Normal", cold_color: "teal" as const, priority: "Normal" },
                { code: "EX-2026-003", product: "Calamar IQF", date: "30/08/2026", qa: "Observado", qa_color: "amber" as const, cold: "✓ Normal", cold_color: "teal" as const, priority: "Alta" },
                { code: "EX-2026-005", product: "Caballa HGT", date: "31/08/2026", qa: "Pendiente", qa_color: "gray" as const, cold: "Pendiente", cold_color: "gray" as const, priority: "Normal" },
              ].map((row) => (
                <tr key={row.code} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 mono text-sm font-semibold text-[#1a3a5c]">{row.code}</td>
                  <td className="px-6 py-4 text-sm text-slate-800">{row.product}</td>
                  <td className="px-6 py-4 text-sm text-slate-500 mono">{row.date}</td>
                  <td className="px-6 py-4"><Badge color={row.qa_color}>{row.qa}</Badge></td>
                  <td className="px-6 py-4"><Badge color={row.cold_color}>{row.cold}</Badge></td>
                  <td className="px-6 py-4"><Badge color={row.priority === "Alta" ? "red" : "gray"}>{row.priority}</Badge></td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Btn variant="ghost" size="sm" onClick={() => onNav("quality-control")}>Inspeccionar</Btn>
                      <Btn variant="ghost" size="sm" onClick={() => onNav("cold-chain")}>Cadena frío</Btn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}

// ─── Screen: Control de Calidad ───────────────────────────────────────────────

function QualityControl({ onNav }: { onNav: (s: Screen) => void }) {
  const [result, setResult] = useState<"" | "Conforme" | "Observado" | "No conforme">("");
  const [saved, setSaved] = useState(false);

  if (saved) {
    return (
      <div className="flex-1 flex flex-col overflow-auto bg-slate-50">
        <Header title="Control de Calidad" subtitle="Inspección registrada" />
        <div className="flex-1 p-8 flex items-center justify-center">
          <Card className="max-w-md w-full p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4 text-3xl">✅</div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Inspección registrada</h2>
            <p className="text-slate-500 text-sm mb-2">Lote EX-2026-005 · Resultado: <strong>{result}</strong></p>
            <p className="text-slate-400 text-xs mb-6">Inspector: María Ríos · {new Date().toLocaleDateString("es-PE")}</p>
            <div className="flex gap-3">
              <Btn variant="ghost" full onClick={() => { setSaved(false); setResult(""); }}>Nueva inspección</Btn>
              <Btn variant="primary" full onClick={() => onNav("dashboard-qa")}>Volver a QA</Btn>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto bg-slate-50">
      <Header title="Control de Calidad" subtitle="Inspección organoléptica — Lote EX-2026-005" />
      <div className="flex-1 p-8">
        <div className="max-w-3xl mx-auto flex flex-col gap-5">
          <Card className="p-6">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg mb-6">
              <div className="w-10 h-10 rounded-lg bg-[#1a3a5c] flex items-center justify-center text-white text-sm">🔬</div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Lote EX-2026-005 — Caballa HGT congelada</p>
                <p className="text-xs text-slate-500">Scomber japonicus · 9,100 kg · Producción: 31/08/2026</p>
              </div>
              <Badge color="gray" >Pendiente inspección</Badge>
            </div>

            <h3 className="text-sm font-semibold text-slate-700 mb-4">Parámetros organolépticos</h3>
            <div className="grid grid-cols-2 gap-5">
              <Select label="Apariencia general" required options={["Seleccionar...", "Buena", "Aceptable", "Deficiente"]} />
              <Select label="Color" required options={["Seleccionar...", "Característico", "Ligeramente pálido", "Anormal"]} />
              <Select label="Textura" required options={["Seleccionar...", "Firme", "Ligeramente blanda", "Blanda"]} />
              <Select label="Condición general" required options={["Seleccionar...", "Sin daños", "Daños menores", "Daños mayores"]} />
              <div className="col-span-2">
                <Textarea label="Observaciones del inspector" placeholder="Descripción detallada de las condiciones del lote, anomalías encontradas..." />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Resultado de la inspección</h3>
            <div className="flex gap-4 mb-6">
              {(["Conforme", "Observado", "No conforme"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setResult(r)}
                  className={`flex-1 py-3 rounded-lg border-2 text-sm font-semibold transition-all cursor-pointer ${
                    result === r
                      ? r === "Conforme"
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : r === "Observado"
                        ? "border-amber-400 bg-amber-50 text-amber-700"
                        : "border-red-500 bg-red-50 text-red-700"
                      : "border-slate-200 text-slate-500 hover:border-slate-300"
                  }`}
                >
                  {r === "Conforme" ? "✅ " : r === "Observado" ? "⚠️ " : "❌ "}
                  {r}
                </button>
              ))}
            </div>

            <h3 className="text-sm font-semibold text-slate-700 mb-3">Evidencia fotográfica</h3>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 rounded-lg border-2 border-dashed border-slate-200 flex items-center justify-center cursor-pointer hover:border-[#0ea5a0] transition-colors bg-slate-50">
                  <span className="text-slate-400 text-sm">📷 Foto {i}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3">
              <Btn variant="ghost" onClick={() => onNav("dashboard-qa")}>Cancelar</Btn>
              <Btn variant="primary" disabled={!result} onClick={() => setSaved(true)}>
                Guardar inspección
              </Btn>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── Screen: Cadena de Frío ───────────────────────────────────────────────────

function ColdChain({ onNav }: { onNav: (s: Screen) => void }) {
  const [saved, setSaved] = useState(false);
  const records = [
    { date: "28/08", time: "08:00", temp: -19.1, loc: "Cámara 1", resp: "J. Pérez", status: "normal" as const },
    { date: "28/08", time: "14:00", temp: -18.8, loc: "Cámara 1", resp: "J. Pérez", status: "normal" as const },
    { date: "29/08", time: "08:00", temp: -18.5, loc: "Cámara 1", resp: "A. López", status: "normal" as const },
    { date: "29/08", time: "14:30", temp: -14.2, loc: "Cámara 1", resp: "A. López", status: "warning" as const },
    { date: "29/08", time: "16:00", temp: -18.3, loc: "Cámara 1", resp: "A. López", status: "normal" as const },
    { date: "30/08", time: "08:00", temp: -18.9, loc: "Cámara 2", resp: "J. Pérez", status: "normal" as const },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-auto bg-slate-50">
      <Header title="Cadena de Frío" subtitle="Registro manual de temperaturas — Lote EX-2026-001" />
      <div className="flex-1 p-8 flex gap-6">
        {/* Form */}
        <div className="w-80 shrink-0 flex flex-col gap-5">
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Nuevo registro de temperatura</h3>
            <div className="flex flex-col gap-4">
              <Input label="Fecha" type="date" required />
              <Input label="Hora" type="time" required />
              <Input label="Temperatura (°C)" type="number" placeholder="-18.0" required />
              <Select label="Ubicación / Cámara" required options={["Cámara 1", "Cámara 2", "Cámara 3", "Contenedor A", "Contenedor B"]} />
              <Input label="Responsable" placeholder="Nombre del operario" required />
              <Textarea label="Observaciones" placeholder="Motivo si hay anomalías..." rows={2} />
              {saved && <Alert type="success" title="Registro guardado correctamente" />}
              <Btn variant="primary" full onClick={() => setSaved(true)}>Registrar temperatura</Btn>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">Parámetros de control</h3>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Límite máximo</span><span className="font-semibold text-slate-800 mono">-18°C</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Zona advertencia</span><span className="font-semibold text-amber-600 mono">-16°C a -18°C</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Zona crítica</span><span className="font-semibold text-red-600 mono">&gt; -16°C</span></div>
            </div>
          </Card>
        </div>

        {/* History */}
        <div className="flex-1 flex flex-col gap-5">
          <Alert type="warning" title="Registro fuera de rango detectado">
            29/08/2026 14:30 — Temperatura -14.2°C registrada por A. López en Cámara 1.
          </Alert>

          <Card className="p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Gráfico de temperaturas</h3>
            <div className="h-44 bg-slate-50 rounded-xl p-4 flex items-end gap-3 border border-slate-100">
              {records.map((r, i) => {
                const normalized = ((r.temp + 22) / (-14 + 22)) * 100;
                const h = Math.max(10, Math.min(100, normalized));
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex flex-col-reverse" style={{ height: "120px" }}>
                      <div
                        style={{ height: `${h}%` }}
                        className={`w-full rounded-t-md transition-all ${r.status === "warning" ? "bg-amber-400" : "bg-[#0ea5a0]"}`}
                      />
                    </div>
                    <span className="text-[9px] text-slate-400 mono">{r.temp}°</span>
                    <span className="text-[9px] text-slate-400">{r.time}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-4 mt-3 text-xs text-slate-500">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-[#0ea5a0] inline-block" />Normal</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-400 inline-block" />Advertencia</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500 inline-block" />Crítico</span>
            </div>
          </Card>

          <Card>
            <div className="p-5 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-800">Historial de registros</h3>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {["Fecha", "Hora", "Temp. (°C)", "Ubicación", "Responsable", "Estado"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.map((r, i) => (
                  <tr key={i} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="px-5 py-3 mono text-sm">{r.date}</td>
                    <td className="px-5 py-3 mono text-sm">{r.time}</td>
                    <td className={`px-5 py-3 mono text-sm font-bold ${r.status === "warning" ? "text-amber-600" : "text-slate-800"}`}>{r.temp}°C</td>
                    <td className="px-5 py-3 text-sm text-slate-600">{r.loc}</td>
                    <td className="px-5 py-3 text-sm text-slate-600">{r.resp}</td>
                    <td className="px-5 py-3">
                      <Badge color={r.status === "normal" ? "teal" : r.status === "warning" ? "amber" : "red"}>
                        {r.status === "normal" ? "Normal" : r.status === "warning" ? "Advertencia" : "Crítico"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── Screen: Validación Inteligente ──────────────────────────────────────────

function SmartValidation({ onNav }: { onNav: (s: Screen) => void }) {
  const [sent, setSent] = useState(false);
  const checks = [
    { label: "Información de producción", detail: "Producto, especie, cantidad, fecha registrados", ok: true },
    { label: "Inspector QA asignado y firmado", detail: "María Ríos · 28/08/2026", ok: true },
    { label: "Control de calidad completado", detail: "Resultado: Conforme", ok: true },
    { label: "Registros de cadena de frío", detail: "1 registro fuera de rango sin justificar", ok: false },
    { label: "Documentación completa", detail: "5 documentos adjuntos y verificados", ok: true },
    { label: "Responsable de producción", detail: "Carlos Torres asignado", ok: true },
  ];

  const allOk = checks.every((c) => c.ok);

  return (
    <div className="flex-1 flex flex-col overflow-auto bg-slate-50">
      <Header title="Validación Inteligente" subtitle="Verificación automática del expediente — Lote EX-2026-001" />
      <div className="flex-1 p-8">
        <div className="max-w-2xl mx-auto flex flex-col gap-5">
          {/* Status banner */}
          <div className={`rounded-xl p-5 border-2 ${allOk ? "bg-emerald-50 border-emerald-300" : "bg-amber-50 border-amber-300"}`}>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{allOk ? "✅" : "⚠️"}</span>
              <div>
                <p className={`font-bold text-base ${allOk ? "text-emerald-800" : "text-amber-800"}`}>
                  {allOk ? "INFORMACIÓN COMPLETA Y CONSISTENTE" : "ESTADO: OBSERVADO"}
                </p>
                <p className={`text-sm mt-0.5 ${allOk ? "text-emerald-700" : "text-amber-700"}`}>
                  {allOk
                    ? "El expediente está listo para enviar a Logística"
                    : `${checks.filter((c) => !c.ok).length} elemento(s) requieren atención antes de continuar`}
                </p>
              </div>
            </div>
          </div>

          {/* Checklist */}
          <Card className="p-6">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Checklist de validación automática</h3>
            <div className="flex flex-col gap-3">
              {checks.map((item) => (
                <div
                  key={item.label}
                  className={`flex items-start gap-4 p-4 rounded-lg border ${item.ok ? "border-emerald-100 bg-emerald-50/40" : "border-amber-200 bg-amber-50"}`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${item.ok ? "bg-emerald-500 text-white" : "bg-amber-400 text-white"}`}>
                    {item.ok ? "✓" : "!"}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-semibold ${item.ok ? "text-slate-800" : "text-amber-800"}`}>{item.label}</p>
                    <p className={`text-xs mt-0.5 ${item.ok ? "text-slate-500" : "text-amber-700"}`}>{item.detail}</p>
                  </div>
                  {item.ok ? (
                    <Badge color="green">Verificado</Badge>
                  ) : (
                    <Badge color="amber">Observado</Badge>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {!allOk && (
            <Alert type="warning" title="Acción requerida: Cadena de frío con anomalía">
              El registro del 29/08/2026 a las 14:30 muestra temperatura de -14.2°C. El operario A. López debe justificar la causa y el tiempo de exposición.
            </Alert>
          )}

          {sent ? (
            <Alert type="success" title="Notificación enviada al responsable">
              Se ha notificado a A. López para que justifique la anomalía en la cadena de frío. El lote permanece en estado Observado hasta que se complete la acción.
            </Alert>
          ) : (
            <div className="flex gap-3">
              {!allOk && (
                <Btn variant="outline" full onClick={() => setSent(true)}>
                  📤 Notificar responsable
                </Btn>
              )}
              <Btn variant={allOk ? "secondary" : "ghost"} full disabled={!allOk} onClick={() => onNav("dashboard-logistics")}>
                ✅ Enviar a Logística
              </Btn>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Screen: Dashboard Logística ─────────────────────────────────────────────

function DashboardLogistics({ onNav }: { onNav: (s: Screen) => void }) {
  return (
    <div className="flex-1 flex flex-col overflow-auto bg-slate-50">
      <Header title="LogisTrac — Dashboard Logística" subtitle="Gestión de certificación y despacho" />
      <div className="flex-1 p-8 flex flex-col gap-6">
        <div className="grid grid-cols-4 gap-5">
          <StatCard label="Listos para certificación" value="5" icon="📋" color="teal" />
          <StatCard label="En proceso certificación" value="3" icon="⏳" color="blue" />
          <StatCard label="Observados" value="2" icon="⚠️" color="amber" />
          <StatCard label="Aptos para despacho" value="4" icon="🚢" color="green" />
        </div>

        <Card>
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-800">Estado integral por lote</h2>
            <Btn variant="secondary" size="sm" onClick={() => onNav("certification-mgmt")}>Gestionar certificación</Btn>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {["Lote", "Producción", "Calidad", "Cadena frío", "Documentación", "Certificación", "Despacho", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { code: "EX-2026-001", prod: "green", qa: "green", cold: "amber", docs: "green", cert: "gray", disp: "gray" },
                  { code: "EX-2026-002", prod: "green", qa: "green", cold: "green", docs: "green", cert: "blue", disp: "gray" },
                  { code: "EX-2026-003", prod: "green", qa: "amber", cold: "green", docs: "amber", cert: "gray", disp: "gray" },
                  { code: "EX-2026-004", prod: "green", qa: "green", cold: "green", docs: "green", cert: "green", disp: "green" },
                ].map((row) => {
                  const icon = (c: string) => c === "green" ? "✓" : c === "amber" ? "⚠" : c === "blue" ? "⏳" : c === "red" ? "✗" : "–";
                  return (
                    <tr key={row.code} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 mono text-sm font-semibold text-[#1a3a5c]">{row.code}</td>
                      {([row.prod, row.qa, row.cold, row.docs, row.cert, row.disp] as const).map((c, i) => (
                        <td key={i} className="px-4 py-3"><Badge color={c as any}>{icon(c)}</Badge></td>
                      ))}
                      <td className="px-4 py-3">
                        <Btn variant="ghost" size="sm" onClick={() => onNav("certification-mgmt")}>Gestionar</Btn>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── Screen: Gestión de Certificación ────────────────────────────────────────

function CertificationMgmt({ onNav }: { onNav: (s: Screen) => void }) {
  const [status, setStatus] = useState<"Pendiente" | "En revisión" | "Observado" | "Aprobado">("Pendiente");

  return (
    <div className="flex-1 flex flex-col overflow-auto bg-slate-50">
      <Header title="Gestión de Certificación" subtitle="Lote EX-2026-002 — Preparación de expediente" />
      <div className="flex-1 p-8 flex gap-6">
        <div className="flex-1 flex flex-col gap-5">
          {/* Estado */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 flex items-center gap-4">
            <span className="text-3xl">✅</span>
            <div>
              <p className="font-bold text-emerald-800">LISTO PARA GESTIÓN DE CERTIFICACIÓN SANITARIA</p>
              <p className="text-sm text-emerald-700 mt-0.5">Toda la información del lote está validada y completa. Puede proceder a generar el expediente y registrar la solicitud ante SANIPES.</p>
            </div>
          </div>

          {/* Checklist requerida */}
          <Card className="p-6">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Información requerida para certificación</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                "Datos del exportador registrado",
                "Información del lote de producción",
                "Resultado de control de calidad",
                "Registros de cadena de frío completos",
                "Guía de remisión del proveedor",
                "Especificaciones del producto destino",
                "Información del contenedor / vehículo",
                "País de destino y cliente",
                "Certificado de origen (si aplica)",
                "Análisis microbiológico adjunto",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50 border border-emerald-100">
                  <span className="text-emerald-600 text-sm">✓</span>
                  <span className="text-xs text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Estado de la solicitud */}
          <Card className="p-6">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Estado de la solicitud</h3>
            <div className="flex gap-3 mb-5">
              {(["Pendiente", "En revisión", "Observado", "Aprobado"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`flex-1 py-2 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                    status === s
                      ? s === "Aprobado" ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : s === "Observado" ? "border-amber-400 bg-amber-50 text-amber-700"
                        : s === "En revisión" ? "border-blue-400 bg-blue-50 text-blue-700"
                        : "border-slate-400 bg-slate-100 text-slate-700"
                      : "border-slate-200 text-slate-400 hover:border-slate-300"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            {status === "Aprobado" && (
              <Alert type="success" title="Certificación aprobada">
                El lote EX-2026-002 ha sido aprobado. Puede proceder a autorizar el despacho.
              </Alert>
            )}
          </Card>

          <div className="flex gap-3">
            <Btn variant="outline" onClick={() => onNav("digital-file")}>🗂️ Generar expediente digital</Btn>
            <Btn variant="primary">📝 Registrar solicitud ante SANIPES</Btn>
            {status === "Aprobado" && (
              <Btn variant="secondary" onClick={() => onNav("dispatch")}>🚢 Autorizar despacho</Btn>
            )}
          </div>
        </div>

        {/* Info side */}
        <div className="w-72 shrink-0">
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Resumen del lote</h3>
            <dl className="flex flex-col gap-3 text-sm">
              {[
                ["Lote", "EX-2026-002"],
                ["Producto", "Anchoveta HGT"],
                ["Cantidad", "8,200 kg"],
                ["Destino", "España — Grupo Calvo S.A."],
                ["Puerto salida", "Callao"],
                ["Contenedor", "MSKU-7842301"],
                ["Estimado despacho", "05/09/2026"],
              ].map(([k, v]) => (
                <div key={k} className="flex flex-col gap-0.5">
                  <dt className="text-xs text-slate-500">{k}</dt>
                  <dd className="font-medium text-slate-800">{v}</dd>
                </div>
              ))}
            </dl>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── Screen: Expediente Digital ───────────────────────────────────────────────

function DigitalFile({ onNav }: { onNav: (s: Screen) => void }) {
  return (
    <div className="flex-1 flex flex-col overflow-auto bg-slate-50">
      <Header title="Expediente Digital" subtitle="Vista consolidada — Lote EX-2026-002" />
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto flex flex-col gap-5">
          {/* Header card */}
          <Card className="p-6 bg-[#0a1628] text-white">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Expediente de exportación</p>
                <h2 className="text-2xl font-bold mono">EX-2026-002</h2>
                <p className="text-slate-300 text-sm mt-1">Anchoveta HGT congelada · Engraulis ringens</p>
                <div className="flex gap-3 mt-3">
                  <Badge color="teal">✓ Validado</Badge>
                  <Badge color="green">Listo para certificación</Badge>
                </div>
              </div>
              <div className="w-20 h-20 bg-white rounded-xl p-1.5 flex-shrink-0">
                <div className="w-full h-full grid grid-cols-7 gap-0.5">
                  {Array.from({ length: 49 }).map((_, i) => (
                    <div key={i} className={`rounded-[1px] ${[0,1,5,6,7,13,14,21,27,28,35,36,42,43,47,48].includes(i) ? "bg-[#0a1628]" : "bg-white"}`} />
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-5">
            {[
              {
                title: "🏭 Producción",
                items: [["Producto", "Anchoveta HGT congelada"], ["Especie", "Engraulis ringens"], ["Cantidad", "8,200 kg"], ["Procesamiento", "HGT congelado"], ["Embarcación", "Mar Profundo II"], ["Fecha prod.", "29/08/2026"]],
              },
              {
                title: "🔬 Control de Calidad",
                items: [["Inspector", "María Ríos"], ["Fecha", "29/08/2026"], ["Apariencia", "Buena"], ["Textura", "Firme"], ["Resultado", "Conforme"], ["N° inspección", "QA-2026-089"]],
              },
              {
                title: "❄️ Cadena de Frío",
                items: [["Temperatura promedio", "-18.9°C"], ["Registros", "8 registros"], ["Anomalías", "Ninguna"], ["Cámara", "Cámara 2"], ["Responsable", "J. Pérez"], ["Estado", "Normal ✓"]],
              },
              {
                title: "📄 Documentación",
                items: [["Guía de remisión", "Adjunta ✓"], ["Informe QA", "Adjunto ✓"], ["Reg. cadena frío", "Adjunto ✓"], ["Fotos evidencia", "3 fotos ✓"], ["Cert. origen", "Adjunto ✓"], ["Análisis micro.", "Adjunto ✓"]],
              },
            ].map((section) => (
              <Card key={section.title} className="p-5">
                <h3 className="text-sm font-semibold text-slate-800 mb-3">{section.title}</h3>
                <dl className="grid grid-cols-2 gap-2 text-sm">
                  {section.items.map(([k, v]) => (
                    <div key={k}>
                      <dt className="text-xs text-slate-500">{k}</dt>
                      <dd className="font-medium text-slate-800 mt-0.5">{v}</dd>
                    </div>
                  ))}
                </dl>
              </Card>
            ))}
          </div>

          <Card className="p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">📦 Información de despacho</h3>
            <div className="grid grid-cols-4 gap-4 text-sm">
              {[["Destino", "España"], ["Cliente", "Grupo Calvo S.A."], ["Puerto", "Callao"], ["Contenedor", "MSKU-7842301"]].map(([k, v]) => (
                <div key={k}><dt className="text-xs text-slate-500">{k}</dt><dd className="font-medium text-slate-800 mt-0.5">{v}</dd></div>
              ))}
            </div>
          </Card>

          <div className="flex gap-3">
            <Btn variant="outline" onClick={() => onNav("certification-mgmt")}>← Volver a certificación</Btn>
            <Btn variant="primary" size="lg">📥 Generar PDF del expediente</Btn>
            <Btn variant="secondary" onClick={() => onNav("dispatch")}>Proceder al despacho →</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Screen: Despacho ─────────────────────────────────────────────────────────

function Dispatch({ onNav }: { onNav: (s: Screen) => void }) {
  const [authorized, setAuthorized] = useState(false);

  const checks = [
    { label: "Información de producción completa", ok: true },
    { label: "Control de calidad aprobado", ok: true },
    { label: "Cadena de frío sin anomalías", ok: true },
    { label: "Documentación completa y verificada", ok: true },
    { label: "Validación inteligente: Conforme", ok: true },
    { label: "Certificación sanitaria aprobada por SANIPES", ok: true },
    { label: "Contenedor y transporte confirmados", ok: true },
    { label: "Documentos de exportación listos", ok: true },
  ];
  const allOk = checks.every((c) => c.ok);

  return (
    <div className="flex-1 flex flex-col overflow-auto bg-slate-50">
      <Header title="Autorización de Despacho" subtitle="Lote EX-2026-004 — Langostino pelado" />
      <div className="flex-1 p-8 flex gap-6">
        <div className="flex-1 flex flex-col gap-5">
          {authorized ? (
            <div className="bg-[#0a1628] rounded-2xl p-8 text-center text-white">
              <div className="text-5xl mb-4">🚢</div>
              <h2 className="text-2xl font-bold mb-2">¡Despacho autorizado!</h2>
              <p className="text-slate-300 text-sm mb-1">Lote EX-2026-004 · Langostino pelado · 3,800 kg</p>
              <p className="text-slate-400 text-sm mb-6">Autorizado por: Ana Velásquez · {new Date().toLocaleDateString("es-PE", { day: "2-digit", month: "long", year: "numeric" })}</p>
              <div className="grid grid-cols-3 gap-4 text-sm mb-6">
                {[["Destino", "Estados Unidos"], ["Cliente", "Pacific Seafood LLC"], ["ETA", "15/09/2026"]].map(([k, v]) => (
                  <div key={k} className="bg-white/10 rounded-xl p-3">
                    <p className="text-slate-400 text-xs">{k}</p>
                    <p className="font-semibold mt-0.5">{v}</p>
                  </div>
                ))}
              </div>
              <Btn variant="outline" onClick={() => onNav("dashboard-logistics")}>Volver al dashboard</Btn>
            </div>
          ) : (
            <>
              {allOk && (
                <Alert type="success" title="Todos los requisitos conformes — Listo para autorización">
                  El lote cumple con todos los criterios para proceder al despacho internacional.
                </Alert>
              )}

              <Card className="p-6">
                <h3 className="text-sm font-semibold text-slate-800 mb-4">Checklist final de despacho</h3>
                <div className="flex flex-col gap-2">
                  {checks.map((item) => (
                    <div key={item.label} className={`flex items-center gap-3 p-3 rounded-lg border ${item.ok ? "border-emerald-100 bg-emerald-50/50" : "border-red-200 bg-red-50"}`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${item.ok ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}`}>
                        {item.ok ? "✓" : "✗"}
                      </div>
                      <span className="text-sm text-slate-700">{item.label}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <div className="flex gap-3">
                <Btn variant="ghost" onClick={() => onNav("dashboard-logistics")}>Cancelar</Btn>
                <Btn
                  variant="secondary"
                  size="lg"
                  disabled={!allOk}
                  onClick={() => setAuthorized(true)}
                >
                  🚢 Autorizar despacho
                </Btn>
              </div>
            </>
          )}
        </div>

        {/* Info */}
        <div className="w-72 shrink-0 flex flex-col gap-4">
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Información del despacho</h3>
            <dl className="flex flex-col gap-3 text-sm">
              {[
                ["Lote", "EX-2026-004"],
                ["Producto", "Langostino pelado"],
                ["Cantidad", "3,800 kg"],
                ["Destino", "Estados Unidos"],
                ["Cliente", "Pacific Seafood LLC"],
                ["Contenedor", "TCKU-4512678"],
                ["Puerto salida", "Callao"],
                ["Fecha estimada", "05/09/2026"],
                ["Responsable", "Ana Velásquez"],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xs text-slate-500">{k}</dt>
                  <dd className="font-medium text-slate-800 mono text-xs mt-0.5">{v}</dd>
                </div>
              ))}
            </dl>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── Screen: Dashboard Gerencial ─────────────────────────────────────────────

function DashboardMgmt() {
  const kpis = [
    { label: "Lotes procesados (mes)", value: "47", icon: "📦", color: "blue" as const, trend: "+12% vs ago. anterior" },
    { label: "Tasa de conformidad", value: "91.4%", icon: "✅", color: "green" as const, trend: "Objetivo: 90%" },
    { label: "Lotes observados", value: "4", icon: "⚠️", color: "amber" as const, trend: "3 resueltos esta semana" },
    { label: "Certificaciones aprobadas", value: "38", icon: "📜", color: "teal" as const, trend: "Tasa de aprobación: 95%" },
    { label: "Despachos realizados", value: "35", icon: "🚢", color: "blue" as const, trend: "Destinos: 8 países" },
  ];

  // Simplified bar chart data
  const monthlyData = [
    { month: "Mar", lotes: 38, conforme: 34 },
    { month: "Abr", lotes: 42, conforme: 39 },
    { month: "May", lotes: 35, conforme: 33 },
    { month: "Jun", lotes: 50, conforme: 46 },
    { month: "Jul", lotes: 44, conforme: 40 },
    { month: "Ago", lotes: 47, conforme: 43 },
  ];
  const maxVal = 55;

  return (
    <div className="flex-1 flex flex-col overflow-auto bg-slate-50">
      <Header title="Dashboard Gerencial" subtitle="Indicadores clave de rendimiento — Agosto 2026" />
      <div className="flex-1 p-8 flex flex-col gap-6">
        {/* KPIs */}
        <div className="grid grid-cols-5 gap-4">
          {kpis.map((kpi) => (
            <StatCard key={kpi.label} {...kpi} />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-5">
          {/* Bar chart */}
          <Card className="col-span-2 p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-5">Producción mensual vs conformidad</h3>
            <div className="flex items-end gap-4 h-44">
              {monthlyData.map((d) => (
                <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex gap-1 items-end" style={{ height: "140px" }}>
                    <div
                      style={{ height: `${(d.lotes / maxVal) * 100}%` }}
                      className="flex-1 bg-[#1a3a5c] rounded-t-md"
                    />
                    <div
                      style={{ height: `${(d.conforme / maxVal) * 100}%` }}
                      className="flex-1 bg-[#0ea5a0] rounded-t-md"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">{d.month}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-5 mt-3 text-xs text-slate-500">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#1a3a5c] inline-block" />Total lotes</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#0ea5a0] inline-block" />Conformes</span>
            </div>
          </Card>

          {/* Alerts + breakdown */}
          <div className="flex flex-col gap-5">
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-slate-800 mb-3">Alertas críticas</h3>
              <div className="flex flex-col gap-2">
                {[
                  { text: "Lote EX-2026-001 — Temperatura", type: "warning" as const },
                  { text: "Lote EX-2026-003 — Doc. incompleta", type: "warning" as const },
                ].map((a) => (
                  <div key={a.text} className="flex items-start gap-2 p-2 bg-amber-50 rounded-lg border border-amber-100">
                    <span className="text-amber-500 text-sm mt-0.5">⚠</span>
                    <p className="text-xs text-amber-800">{a.text}</p>
                  </div>
                ))}
                <p className="text-xs text-slate-400 mt-1">2 alertas activas requieren atención</p>
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="text-sm font-semibold text-slate-800 mb-3">Destinos de exportación</h3>
              <div className="flex flex-col gap-2">
                {[
                  { country: "España", count: 12, pct: 34 },
                  { country: "EEUU", count: 9, pct: 26 },
                  { country: "China", count: 7, pct: 20 },
                  { country: "Otros", count: 7, pct: 20 },
                ].map((d) => (
                  <div key={d.country}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-600">{d.country}</span>
                      <span className="text-slate-500 mono">{d.count} lotes</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full">
                      <div className="h-full bg-[#0ea5a0] rounded-full" style={{ width: `${d.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Table summary */}
        <Card>
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-800">Resumen de lotes activos</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {["Lote", "Producto", "Etapa actual", "Responsable", "Est. despacho", "Estado"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { code: "EX-2026-001", prod: "Pota congelada", stage: "Validación", resp: "M. Ríos", eta: "08/09/2026", color: "amber" as const, status: "Observado" },
                { code: "EX-2026-002", prod: "Anchoveta HGT", stage: "Certificación", resp: "A. Velásquez", eta: "05/09/2026", color: "blue" as const, status: "En proceso" },
                { code: "EX-2026-004", prod: "Langostino pelado", stage: "Despacho", resp: "A. Velásquez", eta: "05/09/2026", color: "green" as const, status: "Apto" },
              ].map((row) => (
                <tr key={row.code} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="px-5 py-3 mono text-sm font-semibold text-[#1a3a5c]">{row.code}</td>
                  <td className="px-5 py-3 text-sm text-slate-800">{row.prod}</td>
                  <td className="px-5 py-3 text-sm text-slate-600">{row.stage}</td>
                  <td className="px-5 py-3 text-sm text-slate-600">{row.resp}</td>
                  <td className="px-5 py-3 mono text-sm text-slate-500">{row.eta}</td>
                  <td className="px-5 py-3"><Badge color={row.color}>{row.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}

// ─── App Root ─────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState<Screen>("login");

  const handleLogin = () => setScreen("dashboard-prod");

  if (screen === "login") return <LoginScreen onLogin={handleLogin} />;

  const screens: Record<Exclude<Screen, "login">, ReactNode> = {
    "dashboard-prod": <DashboardProd onNav={setScreen} />,
    "register-lot": <RegisterLot onNav={setScreen} />,
    "lot-detail": <LotDetail onNav={setScreen} />,
    "dashboard-qa": <DashboardQA onNav={setScreen} />,
    "quality-control": <QualityControl onNav={setScreen} />,
    "cold-chain": <ColdChain onNav={setScreen} />,
    "smart-validation": <SmartValidation onNav={setScreen} />,
    "dashboard-logistics": <DashboardLogistics onNav={setScreen} />,
    "certification-mgmt": <CertificationMgmt onNav={setScreen} />,
    "digital-file": <DigitalFile onNav={setScreen} />,
    "dispatch": <Dispatch onNav={setScreen} />,
    "dashboard-mgmt": <DashboardMgmt />,
  };

  return (
    <div className="flex h-full bg-slate-50" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Sidebar current={screen} onNav={setScreen} />
      {screens[screen as Exclude<Screen, "login">]}
    </div>
  );
}
