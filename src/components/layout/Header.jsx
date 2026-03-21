import React from 'react';
import { School, LogOut } from 'lucide-react';
import { supabase } from '../../supabaseClient';

export default function Header() {
  return (
    <header className="bg-indigo-950 text-white p-4 sticky top-0 z-50 flex justify-end items-center shadow-lg">
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2">
        <School className="text-indigo-400 w-6 h-6" />
        <h1 className="text-sm font-black uppercase tracking-wider">Prescolar Mercurio</h1>
      </div>
      <button 
        onClick={() => supabase.auth.signOut()} 
        className="text-slate-400 hover:text-white relative z-10 transition-colors" 
        title="Cerrar sesión"
      >
        <LogOut className="w-5 h-5" />
      </button>
    </header>
  );
}
