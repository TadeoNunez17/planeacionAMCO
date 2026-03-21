import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { Lock, Mail, Loader2 } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert("Error: " + error.message);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-indigo-950 p-6">
      <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl border border-white/20">
        <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 mx-auto">
          <Lock className="text-indigo-600 w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-center text-indigo-950 mb-2">Acceso Admin</h2>
        <p className="text-slate-400 text-[10px] text-center font-bold uppercase tracking-widest mb-8">Preescolar Mercurio</p>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
            <input 
              type="email" 
              placeholder="Correo electrónico" 
              className="w-full bg-slate-50 border-0 ring-1 ring-slate-100 rounded-2xl p-4 pl-12 text-sm font-bold outline-none focus:ring-indigo-500 transition-all" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
            <input 
              type="password" 
              placeholder="Contraseña" 
              className="w-full bg-slate-50 border-0 ring-1 ring-slate-100 rounded-2xl p-4 pl-12 text-sm font-bold outline-none focus:ring-indigo-500 transition-all" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Iniciar Sesión"}
          </button>
        </form>
      </div>
    </div>
  );
}
