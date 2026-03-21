import React from 'react';
import { Database, Plus, Save, Loader2, Sparkles } from 'lucide-react';

export default function StepLogistica({ 
  plan, 
  setPlan, 
  generarRangoTexto, 
  actualizarFechasSesiones, 
  guardarPreferencias,
  savingPrefs,
  libros,
  ciclosDisponibles,
  seleccionarLibro,
  onNext 
}) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-200 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-black text-indigo-900 flex items-center gap-2">
          <Database className="w-5 h-5" /> Logística de la Semana
        </h2>
        <button 
          onClick={guardarPreferencias} 
          disabled={savingPrefs} 
          className="text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl flex items-center gap-1 hover:bg-emerald-100 transition-colors"
        >
          {savingPrefs ? <Loader2 className="w-3 h-3 animate-spin"/> : <Save className="w-3 h-3"/>} Guardar como predeterminado
        </button>
      </div>
      
      <div className="space-y-5">
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase ml-1">Del día (Inicio):</span>
              <input 
                type="date" 
                className="w-full p-4 bg-white rounded-xl ring-1 ring-slate-200 font-bold outline-none focus:ring-indigo-300 transition-all" 
                value={plan.fecha_inicio} 
                onChange={(e) => {
                  const n = e.target.value; 
                  setPlan({...plan, fecha_inicio: n, rango_fechas: generarRangoTexto(n, plan.fecha_fin)});
                  actualizarFechasSesiones(n, plan.fecha_fin);
                }} 
              />
            </div>
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase ml-1">Al día (Fin):</span>
              <input 
                type="date" 
                className="w-full p-4 bg-white rounded-xl ring-1 ring-slate-200 font-bold outline-none focus:ring-indigo-300 transition-all" 
                value={plan.fecha_fin} 
                onChange={(e) => {
                  const n = e.target.value; 
                  setPlan({...plan, fecha_fin: n, rango_fechas: generarRangoTexto(plan.fecha_inicio, n)});
                  actualizarFechasSesiones(plan.fecha_inicio, n);
                }} 
              />
            </div>
          </div>
          {plan.rango_fechas && (
            <p className="mt-3 text-xs font-bold text-indigo-600 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> {plan.rango_fechas}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Seleccionar Libro</label>
            <select 
              className="w-full p-4 bg-slate-50 rounded-2xl ring-1 ring-slate-200 font-bold outline-none text-sm focus:ring-indigo-300 transition-all" 
              value={plan.libro_id || ''} 
              onChange={(e) => {
                if (e.target.value) {
                  seleccionarLibro(parseInt(e.target.value));
                } else {
                  setPlan({...plan, libro_id: null});
                }
              }}
            >
              <option value="">-- Seleccionar libro --</option>
              {libros.map((libro) => (
                <option key={libro.id_libro} value={libro.id_libro}>{libro.nombre_libro}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Ciclo AMCO</label>
            <select 
              className="w-full p-4 bg-slate-50 rounded-2xl ring-1 ring-slate-200 font-bold outline-none text-sm focus:ring-indigo-300 transition-all" 
              value={plan.cicloAmco} 
              onChange={e => setPlan({...plan, cicloAmco: e.target.value})}
            >
              {ciclosDisponibles.length > 0 ? (
                ciclosDisponibles.map((ciclo) => (
                  <option key={ciclo} value={ciclo}>{ciclo}</option>
                ))
              ) : (
                <option key="no-ciclos" value="">-- Selecciona un libro primero --</option>
              )}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Ciclo Escolar</label>
            <input 
              className="w-full p-4 bg-slate-50 rounded-2xl ring-1 ring-slate-200 font-bold outline-none text-sm" 
              value={plan.ciclo_escolar} 
              onChange={e => setPlan({...plan, ciclo_escolar: e.target.value})} 
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Clave (CCT)</label>
            <input 
              className="w-full p-4 bg-slate-50 rounded-2xl ring-1 ring-slate-200 font-bold outline-none text-sm" 
              value={plan.clave} 
              onChange={e => setPlan({...plan, clave: e.target.value})} 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Link Clase</label>
            <input 
              className="w-full p-4 bg-slate-50 rounded-2xl ring-1 ring-slate-200 font-bold outline-none text-sm" 
              value={plan.link_clase} 
              onChange={e => setPlan({...plan, link_clase: e.target.value})} 
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Recursos Generales</label>
            <input 
              className="w-full p-4 bg-slate-50 rounded-2xl ring-1 ring-slate-200 font-bold outline-none text-sm" 
              value={plan.recursos_generales} 
              onChange={e => setPlan({...plan, recursos_generales: e.target.value})} 
            />
          </div>
        </div>
      </div>

      <button 
        onClick={onNext}
        disabled={!plan.fecha_inicio || !plan.fecha_fin}
        className={`w-full font-black py-5 rounded-2xl shadow-xl mt-8 flex items-center justify-center gap-2 transition-all ${
          !plan.fecha_inicio || !plan.fecha_fin 
            ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
            : 'bg-indigo-600 text-white hover:bg-indigo-700'
        }`}
      >
        <Plus className="w-5 h-5"/> Empezar Planeación
      </button>
    </div>
  );
}
