import { useEffect, useState, useRef } from 'react'; 
import { supabase } from '../supabase';
import { Calendar, User, Download, RefreshCw, Plus, X, MapPin, Trash2, Lock, FileText, Search, ChevronLeft, ChevronRight, Database, Users, Shield, UserPlus, FileSpreadsheet, Pencil, Settings, Building, Wrench, Key, ArrowUpDown, ArrowUp, ArrowDown, CheckCircle, Hash, Mail, Phone, Briefcase, Clock } from 'lucide-react';
import { pdf } from '@react-pdf/renderer'; 
import { PDFReport } from './PDFReport';
import ExcelJS from 'exceljs';

const ITEMS_PER_PAGE = 20;

// HELPER: Datum altijd naar YYYY-MM-DD forceren (nodig voor Browser Input & Consistentie)
const normalizeDate = (input: any): string => {
    if (!input) return '';
    const text = input.toString().trim();
    
    // 1. Is het al YYYY-MM-DD? Klaar.
    if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;

    // 2. Is het DD-MM-YYYY of DD/MM/YYYY? (Excel stijl)
    const match = text.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
    if (match) {
        const day = match[1].padStart(2, '0');
        const month = match[2].padStart(2, '0');
        const year = match[3];
        return `${year}-${month}-${day}`;
    }

    // 3. Is het een volledige ISO string (bijv uit database created_at)?
    try {
        const d = new Date(text);
        if (!isNaN(d.getTime())) {
            return d.toISOString().split('T')[0];
        }
    } catch (e) {
        // Fallback
    }

    return text; // Geef origineel terug als we het niet snappen (voorkomt wissen data)
};

// HELPER: Volledige datum en tijd voor de 'Geupdate' kolom
const formatDateTime = (input: any): string => {
    if (!input) return '-';
    const d = new Date(input);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleString('nl-NL', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
    });
};

