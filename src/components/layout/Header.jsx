import React from 'react';
import { School, LogOut, Shield } from 'lucide-react';
import { supabase } from '../../supabaseClient';

export default function Header({ onAdmin }) {
  return (
    <header className="bg-indigo-950 text-white p-4 sticky top-0 z-50 flex justify-between items-center shadow-lg">
      <div className="flex items-center gap-2">
        <School className="text-indigo-400 w-6 h-6" />
        <h1 className="text-sm font-black uppercase tracking-wider">Prescolar Mercurio</h1>
      </div>
      <div className="flex items-center gap-3">
        {onAdmin && (
          <button
            onClick={onAdmin}
            className="flex items-center gap-2 bg-indigo-800 hover:bg-indigo-700 text-white text-sm px-3 py-1.5 rounded-lg transition-colors"
            title="Panel de Administrador"
          >
            <Shield className="w-4 h-4" />
            Admin
          </button>
        )}
        <button 
          onClick={() => supabase.auth.signOut()} 
          className="text-slate-400 hover:text-white transition-colors" 
          title="Cerrar sesión"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
