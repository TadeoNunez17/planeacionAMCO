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

scripts/
└── import-pdf/                          # Herramienta de importación de PDFs AMCO (Node.js)
    ├── README.md                        # Documentación de la herramienta
    ├── pdfjsExtractor.js                # Extrae texto de PDFs
    ├── amcoTransformer.js               # Estructura texto AMCO a JSON
    ├── blockValidator.js                # Valida datos estructurados
    ├── supabaseInserter.js              # Inserta datos en Supabase
    └── package.json                     # Dependencias de la herramienta
```

⚠️ **Archivos legacy (no usados):** `src/components/Login.jsx`, `src/components/FormularioSemana.jsx`

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

### **Referencia Rápida de Nombres de Columnas**

| Tabla | Columnas Clave |
|---|---|
| `docentes` | `id_docente`, `user_id`, `nombre_completo`, `ciclo_escolar_pref`, `ciclo_amco_pref`, `link_clase_pref`, `recursos_pref`, `libro_id_pref` |
| `grupos` | `id_grupo`, `id_docente`, `id_curso` |
| `cursos` | `id_curso`, `id_libro`, `nombre_curso` |
| `libros` | `id_libro`, `nombre_libro` |
| `materias` | `id_materia`, `campo_formativo` |
| `temas` | `id_tema`, `id_materia`, `id_libro`, `tema` |
| `contenido_temas` | `id_contenido`, `id_tema`, `pagina`, `recursos_materia`, `eje_ambito`, `aprendizaje`, `im`, `concepto_evaluar`, `inicio`, `desarrollo`, `cierre` |
| `ciclos` | `id_ciclo`, `nombre_ciclo` |
| `tema_ciclos` | `id_tema`, `id_ciclo` (PK compuesta) |

⚠️ **IMPORTANTE:** Usar estos nombres exactos en consultas a Supabase. Los IDs usan `Int8` (no UUID).

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

const libros = []         // Catálogo de libros disponibles (vía grupos/cursos)
const ciclosDisponibles = []  // Ciclos del libro seleccionado
const temasDisponibles = []   // Temas filtrados por libro + ciclo
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
| `removeMateria()` | sessionIdx, materiaIdx | 🆕 Elimina una clase del día |
| `moverMateria()` | sessionIdx, materiaIdx, dirección | Reordena clases (↑ o ↓) |
| `autoRellenar()` | sessionIdx, materiaIdx, temaNombre | Carga datos de BD al seleccionar tema (usa `temasDisponibles`) |
| `updateMateria()` | sessionIdx, materiaIdx, field, value | Actualiza un campo de una clase |
| `updateSessionLogistics()` | sessionIdx, field, value | Actualiza fecha o tema relevancia del día |
| `guardarPreferencias()` | - | Guarda datos en tabla docentes para próximas sesiones |

---

## 7. Funcionalidades Pendientes o En Progreso

### 🟡 **En Progreso**
- [ ] Subir la planeación a base de datos (guardar historial de planeaciones)
- [ ] Listar planeaciones anteriores
- [ ] Editar planeaciones guardadas

### 🔲 **Pendientes - Corto plazo (Próximos días)**
- [x] **Crear tabla `libros`** en Supabase con ciclos disponibles por libro
- [x] **Agregar campo "Libro" en StepLogistica** 
  - Dropdown para seleccionar libro
  - Al cambiar libro → auto-actualizar ciclos AMCO disponibles
  - Guardar libro seleccionado como preferencia en docentes
- [x] **Filtrado de temas por libro + ciclo** en StepPlaneacion
- [x] **Eliminar materia** en StepPlaneacion (botón papelera)
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

### 🗑️ Eliminar Materia en StepPlaneacion (Marzo 20, 2026)

**✅ COMPLETADO**

**Cambios realizados:**

1. **Hook `usePlan.js`:**
   - ✅ Función `removeMateria(sessionIdx, materiaIdx)` implementada
   - ✅ Elimina una clase específica de un día

2. **Componente `StepPlaneacion.jsx`:**
   - ✅ Botón con icono `Trash2` para cada clase
   - ✅ Confirmación visual antes de eliminar
   - ✅ Pasar `removeMateria` desde App.jsx

3. **App.jsx:**
   - ✅ Pasar `removeMateria` prop a StepPlaneacion

---

### 📝 Filtrado de Temas por Libro y Ciclo (Marzo 20, 2026)

**✅ COMPLETADO**

**Cambios realizados:**

1. **Hook `usePlan.js`:**
   - ✅ Nuevo estado: `temasDisponibles` - almacena temas filtrados del libro + ciclo seleccionado
   - ✅ Nuevo `useEffect` que se dispara cuando `plan.libro_id` o `plan.cicloAmco` cambian
   - ✅ Lógica: 
     1. Obtiene todos los `id_tema` del libro seleccionado
     2. Obtiene el `id_ciclo` del ciclo nombre seleccionado
     3. Obtiene los temas que existen en ese ciclo (table `Tema_Ciclos`)
     4. Obtiene el contenido + información de materias de esos temas
     5. Aplana la estructura para compatibilidad con StepPlaneacion

2. **App.jsx:**
   - ✅ Ahora pasa `temasDisponibles` (en lugar de `catalog`) a `StepPlaneacion`
   - ✅ Esto garantiza que solo muestre temas relacionados al libro + ciclo seleccionados

**Resultado visual:**
- Cuando el usuario selecciona un libro en StepLogistica → ciclos disponibles se actualizan
- Cuando el usuario selecciona un ciclo → pasa a StepPlaneacion
- En StepPlaneacion, cuando agrega materias, el dropdown de temas SOLO muestra los temas de ese libro + ciclo

---

### 📄 Herramienta de Importación de PDFs AMCO (Marzo 20, 2026)

**✅ COMPLETADO**

**Descripción:**
Herramienta independiente en `scripts/import-pdf/` para importar planeaciones PDF de AMCO y cargarlas a Supabase.

**Archivos:**
- `pdfjsExtractor.js` - Extrae texto de PDFs usando pdfjs-dist
- `amcoTransformer.js` - Estructura el texto usando expresiones regulares al formato JSON
- `blockValidator.js` - Valida los datos estructurados
- `supabaseInserter.js` - Inserta datos en Supabase respetando la estructura relacional
- `README.md` - Documentación de uso

**Uso:** Node.js script independiente de la app React. Requiere configurar credenciales de Supabase en el script.

### **SQL para crear tablas actualizadas (Abril 29, 2026)**

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

-- 3. Crear tabla Grupos (vincula docentes con cursos)
CREATE TABLE Grupos (
    id_grupo BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    id_docente BIGINT REFERENCES Docentes(id_docente) ON DELETE CASCADE,
    id_curso BIGINT REFERENCES Cursos(id_curso) ON DELETE CASCADE
);

-- 4. Crear tabla Cursos (vincula cursos con libros)
CREATE TABLE Cursos (
    id_curso BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    id_libro BIGINT REFERENCES Libros(id_libro) ON DELETE CASCADE,
    nombre_curso VARCHAR(255)
);

-- 5. Insertar ciclos iniciales
INSERT INTO Ciclos (nombre_ciclo) VALUES 
('CICLO 1'),
('CICLO 2'),
('CICLO 3'),
('CICLO 4');
```

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

## 📝 Constantes (src/constants/index.js)

| Constante | Descripción |
|---|---|
| `COLORES` | Objeto con colores por campo formativo para UI |
| `MESES` | Array con nombres de meses en español |
| `TIME_SLOTS` | Array de rangos de hora para horarios de clases (ej: "07:30 - 08:30") |

---

**Última actualización:** Abril 29, 2026 (Agregados grupos, cursos, TIME_SLOTS, herramienta PDF)

