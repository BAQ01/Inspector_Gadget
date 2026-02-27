import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../supabase';
import { Calendar, User, Download, RefreshCw, Plus, X, MapPin, Trash2, Lock, FileText, Search, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Database, Users, Shield, UserPlus, FileSpreadsheet, Pencil, Settings, Building, Wrench, Key, ArrowUpDown, ArrowUp, ArrowDown, CheckCircle, Hash, Mail, Phone, Briefcase, Clock, BookOpen, UploadCloud, Globe, StickyNote, FolderOpen, UserCircle2 } from 'lucide-react';
import type { Client, ClientContact } from '../types';
import { pdf } from '@react-pdf/renderer'; 
import { PDFReport } from './PDFReport';
import ExcelJS from 'exceljs';
import { DEFECT_LIBRARY } from '../constants'; // NIEUW: Importeer de hardcoded lijst
import { parsePlaceResult, fetchPlaces, lookupAddressBAG, type ParsedPlace } from '../utils/placesSearch';

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
  const [activeTab, setActiveTab] = useState<'inspections' | 'users' | 'settings' | 'library' | 'clients' | 'projecten'>('inspections');
  
  // LIBRARY STATES
  const [libraryItems, setLibraryItems] = useState<any[]>([]);
  const [showLibraryModal, setShowLibraryModal] = useState(false);
  const [editingLibraryId, setEditingLibraryId] = useState<string | null>(null);
  const [newLibraryItem, setNewLibraryItem] = useState({ category: '', subcategory: '', shortName: '', description: '', classification: 'Yellow' });
  const libraryCsvInputRef = useRef<HTMLInputElement>(null);
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
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [expandedCompanyUserId, setExpandedCompanyUserId] = useState<string | null>(null);
  const [companyEditBuffer, setCompanyEditBuffer] = useState<Record<string, string>>({});
  const [adminKofferSearch, setAdminKofferSearch] = useState('');
  const [expandedInstrumentId, setExpandedInstrumentId] = useState<number | null>(null);
  const [instrumentOwnerSearch, setInstrumentOwnerSearch] = useState('');

