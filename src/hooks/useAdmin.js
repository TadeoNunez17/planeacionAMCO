import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';

/**
 * SQL NECESARIO - Ejecutar en Supabase SQL Editor:
 * 
 * ALTER TABLE docentes ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;
 * UPDATE docentes SET is_admin = true WHERE correo = 'admin@escuela.com';
 */

export function useAdmin() {
  const [docentes, setDocentes] = useState([]);
  const [libros, setLibros] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('docentes');
  const [gruposDocente, setGruposDocente] = useState([]);
  const [docenteSeleccionado, setDocenteSeleccionado] = useState(null);

  // Cargar docentes admin con conteo de grupos
  const cargarDocentes = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('docentes')
      .select(`
        *,
        grupos:grupos(count)
      `)
      .eq('is_admin', true)
      .order('nombre_completo');
    
    if (!error && data) {
      const docentesConConteo = data.map(d => ({
        ...d,
        total_grupos: d.grupos?.[0]?.count || 0
      }));
      setDocentes(docentesConConteo);
    }
    setLoading(false);
  }, []);

  // Cargar libros con conteo de docentes asignados
  const cargarLibros = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('libros')
      .select(`
        *,
        cursos:cursos(
          grupos:grupos(count)
        )
      `)
      .order('nombre_libro');
    
    if (!error && data) {
      const librosConConteo = data.map(l => {
        const totalDocentes = l.cursos?.reduce((acc, curso) => {
          return acc + (curso.grupos?.[0]?.count || 0);
        }, 0);
        return { ...l, total_docentes: totalDocentes };
      });
      setLibros(librosConConteo);
    }
    setLoading(false);
  }, []);

  // Crear docente (invitar por email)
  const crearDocente = useCallback(async (email, nombre) => {
    try {
      // Intentar invitar usando admin API
      const { data: authData, error: authError } = await supabase.auth.admin.inviteUserByEmail(email);
      
      if (authError) {
        // Si no hay permisos admin, usar signUp con password temporal
        const tempPassword = Math.random().toString(36).slice(-8) + 'A1!';
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password: tempPassword,
        });
        
        if (signUpError) throw signUpError;
        
        // Insertar en tabla docentes
        const { error: dbError } = await supabase
          .from('docentes')
          .insert([{
            user_id: signUpData.user.id,
            nombre_completo: nombre,
            correo: email
          }]);
        
        if (dbError) throw dbError;
      } else {
        // Insertar en tabla docentes con el user_id de la invitación
        const { error: dbError } = await supabase
          .from('docentes')
          .insert([{
            user_id: authData.user.id,
            nombre_completo: nombre,
            correo: email
          }]);
        
        if (dbError) throw dbError;
      }
      
      await cargarDocentes();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [cargarDocentes]);

  // Editar docente
  const editarDocente = useCallback(async (id, campos) => {
    const { error } = await supabase
      .from('docentes')
      .update(campos)
      .eq('id_docente', id);
    
    if (!error) {
      await cargarDocentes();
      return { success: true };
    }
    return { success: false, error: error.message };
  }, [cargarDocentes]);

  // Eliminar docente
  const eliminarDocente = useCallback(async (id) => {
    try {
      // Obtener el docente para conseguir el user_id
      const { data: docente } = await supabase
        .from('docentes')
        .select('user_id')
        .eq('id_docente', id)
        .single();
      
      // Eliminar grupos asociados
      await supabase
        .from('grupos')
        .delete()
        .eq('id_docente', id);
      
      // Eliminar docente
      const { error } = await supabase
        .from('docentes')
        .delete()
        .eq('id_docente', id);
      
      if (!error && docente?.user_id) {
        // Intentar eliminar usuario de auth (requiere permisos admin)
        try {
          await supabase.auth.admin.deleteUser(docente.user_id);
        } catch (e) {
          console.warn('No se pudo eliminar usuario de auth:', e.message);
        }
      }
      
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
    const { error } = await supabase
      .from('libros')
      .update({ nombre_libro: nombre })
      .eq('id_libro', id);
    
    if (!error) {
      await cargarLibros();
      return { success: true };
    }
    return { success: false, error: error.message };
  }, [cargarLibros]);

  // Eliminar libro (verificar dependencias)
  const eliminarLibro = useCallback(async (id) => {
    try {
      // Verificar si tiene temas o grupos asociados
      const { count: temasCount } = await supabase
        .from('temas')
        .select('*', { count: 'exact', head: true })
        .eq('id_libro', id);
      
      const { count: cursosCount } = await supabase
        .from('cursos')
        .select('*', { count: 'exact', head: true })
        .eq('id_libro', id);
      
      if (temasCount > 0 || cursosCount > 0) {
        return { 
          success: false, 
          error: 'No se puede eliminar: tiene temas o grupos asociados' 
        };
      }
      
      const { error } = await supabase
        .from('libros')
        .delete()
        .eq('id_libro', id);
      
      if (!error) {
        await cargarLibros();
        return { success: true };
      }
      return { success: false, error: error.message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [cargarLibros]);

  // Cargar grupos de un docente específico
  const cargarGruposDeDocente = useCallback(async (id_docente) => {
    const { data, error } = await supabase
      .from('grupos')
      .select(`
        *,
        cursos:cursos(
          id_libro,
          libros:libros(nombre_libro)
        )
      `)
      .eq('id_docente', id_docente);
    
    if (!error && data) {
      setGruposDocente(data);
      return data;
    }
    return [];
  }, []);

  // Asignar libro a docente
  const asignarLibroADocente = useCallback(async (id_docente, id_libro) => {
    try {
      // Verificar si ya existe un curso con ese libro
      const { data: cursosExistentes } = await supabase
        .from('cursos')
        .select('id_curso')
        .eq('id_libro', id_libro)
        .single();
      
      let id_curso;
      
      if (cursosExistentes) {
        id_curso = cursosExistentes.id_curso;
      } else {
        // Crear nuevo curso
        const { data: nuevoCurso, error: cursoError } = await supabase
          .from('cursos')
          .insert([{ id_libro: id_libro }])
          .select()
          .single();
        
        if (cursoError) throw cursoError;
        id_curso = nuevoCurso.id_curso;
      }
      
      // Insertar en grupos
      const { error } = await supabase
        .from('grupos')
        .insert([{ id_docente, id_curso }]);
      
      if (error) throw error;
      
      // Recargar grupos del docente
      await cargarGruposDeDocente(id_docente);
      await cargarDocentes();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [cargarGruposDeDocente, cargarDocentes]);

  // Quitar grupo (y limpiar curso huérfano)
  const quitarGrupo = useCallback(async (id_grupo, id_docente) => {
    try {
      // Obtener el id_curso antes de eliminar
      const { data: grupo } = await supabase
        .from('grupos')
        .select('id_curso')
        .eq('id_grupo', id_grupo)
        .single();
      
      // Eliminar grupo
      const { error } = await supabase
        .from('grupos')
        .delete()
        .eq('id_grupo', id_grupo);
      
      if (!error && grupo?.id_curso) {
        // Verificar si el curso quedó huérfano
        const { count } = await supabase
          .from('grupos')
          .select('*', { count: 'exact', head: true })
          .eq('id_curso', grupo.id_curso);
        
        if (count === 0) {
          await supabase
            .from('cursos')
            .delete()
            .eq('id_curso', grupo.id_curso);
        }
      }
      
      // Recargar grupos
      if (id_docente) {
        await cargarGruposDeDocente(id_docente);
      }
      await cargarDocentes();
      return { success: true };
    } catch (error) {
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
    // Estado
    docentes,
    libros,
    loading,
    activeSection,
    gruposDocente,
    docenteSeleccionado,
    // Setters
    setActiveSection,
    setDocenteSeleccionado,
    // Funciones
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
