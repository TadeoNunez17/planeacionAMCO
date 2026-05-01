import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { supabase } from './supabaseClient';
import Login from './components/auth/Login';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import StepLogistica from './components/steps/StepLogistica';
import StepPlaneacion from './components/steps/StepPlaneacion';
import StepVistaPrevia from './components/steps/StepVistaPrevia';
import { usePlan } from './hooks/usePlan';
import AdminPanel from './components/admin/AdminPanel';

export default function App() {
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  // Monitorear sesión
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription?.unsubscribe();
  }, []);

  // Verificar si es admin desde app_metadata
  useEffect(() => {
    if (!session?.user) {
      setCheckingAdmin(false);
      return;
    }
    
    console.log('Verificando admin desde metadata...');
    const role = session.user.app_metadata?.role;
    console.log('Role:', role);
    setIsAdmin(role === 'admin');
    setCheckingAdmin(false);
  }, [session]);

  if (!session) return <Login />;

  if (checkingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-indigo-950 text-white">
        <Loader2 className="animate-spin mr-2" /> Verificando permisos...
      </div>
    );
  }

  // Si es admin, ir al panel admin
  if (isAdmin) {
    return <AdminPanel onVolver={() => supabase.auth.signOut()} />;
  }

  // Si no es admin, cargar el flujo normal de planeación
  return <Planificador session={session} />;
}

// Componente separado para planificador (solo carga si NO es admin)
function Planificador({ session }) {
  const [step, setStep] = useState(1);
  const [activeSession, setActiveSession] = useState(0);

  const {
    plan,
    setPlan,
    sessions,
    docente,
    loading,
    savingPrefs,
    temasDisponibles,
    libros,
    ciclosDisponibles,
    generarRangoTexto,
    actualizarFechasSesiones,
    addMateria,
    moverMateria,
    removeMateria,
    autoRellenar,
    updateMateria,
    updateSessionLogistics,
    guardarPreferencias,
    seleccionarLibro
  } = usePlan(session);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-indigo-950 text-white">
        <Loader2 className="animate-spin mr-2" /> Cargando base de datos...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">
      <Header />
      
      <div className="container mx-auto p-4">
        {step === 1 && (
          <StepLogistica 
            plan={plan}
            setPlan={setPlan}
            generarRangoTexto={generarRangoTexto}
            actualizarFechasSesiones={actualizarFechasSesiones}
            guardarPreferencias={guardarPreferencias}
            savingPrefs={savingPrefs}
            libros={libros}
            ciclosDisponibles={ciclosDisponibles}
            seleccionarLibro={seleccionarLibro}
            onNext={() => setStep(2)}
          />
        )}

        {step === 2 && (
          <StepPlaneacion 
            sessions={sessions}
            activeSession={activeSession}
            setActiveSession={setActiveSession}
            addMateria={addMateria}
            moverMateria={moverMateria}
            removeMateria={removeMateria}
            autoRellenar={autoRellenar}
            updateMateria={updateMateria}
            updateSessionLogistics={updateSessionLogistics}
            temasDisponibles={temasDisponibles}
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
          />
        )}

        {step === 3 && (
          <StepVistaPrevia 
            sessions={sessions}
            plan={plan}
            docente={docente}
            onBack={() => setStep(2)}
            onEdit={() => setStep(2)}
          />
        )}
      </div>

      <Footer docente={docente} />
    </div>
  );
}
