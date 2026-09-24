# ExporTrace — Documentación Técnica del Frontend (Client Web)

Este directorio contiene el código fuente de la interfaz de usuario (Frontend) de **ExporTrace**, una aplicación web SPA (*Single Page Application*) desarrollada con **React 19**, **TypeScript** y **Vite**.

---

## 🛠️ 1. Tecnologías Utilizadas

Las tecnologías e insumos utilizados en este proyecto han sido verificados directamente contra la configuración activa de `package.json`:

| Tecnología / Librería | Versión | Propósito en el Proyecto |
| :--- | :--- | :--- |
| **React** | `19.2.8` | Librería principal para la creación de interfaces de usuario declarativas y componentes reactivos. |
| **TypeScript** | `6.0.2` | Lenguaje de programación con tipado estático seguro para modelos e interfaces del sistema. |
| **Vite** | `8.2.2` | Herramienta de compilación y servidor de desarrollo ultrarrápido HMR. |
| **Tailwind CSS** | `4.3.3` | Framework CSS utilitario para el diseño visual responsive de grado empresarial. |
| **Lucide React** | `1.38.0` | Colección de íconos vectoriales UI para tableros y navegación. |
| **Recharts** | `3.10.1` | Librería de gráficos interactivos utilizada para la visualización de la cadena de frío. |
| **Oxlint** | `1.79.0` | Herramienta de linter ultrarrápida para análisis estático de código. |

---

## 🏗️ 2. Arquitectura del Frontend

El proyecto está estructurado bajo principios de modularidad y separación de responsabilidades en el directorio `src/`:

```text
exportrace-ica-frontend/
├── public/                    # Recursos estáticos servidos directamente
├── src/
│   ├── auth/                  # Servicio de autenticación y guardias de seguridad
│   │   ├── auth.guard.ts      # Guard de ruta para usuarios autenticados
│   │   ├── auth.service.ts    # Servicio de Login e integración con REST API
│   │   ├── auth.types.ts      # Interfaces de sesión, tokens y usuarios
│   │   └── role.guard.ts      # Guard para restricciones de acceso por rol
│   │
│   ├── components/            # Componentes reutilizables de UI y Lotes
│   │   ├── layout/            # AppLayout, Header, Sidebar, PageHeader
│   │   ├── lots/              # LotTimeline, ColdChainGraph, ExpedienteDigitalView, QRCodeModal
│   │   └── ui/                # Componentes base: Button, Input, Select, Modal, StatusBadge, StatsCard
│   │
│   ├── context/               # Manejo de Estado Global React Context
│   │   ├── AuthContext.tsx    # Estado global de sesión, usuario activo y JWT
│   │   └── LotContext.tsx     # Estado global de lotes, filtros y acciones de trazabilidad
│   │
│   ├── pages/                 # Vistas principales del sistema según perfil empresarial
│   │   ├── Administration/    # Vista de Administración de Usuarios y Sistema (AdminPage.tsx)
│   │   ├── Dashboard/         # Tablero principal adaptable por rol (DashboardPage.tsx)
│   │   ├── Login/             # Pantalla empresarial de inicio de sesión (LoginPage.tsx)
│   │   ├── Logistics/         # Vistas de Logística, SANIPES y Despachos (DispatchPage.tsx, etc.)
│   │   ├── Lots/              # Registro y detalle de lotes (RegisterLotPage.tsx, LotDetailPage.tsx)
│   │   ├── Management/        # Vista de Gerencia Ejecutiva e Indicadores (ManagementPage.tsx)
│   │   ├── Operations/        # Vista de Operaciones y Producción (OperationsPage.tsx)
│   │   └── QA/                # Vista de Control de Calidad e Inspección (QADashboardPage.tsx)
│   │
│   ├── services/              # Cliente HTTP para comunicación REST
│   │   ├── api.ts             # Métodos del servicio de Lotes, Calidad y Despachos
│   │   └── apiClient.ts       # Cliente Fetch centralizado con inyección de JWT Bearer Token
│   │
│   └── types/                 # Definiciones de tipo TypeScript
│       ├── lot.ts             # Interfaces de Lote, Inspección QA y Cadena de Frío
│       ├── certification.ts   # Interfaces de Certificados SANIPES y Expediente Digital
│       └── user.ts            # Interfaces de Usuario y Logs de Auditoría
│
├── .env.example               # Variables de entorno de plantilla
├── package.json               # Configuración de dependencias
└── vite.config.ts             # Configuración del empaquetador Vite
```

