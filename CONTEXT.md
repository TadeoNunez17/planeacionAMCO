# Planeación AMCO - Documentación del Proyecto

## 1. Descripción General

**Planeación AMCO** es una aplicación web para que docentes de preescolar (Preescolar Mercurio) generen planeaciones semanales de clases de forma estructurada. La herramienta guía al docente a través de 3 pasos:
1. Registrar logística general de la semana (fechas, ciclo escolar, recursos)
2. Planificar clases por día y materia
3. Visualizar y descargar la planeación en Word

**Público objetivo:** Docentes de preescolar que necesitan organizar su planeación semanal según el modelo educativo AMCO.

**Valor principal:** Automatiza la generación de documentos Word con toda la planeación, ahorrando tiempo y garantizando consistencia.

---

## 2. Stack Tecnológico

| Tecnología | Versión | Propósito |
|---|---|---|
| **Vite** | - | Build tool y dev server (HMR rápido) |
| **React** | 18+ | Framework UI |
| **Tailwind CSS** | 3+ | Estilos utility-first |
| **Supabase** | - | Backend: autenticación + base de datos PostgreSQL |
| **pizzip** | - | Manejo de archivos ZIP (para .docx) |
| **docxtemplater** | - | Generación dinámica de documentos Word |
| **file-saver** | - | Descarga de archivos en el navegador |
| **lucide-react** | - | Iconos SVG modernos |

---

## 3. Estructura de Carpetas Actualizada

```
src/
├── App.jsx                              # Componente raíz - orquesta los 3 pasos
├── main.jsx                             # Entry point
├── index.css                            # Estilos globales
├── App.css                              # Estilos de App
├── supabaseClient.js                    # Inicialización de cliente Supabase
│
├── components/
│   ├── auth/
│   │   └── Login.jsx                    # Pantalla de login con email/password
│   │
│   ├── layout/
│   │   ├── Header.jsx                   # Barra superior con logo y botón logout
│   │   └── Footer.jsx                   # Indicador de sesión activa (docente)
│   │
│   ├── ui/
│   │   └── AutoResizingTextarea.jsx     # Textarea que se auto-ajusta según contenido
│   │
│   └── steps/
│       ├── StepLogistica.jsx            # Paso 1: Fechas, ciclo escolar, recursos generales
│       ├── StepPlaneacion.jsx           # Paso 2: Agregar clases por día y materia
│       └── StepVistaPrevia.jsx          # Paso 3: Preview y descarga de Word
│
├── hooks/
│   └── usePlan.js                       # Hook centralizado: estado + lógica de planeación
│
├── services/
│   └── docService.js                    # Servicio para generar y descargar Word
│
├── constants/
│   └── index.js                         # Constantes: COLORES, MESES, TIME_SLOTS
│
├── assets/                              # Archivos estáticos (imágenes, etc)
│
└── public/
    └── plantilla_maestra.docx           # Template con placeholders [[]] para Word
```

---

## 4. Flujo Principal de la App (3 Pasos)

### **Paso 1: Logística de la Semana** (`StepLogistica.jsx`)
- ✏️ Seleccionar fecha de inicio y fin
- ✏️ Ingresar ciclo escolar, clave (CCT), ciclo AMCO
- ✏️ Agregar link de clase y recursos generales
- 💾 Opción para guardar como preferencias predeterminadas
- ➡️ Al completar → Pasa a Paso 2

**Estado actualizado:** `plan`, `sessions` (inicializa con días de la semana)

---

### **Paso 2: Planeación de Clases** (`StepPlaneacion.jsx`)
- 📅 Botones para navegar entre días de la semana
- ➕ Agregar clases por día (seleccionar materia, hora, temas)
- 🎨 Cada materia está codificada por color en el lado izquierdo
- 📝 Campos para llenar: hora, campo formativo, tema, aprendizaje, eje, inicio, desarrollo, cierre
- ⬆️ ⬇️ Botones para reordenar clases dentro del día
- 🗑️ Eliminar clases
- 🔗 Auto-relleno: selecciona un tema → se cargan datos de BD automáticamente
- ➡️ Al completar → Pasa a Paso 3

