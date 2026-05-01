import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Search, UserCheck, UserX, Eye } from 'lucide-react';
import { useAdmin } from '../../hooks/useAdmin';

export default function AdminDocentes() {
  const {
    docentes,
    loading,
    cargarDocentes,
    crearDocente,
    editarDocente,
    eliminarDocente
  } = useAdmin();

  const [busqueda, setBusqueda] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarDetalle, setMostrarDetalle] = useState(false);
  const [docenteActual, setDocenteActual] = useState(null);
  const [formData, setFormData] = useState({ email: '', nombre: '', is_admin: false });
  const [loadingAction, setLoadingAction] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  const docentesFiltrados = docentes.filter(d =>
    d.nombre_completo?.toLowerCase().includes(busqueda.toLowerCase()) ||
    d.correo?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleCrear = async (e) => {
    e.preventDefault();
    setLoadingAction(true);
    const result = await crearDocente(formData.email, formData.nombre);
    setLoadingAction(false);
    
    if (result.success) {
      setMostrarModal(false);
      setFormData({ email: '', nombre: '', is_admin: true });
      setMensaje({ tipo: 'success', texto: 'Administrador invitado exitosamente' });
    } else {
      setMensaje({ tipo: 'error', texto: result.error });
    }
  };

  const handleEditar = async (e) => {
    e.preventDefault();
    setLoadingAction(true);
    const result = await editarDocente(docenteActual.id_docente, {
      nombre_completo: formData.nombre,
      is_admin: formData.is_admin
    });
    setLoadingAction(false);
    
    if (result.success) {
      setMostrarModal(false);
      setMensaje({ tipo: 'success', texto: 'Administrador actualizado' });
    } else {
      setMensaje({ tipo: 'error', texto: result.error });
    }
  };

  const handleEliminar = async (docente) => {
    if (!confirm(`¿Eliminar administrador ${docente.nombre_completo}? Esta acción también eliminará sus grupos asignados.`)) {
      return;
    }
    
    const result = await eliminarDocente(docente.id_docente);
    if (result.success) {
      setMensaje({ tipo: 'success', texto: 'Administrador eliminado' });
    } else {
      setMensaje({ tipo: 'error', texto: result.error });
    }
  };

  const abrirCrear = () => {
    setDocenteActual(null);
    setFormData({ email: '', nombre: '', is_admin: true });
    setMostrarModal(true);
  };

  const abrirEditar = (docente) => {
    setDocenteActual(docente);
    setFormData({
      email: docente.correo,
      nombre: docente.nombre_completo,
      is_admin: docente.is_admin
    });
    setMostrarModal(true);
  };

  const verDetalle = async (docente) => {
    setDocenteActual(docente);
    setMostrarDetalle(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">Gestión de Administradores</h2>
        <button
          onClick={abrirCrear}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Agregar Admin
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

      {/* Búsqueda */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Buscar por nombre o correo..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
        />
      </div>

      {/* Tabla */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Nombre</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Correo</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-slate-600">Admin</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-slate-600">Grupos</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-slate-600">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="px-4 py-8 text-center text-slate-500">Cargando...</td>
              </tr>
            ) : docentesFiltrados.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-4 py-8 text-center text-slate-500">No se encontraron administradores</td>
              </tr>
            ) : (
              docentesFiltrados.map(docente => (
                <tr key={docente.id_docente} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm text-slate-800">{docente.nombre_completo}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{docente.correo}</td>
                  <td className="px-4 py-3 text-center">
                    {docente.is_admin ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600">
                        <UserCheck className="w-4 h-4" /> Sí
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-slate-400">
                        <UserX className="w-4 h-4" /> No
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-slate-600">{docente.total_grupos || 0}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => verDetalle(docente)}
                        className="p-2 text-slate-600 hover:text-indigo-600 transition-colors"
                        title="Ver detalle"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => abrirEditar(docente)}
                        className="p-2 text-slate-600 hover:text-indigo-600 transition-colors"
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEliminar(docente)}
                        className="p-2 text-red-500 hover:text-red-700 transition-colors"
                        title="Eliminar"
                      >
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

      {/* Modal Crear/Editar */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h3 className="text-lg font-bold text-slate-800 mb-4">
                {docenteActual ? 'Editar Administrador' : 'Invitar Administrador'}
              </h3>
            <form onSubmit={docenteActual ? handleEditar : handleCrear}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo</label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                    disabled={docenteActual}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_admin"
                    checked={formData.is_admin}
                    onChange={(e) => setFormData({...formData, is_admin: e.target.checked})}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="is_admin" className="text-sm text-slate-700">Es administrador</label>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setMostrarModal(false)}
                  className="flex-1 border border-slate-300 text-slate-700 rounded-lg px-4 py-2 hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loadingAction}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2 transition-colors disabled:opacity-50"
                >
                  {loadingAction ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detalle */}
      {mostrarDetalle && docenteActual && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Detalle del Docente</h3>
            <div className="space-y-3">
              <p><span className="font-medium text-slate-600">Nombre:</span> {docenteActual.nombre_completo}</p>
              <p><span className="font-medium text-slate-600">Correo:</span> {docenteActual.correo}</p>
              <p><span className="font-medium text-slate-600">Admin:</span> {docenteActual.is_admin ? 'Sí' : 'No'}</p>
              <p><span className="font-medium text-slate-600">Grupos asignados:</span> {docenteActual.total_grupos || 0}</p>
              {docenteActual.libro_id_pref && (
                <p><span className="font-medium text-slate-600">Libro preferido:</span> {docenteActual.libro_id_pref}</p>
              )}
            </div>
            <button
              onClick={() => setMostrarDetalle(false)}
              className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