// Options Lists
  const [companiesList, setCompaniesList] = useState<any[]>([]);
  const [instrumentsList, setInstrumentsList] = useState<any[]>([]);
  
  // New Item States
  const [newInstrument, setNewInstrument] = useState({ name: '', serial: '', calibration: '' });
  const [newCompany, setNewCompany] = useState({ name: '', address: '', postalCode: '', city: '', phone: '', email: '', website: '' });

  const [editingSettingId, setEditingSettingId] = useState<number | null>(null);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);

  // INSTALLER HERSTEL STATES
  const [installersList, setInstallersList] = useState<{id: string; full_name: string}[]>([]);
  const [assigningInstaller, setAssigningInstaller] = useState<Record<number, string>>({});

  // CRM KLANTEN STATES
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientSearch, setClientSearch] = useState('');
  const [clientTab, setClientTab] = useState<'gegevens' | 'contacten' | 'projecten' | 'notities'>('gegevens');
  const [clientInspections, setClientInspections] = useState<any[]>([]);
  const [isEditingClient, setIsEditingClient] = useState(false);
  const [editClientForm, setEditClientForm] = useState<Partial<Client>>({});
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [newClientForm, setNewClientForm] = useState<Partial<Client>>({ name: '', contacts: [] });
  const [placesQuery, setPlacesQuery] = useState('');
  const [placesResults, setPlacesResults] = useState<any[]>([]);
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);

  const [expandedProjectIds, setExpandedProjectIds] = useState<Set<number>>(new Set());

  // PROJECTEN TAB STATES
  const [projects, setProjects] = useState<any[]>([]);
  const [projPage, setProjPage] = useState(1);
  const [projTotalCount, setProjTotalCount] = useState(0);
  const [projSearch, setProjSearch] = useState('');
  const [projSortConfig, setProjSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'next_inspection_date', direction: 'asc' });

  const [newUser, setNewUser] = useState({ email: '', password: '', role: 'inspector', full_name: '', scios_nr: '', phone: '', contact_email: '', company_name: '', company_address: '', company_postal_code: '', company_city: '', company_phone: '', company_email: '' });

  const excelInputRef = useRef<HTMLInputElement>(null);
  const restoreInputRef = useRef<HTMLInputElement>(null);

  // --- FETCHERS ---
  const fetchInspections = async () => {
    setLoading(true);
    const from = (page - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;
    
    let query = supabase.from('inspections').select('*', { count: 'exact' });

    // 1. ZOEKFUNCTIE
    if (searchTerm) {
        const matchingInstallerIds = installersList
            .filter(i => i.full_name?.toLowerCase().includes(searchTerm.toLowerCase()))
            .map(i => i.id);
        let orFilter = `client_name.ilike.%${searchTerm}%,inspection_number.ilike.%${searchTerm}%,report_data->meta->>projectCity.ilike.%${searchTerm}%,report_data->meta->>projectLocation.ilike.%${searchTerm}%,report_data->meta->>inspectorName.ilike.%${searchTerm}%`;
        if (matchingInstallerIds.length > 0) {
            orFilter += `,installer_id.in.(${matchingInstallerIds.join(',')})`;
        }
        query = query.or(orFilter);
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
    } else if (sortConfig.key !== 'inspection_number' && sortConfig.key !== 'inspector' && sortConfig.key !== 'installer_name') {
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

        // B. Sorteren op Installateur Naam
        if (sortConfig.key === 'installer_name') {
            finalData.sort((a, b) => {
                const nameA = installersList.find(i => i.id === a.installer_id)?.full_name || '';
                const nameB = installersList.find(i => i.id === b.installer_id)?.full_name || '';
                return sortConfig.direction === 'asc'
                    ? nameA.localeCompare(nameB)
                    : nameB.localeCompare(nameA);
            });
        }

        // C. NIEUW: Sorteren op Inspectie ID (Natuurlijke Sortering)
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
    
    const selectedInspections = inspections.filter(insp => selectedIds.includes(insp.id));
    
    for (const insp of selectedInspections) {
      try {
        const { meta, defects, measurements } = insp.report_data;
        
        // Naming Convention: [Datum]_[Klant]_[Project]_[Plaats].pdf
        const fileName = `${meta.date || 'Datum'}_${meta.clientName || 'Klant'}_${meta.projectLocation || 'Project'}_${meta.projectCity || 'Plaats'}.pdf`;

        const doc = <PDFReport 
          meta={meta} 
          measurements={measurements} 
          defects={defects || []} 
        />;
        
        const blob = await pdf(doc).toBlob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(url);
        
        // Wachttijd om browser-blocking te voorkomen
        await new Promise(resolve => setTimeout(resolve, 600));
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

  const ProjSortableHeader = ({ label, sortKey, width }: { label: string; sortKey: string; width?: string }) => (
    <th className={`px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase cursor-pointer hover:bg-gray-100 transition-colors select-none ${width}`} onClick={() => handleProjSort(sortKey)}>
      <div className="flex items-center gap-1">
        {label}
        {projSortConfig.key === sortKey
          ? (projSortConfig.direction === 'asc' ? <ArrowUp size={14}/> : <ArrowDown size={14}/>)
          : <ArrowUpDown size={14} className="text-gray-300"/>}
      </div>
    </th>
  );

  const fetchUsers = async () => { const { data } = await supabase.from('profiles').select('id, email, full_name, scios_nr, phone, contact_email, role, linked_instruments, company_name, company_address, company_postal_code, company_city, company_phone, company_email').order('email'); setUsers(data || []); };

  const handleAdminToggleInstrument = async (userId: string, instrumentId: number, currentLinked: number[]) => {
    const isLinked = currentLinked.includes(instrumentId);
    const updated = isLinked ? currentLinked.filter(id => id !== instrumentId) : [...currentLinked, instrumentId];
    const { error } = await supabase.from('profiles').update({ linked_instruments: updated }).eq('id', userId);
    if (error) { alert('Fout bij opslaan: ' + error.message); return; }
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, linked_instruments: updated } : u));
  };
const fetchOptions = async () => {
      const { data } = await supabase.from('form_options').select('*').order('label');
      if (data) {
          setCompaniesList(data.filter(x => x.category === 'iv_company'));
          setInstrumentsList(data.filter(x => x.category === 'instrument'));
      }
  };

  const fetchInstallers = async () => {
      const { data } = await supabase.from('profiles').select('id, full_name').eq('role', 'installer').order('full_name');
      setInstallersList(data || []);
  };
  const handleDeleteUser = async (userId: string) => { if (window.confirm("⚠️ WAARSCHUWING ⚠️\n\nGebruiker verwijderen?")) { await supabase.rpc('delete_user', { user_id: userId }); fetchUsers(); } };
  const openPasswordModal = (user: any) => { setPasswordResetUser({ id: user.id, email: user.email }); setNewPasswordInput(''); setShowPasswordModal(true); };
  const handleResetPassword = async () => { 
      if (!passwordResetUser || !newPasswordInput) return;
      const { data: sessionData } = await supabase.auth.getSession();
      const { error } = await supabase.functions.invoke('admin-reset-password', { body: { userId: passwordResetUser.id, newPassword: newPasswordInput }, headers: { Authorization: `Bearer ${sessionData.session?.access_token}` } });
      if (error) alert("Fout: " + error.message); else { alert("✅ Gewijzigd!"); setShowPasswordModal(false); }
  };

  const fetchLibrary = async () => {
      const { data } = await supabase.from('defect_library').select('*').order('category').order('subcategory');
      setLibraryItems(data || []);
  };

  // --- CRM FETCHERS & HANDLERS ---
  const fetchClients = async () => {
    const { data } = await supabase.from('clients').select('*').order('name');
    setClients(data || []);
  };

  const fetchClientInspections = async (clientName: string) => {
    const { data } = await supabase.from('inspections')
      .select('id, inspection_number, created_at, status, report_data')
      .eq('client_name', clientName)
      .order('created_at', { ascending: false });
    setClientInspections(data || []);
  };

  const handleSelectClient = (client: Client) => {
    setSelectedClient(client);
    setClientTab('gegevens');
    setIsEditingClient(false);
    setExpandedProjectIds(new Set());
    fetchClientInspections(client.name);
  };

  const searchPlaces = async (query: string) => {
    setIsSearchingPlaces(true);
    setPlacesResults(await fetchPlaces(query));
    setIsSearchingPlaces(false);
  };

  // Vul de edit-buffer met Places resultaat (geen DB-aanroep — gebruiker klikt nog op Opslaan)
  const handleBatchUpdateUser = (parsed: ParsedPlace) => {
    setCompanyEditBuffer(b => ({ ...b, company_name: parsed.name, company_address: parsed.address, company_postal_code: parsed.postalCode, company_city: parsed.city, company_phone: parsed.phone }));
  };

  const handleSaveUserCompany = async (u: any) => {
    const buf = companyEditBuffer;
    const { error } = await supabase.from('profiles').update(buf).eq('id', u.id);
    if (error) { alert("Fout bij opslaan: " + error.message); return; }
    const companyName = buf.company_name?.trim();
    if (companyName) {
      const merged = { ...u, ...buf };
      if (u.role === 'installer') {
        const { data: existing } = await supabase.from('clients').select('id, contacts').ilike('name', companyName);
        if (existing && existing.length > 0) {
          const client = existing[0];
          const contacts: ClientContact[] = client.contacts || [];
          if (merged.full_name?.trim() && !contacts.find((c: ClientContact) => c.name.toLowerCase() === merged.full_name.trim().toLowerCase())) {
            contacts.push({ id: crypto.randomUUID(), name: merged.full_name.trim(), role: 'Medewerker', phone: '', email: merged.contact_email || '' });
          }
          await supabase.from('clients').update({ name: companyName, address: buf.company_address || '', postal_code: buf.company_postal_code || '', city: buf.company_city || '', phone: buf.company_phone || '', email: buf.company_email || '', contacts }).eq('id', client.id);
        } else {
          const contacts: ClientContact[] = merged.full_name?.trim() ? [{ id: crypto.randomUUID(), name: merged.full_name.trim(), role: 'Medewerker', phone: '', email: merged.contact_email || '' }] : [];
          await supabase.from('clients').insert({ name: companyName, address: buf.company_address || '', postal_code: buf.company_postal_code || '', city: buf.company_city || '', phone: buf.company_phone || '', email: buf.company_email || '', contacts });
        }
        fetchClients();
      } else {
        const companyData = { address: buf.company_address || '', postalCode: buf.company_postal_code || '', city: buf.company_city || '', phone: buf.company_phone || '', email: buf.company_email || '' };
        const { data: existing } = await supabase.from('form_options').select('id').eq('category', 'iv_company').ilike('label', companyName);
        if (existing && existing.length > 0) {
          await supabase.from('form_options').update({ label: companyName, data: companyData }).eq('id', existing[0].id);
        } else {
          await supabase.from('form_options').insert({ category: 'iv_company', label: companyName, data: companyData });
        }
        fetchOptions();
      }
    }
    fetchUsers();
    setExpandedCompanyUserId(null);
    setCompanyEditBuffer({});
  };

  const handleCreateClient = async () => {
    if (!newClientForm.name?.trim()) return alert('Naam is verplicht.');
    const { data, error } = await supabase.from('clients')
      .insert({ ...newClientForm, contacts: [] }).select().single();
    if (error) alert('Fout: ' + error.message);
    else {
      setShowNewClientForm(false);
      setNewClientForm({ name: '', contacts: [] });
      fetchClients();
      handleSelectClient(data);
    }
  };

  const handleUpdateClient = async (updates: Partial<Client>) => {
    if (!selectedClient) return;
    const { error } = await supabase.from('clients')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', selectedClient.id);
    if (error) alert('Fout: ' + error.message);
    else {
      const updated = { ...selectedClient, ...updates };
      setSelectedClient(updated);
      setIsEditingClient(false);
      fetchClients();
    }
  };

  const handleDeleteClient = async () => {
    if (!selectedClient) return;
    if (!window.confirm(`Klant "${selectedClient.name}" verwijderen?`)) return;
    await supabase.from('clients').delete().eq('id', selectedClient.id);
    setSelectedClient(null);
    fetchClients();
  };

  const handleSaveContacts = async (newContacts: ClientContact[]) => {
    if (!selectedClient) return;
    await supabase.from('clients')
      .update({ contacts: newContacts, updated_at: new Date().toISOString() })
      .eq('id', selectedClient.id);
    setSelectedClient({ ...selectedClient, contacts: newContacts });
    fetchClients();
  };

  // Stille achtergrond-sync: voegt ontbrekende klanten toe vanuit inspecties én installateurprofielen
  const autoSyncClients = async () => {
    const [{ data: allInspections }, { data: allProfiles }, { data: existing }] = await Promise.all([
      supabase.from('inspections').select('client_name, report_data'),
      supabase.from('profiles').select('full_name, contact_email, company_name, company_address, company_postal_code, company_city, company_phone, company_email').eq('role', 'installer').not('company_name', 'is', null).neq('company_name', ''),
      supabase.from('clients').select('name'),
    ]);
    const existingNames = new Set((existing || []).map((c: any) => c.name.trim().toLowerCase()));
    const seen = new Set<string>();
    const toInsert: Partial<Client>[] = [];

    for (const insp of allInspections || []) {
      const name = insp.client_name?.trim();
      if (!name || seen.has(name.toLowerCase()) || existingNames.has(name.toLowerCase())) continue;
      if (insp.report_data?.meta?.isContributionMode) continue;
      seen.add(name.toLowerCase());
      const m = insp.report_data?.meta || {};
      const contacts: ClientContact[] = [];
      if (m.clientContactPerson?.trim()) contacts.push({ id: crypto.randomUUID(), name: m.clientContactPerson.trim(), role: 'Contactpersoon', phone: m.clientPhone || '', email: m.clientEmail || '' });
      toInsert.push({ name, address: m.clientAddress || '', postal_code: m.clientPostalCode || '', city: m.clientCity || '', phone: m.clientPhone || '', email: m.clientEmail || '', contacts });
    }

    for (const p of allProfiles || []) {
      const name = p.company_name?.trim();
      if (!name || seen.has(name.toLowerCase()) || existingNames.has(name.toLowerCase())) continue;
      seen.add(name.toLowerCase());
      const contacts: ClientContact[] = p.full_name?.trim() ? [{ id: crypto.randomUUID(), name: p.full_name.trim(), role: 'Medewerker', phone: '', email: p.contact_email || '' }] : [];
      toInsert.push({ name, address: p.company_address || '', postal_code: p.company_postal_code || '', city: p.company_city || '', phone: p.company_phone || '', email: p.company_email || '', contacts });
    }

    if (toInsert.length > 0) { await supabase.from('clients').insert(toInsert); fetchClients(); }
  };

  // Voeg één installateur zijn bedrijf toe als klant (of voeg medewerker toe als al bestaat)
  const handleAddInstallerToClients = async (u: any) => {
    const name = u.company_name?.trim();
    if (!name) return alert('Vul eerst een bedrijfsnaam in voor deze gebruiker.');
    const { data: existing } = await supabase.from('clients').select('id, name, contacts').ilike('name', name);
    if (existing && existing.length > 0) {
      const client = existing[0];
      const contacts: ClientContact[] = client.contacts || [];
      if (u.full_name?.trim() && !contacts.find((c: ClientContact) => c.name.toLowerCase() === u.full_name.trim().toLowerCase())) {
        contacts.push({ id: crypto.randomUUID(), name: u.full_name.trim(), role: 'Medewerker', phone: '', email: u.contact_email || '' });
        await supabase.from('clients').update({ contacts }).eq('id', client.id);
      }
      alert(`Klant "${name}" bestaat al. ${u.full_name ? 'Medewerker toegevoegd als er nog niet aanwezig.' : ''}`);
    } else {
      const contacts: ClientContact[] = [];
      if (u.full_name?.trim()) contacts.push({ id: crypto.randomUUID(), name: u.full_name.trim(), role: 'Medewerker', phone: '', email: u.contact_email || '' });
      await supabase.from('clients').insert({ name, address: u.company_address || '', postal_code: u.company_postal_code || '', city: u.company_city || '', phone: u.company_phone || '', email: u.company_email || '', contacts });
      alert(`✅ "${name}" toegevoegd als klant.`);
    }
    fetchClients();
  };

  // Voeg één inspecteur/admin zijn bedrijf toe als Inspectiebedrijf in Instellingen
  const handleAddInspectorToSettings = async (u: any) => {
    const name = u.company_name?.trim();
    if (!name) return alert('Vul eerst een bedrijfsnaam in voor deze gebruiker.');
    const { data: existing } = await supabase.from('form_options').select('id').eq('category', 'iv_company').ilike('label', name);
    if (existing && existing.length > 0) { alert(`Inspectiebedrijf "${name}" staat al in de instellingen.`); return; }
    await supabase.from('form_options').insert({ category: 'iv_company', label: name, data: { address: u.company_address || '', postalCode: u.company_postal_code || '', city: u.company_city || '', phone: u.company_phone || '', email: u.company_email || '' } });
    fetchOptions();
    alert(`✅ "${name}" toegevoegd aan Instellingen → Inspectiebedrijf.`);
  };

  useEffect(() => { autoSyncClients(); }, []);

  useEffect(() => {
    if (activeTab === 'inspections') { fetchInspections(); fetchInstallers(); }
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'settings' || showOrderModal) { fetchOptions(); fetchUsers(); }
    if (activeTab === 'library') fetchLibrary();
    if (activeTab === 'clients') fetchClients();
  }, [page, searchTerm, activeTab, showOrderModal, sortConfig]);

  // --- PROJECTEN TAB LOGIC ---
  const handleProjSort = (key: string) => {
    setProjSortConfig(c => ({ key, direction: c.key === key && c.direction === 'asc' ? 'desc' : 'asc' }));
    setProjPage(1);
  };

  const fetchProjects = async () => {
    const from = (projPage - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;
    let query = supabase.from('inspections').select('*', { count: 'exact' });
    query = query.or('report_data->meta->>isContributionMode.is.null,report_data->meta->>isContributionMode.neq.true');

    if (projSearch) {
      query = query.or(`client_name.ilike.%${projSearch}%,inspection_number.ilike.%${projSearch}%,report_data->meta->>projectLocation.ilike.%${projSearch}%,report_data->meta->>projectCity.ilike.%${projSearch}%,report_data->meta->>inspectorName.ilike.%${projSearch}%`);
    }

    if (projSortConfig.key === 'client_name' || projSortConfig.key === 'status') {
      query = query.order(projSortConfig.key, { ascending: projSortConfig.direction === 'asc' });
    } else if (projSortConfig.key === 'proj_location') {
      query = query.order('report_data->meta->>projectLocation' as any, { ascending: projSortConfig.direction === 'asc' });
    } else if (projSortConfig.key === 'proj_city') {
      query = query.order('report_data->meta->>projectCity' as any, { ascending: projSortConfig.direction === 'asc' });
    } else if (projSortConfig.key === 'proj_date_start') {
      query = query.order('report_data->meta->>date' as any, { ascending: projSortConfig.direction === 'asc' });
    } else if (projSortConfig.key === 'proj_date_finalized') {
      query = query.order('report_data->meta->>finalizedDate' as any, { ascending: projSortConfig.direction === 'asc' });
    } else if (projSortConfig.key === 'next_inspection_date') {
      query = query.order('report_data->meta->>nextInspectionDate' as any, { ascending: projSortConfig.direction === 'asc' });
    } else {
      query = query.order('report_data->meta->>nextInspectionDate' as any, { ascending: true });
    }

    query = query.range(from, to);
    const { data, count, error } = await query;
    if (error) { console.error(error); return; }

    let finalData = data || [];

    if (projSortConfig.key === 'proj_inspector') {
      finalData.sort((a, b) => {
        const nA = a.report_data?.meta?.inspectorName || '';
        const nB = b.report_data?.meta?.inspectorName || '';
        return projSortConfig.direction === 'asc' ? nA.localeCompare(nB) : nB.localeCompare(nA);
      });
    }
    if (projSortConfig.key === 'proj_number') {
      finalData.sort((a, b) => {
        const nA = a.inspection_number || '';
        const nB = b.inspection_number || '';
        return projSortConfig.direction === 'asc'
          ? nA.localeCompare(nB, undefined, { numeric: true, sensitivity: 'base' })
          : nB.localeCompare(nA, undefined, { numeric: true, sensitivity: 'base' });
      });
    }

    setProjects(finalData);
    setProjTotalCount(count || 0);
  };

  useEffect(() => {
    if (activeTab === 'projecten') fetchProjects();
  }, [projPage, projSearch, projSortConfig, activeTab]);

  const getNextInspStyle = (dateStr: string | undefined) => {
    if (!dateStr) return '';
    const d = new Date(normalizeDate(dateStr));
    const diffDays = (d.getTime() - Date.now()) / 86400000;
    if (diffDays < 0) return 'text-red-700 font-bold';
    if (diffDays <= 60) return 'text-amber-700 font-bold';
    return 'text-green-700';
  };

  // --- LIBRARY HANDLERS ---
  const handleEditLibraryItem = (item: any) => {
      setEditingLibraryId(item.id);
      setNewLibraryItem({ category: item.category, subcategory: item.subcategory, shortName: item.shortName || item["shortName"], description: item.description, classification: item.classification });
      setShowLibraryModal(true);
  };

  const handleSaveLibraryItem = async () => {
      if (!newLibraryItem.category || !newLibraryItem.shortName) return alert("Categorie en Korte Naam verplicht.");
      const payload = { category: newLibraryItem.category, subcategory: newLibraryItem.subcategory, "shortName": newLibraryItem.shortName, description: newLibraryItem.description, classification: newLibraryItem.classification };
      
      if (editingLibraryId) await supabase.from('defect_library').update(payload).eq('id', editingLibraryId);
      else await supabase.from('defect_library').insert(payload);
      
      setShowLibraryModal(false); setEditingLibraryId(null);
      setNewLibraryItem({ category: '', subcategory: '', shortName: '', description: '', classification: 'Yellow' });
      fetchLibrary();
  };

  const handleDeleteLibraryItem = async (id: string) => {
      if (window.confirm("Gebrek definitief verwijderen? Oude rapporten blijven intact.")) {
          await supabase.from('defect_library').delete().eq('id', id);
          fetchLibrary();
      }
  };

  const handleLibraryCsvImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (!window.confirm("Wil je deze CSV toevoegen aan de database? Bestaande items worden niet overschreven.")) return;
      
      setLoading(true);
      const reader = new FileReader();
      reader.onload = async (event) => {
          try {
              const text = event.target?.result as string;
              const rows: string[][] = [];
              let currentRow: string[] = []; let currentCell = ''; let inQuotes = false;
              for (let i = 0; i < text.length; i++) {
                  const char = text[i]; const nextChar = text[i + 1];
                  if (char === '"') { if (inQuotes && nextChar === '"') { currentCell += '"'; i++; } else { inQuotes = !inQuotes; } }
                  else if (char === ';' && !inQuotes) { currentRow.push(currentCell.trim()); currentCell = ''; }
                  else if ((char === '\n' || (char === '\r' && nextChar === '\n')) && !inQuotes) {
                      currentRow.push(currentCell.trim());
                      if (currentRow.length > 1 || (currentRow.length === 1 && currentRow[0] !== '')) rows.push(currentRow);
                      currentRow = []; currentCell = '';
                      if (char === '\r') i++;
                  } else { if (char !== '\r') currentCell += char; }
              }
              if (currentCell || currentRow.length > 0) { currentRow.push(currentCell.trim()); rows.push(currentRow); }

              const { data: existing } = await supabase.from('defect_library').select('shortName');
              const existingNames = existing?.map(e => e.shortName || e["shortName"]) || [];

              let insertData = [];
              for (let i = 0; i < rows.length; i++) {
                  const cols = rows[i];
                  if (cols.length < 5) continue; 
                  if (i === 0 && cols[0].toLowerCase().includes('categor')) continue; 
                  
                  const shortName = cols[2] || 'Naamloos';
                  // Ontdubbelen: Sla over als de naam al in de cloud bestaat
                  if (existingNames.includes(shortName)) continue;
                  
                  insertData.push({
                      category: cols[0] || 'Overig', subcategory: cols[1] || 'Algemeen', "shortName": shortName,
                      description: cols[3] || '', classification: cols[4] || 'Yellow'
                  });
              }
              
              if (insertData.length > 0) {
                  const { error } = await supabase.from('defect_library').insert(insertData);
                  if (error) throw error;
                  alert(`${insertData.length} gebreken succesvol toegevoegd aan de cloud!`);
                  fetchLibrary();
              } else alert("Geen geldige data gevonden.");
          } catch (err: any) { alert("Fout bij importeren: " + err.message); } finally { setLoading(false); if (libraryCsvInputRef.current) libraryCsvInputRef.current.value = ''; }
      };
      reader.readAsText(file);
  };

const handleLoadDefaultLibrary = async () => {
      if (!window.confirm("Wil je de standaard ingebouwde NTA8220 bibliotheek naar de cloud kopiëren?")) return;
      
      setLoading(true);
      try {
          // 1. Haal eerst op wat er al in de cloud staat
          const { data: existing } = await supabase.from('defect_library').select('shortName');
          const existingNames = existing?.map(e => e.shortName || e["shortName"]) || [];

          // 2. Filter de standaardlijst: behoud alleen de items die nog NIET bestaan
          const newItems = DEFECT_LIBRARY.filter(d => !existingNames.includes(d.shortName));

          if (newItems.length === 0) {
              alert("Alle standaard gebreken staan al in je cloud-bibliotheek! Geen duplicaten toegevoegd.");
              setLoading(false);
              return;
          }

          // 3. Bouw de lijst om
          const insertData = newItems.map(d => ({
              category: d.category,
              subcategory: d.subcategory,
              "shortName": d.shortName,
              description: d.description,
              classification: d.classification
          }));
          
          const { error } = await supabase.from('defect_library').insert(insertData);
          if (error) throw error;
          
          alert(`Succes! ${insertData.length} nieuwe standaard gebreken toegevoegd. (${DEFECT_LIBRARY.length - insertData.length} overgeslagen i.v.m. duplicaten)`);
          fetchLibrary();
      } catch (err: any) { 
          alert("Fout bij laden van standaard bibliotheek: " + err.message); 
      } finally { 
          setLoading(false); 
      }
  };

// --- SETTINGS HANDLERS ---
  const startEditCompany = (item: any) => {
      setEditingSettingId(item.id); setEditingCategory('iv_company');
      setNewCompany({ name: item.label, address: item.data?.address || '', postalCode: item.data?.postalCode || '', city: item.data?.city || '', phone: item.data?.phone || '', email: item.data?.email || '', website: item.data?.website || '' });
  };
  const handleSaveCompany = async () => {
      if (!newCompany.name) return alert("Naam verplicht");
      const payload = { label: newCompany.name, data: { address: newCompany.address, postalCode: newCompany.postalCode, city: newCompany.city, phone: newCompany.phone, email: newCompany.email, website: newCompany.website } };
      if (editingSettingId) {
          const oldEntry = companiesList.find(c => c.id === editingSettingId);
          const oldLabel = oldEntry?.label;
          await supabase.from('form_options').update(payload).eq('id', editingSettingId);
          // Sync: update all inspector/admin profiles that use this company name
          if (oldLabel) {
              await supabase.from('profiles').update({
                  company_name: newCompany.name,
                  company_address: newCompany.address,
                  company_postal_code: newCompany.postalCode,
                  company_city: newCompany.city,
                  company_phone: newCompany.phone,
                  company_email: newCompany.email,
              }).ilike('company_name', oldLabel).in('role', ['inspector', 'admin']);
          }
          fetchUsers();
      } else {
          await supabase.from('form_options').insert({ category: 'iv_company', ...payload });
      }
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
  const cancelEditSettings = () => { setEditingSettingId(null); setEditingCategory(null); setNewCompany({ name: '', address: '', postalCode: '', city: '', phone: '', email: '', website: '' }); setNewInstrument({ name: '', serial: '', calibration: '' }); };

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

  const upsertClientFromOrder = async () => {
    const name = newOrder.clientName.trim();
    if (!name) return;
    const { data: existing } = await supabase.from('clients').select('id, contacts').ilike('name', name);
    if (existing && existing.length > 0) {
      const client = existing[0];
      const contacts: ClientContact[] = client.contacts || [];
      const contactName = newOrder.clientContactPerson?.trim();
      if (contactName && !contacts.find((c: ClientContact) => c.name.toLowerCase() === contactName.toLowerCase())) {
        contacts.push({ id: crypto.randomUUID(), name: contactName, role: 'Contactpersoon', phone: newOrder.clientPhone || '', email: newOrder.clientEmail || '' });
      }
      await supabase.from('clients').update({ address: newOrder.clientAddress || '', postal_code: newOrder.clientPostalCode || '', city: newOrder.clientCity || '', phone: newOrder.clientPhone || '', email: newOrder.clientEmail || '', contacts }).eq('id', client.id);
    } else {
      const contacts: ClientContact[] = newOrder.clientContactPerson?.trim()
        ? [{ id: crypto.randomUUID(), name: newOrder.clientContactPerson.trim(), role: 'Contactpersoon', phone: newOrder.clientPhone || '', email: newOrder.clientEmail || '' }]
        : [];
      await supabase.from('clients').insert({ name, address: newOrder.clientAddress || '', postal_code: newOrder.clientPostalCode || '', city: newOrder.clientCity || '', phone: newOrder.clientPhone || '', email: newOrder.clientEmail || '', contacts });
    }
  };

  const handleSaveOrder = async () => {
    if (!newOrder.clientName) return alert("Klantnaam verplicht.");
    const metaData = { ...newOrder, totalComponents: 0, inspectionInterval: 5, usageFunctions: { kantoorfunctie: false }, inspectionBasis: { nta8220: true, verzekering: false } };
    if (editingId) {
        const existingInsp = inspections.find(i => i.id === editingId); if (!existingInsp) return;
        const updatedReportData = { ...existingInsp.report_data, meta: { ...existingInsp.report_data.meta, ...metaData } };
        const { error } = await supabase.from('inspections').update({ client_name: newOrder.clientName, report_data: updatedReportData }).eq('id', editingId);
        if (error) { alert("Fout: " + error.message); } else { await upsertClientFromOrder(); alert("Opgeslagen!"); closeModal(); fetchInspections(); }
    } else {
        const initialData = { meta: metaData, measurements: { installationType: 'TN-S', mainFuse: '3x63A', mainsVoltage: '400 V', selectedInstruments: [] }, defects: [] };
        const { error } = await supabase.from('inspections').insert({ client_name: newOrder.clientName, status: 'new', scope_type: '10', report_data: initialData });
        if (error) { alert('Fout: ' + error.message); } else { await upsertClientFromOrder(); alert('Aangemaakt!'); closeModal(); fetchInspections(); }
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
        const a = document.createElement('a'); a.href = url;
        
        // Naming Convention: [Datum]_[Klant]_[Project]_[Plaats].pdf
        a.download = `${meta.date || 'Datum'}_${meta.clientName || 'Klant'}_${meta.projectLocation || 'Project'}_${meta.projectCity || 'Plaats'}.pdf`;
        
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
  
  const handleAssignInstaller = async (inspectionId: number, installerId: string) => {
      if (!installerId) return;
      if (!window.confirm('Inspectie toewijzen aan installateur en status wijzigen naar "Wacht op Herstel"?')) return;
      const { error } = await supabase.from('inspections')
          .update({ installer_id: installerId, status: 'herstel_wacht' })
          .eq('id', inspectionId);
      if (error) alert('Fout: ' + error.message);
      else { setAssigningInstaller(prev => { const n = { ...prev }; delete n[inspectionId]; return n; }); fetchInspections(); }
  };

  const handleApproveRepair = async (id: number) => {
      if (!window.confirm('Herstel goedkeuren? Status wordt "Herstel Afgerond".')) return;
      const { error } = await supabase.from('inspections').update({ status: 'herstel_afgerond' }).eq('id', id);
      if (error) alert('Fout: ' + error.message); else fetchInspections();
  };

  const handleRejectRepair = async (id: number) => {
      if (!window.confirm('Herstel afkeuren? Installateur moet opnieuw indienen.')) return;
      const { error } = await supabase.from('inspections').update({ status: 'herstel_wacht' }).eq('id', id);
      if (error) alert('Fout: ' + error.message); else fetchInspections();
  };

  const handleReopenHerstel = async (id: number) => {
      if (!window.confirm('Herstel opnieuw openzetten? Status wordt teruggezet naar "Klaar" zodat wijzigingen mogelijk zijn.')) return;
      const { error } = await supabase.from('inspections').update({ status: 'completed' }).eq('id', id);
      if (error) alert('Fout: ' + error.message); else fetchInspections();
  };

  const handleDownloadHerstelPDF = async (inspection: any) => {
      if (!inspection.report_data) return alert('Geen data');
      setIsGeneratingPdf(true);
      try {
          const { meta, defects, measurements } = inspection.report_data;
          const blob = await pdf(
              <PDFReport meta={meta} defects={defects || []} measurements={measurements} reportType="herstel" />
          ).toBlob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a'); a.href = url;
          a.download = `HERSTEL_${meta.repairDate || meta.date || 'Datum'}_${meta.clientName || 'Klant'}.pdf`;
          document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
      } catch (e) { console.error(e); alert('Fout bij genereren'); } finally { setIsGeneratingPdf(false); }
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

  // --- MASTER BACKUP EXPORT ---
  const handleExportAll = async () => { 
      if (!window.confirm("Volledige backup maken van het HELE systeem (Inspecties, Bibliotheek, Instellingen, Gebruikers)?")) return; 
      
      setLoading(true);
      try {
          // Haal alle vier de lades tegelijk leeg
          const [
              { data: inspections },
              { data: library },
              { data: settings },
              { data: users }
          ] = await Promise.all([
              supabase.from('inspections').select('*'),
              supabase.from('defect_library').select('*'),
              supabase.from('form_options').select('*'),
              supabase.from('profiles').select('*')
          ]);

          // Stop ze in één groot pakketje
          const backupData = {
              version: 1,
              timestamp: new Date().toISOString(),
              inspections: inspections || [],
              library: library || [],
              settings: settings || [],
              users: users || []
          };

          const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' }); 
          const url = URL.createObjectURL(blob); 
          const a = document.createElement('a'); a.href = url; 
          a.download = `Systeem_Backup_${new Date().toISOString().split('T')[0]}.json`; 
          document.body.appendChild(a); a.click(); document.body.removeChild(a); 
      } catch (err: any) {
          alert("Fout bij maken backup: " + err.message);
      } finally {
          setLoading(false);
      }
  };
  // --- MASTER RESTORE BACKUP ---
  const handleRestoreBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!window.confirm("⚠️ WAARSCHUWING: SYSTEEM HERSTEL ⚠️\n\nJe staat op het punt een systeem-backup terug te zetten.\n- Bestaande data met hetzelfde ID wordt overschreven.\n- Ontbrekende data wordt veilig toegevoegd.\n\nWeet je zeker dat je wilt doorgaan?")) {
          if (restoreInputRef.current) restoreInputRef.current.value = '';
          return;
      }

      setLoading(true);
      const reader = new FileReader();
      reader.onload = async (event) => {
          try {
              const json = JSON.parse(event.target?.result as string);
              
              let inspectionsData: any[] = [];
              let libraryData: any[] = [];
              let settingsData: any[] = [];
              let usersData: any[] = [];

              // Slimme check: Welk type backup is dit?
              if (Array.isArray(json)) {
                  // Het is de oude backup (alleen inspecties)
                  inspectionsData = json;
              } else if (json.inspections) {
                  // Het is de nieuwe Master Backup
                  inspectionsData = json.inspections || [];
                  libraryData = json.library || [];
                  settingsData = json.settings || [];
                  usersData = json.users || [];
              } else {
                  throw new Error("Ongeldig backup bestand. Kan de data niet lezen.");
              }

              let success = { insp: 0, lib: 0, set: 0, usr: 0 };
              let failCount = 0;

              // 1. Herstel Bibliotheek (Gebreken) met Ontdubbeling
              if (libraryData.length > 0) {
                  const { data: existingLib } = await supabase.from('defect_library').select('id, shortName');
                  const existingNames = existingLib?.map(e => e.shortName || e["shortName"]) || [];
                  const existingIds = existingLib?.map(e => e.id) || [];
                  
                  const toUpsert = libraryData.filter(item => {
                      // 1. Als het exacte ID al bestaat in de cloud, mag hij hem netjes updaten
                      if (existingIds.includes(item.id)) return true;
                      // 2. Als het ID nieuw is, maar de Korte Naam bestaat al, filter hem dan weg (voorkomt duplicaten)
                      if (existingNames.includes(item.shortName || item["shortName"])) return false;
                      // 3. Anders is het een écht nieuw gebrek, voeg toe!
                      return true;
                  });

                  if (toUpsert.length > 0) {
                      const { error } = await supabase.from('defect_library').upsert(toUpsert);
                      if (error) { console.error("Fout library", error); failCount++; } else success.lib = toUpsert.length;
                  }
              }

              // 2. Herstel Instellingen (Bedrijven, Inspecteurs, Instrumenten)
              if (settingsData.length > 0) {
                  const { error } = await supabase.from('form_options').upsert(settingsData);
                  if (error) { console.error("Fout instellingen", error); failCount++; } else success.set = settingsData.length;
              }

              // 3. Herstel Inspecties (Met ID sortering voor de parent_ids)
              if (inspectionsData.length > 0) {
                  const sortedInsp = inspectionsData.sort((a: any, b: any) => (a.id || 0) - (b.id || 0));
                  for (const item of sortedInsp) {
                      const { error } = await supabase.from('inspections').upsert(item);
                      if (error) { console.error("Fout inspectie " + item.id, error); failCount++; } else success.insp++;
                  }
              }

              // 4. Herstel Gebruikers (Alleen de profielen updaten van bestaande gebruikers!)
              if (usersData.length > 0) {
                  for (const u of usersData) {
                      const { error } = await supabase.from('profiles').update({ role: u.role }).eq('id', u.id);
                      if (error) { console.error("Fout profiel " + u.id, error); failCount++; } else success.usr++;
                  }
              }

              alert(`✅ Herstel voltooid!\n\nVerwerkt:\n- ${success.insp} Inspecties\n- ${success.lib} Gebreken (Bibliotheek)\n- ${success.set} Instellingen\n- ${success.usr} Gebruikersrollen\n\n❌ ${failCount} fouten (zie log).`);
              
              // Ververs alle schermen in het dashboard
              fetchInspections();
              if (typeof fetchLibrary === 'function') fetchLibrary(); // Voorkom crash als we op een andere tab staan
              fetchOptions();
              fetchUsers();

          } catch (err: any) {
              console.error(err);
              alert("Fout bij lezen bestand: " + err.message);
          } finally {
              setLoading(false);
              if (restoreInputRef.current) restoreInputRef.current.value = '';
          }
      };
      reader.readAsText(file);
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

// NIEUW: Inline update functie voor Profielen (Naam, SCIOS, Tel, Email, Bedrijfsgegevens)
  const handleUpdateProfile = async (userId: string, field: string, value: string) => {
      const { error } = await supabase.from('profiles').update({ [field]: value }).eq('id', userId);
      if (error) alert("Fout bij opslaan: " + error.message); else fetchUsers();
  };

  // Updates one profile field and syncs the full company data to form_options (inspector/admin) or clients (installer)
  const handleUpdateProfileAndSync = async (u: any, field: string, value: string) => {
      const { error } = await supabase.from('profiles').update({ [field]: value }).eq('id', u.id);
      if (error) { alert("Fout bij opslaan: " + error.message); return; }
      const merged = { ...u, [field]: value };
      const companyName = merged.company_name?.trim();
      if (companyName) {
          if (u.role === 'installer') {
              const { data: existing } = await supabase.from('clients').select('id').ilike('name', companyName);
              if (existing && existing.length > 0) {
                  await supabase.from('clients').update({
                      address: merged.company_address || '',
                      postal_code: merged.company_postal_code || '',
                      city: merged.company_city || '',
                      phone: merged.company_phone || '',
                      email: merged.company_email || '',
                  }).eq('id', existing[0].id);
              }
          } else {
              const { data: existing } = await supabase.from('form_options').select('id').eq('category', 'iv_company').ilike('label', companyName);
              if (existing && existing.length > 0) {
                  await supabase.from('form_options').update({
                      label: merged.company_name,
                      data: { address: merged.company_address || '', postalCode: merged.company_postal_code || '', city: merged.company_city || '', phone: merged.company_phone || '', email: merged.company_email || '' }
                  }).eq('id', existing[0].id);
              }
          }
      }
      fetchUsers();
  };

  const handleCreateUser = async () => {
    if (!newUser.email || !newUser.password) return alert("Vul email en wachtwoord in.");
    try {
        const { data: sessionData } = await supabase.auth.getSession();
        const { data, error } = await supabase.functions.invoke('create-user', {
            body: { email: newUser.email.trim(), password: newUser.password, role: newUser.role },
            headers: { Authorization: `Bearer ${sessionData.session?.access_token}` }
        });
        if (error || data?.error) throw new Error(error?.message || data?.error);

        // Haal het user ID op uit de edge function response
        const userId = data?.userId || data?.user?.id || data?.id;
        const profilePayload = {
            full_name: newUser.full_name,
            scios_nr: newUser.scios_nr,
            phone: newUser.phone,
            contact_email: newUser.contact_email,
            role: newUser.role,
            company_name: newUser.company_name,
            company_address: newUser.company_address,
            company_postal_code: newUser.company_postal_code,
            company_city: newUser.company_city,
            company_phone: newUser.company_phone,
            company_email: newUser.company_email,
        };
        if (userId) {
            // Gebruik het ID direct — geen email-lookup nodig
            await supabase.from('profiles').update(profilePayload).eq('id', userId);
        } else {
            // Fallback: zoek profiel op email (kan een fractie later beschikbaar zijn)
            const { data: profile } = await supabase.from('profiles').select('id').eq('email', newUser.email.trim()).single();
            if (profile) {
                await supabase.from('profiles').update(profilePayload).eq('id', profile.id);
            }
        }

        // Bedrijfsgegevens automatisch doorsturen op basis van rol
        if (newUser.company_name?.trim()) {
            const companyName = newUser.company_name.trim();
            if (newUser.role === 'installer') {
                const { data: existingClient } = await supabase.from('clients').select('id, contacts').ilike('name', companyName);
                if (existingClient && existingClient.length > 0) {
                    const client = existingClient[0];
                    const contacts: ClientContact[] = client.contacts || [];
                    if (newUser.full_name?.trim() && !contacts.find((c: ClientContact) => c.name.toLowerCase() === newUser.full_name.trim().toLowerCase())) {
                        contacts.push({ id: crypto.randomUUID(), name: newUser.full_name.trim(), role: 'Medewerker', phone: '', email: newUser.contact_email || '' });
                        await supabase.from('clients').update({ contacts }).eq('id', client.id);
                    }
                } else {
                    const contacts: ClientContact[] = newUser.full_name?.trim()
                        ? [{ id: crypto.randomUUID(), name: newUser.full_name.trim(), role: 'Medewerker', phone: '', email: newUser.contact_email || '' }]
                        : [];
                    await supabase.from('clients').insert({ name: companyName, address: newUser.company_address || '', postal_code: newUser.company_postal_code || '', city: newUser.company_city || '', phone: newUser.company_phone || '', email: newUser.company_email || '', contacts });
                }
            } else {
                const { data: existingCompany } = await supabase.from('form_options').select('id').eq('category', 'iv_company').ilike('label', companyName);
                if (!existingCompany || existingCompany.length === 0) {
                    await supabase.from('form_options').insert({ category: 'iv_company', label: companyName, data: { address: newUser.company_address || '', postalCode: newUser.company_postal_code || '', city: newUser.company_city || '', phone: newUser.company_phone || '', email: newUser.company_email || '' } });
                }
            }
        }

        alert(`✅ ${newUser.email} aangemaakt!`);
        setShowUserModal(false);
        setNewUser({ email: '', password: '', role: 'inspector', full_name: '', scios_nr: '', phone: '', contact_email: '', company_name: '', company_address: '', company_postal_code: '', company_city: '', company_phone: '', company_email: '' });
        fetchUsers();
    } catch (err: any) { alert("Fout: " + err.message); }
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-gray-100 p-3 md:p-8">
      <div className="max-w-[95%] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div><h1 className="text-2xl md:text-3xl font-bold text-gray-800">Kantoor Dashboard</h1><p className="text-gray-500 text-sm">Beheer {totalCount} inspecties</p></div>
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
             {activeTab === 'inspections' && (
                 <>
                    <button onClick={() => excelInputRef.current?.click()} className="flex items-center gap-2 bg-green-600 px-3 py-2.5 rounded-lg shadow text-white hover:bg-green-700 font-bold text-sm border border-green-700"><FileSpreadsheet size={16} /> <span className="hidden sm:inline">Import</span> Excel</button>
                    <input type="file" ref={excelInputRef} onChange={handleExcelImport} accept=".xlsx, .xls" className="hidden" />
                    <button onClick={handleExcelExport} className="flex items-center gap-2 bg-white px-3 py-2.5 rounded-lg shadow text-green-700 hover:bg-green-50 font-bold text-sm border border-green-200"><Download size={16} /> <span className="hidden sm:inline">Export</span> Excel</button>
                    <button onClick={handleExportAll} className="flex items-center gap-2 bg-gray-700 px-3 py-2.5 rounded-lg shadow text-white hover:bg-gray-800 font-bold text-sm border border-gray-600"><Database size={16} /> Backup</button>
                    <button onClick={() => restoreInputRef.current?.click()} className="flex items-center gap-2 bg-orange-600 px-3 py-2.5 rounded-lg shadow text-white hover:bg-orange-700 font-bold text-sm border border-orange-700" title="Zet een FULL_BACKUP.json terug"><RefreshCw size={16} /> Herstel</button>
                    <input type="file" ref={restoreInputRef} onChange={handleRestoreBackup} accept=".json,application/json" className="hidden" />
                    {selectedIds.length > 0 && (
                      <>
                        <button onClick={handleBulkDownloadPDFs} className="flex items-center gap-2 bg-blue-600 px-3 py-2.5 rounded-lg shadow text-white hover:bg-blue-700 font-bold text-sm border border-blue-700">
                          <FileText size={16} /> PDF ({selectedIds.length})
                        </button>
                        <button onClick={handleBulkDelete} className="flex items-center gap-2 bg-red-600 px-3 py-2.5 rounded-lg shadow text-white hover:bg-red-700 font-bold text-sm animate-pulse border border-red-700">
                          <Trash2 size={16} /> Verwijder ({selectedIds.length})
                        </button>
                      </>
                    )}
                    <button onClick={() => { setNewOrder(EMPTY_ORDER); setShowOrderModal(true); }} className="flex items-center gap-2 bg-emerald-600 px-4 py-2.5 rounded-lg shadow text-white hover:bg-emerald-700 font-bold text-sm"><Plus size={16} /> Nieuw</button>
                 </>
             )}
          </div>
        </div>

        <div className="flex mb-6 border-b border-gray-300 overflow-x-auto">
            <button onClick={() => setActiveTab('inspections')} className={`py-3 px-4 font-bold text-sm flex items-center gap-2 whitespace-nowrap border-b-2 transition-colors ${activeTab === 'inspections' ? 'text-emerald-600 border-emerald-600' : 'text-gray-500 border-transparent hover:text-gray-700'}`}><FileText size={16}/> Inspecties</button>
            <button onClick={() => setActiveTab('library')} className={`py-3 px-4 font-bold text-sm flex items-center gap-2 whitespace-nowrap border-b-2 transition-colors ${activeTab === 'library' ? 'text-emerald-600 border-emerald-600' : 'text-gray-500 border-transparent hover:text-gray-700'}`}><BookOpen size={16}/> Bibliotheek</button>
            <button onClick={() => setActiveTab('users')} className={`py-3 px-4 font-bold text-sm flex items-center gap-2 whitespace-nowrap border-b-2 transition-colors ${activeTab === 'users' ? 'text-emerald-600 border-emerald-600' : 'text-gray-500 border-transparent hover:text-gray-700'}`}><Users size={16}/> Gebruikers</button>
            <button onClick={() => setActiveTab('settings')} className={`py-3 px-4 font-bold text-sm flex items-center gap-2 whitespace-nowrap border-b-2 transition-colors ${activeTab === 'settings' ? 'text-emerald-600 border-emerald-600' : 'text-gray-500 border-transparent hover:text-gray-700'}`}><Settings size={16}/> Instellingen</button>
            <button onClick={() => setActiveTab('clients')} className={`py-3 px-4 font-bold text-sm flex items-center gap-2 whitespace-nowrap border-b-2 transition-colors ${activeTab === 'clients' ? 'text-emerald-600 border-emerald-600' : 'text-gray-500 border-transparent hover:text-gray-700'}`}><Building size={16}/> Klanten</button>
            <button onClick={() => setActiveTab('projecten')} className={`py-3 px-4 font-bold text-sm flex items-center gap-2 whitespace-nowrap border-b-2 transition-colors ${activeTab === 'projecten' ? 'text-emerald-600 border-emerald-600' : 'text-gray-500 border-transparent hover:text-gray-700'}`}><FolderOpen size={16}/> Projecten</button>
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
                            <SortableHeader label="Installateur" sortKey="installer_name" />
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
                            <td className="px-4 py-3 cursor-pointer select-none" onClick={() => !['herstel_wacht','ter_controle','herstel_afgerond'].includes(insp.status) ? toggleStatus(insp) : undefined}>
                                {(!insp.status || insp.status === 'new') && <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-bold border border-blue-200">Nieuw</span>}
                                {insp.status === 'in_progress' && <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded font-bold border border-orange-200 flex items-center gap-1 w-fit"><RefreshCw size={12} className="animate-spin"/> Bezig</span>}
                                {insp.status === 'review_ready' && <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded font-bold border border-purple-200 shadow-sm flex items-center gap-1 w-fit"><FileText size={12}/> Review</span>}
                                {insp.status === 'completed' && <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-bold border border-green-200 flex items-center gap-1 w-fit"><Lock size={12}/> Klaar</span>}
                                {insp.status === 'herstel_wacht' && <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded font-bold border border-amber-200 flex items-center gap-1 w-fit"><RefreshCw size={12}/> Wacht op Herstel</span>}
                                {insp.status === 'ter_controle' && <span className="bg-violet-100 text-violet-800 text-xs px-2 py-1 rounded font-bold border border-violet-200 flex items-center gap-1 w-fit"><FileText size={12}/> Ter Controle</span>}
                                {insp.status === 'herstel_afgerond' && <span className="bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded font-bold border border-teal-200 flex items-center gap-1 w-fit"><CheckCircle size={12}/> Herstel Afgerond</span>}
                            </td>
                            
                            {/* 9. Inspecteur */}
                            <td className="px-4 py-3 text-sm text-gray-500"><User size={16} className="inline mr-1"/> {insp.report_data?.meta?.inspectorName || '-'}</td>

                            {/* 10. Installateur */}
                            <td className="px-4 py-3 text-sm text-gray-500">
                              {insp.installer_id
                                ? (installersList.find(i => i.id === insp.installer_id)?.full_name || <span className="text-gray-300 italic text-xs">Onbekend</span>)
                                : <span className="text-gray-300">—</span>}
                            </td>

                            {/* 11. Acties */}
                            <td className="px-4 py-3 text-right text-sm font-medium">
                                <div className="flex justify-end gap-2 flex-wrap items-center">
                                  {/* Assign installer — only for main reports (not colleague contributions) */}
                                  {insp.status === 'completed' && !insp.report_data?.meta?.isContributionMode && (
                                    <div className="flex items-center gap-1">
                                      <select
                                        value={assigningInstaller[insp.id] || ''}
                                        onChange={(e) => setAssigningInstaller(prev => ({ ...prev, [insp.id]: e.target.value }))}
                                        className="text-xs border border-gray-300 rounded px-1 py-0.5"
                                        title="Wijs installateur toe"
                                      >
                                        <option value="">Installateur...</option>
                                        {installersList.map(i => <option key={i.id} value={i.id}>{i.full_name}</option>)}
                                      </select>
                                      <button
                                        onClick={() => handleAssignInstaller(insp.id, assigningInstaller[insp.id] || '')}
                                        disabled={!assigningInstaller[insp.id]}
                                        className="text-xs bg-amber-500 text-white px-2 py-0.5 rounded disabled:opacity-40"
                                        title="Stuur naar installateur"
                                      >
                                        Sturen
                                      </button>
                                    </div>
                                  )}
                                  {/* Approve/Reject — only when status is 'ter_controle' */}
                                  {insp.status === 'ter_controle' && (
                                    <>
                                      <button onClick={() => handleApproveRepair(insp.id)} className="text-xs bg-green-600 text-white px-2 py-0.5 rounded hover:bg-green-700" title="Herstel goedkeuren">✓ Akkoord</button>
                                      <button onClick={() => handleRejectRepair(insp.id)} className="text-xs bg-red-500 text-white px-2 py-0.5 rounded hover:bg-red-600" title="Herstel afkeuren">✗ Afkeuren</button>
                                    </>
                                  )}
                                  <button onClick={() => handleEdit(insp)} className="text-blue-500 hover:text-blue-700" title="Bewerken"><Pencil size={16}/></button>
                                  <button onClick={() => handleDownloadPDF(insp)} disabled={isGeneratingPdf} className="text-red-600 font-bold" title="PDF Origineel"><FileText size={16}/></button>
                                  {/* Heropenen — only when herstel is afgerond */}
                                  {insp.status === 'herstel_afgerond' && (
                                    <button onClick={() => handleReopenHerstel(insp.id)} className="text-xs bg-gray-500 text-white px-2 py-0.5 rounded hover:bg-gray-600" title="Herstel opnieuw openzetten">↩ Heropenen</button>
                                  )}
                                  {/* Herstel PDF — only when repair has been submitted */}
                                  {(insp.status === 'ter_controle' || insp.status === 'herstel_afgerond') && (
                                    <button onClick={() => handleDownloadHerstelPDF(insp)} disabled={isGeneratingPdf} className="text-violet-600 font-bold" title="PDF Herstelrapport"><FileText size={16}/></button>
                                  )}
                                  <button onClick={() => downloadJSON(insp)} className="text-indigo-600" title="JSON"><Download size={16}/></button>
                                  <button onClick={() => handleDelete(insp.id)} className="text-red-400 hover:text-red-600" title="Verwijderen"><Trash2 size={16}/></button>
                                </div>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
                )}
            </>
        )}

{/* TAB USERS */}
        {activeTab === 'users' && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-4 bg-blue-50 border-b border-blue-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex items-center gap-2 text-sm text-blue-800"><Shield size={18}/><span className="hidden sm:inline">Beheer accounts en profielgegevens.</span><span className="sm:hidden font-bold">Gebruikersbeheer</span></div>
                    <button onClick={() => setShowUserModal(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg shadow text-sm font-bold hover:bg-blue-700 shrink-0"><UserPlus size={16} /> Nieuwe Gebruiker</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-50 border-b"><tr><th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Login Email</th><th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Volledige Naam</th><th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Telefoon</th><th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Contact Email</th><th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">SCIOS Nr</th><th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Rol</th><th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Acties</th></tr></thead>
                        <tbody className="divide-y divide-gray-200">
                            {users.map(u => {
                                const isExpanded = expandedUserId === u.id;
                                const userLinked: number[] = u.linked_instruments ?? [];
                                return (
                                <React.Fragment key={u.id}>
                                <tr className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm font-bold text-gray-700">{u.email}</td>
                                    <td className="px-4 py-3 text-sm"><input className="border rounded p-1 w-full text-sm bg-transparent hover:bg-white focus:bg-white transition-colors" defaultValue={u.full_name || ''} onBlur={(e) => { if(e.target.value !== (u.full_name||'')) handleUpdateProfile(u.id, 'full_name', e.target.value); }} placeholder="Naam..." /></td>
                                    <td className="px-4 py-3 text-sm"><input className="border rounded p-1 w-28 text-sm bg-transparent hover:bg-white focus:bg-white transition-colors" defaultValue={u.phone || ''} onBlur={(e) => { if(e.target.value !== (u.phone||'')) handleUpdateProfile(u.id, 'phone', e.target.value); }} placeholder="06-..." /></td>
                                    <td className="px-4 py-3 text-sm"><input className="border rounded p-1 w-full text-sm bg-transparent hover:bg-white focus:bg-white transition-colors" defaultValue={u.contact_email || ''} onBlur={(e) => { if(e.target.value !== (u.contact_email||'')) handleUpdateProfile(u.id, 'contact_email', e.target.value); }} placeholder={u.email} /></td>
                                    <td className="px-4 py-3 text-sm"><input className="border rounded p-1 w-24 text-sm bg-transparent hover:bg-white focus:bg-white transition-colors" defaultValue={u.scios_nr || ''} onBlur={(e) => { if(e.target.value !== (u.scios_nr||'')) handleUpdateProfile(u.id, 'scios_nr', e.target.value); }} placeholder="Optioneel" /></td>
                                    <td className="px-4 py-3 text-sm"><select className="border rounded p-1 text-sm bg-white cursor-pointer" value={u.role} onChange={(e) => handleRoleChange(u.id, e.target.value)}><option value="inspector">Inspector</option><option value="admin">Admin</option><option value="installer">Installateur</option></select></td>
                                    <td className="px-4 py-3 text-right text-sm">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => {
                                              if (expandedCompanyUserId === u.id) { setExpandedCompanyUserId(null); setCompanyEditBuffer({}); }
                                              else { setExpandedCompanyUserId(u.id); setPlacesResults([]); setPlacesQuery(''); setCompanyEditBuffer({ company_name: u.company_name || '', company_address: u.company_address || '', company_postal_code: u.company_postal_code || '', company_city: u.company_city || '', company_phone: u.company_phone || '', company_email: u.company_email || '' }); }
                                            }} className={`p-2 rounded transition-colors ${expandedCompanyUserId === u.id ? 'text-blue-700 bg-blue-100' : 'text-blue-400 hover:text-blue-700 bg-blue-50 hover:bg-blue-100'}`} title="Bedrijfsgegevens"><Building size={18}/></button>
                                            {u.role !== 'installer' && <button onClick={() => { setExpandedUserId(isExpanded ? null : u.id); setAdminKofferSearch(''); }} className={`p-2 rounded transition-colors ${isExpanded ? 'text-emerald-700 bg-emerald-100' : 'text-emerald-400 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100'}`} title="Koffer beheren"><Wrench size={18}/></button>}
                                            <button onClick={() => openPasswordModal(u)} className="text-orange-400 hover:text-orange-600 bg-orange-50 p-2 rounded hover:bg-orange-100 transition-colors" title="Wachtwoord Resetten"><Key size={18}/></button>
                                            <button onClick={() => handleDeleteUser(u.id)} className="text-red-400 hover:text-red-600 bg-red-50 p-2 rounded hover:bg-red-100 transition-colors" title="Verwijder"><Trash2 size={18}/></button>
                                        </div>
                                    </td>
                                </tr>
                                {isExpanded && (
                                    <tr className="bg-emerald-50">
                                        <td colSpan={7} className="px-4 py-4 border-b border-emerald-200">
                                            <div className="max-w-2xl">
                                                <h3 className="font-bold text-sm text-emerald-800 mb-3 flex items-center gap-2"><Wrench size={16}/> Koffer: {u.full_name || u.email} ({userLinked.length} gekoppeld)</h3>
                                                <input type="text" placeholder="Zoek instrument..." className="w-full border rounded p-2 text-sm mb-3" value={adminKofferSearch} onChange={e => setAdminKofferSearch(e.target.value)} />
                                                <div className="max-h-64 overflow-y-auto space-y-1">
                                                    {instrumentsList
                                                        .filter(item => adminKofferSearch === '' || item.label.toLowerCase().includes(adminKofferSearch.toLowerCase()) || (item.data?.serialNumber || '').toLowerCase().includes(adminKofferSearch.toLowerCase()))
                                                        .map(item => {
                                                            const isLinked = userLinked.includes(item.id);
                                                            return (
                                                                <label key={item.id} className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-colors ${isLinked ? 'bg-emerald-100' : 'hover:bg-gray-100 bg-white'}`}>
                                                                    <input type="checkbox" checked={isLinked} onChange={() => handleAdminToggleInstrument(u.id, item.id, userLinked)} className="h-4 w-4 text-emerald-600 rounded" />
                                                                    <div>
                                                                        <span className="text-sm font-medium">{item.label}</span>
                                                                        <span className="text-xs text-gray-500 ml-2">SN: {item.data?.serialNumber || 'Onbekend'}</span>
                                                                    </div>
                                                                </label>
                                                            );
                                                        })
                                                    }
                                                    {instrumentsList.length === 0 && <p className="text-sm text-gray-400 italic p-2">Geen instrumenten in de database.</p>}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                                {expandedCompanyUserId === u.id && (
                                    <tr className={u.role === 'installer' ? 'bg-emerald-50' : 'bg-blue-50'}>
                                        <td colSpan={7} className={`px-4 py-4 border-b ${u.role === 'installer' ? 'border-emerald-200' : 'border-blue-200'}`}>
                                            {/* Zoekbalk */}
                                            <div className="relative mb-3">
                                              <div className="flex gap-1.5">
                                                <input type="text" placeholder="Zoek bedrijf om velden in te vullen..."
                                                  className="flex-1 border rounded p-1.5 text-xs bg-white"
                                                  value={expandedCompanyUserId === u.id ? placesQuery : ''}
                                                  onChange={e => setPlacesQuery(e.target.value)}
                                                  onKeyDown={e => e.key === 'Enter' && searchPlaces(placesQuery)} />
                                                <button onClick={() => searchPlaces(placesQuery)} disabled={isSearchingPlaces}
                                                  className="px-2 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-50 shrink-0">
                                                  {isSearchingPlaces ? <RefreshCw size={11} className="animate-spin"/> : <Search size={11}/>}
                                                </button>
                                              </div>
                                              {placesResults.length > 0 && expandedCompanyUserId === u.id && (
                                                <div className="absolute z-50 left-0 right-0 top-full mt-0.5 bg-white border rounded shadow-lg max-h-48 overflow-y-auto">
                                                  {placesResults.map((p, i) => {
                                                    const parsed = parsePlaceResult(p);
                                                    return (
                                                      <button key={i} className="w-full text-left px-2 py-1.5 hover:bg-blue-50 text-xs border-b last:border-0"
                                                        onClick={() => { handleBatchUpdateUser(parsed); setPlacesResults([]); setPlacesQuery(''); }}>
                                                        <div className="font-bold text-gray-800">{parsed.name}</div>
                                                        <div className="text-gray-500">{p.formattedAddress}</div>
                                                      </button>
                                                    );
                                                  })}
                                                  <button className="w-full text-center text-xs text-gray-400 py-1 hover:bg-gray-50" onClick={() => setPlacesResults([])}>Sluiten</button>
                                                </div>
                                              )}
                                            </div>
                                            <h3 className={`font-bold text-sm flex items-center gap-2 mb-3 ${u.role === 'installer' ? 'text-emerald-800' : 'text-blue-800'}`}>
                                                <Building size={16}/>
                                                {u.role === 'installer' ? 'Klantbedrijf' : 'Inspectiebedrijf'}: {u.full_name || u.email}
                                            </h3>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                {([
                                                    ['company_name',        'Bedrijfsnaam',  'text'],
                                                    ['company_address',     'Adres',         'text'],
                                                    ['company_postal_code', 'Postcode',      'text'],
                                                    ['company_city',        'Plaats',        'text'],
                                                    ['company_phone',       'Telefoon',      'tel'],
                                                    ['company_email',       'E-mail',        'email'],
                                                ] as [string, string, string][]).map(([field, label, type]) => (
                                                    <div key={field}>
                                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{label}</label>
                                                        <input type={type} className="w-full border rounded p-1.5 text-sm bg-white"
                                                            value={companyEditBuffer[field] ?? ''}
                                                            onChange={e => setCompanyEditBuffer(b => ({ ...b, [field]: e.target.value }))}
                                                            placeholder="—" />
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="flex justify-end mt-3">
                                                <button onClick={() => handleSaveUserCompany(u)}
                                                    className={`px-4 py-1.5 rounded-lg text-xs font-bold text-white ${u.role === 'installer' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                                                    Opslaan
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                                </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        )}
{/* TAB SETTINGS */}
        {activeTab === 'settings' && (
             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">            
                {/* Inspectiebedrijf */}
                 <div className="bg-white rounded-lg shadow p-6 h-fit">
                     <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2"><Building size={20}/> Inspectiebedrijf</h2>
                     <div className="bg-gray-50 p-4 rounded border mb-4 space-y-3">
                         {/* Places zoeking — alleen actief als form bewerkbaar is */}
                         {(editingSettingId === null || editingCategory === 'iv_company') && (
                           <div className="relative">
                             <div className="flex gap-1.5">
                               <input type="text" placeholder="Zoek bedrijf..." className="flex-1 border rounded p-2 text-sm bg-white"
                                 value={placesQuery} onChange={e => setPlacesQuery(e.target.value)}
                                 onKeyDown={e => e.key === 'Enter' && searchPlaces(placesQuery)} />
                               <button onClick={() => searchPlaces(placesQuery)} disabled={isSearchingPlaces}
                                 className="px-3 bg-blue-600 text-white rounded text-sm font-bold hover:bg-blue-700 disabled:opacity-50 shrink-0">
                                 {isSearchingPlaces ? <RefreshCw size={14} className="animate-spin"/> : <Search size={14}/>}
                               </button>
                             </div>
                             {placesResults.length > 0 && (
                               <div className="absolute z-50 left-0 right-0 top-full mt-0.5 bg-white border rounded shadow-lg max-h-56 overflow-y-auto">
                                 {placesResults.map((p, i) => {
                                   const parsed = parsePlaceResult(p);
                                   return (
                                     <button key={i} className="w-full text-left px-3 py-2 hover:bg-blue-50 text-sm border-b last:border-0"
                                       onClick={() => {
                                         setNewCompany({ name: parsed.name, address: parsed.address, postalCode: parsed.postalCode, city: parsed.city, phone: parsed.phone, email: newCompany.email, website: parsed.website });
                                         setPlacesResults([]); setPlacesQuery('');
                                       }}>
                                       <div className="font-bold text-gray-800">{parsed.name}</div>
                                       <div className="text-xs text-gray-500">{p.formattedAddress}</div>
                                     </button>
                                   );
                                 })}
                                 <button className="w-full text-center text-xs text-gray-400 py-1.5 hover:bg-gray-50" onClick={() => setPlacesResults([])}>Sluiten</button>
                               </div>
                             )}
                           </div>
                         )}
                         <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Bedrijfsnaam</label><input className="w-full border rounded p-2 text-sm font-bold" value={newCompany.name} onChange={e => setNewCompany({...newCompany, name: e.target.value})} disabled={editingSettingId !== null && editingCategory !== 'iv_company'} /></div>
                         <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Adres</label><input className="w-full border rounded p-2 text-sm" value={newCompany.address} onChange={e => setNewCompany({...newCompany, address: e.target.value})} disabled={editingSettingId !== null && editingCategory !== 'iv_company'} placeholder="Straat + Nr" /></div>
                         <div className="flex gap-2">
                           <div className="w-1/3"><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Postcode</label><input className="w-full border rounded p-2 text-sm" value={newCompany.postalCode} onChange={e => setNewCompany({...newCompany, postalCode: e.target.value})} disabled={editingSettingId !== null && editingCategory !== 'iv_company'} /></div>
                           <div className="w-2/3">
                             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Plaats</label>
                             <div className="relative">
                               <input className="w-full border rounded p-2 text-sm pr-8" value={newCompany.city} onChange={e => setNewCompany({...newCompany, city: e.target.value})} disabled={editingSettingId !== null && editingCategory !== 'iv_company'} />
                               <button title="Adres aanvullen via postcode (PDOK)" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 disabled:opacity-30"
                                 disabled={editingSettingId !== null && editingCategory !== 'iv_company'}
                                 onClick={async () => {
                                   const result = await lookupAddressBAG(newCompany.postalCode, newCompany.address);
                                   if (result) setNewCompany(c => ({ ...c, city: result.city }));
                                   else alert('Adres niet gevonden. Controleer postcode en huisnummer.');
                                 }}>
                                 <MapPin size={14}/>
                               </button>
                             </div>
                           </div>
                         </div>
                         <div className="flex gap-2"><div className="w-1/2"><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Telefoon</label><input className="w-full border rounded p-2 text-sm" value={newCompany.phone} onChange={e => setNewCompany({...newCompany, phone: e.target.value})} disabled={editingSettingId !== null && editingCategory !== 'iv_company'} /></div><div className="w-1/2"><label className="block text-xs font-bold text-gray-500 uppercase mb-1">E-mail</label><input className="w-full border rounded p-2 text-sm" value={newCompany.email} onChange={e => setNewCompany({...newCompany, email: e.target.value})} disabled={editingSettingId !== null && editingCategory !== 'iv_company'} /></div></div>
                         <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Website</label><input type="url" className="w-full border rounded p-2 text-sm" value={newCompany.website} onChange={e => setNewCompany({...newCompany, website: e.target.value})} disabled={editingSettingId !== null && editingCategory !== 'iv_company'} placeholder="https://" /></div>
                         <div className="flex gap-2 pt-2"><button onClick={handleSaveCompany} disabled={editingSettingId !== null && editingCategory !== 'iv_company'} className={`w-full py-2 rounded font-bold text-sm text-white ${editingSettingId && editingCategory === 'iv_company' ? 'bg-blue-600' : 'bg-emerald-600 disabled:opacity-50'}`}>{editingSettingId && editingCategory === 'iv_company' ? 'Opslaan' : 'Toevoegen'}</button>{editingSettingId && editingCategory === 'iv_company' && <button onClick={cancelEditSettings} className="w-auto px-4 bg-gray-300 rounded font-bold text-xs">X</button>}</div>
                     </div>
                     <ul className="divide-y max-h-[400px] overflow-y-auto">{companiesList.map((item) => (<li key={item.id} className="py-3 flex justify-between items-start text-gray-700"><div><div className="font-bold text-sm">{item.label}</div><div className="text-xs text-gray-500">{item.data?.address ? `${item.data.address}, ` : ''}{item.data?.city}</div></div><div className="flex gap-2"><button onClick={() => startEditCompany(item)} className="text-blue-400 hover:text-blue-600"><Pencil size={16}/></button><button onClick={() => deleteOption(item.id)} className="text-red-400 hover:text-red-600"><Trash2 size={16}/></button></div></li>))}</ul>
                 </div>

                 {/* Instrumenten */}
                 <div className="bg-white rounded-lg shadow p-6 h-fit">
                     <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2"><Wrench size={20}/> Instrumenten</h2>
                     <div className="bg-gray-50 p-4 rounded border mb-4 space-y-3">
                         <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Naam</label><input className="w-full border rounded p-2 text-sm font-bold" value={newInstrument.name} onChange={e => setNewInstrument({...newInstrument, name: e.target.value})} disabled={editingSettingId !== null && editingCategory !== 'instrument'} placeholder="Bijv. Fluke 1664" /></div>
                         <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Serienummer</label><input className="w-full border rounded p-2 text-sm" value={newInstrument.serial} onChange={e => setNewInstrument({...newInstrument, serial: e.target.value})} disabled={editingSettingId !== null && editingCategory !== 'instrument'} /></div>
                         <div>
                             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Kalibratie-/ controledatum</label>
                             <div className="flex gap-1 w-full">
                                 <input 
                                     className="border p-2 rounded text-sm bg-white flex-grow min-w-0" 
                                     type={(newInstrument.calibration === 'Indicatief' || newInstrument.calibration === 'n.v.t.') ? 'text' : 'date'} 
                                     placeholder="Kies datum" 
                                     value={newInstrument.calibration} 
                                     max="2100-12-31"
                                     onChange={e => {
                                         const val = e.target.value;
                                         if (val.length <= 10) setNewInstrument({...newInstrument, calibration: val});
                                     }}
                                     onBlur={(e) => {
                                         if (e.target.value.startsWith('000')) setNewInstrument({...newInstrument, calibration: ''});
                                     }}
                                     disabled={(editingSettingId !== null && editingCategory !== 'instrument') || newInstrument.calibration === 'Indicatief' || newInstrument.calibration === 'n.v.t.'}
                                 />
                                 <select 
                                     className="border p-2 rounded text-sm bg-white cursor-pointer shrink-0" 
                                     onChange={e => {
                                         if (e.target.value === 'date') setNewInstrument({...newInstrument, calibration: ''});
                                         else setNewInstrument({...newInstrument, calibration: e.target.value});
                                     }}
                                     value={(newInstrument.calibration === 'Indicatief' || newInstrument.calibration === 'n.v.t.') ? newInstrument.calibration : 'date'}
                                     disabled={editingSettingId !== null && editingCategory !== 'instrument'}
                                 >
                                     <option value="date">Datum</option>
                                     <option value="Indicatief">Indicatief</option>
                                     <option value="n.v.t.">n.v.t.</option>
                                 </select>
                             </div>
                         </div>
                         <div className="flex gap-2 pt-2"><button onClick={handleSaveInstrument} disabled={editingSettingId !== null && editingCategory !== 'instrument'} className={`flex-1 py-2 rounded font-bold text-sm text-white ${editingSettingId && editingCategory === 'instrument' ? 'bg-blue-600' : 'bg-emerald-600 disabled:opacity-50'}`}>{editingSettingId && editingCategory === 'instrument' ? 'Opslaan' : 'Toevoegen'}</button>{editingSettingId && editingCategory === 'instrument' && <button onClick={cancelEditSettings} className="px-4 bg-gray-300 rounded font-bold text-sm">X</button>}</div>
                     </div>
                     <ul className="divide-y max-h-[600px] overflow-y-auto">
                         {instrumentsList.map((item) => {
                             const status = (!item.data?.calibrationDate || item.data.calibrationDate === 'Indicatief' || item.data.calibrationDate === 'n.v.t.') ? 'ok' : (() => {
                                 const d = new Date(item.data.calibrationDate);
                                 if (isNaN(d.getTime())) return 'unknown';
                                 const diff = Math.ceil((d.getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                                 if (diff < 0) return 'expired';
                                 if (diff <= 30) return 'warning';
                                 return 'ok';
                             })();
                             const isExpanded = expandedInstrumentId === item.id;
                             const owners = users.filter(u => (u.linked_instruments ?? []).includes(item.id));

                             return (
                                 <li key={item.id} className="text-gray-700">
                                     <div className="py-3 flex justify-between items-start">
                                         <div className="flex-1 min-w-0 pr-2">
                                             <div className="font-bold text-sm">{item.label}</div>
                                             <div className="text-xs text-gray-500">
                                                 SN: {item.data?.serialNumber || 'Onbekend'} | Kalibratie: <span className={status === 'expired' ? 'text-red-600 font-bold' : status === 'warning' ? 'text-orange-600 font-bold' : ''}>{item.data?.calibrationDate || 'Onbekend'}</span>
                                             </div>
                                             {owners.length > 0 && (
                                                 <div className="text-xs text-emerald-600 mt-0.5">
                                                     ⭐ {owners.map(u => u.full_name || u.email).join(', ')}
                                                 </div>
                                             )}
                                         </div>
                                         <div className="flex gap-2 shrink-0">
                                             <button onClick={() => { setExpandedInstrumentId(isExpanded ? null : item.id); setInstrumentOwnerSearch(''); }} className={`p-1.5 rounded transition-colors ${isExpanded ? 'text-emerald-700 bg-emerald-100' : 'text-emerald-400 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100'}`} title="Eigenaren beheren"><Users size={15}/></button>
                                             <button onClick={() => startEditInstrument(item)} className="text-blue-400 hover:text-blue-600 p-1.5"><Pencil size={15}/></button>
                                             <button onClick={() => deleteOption(item.id)} className="text-red-400 hover:text-red-600 p-1.5"><Trash2 size={15}/></button>
                                         </div>
                                     </div>
                                     {isExpanded && (
                                         <div className="mb-3 p-3 bg-emerald-50 rounded border border-emerald-200 animate-fadeIn">
                                             <p className="text-xs font-bold text-emerald-800 uppercase mb-2">Eigenaren — wie heeft dit instrument in de koffer?</p>
                                             <input type="text" placeholder="Zoek gebruiker..." className="w-full border rounded p-1.5 text-xs mb-2" value={instrumentOwnerSearch} onChange={e => setInstrumentOwnerSearch(e.target.value)} />
                                             <div className="space-y-1 max-h-40 overflow-y-auto">
                                                 {users
                                                     .filter(u => instrumentOwnerSearch === '' || (u.full_name || u.email || '').toLowerCase().includes(instrumentOwnerSearch.toLowerCase()))
                                                     .map(u => {
                                                         const isOwner = (u.linked_instruments ?? []).includes(item.id);
                                                         return (
                                                             <label key={u.id} className={`flex items-center gap-2 p-1.5 rounded cursor-pointer transition-colors ${isOwner ? 'bg-emerald-100' : 'hover:bg-gray-100 bg-white'}`}>
                                                                 <input type="checkbox" checked={isOwner} onChange={() => handleAdminToggleInstrument(u.id, item.id, u.linked_instruments ?? [])} className="h-4 w-4 text-emerald-600 rounded" />
                                                                 <span className="text-sm font-medium">{u.full_name || u.email}</span>
                                                                 {u.full_name && <span className="text-xs text-gray-400">{u.email}</span>}
                                                             </label>
                                                         );
                                                     })
                                                 }
                                                 {users.length === 0 && <p className="text-xs text-gray-400 italic">Geen gebruikers geladen.</p>}
                                             </div>
                                         </div>
                                     )}
                                 </li>
                             );
                         })}
                     </ul>
                 </div>
             </div>
        )}

        {/* MODAL: NIEUWE OPDRACHT / BEWERKEN */}
        {/* TAB BIBLIOTHEEK */}
        {activeTab === 'library' && (
             <div className="bg-white rounded-lg shadow overflow-hidden">
                 <div className="p-4 bg-blue-50 border-b border-blue-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 flex-wrap">
                     <div className="flex items-center gap-2 text-sm text-blue-800 font-bold"><BookOpen size={18}/><span>Centrale Gebreken Bibliotheek ({libraryItems.length})</span></div>
                     <div className="flex flex-wrap gap-2">
                         <button onClick={handleLoadDefaultLibrary} className="flex items-center gap-2 bg-emerald-100 text-emerald-800 px-3 py-2.5 rounded-lg shadow-sm text-sm font-bold hover:bg-emerald-200 border border-emerald-300"><Database size={16} /> <span className="hidden sm:inline">Laad Standaard</span> NTA8220</button>
                         <button onClick={() => libraryCsvInputRef.current?.click()} className="flex items-center gap-2 bg-white text-blue-700 px-3 py-2.5 rounded-lg shadow-sm text-sm font-bold hover:bg-blue-50 border border-blue-200"><UploadCloud size={16} /> CSV</button>
                         <input type="file" ref={libraryCsvInputRef} onChange={handleLibraryCsvImport} accept=".csv" className="hidden" />
                         <button onClick={() => { setNewLibraryItem({ category: '', subcategory: '', shortName: '', description: '', classification: 'Yellow' }); setEditingLibraryId(null); setShowLibraryModal(true); }} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg shadow text-sm font-bold hover:bg-blue-700"><Plus size={16} /> Nieuw Gebrek</button>
                     </div>
                 </div>
                 <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
                     <table className="min-w-full relative">
                         <thead className="bg-gray-50 sticky top-0 border-b shadow-sm z-10">
                             <tr>
                                 <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Categorie</th>
                                 <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Subcategorie</th>
                                 <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Korte Naam</th>
                                 <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Classificatie</th>
                                 <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Acties</th>
                             </tr>
                         </thead>
                         <tbody className="divide-y divide-gray-200">
                             {libraryItems.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-gray-500 italic">Geen gebreken gevonden in de database. Upload een CSV of voeg ze handmatig toe.</td></tr>}
                             {libraryItems.map(item => (
                                 <tr key={item.id} className="hover:bg-gray-50">
                                     <td className="px-4 py-3 text-sm font-bold text-gray-700">{item.category}</td>
                                     <td className="px-4 py-3 text-sm text-gray-600">{item.subcategory}</td>
                                     <td className="px-4 py-3 text-sm text-gray-800">{item.shortName || item["shortName"]}</td>
                                     <td className="px-4 py-3 text-sm">
                                         <span className={`px-2 py-1 rounded text-xs font-bold ${item.classification === 'Red' ? 'bg-red-100 text-red-800' : item.classification === 'Orange' ? 'bg-orange-100 text-orange-800' : item.classification === 'Yellow' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>{item.classification}</span>
                                     </td>
                                     <td className="px-4 py-3 text-right">
                                         <div className="flex justify-end gap-2">
                                             <button onClick={() => handleEditLibraryItem(item)} className="text-blue-500 hover:text-blue-700 p-1"><Pencil size={16}/></button>
                                             <button onClick={() => handleDeleteLibraryItem(item.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={16}/></button>
                                         </div>
                                     </td>
                                 </tr>
                             ))}
                         </tbody>
                     </table>
                 </div>
             </div>
        )}

        {/* MODAL: BIBLIOTHEEK ITEM BEWERKEN/TOEVOEGEN */}
        {showLibraryModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-0 overflow-hidden flex flex-col">
                    <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                        <h2 className="text-lg font-bold text-gray-800">{editingLibraryId ? 'Gebrek Bewerken' : 'Nieuw Gebrek'}</h2>
                        <button onClick={() => setShowLibraryModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
                    </div>
                    <div className="p-4 md:p-6 overflow-y-auto max-h-[70vh] space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Hoofdcategorie</label><input className="w-full border rounded p-2.5" value={newLibraryItem.category} onChange={e => setNewLibraryItem({...newLibraryItem, category: e.target.value})} placeholder="Bijv. Verdeelinrichting" /></div>
                            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Subcategorie</label><input className="w-full border rounded p-2.5" value={newLibraryItem.subcategory} onChange={e => setNewLibraryItem({...newLibraryItem, subcategory: e.target.value})} placeholder="Bijv. Algemeen" /></div>
                        </div>
                        <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Korte Naam (Dropdown tekst)</label><input className="w-full border rounded p-2.5 font-bold text-emerald-700" value={newLibraryItem.shortName} onChange={e => setNewLibraryItem({...newLibraryItem, shortName: e.target.value})} placeholder="Bijv. Aanrakingsgevaar" /></div>
                        <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Omschrijving Rapport</label><textarea className="w-full border rounded p-2.5 h-24" value={newLibraryItem.description} onChange={e => setNewLibraryItem({...newLibraryItem, description: e.target.value})} placeholder="Volledige normatieve omschrijving..." /></div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Classificatie</label>
                                <select className="w-full border rounded p-2.5" value={newLibraryItem.classification} onChange={e => setNewLibraryItem({...newLibraryItem, classification: e.target.value})}>
                                    <option value="Red">Red (Ernstig / Direct)</option>
                                    <option value="Orange">Orange</option>
                                    <option value="Yellow">Yellow (Aandacht)</option>
                                    <option value="Blue">Blue (Herstel)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 border-t bg-gray-50 flex gap-2">
                        <button onClick={() => setShowLibraryModal(false)} className="flex-1 bg-gray-200 py-3 rounded-lg font-bold text-gray-700 hover:bg-gray-300">Annuleren</button>
                        <button onClick={handleSaveLibraryItem} className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 shadow">{editingLibraryId ? 'Opslaan' : 'Toevoegen'}</button>
                    </div>
                </div>
            </div>
        )}

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
                                            <input list="inspectors-list-modal" className="w-full border rounded p-2" value={newOrder.inspectorName} onChange={e => { const val = e.target.value; const match = users.find(u => u.full_name === val); setNewOrder({ ...newOrder, inspectorName: val, sciosRegistrationNumber: match ? (match.scios_nr || '') : newOrder.sciosRegistrationNumber }); }} placeholder="Selecteer inspecteur uit cloud" />
                                            <datalist id="inspectors-list-modal">{users.filter(u => u.full_name).map(u => <option key={u.id} value={u.full_name}/>)}</datalist>
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
        
        {/* TAB KLANTEN / CRM */}
        {activeTab === 'clients' && (
          <div className="flex gap-0 h-[calc(100vh-220px)] min-h-[500px]">

            {/* LEFT: client list */}
            <div className="w-72 shrink-0 flex flex-col border-r border-gray-200 bg-white rounded-l-lg shadow overflow-hidden">
              {/* toolbar */}
              <div className="p-3 border-b border-gray-100 space-y-2">
                <div className="relative">
                  <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"/>
                  <input type="text" placeholder="Zoek naam, plaats, contactpersoon..." className="w-full pl-8 pr-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-400" value={clientSearch} onChange={e => setClientSearch(e.target.value)} />
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => setShowNewClientForm(v => !v)} className="flex-1 flex items-center justify-center gap-1 bg-emerald-600 text-white text-xs font-bold py-1.5 rounded-lg hover:bg-emerald-700"><Plus size={13}/> Nieuw</button>
                </div>
                {showNewClientForm && (
                  <div className="space-y-1.5 pt-1 border-t border-gray-100">
                    {/* Places zoekbalk */}
                    <div className="relative">
                      <div className="flex gap-1">
                        <input
                          type="text" placeholder="Zoek bedrijf..." className="flex-1 border rounded p-1.5 text-sm"
                          value={placesQuery} onChange={e => setPlacesQuery(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && searchPlaces(placesQuery)} />
                        <button onClick={() => searchPlaces(placesQuery)} disabled={isSearchingPlaces}
                          className="px-2 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-700 disabled:opacity-50 shrink-0">
                          {isSearchingPlaces ? <RefreshCw size={12} className="animate-spin"/> : <Search size={12}/>}
                        </button>
                      </div>
                      {placesResults.length > 0 && (
                        <div className="absolute z-50 left-0 right-0 top-full mt-0.5 bg-white border rounded shadow-lg max-h-48 overflow-y-auto">
                          {placesResults.map((p, i) => {
                            const parsed = parsePlaceResult(p);
                            return (
                              <button key={i} className="w-full text-left px-2 py-1.5 hover:bg-blue-50 text-xs border-b last:border-0"
                                onClick={() => {
                                  setNewClientForm(f => ({ ...f, name: parsed.name, address: parsed.address, postal_code: parsed.postalCode, city: parsed.city, phone: parsed.phone, website: parsed.website }));
                                  setPlacesResults([]); setPlacesQuery('');
                                }}>
                                <div className="font-bold text-gray-800">{parsed.name}</div>
                                <div className="text-gray-500">{p.formattedAddress}</div>
                              </button>
                            );
                          })}
                          <button className="w-full text-center text-xs text-gray-400 py-1 hover:bg-gray-50" onClick={() => setPlacesResults([])}>Sluiten</button>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 text-center">— of vul handmatig in —</p>
                    <input type="text" placeholder="Naam *" className="w-full border rounded p-1.5 text-sm" value={newClientForm.name || ''} onChange={e => setNewClientForm(f => ({ ...f, name: e.target.value }))} />
                    <input type="text" placeholder="Adres (straat + nr)" className="w-full border rounded p-1.5 text-sm" value={newClientForm.address || ''} onChange={e => setNewClientForm(f => ({ ...f, address: e.target.value }))} />
                    <div className="flex gap-1">
                      <input type="text" placeholder="Postcode" className="w-1/3 border rounded p-1.5 text-sm" value={newClientForm.postal_code || ''} onChange={e => setNewClientForm(f => ({ ...f, postal_code: e.target.value }))} />
                      <div className="flex-1 relative">
                        <input type="text" placeholder="Plaats" className="w-full border rounded p-1.5 text-sm pr-7" value={newClientForm.city || ''} onChange={e => setNewClientForm(f => ({ ...f, city: e.target.value }))} />
                        <button title="Adres opzoeken via postcode (PDOK)" className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600"
                          onClick={async () => {
                            const result = await lookupAddressBAG(newClientForm.postal_code || '', newClientForm.address || '');
                            if (result) setNewClientForm(f => ({ ...f, city: result.city }));
                            else alert('Adres niet gevonden. Controleer postcode en huisnummer.');
                          }}>
                          <MapPin size={13}/>
                        </button>
                      </div>
                    </div>
                    <input type="tel" placeholder="Telefoon" className="w-full border rounded p-1.5 text-sm" value={newClientForm.phone || ''} onChange={e => setNewClientForm(f => ({ ...f, phone: e.target.value }))} />
                    <input type="email" placeholder="E-mail" className="w-full border rounded p-1.5 text-sm" value={newClientForm.email || ''} onChange={e => setNewClientForm(f => ({ ...f, email: e.target.value }))} />
                    <input type="url" placeholder="Website" className="w-full border rounded p-1.5 text-sm" value={newClientForm.website || ''} onChange={e => setNewClientForm(f => ({ ...f, website: e.target.value }))} />
                    <div className="flex gap-1 pt-1">
                      <button onClick={handleCreateClient} className="flex-1 bg-emerald-600 text-white text-xs py-1.5 rounded font-bold hover:bg-emerald-700">Aanmaken</button>
                      <button onClick={() => { setShowNewClientForm(false); setNewClientForm({ name: '', contacts: [] }); setPlacesQuery(''); setPlacesResults([]); }} className="flex-1 bg-gray-100 text-gray-600 text-xs py-1.5 rounded hover:bg-gray-200">Annuleren</button>
                    </div>
                  </div>
                )}
              </div>

              {/* client list */}
              <div className="flex-1 overflow-y-auto">
                {clients.filter(c => {
                  if (!clientSearch) return true;
                  const q = clientSearch.toLowerCase();
                  return (
                    c.name.toLowerCase().includes(q) ||
                    (c.city || '').toLowerCase().includes(q) ||
                    (c.address || '').toLowerCase().includes(q) ||
                    (c.postal_code || '').toLowerCase().includes(q) ||
                    (c.email || '').toLowerCase().includes(q) ||
                    (c.phone || '').toLowerCase().includes(q) ||
                    c.contacts.some(ct => ct.name.toLowerCase().includes(q) || (ct.role || '').toLowerCase().includes(q) || (ct.email || '').toLowerCase().includes(q))
                  );
                }).map(client => (
                  <button key={client.id} onClick={() => handleSelectClient(client)}
                    className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${selectedClient?.id === client.id ? 'bg-emerald-50 border-l-4 border-l-emerald-500' : ''}`}>
                    <div className="font-semibold text-sm text-gray-900 truncate">{client.name}</div>
                    {client.city && <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><MapPin size={10}/>{client.city}</div>}
                  </button>
                ))}
                {clients.length === 0 && (
                  <div className="p-6 text-center text-gray-400 text-sm">
                    <Building size={32} className="mx-auto mb-2 text-gray-300"/>
                    Nog geen klanten. Klik "Nieuw" om er een toe te voegen.
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: client detail */}
            <div className="flex-1 bg-white rounded-r-lg shadow overflow-hidden flex flex-col">
              {!selectedClient ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                  <Building size={48} className="mb-3 text-gray-200"/>
                  <p className="text-sm">Selecteer een klant uit de lijst</p>
                </div>
              ) : (
                <>
                  {/* header */}
                  <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{selectedClient.name}</h2>
                      {(selectedClient.city || selectedClient.address) && (
                        <p className="text-sm text-gray-400 flex items-center gap-1 mt-0.5">
                          <MapPin size={12}/>{[selectedClient.address, selectedClient.postal_code, selectedClient.city].filter(Boolean).join(' ')}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => { setIsEditingClient(true); setEditClientForm({ ...selectedClient }); setClientTab('gegevens'); }} className="flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-200 font-medium"><Pencil size={13}/> Bewerken</button>
                      <button onClick={handleDeleteClient} className="flex items-center gap-1 text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100 font-medium"><Trash2 size={13}/> Verwijderen</button>
                    </div>
                  </div>

                  {/* sub-tabs */}
                  <div className="flex border-b border-gray-100 px-4">
                    {([['gegevens', <Building size={14}/>, 'Gegevens'], ['contacten', <UserCircle2 size={14}/>, 'Contacten'], ['projecten', <FolderOpen size={14}/>, 'Projecten'], ['notities', <StickyNote size={14}/>, 'Notities']] as const).map(([key, icon, label]) => (
                      <button key={key} onClick={() => setClientTab(key)}
                        className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${clientTab === key ? 'text-emerald-600 border-emerald-600' : 'text-gray-500 border-transparent hover:text-gray-700'}`}>
                        {icon}{label}
                      </button>
                    ))}
                  </div>

                  {/* tab content */}
                  <div className="flex-1 overflow-y-auto p-6">

                    {/* GEGEVENS TAB */}
                    {clientTab === 'gegevens' && (
                      isEditingClient ? (
                        <div className="max-w-lg space-y-3">
                          <h3 className="font-bold text-gray-700 mb-3">Gegevens bewerken</h3>
                          {([['name','Naam *','text'],['address','Adres','text'],['postal_code','Postcode','text'],['city','Stad','text'],['phone','Telefoon','tel'],['email','E-mail','email'],['website','Website','url']] as [keyof Client, string, string][]).map(([field, label, type]) => (
                            <div key={field}>
                              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{label}</label>
                              <input type={type} className="w-full border rounded p-2 text-sm" value={(editClientForm[field] as string) || ''} onChange={e => setEditClientForm(f => ({ ...f, [field]: e.target.value }))} />
                            </div>
                          ))}
                          <div className="flex gap-2 pt-2">
                            <button onClick={() => handleUpdateClient(editClientForm)} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-700">Opslaan</button>
                            <button onClick={() => setIsEditingClient(false)} className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-200">Annuleren</button>
                          </div>
                        </div>
                      ) : (
                        <div className="max-w-lg grid grid-cols-2 gap-x-8 gap-y-4">
                          {([['Naam', selectedClient.name],['Adres', selectedClient.address],['Postcode', selectedClient.postal_code],['Stad', selectedClient.city],['Telefoon', selectedClient.phone],['E-mail', selectedClient.email],['Website', selectedClient.website]] as [string, string | undefined][]).map(([label, val]) => (
                            <div key={label}>
                              <div className="text-xs font-bold text-gray-400 uppercase mb-0.5">{label}</div>
                              <div className="text-sm text-gray-800">
                                {val ? (label === 'Website' ? <a href={val} target="_blank" rel="noreferrer" className="text-emerald-600 hover:underline flex items-center gap-1"><Globe size={12}/>{val}</a> : label === 'E-mail' ? <a href={`mailto:${val}`} className="text-emerald-600 hover:underline">{val}</a> : val) : <span className="text-gray-300 italic">—</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    )}

                    {/* CONTACTEN TAB */}
                    {clientTab === 'contacten' && (
                      <div className="max-w-2xl">
                        {selectedClient.contacts.length > 0 && (
                          <table className="w-full text-sm mb-4">
                            <thead><tr className="text-xs font-bold text-gray-400 uppercase border-b"><th className="py-2 pr-3 text-left">Naam</th><th className="py-2 pr-3 text-left">Rol</th><th className="py-2 pr-3 text-left">Telefoon</th><th className="py-2 pr-3 text-left">E-mail</th><th className="py-2 w-8"></th></tr></thead>
                            <tbody>
                              {selectedClient.contacts.map((contact, idx) => (
                                <tr key={contact.id} className="border-b border-gray-50 hover:bg-gray-50">
                                  <td className="py-1.5 pr-2"><input className="border rounded px-2 py-1 text-sm w-full" value={contact.name} onChange={e => { const c = [...selectedClient.contacts]; c[idx] = { ...c[idx], name: e.target.value }; setSelectedClient({ ...selectedClient, contacts: c }); }} onBlur={() => handleSaveContacts(selectedClient.contacts)} /></td>
                                  <td className="py-1.5 pr-2"><input className="border rounded px-2 py-1 text-sm w-full" value={contact.role} placeholder="Bijv. Directeur" onChange={e => { const c = [...selectedClient.contacts]; c[idx] = { ...c[idx], role: e.target.value }; setSelectedClient({ ...selectedClient, contacts: c }); }} onBlur={() => handleSaveContacts(selectedClient.contacts)} /></td>
                                  <td className="py-1.5 pr-2"><input className="border rounded px-2 py-1 text-sm w-full" value={contact.phone || ''} onChange={e => { const c = [...selectedClient.contacts]; c[idx] = { ...c[idx], phone: e.target.value }; setSelectedClient({ ...selectedClient, contacts: c }); }} onBlur={() => handleSaveContacts(selectedClient.contacts)} /></td>
                                  <td className="py-1.5 pr-2"><input className="border rounded px-2 py-1 text-sm w-full" value={contact.email || ''} onChange={e => { const c = [...selectedClient.contacts]; c[idx] = { ...c[idx], email: e.target.value }; setSelectedClient({ ...selectedClient, contacts: c }); }} onBlur={() => handleSaveContacts(selectedClient.contacts)} /></td>
                                  <td className="py-1.5"><button onClick={() => handleSaveContacts(selectedClient.contacts.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-600"><X size={15}/></button></td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                        {selectedClient.contacts.length === 0 && <p className="text-gray-400 text-sm mb-4 italic">Nog geen contactpersonen.</p>}
                        <button onClick={() => { const newC: ClientContact = { id: crypto.randomUUID(), name: '', role: '', phone: '', email: '' }; handleSaveContacts([...selectedClient.contacts, newC]); }}
                          className="flex items-center gap-1.5 text-sm text-emerald-600 hover:text-emerald-700 font-medium border border-emerald-200 rounded-lg px-3 py-2 hover:bg-emerald-50"><Plus size={14}/> Contactpersoon toevoegen</button>
                      </div>
                    )}

                    {/* PROJECTEN TAB */}
                    {clientTab === 'projecten' && (
                      <div className="space-y-3">
                        {clientInspections.length === 0 ? (
                          <p className="text-gray-400 text-sm italic">Geen inspecties gevonden voor deze klant.</p>
                        ) : clientInspections.map(insp => {
                          const meta = insp.report_data?.meta || {};
                          const defects: any[] = insp.report_data?.defects || [];
                          const hasHerstelPdf = insp.status === 'ter_controle' || insp.status === 'herstel_afgerond';
                          const projectAddr = [meta.projectAddress, meta.projectPostalCode, meta.projectCity].filter(Boolean).join(' ');
                          const isExpanded = expandedProjectIds.has(insp.id);
                          const toggleExpand = () => setExpandedProjectIds(prev => {
                            const next = new Set(prev);
                            next.has(insp.id) ? next.delete(insp.id) : next.add(insp.id);
                            return next;
                          });
                          return (
                            <div key={insp.id} className="border border-gray-200 rounded-lg overflow-hidden">
                              {/* card header */}
                              <div className="flex items-center justify-between gap-3 px-4 py-3 bg-gray-50 border-b border-gray-100 cursor-pointer select-none" onClick={toggleExpand}>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-mono text-xs bg-white text-gray-700 px-2 py-0.5 rounded border border-gray-200 font-bold flex items-center gap-0.5"><Hash size={10}/>{insp.inspection_number || 'CONCEPT'}</span>
                                  {(!insp.status || insp.status === 'new') && <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded font-bold">Nieuw</span>}
                                  {insp.status === 'in_progress' && <span className="bg-orange-100 text-orange-800 text-xs px-2 py-0.5 rounded font-bold">Bezig</span>}
                                  {insp.status === 'review_ready' && <span className="bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded font-bold">Review</span>}
                                  {insp.status === 'completed' && <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded font-bold">Klaar</span>}
                                  {insp.status === 'herstel_wacht' && <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded font-bold">Wacht op Herstel</span>}
                                  {insp.status === 'ter_controle' && <span className="bg-violet-100 text-violet-800 text-xs px-2 py-0.5 rounded font-bold">Ter Controle</span>}
                                  {insp.status === 'herstel_afgerond' && <span className="bg-teal-100 text-teal-800 text-xs px-2 py-0.5 rounded font-bold">Herstel Afgerond</span>}
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
                                  <button
                                    onClick={() => { if (!inspections.find(i => i.id === insp.id)) setInspections(prev => [...prev, insp]); handleEdit(insp); }}
                                    className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg hover:bg-blue-100 font-medium border border-blue-200"
                                    title="Inspectie openen en bewerken"
                                  ><Pencil size={12}/> Openen</button>
                                  <button onClick={() => handleDownloadPDF(insp)} disabled={isGeneratingPdf} className="flex items-center gap-1 text-xs bg-red-50 text-red-700 px-2.5 py-1 rounded-lg hover:bg-red-100 font-medium border border-red-200 disabled:opacity-50" title="PDF Origineel"><FileText size={12}/> PDF</button>
                                  {hasHerstelPdf && (
                                    <button onClick={() => handleDownloadHerstelPDF(insp)} disabled={isGeneratingPdf} className="flex items-center gap-1 text-xs bg-violet-50 text-violet-700 px-2.5 py-1 rounded-lg hover:bg-violet-100 font-medium border border-violet-200 disabled:opacity-50" title="PDF Herstelrapport"><FileText size={12}/> PDF Herstel</button>
                                  )}
                                  {isExpanded ? <ChevronUp size={16} className="text-gray-400 ml-1"/> : <ChevronDown size={16} className="text-gray-400 ml-1"/>}
                                </div>
                              </div>
                              {/* card details */}
                              {isExpanded && <div className="px-4 py-3 grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3 text-sm">
                                {meta.projectLocation && (
                                  <div><div className="text-xs font-bold text-gray-400 uppercase mb-0.5">Projectlocatie</div><div className="text-gray-800">{meta.projectLocation}</div></div>
                                )}
                                {projectAddr && (
                                  <div><div className="text-xs font-bold text-gray-400 uppercase mb-0.5">Adres project</div><div className="text-gray-800">{projectAddr}</div></div>
                                )}
                                <div><div className="text-xs font-bold text-gray-400 uppercase mb-0.5">Startdatum</div><div className="text-gray-800">{normalizeDate(meta.date) || '—'}</div></div>
                                <div><div className="text-xs font-bold text-gray-400 uppercase mb-0.5">Afgerond</div><div className="text-gray-800">{meta.finalizedDate ? normalizeDate(meta.finalizedDate) : <span className="text-gray-300 italic">—</span>}</div></div>
                                <div><div className="text-xs font-bold text-gray-400 uppercase mb-0.5">Inspecteur</div><div className="text-gray-800 flex items-center gap-1"><User size={12} className="text-gray-400"/>{meta.inspectorName || '—'}</div></div>
                                <div><div className="text-xs font-bold text-gray-400 uppercase mb-0.5">Gebreken</div><div className="text-gray-800">{defects.length > 0 ? `${defects.length} gebrek${defects.length !== 1 ? 'en' : ''}` : <span className="text-gray-300 italic">Geen</span>}</div></div>
                                {meta.projectContactPerson && (
                                  <div><div className="text-xs font-bold text-gray-400 uppercase mb-0.5">Contactpersoon project</div><div className="text-gray-800">{meta.projectContactPerson}{meta.projectPhone ? <span className="text-gray-400 ml-1">· {meta.projectPhone}</span> : ''}</div></div>
                                )}
                                {meta.installationResponsible && (
                                  <div><div className="text-xs font-bold text-gray-400 uppercase mb-0.5">Installatieverantwoordelijke</div><div className="text-gray-800">{meta.installationResponsible}</div></div>
                                )}
                                {meta.scopeType && (
                                  <div><div className="text-xs font-bold text-gray-400 uppercase mb-0.5">Scope</div><div className="text-gray-800">NEN 3140 art. {meta.scopeType}</div></div>
                                )}
                              </div>}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* NOTITIES TAB */}
                    {clientTab === 'notities' && (
                      <div className="max-w-2xl">
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Aantekeningen</label>
                        <textarea
                          className="w-full border rounded-lg p-3 text-sm min-h-48 focus:outline-none focus:ring-1 focus:ring-emerald-400 resize-y"
                          placeholder="Voeg aantekeningen, afspraken of bijzonderheden toe..."
                          defaultValue={selectedClient.notes || ''}
                          key={selectedClient.id}
                          onBlur={e => { if (e.target.value !== (selectedClient.notes || '')) handleUpdateClient({ notes: e.target.value }); }}
                        />
                      </div>
                    )}

                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* TAB PROJECTEN */}
        {activeTab === 'projecten' && (
          <>
            <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="relative w-full md:w-1/2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                <input type="text" placeholder="Zoek op klant, locatie, plaats, inspecteur..." className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" value={projSearch} onChange={e => { setProjSearch(e.target.value); setProjPage(1); }}/>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>Pagina {projPage} van {Math.ceil(projTotalCount / ITEMS_PER_PAGE) || 1} ({projTotalCount} projecten)</span>
                <div className="flex gap-1">
                  <button onClick={() => setProjPage(p => Math.max(1, p - 1))} disabled={projPage === 1} className="p-2 border rounded hover:bg-gray-100 disabled:opacity-50"><ChevronLeft size={20}/></button>
                  <button onClick={() => setProjPage(p => Math.min(Math.ceil(projTotalCount / ITEMS_PER_PAGE), p + 1))} disabled={projPage >= Math.ceil(projTotalCount / ITEMS_PER_PAGE)} className="p-2 border rounded hover:bg-gray-100 disabled:opacity-50"><ChevronRight size={20}/></button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <ProjSortableHeader label="Inspectie ID" sortKey="proj_number" width="w-32"/>
                    <ProjSortableHeader label="Klant" sortKey="client_name"/>
                    <ProjSortableHeader label="Projectlocatie" sortKey="proj_location"/>
                    <ProjSortableHeader label="Plaats" sortKey="proj_city"/>
                    <ProjSortableHeader label="Status" sortKey="status" width="w-36"/>
                    <ProjSortableHeader label="Start" sortKey="proj_date_start" width="w-28"/>
                    <ProjSortableHeader label="Afgerond" sortKey="proj_date_finalized" width="w-28"/>
                    <ProjSortableHeader label="Herinspectie" sortKey="next_inspection_date" width="w-32"/>
                    <ProjSortableHeader label="Inspecteur" sortKey="proj_inspector" width="w-36"/>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase w-28">Acties</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {projects.length === 0 ? (
                    <tr><td colSpan={10} className="text-center py-12 text-gray-400">Geen projecten gevonden</td></tr>
                  ) : projects.map(proj => {
                    const meta = proj.report_data?.meta || {};
                    const hasHerstelPdf = proj.status === 'ter_controle' || proj.status === 'herstel_afgerond';
                    return (
                      <tr key={proj.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded border">{proj.inspection_number || '—'}</span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-800 text-sm">{proj.client_name || '—'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{meta.projectLocation || '—'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          <div className="flex items-center gap-1"><MapPin size={12} className="text-gray-400"/>{meta.projectCity || '—'}</div>
                        </td>
                        <td className="px-4 py-3">
                          {(!proj.status || proj.status === 'new') && <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded font-bold">Nieuw</span>}
                          {proj.status === 'in_progress' && <span className="bg-orange-100 text-orange-800 text-xs px-2 py-0.5 rounded font-bold">Bezig</span>}
                          {proj.status === 'review_ready' && <span className="bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded font-bold">Review</span>}
                          {proj.status === 'completed' && <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded font-bold">Klaar</span>}
                          {proj.status === 'herstel_wacht' && <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded font-bold">Wacht op Herstel</span>}
                          {proj.status === 'ter_controle' && <span className="bg-violet-100 text-violet-800 text-xs px-2 py-0.5 rounded font-bold">Ter Controle</span>}
                          {proj.status === 'herstel_afgerond' && <span className="bg-teal-100 text-teal-800 text-xs px-2 py-0.5 rounded font-bold">Herstel Afgerond</span>}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{normalizeDate(meta.date) || '—'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{normalizeDate(meta.finalizedDate) || '—'}</td>
                        <td className="px-4 py-3 text-sm">
                          {meta.nextInspectionDate
                            ? <span className={getNextInspStyle(meta.nextInspectionDate)}>{normalizeDate(meta.nextInspectionDate)}</span>
                            : <span className="text-gray-400">—</span>}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          <div className="flex items-center gap-1"><User size={12} className="text-gray-400"/>{meta.inspectorName || '—'}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleDownloadPDF(proj)} disabled={isGeneratingPdf} className="flex items-center gap-1 text-xs bg-red-50 text-red-700 px-2 py-1 rounded hover:bg-red-100 font-medium border border-red-200 disabled:opacity-50" title="PDF Origineel"><FileText size={12}/> PDF</button>
                            {hasHerstelPdf && <button onClick={() => handleDownloadHerstelPDF(proj)} disabled={isGeneratingPdf} className="flex items-center gap-1 text-xs bg-violet-50 text-violet-700 px-2 py-1 rounded hover:bg-violet-100 font-medium border border-violet-200 disabled:opacity-50" title="PDF Herstel"><FileText size={12}/> Herstel</button>}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {showUserModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6">
                            <h2 className="text-lg font-bold mb-4">Nieuwe Gebruiker</h2>
                            <div className="space-y-2 mb-4 max-h-[60vh] overflow-y-auto pr-1">
                                <input className="w-full border rounded p-2" type="text" placeholder="Volledige Naam" value={newUser.full_name} onChange={e => setNewUser({...newUser, full_name: e.target.value})} />
                                <input className="w-full border rounded p-2" type="text" placeholder="Telefoonnummer" value={newUser.phone} onChange={e => setNewUser({...newUser, phone: e.target.value})} />
                                <input className="w-full border rounded p-2" type="email" placeholder="Contact Email (optioneel)" value={newUser.contact_email} onChange={e => setNewUser({...newUser, contact_email: e.target.value})} />
                                <input className="w-full border rounded p-2" type="text" placeholder="SCIOS Nummer (optioneel)" value={newUser.scios_nr} onChange={e => setNewUser({...newUser, scios_nr: e.target.value})} />
                                <select className="w-full border rounded p-2 bg-white" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                                    <option value="inspector">Inspecteur</option>
                                    <option value="admin">Beheerder (Admin)</option>
                                    <option value="installer">Installateur</option>
                                </select>
                                <hr className="my-2 border-gray-200" />
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Bedrijfsgegevens (optioneel)</p>
                                <div className="relative">
                                  <div className="flex gap-1.5">
                                    <input type="text" placeholder="Zoek bedrijf..." className="flex-1 border rounded p-2 text-sm bg-white"
                                      value={placesQuery} onChange={e => setPlacesQuery(e.target.value)}
                                      onKeyDown={e => e.key === 'Enter' && searchPlaces(placesQuery)} />
                                    <button onClick={() => searchPlaces(placesQuery)} disabled={isSearchingPlaces}
                                      className="px-3 bg-blue-600 text-white rounded text-sm font-bold hover:bg-blue-700 disabled:opacity-50 shrink-0">
                                      {isSearchingPlaces ? <RefreshCw size={14} className="animate-spin"/> : <Search size={14}/>}
                                    </button>
                                  </div>
                                  {placesResults.length > 0 && (
                                    <div className="absolute z-50 left-0 right-0 top-full mt-0.5 bg-white border rounded shadow-lg max-h-48 overflow-y-auto">
                                      {placesResults.map((p, i) => {
                                        const parsed = parsePlaceResult(p);
                                        return (
                                          <button key={i} className="w-full text-left px-2 py-1.5 hover:bg-blue-50 text-sm border-b last:border-0"
                                            onClick={() => {
                                              setNewUser(u => ({ ...u, company_name: parsed.name, company_address: parsed.address, company_postal_code: parsed.postalCode, company_city: parsed.city, company_phone: parsed.phone, company_email: u.company_email }));
                                              setPlacesResults([]); setPlacesQuery('');
                                            }}>
                                            <div className="font-bold text-gray-800">{parsed.name}</div>
                                            <div className="text-xs text-gray-500">{p.formattedAddress}</div>
                                          </button>
                                        );
                                      })}
                                      <button className="w-full text-center text-xs text-gray-400 py-1 hover:bg-gray-50" onClick={() => setPlacesResults([])}>Sluiten</button>
                                    </div>
                                  )}
                                </div>
                                <input className="w-full border rounded p-2" type="text" placeholder="Bedrijfsnaam" value={newUser.company_name} onChange={e => setNewUser({...newUser, company_name: e.target.value})} />
                                <input className="w-full border rounded p-2" type="text" placeholder="Adres" value={newUser.company_address} onChange={e => setNewUser({...newUser, company_address: e.target.value})} />
                                <div className="flex gap-2">
                                    <input className="w-1/3 border rounded p-2" type="text" placeholder="Postcode" value={newUser.company_postal_code} onChange={e => setNewUser({...newUser, company_postal_code: e.target.value})} />
                                    <input className="flex-1 border rounded p-2" type="text" placeholder="Plaats" value={newUser.company_city} onChange={e => setNewUser({...newUser, company_city: e.target.value})} />
                                </div>
                                <input className="w-full border rounded p-2" type="tel" placeholder="Bedrijfstelefoon" value={newUser.company_phone} onChange={e => setNewUser({...newUser, company_phone: e.target.value})} />
                                <input className="w-full border rounded p-2" type="email" placeholder="Bedrijfs-email" value={newUser.company_email} onChange={e => setNewUser({...newUser, company_email: e.target.value})} />
                                <hr className="my-2 border-gray-200" />
                                <input className="w-full border rounded p-2" type="email" placeholder="Login Email (Verplicht)" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
                                <input className="w-full border rounded p-2" type="password" placeholder="Wachtwoord (Verplicht)" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => setShowUserModal(false)} className="flex-1 bg-gray-100 py-3 rounded-lg font-bold text-gray-600 hover:bg-gray-200">Annuleren</button>
                                <button onClick={handleCreateUser} className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 shadow-md">Toevoegen</button>
                            </div>
                        </div>
                    </div>
                )} 
        {showPasswordModal && (<div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"><div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6"><h2 className="text-lg font-bold mb-4">Wachtwoord Reset</h2><input className="w-full border rounded p-2 mb-4" type="text" placeholder="Nieuw Wachtwoord" value={newPasswordInput} onChange={e => setNewPasswordInput(e.target.value)} /><div className="flex gap-2"><button onClick={() => setShowPasswordModal(false)} className="flex-1 bg-gray-200 py-2 rounded">Annuleren</button><button onClick={handleResetPassword} className="flex-1 bg-orange-500 text-white py-2 rounded">Resetten</button></div></div></div>)}
      </div>
    </div>
  );
}