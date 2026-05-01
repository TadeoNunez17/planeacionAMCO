import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Search, Link2, BookOpen, User } from 'lucide-react';
import { useAdmin } from '../../hooks/useAdmin';

export default function AdminGrupos() {
  const {
    docentes,
    libros,
    loading,
    gruposDocente,
    docenteSeleccionado,
    setDocenteSeleccionado,
    cargarDocentes,
    cargarLibros,
    cargarGruposDeDocente,
    asignarLibroADocente,
    quitarGrupo
  } = useAdmin();

  const [busquedaDocente, setBusquedaDocente] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [libroSeleccionado, setLibroSeleccionado] = useState('');
  const [loadingAction, setLoadingAction] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  useEffect(() => {
    cargarDocentes();
    cargarLibros();
  }, [cargarDocentes, cargarLibros]);

  const docentesFiltrados = docentes.filter(d =>
    d.nombre_completo?.toLowerCase().includes(busquedaDocente.toLowerCase()) ||
    d.correo?.toLowerCase().includes(busquedaDocente.toLowerCase())
  );

  const handleSeleccionarDocente = async (docente) => {
    setDocenteSeleccionado(docente);
    await cargarGruposDeDocente(docente.id_docente);
  };

  const handleAsignarLibro = async (e) => {
    e.preventDefault();
    if (!docenteSeleccionado || !libroSeleccionado) return;

    setLoadingAction(true);
    const result = await asignarLibroADocente(
      docenteSeleccionado.id_docente,
      parseInt(libroSeleccionado)
    );
    setLoadingAction(false);

    if (result.success) {
      setMostrarModal(false);
      setLibroSeleccionado('');
      setMensaje({ tipo: 'success', texto: 'Libro asignado exitosamente' });
    } else {
      setMensaje({ tipo: 'error', texto: result.error });
    }
  };

  const handleQuitarGrupo = async (grupo) => {
    if (!confirm(`¿Quitar este grupo? Se eliminará la asignación del libro "${grupo.cursos?.libros?.nombre_libro}".`)) {
      return;
    }

    setLoadingAction(true);
    const result = await quitarGrupo(grupo.id_grupo, docenteSeleccionado?.id_docente);
    setLoadingAction(false);

    if (result.success) {
      setMensaje({ tipo: 'success', texto: 'Grupo eliminado' });
    } else {
      setMensaje({ tipo: 'error', texto: result.error });
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-800 mb-6">Asignación de Grupos</h2>

      {mensaje && (
        <div className={`p-4 rounded-lg mb-4 ${
          mensaje.tipo === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {mensaje.texto}
          <button onClick={() => setMensaje(null)} className="ml-2 font-bold">×</button>
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* Panel izquierdo: Lista de docentes */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
          <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-3">Docentes</h3>
          
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar docente..."
              value={busquedaDocente}
              onChange={(e) => setBusquedaDocente(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div className="space-y-1 max-h-96 overflow-y-auto">
            {docentesFiltrados.map(docente => (
              <button
                key={docente.id_docente}
                onClick={() => handleSeleccionarDocente(docente)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  docenteSeleccionado?.id_docente === docente.id_docente
                    ? 'bg-indigo-100 text-indigo-700 font-medium'
                    : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{docente.nombre_completo}</span>
                </div>
                <p className="text-xs text-slate-500 ml-6">{docente.correo}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Panel derecho: Grupos del docente */}
        <div className="col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm p-4">
          {!docenteSeleccionado ? (
            <div className="flex items-center justify-center h-64 text-slate-400">
              <div className="text-center">
                <Link2 className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>Selecciona un docente para ver sus grupos asignados</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">{docenteSeleccionado.nombre_completo}</h3>
                  <p className="text-sm text-slate-500">{docenteSeleccionado.correo}</p>
                </div>
                <button
                  onClick={() => setMostrarModal(true)}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Agregar Libro
                </button>
              </div>

              <div className="space-y-3">
                {gruposDocente.length === 0 ? (
                  <p className="text-center py-8 text-slate-500">No tiene grupos asignados</p>
                ) : (
                  gruposDocente.map((grupo, index) => (
                    <div key={grupo.id_grupo} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                          <BookOpen className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">Grupo {index + 1}</p>
                          <p className="text-sm text-slate-600">
                            {grupo.cursos?.libros?.nombre_libro || 'Libro no encontrado'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleQuitarGrupo(grupo)}
                        disabled={loadingAction}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Quitar grupo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal para agregar libro */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-slate-800 mb-4">
              Asignar Libro a {docenteSeleccionado?.nombre_completo}
            </h3>
            <form onSubmit={handleAsignarLibro}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Seleccionar Libro</label>
                <select
                  value={libroSeleccionado}
                  onChange={(e) => setLibroSeleccionado(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                >
                  <option value="">-- Seleccionar --</option>
                  {libros.map(libro => (
                    <option key={libro.id_libro} value={libro.id_libro}>
                      {libro.nombre_libro}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setMostrarModal(false);
                    setLibroSeleccionado('');
                  }}
                  className="flex-1 border border-slate-300 text-slate-700 rounded-lg px-4 py-2 hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loadingAction || !libroSeleccionado}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2 transition-colors disabled:opacity-50"
                >
                  {loadingAction ? 'Asignando...' : 'Asignar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
