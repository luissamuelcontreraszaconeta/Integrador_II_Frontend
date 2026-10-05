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
| **Recharts** | `3.10.1` | Librería de gráficos interactivos utilizada para visualización de métricas, plantas y cadena de frío. |
| **qrcode.react** | `4.2.0` | Generación de códigos QR vectoriales estándar y escaneables para trazabilidad de lotes. |

---

## 🏗️ 2. Arquitectura del Frontend

El proyecto está estructurado bajo principios de modularidad y separación de responsabilidades en el directorio `src/`:

```text
exportrace-ica-frontend/
├── public/                    # Recursos estáticos servidos directamente
├── src/
│   ├── auth/                  # Servicio de autenticación, tipos y guardias RBAC / SuperAdmin
│   ├── components/            # Componentes reutilizables de UI, Lotes y Notificaciones
│   │   ├── layout/            # AppLayout, Header, Sidebar, PageHeader
│   │   ├── lots/              # LotTimeline, ColdChainGraph, TraceabilityQRCode, QRCodeModal
│   │   ├── notifications/     # NotificationBell (campana con badge y popover)
│   │   └── ui/                # Componentes base: Button, Input, Modal, StatusBadge, StatsCard
│   ├── layouts/               # Layouts específicos (SuperAdminLayout)
│   ├── pages/                 # Vistas principales del sistema según perfil empresarial
│   │   ├── Administration/    # Administración general de usuarios y roles
│   │   ├── Dashboard/         # Tablero principal adaptable por rol
│   │   ├── Login/             # Pantalla de inicio de sesión
│   │   ├── Logistics/         # Vistas de Logística, SANIPES y Despachos
│   │   ├── Lots/              # Registro y detalle de lotes
│   │   ├── Management/        # Vista de Gerencia Ejecutiva e Indicadores
│   │   ├── Notifications/     # Centro de Notificaciones en vivo
│   │   ├── Public/            # Verificación Pública de Trazabilidad QR (/verificar/:token)
│   │   ├── Quality/           # Inspección organoléptica y evidencia fotográfica
│   │   └── SuperAdmin/        # Dashboard interactivo, gobierno de usuarios, RBAC y auditoría
│   ├── services/              # Clientes de API REST (apiClient, superAdminService, etc.)
│   └── types/                 # Definiciones de tipos TypeScript
├── .env.example               # Plantilla de variables de entorno
├── package.json               # Configuración de dependencias y scripts
└── vite.config.ts             # Configuración del empaquetador Vite
```

---

## 🔑 3. Credenciales de Prueba para Iniciar Sesión

| Rol Empresarial | Correo Electrónico | Contraseña | Comportamiento en Frontend |
| :--- | :--- | :--- | :--- |
| **Super Administrador** | `superadmin@exportrace.pe` | `SuperAdmin2026!` | Panel de SuperAdmin, gobierno RBAC y auditoría global |
| **Administrador** | `admin@exportrace.pe` | `Admin123` | Administración corporativa y gestión de usuarios |
| **Producción** | `produccion@exportrace.pe` | `Prod123` | Registro y seguimiento de lotes pesqueros |
| **QA / Calidad** | `qa@exportrace.pe` | `QA123` | Calidad organoléptica, fotos y cadena de frío |
| **Logística & Comex** | `logistica@exportrace.pe` | `Log123` | Expediente SANIPES, DUA y despachos |
| **Gerencia** | `gerencia@exportrace.pe` | `Ger123` | KPIs consolidados y supervisión gerencial |

---

## ⚙️ 4. Variables de Entorno (.env.example)

```properties
# URL base de la API REST del backend
# En desarrollo local: http://localhost:8080/api
# En producción (Render): https://exportrace-backend.onrender.com/api
VITE_API_BASE_URL=http://localhost:8080/api

# URL base pública del frontend para códigos QR de trazabilidad
# En desarrollo local: http://localhost:5173
# En producción (Render): https://exportrace-frontend.onrender.com
VITE_PUBLIC_APP_URL=http://localhost:5173
```

---

## 🚀 5. Ejecución en Desarrollo Local

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar el servidor de desarrollo Vite (Puerto 5173)
npm run dev
```

El cliente estará disponible en: **`http://localhost:5173/`**

---

## 🌐 6. Despliegue en Render como Static Site

El frontend de ExporTrace está optimizado para desplegarse como un **Static Site** de alto rendimiento en Render (sin requerir Docker en el frontend).

### 6.1 Parámetros de Configuración en Render:

1. Crear un **New Static Site** en Render y conectar el repositorio: `https://github.com/luissamuelcontreraszaconeta/Integrador_II_Frontend`.
2. Completar los campos:
   * **Name**: `exportrace-frontend`
   * **Branch**: `main`
   * **Root Directory**: *(dejar en blanco)*
   * **Build Command**: `npm ci && npm run build`
   * **Publish Directory**: `dist`
3. Configurar las **Environment Variables**:
   * `VITE_API_BASE_URL`: `https://exportrace-backend.onrender.com/api`
   * `VITE_PUBLIC_APP_URL`: `https://exportrace-frontend.onrender.com` *(o la URL asignada por Render)*
4. Configurar la **Regla de Redirección SPA (Redirects / Rewrites)**:
   * **Source**: `/*`
   * **Destination**: `/index.html`
   * **Action**: `Rewrite` (200)

> [!NOTE]
> La regla Rewrite es indispensable para que las rutas SPA de React Router (`/dashboard`, `/quality`, `/notifications`, `/verificar/:token`, `/superadmin/users`) funcionen correctamente al recargar la página (F5) o ingresar mediante enlaces directos sin arrojar error 404.

---

## 📱 7. Módulo de Verificación Pública QR

El sistema genera códigos QR estándares mediante `qrcode.react` (`QRCodeSVG`, nivel de corrección H):
- **URL Codificada en el QR**: `${VITE_PUBLIC_APP_URL}/verificar/${qrToken}`
- **Ruta Pública**: `/verificar/:token` (abierta al público sin requerir JWT).
- Al escanear el QR con cualquier teléfono inteligente, el usuario accede a la ficha pública de trazabilidad del lote.
