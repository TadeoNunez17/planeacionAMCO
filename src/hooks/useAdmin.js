import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';

export function useAdmin() {
  const [docentes, setDocentes] = useState([]);
  const [libros, setLibros] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('docentes');
  const [gruposDocente, setGruposDocente] = useState([]);
  const [docenteSeleccionado, setDocenteSeleccionado] = useState(null);

  // Cargar docentes (simple)
  const cargarDocentes = useCallback(async () => {
    setLoading(true);
    console.log('INICIO: Cargando docentes...');
    
    const { data, error } = await supabase
      .from('docentes')
      .select('*')
      .order('nombre_completo');
    
    console.log('RESULTADO:', { 
      cantidad: data?.length, 
      error: error?.message,
      primerDocente: data?.[0] 
    });
    
    if (error) {
      console.error('Error:', error);
      setDocentes([]);
    } else {
      const docs = (data || []).map(d => ({
        ...d,
        is_admin: d.is_admin || false
      }));
      console.log('Docentes cargados:', docs.length);
      setDocentes(docs);
    }
    
    setLoading(false);
  }, []);

  // Cargar libros con conteo de docentes
  const cargarLibros = useCallback(async () => {
    setLoading(true);
    
    // 1. Cargar todos los libros
    const { data: librosData, error: librosError } = await supabase
      .from('libros')
      .select('*')
      .order('nombre_libro');
    
    if (librosError) {
      console.error('Error libros:', librosError);
      setLibros([]);
      setLoading(false);
      return;
    }

    // 2. Para cada libro, contar docentes que tienen acceso
    const librosConConteo = await Promise.all(
      (librosData || []).map(async (libro) => {
        // Buscar cursos con este libro
        const { data: cursos } = await supabase
          .from('cursos')
          .select('id_grupo')
          .eq('id_libro', libro.id_libro);
        
        if (!cursos || cursos.length === 0) {
          return { ...libro, total_docentes: 0 };
        }
        
        // Obtener IDs de grupos únicos
        const idsGrupos = [...new Set(cursos.map(c => c.id_grupo))];
        
        // Contar docentes con esos grupos
        const { count } = await supabase
          .from('grupos')
          .select('*', { count: 'exact', head: true })
          .in('id_grupo', idsGrupos);
        
        return { ...libro, total_docentes: count || 0 };
      })
    );
    
    console.log('Libros con conteo:', librosConConteo);
    setLibros(librosConConteo);
    setLoading(false);
  }, []);

  // Crear docente (solo insertar en tabla docentes)
  const crearDocente = useCallback(async (email, nombre, isAdmin = false) => {
    try {
      const { data, error } = await supabase
        .from('docentes')
        .insert([{
          nombre_completo: nombre,
          correo: email,
          is_admin: isAdmin
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      await cargarDocentes();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [cargarDocentes]);

  // Editar docente
  const editarDocente = useCallback(async (id, campos) => {
    try {
      const { error } = await supabase
        .from('docentes')
        .update(campos)
        .eq('id_docente', id);
      
      if (error) throw error;
      
      await cargarDocentes();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [cargarDocentes]);

  // Eliminar docente
  const eliminarDocente = useCallback(async (id) => {
    try {
      // Eliminar grupos
      await supabase.from('grupos').delete().eq('id_docente', id);
      
      // Eliminar docente
      const { error } = await supabase
        .from('docentes')
        .delete()
        .eq('id_docente', id);
      
      if (error) throw error;
      
      await cargarDocentes();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [cargarDocentes]);

  // Crear libro
  const crearLibro = useCallback(async (nombre) => {
    const { error } = await supabase
      .from('libros')
      .insert([{ nombre_libro: nombre }]);
    
    if (!error) {
      await cargarLibros();
      return { success: true };
    }
    return { success: false, error: error.message };
  }, [cargarLibros]);

  // Editar libro
  const editarLibro = useCallback(async (id, nombre) => {
    console.log("✏️ Editando libro:", id, "nuevo nombre:", nombre);
    const { data, error } = await supabase
      .from('libros')
      .update({ nombre_libro: nombre })
      .eq('id_libro', id)
      .select();
    
    if (error) {
      console.error("❌ Error editando libro:", error);
      return { success: false, error: error.message };
    }
    console.log("✅ Libro editado:", data);
    await cargarLibros();
    return { success: true };
  }, [cargarLibros]);

  // Eliminar libro
  const eliminarLibro = useCallback(async (id) => {
    try {
      // Verificar dependencias
      const { count: temasCount } = await supabase
        .from('temas')
        .select('*', { count: 'exact', head: true })
        .eq('id_libro', id);
      
      if (temasCount > 0) {
        return { success: false, error: 'Tiene temas asociados' };
      }
      
      const { error } = await supabase
        .from('libros')
        .delete()
        .eq('id_libro', id);
      
      if (error) throw error;
      
      await cargarLibros();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [cargarLibros]);

  // Cargar grupos de un docente (CORREGIDO según schema)
  const cargarGruposDeDocente = useCallback(async (id_docente) => {
    console.log('Cargando grupos de docente:', id_docente);
    
    const { data, error } = await supabase
      .from('grupos')
      .select(`
        *,
        cursos:cursos(
          id_curso,
          id_libro,
          libros:libros(nombre_libro)
        )
      `)
      .eq('id_docente', id_docente);
    
    console.log('Grupos cargados:', { data, error });
    
    if (!error && data) {
      setGruposDocente(data);
      return data;
    }
    return [];
  }, []);

  // Asignar libro a docente (CORREGIDO según schema)
  const asignarLibroADocente = useCallback(async (id_docente, id_libro) => {
    try {
      console.log('Asignando libro', id_libro, 'a docente', id_docente);
      
      // 1. Buscar o crear grupo para el docente
      let { data: grupoExistente } = await supabase
        .from('grupos')
        .select('id_grupo')
        .eq('id_docente', id_docente)
        .single();
      
      let id_grupo;
      
      if (grupoExistente) {
        id_grupo = grupoExistente.id_grupo;
        console.log('Grupo existente:', id_grupo);
      } else {
        // Crear nuevo grupo
        const { data: nuevoGrupo, error: grupoError } = await supabase
          .from('grupos')
          .insert([{ 
            id_docente: id_docente, 
            nombre_grupo: 'Grupo 1' 
          }])
          .select()
          .single();
        
        if (grupoError) throw grupoError;
        id_grupo = nuevoGrupo.id_grupo;
        console.log('Nuevo grupo creado:', id_grupo);
      }
      
      // 2. Verificar si ya existe un curso con ese grupo y libro
      const { data: cursoExistente } = await supabase
        .from('cursos')
        .select('id_curso')
        .eq('id_grupo', id_grupo)
        .eq('id_libro', id_libro)
        .single();
      
      if (cursoExistente) {
        return { success: false, error: 'Este libro ya está asignado a este docente' };
      }
      
      // 3. Crear curso
      const { error: cursoError } = await supabase
        .from('cursos')
        .insert([{ 
          id_grupo: id_grupo, 
          id_libro: id_libro 
        }]);
      
      if (cursoError) throw cursoError;
      
      await cargarGruposDeDocente(id_docente);
      await cargarDocentes();
      return { success: true };
    } catch (error) {
      console.error('Error asignando libro:', error);
      return { success: false, error: error.message };
    }
  }, [cargarGruposDeDocente, cargarDocentes]);

  // Quitar grupo (CORREGIDO según schema)
  const quitarGrupo = useCallback(async (id_grupo, id_docente) => {
    try {
      console.log('Quitando grupo:', id_grupo);
      
      // Obtener cursos asociados a este grupo
      const { data: cursos } = await supabase
        .from('cursos')
        .select('id_curso')
        .eq('id_grupo', id_grupo);
      
      // Eliminar grupo (esto eliminará los cursos por FK CASCADE si está configurado)
      const { error } = await supabase
        .from('grupos')
        .delete()
        .eq('id_grupo', id_grupo);
      
      if (error) throw error;
      
      // Limpiar cursos huérfanos (si no hay CASCADE)
      if (cursos && cursos.length > 0) {
        for (const curso of cursos) {
          await supabase.from('cursos').delete().eq('id_curso', curso.id_curso);
        }
      }
      
      if (id_docente) {
        await cargarGruposDeDocente(id_docente);
      }
      await cargarDocentes();
      return { success: true };
    } catch (error) {
      console.error('Error quitando grupo:', error);
      return { success: false, error: error.message };
    }
  }, [cargarGruposDeDocente, cargarDocentes]);

  // Carga inicial
  useEffect(() => {
    if (activeSection === 'docentes') {
      cargarDocentes();
    } else if (activeSection === 'libros') {
      cargarLibros();
    }
  }, [activeSection, cargarDocentes, cargarLibros]);

  return {
    docentes,
    libros,
    loading,
    activeSection,
    gruposDocente,
    docenteSeleccionado,
    setActiveSection,
    setDocenteSeleccionado,
    cargarDocentes,
    cargarLibros,
    crearDocente,
    editarDocente,
    eliminarDocente,
    crearLibro,
    editarLibro,
    eliminarLibro,
    cargarGruposDeDocente,
    asignarLibroADocente,
    quitarGrupo
  };
}
