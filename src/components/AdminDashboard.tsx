import { useEffect, useState } from 'react'; 
import { supabase } from '../supabase';
import { Calendar, User, Download, RefreshCw, Plus, X, MapPin, Trash2, Lock, FileText, Search, ChevronLeft, ChevronRight, Database, Users, Shield, UserPlus } from 'lucide-react';
import { pdf } from '@react-pdf/renderer'; 
import { PDFReport } from './PDFReport';

const ITEMS_PER_PAGE = 20;

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'inspections' | 'users'>('inspections');
  
  // INSPECTIE STATEN
  const [inspections, setInspections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOrderModal, setShowOrderModal] = useState(false); // Hernoemd voor duidelijkheid
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  // GEBRUIKER STATEN
  const [users, setUsers] = useState<any[]>([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', password: '', role: 'inspector' });

  // Formulier state voor OPDRACHTEN
  const [newOrder, setNewOrder] = useState({
    clientName: '',
    projectAddress: '',
    projectCity: '',
    inspectorName: '',
    date: new Date().toISOString().split('T')[0]
  });

  // --- FETCHERS ---
  const fetchInspections = async () => {
    setLoading(true);
    const from = (page - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    let query = supabase
      .from('inspections')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (searchTerm) query = query.ilike('client_name', `%${searchTerm}%`);

    const { data, count, error } = await query;
    if (error) console.error(error);
    else { setInspections(data || []); setTotalCount(count || 0); }
    setLoading(false);
  };

  const fetchUsers = async () => {
      const { data, error } = await supabase.from('profiles').select('*').order('email');
      if (error) alert("Fout bij ophalen gebruikers: " + error.message);
      else setUsers(data || []);
  };

  useEffect(() => {
    if (activeTab === 'inspections') fetchInspections();
    if (activeTab === 'users') fetchUsers();
  }, [page, searchTerm, activeTab]); 

  // --- ACTIES: INSPECTIES ---
  const handleCreateOrder = async () => {
    if (!newOrder.clientName) return alert("Vul minimaal een klantnaam in.");
    const initialData = {
        meta: { clientName: newOrder.clientName, projectAddress: newOrder.projectAddress, projectCity: newOrder.projectCity, inspectorName: newOrder.inspectorName, date: newOrder.date },
        measurements: { installationType: 'TN-S', mainFuse: '3x63A', mainsVoltage: '400 V ~ 3 fase + N', yearOfConstruction: '1990', switchboardTemp: '20', selectedInstruments: [] },
        defects: []
    };
    const { error } = await supabase.from('inspections').insert({ client_name: newOrder.clientName, status: 'new', report_data: initialData });
    if (error) alert('Fout: ' + error.message);
    else { alert('Opdracht aangemaakt!'); setShowOrderModal(false); fetchInspections(); }
  };

  const handleDelete = async (id: number) => {
      if(!window.confirm("Zeker weten verwijderen?")) return;
      await supabase.from('inspections').delete().eq('id', id);
      fetchInspections();
  }

  const handleDownloadPDF = async (inspection: any) => {
      if(!inspection.report_data) return alert("Geen data");
      setIsGeneratingPdf(true);
      try {
        const { meta, defects, measurements } = inspection.report_data;
        const blob = await pdf(<PDFReport meta={meta} defects={defects || []} measurements={measurements} />).toBlob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `${meta?.clientName || 'Rapport'}.pdf`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
      } catch (e) { console.error(e); alert("Fout bij genereren"); } finally { setIsGeneratingPdf(false); }
  };

  const downloadJSON = (inspection: any) => {
    const jsonStr = JSON.stringify(inspection.report_data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `Backup_${inspection.client_name}.json`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };
  
  const toggleStatus = async (insp: any) => {
        let newStatus = '';
        let confirmMsg = '';

        // Logica: Wat is de volgende logische stap?
        if (insp.status === 'completed') {
            newStatus = 'in_progress'; // Heropenen
            confirmMsg = `Wil je inspectie "${insp.client_name}" heropenen voor wijzigingen?`;
        } else if (insp.status === 'review_ready') {
            newStatus = 'completed'; // Goedkeuren
            confirmMsg = `Wil je inspectie "${insp.client_name}" definitief goedkeuren en afronden?`;
        } else {
            // Als hij op 'new' of 'in_progress' staat, zetten we hem handmatig op completed
            newStatus = 'completed';
            confirmMsg = `Wil je inspectie "${insp.client_name}" nu al op afgerond zetten?`;
        }

        if(!window.confirm(confirmMsg)) return;
        
        const { error } = await supabase.from('inspections').update({ status: newStatus }).eq('id', insp.id);
        if(error) alert("Fout: " + error.message);
        else fetchInspections();
  };

  const handleExportAll = async () => {
      if (!window.confirm("Volledige backup maken?")) return;
      const { data } = await supabase.from('inspections').select('*');
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `FULL_BACKUP_${new Date().toISOString()}.json`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  // --- ACTIES: GEBRUIKERS ---
  const handleRoleChange = async (userId: string, newRole: string) => {
      if (!window.confirm(`Rol wijzigen naar ${newRole}?`)) return;
      const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
      if (error) alert("Fout: " + error.message);
      else { alert("Rol aangepast!"); fetchUsers(); }
  };

  const handleCreateUser = async () => {
      if (!newUser.email || !newUser.password) return alert("Vul email en wachtwoord in.");
      
      // 1. Roep de SQL functie aan om de gebruiker aan te maken
      const { data: userId, error } = await supabase.rpc('create_user', {
          email: newUser.email,
          password: newUser.password
      });

      if (error) {
          alert("Fout bij aanmaken: " + error.message);
          return;
      }

      // 2. Als de gewenste rol 'admin' is, update dan direct het profiel
      // (Standaard maakt de trigger hem 'inspector', dus we hoeven alleen te updaten als het admin moet zijn)
      if (userId && newUser.role === 'admin') {
          await supabase.from('profiles').update({ role: 'admin' }).eq('id', userId);
      }

      alert(`Gebruiker ${newUser.email} aangemaakt als ${newUser.role}!`);
      setShowUserModal(false);
      setNewUser({ email: '', password: '', role: 'inspector' });
      fetchUsers(); // Ververs de lijst
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div><h1 className="text-3xl font-bold text-gray-800">Kantoor Dashboard</h1><p className="text-gray-500">Beheer {totalCount} inspecties</p></div>
          <div className="flex gap-3">
             {/* Toon alleen 'Nieuw' knop als we op tabblad Inspecties zitten */}
             {activeTab === 'inspections' && (
                 <button onClick={() => setShowOrderModal(true)} className="flex items-center gap-2 bg-emerald-600 px-4 py-2 rounded shadow text-white hover:bg-emerald-700 font-bold whitespace-nowrap"><Plus size={18} /> Nieuw</button>
             )}
             <button onClick={handleExportAll} className="flex items-center gap-2 bg-gray-700 px-4 py-2 rounded shadow text-white hover:bg-gray-800 font-bold border border-gray-600"><Database size={18} /> Backup</button>
          </div>
        </div>

        {/* TABS */}
        <div className="flex gap-4 mb-6 border-b border-gray-300">
            <button onClick={() => setActiveTab('inspections')} className={`pb-2 px-4 font-bold flex items-center gap-2 ${activeTab === 'inspections' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}>
                <FileText size={18}/> Inspecties
            </button>
            <button onClick={() => setActiveTab('users')} className={`pb-2 px-4 font-bold flex items-center gap-2 ${activeTab === 'users' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}>
                <Users size={18}/> Gebruikersbeheer
            </button>
        </div>

        {/* TAB: INSPECTIES */}
        {activeTab === 'inspections' && (
            <>
                <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="relative w-full md:w-1/2">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input type="text" placeholder="Zoek op klantnaam..." className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }} />
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Pagina {page} van {totalPages || 1}</span>
                        <div className="flex gap-1">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 border rounded hover:bg-gray-100 disabled:opacity-50"><ChevronLeft size={20}/></button>
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="p-2 border rounded hover:bg-gray-100 disabled:opacity-50"><ChevronRight size={20}/></button>
                        </div>
                    </div>
                </div>

                {loading ? (<div className="text-center py-20 text-gray-500"><RefreshCw className="animate-spin inline mr-2"/>Laden...</div>) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full">
                    <thead className="bg-gray-50 border-b"><tr><th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Datum</th><th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Klant</th><th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Status</th><th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Inspecteur</th><th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Acties</th></tr></thead>
                    <tbody className="divide-y divide-gray-200">
                        {inspections.map((insp) => (
                        <tr key={insp.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm text-gray-500"><div className="flex items-center gap-2"><Calendar size={16} />{insp.report_data?.meta?.date}</div></td>
                            <td className="px-6 py-4"><div className="text-sm font-bold text-gray-900">{insp.client_name}</div><div className="text-xs text-gray-500"><MapPin size={12} className="inline"/> {insp.report_data?.meta?.projectCity}</div></td>
                            <td className="px-6 py-4 whitespace-nowrap cursor-pointer select-none" onClick={() => toggleStatus(insp)} title="Klik om status te wijzigen">
                                {/* STATUS 1: NIEUW (Nog niks mee gedaan) */}
                                {(!insp.status || insp.status === 'new') && (
                                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-bold border border-blue-200">
                                        Nieuw
                                    </span>
                                )}

                                {/* STATUS 2: IN UITVOERING (Inspecteur is bezig) */}
                                {insp.status === 'in_progress' && (
                                    <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded font-bold border border-orange-200 flex items-center gap-1 w-fit">
                                        <RefreshCw size={12} className="animate-spin"/> Bezig...
                                    </span>
                                )}

                                {/* STATUS 3: REVIEW KLAAR (Ingeleverd door inspecteur) */}
                                {insp.status === 'review_ready' && (
                                    <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded font-bold border border-purple-200 shadow-sm flex items-center gap-1 w-fit">
                                        <FileText size={12}/> Review Klaar
                                    </span>
                                )}

                                {/* STATUS 4: AFGEROND (Op slot) */}
                                {insp.status === 'completed' && (
                                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-bold border border-green-200 flex items-center gap-1 w-fit">
                                        <Lock size={12}/> Afgerond
                                    </span>
                                )}
                            </td>                            <td className="px-6 py-4 text-sm text-gray-500"><User size={16} className="inline"/> {insp.report_data?.meta?.inspectorName || '-'}</td>
                            <td className="px-6 py-4 text-right text-sm font-medium flex justify-end gap-3">
                                <button onClick={() => handleDownloadPDF(insp)} disabled={isGeneratingPdf} className="text-red-600 font-bold" title="PDF"><FileText size={16}/></button>
                                <button onClick={() => downloadJSON(insp)} className="text-indigo-600" title="JSON"><Download size={16}/></button>
                                <button onClick={() => handleDelete(insp.id)} className="text-red-400 hover:text-red-600" title="Verwijderen"><Trash2 size={16}/></button>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
                )}
            </>
        )}

        {/* TAB: GEBRUIKERS */}
        {activeTab === 'users' && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-4 bg-blue-50 border-b border-blue-100 text-sm text-blue-800 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Shield size={18}/> 
                        <span>Beheer toegang tot dashboard (Admin) of app (Inspector).</span>
                    </div>
                    {/* NIEUWE KNOP: GEBRUIKER TOEVOEGEN */}
                    <button onClick={() => setShowUserModal(true)} className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1 rounded shadow text-xs font-bold hover:bg-blue-700">
                        <UserPlus size={16} /> Gebruiker Toevoegen
                    </button>
                </div>
                <table className="min-w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Huidige Rol</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Wijzig Rol</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {users.map(u => (
                            <tr key={u.id}>
                                <td className="px-6 py-4 text-sm font-bold text-gray-700">{u.email}</td>
                                <td className="px-6 py-4 text-sm">
                                    {u.role === 'admin' ? 
                                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-bold border border-purple-200">ADMIN</span> : 
                                        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-bold border border-gray-200">INSPECTOR</span>
                                    }
                                </td>
                                <td className="px-6 py-4 text-sm">
                                    <select 
                                        className="border rounded p-1 text-sm bg-white" 
                                        value={u.role} 
                                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                    >
                                        <option value="inspector">Inspector</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}

        {/* MODAL 1: NIEUWE OPDRACHT */}
        {showOrderModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 animate-fadeIn">
                    <div className="flex justify-between items-center mb-4 border-b pb-2"><h2 className="text-lg font-bold text-gray-800">Nieuwe Inspectie</h2><button onClick={() => setShowOrderModal(false)}><X size={24}/></button></div>
                    <div className="space-y-4">
                        <input className="w-full border rounded p-2" placeholder="Klantnaam" value={newOrder.clientName} onChange={e => setNewOrder({...newOrder, clientName: e.target.value})} autoFocus />
                        <input className="w-full border rounded p-2" placeholder="Adres" value={newOrder.projectAddress} onChange={e => setNewOrder({...newOrder, projectAddress: e.target.value})} />
                        <input className="w-full border rounded p-2" placeholder="Plaats" value={newOrder.projectCity} onChange={e => setNewOrder({...newOrder, projectCity: e.target.value})} />
                        <div className="grid grid-cols-2 gap-4"><input type="date" className="w-full border rounded p-2" value={newOrder.date} onChange={e => setNewOrder({...newOrder, date: e.target.value})} /><select className="w-full border rounded p-2" value={newOrder.inspectorName} onChange={e => setNewOrder({...newOrder, inspectorName: e.target.value})}><option value="">-- Inspecteur --</option><option value="Bas">Bas</option><option value="Jijzelf">Jijzelf</option></select></div>
                    </div>
                    <div className="mt-6 flex gap-3"><button onClick={() => setShowOrderModal(false)} className="flex-1 bg-gray-200 py-2 rounded font-bold">Annuleren</button><button onClick={handleCreateOrder} className="flex-1 bg-emerald-600 text-white py-2 rounded font-bold">Aanmaken</button></div>
                </div>
            </div>
        )}

        {/* MODAL 2: NIEUWE GEBRUIKER */}
        {showUserModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 animate-fadeIn">
                    <div className="flex justify-between items-center mb-4 border-b pb-2"><h2 className="text-lg font-bold text-blue-800 flex items-center gap-2"><UserPlus size={20}/> Nieuwe Gebruiker</h2><button onClick={() => setShowUserModal(false)}><X size={24}/></button></div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">E-mailadres</label>
                            <input className="w-full border rounded p-2" type="email" placeholder="naam@bedrijf.nl" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} autoFocus />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Wachtwoord</label>
                            <input className="w-full border rounded p-2" type="password" placeholder="Minimaal 6 tekens" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Rol</label>
                            <select className="w-full border rounded p-2 bg-white" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                                <option value="inspector">Inspector (Alleen App)</option>
                                <option value="admin">Admin (Dashboard + App)</option>
                            </select>
                        </div>
                    </div>
                    <div className="mt-6 flex gap-3"><button onClick={() => setShowUserModal(false)} className="flex-1 bg-gray-200 py-2 rounded font-bold">Annuleren</button><button onClick={handleCreateUser} className="flex-1 bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700">Toevoegen</button></div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
}