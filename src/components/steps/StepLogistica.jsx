import React from 'react';
import { Database, Plus, Save, Loader2, Sparkles, Calendar, BookOpen, Layers, Link, Box } from 'lucide-react';

export default function StepLogistica({ plan, setPlan, generarRangoTexto, actualizarFechasSesiones, guardarPreferencias, savingPrefs, libros, ciclosDisponibles, seleccionarLibro, onNext }) {
  const today = new Date().toISOString().split('T')[0];

  const handleDateChange = (e, field) => {
    let selectedDate = e.target.value;
    const dateObj = new Date(selectedDate + "T00:00:00");
    const day = dateObj.getDay();
    if (day === 0 || day === 6) {
      const adj = day === 0 ? 1 : 2;
      dateObj.setDate(dateObj.getDate() + adj);
      selectedDate = dateObj.toISOString().split('T')[0];
    }
    if (field === 'inicio') {
      setPlan({ ...plan, fecha_inicio: selectedDate, rango_fechas: generarRangoTexto(selectedDate, plan.fecha_fin) });
      actualizarFechasSesiones(selectedDate, plan.fecha_fin);
    } else {
      setPlan({ ...plan, fecha_fin: selectedDate, rango_fechas: generarRangoTexto(plan.fecha_inicio, selectedDate) });
      actualizarFechasSesiones(plan.fecha_inicio, selectedDate);
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 max-w-3xl mx-auto">
      <style>{`
        input[type="date"]::-webkit-calendar-picker-indicator {
          background: transparent; bottom: 0; color: transparent; cursor: pointer; height: auto; left: 0; position: absolute; right: 0; top: 0; width: auto; z-index: 10;
        }
      `}</style>

      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-black text-indigo-950 flex items-center gap-2">
          <Database className="w-6 h-6 text-indigo-600" /> Logística de la Semana
        </h2>
        <button onClick={guardarPreferencias} disabled={savingPrefs} className="text-[10px] font-black uppercase bg-emerald-50 text-emerald-600 px-5 py-3 rounded-2xl flex items-center gap-2 hover:bg-emerald-100 transition-all">
          {savingPrefs ? <Loader2 className="w-3 h-3 animate-spin"/> : <Save className="w-3 h-3"/>} Guardar como predeterminado
        </button>
      </div>
      
      <div className="space-y-6">
        <div className="bg-indigo-50/50 p-6 rounded-[2rem] border border-indigo-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative group flex flex-col">
              <span className="text-[10px] font-black text-indigo-400 uppercase ml-2 mb-2 block">Del día (Inicio):</span>
              <div className="relative flex items-center">
                <input type="date" min={today} className="w-full p-4 bg-white rounded-2xl ring-1 ring-indigo-100 font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500 z-20 relative bg-transparent" value={plan.fecha_inicio} onChange={(e) => handleDateChange(e, 'inicio')} />
                <Calendar className="absolute right-4 w-5 h-5 text-indigo-500 z-0" />
              </div>
            </div>
            <div className="relative group flex flex-col">
              <span className="text-[10px] font-black text-indigo-400 uppercase ml-2 mb-2 block">Al día (Fin):</span>
              <div className="relative flex items-center">
                <input type="date" min={plan.fecha_inicio || today} className="w-full p-4 bg-white rounded-2xl ring-1 ring-indigo-100 font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500 z-20 relative bg-transparent" value={plan.fecha_fin} onChange={(e) => handleDateChange(e, 'fin')} />
                <Calendar className="absolute right-4 w-5 h-5 text-indigo-500 z-0" />
              </div>
            </div>
          </div>
          {plan.rango_fechas && (
            <div className="mt-4 inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-indigo-100 text-xs font-bold text-indigo-600 shadow-sm animate-in fade-in zoom-in duration-300">
              <Sparkles className="w-3 h-3" /> {plan.rango_fechas}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2 flex items-center gap-1"><BookOpen className="w-3 h-3" /> Seleccionar Libro</label>
            <select className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent ring-1 ring-slate-200 font-bold outline-none text-sm focus:ring-2 focus:ring-indigo-500 transition-all" value={plan.libro_id || ''} onChange={(e) => seleccionarLibro(parseInt(e.target.value))}>
              <option value="">-- Elige un libro --</option>
              {libros.map((libro) => (<option key={libro.id_libro} value={libro.id_libro}>{libro.nombre_libro}</option>))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2 flex items-center gap-1"><Layers className="w-3 h-3" /> Ciclo AMCO</label>
            <select className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent ring-1 ring-slate-200 font-bold outline-none text-sm focus:ring-2 focus:ring-indigo-500 transition-all" value={plan.cicloAmco} onChange={e => setPlan({...plan, cicloAmco: e.target.value})}>
              {ciclosDisponibles.length > 0 ? ciclosDisponibles.map((ciclo) => (<option key={ciclo} value={ciclo}>{ciclo}</option>)) : (<option value="">-- Selecciona libro primero --</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Ciclo Escolar</label>
            <input className="w-full p-4 bg-slate-50 rounded-2xl ring-1 ring-slate-200 font-bold outline-none text-sm focus:ring-2 focus:ring-indigo-500 transition-all" value={plan.ciclo_escolar} onChange={e => setPlan({...plan, ciclo_escolar: e.target.value})} />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Clave (CCT)</label>
            <input className="w-full p-4 bg-slate-50 rounded-2xl ring-1 ring-slate-200 font-bold outline-none text-sm focus:ring-2 focus:ring-indigo-500 transition-all" value={plan.clave} onChange={e => setPlan({...plan, clave: e.target.value})} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2 flex items-center gap-1"><Link className="w-3 h-3" /> Link Clase</label>
            <input className="w-full p-4 bg-slate-50 rounded-2xl ring-1 ring-slate-200 font-bold outline-none text-sm focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="https://zoom.us/..." value={plan.link_clase} onChange={e => setPlan({...plan, link_clase: e.target.value})} />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2 flex items-center gap-1"><Box className="w-3 h-3" /> Recursos Generales</label>
            <input className="w-full p-4 bg-slate-50 rounded-2xl ring-1 ring-slate-200 font-bold outline-none text-sm focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="Ej. IPAD, LÁPIZ, CRAYOLAS" value={plan.recursos_generales} onChange={e => setPlan({...plan, recursos_generales: e.target.value})} />
          </div>
        </div>
      </div>

      <button onClick={onNext} disabled={!plan.fecha_inicio || !plan.fecha_fin} className={`w-full font-black py-6 rounded-[2rem] shadow-2xl mt-10 flex items-center justify-center gap-3 transition-all ${!plan.fecha_inicio || !plan.fecha_fin ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200 shadow-xl'}`}>
        <Plus className="w-6 h-6"/> Empezar Planeación
      </button>
    </div>
  );
}