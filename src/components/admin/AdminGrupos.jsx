import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Users, BookOpen } from 'lucide-react';
import { useAdmin } from '../../hooks/useAdmin';

export default function AdminGrupos() {
  const {
    docentes,
    libros,
    loading,
    cargarDocentes,
    cargarLibros,
    asignarLibroADocente,
    quitarGrupo
  } = useAdmin();

  const [mostrarModal, setMostrarModal] = useState(false);
  const [docenteSeleccionado, setDocenteSeleccionado] = useState('');
  const [libroSeleccionado, setLibroSeleccionado] = useState('');
  const [loadingAction, setLoadingAction] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  const handleAsignar = async (e) => {
    e.preventDefault();
    if (!docenteSeleccionado || !libroSeleccionado) {
      setMensaje({ tipo: 'error', texto: 'Selecciona un docente y un libro' });
      return;
    }

    setLoadingAction(true);
    const result = await asignarLibroADocente(parseInt(docenteSeleccionado), parseInt(libroSeleccionado));
    setLoadingAction(false);

    if (result.success) {
      setMostrarModal(false);
      setDocenteSeleccionado('');
      setLibroSeleccionado('');
      setMensaje({ tipo: 'success', texto: 'Libro asignado exitosamente' });
    } else {
      setMensaje({ tipo: 'error', texto: result.error });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">Asignación de Libros a Docentes</h2>
        <button
          onClick={() => setMostrarModal(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Asignar Libro
        </button>
      </div>

      {mensaje && (
        <div className={`p-4 rounded-lg mb-4 ${
          mensaje.tipo === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {mensaje.texto}
          <button onClick={() => setMensaje(null)} className="ml-2 font-bold">×</button>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Docente</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Libros Asignados</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-slate-600">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="3" className="px-4 py-8 text-center text-slate-500">Cargando...</td>
              </tr>
            ) : docentes.length === 0 ? (
              <tr>
                <td colSpan="3" className="px-4 py-8 text-center text-slate-500">No hay docentes registrados</td>
              </tr>
            ) : (
              docentes.map(docente => (
                <tr key={docente.id_docente} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-indigo-600" />
                      <div>
                        <span className="text-sm text-slate-800 font-medium">{docente.nombre_completo}</span>
                        <p className="text-xs text-slate-500">{docente.correo}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(docente.grupos || []).map(grupo => (
                        <span key={grupo.id_grupo} className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs px-2 py-1 rounded">
                          <BookOpen className="w-3 h-3" />
                          {grupo.libros?.nombre_libro || 'Sin libro'}
                        </span>
                      ))}
                      {(!docente.grupos || docente.grupos.length === 0) && (
                        <span className="text-sm text-slate-400">Sin libros asignados</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => {
                        setDocenteSeleccionado(docente.id_docente);
                        setMostrarModal(true);
                      }}
                      className="p-2 text-slate-600 hover:text-indigo-600 transition-colors"
                      title="Asignar libro"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Asignar Libro */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Asignar Libro a Docente</h3>
            <form onSubmit={handleAsignar}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Docente</label>
                <select
                  value={docenteSeleccionado}
                  onChange={(e) => setDocenteSeleccionado(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                >
                  <option value="">Selecciona un docente...</option>
                  {docentes.map(d => (
                    <option key={d.id_docente} value={d.id_docente}>{d.nombre_completo}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Libro</label>
                <select
                  value={libroSeleccionado}
                  onChange={(e) => setLibroSeleccionado(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                >
                  <option value="">Selecciona un libro...</option>
                  {libros.map(l => (
                    <option key={l.id_libro} value={l.id_libro}>{l.nombre_libro}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setMostrarModal(false);
                    setDocenteSeleccionado('');
                    setLibroSeleccionado('');
                  }}
                  className="flex-1 border border-slate-300 text-slate-700 rounded-lg px-4 py-2 hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loadingAction}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2 transition-colors disabled:opacity-50"
                >
                  {loadingAction ? 'Guardando...' : 'Asignar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