---

## 🧩 3. Componentes Funcionales Principales

| Componente / Vista | Propósito | Rol Autorizado | Interacción REST Backend |
| :--- | :--- | :--- | :--- |
| **`LoginPage.tsx`** | Pantalla de ingreso empresarial (Email/Password). | Todos (Público) | `POST /api/auth/login` |
| **`AdminPage.tsx`** | Gestión de usuarios, asignación de roles y métricas del sistema. | `ADMINISTRADOR` | `GET /api/users`, `POST /api/users` |
| **`OperationsPage.tsx`** | Tablero de producción, registro de lotes y lotes pendientes. | `PRODUCCION` | `GET /api/lots`, `POST /api/lots` |
| **`QADashboardPage.tsx`** | Evaluación organoléptica y registro de lecturas de temperatura. | `QA` | `POST /api/quality/lot/{id}`, `POST /api/cold-chain/lot/{id}` |
| **`DispatchPage.tsx`** | Tramitación de Certificado SANIPES y despacho de contenedores. | `LOGISTICA` | `POST /api/certifications/...`, `POST /api/dispatches/...` |
| **`ManagementPage.tsx`** | Reportes consolidados, exportabilidad e indicadores ejecutivos. | `GERENCIA` | `GET /api/lots`, `GET /api/lots/{id}/history` |
| **`QRCodeModal.tsx`** | Renderizado del código QR determinista del lote. | Todos | `GET /api/lots/qr/{token}` |
| **`ColdChainGraph.tsx`** | Gráfico interactivo Recharts de curva de temperatura de congelamiento. | `QA`, `GERENCIA` | `GET /api/cold-chain/lot/{id}` |

---

## 🔒 4. Autenticación y Control de Acceso por Roles

### 4.1 Flujo de Autenticación
1. El usuario ingresa únicamente **Correo Electrónico** y **Contraseña**.
2. **El usuario NO selecciona su rol en la interfaz**.
3. El cliente efectúa una petición `POST /api/auth/login` al backend.
4. El backend valida las credenciales en SQLite y retorna el **JWT Token** junto a los datos del usuario y su **Rol**.
5. `AuthContext` guarda el JWT en `localStorage` (`exportrace_jwt_token`) y configura la sesión activa.
6. El frontend redirige automáticamente al usuario al Dashboard que le corresponde según su rol.

```text
  Usuario React               AuthService               Backend REST
       │                           │                         │
       │─── 1. Ingresa credenciales ──►                      │
       │                         │─── 2. POST /auth/login ──►│
       │                         │◄── 3. JWT + User + Role ──│
       │◄── 4. Guarda Token y ────│                         │
       │    Redirige por Rol     │                         │
```

---

## 🔑 5. Credenciales de Prueba para Iniciar Sesión

> [!IMPORTANT]
> **Aviso de Entorno Académico / Demostración**:  
> Estas cuentas son exclusivamente para desarrollo, demostración y pruebas académicas. No utilizar estas credenciales en ambientes productivos.

Una vez levantados ambos servidores, ingresar desde la pantalla de login utilizando cualquiera de las siguientes cuentas:

| Rol Empresarial | Correo Electrónico | Contraseña | Comportamiento en Frontend |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin@exportrace.pe` | `Admin123` | Acceso a `/dashboard/admin` y configuración del sistema |
| **Producción** | `produccion@exportrace.pe` | `Prod123` | Acceso a `/dashboard/operations` y registro de lotes |
| **QA / Calidad** | `qa@exportrace.pe` | `QA123` | Acceso a `/dashboard/qa` e inspección de frío |
| **Logística & Comex** | `logistica@exportrace.pe` | `Log123` | Acceso a `/dashboard/logistics`, SANIPES y despachos |
| **Gerencia** | `gerencia@exportrace.pe` | `Ger123` | Acceso a `/dashboard/management` y consulta ejecutiva |

---

## ⚙️ 6. Variables de Entorno (.env.example)

Crear un archivo `.env` en la raíz de `exportrace-ica-frontend/` utilizando como base el archivo `.env.example`:

```properties
VITE_API_BASE_URL=http://localhost:8080/api
```

---

## 🚀 7. Instalación y Ejecución

```bash
# 1. Navegar al directorio del frontend
cd exportrace-ica-frontend

# 2. Instalar dependencias
npm install

# 3. Iniciar el servidor de desarrollo Vite (Puerto 5173)
npm run dev
```

El cliente estará disponible en: **`http://localhost:5173/`**
