// amcoTransformer.js — Convierte texto crudo del PDF en objetos estructurados

import { Leaf } from "lucide-react";

// ─── Campos formativos válidos ────────────────────────────────────────────────
const CAMPOS_FORMATIVOS = [
  'Lenguajes',
  'Saberes y pensamiento científico',
  'Ética, naturaleza y sociedades',
  'De lo humano y lo comunitario',
];

// ─── Texto basura que puede colarse del encabezado del PDF ───────────────────
const TEXTO_BASURA = [
  'Dosificación Inicio',
  'Formato en blanco',
  'Tiempo Campo formativo Tema Página Contenido',
  'Procesos de Desarrollo de Aprendizaje IM Eje articulador SEP HBP Recursos',
  'Sugerencias Plan Analítico',
  'Problemática proyecto',
  'NOTA: Ciclo 6 y C7',
];

// ─── Detectar ciclo en texto ──────────────────────────────────────────────────
function detectarCiclo(texto) {
  const match = texto.match(/3\.[\wº]+ - (Ciclo [456])/);
  if (match) return match[1];
  const match2 = texto.match(/\b(Ciclo [456])\b/);
  return match2 ? match2[1] : null;
}

// ─── Detectar libro ───────────────────────────────────────────────────────────
function detectarLibro(textoCompleto) {
  const match = textoCompleto.match(/3\.[\wº]+T(\d+)/i);
  return match ? `3.ºT${match[1]} - Preescolar` : '3.ºT2 - Preescolar';
}

// ─── Extraer texto entre dos etiquetas ───────────────────────────────────────
function extraerEntre(texto, etiquetaInicio, etiquetasFin) {
  const inicio = texto.indexOf(etiquetaInicio);
  if (inicio === -1) return '';

  const desdeInicio = texto.slice(inicio + etiquetaInicio.length);

  let fin = desdeInicio.length;
  for (const etiqueta of etiquetasFin) {
    const pos = desdeInicio.indexOf(etiqueta);
    if (pos !== -1 && pos < fin) fin = pos;
  }

  return desdeInicio.slice(0, fin).trim();
}

// ─── Limpiar texto basura ─────────────────────────────────────────────────────
function limpiarTexto(texto) {
  let resultado = texto.replace(/\s+/g, ' ').trim();

  resultado = resultado.replace(/Notas:\s*/g, '');

  for (const basura of TEXTO_BASURA) {
    const pos = resultado.indexOf(basura);
    if (pos !== -1) {
      resultado = resultado.slice(0, pos).trim();
    }
  }

  return resultado.trim();
}

// ─── Limpiar página ───────────────────────────────────────────────────────────
function limpiarPagina(texto) {
  if (!texto) return '';
  // Se simplificó porque la extracción ahora es mucho más precisa y ya no 
  // arrastra números perdidos del tema
  return texto.trim();
}

// ─── Limpiar tema ─────────────────────────────────────────────────────────────
function limpiarTema(tema) {
  if (!tema) return '';
  let resultado = tema.trim();

  for (const basura of TEXTO_BASURA) {
    const pos = resultado.indexOf(basura);
    if (pos !== -1) resultado = resultado.slice(0, pos).trim();
  }

  for (const campo of CAMPOS_FORMATIVOS) {
    const pos = resultado.indexOf(campo);
    if (pos > 5) resultado = resultado.slice(0, pos).trim();
  }

  const cortadores = [
    'La cultura de paz', 'Interacción, cuidado', 'Narración de historias',
    'Producciones gráficas', 'Los saberes numéricos', 'Recursos y juegos',
    'Cambios que ocurren', 'Medidas de prevención', 'Cuidado de la salud',
    'Clasificación y experimentación', 'Desplazamientos y recorridos',
    'Características de objetos', 'Transformación responsable',
    'Aprecia la diversidad', 'Expresa con libertad',
  ];
  for (const cortador of cortadores) {
    const pos = resultado.indexOf(cortador);
    if (pos > 0) resultado = resultado.slice(0, pos).trim();
  }

  return resultado.slice(0, 200).trim();
}