**Estado actualizado:** `sessions` (materias agregadas)

---

### **Paso 3: Vista Previa y Descarga** (`StepVistaPrevia.jsx`)
- 👁️ Vista previa HTML del documento (como se verá en Word)
- ⬅️ Botón "Editar" para volver al Paso 2
- 📥 Descargar como Word (.docx)
- ☁️ Botón "Subir AMCO" (próximamente)
- 📤 Botón "Confirmar e Imprimir"

---

## 5. Tablas de Supabase Utilizadas

### **Tabla: `docentes`**
| Campo | Tipo | Descripción |
|---|---|---|
| `id_docente` | Int8 (PK) | ID único del docente |
| `user_id` | UUID (FK) | Referencia al usuario de auth (auth.users) |
| `nombre_completo` | VARCHAR | Nombre del docente (obtenido de email o metadata) |
| `correo` | VARCHAR | Email del docente |
| `ciclo_escolar_pref` | VARCHAR | Ciclo escolar preferido guardado |
| `ciclo_amco_pref` | VARCHAR | Ciclo AMCO preferido guardado |
| `link_clase_pref` | VARCHAR | Link de clase guardado como preferencia |
| `recursos_pref` | TEXT | Recursos generales guardados como preferencia |
| `libro_id_pref` | Int8 (FK) | ID del libro preferido para planeaciones (referencia a `libros.id_libro`) |

**Propósito:** Almacenar datos básicos de docentes y sus preferencias para auto-llenar en próximas sesiones.

**Auto-creación:** La primera vez que un docente se autentica, se crea automáticamente un registro en esta tabla.

---

### **Tabla: `libros`**
| Campo | Tipo | Descripción |
|---|---|---|
| `id_libro` | Int8 (PK) | ID único del libro |
| `nombre_libro` | VARCHAR | Nombre del libro (ej: "Maravillas de Voy") |

**Propósito:** Catálogo de libros de AMCO disponibles para seleccionar en la planeación.

---

### **Tabla: `materias`**
| Campo | Tipo | Descripción |
|---|---|---|
| `id_materia` | Int8 (PK) | ID único de la materia |
| `campo_formativo` | VARCHAR | Campo formativo (ej: "Lenguajes", "Saberes y pensamiento científico", etc) |

**Propósito:** Catálogo de campos formativos/materias disponibles en el currículo AMCO.

---

### **Tabla: `temas`**
| Campo | Tipo | Descripción |
|---|---|---|
| `id_tema` | Int8 (PK) | ID único del tema |

**Propósito:** Catálogo de temas pedagógicos disponibles.

---

### **Tabla: `contenido_temas`**
| Campo | Tipo | Descripción |
|---|---|---|
| `id_contenido` | Int8 (PK) | ID único del contenido |
| `id_tema` | Int8 (FK) | Referencia a tabla `temas` |
| `id_materia` | Int8 (FK) | Referencia a tabla `materias` |
| `id_libro` | Int8 (FK) | Referencia a tabla `libros` |
| `pagina` | VARCHAR | Página del libro/material donde aparece el tema |
| `recursos_materia` | TEXT | Recursos específicos para esta materia |
| `eje_ambito` | VARCHAR | Eje temático o ámbito educativo |
| `aprendizaje` | TEXT | Descripción de aprendizaje esperado |
| `im` | VARCHAR | Indicador o marcador (campo adicional) |
| `concepto_evaluar` | VARCHAR | Concepto a evaluar en el tema |
| `inicio` | TEXT | Sugerencia para actividad de inicio |
| `desarrollo` | TEXT | Sugerencia para actividad de desarrollo |
| `cierre` | TEXT | Sugerencia para actividad de cierre |

**Propósito:** Contenido detallado vinculado a temas, materias y libros. Permite auto-llenar datos cuando el docente selecciona un tema en la planeación.

