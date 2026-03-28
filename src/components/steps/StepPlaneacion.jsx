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
  removeMateria, // Asegúrate de recibir esta prop desde App.jsx
  autoRellenar,
  updateMateria,
  updateSessionLogistics,
  temasDisponibles, // Usamos los temas filtrados por libro/ciclo
  onBack,
  onNext 
}) {
  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      {/* Selector de Días */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {sessions.map((s, idx) => (
          <button 
            key={idx} 
            onClick={() => setActiveSession(idx)} 
            className={`px-6 py-3 rounded-2xl font-black text-[10px] transition-all min-w-max uppercase ${
              activeSession === idx 
                ? 'bg-indigo-600 text-white shadow-lg scale-105' 
                : 'bg-white text-slate-400 hover:bg-slate-50'
            }`}
          >
            {s.dia}
          </button>
        ))}
      </div>

      {sessions[activeSession] && (
        <div className="bg-white rounded-[2.5rem] p-6 shadow-2xl border border-slate-100 min-h-[500px]">
          {/* Logística del Día */}
          <div className="mb-8 p-5 bg-slate-50 rounded-3xl border border-slate-100 grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Fecha del día</label>
              <input 
                className="w-full p-3 bg-white rounded-2xl border border-slate-200 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all" 
                value={sessions[activeSession].fecha_exacta} 
                onChange={e => updateSessionLogistics(activeSession, 'fecha_exacta', e.target.value)} 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Tema Principal</label>
              <input 
                className="w-full p-3 bg-white rounded-2xl border border-slate-200 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all" 
                placeholder="Ej. Los animales"
                value={sessions[activeSession].tema_relevancia} 
                onChange={e => updateSessionLogistics(activeSession, 'tema_relevancia', e.target.value)} 
              />
            </div>
          </div>

          {/* Lista de Materias/Clases */}
          <div className="space-y-8">
            {sessions[activeSession].materias.map((m, mIdx) => (
              <div key={mIdx} className="group bg-white rounded-[2rem] p-6 border border-slate-200 relative shadow-sm hover:shadow-md transition-all">
                {/* Barra lateral de color */}
                <div className="absolute top-0 left-0 w-2 h-full rounded-l-[2rem]" style={{ backgroundColor: COLORES[m.campo] || '#e2e8f0' }} />
                
                <div className="flex justify-between items-center mb-6">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-400 uppercase mb-1">Campo Formativo</span>
                    <select 
                      className="bg-transparent outline-none font-black text-sm uppercase cursor-pointer" 
                      style={{ color: COLORES[m.campo] || '#64748b' }} 
                      value={m.campo} 
                      onChange={(e) => updateMateria(activeSession, mIdx, 'campo', e.target.value)}
                    >
                      <option value="">-- Seleccionar Materia --</option>
                      {Object.keys(COLORES).map(c => (
                        <option key={c} value={c} className="text-slate-700">{c}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Nueva Botonera Moderna (Style Toolbar) */}
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-1.5 shadow-sm">
                    <button 
                      onClick={() => moverMateria(activeSession, mIdx, -1)} 
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all"
                      title="Mover arriba"
                    >
                      <ChevronUp size={18}/>
                    </button>
                    <div className="w-[1px] h-4 bg-slate-200 mx-1" />
                    <button 
                      onClick={() => moverMateria(activeSession, mIdx, 1)} 
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all"
                      title="Mover abajo"
                    >
                      <ChevronDown size={18}/>
                    </button>
                    <div className="w-[1px] h-4 bg-slate-200 mx-1" />
                    <button 
                      onClick={() => removeMateria(activeSession, mIdx)} 
                      className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      title="Eliminar clase"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Selectores de Tema y Hora */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="md:col-span-2">
                    <label className="text-[9px] font-bold text-slate-400 uppercase mb-1 block">Seleccionar Tema del Catálogo</label>
                    <select 
                      disabled={!m.campo}
                      className={`w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none transition-all ${!m.campo ? 'opacity-50 cursor-not-allowed' : 'hover:border-indigo-300 focus:border-indigo-500'}`} 
                      value={m.tema} 
                      onChange={(e) => autoRellenar(activeSession, mIdx, e.target.value)}
                    >
                      <option value="">{m.campo ? '-- Elige un tema --' : 'Primero selecciona materia'}</option>
                      {(temasDisponibles || []).filter(t => t.campo_formativo === m.campo).map((t, i) => (
                        <option key={i} value={t.tema}>{t.tema}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase mb-1 block">Horario</label>
                    <select 
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none hover:border-indigo-300 transition-all" 
                      value={m.hora} 
                      onChange={(e) => updateMateria(activeSession, mIdx, 'hora', e.target.value)}
                    >
                      <option value="">-- Hora --</option>
                      {TIME_SLOTS.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Campos de Contenido */}
                {m.campo && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    {/* Fila 1: Aprendizaje y Eje */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold uppercase text-slate-400 ml-1">Aprendizaje Esperado</span>
                        <AutoResizingTextarea 
                          placeholder="Contenido del aprendizaje..."
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] outline-none focus:ring-2 focus:ring-indigo-500/10" 
                          value={m.aprendizaje} 
                          onChange={e => updateMateria(activeSession, mIdx, 'aprendizaje', e.target.value)} 
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold uppercase text-slate-400 ml-1">Eje / Ámbito</span>
                        <AutoResizingTextarea 
                          placeholder="Eje temático..."
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] outline-none focus:ring-2 focus:ring-indigo-500/10" 
                          value={m.eje_ambito} 
                          onChange={e => updateMateria(activeSession, mIdx, 'eje_ambito', e.target.value)} 
                        />
                      </div>
                    </div>

                    {/* Fila 2: NUEVOS CAMPOS (Página, IM, Concepto) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold uppercase text-slate-400 ml-1">Página(s)</span>
                        <input 
                          type="text"
                          placeholder="Ej. 1, 2, 3..."
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] outline-none focus:ring-2 focus:ring-indigo-500/10" 
                          value={m.pagina} 
                          onChange={e => updateMateria(activeSession, mIdx, 'pagina', e.target.value)} 
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold uppercase text-slate-400 ml-1">I.M. (Inteligencias)</span>
                        <input 
                          type="text"
                          placeholder="Ej. VL, VE, K..."
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] outline-none focus:ring-2 focus:ring-indigo-500/10" 
                          value={m.im} 
                          onChange={e => updateMateria(activeSession, mIdx, 'im', e.target.value)} 
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold uppercase text-slate-400 ml-1">Concepto a Evaluar (HBP)</span>
                        <input 
                          type="text"
                          placeholder="Ej. Observar, Relacionar..."
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] outline-none focus:ring-2 focus:ring-indigo-500/10" 
                          value={m.concepto_evaluar} 
                          onChange={e => updateMateria(activeSession, mIdx, 'concepto_evaluar', e.target.value)} 
                        />
                      </div>
                    </div>

                    {/* Fila 3: Recursos */}
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold uppercase text-slate-400 ml-1">Recursos de la Materia</span>
                      <input 
                        type="text"
                        placeholder="Materiales específicos..."
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] outline-none focus:ring-2 focus:ring-indigo-500/10" 
                        value={m.recursos_materia} 
                        onChange={e => updateMateria(activeSession, mIdx, 'recursos_materia', e.target.value)} 
                      />
                    </div>

                    {/* Fases de la Sesión */}
                    <div className="grid grid-cols-1 gap-4">
                      {['inicio', 'desarrollo', 'cierre'].map((fase) => (
                        <div key={fase} className="space-y-1">
                          <label className="text-[9px] font-bold uppercase text-slate-400 ml-1">{fase}</label>
                          <AutoResizingTextarea 
                            value={m[fase]} 
                            placeholder={`Actividades de ${fase}...`}
                            onChange={e => updateMateria(activeSession, mIdx, fase, e.target.value)} 
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] outline-none focus:border-indigo-400 focus:bg-white transition-all" 
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Botón de Acción Principal */}
          <button 
            onClick={() => addMateria(activeSession)} 
            className="w-full mt-8 bg-indigo-50 text-indigo-600 py-4 rounded-2xl text-xs font-black flex items-center justify-center gap-2 hover:bg-indigo-600 hover:text-white transition-all shadow-sm active:scale-95"
          >
            <Plus className="w-5 h-5"/> AGREGAR NUEVA CLASE
          </button>

          {/* Navegación entre Pasos */}
          <div className="mt-12 flex gap-4 border-t border-slate-100 pt-8">
            <button 
              onClick={onBack} 
              className="px-8 py-4 bg-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase hover:bg-slate-200 transition-all"
            >
              Atrás
            </button>
            <button 
              onClick={onNext} 
              className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black text-[10px] shadow-xl shadow-indigo-200 uppercase hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
            >
              Generar Vista Previa <Sparkles className="w-4 h-4"/>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}