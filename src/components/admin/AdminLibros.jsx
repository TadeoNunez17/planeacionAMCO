import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, BookOpen } from 'lucide-react';
import { useAdmin } from '../../hooks/useAdmin';

export default function AdminLibros() {
  const { libros, loading, cargarLibros, crearLibro, editarLibro, eliminarLibro } = useAdmin();

  const [mostrarModal, setMostrarModal] = useState(false);
  const [libroActual, setLibroActual] = useState(null);
  const [nombreLibro, setNombreLibro] = useState('');
  const [loadingAction, setLoadingAction] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  useEffect(() => { cargarLibros(); }, [cargarLibros]);

  const handleCrear = async (e) => {
    e.preventDefault();
    setLoadingAction(true);
    const result = await crearLibro(nombreLibro);
    setLoadingAction(false);
    if (result.success) {
      setMostrarModal(false);
      setNombreLibro('');
      setMensaje({ tipo: 'success', texto: 'Libro creado exitosamente' });
    } else {
      setMensaje({ tipo: 'error', texto: result.error });
    }
  };

  const handleEditar = async (e) => {
    e.preventDefault();
    setLoadingAction(true);
    const result = await editarLibro(libroActual.id_libro, nombreLibro);
    setLoadingAction(false);
    if (result.success) {
      setMostrarModal(false);
      setLibroActual(null);
      setNombreLibro('');
      setMensaje({ tipo: 'success', texto: 'Libro actualizado' });
    } else {
      setMensaje({ tipo: 'error', texto: result.error });
    }
  };

  const handleEliminar = async (libro) => {
    if (!confirm(`¿Eliminar "${libro.nombre_libro}"? Esta acción no se puede deshacer.`)) return;
    const result = await eliminarLibro(libro.id_libro);
    if (result.success) {
      setMensaje({ tipo: 'success', texto: 'Libro eliminado' });
    } else {
      setMensaje({ tipo: 'error', texto: result.error });
    }
  };

  const abrirCrear = () => {
    setLibroActual(null);
    setNombreLibro('');
    setMostrarModal(true);
  };

  const abrirEditar = (libro) => {
    setLibroActual(libro);
    setNombreLibro(libro.nombre_libro);
    setMostrarModal(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">Gestión de Libros</h2>
        <button onClick={abrirCrear} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2 transition-colors">
          <Plus className="w-4 h-4" />
          Agregar Libro
        </button>
      </div>

      {mensaje && (
        <div className={`p-4 rounded-lg mb-4 ${ mensaje.tipo === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200' }`}>
          {mensaje.texto}
          <button onClick={() => setMensaje(null)} className="ml-2 font-bold">×</button>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Nombre del Libro</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-slate-600">Docentes con Acceso</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-slate-600">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="3" className="px-4 py-8 text-center text-slate-500">Cargando...</td></tr>
            ) : libros.length === 0 ? (
              <tr><td colSpan="3" className="px-4 py-8 text-center text-slate-500">No hay libros registrados</td></tr>
            ) : (
              libros.map(libro => (
                <tr key={libro.id_libro} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-5 h-5 text-indigo-600" />
                      <span className="text-sm text-slate-800 font-medium">{libro.nombre_libro}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-slate-600">
                    {libro.total_docentes || 0} docente(s)
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => abrirEditar(libro)} className="p-2 text-slate-600 hover:text-indigo-600 transition-colors" title="Editar">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleEliminar(libro)} className="p-2 text-red-500 hover:text-red-700 transition-colors" title="Eliminar">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {mostrarModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-slate-800 mb-4">
              {libroActual ? 'Editar Libro' : 'Agregar Libro'}
            </h3>
            <form onSubmit={libroActual ? handleEditar : handleCrear}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del Libro</label>
                <input
                  type="text"
                  value={nombreLibro}
                  onChange={(e) => setNombreLibro(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setMostrarModal(false)} className="flex-1 border border-slate-300 text-slate-700 rounded-lg px-4 py-2 hover:bg-slate-50 transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={loadingAction} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2 transition-colors disabled:opacity-50">
                  {loadingAction ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
