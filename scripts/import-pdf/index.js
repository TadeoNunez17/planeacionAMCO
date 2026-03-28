/* eslint-env node */
import path from 'path';
import fs from 'fs';
import { extraerTextoPDF } from './src/pdfjsExtractor.js';
import { parsearTexto } from './src/amcoTransformer.js';
import { validarBloques, imprimirReporte } from './src/blockValidator.js';
import { insertarEnSupabase } from './src/supabaseInserter.js';

const rutaPDF = process.argv[2];

if (!rutaPDF) {
  console.error('❌ Debes indicar la ruta del PDF.');
  console.error('   Ejemplo: node index.js ./pdfs/planificacion-t2.pdf');
  process.exit(1);
}

if (!fs.existsSync(rutaPDF)) {
  console.error(`❌ No se encontró el archivo: ${rutaPDF}`);
  process.exit(1);
}

const nombreBase = path.basename(rutaPDF, '.pdf');

console.log('🚀 Amco PDF Importer — v1.0');
console.log('─'.repeat(50));

// Metemos todo en una función async para poder usar await tranquilamente
async function main() {
  try {
    // Fase 2: Extracción
    const { textoCompleto, todosLosItems, totalPaginas } = await extraerTextoPDF(rutaPDF);
    console.log(`\n✅ Extracción: ${totalPaginas} páginas, ${todosLosItems.length} fragmentos detectados.`);

    // Fase 3: Parser
    const { libro, bloques } = parsearTexto(textoCompleto);

    // ─── LÓGICA DE CARPETAS DINÁMICAS ───────────────────────────────────
    // Limpiamos el nombre del libro por si tiene caracteres especiales
    const nombreCarpetaLibro = libro.replace(/[<>:"\/\\|?*]+/g, '-');
    
    // Obtenemos la fecha actual (Ej: 2026-03-27)
    const fechaHoy = new Date().toISOString().split('T')[0];
    
    // Armamos la ruta: logs / Nombre del Libro / YYYY-MM-DD
    const directorioSalida = path.join('logs', nombreCarpetaLibro, fechaHoy);
    
    // Si la ruta no existe, la creamos (recursive: true crea todas las subcarpetas necesarias)
    if (!fs.existsSync(directorioSalida)) {
      fs.mkdirSync(directorioSalida, { recursive: true });
    }

    // Definimos dónde se guardarán los archivos
    const rutaTxt = path.join(directorioSalida, `${nombreBase}_crudo.txt`);
    const rutaJson = path.join(directorioSalida, `${nombreBase}_bloques.json`);

    // Fase de Guardado: Guardamos ambos archivos en la nueva carpeta
    fs.writeFileSync(rutaTxt, textoCompleto, 'utf8');
    fs.writeFileSync(rutaJson, JSON.stringify(bloques, null, 2), 'utf8');
    const reporte = validarBloques(bloques);
    imprimirReporte(reporte);
    const rutaReporte = path.join(directorioSalida, `${nombreBase}_reporte.txt`);
    fs.writeFileSync(rutaReporte, JSON.stringify(reporte, null, 2), 'utf8');
    // ────────────────────────────────────────────────────────────────────

    console.log('\n' + '─'.repeat(50));
    console.log(`📚 Libro   : ${libro}`);
    console.log(`📦 Bloques : ${bloques.length}`);
    console.log(`📁 Carpeta : ${directorioSalida}`);
    console.log(`💾 JSON guardado exitosamente.`);
    console.log('\n👀 Revisa el JSON en la carpeta de logs para verificar los bloques antes de continuar.');
    console.log(`📁 Archivos y reporte guardados en: ${directorioSalida}`);
    console.log('─'.repeat(50));
    console.log('\nIniciando subida a base de datos...');
    await insertarEnSupabase(rutaJson);
  } catch (error) {
    console.error('\n❌ Ocurrió un error crítico durante el proceso:', error);
    process.exit(1);
  }
}

main();