**Relaciones:** Un contenido es la intersección de tema + materia + libro, proporcionando un desglose completo del currículo.

---

## 5.5 Referencia Rápida de Nombres de Columnas (Supabase)

| Tabla | Columnas Clave |
|---|---|
| `docentes` | `id_docente`, `user_id`, `nombre_completo`, `ciclo_escolar_pref`, `ciclo_amco_pref`, `link_clase_pref`, `recursos_pref`, `libro_id_pref` |
| `libros` | `id_libro`, `nombre_libro` |
| `materias` | `id_materia`, `campo_formativo` |
| `temas` | `id_tema` |
| `contenido_temas` | `id_contenido`, `id_tema`, `id_materia`, `id_libro`, `pagina`, `recursos_materia`, `eje_ambito`, `aprendizaje`, `im`, `concepto_evaluar`, `inicio`, `desarrollo`, `cierre` |

⚠️ **IMPORTANTE:** Usar estos nombres exactos en consultas a Supabase. Los IDs usan `Int8` (no UUID).


---

### **Tabla: `vista_contenidos`**
| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID (PK) | ID único |
| `campo_formativo` | TEXT | Campo (ej: "Lenguajes", "Saberes y pensamiento científico") |
| `tema` | TEXT | Nombre del tema pedagógico |
| `pagina` | TEXT | Página del libro/material |
| `recursos_materia` | TEXT | Recursos específicos para esta materia |
| `eje_ambito` | TEXT | Eje temático o ámbito |
| `aprendizaje` | TEXT | Descripción de aprendizaje esperado |
| `im` | TEXT | Indicator (campo adicional) |
| `concepto_evaluar` | TEXT | Concepto a evaluar |
| `inicio` | TEXT | Sugerencia para actividad de inicio |
| `desarrollo` | TEXT | Sugerencia para actividad de desarrollo |
| `cierre` | TEXT | Sugerencia para actividad de cierre |

**Propósito:** Catálogo de temas y contenidos. Cuando el docente selecciona un tema, se cargan automáticamente todos estos datos para auto-rellenar el formulario.

---

## 5.5 Cambios Recientes (Refactorización - Marzo 20, 2026)

### ✅ Refactorización de estructura completada:
1. **Reorganización de componentes por dominio:**
   - `components/auth/Login.jsx` - Autenticación
   - `components/layout/Header.jsx, Footer.jsx` - Layout
   - `components/ui/AutoResizingTextarea.jsx` - Componentes reutilizables
   - `components/steps/StepLogistica.jsx, StepPlaneacion.jsx, StepVistaPrevia.jsx` - Pasos principales

2. **Extracción de lógica:**
   - `hooks/usePlan.js` - Hook centralizado con TODO el estado y funciones de negocio
   - `services/docService.js` - Generación de documentos Word
   - `constants/index.js` - Constantes globales

3. **Correcciones de imports realizadas:**
   - ✓ `src/components/layout/Header.jsx`: `../supabaseClient` → `../../supabaseClient`
   - ✓ `src/components/steps/StepPlaneacion.jsx`: `../constants` → `../../constants`
   - ✓ `src/components/steps/StepVistaPrevia.jsx`: `../constants` y `../services` → `../../constants` y `../../services`

4. **Lo que NO cambió:**
   - ✅ Cero cambios de lógica - 100% funcionalidad preservada
   - ✅ Mismos imports de Supabase, lucide-react, librerías
   - ✅ Mismo flujo de 3 pasos
   - ✅ Mismo estado y validaciones

---

## 6. Variables de Estado del Hook `usePlan.js`