// Standaard waarden
const EMPTY_ORDER = {
    inspectorName: '', sciosRegistrationNumber: '',
    inspectionCompany: '', inspectionCompanyAddress: '', inspectionCompanyPostalCode: '', inspectionCompanyCity: '', inspectionCompanyPhone: '', inspectionCompanyEmail: '',
    date: new Date().toISOString().split('T')[0],
    clientName: '', clientAddress: '', clientPostalCode: '', clientCity: '', clientContactPerson: '', clientPhone: '', clientEmail: '',
    projectLocation: '', projectAddress: '', projectPostalCode: '', projectCity: '', projectContactPerson: '', projectPhone: '', projectEmail: '', installationResponsible: ''
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'inspections' | 'users' | 'settings'>('inspections');
  const [inspections, setInspections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // MODAL STATES
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [modalTab, setModalTab] = useState<'basis' | 'klant' | 'project'>('basis');
  const [newOrder, setNewOrder] = useState(EMPTY_ORDER);
  const [editingId, setEditingId] = useState<number | null>(null); 
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  
  // SORT & SEARCH
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'created_at', direction: 'desc' });
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // SETTINGS & AUTH STATES
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordResetUser, setPasswordResetUser] = useState<{id: string, email: string} | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  
  // Options Lists
  const [inspectorsList, setInspectorsList] = useState<any[]>([]);
  const [companiesList, setCompaniesList] = useState<any[]>([]);
  const [instrumentsList, setInstrumentsList] = useState<any[]>([]);
  
  // New Item States
  const [newInstrument, setNewInstrument] = useState({ name: '', serial: '', calibration: '' });
  const [newInspector, setNewInspector] = useState({ name: '', sciosNr: '' });
  const [newCompany, setNewCompany] = useState({ name: '', address: '', postalCode: '', city: '', phone: '', email: '' });
  
  const [editingSettingId, setEditingSettingId] = useState<number | null>(null);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', password: '', role: 'inspector' });
  
  const excelInputRef = useRef<HTMLInputElement>(null);
  
  // --- FETCHERS ---
  const fetchInspections = async () => {
    setLoading(true);
    const from = (page - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;
    
    let query = supabase.from('inspections').select('*', { count: 'exact' });

    // 1. ZOEKFUNCTIE
    if (searchTerm) {
        query = query.or(`client_name.ilike.%${searchTerm}%, inspection_number.ilike.%${searchTerm}%, report_data->meta->>projectCity.ilike.%${searchTerm}%, report_data->meta->>projectLocation.ilike.%${searchTerm}%, report_data->meta->>inspectorName.ilike.%${searchTerm}%`);
    }

    // 2. SERVER-SIDE SORTERING
    if (sortConfig.key === 'created_at') {
        query = query.order('created_at', { ascending: sortConfig.direction === 'asc' });
    } else if (sortConfig.key === 'updated_at') {
        query = query.order('updated_at', { ascending: sortConfig.direction === 'asc' });
    } else if (sortConfig.key === 'date_start') {
        query = query.order('report_data->meta->>date', { ascending: sortConfig.direction === 'asc' });
    } else if (sortConfig.key === 'date_finalized') {
        query = query.order('report_data->meta->>finalizedDate', { ascending: sortConfig.direction === 'asc' });
    } else if (sortConfig.key === 'client_name' || sortConfig.key === 'status') {
        query = query.order(sortConfig.key, { ascending: sortConfig.direction === 'asc' });
    } else if (sortConfig.key === 'project_location') {
        query = query.order('report_data->meta->>projectLocation', { ascending: sortConfig.direction === 'asc' });
    } else if (sortConfig.key === 'project_city') {
        query = query.order('report_data->meta->>projectCity', { ascending: sortConfig.direction === 'asc' });
    } else if (sortConfig.key !== 'inspection_number' && sortConfig.key !== 'inspector') {
        query = query.order('created_at', { ascending: false });
    }

    query = query.range(from, to);

    const { data, count, error } = await query;
    
    if (error) { 
        console.error(error); 
    } else { 
        let finalData = data || [];

        // 3. CLIENT-SIDE SORTERING (Voor complexe velden)
        
        // A. Sorteren op Inspecteur Naam (Zat er al in)
        if (sortConfig.key === 'inspector') {
            finalData.sort((a, b) => {
                const nameA = a.report_data?.meta?.inspectorName || '';
                const nameB = b.report_data?.meta?.inspectorName || '';
                return sortConfig.direction === 'asc' 
                    ? nameA.localeCompare(nameB) 
                    : nameB.localeCompare(nameA);
            });
        }

        // B. NIEUW: Sorteren op Inspectie ID (Natuurlijke Sortering)
        // Dit zorgt dat ...-2 voor ...-10 komt.
        if (sortConfig.key === 'inspection_number') {
            finalData.sort((a, b) => {
                const idA = a.inspection_number || '';
                const idB = b.inspection_number || '';
                
                // Gebruik 'numeric: true' voor logische nummer-sortering
                return sortConfig.direction === 'asc'
                    ? idA.localeCompare(idB, undefined, { numeric: true, sensitivity: 'base' })
                    : idB.localeCompare(idA, undefined, { numeric: true, sensitivity: 'base' });
            });
        }

        setInspections(finalData); 
        setTotalCount(count || 0); 
    }
    setLoading(false);
  };

  const handleSort = (key: string) => {
      setSortConfig(current => ({ key, direction: current.key === key && current.direction === 'desc' ? 'asc' : 'desc' }));
      setPage(1);
  };
    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        if (window.confirm(`Weet je zeker dat je ${selectedIds.length} inspecties wilt verwijderen?`)) {
            const { error } = await supabase.from('inspections').delete().in('id', selectedIds);
            if (error) {
                alert("Fout bij bulkverwijdering: " + error.message);
            } else {
                alert(`${selectedIds.length} inspecties verwijderd.`);
                setSelectedIds([]);
                fetchInspections();
            }
       }
  };

  const handleBulkDownloadPDFs = async () => {
    if (selectedIds.length === 0) return;
    
    // Zoek de volledige data op voor de geselecteerde IDs
    const selectedInspections = inspections.filter(insp => selectedIds.includes(insp.id));
    
    for (const insp of selectedInspections) {
      try {
        const doc = <PDFReport 
          meta={insp.report_data.meta} 
          measurements={insp.report_data.measurements} 
          defects={insp.report_data.defects} 
        />;
        const blob = await pdf(doc).toBlob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Inspectierapport_${insp.report_data.meta.clientName || 'Onbekend'}_${insp.id}.pdf`;
        link.click();
        URL.revokeObjectURL(url);
        // Kleine pauze tussen downloads om browser-blocking te voorkomen
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (err) {
        console.error(`Fout bij genereren PDF voor ID ${insp.id}:`, err);
      }
    }
  };
    

    const toggleSelectAll = () => {
        if (selectedIds.length === inspections.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(inspections.map(insp => insp.id));
        }
    };

    const toggleSelectRow = (id: number) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]);
    };

  const SortableHeader = ({ label, sortKey, width }: { label: string, sortKey: string, width?: string }) => (
      <th className={`px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase cursor-pointer hover:bg-gray-100 transition-colors select-none ${width}`} onClick={() => handleSort(sortKey)}>
          <div className="flex items-center gap-1">{label} {sortConfig.key === sortKey ? (sortConfig.direction === 'asc' ? <ArrowUp size={14}/> : <ArrowDown size={14}/>) : (<ArrowUpDown size={14} className="text-gray-300"/>)}</div>
      </th>
  );

  const fetchUsers = async () => { const { data } = await supabase.from('profiles').select('*').order('email'); setUsers(data || []); };
  const fetchOptions = async () => {
      const { data } = await supabase.from('form_options').select('*').order('label');
      if (data) {
          setInspectorsList(data.filter(x => x.category === 'inspector'));
          setCompaniesList(data.filter(x => x.category === 'iv_company'));
          setInstrumentsList(data.filter(x => x.category === 'instrument'));
      }
  };

  const handleDeleteUser = async (userId: string) => { if (window.confirm("⚠️ WAARSCHUWING ⚠️\n\nGebruiker verwijderen?")) { await supabase.rpc('delete_user', { user_id: userId }); fetchUsers(); } };
  const openPasswordModal = (user: any) => { setPasswordResetUser({ id: user.id, email: user.email }); setNewPasswordInput(''); setShowPasswordModal(true); };
  const handleResetPassword = async () => { 
      if (!passwordResetUser || !newPasswordInput) return;
      const { data: sessionData } = await supabase.auth.getSession();
      const { error } = await supabase.functions.invoke('admin-reset-password', { body: { userId: passwordResetUser.id, newPassword: newPasswordInput }, headers: { Authorization: `Bearer ${sessionData.session?.access_token}` } });
      if (error) alert("Fout: " + error.message); else { alert("✅ Gewijzigd!"); setShowPasswordModal(false); }
  };

  useEffect(() => {
    if (activeTab === 'inspections') fetchInspections();
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'settings' || showOrderModal) fetchOptions(); 
  }, [page, searchTerm, activeTab, showOrderModal, sortConfig]);

  // --- SETTINGS HANDLERS ---
  const startEditInspector = (item: any) => {
      setEditingSettingId(item.id); setEditingCategory('inspector');
      setNewInspector({ name: item.label, sciosNr: item.data?.sciosNr || '' });
  };
  const handleSaveInspector = async () => {
      if (!newInspector.name) return alert("Naam verplicht");
      const payload = { label: newInspector.name, data: { sciosNr: newInspector.sciosNr } };
      if (editingSettingId) await supabase.from('form_options').update(payload).eq('id', editingSettingId);
      else await supabase.from('form_options').insert({ category: 'inspector', ...payload });
      cancelEditSettings(); fetchOptions();
  };

  const startEditCompany = (item: any) => {
      setEditingSettingId(item.id); setEditingCategory('iv_company');
      setNewCompany({ name: item.label, address: item.data?.address || '', postalCode: item.data?.postalCode || '', city: item.data?.city || '', phone: item.data?.phone || '', email: item.data?.email || '' });
  };
  const handleSaveCompany = async () => {
      if (!newCompany.name) return alert("Naam verplicht");
      const payload = { label: newCompany.name, data: { address: newCompany.address, postalCode: newCompany.postalCode, city: newCompany.city, phone: newCompany.phone, email: newCompany.email } };
      if (editingSettingId) await supabase.from('form_options').update(payload).eq('id', editingSettingId);
      else await supabase.from('form_options').insert({ category: 'iv_company', ...payload });
      cancelEditSettings(); fetchOptions();
  };

  const startEditInstrument = (item: any) => {
      setEditingSettingId(item.id); setEditingCategory('instrument');
      setNewInstrument({ name: item.label, serial: item.data?.serialNumber || '', calibration: item.data?.calibrationDate || '' });
  };
  const handleSaveInstrument = async () => {
      if (!newInstrument.name) return alert("Naam verplicht");
      const payload = { label: newInstrument.name, data: { serialNumber: newInstrument.serial, calibrationDate: newInstrument.calibration } };
      if (editingSettingId) await supabase.from('form_options').update(payload).eq('id', editingSettingId);
      else await supabase.from('form_options').insert({ category: 'instrument', ...payload });
      cancelEditSettings(); fetchOptions();
  };

  const deleteOption = async (id: number) => { if (window.confirm("Verwijderen?")) { await supabase.from('form_options').delete().eq('id', id); cancelEditSettings(); fetchOptions(); } };
  const cancelEditSettings = () => { setEditingSettingId(null); setEditingCategory(null); setNewInspector({ name: '', sciosNr: '' }); setNewCompany({ name: '', address: '', postalCode: '', city: '', phone: '', email: '' }); setNewInstrument({ name: '', serial: '', calibration: '' }); };

  // --- ORDER HANDLERS ---
  const handleEdit = (insp: any) => {
      const meta = insp.report_data?.meta || {};
      setNewOrder({
          inspectorName: meta.inspectorName || '', sciosRegistrationNumber: meta.sciosRegistrationNumber || '',
          inspectionCompany: meta.inspectionCompany || '', inspectionCompanyAddress: meta.inspectionCompanyAddress || '', inspectionCompanyPostalCode: meta.inspectionCompanyPostalCode || '', inspectionCompanyCity: meta.inspectionCompanyCity || '', inspectionCompanyPhone: meta.inspectionCompanyPhone || '', inspectionCompanyEmail: meta.inspectionCompanyEmail || '',
          
          // HIER IS DE FIX: Datum normaliseren voor de browser input
          date: normalizeDate(meta.date) || new Date().toISOString().split('T')[0],
          
          clientName: meta.clientName || insp.client_name || '', clientAddress: meta.clientAddress || '', clientPostalCode: meta.clientPostalCode || '', clientCity: meta.clientCity || '', clientContactPerson: meta.clientContactPerson || '', clientPhone: meta.clientPhone || '', clientEmail: meta.clientEmail || '',
          projectLocation: meta.projectLocation || '', projectAddress: meta.projectAddress || '', projectPostalCode: meta.projectPostalCode || '', projectCity: meta.projectCity || '', projectContactPerson: meta.projectContactPerson || '', projectPhone: meta.projectPhone || '', projectEmail: meta.projectEmail || '', installationResponsible: meta.installationResponsible || ''
      });
      setEditingId(insp.id); setModalTab('basis'); setShowOrderModal(true);
  };

  const handleSaveOrder = async () => {
    if (!newOrder.clientName) return alert("Klantnaam verplicht.");
    const metaData = { ...newOrder, totalComponents: 0, inspectionInterval: 5, usageFunctions: { kantoorfunctie: false }, inspectionBasis: { nta8220: true, verzekering: false } };
    if (editingId) {
        const existingInsp = inspections.find(i => i.id === editingId); if (!existingInsp) return;
        const updatedReportData = { ...existingInsp.report_data, meta: { ...existingInsp.report_data.meta, ...metaData } };
        const { error } = await supabase.from('inspections').update({ client_name: newOrder.clientName, report_data: updatedReportData }).eq('id', editingId);
        if (error) alert("Fout: " + error.message); else { alert("Opgeslagen!"); closeModal(); fetchInspections(); }
    } else {
        const initialData = { meta: metaData, measurements: { installationType: 'TN-S', mainFuse: '3x63A', mainsVoltage: '400 V', selectedInstruments: [] }, defects: [] };
        const { error } = await supabase.from('inspections').insert({ client_name: newOrder.clientName, status: 'new', scope_type: '10', report_data: initialData });
        if (error) alert('Fout: ' + error.message); else { alert('Aangemaakt!'); closeModal(); fetchInspections(); }
    }
  };

  const closeModal = () => { setShowOrderModal(false); setNewOrder(EMPTY_ORDER); setEditingId(null); };
  const handleDelete = async (id: number) => { if(window.confirm("Verwijderen?")) { await supabase.from('inspections').delete().eq('id', id); fetchInspections(); }};
  
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
      if (insp.status === 'completed') newStatus = 'in_progress'; else if (insp.status === 'review_ready') newStatus = 'completed'; else newStatus = 'completed';
      if(!window.confirm("Status wijzigen?")) return;
      const updatedMeta = { ...insp.report_data?.meta };
      if (newStatus === 'completed') updatedMeta.finalizedDate = new Date().toISOString().split('T')[0]; else if (newStatus === 'in_progress') updatedMeta.finalizedDate = null;
      const { error } = await supabase.from('inspections').update({ status: newStatus, report_data: { ...insp.report_data, meta: updatedMeta } }).eq('id', insp.id);
      if(error) alert("Fout: " + error.message); else fetchInspections();
  };

  // --- EXCEL EXPORT (UITGEBREID + DATUM FIX) ---
  const handleExportAll = async () => { 
      if (!window.confirm("Volledige backup maken?")) return; 
      const { data } = await supabase.from('inspections').select('*'); 
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }); 
      const url = URL.createObjectURL(blob); 
      const a = document.createElement('a'); a.href = url; 
      a.download = `FULL_BACKUP_${new Date().toISOString()}.json`; 
      document.body.appendChild(a); a.click(); document.body.removeChild(a); 
  };

  const handleExcelExport = async () => { 
    const { data, error } = await supabase.from('inspections').select('*');
    if (error || !data) return alert("Fout bij ophalen data.");
    
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Werkvoorraad');
    
    sheet.columns = [
        { header: 'Inspectie ID', key: 'id', width: 20 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Aangemaakt op', key: 'createdAt', width: 15 },
        { header: 'Geupdate op', key: 'updatedAt', width: 20 },
        { header: 'Datum Uitvoering', key: 'date', width: 15 },
        { header: 'Datum Afgerond', key: 'finalizedDate', width: 15 },
        
        // Inspecteur info
        { header: 'Inspecteur', key: 'inspectorName', width: 20 },
        { header: 'SCIOS Nr', key: 'sciosNr', width: 15 },
        { header: 'Inspectiebedrijf', key: 'inspectionCompany', width: 25 },

        // Klant Info
        { header: 'Klant Naam', key: 'clientName', width: 30 },
        { header: 'Klant Adres', key: 'clientAddress', width: 25 },
        { header: 'Klant Postcode', key: 'clientPostalCode', width: 15 },
        { header: 'Klant Plaats', key: 'clientCity', width: 20 },
        { header: 'Klant Contact', key: 'clientContact', width: 20 },
        { header: 'Klant Tel', key: 'clientPhone', width: 15 },
        { header: 'Klant Email', key: 'clientEmail', width: 25 },

        // Project Info
        { header: 'Project Locatie', key: 'projectLocation', width: 25 },
        { header: 'Project Adres', key: 'projectAddress', width: 25 },
        { header: 'Project Postcode', key: 'projectPostalCode', width: 15 },
        { header: 'Project Plaats', key: 'projectCity', width: 20 },
        { header: 'Project Contact', key: 'projectContact', width: 20 },
        { header: 'Project Tel', key: 'projectPhone', width: 15 },
        { header: 'Project Email', key: 'projectEmail', width: 25 },
        { header: 'IV Verantwoordelijke', key: 'iv', width: 20 }
    ];
    
    data.forEach(item => {
        const meta = item.report_data?.meta || {};
        sheet.addRow({
            id: item.inspection_number || 'CONCEPT',
            status: item.status,
            // HIER IS DE FIX VOOR EXPORT: Uniform YYYY-MM-DD
            createdAt: normalizeDate(item.created_at),
            updatedAt: formatDateTime(item.updated_at),
            date: normalizeDate(meta.date),
            finalizedDate: normalizeDate(meta.finalizedDate) || '-',
            
            inspectorName: meta.inspectorName,
            sciosNr: meta.sciosRegistrationNumber,
            inspectionCompany: meta.inspectionCompany,

            clientName: meta.clientName || item.client_name,
            clientAddress: meta.clientAddress,
            clientPostalCode: meta.clientPostalCode,
            clientCity: meta.clientCity,
            clientContact: meta.clientContactPerson,
            clientPhone: meta.clientPhone,
            clientEmail: meta.clientEmail,

            projectLocation: meta.projectLocation,
            projectAddress: meta.projectAddress,
            projectPostalCode: meta.projectPostalCode,
            projectCity: meta.projectCity,
            projectContact: meta.projectContactPerson,
            projectPhone: meta.projectPhone,
            projectEmail: meta.projectEmail,
            iv: meta.installationResponsible
        });
    });
    
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; 
    a.download = `Werkvoorraad_Compleet_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  // --- EXCEL IMPORT (UITGEBREID + DATUM FIX) ---
  const handleExcelImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
        const buffer = await file.arrayBuffer();
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer);
        const sheet = workbook.getWorksheet(1);

        if (!sheet) throw new Error("Excel bestand is leeg.");

        const headers: {[key: number]: string} = {};
        sheet.getRow(1).eachCell((cell, colNumber) => { 
            headers[colNumber] = cell.value?.toString().toLowerCase() || ''; 
        });

        const getVal = (row: any, ...aliases: string[]) => {
            const colIndex = Object.keys(headers).find(key => 
                aliases.some(alias => headers[parseInt(key)].includes(alias.toLowerCase()))
            );
            if (!colIndex) return '';
            const cell = row.getCell(parseInt(colIndex));
            if (cell.value && typeof cell.value === 'object' && 'text' in cell.value) { return (cell.value as any).text.toString(); }
            return cell.value ? cell.value.toString() : '';
        };

        const promises: any[] = [];
        let newCount = 0;
        let updateCount = 0;

        sheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return;

            const idVal = getVal(row, 'id', 'inspectie id'); 
            const id = (idVal === 'CONCEPT' || !idVal) ? null : idVal;
            const clientName = getVal(row, 'klant naam', 'client name');
            if (!clientName) return; 

            // HIER IS DE FIX VOOR IMPORT: normalizeDate gebruiken
            const metaUpdate = {
                clientName: clientName,
                status: getVal(row, 'status') || 'new',
                date: normalizeDate(getVal(row, 'datum uitvoering', 'datum start', 'date')),
                finalizedDate: normalizeDate(getVal(row, 'datum afgerond', 'finalized')),
                
                inspectorName: getVal(row, 'inspecteur', 'inspector'),
                sciosRegistrationNumber: getVal(row, 'scios'),
                inspectionCompany: getVal(row, 'inspectiebedrijf', 'company'),

                clientAddress: getVal(row, 'klant adres'),
                clientPostalCode: getVal(row, 'klant postcode'),
                clientCity: getVal(row, 'klant plaats', 'klant stad'),
                clientContactPerson: getVal(row, 'klant contact'),
                clientPhone: getVal(row, 'klant tel'),
                clientEmail: getVal(row, 'klant email'),

                projectLocation: getVal(row, 'project locatie', 'locatie naam'),
                projectAddress: getVal(row, 'project adres'),
                projectPostalCode: getVal(row, 'project postcode'),
                projectCity: getVal(row, 'project plaats', 'project stad'),
                projectContactPerson: getVal(row, 'project contact'),
                projectPhone: getVal(row, 'project tel'),
                projectEmail: getVal(row, 'project email'),
                installationResponsible: getVal(row, 'iv verantwoordelijke', 'iv')
            };

            if (id) {
                const op = async () => {
                    const { data: existing } = await supabase.from('inspections').select('report_data').eq('inspection_number', id).maybeSingle();
                    if (existing) {
                        const newReportData = {
                            ...existing.report_data,
                            meta: { ...existing.report_data.meta, ...metaUpdate }
                        };
                        await supabase.from('inspections').update({
                            client_name: clientName,
                            status: metaUpdate.status === 'new' ? undefined : metaUpdate.status,
                            report_data: newReportData
                        }).eq('inspection_number', id);
                        updateCount++;
                    }
                };
                promises.push(op());
            } else {
                const initialData = {
                    meta: { 
                        ...EMPTY_ORDER, 
                        ...metaUpdate, 
                        inspectionInterval: 5, 
                        usageFunctions: { kantoorfunctie: false }, 
                        inspectionBasis: { nta8220: true, verzekering: false } 
                    },
                    measurements: { installationType: 'TN-S', mainFuse: '3x63A', mainsVoltage: '400 V', selectedInstruments: [] },
                    defects: []
                };

                const op = async () => {
                    await supabase.from('inspections').insert({
                        client_name: clientName,
                        status: 'new',
                        scope_type: '10',
                        report_data: initialData
                    });
                    newCount++;
                };
                promises.push(op());
            }
        });

        await Promise.all(promises);
        alert(`Import voltooid!\n${newCount} Nieuwe projecten\n${updateCount} Projecten bijgewerkt`);
        fetchInspections();

    } catch (err: any) {
        console.error(err);
        alert("Fout bij importeren: " + err.message);
    } finally {
        setLoading(false);
        if (excelInputRef.current) excelInputRef.current.value = '';
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => { if (!window.confirm(`Rol wijzigen?`)) return; const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId); if (error) alert("Fout: " + error.message); else { alert("Aangepast!"); fetchUsers(); } };

  const handleCreateUser = async () => {
    if (!newUser.email || !newUser.password) return alert("Vul alles in.");
    try {
        const { data: sessionData } = await supabase.auth.getSession();
        const { data, error } = await supabase.functions.invoke('create-user', {
            body: { email: newUser.email.trim(), password: newUser.password, role: newUser.role },
            headers: { Authorization: `Bearer ${sessionData.session?.access_token}` }
        });
        if (error || data?.error) throw new Error(error?.message || data?.error);
        alert(`✅ ${newUser.email} aangemaakt!`); setShowUserModal(false); setNewUser({ email: '', password: '', role: 'inspector' }); fetchUsers();
    } catch (err: any) { alert("Fout: " + err.message); }
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-[95%] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div><h1 className="text-3xl font-bold text-gray-800">Kantoor Dashboard</h1><p className="text-gray-500">Beheer {totalCount} inspecties</p></div>
          <div className="flex gap-3">
             {activeTab === 'inspections' && (
                 <>
                    <button onClick={() => excelInputRef.current?.click()} className="flex items-center gap-2 bg-green-600 px-4 py-2 rounded shadow text-white hover:bg-green-700 font-bold whitespace-nowrap border border-green-700"><FileSpreadsheet size={18} /> Import Excel</button>
                    <input type="file" ref={excelInputRef} onChange={handleExcelImport} accept=".xlsx, .xls" className="hidden" />
                    <button onClick={handleExcelExport} className="flex items-center gap-2 bg-white px-4 py-2 rounded shadow text-green-700 hover:bg-green-50 font-bold whitespace-nowrap border border-green-200"><Download size={18} /> Export Excel</button>
                    <button onClick={handleExportAll} className="flex items-center gap-2 bg-gray-700 px-4 py-2 rounded shadow text-white hover:bg-gray-800 font-bold border border-gray-600"><Database size={18} /> Backup</button>
                    {selectedIds.length > 0 && (
                    <>
                        <button onClick={handleBulkDownloadPDFs} className="flex items-center gap-2 bg-blue-600 px-4 py-2 rounded shadow text-white hover:bg-blue-700 font-bold whitespace-nowrap border border-blue-700">
                          <FileText size={18} /> PDF Rapport ({selectedIds.length})
                        </button>
                        <button onClick={handleBulkDelete} className="flex items-center gap-2 bg-red-600 px-4 py-2 rounded shadow text-white hover:bg-red-700 font-bold whitespace-nowrap animate-pulse border border-red-700">
                          <Trash2 size={18} /> Verwijder ({selectedIds.length})
                        </button>
                      </>
                    )}
                    <button onClick={() => { setNewOrder(EMPTY_ORDER); setShowOrderModal(true); }} className="flex items-center gap-2 bg-emerald-600 px-4 py-2 rounded shadow text-white hover:bg-emerald-700 font-bold whitespace-nowrap"><Plus size={18} /> Nieuw</button>                 </>
             )}
          </div>
        </div>

        <div className="flex gap-4 mb-6 border-b border-gray-300">
            <button onClick={() => setActiveTab('inspections')} className={`pb-2 px-4 font-bold flex items-center gap-2 ${activeTab === 'inspections' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}><FileText size={18}/> Inspecties</button>
            <button onClick={() => setActiveTab('users')} className={`pb-2 px-4 font-bold flex items-center gap-2 ${activeTab === 'users' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}><Users size={18}/> Gebruikersbeheer</button>
            <button onClick={() => setActiveTab('settings')} className={`pb-2 px-4 font-bold flex items-center gap-2 ${activeTab === 'settings' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}><Settings size={18}/> Instellingen</button>
        </div>

        {/* TAB INSPECTIES */}
        {activeTab === 'inspections' && (
            <>
                <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="relative w-full md:w-1/2">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input type="text" placeholder="Zoek op klant, stad, id of inspecteur..." className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }} />
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
                <div className="bg-white rounded-lg shadow overflow-x-auto">
                    <table className="min-w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-4 py-3 text-left w-10">
                                <input 
                                    type="checkbox" 
                                    className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                    checked={inspections.length > 0 && selectedIds.length === inspections.length}
                                    onChange={toggleSelectAll}
                                />
                            </th>
                            <SortableHeader label="Aangemaakt" sortKey="created_at" width="w-28" />
                            <SortableHeader label="Geüpdatet" sortKey="updated_at" width="w-40" />
                            <SortableHeader label="Start" sortKey="date_start" width="w-28" />
                            <SortableHeader label="Afgerond" sortKey="date_finalized" width="w-28" />
                            {/* ID breder gemaakt zodat het op 1 regel past */}
                            <SortableHeader label="Inspectie ID" sortKey="inspection_number" width="min-w-[140px]" />
                            <SortableHeader label="Klant" sortKey="client_name" />
                            <SortableHeader label="Project" sortKey="project_location" />
                            <SortableHeader label="Plaats" sortKey="project_city" />
                            <SortableHeader label="Status" sortKey="status" />
                            <SortableHeader label="Inspecteur" sortKey="inspector" />
                            <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Acties</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {inspections.map((insp) => (
                        <tr key={insp.id} className={`hover:bg-gray-50 ${selectedIds.includes(insp.id) ? 'bg-emerald-50/50' : ''}`}>
                            <td className="px-4 py-3">
                                <input 
                                    type="checkbox" 
                                    className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                    checked={selectedIds.includes(insp.id)}
                                    onChange={() => toggleSelectRow(insp.id)}
                                />
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-500"><div className="flex items-center gap-1"><Clock size={14} className="text-gray-400"/> {normalizeDate(insp.created_at)}</div></td>
                            {/* 2. Updated */}
                            <td className="px-4 py-3 text-xs text-blue-600 font-medium whitespace-nowrap">{formatDateTime(insp.updated_at)}</td>                            
                            {/* 2. Start */}
                            <td className="px-4 py-3 text-sm font-bold text-gray-700"><div className="flex items-center gap-1"><Calendar size={14} className="text-emerald-600"/>{normalizeDate(insp.report_data?.meta?.date) || '-'}</div></td>
                            {/* 3. Afgerond */}
                            <td className="px-4 py-3 text-sm text-gray-600">{insp.report_data?.meta?.finalizedDate ? (<div className="flex items-center gap-1 text-green-700 font-bold"><CheckCircle size={14}/>{normalizeDate(insp.report_data.meta.finalizedDate)}</div>) : (<span className="text-gray-300 italic">-</span>)}</td>
                            {/* 4. ID (Whitespace nowrap) */}
                            <td className="px-4 py-3 whitespace-nowrap"><span className="font-mono text-xs font-bold bg-gray-100 text-gray-700 px-2 py-1 rounded border border-gray-300 flex items-center gap-1 w-fit"><Hash size={12} className="text-gray-400"/>{insp.inspection_number || 'CONCEPT'}</span></td>
                            {/* 5. Klant */}
                            <td className="px-4 py-3"><div className="text-sm font-bold text-gray-900">{insp.client_name}</div></td>
                            {/* 6. Project */}
                            <td className="px-4 py-3"><div className="text-sm text-gray-700">{insp.report_data?.meta?.projectLocation || '-'}</div></td>
                            {/* 7. Plaats */}
                            <td className="px-4 py-3"><div className="text-xs text-gray-500 flex items-center gap-1"><MapPin size={12}/> {insp.report_data?.meta?.projectCity || insp.report_data?.meta?.clientCity || '-'}</div></td>
                            
                            {/* 8. Status */}
                            <td className="px-4 py-3 cursor-pointer select-none" onClick={() => toggleStatus(insp)}>
                                {(!insp.status || insp.status === 'new') && <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-bold border border-blue-200">Nieuw</span>}
                                {insp.status === 'in_progress' && <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded font-bold border border-orange-200 flex items-center gap-1 w-fit"><RefreshCw size={12} className="animate-spin"/> Bezig</span>}
                                {insp.status === 'review_ready' && <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded font-bold border border-purple-200 shadow-sm flex items-center gap-1 w-fit"><FileText size={12}/> Review</span>}
                                {insp.status === 'completed' && <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-bold border border-green-200 flex items-center gap-1 w-fit"><Lock size={12}/> Klaar</span>}
                            </td>
                            
                            {/* 9. Inspecteur */}
                            <td className="px-4 py-3 text-sm text-gray-500"><User size={16} className="inline mr-1"/> {insp.report_data?.meta?.inspectorName || '-'}</td>
                            
                            {/* 10. Acties */}
                            <td className="px-4 py-3 text-right text-sm font-medium flex justify-end gap-2">
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

        {/* TAB USERS (Ongewijzigd) */}
        {activeTab === 'users' && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-4 bg-blue-50 border-b border-blue-100 text-sm text-blue-800 flex justify-between items-center">
                    <div className="flex items-center gap-2"><Shield size={18}/><span>Beheer rollen.</span></div>
                    <button onClick={() => setShowUserModal(true)} className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1 rounded shadow text-xs font-bold hover:bg-blue-700"><UserPlus size={16} /> Nieuwe Gebruiker</button>
                </div>
                <table className="min-w-full">
                    <thead className="bg-gray-50 border-b"><tr><th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Email</th><th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Huidige Rol</th><th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Wijzig Rol</th><th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Acties</th></tr></thead>
                    <tbody className="divide-y divide-gray-200">
                        {users.map(u => (
                            <tr key={u.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-sm font-bold text-gray-700">{u.email}</td>
                                <td className="px-6 py-4 text-sm">{u.role === 'admin' ? <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-bold">ADMIN</span> : <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-bold">INSPECTOR</span>}</td>
                                <td className="px-6 py-4 text-sm"><select className="border rounded p-1 text-sm bg-white cursor-pointer" value={u.role} onChange={(e) => handleRoleChange(u.id, e.target.value)}><option value="inspector">Inspector</option><option value="admin">Admin</option></select></td>
                                <td className="px-6 py-4 text-right text-sm"><div className="flex justify-end gap-2"><button onClick={() => openPasswordModal(u)} className="text-orange-400 hover:text-orange-600 bg-orange-50 p-2 rounded hover:bg-orange-100 transition-colors" title="Wachtwoord Resetten"><Key size={18}/></button><button onClick={() => handleDeleteUser(u.id)} className="text-red-400 hover:text-red-600 bg-red-50 p-2 rounded hover:bg-red-100 transition-colors" title="Verwijder"><Trash2 size={18}/></button></div></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}

        {/* TAB SETTINGS (Ongewijzigd) */}
        {activeTab === 'settings' && (
             <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                 {/* Inspecteurs */}
                 <div className="bg-white rounded-lg shadow p-6 h-fit">
                     <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2"><User size={20}/> Inspecteurs</h2>
                     <div className="bg-gray-50 p-4 rounded border mb-4 space-y-3">
                         <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Naam</label><input className="w-full border rounded p-2 text-sm" value={newInspector.name} onChange={e => setNewInspector({...newInspector, name: e.target.value})} disabled={editingSettingId !== null && editingCategory !== 'inspector'} /></div>
                         <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">SCIOS Nr</label><input className="w-full border rounded p-2 text-sm" value={newInspector.sciosNr} onChange={e => setNewInspector({...newInspector, sciosNr: e.target.value})} disabled={editingSettingId !== null && editingCategory !== 'inspector'} /></div>
                         <div className="flex gap-2 pt-2"><button onClick={handleSaveInspector} disabled={editingSettingId !== null && editingCategory !== 'inspector'} className={`flex-1 py-2 rounded font-bold text-sm text-white ${editingSettingId && editingCategory === 'inspector' ? 'bg-blue-600' : 'bg-emerald-600 disabled:opacity-50'}`}>{editingSettingId && editingCategory === 'inspector' ? 'Opslaan' : 'Toevoegen'}</button>{editingSettingId && editingCategory === 'inspector' && <button onClick={cancelEditSettings} className="px-4 bg-gray-300 rounded font-bold text-sm">X</button>}</div>
                     </div>
                     <ul className="divide-y max-h-[400px] overflow-y-auto">{inspectorsList.map((item) => (<li key={item.id} className="py-3 flex justify-between items-start text-gray-700"><div><div className="font-bold">{item.label}</div><div className="text-xs text-gray-500">SCIOS: {item.data.sciosNr}</div></div><div className="flex gap-2"><button onClick={() => startEditInspector(item)} className="text-blue-400 hover:text-blue-600"><Pencil size={16}/></button><button onClick={() => deleteOption(item.id)} className="text-red-400 hover:text-red-600"><Trash2 size={16}/></button></div></li>))}</ul>
                 </div>
                 {/* Bedrijven */}
                 <div className="bg-white rounded-lg shadow p-6 h-fit">
                     <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2"><Building size={20}/> Bedrijven</h2>
                     <div className="bg-gray-50 p-4 rounded border mb-4 space-y-3">
                         <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Naam</label><input className="w-full border rounded p-2 text-sm font-bold" value={newCompany.name} onChange={e => setNewCompany({...newCompany, name: e.target.value})} disabled={editingSettingId !== null && editingCategory !== 'iv_company'} /></div>
                         <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Plaats</label><input className="w-full border rounded p-2 text-sm" value={newCompany.city} onChange={e => setNewCompany({...newCompany, city: e.target.value})} disabled={editingSettingId !== null && editingCategory !== 'iv_company'} /></div>
                         <div className="flex gap-2 pt-2"><button onClick={handleSaveCompany} disabled={editingSettingId !== null && editingCategory !== 'iv_company'} className={`w-full py-2 rounded font-bold text-sm text-white ${editingSettingId && editingCategory === 'iv_company' ? 'bg-blue-600' : 'bg-emerald-600 disabled:opacity-50'}`}>{editingSettingId && editingCategory === 'iv_company' ? 'Opslaan' : 'Toevoegen'}</button>{editingSettingId && editingCategory === 'iv_company' && <button onClick={cancelEditSettings} className="w-auto px-4 bg-gray-300 rounded font-bold text-xs">X</button>}</div>
                     </div>
                     <ul className="divide-y max-h-[400px] overflow-y-auto">{companiesList.map((item) => (<li key={item.id} className="py-3 flex justify-between items-start text-gray-700"><div><div className="font-bold text-sm">{item.label}</div><div className="text-xs text-gray-500">{item.data?.city}</div></div><div className="flex gap-2"><button onClick={() => startEditCompany(item)} className="text-blue-400 hover:text-blue-600"><Pencil size={16}/></button><button onClick={() => deleteOption(item.id)} className="text-red-400 hover:text-red-600"><Trash2 size={16}/></button></div></li>))}</ul>
                 </div>
                 {/* Instrumenten */}
                 <div className="bg-white rounded-lg shadow p-6 h-fit">
                     <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2"><Wrench size={20}/> Instrumenten</h2>
                     <div className="bg-gray-50 p-4 rounded border mb-4 space-y-3">
                         <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Naam</label><input className="w-full border rounded p-2 text-sm font-bold" value={newInstrument.name} onChange={e => setNewInstrument({...newInstrument, name: e.target.value})} disabled={editingSettingId !== null && editingCategory !== 'instrument'} /></div>
                         <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Serienr</label><input className="w-full border rounded p-2 text-sm" value={newInstrument.serial} onChange={e => setNewInstrument({...newInstrument, serial: e.target.value})} disabled={editingSettingId !== null && editingCategory !== 'instrument'} /></div>
                         <div className="flex gap-2 pt-2"><button onClick={handleSaveInstrument} disabled={editingSettingId !== null && editingCategory !== 'instrument'} className={`flex-1 py-2 rounded font-bold text-sm text-white ${editingSettingId && editingCategory === 'instrument' ? 'bg-blue-600' : 'bg-emerald-600 disabled:opacity-50'}`}>{editingSettingId && editingCategory === 'instrument' ? 'Opslaan' : 'Toevoegen'}</button>{editingSettingId && editingCategory === 'instrument' && <button onClick={cancelEditSettings} className="px-4 bg-gray-300 rounded font-bold text-sm">X</button>}</div>
                     </div>
                     <ul className="divide-y max-h-[400px] overflow-y-auto">{instrumentsList.map((item) => (<li key={item.id} className="py-3 flex justify-between items-start text-gray-700"><div><div className="font-bold text-sm">{item.label}</div><div className="text-xs text-gray-500">{item.data?.serialNumber}</div></div>
                         <div className="flex gap-2"><button onClick={() => startEditInstrument(item)} className="text-blue-400 hover:text-blue-600"><Pencil size={16}/></button><button onClick={() => deleteOption(item.id)} className="text-red-400 hover:text-red-600"><Trash2 size={16}/></button></div></li>))}</ul>
                 </div>
             </div>
        )}

        {/* MODAL: NIEUWE OPDRACHT / BEWERKEN */}
        {showOrderModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl p-0 overflow-hidden flex flex-col max-h-[90vh]">
                    <div className="p-6 border-b flex justify-between items-center bg-gray-50"><h2 className="text-xl font-bold text-gray-800">{editingId ? 'Opdracht Bewerken' : 'Nieuwe Opdracht'}</h2><button onClick={closeModal}><X size={24}/></button></div>
                    <div className="flex border-b bg-gray-100">
                        <button onClick={() => setModalTab('basis')} className={`flex-1 py-3 font-bold text-sm flex items-center justify-center gap-2 ${modalTab === 'basis' ? 'bg-white text-emerald-600 border-t-2 border-t-emerald-600' : 'text-gray-500'}`}><Calendar size={16}/> 1. Basis</button>
                        <button onClick={() => setModalTab('klant')} className={`flex-1 py-3 font-bold text-sm flex items-center justify-center gap-2 ${modalTab === 'klant' ? 'bg-white text-emerald-600 border-t-2 border-t-emerald-600' : 'text-gray-500'}`}><User size={16}/> 2. Opdrachtgever</button>
                        <button onClick={() => setModalTab('project')} className={`flex-1 py-3 font-bold text-sm flex items-center justify-center gap-2 ${modalTab === 'project' ? 'bg-white text-emerald-600 border-t-2 border-t-emerald-600' : 'text-gray-500'}`}><Building size={16}/> 3. Project</button>
                    </div>
                    
                    <div className="p-6 overflow-y-auto bg-gray-50">
                        {modalTab === 'basis' && (
                            <div className="space-y-6">
                                <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Datum Uitvoering / Planning</label><input type="date" className="w-full border rounded p-2" value={newOrder.date} onChange={e => setNewOrder({...newOrder, date: e.target.value})} /></div>
                                
                                {/* INSPECTEUR SECTIE */}
                                <div className="bg-white p-4 rounded border">
                                    <h3 className="text-sm font-bold text-emerald-800 mb-3 flex items-center gap-2"><User size={16}/> Inspecteur</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Naam (Kies of Typ)</label>
                                            <input list="inspectors-list-modal" className="w-full border rounded p-2" value={newOrder.inspectorName} onChange={e => { const val = e.target.value; const match = inspectorsList.find(i => i.label === val); setNewOrder({ ...newOrder, inspectorName: val, sciosRegistrationNumber: match ? match.data.sciosNr : newOrder.sciosRegistrationNumber }); }} placeholder="Selecteer inspecteur" />
                                            <datalist id="inspectors-list-modal">{inspectorsList.map(i => <option key={i.id} value={i.label}/>)}</datalist>
                                        </div>
                                        <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">SCIOS Registratienummer</label><input className="w-full border rounded p-2" value={newOrder.sciosRegistrationNumber} onChange={e => setNewOrder({...newOrder, sciosRegistrationNumber: e.target.value})} placeholder="Optioneel" /></div>
                                    </div>
                                </div>

                                {/* BEDRIJF SECTIE */}
                                <div className="bg-white p-4 rounded border">
                                    <h3 className="text-sm font-bold text-emerald-800 mb-3 flex items-center gap-2"><Briefcase size={16}/> Inspectiebedrijf</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Bedrijfsnaam (Kies of Typ)</label>
                                            <input list="companies-list-modal" className="w-full border rounded p-2" value={newOrder.inspectionCompany} onChange={e => { const val = e.target.value; const match = companiesList.find(c => c.label === val); if (match) { setNewOrder({ ...newOrder, inspectionCompany: val, inspectionCompanyAddress: match.data.address || '', inspectionCompanyPostalCode: match.data.postalCode || '', inspectionCompanyCity: match.data.city || '', inspectionCompanyPhone: match.data.phone || '', inspectionCompanyEmail: match.data.email || '' }); } else { setNewOrder({...newOrder, inspectionCompany: val}); } }} placeholder="Selecteer bedrijf" /><datalist id="companies-list-modal">{companiesList.map(c => <option key={c.id} value={c.label}/>)}</datalist></div>
                                        <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Adres</label><input className="w-full border rounded p-2" value={newOrder.inspectionCompanyAddress} onChange={e => setNewOrder({...newOrder, inspectionCompanyAddress: e.target.value})} placeholder="Straat + Nr" /></div>
                                        <div className="flex gap-2"><div className="w-1/3"><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Postcode</label><input className="w-full border rounded p-2" value={newOrder.inspectionCompanyPostalCode} onChange={e => setNewOrder({...newOrder, inspectionCompanyPostalCode: e.target.value})} /></div><div className="w-2/3"><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Plaats</label><input className="w-full border rounded p-2" value={newOrder.inspectionCompanyCity} onChange={e => setNewOrder({...newOrder, inspectionCompanyCity: e.target.value})} /></div></div>
                                        <div className="flex gap-2"><div className="w-1/2 relative"><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Telefoon</label><div className="relative"><Phone size={16} className="absolute left-3 top-3 text-gray-400"/><input className="w-full border rounded p-2 pl-10" value={newOrder.inspectionCompanyPhone} onChange={e => setNewOrder({...newOrder, inspectionCompanyPhone: e.target.value})} /></div></div><div className="w-1/2 relative"><label className="block text-xs font-bold text-gray-500 uppercase mb-1">E-mail</label><div className="relative"><Mail size={16} className="absolute left-3 top-3 text-gray-400"/><input className="w-full border rounded p-2 pl-10" value={newOrder.inspectionCompanyEmail} onChange={e => setNewOrder({...newOrder, inspectionCompanyEmail: e.target.value})} /></div></div></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {modalTab === 'klant' && (
                            <div className="space-y-4">
                                <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Naam Opdrachtgever</label><input className="w-full border rounded p-2 font-bold" value={newOrder.clientName} onChange={e => setNewOrder({...newOrder, clientName: e.target.value})} placeholder="Bijv. Bakkerij Jansen B.V." /></div>
                                <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Adres</label><input className="w-full border rounded p-2" value={newOrder.clientAddress} onChange={e => setNewOrder({...newOrder, clientAddress: e.target.value})} /></div>
                                <div className="flex gap-2"><div className="w-1/3"><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Postcode</label><input className="w-full border rounded p-2" value={newOrder.clientPostalCode} onChange={e => setNewOrder({...newOrder, clientPostalCode: e.target.value})} /></div><div className="w-2/3"><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Plaats</label><input className="w-full border rounded p-2" value={newOrder.clientCity} onChange={e => setNewOrder({...newOrder, clientCity: e.target.value})} /></div></div>
                                <hr className="border-gray-200"/>
                                <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Contactpersoon</label><input className="w-full border rounded p-2" value={newOrder.clientContactPerson} onChange={e => setNewOrder({...newOrder, clientContactPerson: e.target.value})} /></div>
                                <div className="flex gap-2"><div className="w-1/2 relative"><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Telefoon</label><div className="relative"><Phone size={16} className="absolute left-3 top-3 text-gray-400"/><input className="w-full border rounded p-2 pl-10" value={newOrder.clientPhone} onChange={e => setNewOrder({...newOrder, clientPhone: e.target.value})} /></div></div><div className="w-1/2 relative"><label className="block text-xs font-bold text-gray-500 uppercase mb-1">E-mail</label><div className="relative"><Mail size={16} className="absolute left-3 top-3 text-gray-400"/><input className="w-full border rounded p-2 pl-10" value={newOrder.clientEmail} onChange={e => setNewOrder({...newOrder, clientEmail: e.target.value})} /></div></div></div>
                            </div>
                        )}
                        {modalTab === 'project' && (
                            <div className="space-y-4">
                                <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Locatienaam (Indien afwijkend)</label><input className="w-full border rounded p-2" value={newOrder.projectLocation} onChange={e => setNewOrder({...newOrder, projectLocation: e.target.value})} placeholder="Bijv. Filiaal Centrum" /></div>
                                <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Adres</label><input className="w-full border rounded p-2" value={newOrder.projectAddress} onChange={e => setNewOrder({...newOrder, projectAddress: e.target.value})} /></div>
                                <div className="flex gap-2"><div className="w-1/3"><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Postcode</label><input className="w-full border rounded p-2" value={newOrder.projectPostalCode} onChange={e => setNewOrder({...newOrder, projectPostalCode: e.target.value})} /></div><div className="w-2/3"><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Plaats</label><input className="w-full border rounded p-2" value={newOrder.projectCity} onChange={e => setNewOrder({...newOrder, projectCity: e.target.value})} /></div></div>
                                <hr className="border-gray-200"/>
                                <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Contactpersoon op locatie</label><input className="w-full border rounded p-2" value={newOrder.projectContactPerson} onChange={e => setNewOrder({...newOrder, projectContactPerson: e.target.value})} /></div>
                                <div className="flex gap-2"><div className="w-1/2 relative"><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Telefoon</label><div className="relative"><Phone size={16} className="absolute left-3 top-3 text-gray-400"/><input className="w-full border rounded p-2 pl-10" value={newOrder.projectPhone} onChange={e => setNewOrder({...newOrder, projectPhone: e.target.value})} /></div></div><div className="w-1/2 relative"><label className="block text-xs font-bold text-gray-500 uppercase mb-1">E-mail</label><div className="relative"><Mail size={16} className="absolute left-3 top-3 text-gray-400"/><input className="w-full border rounded p-2 pl-10" value={newOrder.projectEmail} onChange={e => setNewOrder({...newOrder, projectEmail: e.target.value})} /></div></div></div>
                                <div className="bg-blue-50 p-3 rounded border border-blue-100 mt-2"><label className="block text-xs font-bold text-blue-800 uppercase mb-1">Installatieverantwoordelijke (IV)</label><input className="w-full border rounded p-2" value={newOrder.installationResponsible} onChange={e => setNewOrder({...newOrder, installationResponsible: e.target.value})} placeholder="Naam IV'er" /></div>
                            </div>
                        )}
                    </div>
                    <div className="p-6 border-t bg-white flex gap-3">
                        <button onClick={closeModal} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded font-bold transition-colors">Annuleren</button>
                        <button onClick={handleSaveOrder} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded font-bold shadow transition-colors flex items-center justify-center gap-2">{editingId ? <><Pencil size={18}/> Opslaan</> : <><Plus size={18}/> Aanmaken</>}</button>
                    </div>
                </div>
            </div>
        )}
        
        {showUserModal && (<div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"><div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6"><h2 className="text-lg font-bold mb-4">Nieuwe Gebruiker</h2><input className="w-full border rounded p-2 mb-2" type="email" placeholder="Email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} /><input className="w-full border rounded p-2 mb-4" type="password" placeholder="Wachtwoord" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} /><div className="flex gap-2"><button onClick={() => setShowUserModal(false)} className="flex-1 bg-gray-200 py-2 rounded">Annuleren</button><button onClick={handleCreateUser} className="flex-1 bg-blue-600 text-white py-2 rounded">Toevoegen</button></div></div></div>)}
        {showPasswordModal && (<div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"><div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6"><h2 className="text-lg font-bold mb-4">Wachtwoord Reset</h2><input className="w-full border rounded p-2 mb-4" type="text" placeholder="Nieuw Wachtwoord" value={newPasswordInput} onChange={e => setNewPasswordInput(e.target.value)} /><div className="flex gap-2"><button onClick={() => setShowPasswordModal(false)} className="flex-1 bg-gray-200 py-2 rounded">Annuleren</button><button onClick={handleResetPassword} className="flex-1 bg-orange-500 text-white py-2 rounded">Resetten</button></div></div></div>)}
      </div>
    </div>
  );
}