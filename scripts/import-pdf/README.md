# Amco PDF Importer — Fase 2 a 5

Este módulo es una herramienta de automatización diseñada para extraer, procesar e insertar planeaciones pedagógicas desde archivos PDF de AMCO directamente a la base de datos de Supabase.

## 🛠️ ¿Qué hace cada parte?

El proceso se divide en 4 etapas lógicas ejecutadas secuencialmente por `index.js`:

1.  **Extracción (`pdfjsExtractor.js`)**: Lee el PDF página por página y convierte los elementos visuales en una cadena de texto gigante y desordenada.
2.  **Transformación (`amcoTransformer.js`)**: El "cerebro" del script. Usa Expresiones Regulares (Regex) para identificar patrones (como "Inicio:", "Desarrollo:", "Campo Formativo") y organiza el caos en una lista de objetos JSON limpios.
3.  **Validación (`blockValidator.js`)**: Actúa como un control de calidad. Revisa que no falten datos críticos (Temas, Fechas) y genera un reporte detallado de advertencias para campos vacíos.
4.  **Inserción (`supabaseInserter.js`)**: Toma los datos validados y los sube a Supabase respetando la estructura relacional (Libros -> Materias -> Temas -> Contenido).

## 📁 Estructura de Salida (Logs)

Cada vez que corres el script, se crea una carpeta organizada para evitar pérdida de datos:
`logs/[Nombre del Libro]/[Fecha Actual]/`
- `_crudo.txt`: El texto tal cual salió del PDF.
- `_bloques.json`: El resultado final estructurado.
- `_reporte.txt`: El log de auditoría del validador.

---

## 🚀 Cómo mandarlo a llamar (Instrucciones de uso)

### 1. Preparación del archivo
Coloca el PDF que deseas importar dentro de la carpeta `./pdfs/`.

### 2. Configuración de credenciales
Asegúrate de que el archivo `.env` dentro de esta carpeta tenga las credenciales correctas de Supabase (especialmente la **Service Role Key** para tener permisos de escritura).

### 3. Ejecución
Abre tu terminal en la carpeta `scripts/import-pdf` y ejecuta el siguiente comando:

```bash
node index.js "./pdfs/NOMBRE_DE_TU_ARCHIVO.pdf"