```javascript
// Estado principal de la planeación
const plan = {
  ciclo_escolar: "2025-2026",        // Ciclo escolar actual
  clave: "18PJN0114M",               // Clave CCT de la escuela
  cicloAmco: "CICLO 4",              // Ciclo del modelo educativo AMCO
  fecha_inicio: "2025-03-10",        // Fecha de inicio (YYYY-MM-DD)
  fecha_fin: "2025-03-14",           // Fecha de fin (YYYY-MM-DD)
  rango_fechas: "10 al 14 de marzo", // Texto generado automáticamente
  link_clase: "https://...",         // Link de clase virtual (ej: Zoom, Meet)
  recursos_generales: "AMCO, IPAD...",// Recursos disponibles para la semana
  libro_id: "uuid-del-libro"         // ID del libro seleccionado (actualiza ciclos)
}

// Ciclos disponibles del libro seleccionado
const ciclosDisponibles = ["CICLO 1", "CICLO 2", "CICLO 3"]

// Catálogo de libros disponibles
const libros = [
  {
    id: "uuid1",
    nombre: "Maravillas de Voy",
    codigo: "MVY-2025",
    ciclos_amco: ["CICLO 1", "CICLO 2"],
    descripcion: "Libro AMCO para primeros grados"
  }
  // ... más libros
]

// Sesiones: arreglo de días con sus clases
const sessions = [
  {
    id: 0,
    dia: "Lunes",
    fecha_exacta: "10 de marzo",
    tema_relevancia: "Tema de la semana",
    materias: [
      {
        hora: "07:30 - 08:30",
        campo: "Lenguajes",
        tema: "Lectura inicial",
        pagina: "p.15",
        recursos_materia: "libros",
        eje_ambito: "Comunicación",
        aprendizaje: "Desarrollar habilidades de lectura",
        im: "",
        concepto_evaluar: "Comprensión",
        inicio: "...",      // Actividad de inicio
        desarrollo: "...",  // Actividad principal
        cierre: "..."       // Cierre de la clase
      }
    ]
  }
  // ... más días
]

const docente = {          // Datos del docente autenticado
  id: "uuid",
  user_id: "auth_uuid",
  nombre_completo: "Juan López",
  correo: "juan@example.com",
  ciclo_escolar_pref: "2025-2026",
  ciclo_amco_pref: "CICLO 4",
  link_clase_pref: "https://...",
  recursos_pref: "AMCO, IPAD...",
  libro_id_pref: "uuid-del-libro"   // 🆕 Libro preferido guardado
}

const catalog = []         // Catálogo de temas de BD (contenido_temas)
const loading = true/false // Estado de carga inicial
const savingPrefs = false  // Estado de guardado de preferencias
```

### **Funciones principales del hook:**

| Función | Parámetros | Acción |
|---|---|---|
| `generarRangoTexto()` | inicio, fin | Genera texto como "10 al 14 de marzo" |
| `actualizarFechasSesiones()` | fechaInicio, fechaFin | Crea array de sesiones (1-7 días) |
| `seleccionarLibro()` | libroId | 🆕 Selecciona libro y actualiza ciclos disponibles |
| `addMateria()` | sessionIndex | Agrega clase vacía al día |
| `moverMateria()` | sessionIdx, materiaIdx, dirección | Reordena clases (↑ o ↓) |
| `autoRellenar()` | sessionIdx, materiaIdx, temaNombre | Carga datos de BD al seleccionar tema |
| `updateMateria()` | sessionIdx, materiaIdx, field, value | Actualiza un campo de una clase |
| `updateSessionLogistics()` | sessionIdx, field, value | Actualiza fecha o tema relevancia del día |
| `guardarPreferencias()` | - | Guarda datos en tabla docentes para próximas sesiones |

---

## 7. Funcionalidades Pendientes o En Progreso

### 🟡 **En Progreso**
- [ ] Subir la planeación a base de datos (guardar historial de planeaciones)
- [ ] Listar planeaciones anteriores
- [ ] Editar planeaciones guardadas
- [ ] **NUEVA:** Selección de libro en StepLogistica con auto-relleno de ciclos AMCO

### 🔲 **Pendientes - Corto plazo (Próximos días)**
- [x] **Crear tabla `libros`** en Supabase con ciclos disponibles por libro
- [ ] **Agregar campo "Libro" en StepLogistica** 
  - Dropdown para seleccionar libro
  - Al cambiar libro → auto-actualizar ciclos AMCO disponibles
  - Guardar libro seleccionado como preferencia en docentes
