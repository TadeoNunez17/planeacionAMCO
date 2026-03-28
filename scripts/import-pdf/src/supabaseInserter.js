// src/supabaseInserter.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan credenciales de Supabase en el archivo .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// --- Funciones Helper para obtener o crear registros usando tus nombres de columna ---

async function getOrCreateLibro(nombreLibro) {
  let { data, error } = await supabase.from('libros').select('id_libro').eq('nombre_libro', nombreLibro).maybeSingle();
  if (!data) {
    const res = await supabase.from('libros').insert({ nombre_libro: nombreLibro }).select('id_libro').single();
    if (res.error) throw res.error;
    data = res.data;
  }
  return data.id_libro;
}

async function getOrCreateCiclo(nombreCiclo) {
  let { data, error } = await supabase.from('ciclos').select('id_ciclo').eq('nombre_ciclo', nombreCiclo).maybeSingle();
  if (!data) {
    const res = await supabase.from('ciclos').insert({ nombre_ciclo: nombreCiclo }).select('id_ciclo').single();
    if (res.error) throw res.error;
    data = res.data;
  }
  return data.id_ciclo;
}

async function getOrCreateMateria(campoFormativo) {
  let { data, error } = await supabase.from('materias').select('id_materia').eq('campo_formativo', campoFormativo).maybeSingle();
  if (!data) {
    const res = await supabase.from('materias').insert({ campo_formativo: campoFormativo }).select('id_materia').single();
    if (res.error) throw res.error;
    data = res.data;
  }
  return data.id_materia;
}

// --- Función Principal de Inserción ---

export async function insertarEnSupabase(rutaJson) {
  console.log(`\n🚀 Conectando a Supabase para insertar: ${rutaJson}`);
  
  const bloques = JSON.parse(fs.readFileSync(rutaJson, 'utf-8'));
  let insertados = 0;
  let errores = 0;

  for (const [index, bloque] of bloques.entries()) {
    try {
      // 1, 2, 3: Obtener IDs (Libro, Ciclo, Materia)
      const idLibro = await getOrCreateLibro(bloque.libro);
      const idCiclo = await getOrCreateCiclo(bloque.ciclo);
      const idMateria = await getOrCreateMateria(bloque.campo_formativo);

      // 4. Insertar Tema (Tabla: temas)
      // Nota: según tu imagen, usa id_materia e id_libro
      let { data: temaData, error: temaError } = await supabase
        .from('temas')
        .insert({ 
          tema: bloque.tema, 
          id_libro: idLibro, 
          id_materia: idMateria 
        })
        .select('id_tema')
        .single();
      
      if (temaError) throw temaError;
      const idTema = temaData.id_tema;

      // 5. Tabla Pivote (Tabla: tema_ciclos)
      const { error: pivoteError } = await supabase
        .from('tema_ciclos')
        .insert({ id_tema: idTema, id_ciclo: idCiclo });
      
      if (pivoteError) throw pivoteError;

      // 6. Insertar Contenido (Tabla: contenido_temas)
      const contenido = {
        id_tema: idTema,
        pagina: bloque.pagina || '',
        recursos_materia: bloque.recursos_materia || '',
        eje_ambito: bloque.eje_ambito || '',
        aprendizaje: bloque.aprendizaje || 'Actividad práctica guiada por el docente.',
        im: bloque.im || '',
        concepto_evaluar: bloque.concepto_evaluar || '',
        inicio: bloque.inicio || '',
        desarrollo: bloque.desarrollo || '',
        cierre: bloque.cierre || ''
      };

      const { error: contenidoError } = await supabase.from('contenido_temas').insert(contenido);
      if (contenidoError) throw contenidoError;

      insertados++;
      process.stdout.write('🟢 '); 
    } catch (error) {
      console.error(`\n❌ Error al insertar bloque ${index} (${bloque.tema}):`, error.message);
      errores++;
    }
  }

  console.log(`\n\n✅ Proceso terminado. Insertados: ${insertados} | Errores: ${errores}`);
}