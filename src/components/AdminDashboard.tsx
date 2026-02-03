import { useEffect, useState, useRef } from 'react'; 
import { supabase } from '../supabase';
import { Calendar, User, Download, RefreshCw, Plus, X, MapPin, Trash2, Lock, FileText, Search, ChevronLeft, ChevronRight, Database, Users, Shield, UserPlus, FileSpreadsheet, Pencil, Settings, Building, Wrench} from 'lucide-react';
import { pdf } from '@react-pdf/renderer'; 
import { PDFReport } from './PDFReport';
import ExcelJS from 'exceljs';

const ITEMS_PER_PAGE = 20;

// Standaard waarden
const EMPTY_ORDER = {
    inspectorName: '',
    inspectionCompany: '',
    date: new Date().toISOString().split('T')[0],
    clientName: '',
    clientAddress: '',
    clientPostalCode: '',
    clientCity: '',
    clientContactPerson: '',
    clientPhone: '',
    clientEmail: '',
    projectLocation: '',
    projectAddress: '',
    projectPostalCode: '',
    projectCity: '',
    projectContactPerson: '',
    projectPhone: '',
    projectEmail: '',
    installationResponsible: ''
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'inspections' | 'users' | 'settings'>('inspections');
  const [inspections, setInspections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [modalTab, setModalTab] = useState<'basis' | 'klant' | 'project'>('basis');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null); // Voor inspecties
  
  // DATA LIBRARIES
  const [users, setUsers] = useState<any[]>([]);
  
  // --- STATE VOOR INSTELLINGEN ---
  const [inspectorsList, setInspectorsList] = useState<any[]>([]);
  const [companiesList, setCompaniesList] = useState<any[]>([]);
  // Voeg deze toe onder de bestaande lists:
  const [instrumentsList, setInstrumentsList] = useState<any[]>([]);
  // Voeg deze toe onder de bestaande input fields (newInspector, newCompany):
  const [newInstrument, setNewInstrument] = useState({ name: '', serial: '', calibration: '' });
  
  // Input fields
  const [newInspector, setNewInspector] = useState({ name: '', sciosNr: '' });
  const [newCompany, setNewCompany] = useState({ name: '', address: '', postalCode: '', city: '', phone: '', email: '' });
  
  // Edit state voor settings
  const [editingSettingId, setEditingSettingId] = useState<number | null>(null);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  // --------------------------------------

  const [showUserModal, setShowUserModal] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', password: '', role: 'inspector' });
  const [newOrder, setNewOrder] = useState(EMPTY_ORDER);
  
  const excelInputRef = useRef<HTMLInputElement>(null);

  // --- FETCHERS ---
  const fetchInspections = async () => {
    setLoading(true);
    const from = (page - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;
    let query = supabase.from('inspections').select('*', { count: 'exact' }).order('created_at', { ascending: false }).range(from, to);
    if (searchTerm) query = query.ilike('client_name', `%${searchTerm}%`);
    const { data, count, error } = await query;
    if (error) console.error(error);
    else { setInspections(data || []); setTotalCount(count || 0); }
    setLoading(false);
  };

  const fetchUsers = async () => {
      const { data } = await supabase.from('profiles').select('*').order('email');
      setUsers(data || []);
  };

  const fetchOptions = async () => {
      const { data } = await supabase.from('form_options').select('*').order('label');
      if (data) {
          setInspectorsList(data.filter(x => x.category === 'inspector'));
          setCompaniesList(data.filter(x => x.category === 'iv_company'));
          
          // VOEG DEZE REGEL TOE:
          setInstrumentsList(data.filter(x => x.category === 'instrument'));
      }
  };

  useEffect(() => {
    if (activeTab === 'inspections') fetchInspections();
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'settings' || showOrderModal) fetchOptions(); 
  }, [page, searchTerm, activeTab, showOrderModal]); 

  // --- ACTIES: OPTIONS MANAGEN (CRUD) ---
  
  // 1. INSPECTEURS
  const startEditInspector = (item: any) => {
      setEditingSettingId(item.id);
      setNewInspector({
          name: item.label,
          sciosNr: item.data?.sciosNr || ''
      });
  };

  const handleSaveInspector = async () => {
      if(!newInspector.name) return alert("Naam is verplicht");
      
      const payload = {
          label: newInspector.name,
          data: { sciosNr: newInspector.sciosNr }
      };

      if (editingSettingId) {
          // UPDATE bestaande
          await supabase.from('form_options').update(payload).eq('id', editingSettingId);
      } else {
          // INSERT nieuwe
          await supabase.from('form_options').insert({ category: 'inspector', ...payload });
      }
      
      setNewInspector({ name: '', sciosNr: '' });
      setEditingSettingId(null);
      fetchOptions();
  };

  // 2. BEDRIJVEN
  const startEditCompany = (item: any) => {
      setEditingSettingId(item.id);
      setNewCompany({
          name: item.label,
          address: item.data?.address || '',
          postalCode: item.data?.postalCode || '',
          city: item.data?.city || '',
          phone: item.data?.phone || '',
          email: item.data?.email || ''
      });
  };

  const handleSaveCompany = async () => {
      if(!newCompany.name) return alert("Bedrijfsnaam is verplicht");

      const payload = {
          label: newCompany.name,
          data: { 
              address: newCompany.address,
              postalCode: newCompany.postalCode,
              city: newCompany.city,
              phone: newCompany.phone,
              email: newCompany.email
          }
      };

      if (editingSettingId) {
          // UPDATE bestaande
          await supabase.from('form_options').update(payload).eq('id', editingSettingId);
      } else {
          // INSERT nieuwe
          await supabase.from('form_options').insert({ category: 'iv_company', ...payload });
      }

      setNewCompany({ name: '', address: '', postalCode: '', city: '', phone: '', email: '' });
      setEditingSettingId(null);
      fetchOptions();
  };

  // 3. MEETINSTRUMENTEN LOGICA
  const startEditInstrument = (item: any) => {
      setEditingSettingId(item.id); 
      setEditingCategory('instrument');
      setNewInstrument({ 
          name: item.label, 
          serial: item.data?.serialNumber || '', 
          calibration: item.data?.calibrationDate || '' 
      });
  };

  const handleSaveInstrument = async () => {
      if(!newInstrument.name) return alert("Naam is verplicht");
      
      const payload = { 
          label: newInstrument.name, 
          data: { 
              serialNumber: newInstrument.serial, 
              calibrationDate: newInstrument.calibration 
          } 
      };
      
      if (editingSettingId) {
          await supabase.from('form_options').update(payload).eq('id', editingSettingId);
      } else {
          await supabase.from('form_options').insert({ category: 'instrument', ...payload });
      }
      
      cancelEditSettings(); 
      fetchOptions();
  };

  const deleteOption = async (id: number) => {
      if(!window.confirm("Zeker weten verwijderen?")) return;
      await supabase.from('form_options').delete().eq('id', id);
      // Reset form if we deleted the item being edited
      if (editingSettingId === id) {
          setEditingSettingId(null);
          setNewInspector({ name: '', sciosNr: '' });
          setNewCompany({ name: '', address: '', postalCode: '', city: '', phone: '', email: '' });
      }
      fetchOptions();
  };

  const cancelEditSettings = () => {
      setEditingSettingId(null);
      setNewInspector({ name: '', sciosNr: '' });
      setNewCompany({ name: '', address: '', postalCode: '', city: '', phone: '', email: '' });
      // VOEG DEZE REGEL TOE:
      setNewInstrument({ name: '', serial: '', calibration: '' });
    };

  // --- ACTIES: INSPECTIES ---
  const handleEdit = (insp: any) => {
      const meta = insp.report_data?.meta || {};
      setNewOrder({
          inspectorName: meta.inspectorName || '',
          inspectionCompany: meta.inspectionCompany || '',
          date: meta.date || new Date().toISOString().split('T')[0],
          clientName: meta.clientName || insp.client_name || '',
          clientAddress: meta.clientAddress || '',
          clientPostalCode: meta.clientPostalCode || '',
          clientCity: meta.clientCity || '',
          clientContactPerson: meta.clientContactPerson || '',
          clientPhone: meta.clientPhone || '',
          clientEmail: meta.clientEmail || '',
          projectLocation: meta.projectLocation || '',
          projectAddress: meta.projectAddress || '',
          projectPostalCode: meta.projectPostalCode || '',
          projectCity: meta.projectCity || '',
          projectContactPerson: meta.projectContactPerson || '',
          projectPhone: meta.projectPhone || '',
          projectEmail: meta.projectEmail || '',
          installationResponsible: meta.installationResponsible || ''
      });
      setEditingId(insp.id);
      setModalTab('basis');
      setShowOrderModal(true);
  };

  const handleSaveOrder = async () => {
    if (!newOrder.clientName) return alert("Vul minimaal een klantnaam in.");
    
    const metaData = {
        clientName: newOrder.clientName,
        clientAddress: newOrder.clientAddress,
        clientPostalCode: newOrder.clientPostalCode,
        clientCity: newOrder.clientCity,
        clientContactPerson: newOrder.clientContactPerson,
        clientPhone: newOrder.clientPhone,
        clientEmail: newOrder.clientEmail,
        projectLocation: newOrder.projectLocation,
        projectAddress: newOrder.projectAddress,
        projectPostalCode: newOrder.projectPostalCode,
        projectCity: newOrder.projectCity,
        projectContactPerson: newOrder.projectContactPerson,
        projectPhone: newOrder.projectPhone,
        projectEmail: newOrder.projectEmail,
        installationResponsible: newOrder.installationResponsible,
        inspectorName: newOrder.inspectorName,
        inspectionCompany: newOrder.inspectionCompany,
        date: newOrder.date,
        totalComponents: 0,
        inspectionInterval: 5,
        usageFunctions: { 
            woonfunctie: false, bijeenkomstfunctie: false, celfunctie: false, 
            gezondheidszorgfunctie: false, industriefunctie: false, kantoorfunctie: false, 
            logiesfunctie: false, onderwijsfunctie: false, sportfunctie: false, 
            winkelfunctie: false, overigeGebruiksfunctie: false, bouwwerkGeenGebouw: false 
        },
        inspectionBasis: { nta8220: true, verzekering: false }
    };

    if (editingId) {
        const existingInsp = inspections.find(i => i.id === editingId);
        if (!existingInsp) return;
        const updatedReportData = { ...existingInsp.report_data, meta: { ...existingInsp.report_data.meta, ...metaData } };
        const { error } = await supabase.from('inspections').update({ client_name: newOrder.clientName, report_data: updatedReportData }).eq('id', editingId);
        if (error) alert("Fout bij update: " + error.message); else { alert("Wijzigingen opgeslagen!"); closeModal(); fetchInspections(); }
    } else {
        const initialData = { meta: metaData, measurements: { installationType: 'TN-S', mainFuse: '3x63A', mainsVoltage: '400 V', selectedInstruments: [] }, defects: [] };
        const { error } = await supabase.from('inspections').insert({ client_name: newOrder.clientName, status: 'new', report_data: initialData });
        if (error) alert('Fout: ' + error.message); else { alert('Opdracht aangemaakt!'); closeModal(); fetchInspections(); }
    }
  };

  const closeModal = () => { setShowOrderModal(false); setNewOrder(EMPTY_ORDER); setEditingId(null); };

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
      if (insp.status === 'completed') { newStatus = 'in_progress'; confirmMsg = `Wil je inspectie "${insp.client_name}" heropenen voor wijzigingen?`; } 
      else if (insp.status === 'review_ready') { newStatus = 'completed'; confirmMsg = `Wil je inspectie "${insp.client_name}" definitief goedkeuren en afronden?`; } 
      else { newStatus = 'completed'; confirmMsg = `Wil je inspectie "${insp.client_name}" nu al op afgerond zetten?`; }
      if(!window.confirm(confirmMsg)) return;
      const { error } = await supabase.from('inspections').update({ status: newStatus }).eq('id', insp.id);
      if(error) alert("Fout: " + error.message); else fetchInspections();
  };

  const handleExportAll = async () => {
      if (!window.confirm("Backup maken?")) return;
      const { data } = await supabase.from('inspections').select('*');
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `FULL_BACKUP_${new Date().toISOString()}.json`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const handleExcelExport = async () => {
    const { data, error } = await supabase.from('inspections').select('*');
    if (error || !data) return alert("Fout bij ophalen data.");

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Werkvoorraad');
    sheet.columns = [
        { header: 'ID (Niet wijzigen)', key: 'id', width: 10 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Datum Uitvoering', key: 'date', width: 15 },
        { header: 'Inspecteur', key: 'inspector', width: 15 },
        { header: 'IV Verantwoordelijke', key: 'iv', width: 20 },
        { header: 'Klant Naam', key: 'clientName', width: 30 },
        { header: 'Klant Adres', key: 'clientAddress', width: 25 },
        { header: 'Klant Postcode', key: 'clientPostalCode', width: 15 },
        { header: 'Klant Plaats', key: 'clientCity', width: 20 },
        { header: 'Klant Contact', key: 'clientContact', width: 20 },
        { header: 'Klant Tel', key: 'clientPhone', width: 15 },
        { header: 'Klant Email', key: 'clientEmail', width: 25 },
        { header: 'Project Locatie', key: 'projectLocation', width: 20 },
        { header: 'Project Adres', key: 'projectAddress', width: 25 },
        { header: 'Project Postcode', key: 'projectPostalCode', width: 15 },
        { header: 'Project Plaats', key: 'projectCity', width: 20 },
        { header: 'Project Contact', key: 'projectContact', width: 20 },
        { header: 'Project Tel', key: 'projectPhone', width: 15 },
        { header: 'Project Email', key: 'projectEmail', width: 25 },
    ];

    data.forEach(item => {
        const meta = item.report_data?.meta || {};
        sheet.addRow({
            id: item.id, status: item.status, date: meta.date, inspector: meta.inspectorName, iv: meta.installationResponsible,
            clientName: meta.clientName || item.client_name, clientAddress: meta.clientAddress, clientPostalCode: meta.clientPostalCode, clientCity: meta.clientCity, clientContact: meta.clientContactPerson, clientPhone: meta.clientPhone, clientEmail: meta.clientEmail,
            projectLocation: meta.projectLocation, projectAddress: meta.projectAddress, projectPostalCode: meta.projectPostalCode, projectCity: meta.projectCity, projectContact: meta.projectContactPerson, projectPhone: meta.projectPhone, projectEmail: meta.projectEmail
        });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `Werkvoorraad_Compleet_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const handleExcelImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const workbook = new ExcelJS.Workbook();
      const buffer = await file.arrayBuffer();
      await workbook.xlsx.load(buffer);
      const sheet = workbook.getWorksheet(1); 
      if (!sheet) return alert("Leeg Excel bestand.");

      const headers: {[key: number]: string} = {};
      sheet.getRow(1).eachCell((cell, colNumber) => { headers[colNumber] = cell.value?.toString().toLowerCase() || ''; });

      const newInspections: any[] = [];
      sheet.eachRow((row, rowNumber) => {
          if (rowNumber === 1) return; 
          const getVal = (headerName: string) => {
              const colIndex = Object.keys(headers).find(key => headers[parseInt(key)] === headerName.toLowerCase());
              if (!colIndex) return '';
              const cell = row.getCell(parseInt(colIndex));
              if (cell.value && typeof cell.value === 'object' && 'text' in cell.value) { return (cell.value as any).text.toString(); }
              return cell.value ? cell.value.toString() : '';
          };
          const clientName = getVal('Klant Naam') || 'Onbekend';
          if (clientName === 'Onbekend' && !getVal('ID')) return; 
          if (!getVal('ID')) {
              newInspections.push({
                  client_name: clientName, status: 'new', report_data: {
                      meta: {
                          date: getVal('Datum Uitvoering') || new Date().toISOString().split('T')[0], inspectorName: getVal('Inspecteur'), installationResponsible: getVal('IV Verantwoordelijke'),
                          clientName: clientName, clientAddress: getVal('Klant Adres'), clientPostalCode: getVal('Klant Postcode'), clientCity: getVal('Klant Plaats'), clientContactPerson: getVal('Klant Contact'), clientPhone: getVal('Klant Tel'), clientEmail: getVal('Klant Email'),
                          projectLocation: getVal('Project Locatie'), projectAddress: getVal('Project Adres'), projectPostalCode: getVal('Project Postcode'), projectCity: getVal('Project Plaats'), projectContactPerson: getVal('Project Contact'), projectPhone: getVal('Project Tel'), projectEmail: getVal('Project Email'),
                          inspectionInterval: 5, totalComponents: 0, 
                          usageFunctions: { kantoorfunctie: false },
                          inspectionBasis: { nta8220: true, verzekering: false }
                      }, measurements: { installationType: 'TN-S', mainFuse: '3x63A', mainsVoltage: '400 V', selectedInstruments: [] }, defects: []
                  }
              });
          }
      });

      if (newInspections.length > 0) {
          if (!window.confirm(`Er zijn ${newInspections.length} nieuwe opdrachten gevonden. Importeren?`)) return;
          let success = 0;
          for (const insp of newInspections) { const { error } = await supabase.from('inspections').insert(insp); if (!error) success++; }
          alert(`✅ Klaar! ${success} opdrachten toegevoegd.`); fetchInspections();
      } else { alert("Geen nieuwe opdrachten gevonden in de Excel."); }
      e.target.value = '';
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
      if (!window.confirm(`Rol wijzigen naar ${newRole}?`)) return;
      const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
      if (error) alert("Fout: " + error.message); else { alert("Rol aangepast!"); fetchUsers(); }
  };
  const handleCreateUser = async () => {
      if (!newUser.email || !newUser.password) return alert("Vul email en wachtwoord in.");
      const { data: userId, error } = await supabase.rpc('create_user', { email: newUser.email, password: newUser.password });
      if (error) { alert("Fout bij aanmaken: " + error.message); return; }
      if (userId && newUser.role === 'admin') { await supabase.from('profiles').update({ role: 'admin' }).eq('id', userId); }
      alert(`Gebruiker ${newUser.email} aangemaakt als ${newUser.role}!`); setShowUserModal(false); setNewUser({ email: '', password: '', role: 'inspector' }); fetchUsers(); 
  };
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div><h1 className="text-3xl font-bold text-gray-800">Kantoor Dashboard</h1><p className="text-gray-500">Beheer {totalCount} inspecties</p></div>
          <div className="flex gap-3">
             {activeTab === 'inspections' && (
                 <>
                    <button onClick={() => excelInputRef.current?.click()} className="flex items-center gap-2 bg-green-600 px-4 py-2 rounded shadow text-white hover:bg-green-700 font-bold whitespace-nowrap border border-green-700"><FileSpreadsheet size={18} /> Import Excel</button>
                    <input type="file" ref={excelInputRef} onChange={handleExcelImport} accept=".xlsx, .xls" className="hidden" />
                    <button onClick={handleExcelExport} className="flex items-center gap-2 bg-white px-4 py-2 rounded shadow text-green-700 hover:bg-green-50 font-bold whitespace-nowrap border border-green-200"><Download size={18} /> Export Excel</button>
                    <button onClick={handleExportAll} className="flex items-center gap-2 bg-gray-700 px-4 py-2 rounded shadow text-white hover:bg-gray-800 font-bold border border-gray-600" title="Volledige Backup"><Database size={18} /> Backup</button>
                    <button onClick={() => { setNewOrder(EMPTY_ORDER); setShowOrderModal(true); }} className="flex items-center gap-2 bg-emerald-600 px-4 py-2 rounded shadow text-white hover:bg-emerald-700 font-bold whitespace-nowrap"><Plus size={18} /> Nieuw</button>
                 </>
             )}
          </div>
        </div>

        <div className="flex gap-4 mb-6 border-b border-gray-300">
            <button onClick={() => setActiveTab('inspections')} className={`pb-2 px-4 font-bold flex items-center gap-2 ${activeTab === 'inspections' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}><FileText size={18}/> Inspecties</button>
            <button onClick={() => setActiveTab('users')} className={`pb-2 px-4 font-bold flex items-center gap-2 ${activeTab === 'users' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}><Users size={18}/> Gebruikersbeheer</button>
            <button onClick={() => setActiveTab('settings')} className={`pb-2 px-4 font-bold flex items-center gap-2 ${activeTab === 'settings' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}><Settings size={18}/> Instellingen</button>
        </div>

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
                    <thead className="bg-gray-50 border-b"><tr><th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Datum</th><th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Klant / Project</th><th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Status</th><th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Inspecteur</th><th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Acties</th></tr></thead>
                    <tbody className="divide-y divide-gray-200">
                        {inspections.map((insp) => (
                        <tr key={insp.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm text-gray-500"><div className="flex items-center gap-2"><Calendar size={16} />{insp.report_data?.meta?.date}</div></td>
                            <td className="px-6 py-4"><div className="text-sm font-bold text-gray-900">{insp.client_name}</div><div className="text-xs text-gray-500 flex items-center gap-1"><MapPin size={12}/> {insp.report_data?.meta?.projectCity || insp.report_data?.meta?.clientCity}</div></td>
                            <td className="px-6 py-4 cursor-pointer select-none" onClick={() => toggleStatus(insp)} title="Klik om te wijzigen">
                                {(!insp.status || insp.status === 'new') && <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-bold border border-blue-200">Nieuw</span>}
                                {insp.status === 'in_progress' && <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded font-bold border border-orange-200 flex items-center gap-1 w-fit"><RefreshCw size={12} className="animate-spin"/> Bezig...</span>}
                                {insp.status === 'review_ready' && <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded font-bold border border-purple-200 shadow-sm flex items-center gap-1 w-fit"><FileText size={12}/> Review Klaar</span>}
                                {insp.status === 'completed' && <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-bold border border-green-200 flex items-center gap-1 w-fit"><Lock size={12}/> Afgerond</span>}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500"><User size={16} className="inline"/> {insp.report_data?.meta?.inspectorName || '-'}</td>
                            <td className="px-6 py-4 text-right text-sm font-medium flex justify-end gap-3">
                                <button onClick={() => handleEdit(insp)} className="text-blue-500 hover:text-blue-700" title="Bewerken"><Pencil size={16}/></button>
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
                    <div className="flex items-center gap-2"><Shield size={18}/> <span>Beheer toegang tot dashboard (Admin) of app (Inspector).</span></div>
                    <button onClick={() => setShowUserModal(true)} className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1 rounded shadow text-xs font-bold hover:bg-blue-700"><UserPlus size={16} /> Gebruiker Toevoegen</button>
                </div>
                <table className="min-w-full">
                    <thead className="bg-gray-50 border-b"><tr><th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Email</th><th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Huidige Rol</th><th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Wijzig Rol</th></tr></thead>
                    <tbody className="divide-y divide-gray-200">{users.map(u => (<tr key={u.id}><td className="px-6 py-4 text-sm font-bold text-gray-700">{u.email}</td><td className="px-6 py-4 text-sm">{u.role === 'admin' ? <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-bold border border-purple-200">ADMIN</span> : <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-bold border border-gray-200">INSPECTOR</span>}</td><td className="px-6 py-4 text-sm"><select className="border rounded p-1 text-sm bg-white" value={u.role} onChange={(e) => handleRoleChange(u.id, e.target.value)}><option value="inspector">Inspector</option><option value="admin">Admin</option></select></td></tr>))}</tbody>
                </table>
            </div>
        )}

        {/* TAB: INSTELLINGEN */}
        {activeTab === 'settings' && (
             <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                 {/* 1. INSPECTEURS */}
                 <div className="bg-white rounded-lg shadow p-6 h-fit">
                     <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2"><User size={20}/> Inspecteurs</h2>
                     <div className="bg-gray-50 p-4 rounded border mb-4 space-y-3">
                         <div>
                             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Naam Inspecteur</label>
                             <input className="w-full border rounded p-2 text-sm" value={newInspector.name} onChange={e => setNewInspector({...newInspector, name: e.target.value})} disabled={editingSettingId !== null && editingCategory !== 'inspector'} />
                         </div>
                         <div>
                             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">SCIOS Nummer</label>
                             <input className="w-full border rounded p-2 text-sm" value={newInspector.sciosNr} onChange={e => setNewInspector({...newInspector, sciosNr: e.target.value})} disabled={editingSettingId !== null && editingCategory !== 'inspector'} />
                         </div>
                         
                         <div className="flex gap-2 pt-2">
                             <button onClick={handleSaveInspector} disabled={editingSettingId !== null && editingCategory !== 'inspector'} className={`flex-1 py-2 rounded font-bold text-sm text-white ${editingSettingId && editingCategory === 'inspector' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50'}`}>
                                {editingSettingId && editingCategory === 'inspector' ? 'Opslaan' : 'Toevoegen'}
                             </button>
                             {editingSettingId && editingCategory === 'inspector' && <button onClick={cancelEditSettings} className="px-4 bg-gray-300 rounded font-bold text-sm text-gray-700">X</button>}
                         </div>
                     </div>
                     <ul className="divide-y max-h-[400px] overflow-y-auto">
                         {inspectorsList.map((item) => (
                             <li key={item.id} className="py-3 flex justify-between items-start text-gray-700">
                                 <div>
                                     <div className="font-bold">{item.label}</div>
                                     {item.data?.sciosNr && <div className="text-xs text-gray-500">SCIOS: {item.data.sciosNr}</div>}
                                 </div>
                                 <div className="flex gap-2">
                                     <button onClick={() => startEditInspector(item)} className="text-blue-400 hover:text-blue-600"><Pencil size={16}/></button>
                                     <button onClick={() => deleteOption(item.id)} className="text-red-400 hover:text-red-600"><Trash2 size={16}/></button>
                                 </div>
                             </li>
                         ))}
                         {inspectorsList.length === 0 && <li className="text-gray-400 text-sm italic py-2">Lijst is leeg.</li>}
                     </ul>
                 </div>

                 {/* 2. INSPECTIEBEDRIJVEN */}
                 <div className="bg-white rounded-lg shadow p-6 h-fit">
                     <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2"><Building size={20}/> Inspectiebedrijven</h2>
                     <div className="bg-gray-50 p-4 rounded border mb-4 space-y-3">
                         <div>
                             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Bedrijfsnaam</label>
                             <input className="w-full border rounded p-2 text-sm font-bold" value={newCompany.name} onChange={e => setNewCompany({...newCompany, name: e.target.value})} disabled={editingSettingId !== null && editingCategory !== 'iv_company'} />
                         </div>
                         <div>
                             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Adres</label>
                             <input className="w-full border rounded p-2 text-sm" value={newCompany.address} onChange={e => setNewCompany({...newCompany, address: e.target.value})} disabled={editingSettingId !== null && editingCategory !== 'iv_company'} />
                         </div>
                         <div className="flex gap-2">
                             <div className="w-1/3">
                                 <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Postcode</label>
                                 <input className="w-full border rounded p-2 text-sm" value={newCompany.postalCode} onChange={e => setNewCompany({...newCompany, postalCode: e.target.value})} disabled={editingSettingId !== null && editingCategory !== 'iv_company'} />
                             </div>
                             <div className="w-2/3">
                                 <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Plaats</label>
                                 <input className="w-full border rounded p-2 text-sm" value={newCompany.city} onChange={e => setNewCompany({...newCompany, city: e.target.value})} disabled={editingSettingId !== null && editingCategory !== 'iv_company'} />
                             </div>
                         </div>
                         <div className="flex gap-2">
                             <div className="w-1/2">
                                 <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Telefoon</label>
                                 <input className="w-full border rounded p-2 text-sm" value={newCompany.phone} onChange={e => setNewCompany({...newCompany, phone: e.target.value})} disabled={editingSettingId !== null && editingCategory !== 'iv_company'} />
                             </div>
                             <div className="w-1/2">
                                 <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
                                 <input className="w-full border rounded p-2 text-sm" value={newCompany.email} onChange={e => setNewCompany({...newCompany, email: e.target.value})} disabled={editingSettingId !== null && editingCategory !== 'iv_company'} />
                             </div>
                         </div>
                         
                         <div className="flex gap-2 pt-2">
                             <button onClick={handleSaveCompany} disabled={editingSettingId !== null && editingCategory !== 'iv_company'} className={`w-full py-2 rounded font-bold text-sm text-white ${editingSettingId && editingCategory === 'iv_company' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50'}`}>
                                {editingSettingId && editingCategory === 'iv_company' ? 'Opslaan' : 'Toevoegen'}
                             </button>
                             {editingSettingId && editingCategory === 'iv_company' && <button onClick={cancelEditSettings} className="w-auto px-4 bg-gray-300 rounded font-bold text-xs text-gray-700">X</button>}
                         </div>
                     </div>
                     <ul className="divide-y max-h-[400px] overflow-y-auto">
                         {companiesList.map((item) => (
                             <li key={item.id} className="py-3 flex justify-between items-start text-gray-700">
                                 <div>
                                     <div className="font-bold text-sm">{item.label}</div>
                                     <div className="text-xs text-gray-500">{item.data?.address}, {item.data?.city}</div>
                                 </div>
                                 <div className="flex gap-2">
                                     <button onClick={() => startEditCompany(item)} className="text-blue-400 hover:text-blue-600"><Pencil size={16}/></button>
                                     <button onClick={() => deleteOption(item.id)} className="text-red-400 hover:text-red-600"><Trash2 size={16}/></button>
                                 </div>
                             </li>
                         ))}
                         {companiesList.length === 0 && <li className="text-gray-400 text-sm italic py-2">Lijst is leeg.</li>}
                     </ul>
                 </div>

                 {/* 3. MEETINSTRUMENTEN (AANGEPAST MET LABELS) */}
                 <div className="bg-white rounded-lg shadow p-6 h-fit">
                     <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2"><Wrench size={20}/> Meetinstrumenten</h2>
                     <div className="bg-gray-50 p-4 rounded border mb-4 space-y-3">
                         <div>
                             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Naam/Type</label>
                             <input className="w-full border rounded p-2 text-sm font-bold" value={newInstrument.name} onChange={e => setNewInstrument({...newInstrument, name: e.target.value})} disabled={editingSettingId !== null && editingCategory !== 'instrument'} />
                         </div>
                         <div>
                             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Serienr</label>
                             <input className="w-full border rounded p-2 text-sm" value={newInstrument.serial} onChange={e => setNewInstrument({...newInstrument, serial: e.target.value})} disabled={editingSettingId !== null && editingCategory !== 'instrument'} />
                         </div>
                         <div>
                             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Kalibratie-/Controledatum</label>
                             <input className="w-full border rounded p-2 text-sm" type="date" value={newInstrument.calibration} onChange={e => setNewInstrument({...newInstrument, calibration: e.target.value})} disabled={editingSettingId !== null && editingCategory !== 'instrument'} />
                         </div>
                         
                         <div className="flex gap-2 pt-2">
                             <button onClick={handleSaveInstrument} disabled={editingSettingId !== null && editingCategory !== 'instrument'} className={`flex-1 py-2 rounded font-bold text-sm text-white ${editingSettingId && editingCategory === 'instrument' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50'}`}>
                                {editingSettingId && editingCategory === 'instrument' ? 'Opslaan' : 'Toevoegen'}
                             </button>
                             {editingSettingId && editingCategory === 'instrument' && <button onClick={cancelEditSettings} className="px-4 bg-gray-300 rounded font-bold text-sm text-gray-700">X</button>}
                         </div>
                     </div>
                     <ul className="divide-y max-h-[400px] overflow-y-auto">
                         {instrumentsList.map((item) => (
                             <li key={item.id} className="py-3 flex justify-between items-start text-gray-700">
                                 <div>
                                     <div className="font-bold text-sm">{item.label}</div>
                                     <div className="text-xs text-gray-500">SN: {item.data?.serialNumber} | {item.data?.calibrationDate}</div>
                                 </div>
                                 <div className="flex gap-2"><button onClick={() => startEditInstrument(item)} className="text-blue-400 hover:text-blue-600"><Pencil size={16}/></button><button onClick={() => deleteOption(item.id)} className="text-red-400 hover:text-red-600"><Trash2 size={16}/></button></div>
                             </li>
                         ))}
                         {instrumentsList.length === 0 && <li className="text-gray-400 text-sm italic py-2">Lijst is leeg.</li>}
                     </ul>
                 </div>
             </div>
        )}

        {/* MODAL 1: NIEUWE OPDRACHT (AANGEPAST) */}
        {showOrderModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-0 animate-fadeIn overflow-hidden flex flex-col max-h-[90vh]">
                    <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                        <h2 className="text-xl font-bold text-gray-800">{editingId ? 'Opdracht Bewerken' : 'Nieuwe Inspectie'}</h2>
                        <button onClick={closeModal}><X size={24} className="text-gray-400 hover:text-gray-600"/></button>
                    </div>
                    
                    {/* MODAL TABS: Projectlocatie hernoemd naar Projectgegevens */}
                    <div className="flex border-b bg-gray-100">
                        <button onClick={() => setModalTab('basis')} className={`flex-1 py-3 font-bold text-sm ${modalTab === 'basis' ? 'bg-white text-emerald-600 border-t-2 border-t-emerald-600' : 'text-gray-500 hover:bg-gray-50'}`}>1. Basis & Planning</button>
                        <button onClick={() => setModalTab('klant')} className={`flex-1 py-3 font-bold text-sm ${modalTab === 'klant' ? 'bg-white text-emerald-600 border-t-2 border-t-emerald-600' : 'text-gray-500 hover:bg-gray-50'}`}>2. Opdrachtgever</button>
                        <button onClick={() => setModalTab('project')} className={`flex-1 py-3 font-bold text-sm ${modalTab === 'project' ? 'bg-white text-emerald-600 border-t-2 border-t-emerald-600' : 'text-gray-500 hover:bg-gray-50'}`}>3. Projectgegevens</button>
                    </div>

                    <div className="p-6 overflow-y-auto">
                        {/* TAB 1: BASIS (IV Verantwoordelijke is hier weggehaald) */}
                        {modalTab === 'basis' && (
                            <div className="space-y-4">
                                <div className="bg-blue-50 p-3 rounded border border-blue-100 mb-4 text-sm text-blue-800">Vul hier in wie de inspectie gaat doen en wanneer.</div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Datum Uitvoering</label><input type="date" className="w-full border rounded p-2" value={newOrder.date} onChange={e => setNewOrder({...newOrder, date: e.target.value})} /></div>
                                    
                                    {/* INSPECTEUR KIEZER */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Inspecteur</label>
                                        <input list="inspectors-list-modal" className="w-full border rounded p-2" placeholder="Kies of typ..." value={newOrder.inspectorName} onChange={e => setNewOrder({...newOrder, inspectorName: e.target.value})} />
                                        <datalist id="inspectors-list-modal">
                                            {inspectorsList.map((item) => <option key={item.id} value={item.label} />)}
                                        </datalist>
                                    </div>
                                </div>

                                {/* INSPECTIEBEDRIJF KIEZER */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Uitvoerend Inspectiebedrijf</label>
                                    <input list="companies-list-modal" className="w-full border rounded p-2" placeholder="Kies of typ..." value={newOrder.inspectionCompany} onChange={e => setNewOrder({...newOrder, inspectionCompany: e.target.value})} />
                                    <datalist id="companies-list-modal">
                                        {companiesList.map((item) => <option key={item.id} value={item.label} />)}
                                    </datalist>
                                </div>
                            </div>
                        )}

                        {/* TAB 2: KLANT (Ongewijzigd) */}
                        {modalTab === 'klant' && (
                            <div className="space-y-4">
                                <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Klantnaam (Verplicht)</label><input className="w-full border rounded p-2 border-emerald-500" placeholder="Bijv. Bakkerij Jansen BV" value={newOrder.clientName} onChange={e => setNewOrder({...newOrder, clientName: e.target.value})} autoFocus /></div>
                                <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Adres</label><input className="w-full border rounded p-2" placeholder="Straat + Nr" value={newOrder.clientAddress} onChange={e => setNewOrder({...newOrder, clientAddress: e.target.value})} /></div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="col-span-1"><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Postcode</label><input className="w-full border rounded p-2" placeholder="1234 AB" value={newOrder.clientPostalCode} onChange={e => setNewOrder({...newOrder, clientPostalCode: e.target.value})} /></div>
                                    <div className="col-span-2"><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Plaats</label><input className="w-full border rounded p-2" placeholder="Stad" value={newOrder.clientCity} onChange={e => setNewOrder({...newOrder, clientCity: e.target.value})} /></div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Contactpersoon</label><input className="w-full border rounded p-2" placeholder="Naam" value={newOrder.clientContactPerson} onChange={e => setNewOrder({...newOrder, clientContactPerson: e.target.value})} /></div>
                                    <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label><input className="w-full border rounded p-2" placeholder="Email" value={newOrder.clientEmail} onChange={e => setNewOrder({...newOrder, clientEmail: e.target.value})} /></div>
                                </div>
                                <div className="grid grid-cols-2 gap-4"><div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Telefoonnummer</label><input className="w-full border rounded p-2" placeholder="06..." value={newOrder.clientPhone} onChange={e => setNewOrder({...newOrder, clientPhone: e.target.value})} /></div></div>
                            </div>
                        )}

                        {/* TAB 3: PROJECTGEGEVENS (IV Verantwoordelijke hier toegevoegd) */}
                        {modalTab === 'project' && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-2"><input type="checkbox" id="copyClient" className="h-4 w-4 text-emerald-600" onChange={(e) => { if(e.target.checked) setNewOrder({...newOrder, projectLocation: newOrder.clientName, projectAddress: newOrder.clientAddress, projectPostalCode: newOrder.clientPostalCode, projectCity: newOrder.clientCity, projectContactPerson: newOrder.clientContactPerson, projectEmail: newOrder.clientEmail, projectPhone: newOrder.clientPhone}); }} /><label htmlFor="copyClient" className="text-sm text-gray-600 cursor-pointer">Neem gegevens over van Opdrachtgever</label></div>
                                <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Locatie Naam</label><input className="w-full border rounded p-2" placeholder="Bijv. Hoofdkantoor" value={newOrder.projectLocation} onChange={e => setNewOrder({...newOrder, projectLocation: e.target.value})} /></div>
                                
                                {/* IV VERANTWOORDELIJKE HIER NAARTOE VERPLAATST */}
                                <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">IV Verantwoordelijke (Klantzijde)</label><input className="w-full border rounded p-2" placeholder="Naam Installatieverantwoordelijke" value={newOrder.installationResponsible} onChange={e => setNewOrder({...newOrder, installationResponsible: e.target.value})} /></div>
                                
                                <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Project Adres</label><input className="w-full border rounded p-2" placeholder="Straat + Nr" value={newOrder.projectAddress} onChange={e => setNewOrder({...newOrder, projectAddress: e.target.value})} /></div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="col-span-1"><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Postcode</label><input className="w-full border rounded p-2" placeholder="1234 AB" value={newOrder.projectPostalCode} onChange={e => setNewOrder({...newOrder, projectPostalCode: e.target.value})} /></div>
                                    <div className="col-span-2"><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Plaats</label><input className="w-full border rounded p-2" placeholder="Stad" value={newOrder.projectCity} onChange={e => setNewOrder({...newOrder, projectCity: e.target.value})} /></div>
                                </div>
                                <div className="grid grid-cols-2 gap-4"><div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Contactpersoon</label><input className="w-full border rounded p-2" placeholder="Naam" value={newOrder.projectContactPerson} onChange={e => setNewOrder({...newOrder, projectContactPerson: e.target.value})} /></div><div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label><input className="w-full border rounded p-2" placeholder="Email" value={newOrder.projectEmail} onChange={e => setNewOrder({...newOrder, projectEmail: e.target.value})} /></div></div>
                                <div className="grid grid-cols-2 gap-4"><div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Telefoonnummer</label><input className="w-full border rounded p-2" placeholder="06..." value={newOrder.projectPhone} onChange={e => setNewOrder({...newOrder, projectPhone: e.target.value})} /></div></div>
                            </div>
                        )}
                    </div>

                    <div className="p-6 border-t bg-gray-50 flex gap-3">
                        <button onClick={() => setShowOrderModal(false)} className="flex-1 bg-gray-200 py-3 rounded font-bold text-gray-700 hover:bg-gray-300">Annuleren</button>
                        <button onClick={handleSaveOrder} className="flex-1 bg-emerald-600 text-white py-3 rounded font-bold hover:bg-emerald-700 shadow">{editingId ? 'Wijzigingen Opslaan' : 'Opdracht Aanmaken'}</button>
                    </div>
                </div>
            </div>
        )}
        
        {showUserModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 animate-fadeIn">
                    <div className="flex justify-between items-center mb-4 border-b pb-2"><h2 className="text-lg font-bold text-blue-800 flex items-center gap-2"><UserPlus size={20}/> Nieuwe Gebruiker</h2><button onClick={() => setShowUserModal(false)}><X size={24}/></button></div>
                    <div className="space-y-4"><div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">E-mailadres</label><input className="w-full border rounded p-2" type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} autoFocus /></div><div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Wachtwoord</label><input className="w-full border rounded p-2" type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} /></div><div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Rol</label><select className="w-full border rounded p-2 bg-white" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}><option value="inspector">Inspector</option><option value="admin">Admin</option></select></div></div>
                    <div className="mt-6 flex gap-3"><button onClick={() => setShowUserModal(false)} className="flex-1 bg-gray-200 py-2 rounded font-bold">Annuleren</button><button onClick={handleCreateUser} className="flex-1 bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700">Toevoegen</button></div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}