- [ ] Cargar catálogo completo de libros AMCO en BD
- [ ] Botón "Subir AMCO" → descarga template de AMCO y carga datos
- [ ] Validación de campos obligatorios
- [ ] Mensajes de confirmación antes de descargar/guardar
- [ ] Dark mode

### 🔲 **Pendientes - Mediano plazo**
- [ ] Multi-semanas: planificar varios meses de una vez
- [ ] Templates personalizables (modificar estructura del Word)
- [ ] Importar planeación de Excel/CSV
- [ ] Compartir planeación con colegas (permisos por rol)
- [ ] Comentarios/notas en clases individuales
- [ ] Estadísticas: cantidad de horas por materia, distribución de temas

### 🔲 **Pendientes - Largo plazo**
- [ ] App móvil (React Native)
- [ ] Integración con Google Calendar
- [ ] Exportar a PDF además de Word
- [ ] Plantillas prediseñadas por grado/nivel
- [ ] IA para sugerir temas según estándares educativos

---

## Notas de Desarrollo

### Autenticación y Base de Datos
- **Autenticación:** Supabase auth con email/password
- **Auto-creación de docentes:** El hook detecta si es la primera vez y crea el registro automáticamente
- **Persistencia de datos:** 
  - Preferencias del docente se guardan en tabla `docentes`
  - Planeaciones actualmente se almacenan en memoria (useState) - próximamente se guardarán en BD
  - No hay auto-guardado (el usuario debe descargar el Word manualmente)

### Importaciones y Estructura de Rutas
⚠️ **Importante:** La estructura anidada de carpetas requiere rutas relativas correctas:
- **Desde `src/components/layout/` o `src/components/auth/`** → `../../` para acceder a `src/supabaseClient.js`
- **Desde `src/components/steps/`** → `../../constants/` y `../../services/`
- **Desde `src/hooks/`** → `../supabaseClient.js`, `../constants/`
- **Desde `src/`** (App.jsx) → `./supabaseClient.js`, `./hooks/`, `./services/`

### Generación de Documentos
- **Generación de Word:** Usa `plantilla_maestra.docx` (debe estar en `/public/`) con placeholders `[[campo]]` que se reemplazan dinámicamente
- **Librerías:** pizzip + docxtemplater para manipular el archivo .docx
- **Descarga:** file-saver para descargar en navegador con nombre personalizado

### Estilos y UI
- **Estilos:** Tailwind CSS con paleta de colores personalizada
  - **Primario:** indigo-950, indigo-600 (header, botones principales)
  - **Neutro:** slate-50 a slate-700 (fondos, textos)
  - **Accento:** emerald (botones guardar), red (delete)
- **Iconos:** lucide-react (20+ iconos utilizados)
- **Componentes personalizados:** AutoResizingTextarea para campos de texto largo

### Arquitectura de Estado
- **Sin Context API/Redux:** Por ahora todo pasa por props
- **Hook centralizado:** `usePlan.js` gestiona TODO el estado relacionado con planeación
- **Escalabilidad:** Estructura lista para migrar a Context API o Redux si crece la complejidad

---

## Implementaciones Completadas

### 📚 Selección de Libro con Auto-relleno de Ciclos AMCO (Marzo 20, 2026)

**✅ COMPLETADO**

**Cambios realizados:**

1. **Hook `usePlan.js`:**
   - ✅ Agregado estado `libros` para almacenar catálogo de libros
   - ✅ Agregado estado `ciclosDisponibles` para ciclos del libro seleccionado
   - ✅ Agregado campo `libro_id` en plan state
   - ✅ Función `seleccionarLibro(libroId)` que actualiza ciclos automáticamente
   - ✅ Carga de libros en useEffect
   - ✅ Carga de preferencia de libro del docente (`libro_id_pref`)
   - ✅ GuardarPreferencias ahora guarda `libro_id_pref`

