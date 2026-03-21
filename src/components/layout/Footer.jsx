import React from 'react';
import { User } from 'lucide-react';

export default function Footer({ docente }) {
  return (
    <footer className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-md border-t border-slate-200 p-2 z-50">
      <div className="max-w-4xl mx-auto flex justify-center items-center">
        <div className="flex items-center gap-3 px-5 py-1.5 bg-indigo-50 rounded-full border border-indigo-100 shadow-sm">
          {/* Luz de estado */}
          <div className={`w-2 h-2 rounded-full ${docente ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400 animate-bounce'}`}></div>
          
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
            Sesión activa: 
            <span className="text-indigo-600 font-black">
              {docente?.nombre_completo ? docente.nombre_completo.toUpperCase() : "IDENTIFICANDO DOCENTE..."}
            </span>
          </span>
        </div>
      </div>
    </footer>
  );
}
