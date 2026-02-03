import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import InspectorApp from './InspectorApp';
import AdminDashboard from './components/AdminDashboard';
import Login from './components/Login';
import { LogOut, ShieldAlert } from 'lucide-react';

function App() {
  const [session, setSession] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check sessie
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchUserRole(session.user.id);
      else setLoading(false);
    });

    // 2. Luister naar auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchUserRole(session.user.id);
      else {
          setUserRole(null);
          setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      
      if (data) setUserRole(data.role);
      setLoading(false);
  };

  const handleLogout = async () => {
      await supabase.auth.signOut();
      setUserRole(null);
  };

  if (loading) return <div className="text-center mt-20 text-gray-500">Toegangsrechten controleren...</div>;

  if (!session) return <Login />;

  // --- ROUTING LOGICA ---
  const path = window.location.pathname;

  // Als je naar /admin wilt, MAAR je bent geen admin:
  if (path === '/admin' && userRole !== 'admin') {
      return (
          <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
              <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-md">
                  <ShieldAlert className="mx-auto text-red-500 mb-4" size={48} />
                  <h2 className="text-xl font-bold text-gray-800 mb-2">Geen Toegang</h2>
                  <p className="text-gray-600 mb-6">Je hebt geen rechten om het admin dashboard te bekijken. Je kunt alleen inspecties uitvoeren.</p>
                  <button onClick={() => window.location.href = '/'} className="bg-emerald-600 text-white px-4 py-2 rounded font-bold hover:bg-emerald-700">Naar Inspectie App</button>
                  <button onClick={handleLogout} className="block w-full mt-4 text-sm text-gray-400 hover:text-red-500">Uitloggen</button>
              </div>
          </div>
      );
  }

  return (
    <div>
        <div className="absolute top-2 right-2 z-50 flex gap-2">
            {userRole === 'admin' && path !== '/admin' && (
                <button onClick={() => window.location.href = '/admin'} className="text-xs bg-gray-800 text-white px-3 py-1 rounded font-bold shadow-sm hover:bg-black">
                    Naar Dashboard
                </button>
            )}
            {userRole === 'admin' && path === '/admin' && (
                <button onClick={() => window.location.href = '/'} className="text-xs bg-emerald-600 text-white px-3 py-1 rounded font-bold shadow-sm hover:bg-emerald-700">
                    Naar App
                </button>
            )}
            <button onClick={handleLogout} className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 bg-white/80 p-1 rounded shadow-sm border">
                <LogOut size={12}/> Uitloggen ({userRole})
            </button>
        </div>

        {path === '/admin' ? <AdminDashboard /> : <InspectorApp />}
    </div>
  );
}

export default App;