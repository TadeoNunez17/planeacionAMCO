# 📚 Planeación AMCO

Aplicación web para que docentes de **Preescolar Mercurio** generen planeaciones semanales de clases de forma estructurada, siguiendo el modelo educativo AMCO.

🌐 **Demo en vivo:** [planeacion-amco.vercel.app](https://planeacion-amco.vercel.app)

---

## ¿Qué hace esta app?

Guía al docente a través de **3 pasos** para crear y descargar su planeación semanal:

1. **Logística** — Registra fechas, ciclo escolar, libro AMCO y recursos generales.
2. **Planeación** — Agrega clases por día y materia, con auto-relleno de contenido desde la base de datos.
3. **Vista previa y descarga** — Previsualiza el documento y descárgalo en formato Word (.docx).

---

## Stack Tecnológico

| Tecnología | Propósito |
|---|---|
| **React 18 + Vite** | UI y dev server con HMR |
| **Tailwind CSS** | Estilos utility-first |
| **Supabase** | Autenticación (email/password) + base de datos PostgreSQL |
| **docxtemplater + pizzip** | Generación dinámica de documentos Word |
| **file-saver** | Descarga de archivos en el navegador |
| **lucide-react** | Iconos SVG |

---

## Estructura del Proyecto

```
src/
├── App.jsx                        # Componente raíz — orquesta los 3 pasos
├── main.jsx
├── supabaseClient.js              # Inicialización del cliente Supabase
│
├── components/
│   ├── auth/
│   │   └── Login.jsx              # Pantalla de login
│   ├── layout/
│   │   ├── Header.jsx             # Barra superior con logo y logout
│   │   └── Footer.jsx             # Indicador de sesión activa
│   ├── ui/
│   │   └── AutoResizingTextarea.jsx
│   └── steps/
│       ├── StepLogistica.jsx      # Paso 1: Fechas, ciclo, libro, recursos
│       ├── StepPlaneacion.jsx     # Paso 2: Clases por día y materia
│       └── StepVistaPrevia.jsx    # Paso 3: Preview y descarga
│
├── hooks/
│   └── usePlan.js                 # Hook centralizado: estado + lógica de negocio
│
├── services/
│   └── docService.js              # Generación y descarga del Word
│
└── constants/
    └── index.js                   # Colores, meses, horarios
```

---

## Instalación y uso local

**Requisitos:** Node.js 18+

```bash
# 1. Clona el repositorio
git clone https://github.com/TadeoNunez17/planeacionAMCO.git
cd planeacionAMCO

# 2. Instala dependencias
npm install

# 3. Configura variables de entorno
cp .env.example .env
# Agrega tu VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY

# 4. Inicia el servidor de desarrollo
npm run dev
```

### Scripts disponibles

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build de producción
npm run preview  # Previsualizar build
npm run lint     # Lint con ESLint
```

---

## Base de Datos (Supabase PostgreSQL)

### Tablas principales

| Tabla | Descripción |
|---|---|
| `docentes` | Datos y preferencias del docente autenticado |
| `libros` | Catálogo de libros AMCO disponibles |
| `materias` | Campos formativos del currículo |
| `temas` | Temas pedagógicos por libro y materia |
| `ciclos` | Ciclos AMCO (CICLO 1, CICLO 2, etc.) |
| `tema_ciclos` | Relación muchos-a-muchos entre temas y ciclos |
| `contenido_temas` | Contenido detallado: inicio, desarrollo, cierre, aprendizaje |

### Flujo de selección de libro

```
Usuario selecciona libro
        ↓
Hook consulta temas del libro
        ↓
Hook obtiene ciclos disponibles via tema_ciclos
        ↓
Dropdown "Ciclo AMCO" se actualiza dinámicamente
        ↓
En Paso 2: solo aparecen temas del libro + ciclo seleccionados
```

---

## Funcionalidades principales

- 🔐 **Autenticación** con Supabase (email/password), auto-creación de perfil docente
- 💾 **Preferencias guardadas** — ciclo escolar, libro, link de clase y recursos se cargan automáticamente en la siguiente sesión
- 🔗 **Auto-relleno de contenido** — al seleccionar un tema, se cargan inicio, desarrollo, cierre, aprendizaje, etc. desde la BD
- ⬆️⬇️ **Reordenar clases** dentro de cada día
- 📄 **Generación de Word** con `plantilla_maestra.docx` y placeholders `[[campo]]`
- 👁️ **Vista previa HTML** antes de descargar

---

## Roadmap

### En progreso 🟡
- Guardar historial de planeaciones en base de datos
- Listar y editar planeaciones anteriores

### Próximamente 🔲
- Validación de campos obligatorios
- Botón "Subir AMCO"
- Dark mode
- Exportar a PDF
- Integración con Google Calendar
- App móvil (React Native)

---

## Despliegue

La aplicación está desplegada en **Vercel** conectada a la rama `main`. Cada push dispara un nuevo deploy automáticamente.

---

## Autor

Desarrollado por **Tadeo Núñez** para Preescolar Mercurio.