// ─── Limpiar eje_ambito ───────────────────────────────────────────────────────
function limpiarEje(texto) {
  if (!texto) return '';
  // FIX 2: Se agregaron verbos HBP y 'Audio' a los cortadores
  const cortadores = ['Secuencia', 'Tarea:', 'Inicio:', 'HBP', 'Recursos', 'Observar', 'Clasificar', 'Relacionar', 'Describir', 'Comparar', 'Audio'];
  let resultado = texto;
  for (const c of cortadores) {
    const pos = resultado.indexOf(c);
    if (pos !== -1) resultado = resultado.slice(0, pos);
  }
  return resultado.trim().slice(0, 255);
}

// ─── Validar que un bloque es real (no falso positivo) ───────────────────────
// ─── Validar que un bloque es real (no falso positivo) ───────────────────────
function esBloqueValido(bloque) {
  if (!bloque.tema || bloque.tema.length < 3) return false;
  if (bloque.tema === ': p.' || bloque.tema.startsWith(': ')) return false;
  if (bloque.tema.startsWith('p.')) return false;

  // Filtros de basura final
  if (bloque.tema.includes('Plan Analítico') || bloque.cierre.includes('Plan Analítico') || bloque.inicio.includes('Plan Analítico')) return false;
  
  // NUEVO FIX: Filtrar el bloque de la plantilla vacía que se cuela al final del PDF
  if (bloque.cierre.includes('Inicio: Desarrollo: Cierre:') || bloque.cierre.includes('Planificación Ciclo')) return false;

  const tieneContenido = bloque.inicio || bloque.desarrollo || bloque.cierre;
  if (!tieneContenido) return false;

  if (bloque.desarrollo && bloque.desarrollo.length < 30) return false;

  const ciclosValidos = ['Ciclo 4', 'Ciclo 5', 'Ciclo 6'];
  if (!ciclosValidos.includes(bloque.ciclo)) return false;

  return true;
}