2. **Componente `StepLogistica.jsx`:**
   - ✅ Dropdown "Seleccionar Libro" en la sección logística
   - ✅ Dropdown "Ciclo AMCO" dinámico que solo muestra ciclos del libro seleccionado
   - ✅ Validación: si selecciona libro sin ciclos, muestra mensaje "Selecciona un libro primero"
   - ✅ Auto-cambio de ciclo si el anterior no existe en el nueva libro

3. **App.jsx:**
   - ✅ Destructuring de nuevos props del hook
   - ✅ Pasar `libros`, `ciclosDisponibles`, `seleccionarLibro` a StepLogistica

4. **Supabase (esperado):**
   - ⏳ Campo `libro_id_pref` agregado a tabla `docentes`
   - ⏳ Tabla `libros` con estructura: `id`, `nombre`, `codigo`, `ciclos_amco[]`, `descripcion`

**Flujo en acción:**
1. Usuario abre la app
2. Ve dropdown "Seleccionar Libro" en Logística
3. Elige un libro (ej: "Maravillas de Voy")
4. Dropdown "Ciclo AMCO" se actualiza automáticamente con los ciclos de ese libro
5. Al guardar preferencias, se guarda el libro seleccionado
6. Próxima sesión: carga automáticamente el libro y ciclos guardados

---

**Última actualización:** Marzo 20, 2026 (Implementada selección de libro con auto-relleno de ciclos)

---

## 📊 Base de Datos (Supabase PostgreSQL) - Actualizada Marzo 20, 2026

### **SQL para crear tablas de Ciclos**

```sql
-- 1. Crear tabla de Ciclos
CREATE TABLE Ciclos (
    id_ciclo BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    nombre_ciclo VARCHAR(100) NOT NULL UNIQUE
);

-- 2. Crear tabla de unión Tema-Ciclo
CREATE TABLE Tema_Ciclos (
    id_tema BIGINT NOT NULL REFERENCES Temas(id_tema) ON DELETE CASCADE,
    id_ciclo BIGINT NOT NULL REFERENCES Ciclos(id_ciclo) ON DELETE CASCADE,
    PRIMARY KEY (id_tema, id_ciclo)
);

-- 3. Insertar ciclos iniciales
INSERT INTO Ciclos (nombre_ciclo) VALUES 
('CICLO 1'),
('CICLO 2'),
('CICLO 3'),
('CICLO 4');
```

### **Estructura de Tablas**

#### **Tabla: `libros`**
| Campo | Tipo | Descripción |
|---|---|---|
| `id_libro` | BIGINT PK | ID único |
| `nombre_libro` | VARCHAR(255) | Nombre del libro |

---

#### **Tabla: `materias`**
| Campo | Tipo | Descripción |
|---|---|---|
| `id_materia` | BIGINT PK | ID único |
| `campo_formativo` | VARCHAR(255) | Campo (ej: "Lenguajes") |

---

#### **Tabla: `temas`** (Vincula Libro + Materia)
| Campo | Tipo | Descripción |
|---|---|---|
| `id_tema` | BIGINT PK | ID único |
| `id_materia` | BIGINT FK | Referencia a materias |
| `id_libro` | BIGINT FK | Referencia a libros |
| `tema` | VARCHAR(255) | Nombre del tema |

---

#### **Tabla: `ciclos`** ✨ NEW
| Campo | Tipo | Descripción |
|---|---|---|
| `id_ciclo` | BIGINT PK | ID único |
| `nombre_ciclo` | VARCHAR(100) | "CICLO 1", "CICLO 2", etc. (UNIQUE) |

---

#### **Tabla: `tema_ciclos`** ✨ NEW (Tabla de Unión)
| Campo | Tipo | Descripción |
|---|---|---|
| `id_tema` | BIGINT FK | Referencia a Temas |
| `id_ciclo` | BIGINT FK | Referencia a Ciclos |
| **PK** | (id_tema, id_ciclo) | Clave compuesta |

**Propósito:** Vincula temas con ciclos sin redundancia. Cada tema puede estar en múltiples ciclos, y cada ciclo en múltiples temas.

