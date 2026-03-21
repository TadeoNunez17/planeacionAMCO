import React from 'react';
import { FileText, Download, CloudUpload, Sparkles } from 'lucide-react';
import { COLORES, MESES } from '../../constants';
import { downloadDoc } from '../../services/docService';

export default function StepVistaPrevia({ 
  sessions, 
  plan, 
  docente,
  onBack,
  onEdit 
}) {
  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div className="bg-white rounded-[2rem] p-8 shadow-xl text-center border">
        <h2 className="text-2xl font-black text-indigo-950 flex justify-center items-center gap-2">
          <FileText /> Vista Previa
        </h2>
        <div className="mt-6 flex justify-center gap-4">
          <button 
            onClick={onEdit} 
            className="bg-slate-100 text-slate-600 font-black py-4 px-8 rounded-2xl text-sm hover:bg-slate-200 transition-all"
          >
            Editar
          </button>
          <button 
            onClick={() => downloadDoc({ sessions, plan, docente })} 
            className="bg-indigo-600 text-white font-black py-4 px-8 rounded-2xl shadow-xl text-sm hover:bg-indigo-700 transition-all flex items-center gap-2"
          >
            <Download className="w-5 h-5"/> Descargar Word
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md border p-12 max-w-4xl mx-auto">
        <div className="border-b-2 border-indigo-950 pb-6 mb-8 text-center">
          <h1 className="text-2xl font-black uppercase tracking-widest text-indigo-950">
            Planeación Semanal Mercurio
          </h1>
          <div className="grid grid-cols-2 gap-y-3 text-[10px] text-slate-700 mt-4 text-left">
            <p><b>Docente:</b> {docente?.nombre_completo}</p>
            <p className="text-right"><b>Semana:</b> {plan.rango_fechas}</p>
            <p><b>Ciclo:</b> {plan.ciclo_escolar} | <b>AMCO:</b> {plan.cicloAmco}</p>
            <p className="text-right"><b>Clave:</b> {plan.clave} | <b>Link:</b> {plan.link_clase || "NO APLICA"}</p>
          </div>
        </div>

        {sessions.filter(s => s.materias.length > 0).map((s, idx) => (
          <div key={idx} className="mb-10">
            <div className="bg-indigo-50 p-3 mb-4 rounded flex justify-between items-center">
              <h2 className="text-sm font-black text-indigo-900 uppercase">
                {s.dia} - {s.fecha_exacta}
              </h2>
            </div>
            <div className="space-y-6 pl-4 border-l-2">
              {s.materias.map((m, mIdx) => (
                <div key={mIdx}>
                  <h3 className="font-black text-xs mb-2" style={{ color: COLORES[m.campo] }}>
                    {m.hora} | {m.campo}: {m.tema}
                  </h3>
                  <div className="text-[9px] text-slate-600 space-y-2 text-justify">
                    <p><strong>INICIO:</strong> {m.inicio}</p>
                    <p><strong>DESARROLLO:</strong> {m.desarrollo}</p>
                    <p><strong>CIERRE:</strong> {m.cierre}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-4 justify-center">
        <button 
          onClick={onBack}
          className="bg-slate-100 text-slate-600 font-black py-5 px-10 rounded-full shadow-lg hover:bg-slate-200 transition-all text-sm flex items-center gap-3"
        >
          Atrás
        </button>
        <button 
          onClick={() => alert("Próximamente: Subir AMCO")} 
          className="bg-emerald-600 text-white font-black py-5 px-10 rounded-full shadow-lg hover:bg-emerald-700 transition-all text-sm flex items-center gap-3"
        >
          <CloudUpload /> Subir AMCO
        </button>
        <button 
          onClick={() => downloadDoc({ sessions, plan, docente })} 
          className="bg-indigo-600 text-white font-black py-5 px-10 rounded-full shadow-lg hover:bg-indigo-700 transition-all text-sm flex items-center gap-3"
        >
          <Download /> Confirmar e Imprimir
        </button>
      </div>
    </div>
  );
}
