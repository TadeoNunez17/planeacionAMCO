import React from 'react';
import { Plus, ChevronUp, ChevronDown, Trash2, Sparkles } from 'lucide-react';
import { COLORES, TIME_SLOTS } from '../../constants';
import AutoResizingTextarea from '../ui/AutoResizingTextarea';

export default function StepPlaneacion({ 
  sessions, 
  activeSession, 
  setActiveSession,
  addMateria,
  moverMateria,
  autoRellenar,
  updateMateria,
  updateSessionLogistics,
  catalog,
  onBack,
  onNext 
}) {
  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {sessions.map((s, idx) => (
          <button 
            key={idx} 
            onClick={() => setActiveSession(idx)} 
            className={`px-6 py-3 rounded-2xl font-black text-[10px] transition-all min-w-max ${activeSession === idx ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-400'}`}
          >
            {s.dia.toUpperCase()}
          </button>
        ))}
      </div>

      {sessions[activeSession] && (
        <div className="bg-white rounded-[2rem] p-5 shadow-2xl border border-slate-200 min-h-[500px]">
          <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100 grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Fecha Exacta</label>
              <input 
                className="w-full p-3 bg-white rounded-xl ring-1 ring-slate-200 text-sm font-bold outline-none" 
                value={sessions[activeSession].fecha_exacta} 
                onChange={e => updateSessionLogistics(activeSession, 'fecha_exacta', e.target.value)} 
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Tema Relevancia</label>
              <input 
                className="w-full p-3 bg-white rounded-xl ring-1 ring-slate-200 text-sm font-bold outline-none" 
                value={sessions[activeSession].tema_relevancia} 
                onChange={e => updateSessionLogistics(activeSession, 'tema_relevancia', e.target.value)} 
              />
            </div>
          </div>

          <div className="space-y-6">
            {sessions[activeSession].materias.map((m, mIdx) => (
              <div key={mIdx} className="bg-slate-50 rounded-[2rem] p-5 border border-slate-200 relative overflow-hidden shadow-sm">
                <div className="absolute top-0 left-0 w-1.5 h-full" style={{ backgroundColor: COLORES[m.campo] }} />
                
                <div className="flex justify-between items-center mb-4 text-xs font-black">
                  <select 
                    className="bg-transparent outline-none" 
                    style={{ color: COLORES[m.campo] }} 
                    value={m.campo} 
                    onChange={(e) => updateMateria(activeSession, mIdx, 'campo', e.target.value)}
                  >
                    {Object.keys(COLORES).map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => moverMateria(activeSession, mIdx, -1)} 
                      className="p-1 bg-white rounded border hover:text-indigo-600"
                    >
                      <ChevronUp className="w-4 h-4"/>
                    </button>
                    <button 
                      onClick={() => moverMateria(activeSession, mIdx, 1)} 
                      className="p-1 bg-white rounded border hover:text-indigo-600"
                    >
                      <ChevronDown className="w-4 h-4"/>
                    </button>
                    <button 
                      onClick={() => { 
                        const n = [...sessions]; 
                        n[activeSession].materias.splice(mIdx, 1); 
                        setActiveSession(activeSession);
                      }} 
                      className="text-slate-300 hover:text-red-500 ml-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <select 
                    className="col-span-2 p-3 bg-white border rounded-xl text-xs font-bold outline-none" 
                    value={m.tema} 
                    onChange={(e) => autoRellenar(activeSession, mIdx, e.target.value)}
                  >
                    <option value="">-- Buscar tema --</option>
                    {catalog.filter(t => t.campo_formativo === m.campo).map((t, i) => (
                      <option key={i} value={t.tema}>{t.tema}</option>
                    ))}
                  </select>
                  <select 
                    className="p-3 bg-white border rounded-xl text-xs font-bold outline-none" 
                    value={m.hora} 
                    onChange={(e) => updateMateria(activeSession, mIdx, 'hora', e.target.value)}
                  >
                    {TIME_SLOTS.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                {m.tema && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-[9px] font-bold uppercase text-slate-400">
                      <div>
                        Aprendizaje
                        <input 
                          className="w-full p-2 bg-white border rounded mt-1 text-slate-700" 
                          value={m.aprendizaje} 
                          onChange={e => updateMateria(activeSession, mIdx, 'aprendizaje', e.target.value)} 
                        />
                      </div>
                      <div>
                        Eje
                        <input 
                          className="w-full p-2 bg-white border rounded mt-1 text-slate-700" 
                          value={m.eje_ambito} 
                          onChange={e => updateMateria(activeSession, mIdx, 'eje_ambito', e.target.value)} 
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[9px] font-bold uppercase text-slate-400">Inicio</label>
                      <AutoResizingTextarea 
                        value={m.inicio} 
                        onChange={e => updateMateria(activeSession, mIdx, 'inicio', e.target.value)} 
                        className="w-full p-3 bg-white border rounded-xl text-[11px] outline-none" 
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold uppercase text-slate-400">Desarrollo</label>
                      <AutoResizingTextarea 
                        value={m.desarrollo} 
                        onChange={e => updateMateria(activeSession, mIdx, 'desarrollo', e.target.value)} 
                        className="w-full p-3 bg-white border rounded-xl text-[11px] outline-none" 
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold uppercase text-slate-400">Cierre</label>
                      <AutoResizingTextarea 
                        value={m.cierre} 
                        onChange={e => updateMateria(activeSession, mIdx, 'cierre', e.target.value)} 
                        className="w-full p-3 bg-white border rounded-xl text-[11px] outline-none" 
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <button 
            onClick={() => addMateria(activeSession)} 
            className="w-full mt-4 bg-indigo-50 text-indigo-600 py-3 rounded-xl text-xs font-black flex items-center justify-center gap-1 hover:bg-indigo-100 transition-colors"
          >
            <Plus className="w-4 h-4"/> Agregar Clase
          </button>

          <div className="mt-10 flex gap-3 border-t pt-6">
            <button 
              onClick={onBack} 
              className="px-5 py-4 bg-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase"
            >
              Atrás
            </button>
            <button 
              onClick={onNext} 
              className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black text-[10px] shadow-xl uppercase hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
            >
              Vista Previa <Sparkles className="w-4 h-4"/>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
