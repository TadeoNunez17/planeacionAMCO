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

    // Iteramos por todos los días del rango sin excepciones
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
    // Usamos una función de actualización para asegurar que trabajamos con el estado más reciente
    setSessions((prevSessions) => {
      // 1. Clonamos el array de sesiones
      const nuevas = [...prevSessions];
      
      // 2. Definimos la nueva materia (todos los campos vacíos como pediste)
      const nuevaMateria = {
        hora: "", 
        campo: "",
        tema: "", 
        pagina: "", 
        recursos_materia: "", 
        eje_ambito: "", 
        aprendizaje: "", 
        im: "", 
        concepto_evaluar: "", 
        inicio: "", 
        desarrollo: "", 
        cierre: ""
      };

      // 3. Verificamos que el día (sIdx) exista antes de empujar la materia
      if (nuevas[sIdx]) {
        // Clonamos el array de materias del día específico para mantener inmutabilidad
        nuevas[sIdx] = {
          ...nuevas[sIdx],
          materias: [...nuevas[sIdx].materias, nuevaMateria]
        };
      }

      return nuevas;
    });
  };
  const removeMateria = (sIdx, mIdx) => {
    setSessions((prevSessions) => {
      // Creamos una copia profunda de las sesiones
      const nuevas = [...prevSessions];
      // Filtramos las materias del día específico (sIdx) 
      // manteniendo solo las que NO coincidan con el índice seleccionado (mIdx)
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
        tema: datosBD.tema, 
        pagina: datosBD.pagina || "",
        recursos_materia: datosBD.recursos_materia || "", 
        eje_ambito: datosBD.eje_ambito || "",
        aprendizaje: datosBD.aprendizaje || "", 
        im: datosBD.im || "",
        concepto_evaluar: datosBD.concepto_evaluar || "", 
        inicio: datosBD.inicio || "",
        desarrollo: datosBD.desarrollo || "", 
        cierre: datosBD.cierre || ""
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
      // Obtener todos los temas del libro seleccionado
      const { data: temasDelLibro } = await supabase
        .from('temas')
        .select('id_tema')
        .eq('id_libro', libroId);

      if (temasDelLibro && temasDelLibro.length > 0) {
        const idsTemasDelLibro = temasDelLibro.map(t => t.id_tema);
        
        // Obtener ciclos únicos de esos temas a través de tema_ciclos
        const { data: temasConCiclos } = await supabase
          .from('tema_ciclos')
          .select('id_ciclo, ciclos(id_ciclo, nombre_ciclo)')
          .in('id_tema', idsTemasDelLibro);

        if (temasConCiclos) {
          // Extraer ciclos únicos
          const ciclosUnicos = {};
          temasConCiclos.forEach(tc => {
            if (tc.ciclos) {
              ciclosUnicos[tc.ciclos.id_ciclo] = tc.ciclos.nombre_ciclo;
            }
          });
          const ciclos = Object.values(ciclosUnicos);
          setCiclosDisponibles(ciclos);
          
          // Si el ciclo actual no existe en el libro nuevo, cambiar al primero disponible
          if (!ciclos.includes(plan.cicloAmco) && ciclos.length > 0) {
            setPlan({
              ...plan,
              libro_id: libroId,
              cicloAmco: ciclos[0]
            });
          } else {
            setPlan({
              ...plan,
              libro_id: libroId
            });
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
    } catch (e) { alert("Error: " + e.message); } 
    finally { setSavingPrefs(false); }
  };

  // Cargar docente y catálogo al montar
  useEffect(() => {
    if (session) {
      const cargarDatos = async () => {
        try {
          // Intentamos buscar al docente
          let { data: dData, error: dError } = await supabase
            .from('docentes')
            .select('*')
            .eq('user_id', session.user.id)
            .maybeSingle();

          // SI NO EXISTE, LO CREAMOS AUTOMÁTICAMENTE (SOLUCIÓN DEFINITIVA)
          if (!dData && !dError) {
            console.log("Docente nuevo detectado. Creando registro oficial...");
            
            // Extraemos nombre del correo o metadatos
            const nombreSugerido = session.user.user_metadata?.full_name || 
                                 session.user.email.split('@')[0].toUpperCase();

            const { data: nuevoDocente, error: insertError } = await supabase
              .from('docentes')
              .insert([
                { 
                  user_id: session.user.id, 
                  nombre_completo: nombreSugerido,
                  correo: session.user.email 
                }
              ])
              .select()
              .single();

            if (insertError) throw insertError;
            dData = nuevoDocente; // Ahora ya tenemos datos oficiales
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
          }

          // Cargar catálogo de materias con relaciones
          const { data: cData } = await supabase.from('contenido_temas').select('*, temas(id_materia, tema, materias(campo_formativo))');
          if (cData) {
            // Aplanar la estructura para que autoRellenar pueda buscar correctamente
            const catalogAplanado = cData.map(ct => ({
              ...ct,
              campo_formativo: ct.temas?.materias?.campo_formativo || '',
              tema: ct.temas?.tema || ''
            }));
            setCatalog(catalogAplanado);
          }

          // Cargar libros disponibles
          const { data: librosData } = await supabase.from('libros').select('*');
          if (librosData) {
            setLibros(librosData);
            
            // Si el docente tiene un libro preferido, cargar sus ciclos
            if (dData?.libro_id_pref) {
              const temasDelLibro = await supabase
                .from('temas')
                .select('id_tema')
                .eq('id_libro', dData.libro_id_pref);
              
              if (temasDelLibro.data && temasDelLibro.data.length > 0) {
                const idsTemasDelLibro = temasDelLibro.data.map(t => t.id_tema);
                
                const { data: temasConCiclos } = await supabase
                  .from('tema_ciclos')
                  .select('id_ciclo, ciclos(id_ciclo, nombre_ciclo)')
                  .in('id_tema', idsTemasDelLibro);
                
                if (temasConCiclos) {
                  const ciclosUnicos = {};
                  temasConCiclos.forEach(tc => {
                    if (tc.ciclos) {
                      ciclosUnicos[tc.ciclos.id_ciclo] = tc.ciclos.nombre_ciclo;
                    }
                  });
                  setCiclosDisponibles(Object.values(ciclosUnicos));
                }
              }
            }
          }

        } catch (err) {
          console.error("Error en el auto-registro:", err.message);
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
        // Si no hay libro o ciclo seleccionados, mostrar catálogo completo
        setTemasDisponibles(catalog);
        return;
      }

      try {
        // 1. Obtener todos los temas del libro seleccionado
        const { data: temasDelLibro } = await supabase
          .from('temas')
          .select('id_tema')
          .eq('id_libro', plan.libro_id);

        if (!temasDelLibro || temasDelLibro.length === 0) {
          setTemasDisponibles(catalog);
          return;
        }

        const idsTemasDelLibro = temasDelLibro.map(t => t.id_tema);

        // 2. Obtener el id del ciclo seleccionado
        const { data: cicloSeleccionado } = await supabase
          .from('ciclos')
          .select('id_ciclo')
          .eq('nombre_ciclo', plan.cicloAmco)
          .single();

        if (!cicloSeleccionado) {
          setTemasDisponibles(catalog);
          return;
        }

        // 3. Obtener temas que están en el ciclo seleccionado
        const { data: temasEnCiclo } = await supabase
          .from('tema_ciclos')
          .select('id_tema')
          .eq('id_ciclo', cicloSeleccionado.id_ciclo)
          .in('id_tema', idsTemasDelLibro);

        if (!temasEnCiclo || temasEnCiclo.length === 0) {
          setTemasDisponibles(catalog);
          return;
        }

        const idsTemasEnCiclo = temasEnCiclo.map(t => t.id_tema);

        // 4. Obtener el contenido de esos temas
        const { data: contenigoFiltrado } = await supabase
          .from('contenido_temas')
          .select('*, temas(id_materia, tema, materias(campo_formativo))')
          .in('id_tema', idsTemasEnCiclo);

        if (contenigoFiltrado) {
          // Aplanar la estructura para que sea compatible con lo que StepPlaneacion espera
          const temasConCampo = contenigoFiltrado.map(ct => ({
            ...ct,
            campo_formativo: ct.temas?.materias?.campo_formativo || '',
            tema: ct.temas?.tema || ''
          }));
          setTemasDisponibles(temasConCampo);
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
    plan,
    setPlan,
    sessions,
    setSessions,
    docente,
    setDocente,
    loading,
    savingPrefs,
    catalog,
    temasDisponibles,
    libros,
    ciclosDisponibles,
    generarRangoTexto,
    actualizarFechasSesiones,
    addMateria,
    moverMateria,
    removeMateria,
    autoRellenar,
    updateMateria,
    updateSessionLogistics,
    guardarPreferencias,
    seleccionarLibro
  };
}
