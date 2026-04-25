import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { MESES, TIME_SLOTS } from '../constants';

export function usePlan(session) {
  const [plan, setPlan] = useState({
    ciclo_escolar: "2025-2026", 
    clave: "18PJN0114M", 
    cicloAmco: "CICLO 4",
    fecha_inicio: "",
    fecha_fin: "",
    rango_fechas: "", 
    link_clase: "",
    recursos_generales: "AMCO, IPAD, LÁPIZ, CRAYOLAS",
    libro_id: null
  });

  const [sessions, setSessions] = useState([]);
  const [docente, setDocente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [catalog, setCatalog] = useState([]);
  const [temasDisponibles, setTemasDisponibles] = useState([]);
  const [libros, setLibros] = useState([]);
  const [ciclosDisponibles, setCiclosDisponibles] = useState([]);

  const generarRangoTexto = (inicio, fin) => {
    if (!inicio || !fin) return "";
    const dInicio = new Date(inicio + "T00:00:00");
    const dFin = new Date(fin + "T00:00:00");
    if (dInicio.getMonth() === dFin.getMonth()) {
      return `${dInicio.getDate()} al ${dFin.getDate()} de ${MESES[dInicio.getMonth()]}`;
    } else {
      return `${dInicio.getDate()} de ${MESES[dInicio.getMonth()]} al ${dFin.getDate()} de ${MESES[dFin.getMonth()]}`;
    }
  };

  const actualizarFechasSesiones = (fechaInicioStr, fechaFinStr) => {
    if (!fechaInicioStr || !fechaFinStr) return;
    const startDate = new Date(fechaInicioStr + "T00:00:00");
    const endDate = new Date(fechaFinStr + "T00:00:00");
    if (endDate < startDate) return;

    const diasSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

    setSessions((prevSessions) => {
      const newSessions = [];
      let currentLoopDate = new Date(startDate);

      while (currentLoopDate <= endDate) {
        const dayOfWeek = currentLoopDate.getDay();
        const formattedDate = `${currentLoopDate.getDate()} de ${MESES[currentLoopDate.getMonth()]}`;
        const diaSemanaStr = diasSemana[dayOfWeek];
        
        const existingSession = prevSessions.find(s => s.fecha_exacta === formattedDate) || 
                               { materias: [], tema_relevancia: "" };
        
        newSessions.push({
          id: newSessions.length,
          dia: diaSemanaStr,
          fecha_exacta: formattedDate,
          tema_relevancia: existingSession.tema_relevancia,
          materias: existingSession.materias
        });

        currentLoopDate.setDate(currentLoopDate.getDate() + 1);
      }
      return newSessions;
    });
  };

  const addMateria = (sIdx) => {
    setSessions((prevSessions) => {
      const nuevas = [...prevSessions];
      const nuevaMateria = {
        hora: "", campo: "", tema: "", pagina: "", 
        recursos_materia: "", eje_ambito: "", aprendizaje: "", 
        im: "", concepto_evaluar: "", inicio: "", desarrollo: "", cierre: ""
      };
      if (nuevas[sIdx]) {
        nuevas[sIdx] = { ...nuevas[sIdx], materias: [...nuevas[sIdx].materias, nuevaMateria] };
      }
      return nuevas;
    });
  };

  const removeMateria = (sIdx, mIdx) => {
    setSessions((prevSessions) => {
      const nuevas = [...prevSessions];
      nuevas[sIdx].materias = nuevas[sIdx].materias.filter((_, index) => index !== mIdx);
      return nuevas;
    });
  };

  const moverMateria = (sIdx, mIdx, direccion) => {
    const nuevas = [...sessions];
    const materias = [...nuevas[sIdx].materias];
    const nuevaPos = mIdx + direccion;
    if (nuevaPos < 0 || nuevaPos >= materias.length) return;
    [materias[mIdx], materias[nuevaPos]] = [materias[nuevaPos], materias[mIdx]];
    nuevas[sIdx].materias = materias;
    setSessions(nuevas);
  };

  const autoRellenar = (sIdx, mIdx, temaNombre) => {
    const newSessions = [...sessions];
    const materiaActual = newSessions[sIdx].materias[mIdx];
    const datosBD = temasDisponibles.find(t => t.tema === temaNombre && t.campo_formativo === materiaActual.campo);
    
    if (datosBD) {
      newSessions[sIdx].materias[mIdx] = {
        ...materiaActual, 
        tema: datosBD.tema, pagina: datosBD.pagina || "",
        recursos_materia: datosBD.recursos_materia || "", eje_ambito: datosBD.eje_ambito || "",
        aprendizaje: datosBD.aprendizaje || "", im: datosBD.im || "",
        concepto_evaluar: datosBD.concepto_evaluar || "", inicio: datosBD.inicio || "",
        desarrollo: datosBD.desarrollo || "", cierre: datosBD.cierre || ""
      };
    } else { 
      newSessions[sIdx].materias[mIdx].tema = temaNombre; 
    }
    setSessions(newSessions);
  };

  const updateMateria = (sIdx, mIdx, field, value) => {
    const newSessions = [...sessions];
    newSessions[sIdx].materias[mIdx][field] = value;
    setSessions(newSessions);
  };

  const updateSessionLogistics = (sIdx, field, value) => {
    const newSessions = [...sessions];
    newSessions[sIdx][field] = value;
    setSessions(newSessions);
  };

  const seleccionarLibro = async (libroId) => {
    try {
      const { data: temasDelLibro } = await supabase
        .from('temas').select('id_tema').eq('id_libro', libroId);

      if (temasDelLibro && temasDelLibro.length > 0) {
        const idsTemasDelLibro = temasDelLibro.map(t => t.id_tema);
        const { data: temasConCiclos } = await supabase
          .from('tema_ciclos')
          .select('id_ciclo, ciclos(id_ciclo, nombre_ciclo)')
          .in('id_tema', idsTemasDelLibro);

        if (temasConCiclos) {
          const ciclosUnicos = {};
          temasConCiclos.forEach(tc => {
            if (tc.ciclos) ciclosUnicos[tc.ciclos.id_ciclo] = tc.ciclos.nombre_ciclo;
          });
          const ciclos = Object.values(ciclosUnicos);
          setCiclosDisponibles(ciclos);
          if (!ciclos.includes(plan.cicloAmco) && ciclos.length > 0) {
            setPlan({ ...plan, libro_id: libroId, cicloAmco: ciclos[0] });
          } else {
            setPlan({ ...plan, libro_id: libroId });
          }
        } else {
          setCiclosDisponibles([]);
          setPlan({ ...plan, libro_id: libroId });
        }
      } else {
        setCiclosDisponibles([]);
        setPlan({ ...plan, libro_id: libroId });
      }
    } catch (err) {
      console.error('Error al cargar ciclos:', err.message);
      setCiclosDisponibles([]);
      setPlan({ ...plan, libro_id: libroId });
    }
  };

  const guardarPreferencias = async () => {
    if (!session) return;
    setSavingPrefs(true);
    try {
      const { error } = await supabase.from('docentes').update({
        ciclo_escolar_pref: plan.ciclo_escolar, ciclo_amco_pref: plan.cicloAmco,
        link_clase_pref: plan.link_clase, recursos_pref: plan.recursos_generales,
        libro_id_pref: plan.libro_id
      }).eq('user_id', session.user.id);
      if (error) throw error;
      alert("✅ Preferencias guardadas correctamente.");
    } catch (e) { 
      alert("Error: " + e.message); 
    } finally { 
      setSavingPrefs(false); 
    }
  };

  // Cargar docente y catálogo al montar
  useEffect(() => {
    if (session) {
      const cargarDatos = async () => {
        try {
          let { data: dData, error: dError } = await supabase
            .from('docentes').select('*').eq('user_id', session.user.id).maybeSingle();

          if (!dData && !dError) {
            const nombreSugerido = session.user.user_metadata?.full_name || 
                                   session.user.email.split('@')[0].toUpperCase();
            const { data: nuevoDocente, error: insertError } = await supabase
              .from('docentes')
              .insert([{ user_id: session.user.id, nombre_completo: nombreSugerido, correo: session.user.email }])
              .select().single();
            if (insertError) throw insertError;
            dData = nuevoDocente;
          }

          if (dData) {
            setDocente(dData);
            setPlan(prev => ({
              ...prev,
              ciclo_escolar: dData.ciclo_escolar_pref || prev.ciclo_escolar,
              cicloAmco: dData.ciclo_amco_pref || prev.cicloAmco,
              link_clase: dData.link_clase_pref || prev.link_clase,
              recursos_generales: dData.recursos_pref || prev.recursos_generales,
              libro_id: dData.libro_id_pref || null
            }));

            // ✅ Consulta única relacional: Trae los grupos, y dentro sus cursos, y dentro sus libros.
const { data: gruposData, error: gruposError } = await supabase
  .from('grupos')
  .select(`
    id_grupo,
    cursos (
      libros (
        id_libro,
        nombre_libro
      )
    )
  `)
  .eq('id_docente', dData.id_docente);

if (gruposError) {
  console.error("🚨 Error cargando la información relacional:", gruposError);
} else if (gruposData) {
  const librosMap = {};

  // Extraemos los libros de la respuesta anidada
  gruposData.forEach(grupo => {
    if (grupo.cursos) {
      grupo.cursos.forEach(curso => {
        // Verificamos que el curso tenga un libro asignado y no sea null
        if (curso.libros) {
          librosMap[curso.libros.id_libro] = curso.libros;
        }
      });
    }
  });

  const librosFinales = Object.values(librosMap);
  setLibros(librosFinales);
  
  if (librosFinales.length === 0) {
    console.warn("⚠️ La consulta fue exitosa, pero no se encontraron libros asociados a este docente.");
  }
}

            // Si tiene libro preferido, cargar sus ciclos
            if (dData.libro_id_pref) {
              const { data: temasDelLibro } = await supabase
                .from('temas').select('id_tema').eq('id_libro', dData.libro_id_pref);
              
              if (temasDelLibro && temasDelLibro.length > 0) {
                const ids = temasDelLibro.map(t => t.id_tema);
                const { data: temasConCiclos } = await supabase
                  .from('tema_ciclos')
                  .select('id_ciclo, ciclos(id_ciclo, nombre_ciclo)')
                  .in('id_tema', ids);
                
                if (temasConCiclos) {
                  const ciclosUnicos = {};
                  temasConCiclos.forEach(tc => {
                    if (tc.ciclos) ciclosUnicos[tc.ciclos.id_ciclo] = tc.ciclos.nombre_ciclo;
                  });
                  setCiclosDisponibles(Object.values(ciclosUnicos));
                }
              }
            }
          }

          // Cargar catálogo
          const { data: cData } = await supabase
            .from('contenido_temas')
            .select('*, temas(id_materia, tema, materias(campo_formativo))');

          if (cData) {
            setCatalog(cData.map(ct => ({
              ...ct,
              campo_formativo: ct.temas?.materias?.campo_formativo || '',
              tema: ct.temas?.tema || ''
            })));
          }

        } catch (err) {
          console.error("Error en la carga inicial:", err.message);
        } finally {
          setLoading(false);
        }
      };
      cargarDatos();
    }
  }, [session]);

  // Cargar temas filtrados por libro + ciclo
  useEffect(() => {
    const cargarTemasFiltratos = async () => {
      if (!plan.libro_id || !plan.cicloAmco) {
        setTemasDisponibles(catalog);
        return;
      }

      try {
        const { data: temasDelLibro } = await supabase
          .from('temas').select('id_tema').eq('id_libro', plan.libro_id);

        if (!temasDelLibro || temasDelLibro.length === 0) { setTemasDisponibles(catalog); return; }

        const idsTemasDelLibro = temasDelLibro.map(t => t.id_tema);

        const { data: cicloSeleccionado } = await supabase
          .from('ciclos').select('id_ciclo').eq('nombre_ciclo', plan.cicloAmco).single();

        if (!cicloSeleccionado) { setTemasDisponibles(catalog); return; }

        const { data: temasEnCiclo } = await supabase
          .from('tema_ciclos').select('id_tema')
          .eq('id_ciclo', cicloSeleccionado.id_ciclo)
          .in('id_tema', idsTemasDelLibro);

        if (!temasEnCiclo || temasEnCiclo.length === 0) { setTemasDisponibles(catalog); return; }

        const idsTemasEnCiclo = temasEnCiclo.map(t => t.id_tema);

        const { data: contenidoFiltrado } = await supabase
          .from('contenido_temas')
          .select('*, temas(id_materia, tema, materias(campo_formativo))')
          .in('id_tema', idsTemasEnCiclo);

        if (contenidoFiltrado) {
          setTemasDisponibles(contenidoFiltrado.map(ct => ({
            ...ct,
            campo_formativo: ct.temas?.materias?.campo_formativo || '',
            tema: ct.temas?.tema || ''
          })));
        } else {
          setTemasDisponibles(catalog);
        }
      } catch (err) {
        console.error('Error al cargar temas filtrados:', err.message);
        setTemasDisponibles(catalog);
      }
    };

    cargarTemasFiltratos();
  }, [plan.libro_id, plan.cicloAmco, catalog]);

  return {
    plan, setPlan, sessions, setSessions, docente, setDocente,
    loading, savingPrefs, catalog, temasDisponibles, libros, ciclosDisponibles,
    generarRangoTexto, actualizarFechasSesiones, addMateria, moverMateria,
    removeMateria, autoRellenar, updateMateria, updateSessionLogistics,
    guardarPreferencias, seleccionarLibro
  };
}