// src/blockValidator.js

export function validarBloques(bloques) {
  const reporte = {
    total: bloques.length,
    listos: 0,
    conAdvertencias: 0,
    conErrores: 0,
    detallesErrores: [],
    detallesAdvertencias: []
  };

  bloques.forEach((bloque, index) => {
    const errores = [];
    const advertencias = [];

    // --- 🔴 VALIDACIONES CRÍTICAS (Errores) ---
    // Si falla algo de esto, el bloque es inservible y no debe ir a Supabase
    if (!bloque.tema || bloque.tema.trim() === '') errores.push('Tema vacío');
    if (!bloque.ciclo) errores.push('Ciclo vacío');
    if (typeof bloque.fecha !== 'number' || isNaN(bloque.fecha)) errores.push('Fecha inválida');
    if (!bloque.campo_formativo) errores.push('Sin campo formativo');

    // --- 🟡 VALIDACIONES SECUNDARIAS (Advertencias / Activan Fallback) ---
    // Si falta esto, se puede subir, pero la DB o el Frontend debe poner un texto por defecto
    if (!bloque.aprendizaje || bloque.aprendizaje.trim() === '') advertencias.push('Falta Aprendizaje');
    if (!bloque.im || bloque.im.trim() === '') advertencias.push('Falta IM');
    if (!bloque.inicio || bloque.inicio.length < 10) advertencias.push('Inicio ausente o muy corto');
    if (!bloque.desarrollo || bloque.desarrollo.length < 10) advertencias.push('Desarrollo ausente o muy corto');
    if (!bloque.cierre || bloque.cierre.length < 10) advertencias.push('Cierre ausente o muy corto');

    // Clasificamos el bloque
    if (errores.length > 0) {
      reporte.conErrores++;
      reporte.detallesErrores.push(`[Índice ${index}] ${bloque.ciclo} F${bloque.fecha} - ${bloque.campo_formativo}: ${errores.join(', ')}`);
    } else if (advertencias.length > 0) {
      reporte.conAdvertencias++;
      reporte.detallesAdvertencias.push(`[Índice ${index}] ${bloque.ciclo} F${bloque.fecha} - ${bloque.tema}: ${advertencias.join(', ')}`);
    } else {
      reporte.listos++;
    }
  });

  return reporte;
}

export function imprimirReporte(reporte) {
  console.log('\n📊 REPORTE DE VALIDACIÓN (FASE 4)');
  console.log('═'.repeat(50));
  console.log(`Total de bloques evaluados  : ${reporte.total}`);
  console.log(`✅ Perfectos para Supabase  : ${reporte.listos}`);
  console.log(`⚠️  Con Advertencias (Fallback): ${reporte.conAdvertencias}`);
  console.log(`❌ Con Errores (Descartados)  : ${reporte.conErrores}`);

  if (reporte.conAdvertencias > 0) {
    console.log('\n⚠️  Muestra de Advertencias (Se usará Fallback en DB):');
    // Solo mostramos los primeros 5 para no inundar la consola
    reporte.detallesAdvertencias.slice(0, 5).forEach(adv => console.log(`   - ${adv}`));
    if (reporte.detallesAdvertencias.length > 5) console.log(`   ... y ${reporte.detallesAdvertencias.length - 5} más.`);
  }

  if (reporte.conErrores > 0) {
    console.log('\n❌ ERRORES CRÍTICOS (Revisar JSON manual):');
    reporte.detallesErrores.forEach(err => console.log(`   - ${err}`));
  }
  console.log('═'.repeat(50) + '\n');
}