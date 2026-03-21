import React, { useState } from 'react';
import { supabase } from '../supabaseClient'; 

const FormularioSemana = ({ docenteId, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [semana, setSemana] = useState({
    ciclo_escolar: '2025-2026',
    ciclo_amco: 'CICLO 4',
    rango_fechas: '',
    fecha_inicio: '',
    fecha_fin: '',
    material_s1: 'AMCO, IPAD, LÁPIZ, CRAYOLAS'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!docenteId) return alert("Error: No se detectó ID de docente.");
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('planeaciones_semanales')
        .insert([{ id_docente: docenteId, ...semana }])
        .select();

      if (error) throw error;

      alert("✅ ¡Semana guardada con éxito!");
      if (onSuccess) onSuccess(data[0]); 
    } catch (error) {
      alert("Error al guardar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="status-card" style={{ textAlign: 'left', marginTop: '20px' }}>
      <h3>📅 Registrar Nueva Semana</h3>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        
        <label>Rango (ej: 23 - 27 de Marzo):</label>
        <input 
          type="text" 
          placeholder="Escribe el rango de días..."
          value={semana.rango_fechas}
          onChange={(e) => setSemana({...semana, rango_fechas: e.target.value})}
          required 
        />

        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ flex: 1 }}>
            <label>Fecha Inicio:</label>
            <input type="date" style={{ width: '100%' }} onChange={(e) => setSemana({...semana, fecha_inicio: e.target.value})} required />
          </div>
          <div style={{ flex: 1 }}>
            <label>Fecha Fin:</label>
            <input type="date" style={{ width: '100%' }} onChange={(e) => setSemana({...semana, fecha_fin: e.target.value})} required />
          </div>
        </div>

        <button type="submit" className="counter" disabled={loading} style={{ background: '#2196F3', color: 'white' }}>
          {loading ? 'Guardando...' : 'Confirmar Semana en BD'}
        </button>
      </form>
    </div>
  );
};

export default FormularioSemana;