---

#### **Tabla: `contenido_temas`**
| Campo | Tipo | Descripción |
|---|---|---|
| `id_contenido` | BIGINT PK | ID único |
| `id_tema` | BIGINT FK | Referencia a Temas |
| `pagina` | VARCHAR(100) | Página del recurso |
| `recursos_materia` | TEXT | Recursos específicos |
| `eje_ambito` | VARCHAR(255) | Eje temático |
| `aprendizaje` | TEXT | Aprendizaje esperado |
| `im` | VARCHAR(100) | Indicador |
| `concepto_evaluar` | VARCHAR(255) | Concepto a evaluar |
| `inicio` | TEXT | Actividad de inicio |
| `desarrollo` | TEXT | Actividad principal |
| `cierre` | TEXT | Cierre de la clase |

---

#### **Tabla: `docentes`**
| Campo | Tipo | Descripción |
|---|---|---|
| `id_docente` | BIGINT PK | ID único |
| `user_id` | UUID FK | Referencia a Auth |
| `nombre_completo` | VARCHAR(255) | Nombre del docente |
| `correo` | VARCHAR(255) | Email |
| `ciclo_escolar_pref` | VARCHAR(50) | Preferencia guardada |
| `ciclo_amco_pref` | VARCHAR(50) | Preferencia guardada |
| `link_clase_pref` | VARCHAR(500) | Preferencia guardada |
| `recursos_pref` | TEXT | Preferencia guardada |
| `libro_id_pref` | BIGINT FK | Libro preferido (referencia a Libros) |

---

### **Cómo funciona la selección de libro (Actualizado)**

1. **Usuario selecciona un libro** → `StepLogistica.jsx` → `seleccionarLibro(libroId)`
2. **Hook consulta Temas** → Alle todos los `id_tema` donde `id_libro == libroId`
3. **Hook consulta Tema_Ciclos** → De esos temas, obtiene los `id_ciclo` únicos
4. **Hook carga Ciclos** → Obtiene los nombres (CICLO 1, CICLO 2, etc.)
5. **Dropdown actualiza** → Muestra solo ciclos disponibles para ese libro
6. **Guardando preferencias** → `guardarPreferencias()` guarda `libro_id_pref` en docentes

### **Query SQL equivalente (para referencia)**

```sql
-- Obtener ciclos de un libro
SELECT DISTINCT c.id_ciclo, c.nombre_ciclo
FROM Ciclos c
JOIN Tema_Ciclos tc ON c.id_ciclo = tc.id_ciclo
JOIN Temas t ON tc.id_tema = t.id_tema
WHERE t.id_libro = 1;
```

---

## 📝 Filtrado de Temas por Libro y Ciclo (Marzo 20, 2026 - Update)

### **Cambios implementados:**

**Hook `usePlan.js`:**
- ✅ Nuevo estado: `temasDisponibles` - almacena temas filtrados del libro + ciclo seleccionado
- ✅ Nuevo `useEffect` que se dispara cuando `plan.libro_id` o `plan.cicloAmco` cambian
- ✅ Lógica: 
  1. Obtiene todos los `id_tema` del libro seleccionado
  2. Obtiene el `id_ciclo` del ciclo nombre seleccionado
  3. Obtiene los temas que existen en ese ciclo (table `Tema_Ciclos`)
  4. Obtiene el contenido + información de materias de esos temas
  5. Aplana la estructura para compatibilidad con StepPlaneacion

**App.jsx:**
- ✅ Ahora pasa `temasDisponibles` (en lugar de `catalog`) a `StepPlaneacion`
- ✅ Esto garantiza que solo muestre temas relacionados al libro + ciclo seleccionados

**Resultado visual:**
- Cuando el usuario selecciona un libro en StepLogistica → ciclos disponibles se actualizan
- Cuando el usuario selecciona un ciclo → pasa a StepPlaneacion
- En StepPlaneacion, cuando agrega materias, el dropdown de temas SOLO muestra los temas de ese libro + ciclo

