import { useEffect, useState } from 'react';
import { supabase } from './supabase'; //
import InspectorApp from './InspectorApp'; //
import AdminDashboard from './components/AdminDashboard'; //
import Login from './components/Login'; //
import { LogOut, Settings } from 'lucide-react';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [userRole, setUserRole] = useState<'admin' | 'inspector' | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);

  useEffect(() => {
    // 1. Controleer de huidige sessie bij het laden
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchUserRole(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // 2. Luister naar wijzigingen in de authenticatie-status
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchUserRole(session.user.id);
      } else {
        setUserRole(null);
        setShowAdminDashboard(false);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) throw error;
      if (data) setUserRole(data.role); //
    } catch (err) {
      console.error("Fout bij ophalen rol:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut(); //
  };

  // --- RENDERING LOGICA ---

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500 font-medium italic">Systeem laden...</div>
      </div>
    );
  }

  // Toon inlogscherm als er geen sessie is
  if (!session) {
    return <Login />;
  }

  // Toon het AdminDashboard als de admin daarop heeft geklikt
  if (showAdminDashboard && userRole === 'admin') {
    return (
      <div className="relative">
        <button 
          onClick={() => setShowAdminDashboard(false)}
          className="fixed top-4 right-4 z-50 bg-emerald-600 text-white px-4 py-2 rounded-full shadow-lg font-bold hover:bg-emerald-700 transition flex items-center gap-2"
        >
          Terug naar Inspecties
        </button>
        <AdminDashboard />
      </div>
    );
  }

  // De standaard view: De Hoofdapplicatie voor zowel Admin als Inspecteur
  return (
    <div className="relative">
      {/* Admin Navigatie Knop & Uitloggen */}
      <div className="fixed top-2 right-2 z-50 flex items-center gap-2">
        {userRole === 'admin' && (
          <button 
            onClick={() => setShowAdminDashboard(true)}
            className="bg-gray-800 text-white px-3 py-1.5 rounded shadow-sm text-xs font-bold hover:bg-black transition flex items-center gap-2"
          >
            <Settings size={14} /> Beheer
          </button>
        )}
        <button 
          onClick={handleLogout}
          className="bg-white/90 text-gray-500 px-3 py-1.5 rounded shadow-sm text-xs font-bold hover:text-red-600 transition flex items-center gap-2 border border-gray-200"
        >
          <LogOut size={14} /> Uitloggen
        </button>
      </div>

      {/* De Inspectie App krijgt de rol mee voor interne logica */}
      <InspectorApp /> 
    </div>
  );
}