// ─── Parser principal ─────────────────────────────────────────────────────────
export function parsearTexto(textoCompleto) {
  console.log('\n🔍 Iniciando parser...');

  const libro = detectarLibro(textoCompleto);
  console.log(`📚 Libro detectado: ${libro}`);

  const textoUnido = textoCompleto
    .replace(/========== PÁGINA \d+ ==========\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const ciclosDetectados = new Set();
  const matchesCiclo = textoCompleto.matchAll(/3\.[\wº]+ - (Ciclo [456])/gi);
  for (const m of matchesCiclo) ciclosDetectados.add(m[1]);
  console.log(`🔄 Ciclos detectados: ${[...ciclosDetectados].join(', ')}`);

  const partesFecha = textoUnido.split(/(?=Fecha:\s*\d+)/);

  const bloques = [];
  let cicloActual = 'Ciclo 4';

  for (const parte of partesFecha) {
    if (!parte.trim()) continue;

    const cicloEnParte = detectarCiclo(parte);
    if (cicloEnParte) cicloActual = cicloEnParte;

    const matchFecha = parte.match(/Fecha:\s*(\d+)/);
    if (!matchFecha) continue;
    const numeroFecha = parseInt(matchFecha[1]);

    for (const campo of CAMPOS_FORMATIVOS) {
      const posCampo = parte.indexOf(campo);
      if (posCampo === -1) continue;

      const desdeC = parte.slice(posCampo);

      let finBloque = desdeC.length;
      for (const otroCampo of CAMPOS_FORMATIVOS) {
        if (otroCampo === campo) continue;
        const posOtro = desdeC.indexOf(otroCampo, campo.length + 5);
        if (posOtro !== -1 && posOtro < finBloque) finBloque = posOtro;
      }

      const bloqueTexto = desdeC.slice(0, finBloque);
      const despuesCampo = bloqueTexto.slice(campo.length).trim();

      // ── Extraer TEMA Y PÁGINA (FIX 3: Evitar truncar temas con números) ───────
      // Ahora se detiene solo si el número está seguido de IM (ej: VL, VE) o HBP (ej: Observar)
      let temaRaw = despuesCampo.slice(0, 100);
      let paginaRaw = '';

      // Busca: [Cualquier texto] + [Espacio] + [Números de página (ej. 53, 54 o Recortable)] + [Espacio] + [Palabra con Mayúscula, IM o HBP]
      const matchTemaPagina = despuesCampo.match(/^(.+?)\s+([\d,\s]+(?:Recortable\s*#?\d*)?)\s+(?=[A-ZÁÉÍÓÚ]|VL|VE|LM|Ie|Ia|K|N\b|Observar|Clasificar|Relacionar|Describir|Comparar|Secuencia)/);
      
      if (matchTemaPagina) {
        temaRaw = matchTemaPagina[1];
        paginaRaw = matchTemaPagina[2];
      } else {
        // Fallback si no detecta la estructura exacta
        const matchCorto = despuesCampo.match(/^(.+?)(?=\s+\b\d[\d,\s]*\b)/);
        if (matchCorto) temaRaw = matchCorto[1];
      }

      let tema = limpiarTema(temaRaw);
      let pagina = limpiarPagina(paginaRaw).slice(0, 100);

      // ── Extraer IM ────────────────────────────────────────────────────────
      const matchIM = bloqueTexto.match(/\b((?:VL|VE|LM|Ie|Ia|VE|K|N)(?:[,\s]+(?:VL|VE|LM|Ie|Ia|K|N))*)\b/);
      let im = matchIM ? matchIM[1].replace(/\s+/g, ' ').trim().slice(0, 100) : '';
      // Remover la 'N' sola o acompañada (ej: "VE, N" -> "VE")
      im = im.replace(/\bN\b/g, '').replace(/,\s*,/g, ',').replace(/(^,|\s*,$)/g, '').trim();

      // ── Extraer HBP ───────────────────────────────────────────────────────
      const hbpOpciones = ['Observar', 'Clasificar', 'Relacionar', 'Describir', 'Comparar'];
      const hbpEncontrados = hbpOpciones.filter(h => bloqueTexto.includes(h));
      const concepto_evaluar = hbpEncontrados.join(' ');

      // ── Extraer EJE ARTICULADOR ───────────────────────────────────────────
      const ejePatrones = [
        /Apropiación de las culturas[^.]+\./,
        /Vida saludable/,
        /Pensamiento crítico/,
        /Inclusión/,
        /Interculturalidad crítica/,
      ];
      let eje_ambito = '';
      for (const patron of ejePatrones) {
        const m = bloqueTexto.match(patron);
        if (m) { eje_ambito = m[0].trim(); break; }
      }
      eje_ambito = limpiarEje(eje_ambito);

      // ── Extraer APRENDIZAJE ───────────────────────────────────────────────
      const matchAprendizaje = bloqueTexto.match(
        /(?:socioculturales\.|escritura\.|diversidad\.|ambiental\.)\s*([A-ZÁÉÍÓÚ][^.]+\.)/
      );
      let aprendizaje = matchAprendizaje ? limpiarTexto(matchAprendizaje[1]) : '';
      
      // FIX 1: Limpiar basura que se cuela en aprendizaje
      const cortadoresAp = ['Observar', 'Clasificar', 'Relacionar', 'Describir', 'Comparar', 'Secuencia didáctica', 'Tarea:', 'Inicio:', 'HBP', 'Recursos', 'Audio'];
      for (const c of cortadoresAp) {
        const pos = aprendizaje.indexOf(c);
        if (pos !== -1) aprendizaje = aprendizaje.slice(0, pos).trim();
      }
      aprendizaje = aprendizaje.slice(0, 500);

      // ── Extraer RECURSOS ──────────────────────────────────────────────────
      const secPos = bloqueTexto.indexOf('Secuencia didáctica');
      let recursos_materia = '';
      if (secPos !== -1) {
        const antesSecuencia = bloqueTexto.slice(0, secPos);
        const ultimoHBP = Math.max(
          ...hbpOpciones.map(h => antesSecuencia.lastIndexOf(h))
        );
        if (ultimoHBP !== -1) {
          const candidato = antesSecuencia.slice(ultimoHBP + 10).trim();
          if (candidato.length > 3 && candidato.length < 300) {
            recursos_materia = limpiarTexto(candidato);
          }
        }
      }

      // ── Extraer SECUENCIA DIDÁCTICA ───────────────────────────────────────
      const etiquetasFin = [
        'Fecha:',
        ...CAMPOS_FORMATIVOS.filter(c => c !== campo),
        ...TEXTO_BASURA,
      ];

      const inicio = limpiarTexto(
        extraerEntre(bloqueTexto, 'Inicio:', ['Desarrollo:', 'Notas:', 'Cierre:', ...etiquetasFin])
      );
      const desarrollo = limpiarTexto(
        extraerEntre(bloqueTexto, 'Desarrollo:', ['Notas:', 'Cierre:', ...etiquetasFin])
      );
      const cierreRaw = limpiarTexto(
        extraerEntre(bloqueTexto, 'Cierre:', etiquetasFin)
      );
      const tarea = limpiarTexto(
        extraerEntre(bloqueTexto, 'Tarea:', ['Inicio:', 'Desarrollo:', ...etiquetasFin])
      );

      const cierre = cierreRaw + (tarea ? `\n[Tarea]: ${tarea}` : '');
      const matchRobado = pagina.match(/^(\d+)\s+([\d,\s]+(?:Recortable.*)?)$/i);
      if (matchRobado) {
        tema = `${tema} ${matchRobado[1]}`.trim();
        pagina = matchRobado[2].trim();
      }

      // --- FIX FINAL: Quitar comas huérfanas al principio o al final
      pagina = pagina.replace(/(^,+|,+$)/g, '').trim();
      im = im.replace(/(^,+|,+$)/g, '').trim();

      const bloque = {
        ciclo: cicloActual,
        libro,
        fecha: numeroFecha,
        campo_formativo: campo,
        tema,
        pagina,
        aprendizaje,
        im,
        eje_ambito,
        concepto_evaluar,
        recursos_materia: recursos_materia.slice(0, 500),
        inicio,
        desarrollo,
        cierre,
      };

      if (esBloqueValido(bloque)) {
        bloques.push(bloque);
      }
    }
  }

  bloques.sort((a, b) => {
    const cicloA = parseInt(a.ciclo.replace('Ciclo ', ''));
    const cicloB = parseInt(b.ciclo.replace('Ciclo ', ''));
    if (cicloA !== cicloB) return cicloA - cicloB;
    return a.fecha - b.fecha;
  });

  console.log(`\n✅ Bloques válidos: ${bloques.length}`);

  const porCiclo = {};
  for (const b of bloques) {
    porCiclo[b.ciclo] = (porCiclo[b.ciclo] || 0) + 1;
  }
  for (const [ciclo, cantidad] of Object.entries(porCiclo)) {
    console.log(`   ${ciclo}: ${cantidad} bloques`);
  }

  const sinDesarrollo = bloques.filter(b => !b.desarrollo).length;
  const sinInicio = bloques.filter(b => !b.inicio).length;
  if (sinDesarrollo > 0) console.log(`\n⚠️  ${sinDesarrollo} bloques sin desarrollo`);
  if (sinInicio > 0) console.log(`⚠️  ${sinInicio} bloques sin inicio`);

  return { libro, bloques };
}