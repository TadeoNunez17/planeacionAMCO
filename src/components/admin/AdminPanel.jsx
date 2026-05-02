import React, { useState } from 'react';
import { School, Users, BookOpen, Link2, ArrowLeft, BarChart3 } from 'lucide-react';
import AdminDocentes from './AdminDocentes';
import AdminLibros from './AdminLibros';
import AdminGrupos from './AdminGrupos';
import { useAdmin } from '../../hooks/useAdmin';

export default function AdminPanel({ onVolver }) {
  const {
    activeSection,
    setActiveSection,
    docentes,
    libros,
    loading
  } = useAdmin();

  const menuItems = [
    { id: 'docentes', label: 'Docentes', icon: Users },
    { id: 'libros', label: 'Libros', icon: BookOpen },
    { id: 'crear-grupos', label: 'Crear Grupos', icon: BarChart3 },
    { id: 'grupos', label: 'Asignación de Libros', icon: Link2 }
    
  ];

  const totalDocentes = docentes.length;
  const totalLibros = libros.length;
  const totalGrupos = docentes.reduce((acc, d) => acc + (d.total_grupos || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-indigo-950 text-white min-h-screen flex flex-col">
        <div className="p-4 border-b border-indigo-800">
          <div className="flex items-center gap-2">
            <School className="text-indigo-400 w-6 h-6" />
            <h2 className="text-sm font-black uppercase tracking-wider">Panel Admin</h2>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeSection === item.id
                  ? 'bg-indigo-800 text-white'
                  : 'text-slate-300 hover:bg-indigo-900 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-indigo-800">
          <button
            onClick={onVolver}
            className="w-full flex items-center gap-2 px-4 py-3 rounded-lg text-slate-300 hover:bg-indigo-900 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Volver a la App</span>
          </button>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 overflow-auto">
        <header className="bg-white border-b border-slate-200 px-6 py-4">
          <h1 className="text-2xl font-bold text-slate-800">Panel de Administrador</h1>
        </header>

        {/* Estadísticas */}
        <div className="p-6 grid grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Docentes</p>
                <p className="text-2xl font-bold text-slate-800">{totalDocentes}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Libros</p>
                <p className="text-2xl font-bold text-slate-800">{totalLibros}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-100 rounded-lg">
                <Link2 className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Grupos</p>
                <p className="text-2xl font-bold text-slate-800">{totalGrupos}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Área de contenido */}
        <div className="p-6">
          {activeSection === 'docentes' && <AdminDocentes />}
          {activeSection === 'libros' && <AdminLibros />}
          {activeSection === 'grupos' && <AdminGrupos />}
        </div>
      </main>
    </div>
  );
}
