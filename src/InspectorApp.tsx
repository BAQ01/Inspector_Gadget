import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useInspectionStore } from './store';
import { DEFECT_LIBRARY, calculateSample, COMPANIES } from './constants';
import { pdf } from '@react-pdf/renderer';
import { PDFReport } from './components/PDFReport';
import { compressImage, uploadPhotoToCloud } from './utils';
import { parsePlaceResult, fetchPlaces, lookupAddressBAG, geocodeAddress } from './utils/placesSearch';
import { logAction } from './utils/auditLog';
import SignatureCanvas from 'react-signature-canvas';
import { Camera, Trash2, ChevronLeft, ChevronRight, PlusCircle, X, CheckSquare, Pencil, Upload, RotateCcw, Calendar, Download, Search, MapPin, RefreshCw, Share2, CloudDownload, Cloud, CloudCheck, ArrowUp, ArrowDown, UserCircle, Save, LogOut, Settings, GripVertical} from 'lucide-react';
import { UsageFunctions, Defect, Classification, Instrument, InspectionMeta, BoardMeasurement, ClientContact } from './types';
import { supabase } from './supabase';

const generateId = () => Math.random().toString(36).substr(2, 9);
const FUSE_OPTIONS = ['3x25A', '3x35A', '3x50A', '3x63A', '3x80A', '3x100A', '3x125A', '3x160A', '3x250A'];
const STEPS = ['setup', 'measure', 'inspect', 'report'] as const;

// AANGEPAST: Datum functie nu puur string-based (geen tijdzone gedoe)
const addYearsSafe = (dateString: string, yearsToAdd: number) => {
  if (!dateString) return '';
  const parts = dateString.split('-'); // Verwacht YYYY-MM-DD
  if (parts.length !== 3) return '';
  
  const year = parseInt(parts[0], 10);
  const month = parts[1];
  const day = parts[2];
  
  const newYear = year + yearsToAdd;
  
  // Schrikkeljaar check (29 feb wordt 28 feb in niet-schrikkeljaar)
  if (month === '02' && day === '29') {
      const isLeap = (y: number) => (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0);
      if (!isLeap(newYear)) return `${newYear}-02-28`;
  }

  return `${newYear}-${month}-${day}`;
};

// HELPER COMPONENT: Input met Clear Button (X) voor Datalists
const ClearableInput = ({ value, onChange, placeholder, list, disabled, className }: any) => (
    <div className="relative w-full">
        <input 
            list={list}
            className={`${className} pr-8`} 
            value={value} 
            onChange={onChange} 
            placeholder={placeholder}
            disabled={disabled}
        />
        {!disabled && value && (
            <button 
                onClick={() => onChange({ target: { value: '' } })}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 bg-white"
                tabIndex={-1}
            >
                <X size={16} />
            </button>
        )}
    </div>
);

export default function InspectorApp({ userRole, onLogout, onOpenAdmin }: { userRole?: string | null, onLogout?: () => void, onOpenAdmin?: () => void }) {
  // --- PROFIEL STATES ---
  const [showProfile, setShowProfile] = useState(false);
  const [profileTab, setProfileTab] = useState<'persoonlijk' | 'bedrijf' | 'handtekening' | 'instrumenten'>('persoonlijk');
const [userProfile, setUserProfile] = useState<any>({
      full_name: '', scios_nr: '', phone: '', contact_email: '', company_name: '', company_address: '',
      company_postal_code: '', company_city: '', company_phone: '', company_email: '', signature_url: '',
      home_address: '', home_postal_code: '', home_city: '',
      instruments: [], linked_instruments: [], instrument_usage: {}
  });
  const [loginEmail, setLoginEmail] = useState('');
  const profileSigPad = useRef<SignatureCanvas>(null);

  // Voor het toevoegen van een instrument aan je profiel (koffer)
  const [newProfInst, setNewProfInst] = useState({ name: '', serialNumber: '', calibrationDate: '' });

  const getCalibrationStatus = (dateString: string) => {
      // Direct 'ok' teruggeven voor niet-datum waarden om rode/oranje kleuren te voorkomen
      if (!dateString || dateString === 'Indicatief' || dateString === 'n.v.t.') return 'ok';
      
      const calDate = new Date(dateString);
      if (isNaN(calDate.getTime())) return 'unknown';
      const diffDays = Math.ceil((calDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) return 'expired';
      if (diffDays <= 30) return 'warning';
      return 'ok';
  };

  const {
    meta, defects, measurements, customLibrary,
    setMeta, setUsageFunction, setMeasurements, addDefect, updateDefect,
    removeDefect, reorderDefects, addInstrument, removeInstrument,
    importState, mergeState, resetState, setCustomLibrary,
    addBoard, updateBoard, removeBoard
  } = useInspectionStore();

  const [activeTab, setActiveTab] = useState<typeof STEPS[number]>('setup');
  const [isGenerating, setIsGenerating] = useState(false);
  const [placesQuery, setPlacesQuery] = useState('');
  const [placesResults, setPlacesResults] = useState<any[]>([]);
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);
  const searchPlaces = async (query: string) => {
    setIsSearchingPlaces(true);
    setPlacesResults(await fetchPlaces(query));
    setIsSearchingPlaces(false);
  };

  // Places states voor Opdrachtgever sectie
  const [clientPlacesQuery, setClientPlacesQuery] = useState('');
  const [clientPlacesResults, setClientPlacesResults] = useState<any[]>([]);
  const [clientIsSearchingPlaces, setClientIsSearchingPlaces] = useState(false);
  const searchClientPlaces = async (query: string) => {
    setClientIsSearchingPlaces(true);
    setClientPlacesResults(await fetchPlaces(query));
    setClientIsSearchingPlaces(false);
  };

  // Places states voor Project/Locatie sectie
  const [projectPlacesQuery, setProjectPlacesQuery] = useState('');
  const [projectPlacesResults, setProjectPlacesResults] = useState<any[]>([]);
  const [projectIsSearchingPlaces, setProjectIsSearchingPlaces] = useState(false);
  const searchProjectPlaces = async (query: string) => {
    setProjectIsSearchingPlaces(true);
    setProjectPlacesResults(await fetchPlaces(query));
    setProjectIsSearchingPlaces(false);
  };

  // CRM klanten voor autocomplete opdrachtgever
  const [appClients, setAppClients] = useState<any[]>([]);
  const [clientFreqMap, setClientFreqMap] = useState<Record<string, number>>({});

  const [dbCompanies, setDbCompanies] = useState<any[]>([]);
  const [dbInstruments, setDbInstruments] = useState<any[]>([]);
  const [inspectorProfiles, setInspectorProfiles] = useState<any[]>([]);

  const ACTIVE_LIBRARY = customLibrary && customLibrary.length > 0 ? customLibrary : DEFECT_LIBRARY;

  // Centrale instrumentenlijst: alle form_options rijen gemapped naar Instrument
  const allInstruments: Instrument[] = dbInstruments.map(item => ({
    id: String(item.id),
    name: item.label,
    serialNumber: item.data?.serialNumber || '',
    calibrationDate: item.data?.calibrationDate || ''
  }));

  // Smart 3-tier sortering: Koffer (linked) → Eerder gebruikt → Alle overigen
  const buildSortedInstruments = (insts: Instrument[], linkedIds: number[], usageMap: Record<string, number>) => {
    const linkedSet = new Set(linkedIds.map(String));
    const getUsage = (i: Instrument) => usageMap[i.id] ?? 0;
    const tier1 = insts.filter(i => linkedSet.has(i.id))
      .sort((a, b) => getUsage(b) - getUsage(a) || a.name.localeCompare(b.name, 'nl'));
    const tier2 = insts.filter(i => !linkedSet.has(i.id) && getUsage(i) > 0)
      .sort((a, b) => getUsage(b) - getUsage(a));
    const tier3 = insts.filter(i => !linkedSet.has(i.id) && getUsage(i) === 0)
      .sort((a, b) => a.name.localeCompare(b.name, 'nl'));
    return { tier1, tier2, tier3 };
  };

  const { tier1, tier2, tier3 } = buildSortedInstruments(
    allInstruments,
    userProfile.linked_instruments ?? [],
    userProfile.instrument_usage ?? {}
  );

  // Frequency-sorted client suggestions for opdrachtgever autocomplete
  const clientSuggestions = useMemo(() => {
    const freqEntries = Object.entries(clientFreqMap).sort((a, b) => b[1] - a[1]);
    const freqNames = new Set(freqEntries.map(([n]) => n.toLowerCase()));
    const freqList = freqEntries.map(([name]) => ({ name }));
    const crmOnly = appClients.filter(c => !freqNames.has(c.name.toLowerCase())).map(c => ({ name: c.name, address: c.address, postalCode: c.postal_code, city: c.city, phone: c.phone, email: c.email }));
    return [...freqList, ...crmOnly];
  }, [clientFreqMap, appClients]);

  const [showWorkModal, setShowWorkModal] = useState(false);
  const [availableWork, setAvailableWork] = useState<any[]>([]);
  const [isLoadingWork, setIsLoadingWork] = useState(false);

// --- NIEUW: Zoeken & Sorteren in Werkvoorraad ---
  const [workSearch, setWorkSearch] = useState('');
  const [workSort, setWorkSort] = useState<{key: 'date' | 'client' | 'city' | 'project', dir: 'asc' | 'desc'}>({ key: 'date', dir: 'asc' });
  const [filterToday, setFilterToday] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [location, setLocation] = useState('');
  const [defectPhoto1, setDefectPhoto1] = useState<string | null>(null);
  const [defectPhoto2, setDefectPhoto2] = useState<string | null>(null);

  const [selectedMainCategory, setSelectedMainCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [selectedLibId, setSelectedLibId] = useState('');
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isCustomDefect, setIsCustomDefect] = useState(false);
  const [staticDescription, setStaticDescription] = useState('');
  const [customComment, setCustomComment] = useState('');
  const [customClassification, setCustomClassification] = useState<Classification>('Yellow');

  // Drag-and-drop state voor bevindingen volgorde
  const [defectDragIdx, setDefectDragIdx] = useState<number | null>(null);
  const [defectDragOverIdx, setDefectDragOverIdx] = useState<number | null>(null);

  const [showNewInstrumentForm, setShowNewInstrumentForm] = useState(false);
  const [newInstSearchQuery, setNewInstSearchQuery] = useState('');
  const [showCreatePhase, setShowCreatePhase] = useState(false);
  const [newInstName, setNewInstName] = useState('');
  const [newInstSn, setNewInstSn] = useState('');
  const [newInstDate, setNewInstDate] = useState('');
  const [selectedInstrumentId, setSelectedInstrumentId] = useState('');
  // Koffer tab states
  const [kofferSearch, setKofferSearch] = useState('');
  const [showKofferNewForm, setShowKofferNewForm] = useState(false);
  const [editingKofferInstId, setEditingKofferInstId] = useState<string | null>(null);
  const [kofferEditFields, setKofferEditFields] = useState({ name: '', serialNumber: '', calibrationDate: '' });
  const [isSearchingBag, setIsSearchingBag] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const sigPad = useRef<SignatureCanvas>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mergeInputRef = useRef<HTMLInputElement>(null);

  const currentStepIndex = STEPS.indexOf(activeTab);

  useEffect(() => {
      const fetchOptions = async () => {
          // Haal alle form_options op
          const { data: optionsData } = await supabase.from('form_options').select('*');
          const rawInstruments = optionsData?.filter(x => x.category === 'instrument') ?? [];
          if (optionsData) {
              setDbCompanies(optionsData.filter(x => x.category === 'iv_company'));
              setDbInstruments(rawInstruments);
          }

          // Haal alle inspecteur- en admin-profielen op voor de snelkeuze
          const { data: profilesData } = await supabase
              .from('profiles')
              .select('full_name, scios_nr, company_name')
              .in('role', ['inspector', 'admin'])
              .order('full_name');
          if (profilesData) {
              setInspectorProfiles(profilesData.filter(p => p.full_name));
          }

          // Haal CRM klanten op voor opdrachtgever autocomplete
          const { data: clientsData } = await supabase.from('clients').select('*').order('name');
          setAppClients(clientsData || []);
          const { data: freqData } = await supabase.from('inspections').select('client_name');
          if (freqData) {
            const freq: Record<string, number> = {};
            freqData.forEach(row => { if (row.client_name) freq[row.client_name] = (freq[row.client_name] || 0) + 1; });
            setClientFreqMap(freq);
          }

          // Haal de centrale bibliotheek op
          const { data: libraryData } = await supabase.from('defect_library').select('*');
          if (libraryData && libraryData.length > 0) {
              setCustomLibrary(libraryData);
          }

          // Haal het persoonlijke profiel op & AUTO-FILL
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
              setLoginEmail(session.user.email || '');
              const { data: profileData } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
              if (profileData) {
                  let finalProfile = { ...profileData };

                  // Eenmalige migratie: als er legacy instrumenten in profiles.instruments staan
                  // maar nog geen linked_instruments, verplaats ze naar de centrale database
                  const legacyInsts: any[] = profileData.instruments ?? [];
                  const alreadyMigrated = (profileData.linked_instruments ?? []).length > 0;
                  if (legacyInsts.length > 0 && !alreadyMigrated) {
                      const newLinkedIds: number[] = [];
                      for (const leg of legacyInsts) {
                          const match = rawInstruments.find(
                              (r: any) => r.label === leg.name && (r.data?.serialNumber ?? '') === (leg.serialNumber ?? '')
                          );
                          if (match) {
                              newLinkedIds.push(match.id);
                          } else {
                              const { data: upserted } = await supabase.from('form_options').upsert({
                                  category: 'instrument',
                                  label: leg.name,
                                  data: { serialNumber: leg.serialNumber || '', calibrationDate: leg.calibrationDate || '' }
                              }, { onConflict: 'label' }).select().single();
                              if (upserted) {
                                  newLinkedIds.push(upserted.id);
                                  setDbInstruments(prev => prev.some((r: any) => r.id === upserted.id) ? prev : [...prev, upserted]);
                              }
                          }
                      }
                      await supabase.from('profiles').update({ linked_instruments: newLinkedIds, instruments: [] }).eq('id', session.user.id);
                      finalProfile = { ...finalProfile, linked_instruments: newLinkedIds, instruments: [] };
                  }

                  setUserProfile({ ...userProfile, ...finalProfile });
                  useInspectionStore.getState().setMeta({
                      inspectorName: useInspectionStore.getState().meta.inspectorName || profileData.full_name || '',
                      sciosRegistrationNumber: useInspectionStore.getState().meta.sciosRegistrationNumber || profileData.scios_nr || '',
                      inspectionCompany: useInspectionStore.getState().meta.inspectionCompany || profileData.company_name || '',
                      inspectionCompanyAddress: useInspectionStore.getState().meta.inspectionCompanyAddress || profileData.company_address || '',
                      inspectionCompanyPostalCode: useInspectionStore.getState().meta.inspectionCompanyPostalCode || profileData.company_postal_code || '',
                      inspectionCompanyCity: useInspectionStore.getState().meta.inspectionCompanyCity || profileData.company_city || '',
                      inspectionCompanyPhone: useInspectionStore.getState().meta.inspectionCompanyPhone || profileData.company_phone || '',
                      inspectionCompanyEmail: useInspectionStore.getState().meta.inspectionCompanyEmail || profileData.company_email || '',
                      signatureUrl: useInspectionStore.getState().meta.signatureUrl || profileData.signature_url || ''
                  });
              }
          }
      };
      fetchOptions();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // in src/InspectorApp.tsx
  useEffect(() => {
    // Alleen rekenen als er een datum EN een interval is gekozen
    if (meta.date && meta.inspectionInterval) {
      const nextDate = addYearsSafe(meta.date, meta.inspectionInterval);
      setMeta({ nextInspectionDate: nextDate });
    } else {
      // Als er geen interval is gekozen, maak het veld leeg
      setMeta({ nextInspectionDate: '' });
    }
  }, [meta.date, meta.inspectionInterval, setMeta]);
  
  const goNext = () => { if (currentStepIndex < STEPS.length - 1) { setActiveTab(STEPS[currentStepIndex + 1]); window.scrollTo(0, 0); }};
  const goPrev = () => { if (currentStepIndex > 0) { setActiveTab(STEPS[currentStepIndex - 1]); window.scrollTo(0, 0); }};

  // --- INSTRUMENT HELPERS ---
  const incrementUsage = async (instrumentId: string) => {
    const session = (await supabase.auth.getSession()).data.session;
    if (!session) return;
    const currentUsage = userProfile.instrument_usage ?? {};
    const updatedUsage = { ...currentUsage, [instrumentId]: (currentUsage[instrumentId] ?? 0) + 1 };
    setUserProfile((prev: any) => ({ ...prev, instrument_usage: updatedUsage }));
    supabase.from('profiles').update({ instrument_usage: updatedUsage }).eq('id', session.user.id)
      .then(({ error }) => { if (error) console.warn('Usage update failed:', error.message); });
  };

  const linkInstrument = async (formOptionsId: number) => {
    const session = (await supabase.auth.getSession()).data.session;
    if (!session) return;
    const currentLinked: number[] = userProfile.linked_instruments ?? [];
    if (currentLinked.includes(formOptionsId)) return;
    const updated = [...currentLinked, formOptionsId];
    setUserProfile((prev: any) => ({ ...prev, linked_instruments: updated }));
    await supabase.from('profiles').update({ linked_instruments: updated }).eq('id', session.user.id);
  };

  const unlinkInstrument = async (formOptionsId: number) => {
    const session = (await supabase.auth.getSession()).data.session;
    if (!session) return;
    const updated = (userProfile.linked_instruments ?? []).filter((id: number) => id !== formOptionsId);
    setUserProfile((prev: any) => ({ ...prev, linked_instruments: updated }));
    await supabase.from('profiles').update({ linked_instruments: updated }).eq('id', session.user.id);
  };

  const updateInstrumentInDb = async (formOptionsId: number, fields: { name: string; serialNumber: string; calibrationDate: string }) => {
    const { error } = await supabase.from('form_options').update({
      label: fields.name,
      data: { serialNumber: fields.serialNumber, calibrationDate: fields.calibrationDate }
    }).eq('id', formOptionsId);
    if (error) { alert('Fout bij opslaan: ' + error.message); return; }
    setDbInstruments((prev: any[]) => prev.map(item =>
      item.id === formOptionsId
        ? { ...item, label: fields.name, data: { serialNumber: fields.serialNumber, calibrationDate: fields.calibrationDate } }
        : item
    ));
  };

  const handleCreateInstrumentFromMetingen = async () => {
    if (!newInstName.trim()) return;
    // Exacte dubbel-check (naam + serienummer)
    const duplicate = allInstruments.find(
      i => i.name.trim().toLowerCase() === newInstName.trim().toLowerCase()
        && i.serialNumber.trim().toLowerCase() === newInstSn.trim().toLowerCase()
    );
    if (duplicate) {
      if (window.confirm(`Er bestaat al "${duplicate.name} (SN: ${duplicate.serialNumber})". Koppelen aan je profiel en toevoegen aan de meting?`)) {
        addInstrument(duplicate);
        await linkInstrument(Number(duplicate.id));
        await incrementUsage(duplicate.id);
      }
      setShowNewInstrumentForm(false); setNewInstSearchQuery(''); setShowCreatePhase(false); setNewInstName(''); setNewInstSn(''); setNewInstDate('');
      return;
    }
    const { data: inserted, error } = await supabase.from('form_options').insert({
      category: 'instrument',
      label: newInstName.trim(),
      data: { serialNumber: newInstSn.trim() || '', calibrationDate: newInstDate || 'n.v.t.' }
    }).select().single();
    if (error) { alert('Fout bij aanmaken: ' + error.message); return; }
    const newInst: Instrument = { id: String(inserted.id), name: inserted.label, serialNumber: inserted.data.serialNumber, calibrationDate: inserted.data.calibrationDate };
    setDbInstruments((prev: any[]) => [...prev, inserted]);
    await linkInstrument(inserted.id);
    addInstrument(newInst);
    await incrementUsage(String(inserted.id));
    setShowNewInstrumentForm(false); setNewInstSearchQuery(''); setShowCreatePhase(false); setNewInstName(''); setNewInstSn(''); setNewInstDate('');
  };

  const mainCategories = Array.from(new Set(ACTIVE_LIBRARY.map(d => d.category))).sort();
  const subCategories = selectedMainCategory
    ? Array.from(new Set(ACTIVE_LIBRARY.filter(d => d.category === selectedMainCategory).map(d => d.subcategory))).sort()
    : [];

  const filteredDefects = (selectedMainCategory && selectedSubCategory)
    ? ACTIVE_LIBRARY.filter(d => d.category === selectedMainCategory && d.subcategory === selectedSubCategory)
    : [];

  const fetchWorkOrders = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert("Sessie verlopen. Log opnieuw in om opdrachten op te halen.");
      return;
    }

    setIsLoadingWork(true);
    setShowWorkModal(true);

    const { data, error } = await supabase
      .from('inspections')
      .select('*')
      .in('status', ['new', 'in_progress', 'contribution_ready'])
      .order('created_at', { ascending: false });
    
    if (error) {
        alert("Fout bij ophalen werkvoorraad: " + error.message);
    } else {
        setAvailableWork(data || []);
    }
    setIsLoadingWork(false);
  };

  const loadWorkOrder = async (inspection: any) => {
    if (!inspection) return;

    // Data parsen (soms is het al JSON, soms een string)
    let dataToLoad = typeof inspection.report_data === 'string' 
      ? JSON.parse(inspection.report_data) 
      : inspection.report_data;

    // Keuze aan de gebruiker
    const userChoice = window.prompt(
      `Opdracht: "${inspection.client_name}"\n\n` +
      `Kies je rol:\n` +
      `1 = HOOFDINSPECTEUR (Volledig rapport beheren)\n` +
      `2 = COLLEGA (Alleen eigen gebreken toevoegen)`,
      "1"
    );

    if (!userChoice) return;
    const isContribution = userChoice === '2';

    const baseMeta = dataToLoad.meta || {};
    
    // De data voorbereiden
    const safeData = {
      ...dataToLoad,
      meta: {
        ...baseMeta,
        // Als collega: maak inspecteur gegevens leeg (vult eigen naam in)
        inspectorName: isContribution ? '' : (baseMeta.inspectorName || ''),
        sciosRegistrationNumber: isContribution ? '' : (baseMeta.sciosRegistrationNumber || ''),
        
        // Contributie modus instellen
        isContributionMode: isContribution,
        
        // Koppel het ID van de hoofdopdracht (belangrijk voor de SQL trigger!)
        parentInspectionId: isContribution ? inspection.id : undefined,
        
        // Koppel het nummer van de hoofdopdracht (voor weergave: "Bijdrage aan IP...-1")
        parentInspectionNumber: isContribution ? inspection.inspection_number : undefined,
        
        // Reset cloud ID zodat hij als NIEUW wordt opgeslagen, niet als update van het origineel
        supabaseId: isContribution ? undefined : inspection.id,

        // Zet datum altijd op VANDAAG bij starten uitvoering
        date: new Date().toISOString().split('T')[0]
      },
      // Als collega: begin met lege lijsten
      defects: isContribution ? [] : (dataToLoad.defects || []),
      measurements: {
        ...(isContribution ? { boards: [] } : (dataToLoad.measurements || { boards: [] })),
        selectedInstruments: isContribution ? [] : (dataToLoad.measurements?.selectedInstruments || [])
      }
    };

    try {
      // Laad de data in de store
      importState(safeData);
      
      // Als hoofdinspecteur: zet status in DB op 'in_progress'
      if (!isContribution) {
        await supabase.from('inspections')
          .update({ status: 'in_progress' })
          .eq('id', inspection.id);
      }

      setShowWorkModal(false);
      setActiveTab('setup');
      
      // Feedback aan gebruiker
      if (isContribution) {
          alert(`Modus: COLLEGA.\nJe werkt aan een bijdrage voor project ${inspection.inspection_number || '...'}.\nJe ID wordt straks automatisch gegenereerd (bijv. ...-1A).`);
      } else {
          alert("Modus: HOOFDINSPECTEUR.\nJe beheert het volledige rapport.");
      }

    } catch (err) {
      console.error("Fout bij laden:", err);
      alert("Er ging iets mis bij het laden van de data.");
    }
  };

  const handleFinalSync = async () => {
    const isContribution = meta.isContributionMode;
    if (isContribution) {
      await handleUploadAsNew(); 
    } else {
      await handleSyncBack(); 
    }
  };

  // FIXED VERSION of handleCloudMerge function
// This should replace lines 318-382 in InspectorApp.tsx

const handleCloudMerge = async () => {
    const myId = meta.supabaseId;
    if (!myId) return alert("Sla eerst je eigen rapport op in de cloud voordat je kunt samenvoegen.");

    setIsGenerating(true);
    
    const { data: contributions, error } = await supabase
        .from('inspections')
        .select('id, report_data, status')
        .eq('parent_id', myId)
        .eq('status', 'contribution_ready');

    setIsGenerating(false);

    if (error) return alert("Fout bij zoeken: " + error.message);
    if (!contributions || contributions.length === 0) return alert("Geen nieuwe bijdragen gevonden.");

    let mergedCount = 0;

    for (const contribution of contributions) {
        const reportData = (typeof contribution.report_data === 'string' 
          ? JSON.parse(contribution.report_data) 
          : contribution.report_data) as { 
              meta: Partial<InspectionMeta>, 
              defects: Defect[], 
              measurements: { selectedInstruments: Instrument[], boards: BoardMeasurement[] } 
          };

        const contribInspector = reportData.meta?.inspectorName || 'Onbekende collega';
        const contribDate = reportData.meta?.date || 'onbekende datum';
        const defectCount = reportData.defects?.length || 0;
        const boardCount = reportData.measurements?.boards?.length || 0;
          
        if (window.confirm(`Bijdrage van ${contribInspector} (${contribDate}) toevoegen?\nBevat ${defectCount} gebreken en ${boardCount} verdelers.`)) {
            
            // ✅ FIX: ADD THE COLLEAGUE'S NAME TO additionalInspectors
            // Check if this inspector is not already in the list
            const currentAdditionalInspectors = meta.additionalInspectors || [];
            const mainInspector = meta.inspectorName;
            
            if (contribInspector && 
                contribInspector !== 'Onbekende collega' && 
                contribInspector !== mainInspector && 
                !currentAdditionalInspectors.includes(contribInspector)) {
                
                setMeta({ 
                    additionalInspectors: [...currentAdditionalInspectors, contribInspector] 
                });
            }
            // ✅ END FIX
            
            // Add defects with contributor prefix
            if (Array.isArray(reportData.defects)) {
                reportData.defects.forEach((d: Defect) => {
                    addDefect({ 
                      ...d, 
                      id: generateId(), 
                      description: `[BIJDRAGE ${contribInspector.toUpperCase()}]: ${d.description}`
                    });
                });
            }

            // Add instruments (avoid duplicates)
            if (Array.isArray(reportData.measurements?.selectedInstruments)) {
                reportData.measurements.selectedInstruments.forEach((inst: Instrument) => {
                    const isDuplicate = measurements.selectedInstruments.some(
                      existing => existing.serialNumber === inst.serialNumber
                    );
                    if (!isDuplicate) addInstrument(inst);
                });
            }

            // Add boards with contributor name
            if (Array.isArray(reportData.measurements?.boards)) {
              reportData.measurements.boards.forEach((board: BoardMeasurement) => {
                 addBoard({ ...board, id: generateId(), name: `${board.name} (v. ${contribInspector})` });
              });
            }
            
            // Mark contribution as merged in database
            await supabase.from('inspections').update({ status: 'merged' }).eq('id', contribution.id);
            mergedCount++;
        }
    }
    
    if (mergedCount > 0) alert(`Succes! ${mergedCount} bijdrage(n) samengevoegd.`);
};

  const handleSyncBack = async () => {
    const cloudId = (meta as any).supabaseId;
    if (!cloudId) return alert("❌ FOUT: ID kwijt.");
    if (!meta.signatureUrl) return alert("Graag eerst tekenen.");

    if(!window.confirm("Inleveren bij kantoor?")) return;

    setIsGenerating(true);
    const finalReportData = { meta, measurements, defects };

    const { error: updateError } = await supabase
      .from('inspections')
      .update({ report_data: finalReportData, status: 'review_ready' })
      .eq('id', cloudId);

    setIsGenerating(false);

    if (updateError) {
      alert("❌ Opslaan mislukt: " + updateError.message);
    } else {
      await supabase.from('inspection_versions').insert({ 
        inspection_id: cloudId, 
        report_data: finalReportData, 
        saved_by: meta.inspectorName || 'Inspecteur', 
        saved_at: new Date().toISOString() 
      });
      alert(`✅ Gelukt! De inspectie is ingeleverd.`);
    }
  };

  const handleUploadAsNew = async () => {
    if (!meta.clientName) return alert("Vul eerst een klantnaam in.");

    // --- IDENTITEITS CHECK (FIX VOOR MERGE) ---
    // We moeten garanderen dat 'inspectorName' gevuld is met de HUIDIGE gebruiker,
    // anders denkt de merge-functie dat het bestand leeg of van de hoofdinspecteur is.
    let finalInspectorName = meta.inspectorName;

    if (!finalInspectorName || finalInspectorName.trim() === '') {
        // Probeer de sessie op te halen
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user && session.user.email) {
            finalInspectorName = session.user.email; // Gebruik email als fallback
            setMeta({ inspectorName: finalInspectorName }); // Update direct de UI
        } else {
            // Als we echt geen naam kunnen vinden, dwingen we de gebruiker
            return alert("LET OP: Vul a.u.b. uw naam in bij 'Inspecteur' (Tabblad Basis) voordat u de bijdrage verstuurt.");
        }
    }
    // ------------------------------------------

    const isContrib = meta.isContributionMode && meta.parentInspectionId;
    
    // Bevestiging vragen
    if (!window.confirm(isContrib ? "Bijdrage uploaden naar Hoofdinspecteur?" : "Opslaan als nieuwe opdracht?")) return;

    setIsGenerating(true);
    
    // Geocode projectadres voor routeoptimalisatie (stil op de achtergrond)
    const coords = await geocodeAddress(meta.projectAddress, meta.projectPostalCode, meta.projectCity);

    // We gebruiken hier expliciet 'finalInspectorName' om zeker te zijn dat de update mee gaat
    const reportData = {
        meta: { ...meta, inspectorName: finalInspectorName, ...(coords ?? {}) },
        measurements,
        defects,
    };    
    // Naamgeving bepalen voor in de lijst
    let uploadClientName = meta.clientName;
    if (isContrib) {
        // Zorgt voor titel: "Bakkerij Jansen (Bijdrage aan IP10260204-1)"
        // De SQL trigger zorgt straks voor het unieke ID (IP10260204-1A)
        const parentRef = meta.parentInspectionNumber ? ` ${meta.parentInspectionNumber}` : '';
        uploadClientName += ` (Bijdrage aan${parentRef})`;
    }

    const payload: any = {
        client_name: uploadClientName,
        // Status bepalen: Bijdrage is klaar voor merge, Hoofdinspectie is klaar voor review
        status: isContrib ? 'contribution_ready' : 'review_ready',
        report_data: reportData,
        // CRUCIAAL: Dit vertelt de database of het een Hoofd (NULL) of Kind (ID) is
        parent_id: isContrib ? meta.parentInspectionId : null,
        // CRUCIAAL: Dit zorgt dat de nummer-generator afgaat
        scope_type: '10'
    };

    // Insert in database
    const { data, error } = await supabase.from('inspections').insert(payload).select().single();

    setIsGenerating(false);

    if (error) {
        alert("Fout bij opslaan: " + error.message);
    } else {
        // Update lokale state met het nieuwe ID
        setMeta({ supabaseId: data.id, inspectionNumber: data.inspection_number });
        logAction(
            'inspector',
            isContrib ? 'inspection_updated' : 'inspection_created',
            'inspection',
            data.id,
            meta.clientName || 'Onbekend',
            { inspectionNumber: data.inspection_number, projectLocation: meta.projectLocation, date: meta.date }
        );
        if (isContrib) {
            alert(`✅ Bijdrage verzonden!\nJe unieke nummer is: ${data.inspection_number}`);
        } else {
            alert(`✅ Opgeslagen in de cloud.\nProject nummer: ${data.inspection_number}`);
        }
    }
  };

  const handleMergeClick = () => { if (window.confirm('Bestand lokaal samenvoegen?')) mergeInputRef.current?.click(); };
  
  const handleMergeFile = (e: React.ChangeEvent<HTMLInputElement>) => { 
    const f = e.target.files?.[0]; 
    if (!f) return; 
    const r = new FileReader(); 
    r.onload = (ev) => { 
      try { 
        const json = JSON.parse(ev.target?.result as string); 
        mergeState(json); 
        alert(`Gelukt!`); 
      } catch { alert('Fout.'); } 
    }; 
    r.readAsText(f); 
  };

  const handleMainCategoryChange = (val: string) => { 
    if (val === 'NEW') { setIsCreatingCategory(true); setSelectedMainCategory(''); } 
    else { setIsCreatingCategory(false); setSelectedMainCategory(val); } 
    setSelectedSubCategory(''); setSelectedLibId(''); setIsCustomDefect(false); setStaticDescription(''); 
  };
  
  const handleSubCategoryChange = (val: string) => { setSelectedSubCategory(val); setSelectedLibId(''); setIsCustomDefect(false); setStaticDescription(''); };
  
  const handleDefectChange = (val: string) => {
    if (val === 'CUSTOM') { setIsCustomDefect(true); setSelectedLibId(''); setStaticDescription(''); setCustomComment(''); setCustomClassification('Yellow'); }
    else {
      setIsCustomDefect(false); setSelectedLibId(val);
      const libItem = ACTIVE_LIBRARY.find(d => d.id === val);
      if (libItem) { setStaticDescription(libItem.description); setCustomClassification(libItem.classification); }
      setCustomComment('');
    }
  };

  const handleStartEdit = (d: Defect) => {
    setLocation(d.location); setDefectPhoto1(d.photoUrl || null); setDefectPhoto2(d.photoUrl2 || null);
    const libItem = ACTIVE_LIBRARY.find(l => l.id === d.libraryId);
    if (libItem) {
      setIsCreatingCategory(false); setIsCustomDefect(false); setSelectedMainCategory(libItem.category);
      setSelectedSubCategory(libItem.subcategory); setSelectedLibId(libItem.id);
      setStaticDescription(libItem.description); setCustomClassification(libItem.classification);
      setCustomComment(d.description.replace(libItem.description, '').trim());
    } else {
      setIsCustomDefect(true); setSelectedMainCategory(''); setSelectedSubCategory('');
      setStaticDescription(''); setCustomComment(d.description); setCustomClassification(d.classification);
    }
    setEditingId(d.id); window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveDefect = () => {
    if (!location) return;
    let finalDescription = '', finalClassification: Classification = 'Yellow', finalLibId: string | undefined = undefined;

    if (isCustomDefect) {
      finalDescription = customComment; finalClassification = customClassification;
    } else {
      const libItem = ACTIVE_LIBRARY.find(d => d.id === selectedLibId);
      if (!libItem) return;
      finalDescription = customComment ? `${libItem.description}\n\n${customComment}` : libItem.description;
      finalClassification = libItem.classification; finalLibId = libItem.id;
    }

    const defectData: Defect = {
      id: editingId || generateId(), libraryId: finalLibId, location, description: finalDescription,
      classification: finalClassification, photoUrl: defectPhoto1 || undefined,
      photoUrl2: defectPhoto2 || undefined, category: selectedMainCategory || undefined, subcategory: selectedSubCategory || undefined
    };

    if (editingId) { updateDefect(editingId, defectData); setEditingId(null); } 
    else { addDefect(defectData); }

    setLocation(''); setCustomComment(''); setStaticDescription(''); setSelectedMainCategory('');
    setSelectedSubCategory(''); setSelectedLibId(''); setDefectPhoto1(null); setDefectPhoto2(null);
    setIsCustomDefect(false); setCustomClassification('Yellow');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

    const handleSaveProfile = async () => {
      setIsGenerating(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
          const { error } = await supabase.from('profiles').update({
              full_name: userProfile.full_name,
              scios_nr: userProfile.scios_nr,
              phone: userProfile.phone,
              contact_email: userProfile.contact_email,
              company_name: userProfile.company_name,
              company_address: userProfile.company_address,
              company_postal_code: userProfile.company_postal_code,
              company_city: userProfile.company_city,
              company_phone: userProfile.company_phone,
              company_email: userProfile.company_email,
              signature_url: userProfile.signature_url,
              home_address: userProfile.home_address,
              home_postal_code: userProfile.home_postal_code,
              home_city: userProfile.home_city,
              // linked_instruments en instrument_usage worden direct opgeslagen via link/unlink acties
          }).eq('id', session.user.id);
          
          if (error) {
              alert("Fout bij opslaan: " + error.message);
          } else {
              logAction('inspector', 'profile_updated', 'profile', session.user.id, userProfile.full_name || session.user.email || 'Onbekend');
              const companyName = userProfile.company_name?.trim();
              if (companyName) {
                  if (userRole === 'installer') {
                      // Installateur → bedrijf opslaan als klant
                      const { data: existingClient } = await supabase.from('clients').select('id, contacts').ilike('name', companyName);
                      if (existingClient && existingClient.length > 0) {
                          const client = existingClient[0];
                          const contacts: ClientContact[] = client.contacts || [];
                          const name = userProfile.full_name?.trim();
                          if (name && !contacts.find((c: ClientContact) => c.name.toLowerCase() === name.toLowerCase())) {
                              contacts.push({ id: crypto.randomUUID(), name, role: 'Medewerker', phone: '', email: userProfile.contact_email || '' });
                          }
                          // Also update address/phone/email of the existing client
                          await supabase.from('clients').update({
                              address: userProfile.company_address || '',
                              postal_code: userProfile.company_postal_code || '',
                              city: userProfile.company_city || '',
                              phone: userProfile.company_phone || '',
                              email: userProfile.company_email || '',
                              contacts,
                          }).eq('id', client.id);
                      } else {
                          const contacts: ClientContact[] = userProfile.full_name?.trim()
                              ? [{ id: crypto.randomUUID(), name: userProfile.full_name.trim(), role: 'Medewerker', phone: '', email: userProfile.contact_email || '' }]
                              : [];
                          await supabase.from('clients').insert({ name: companyName, address: userProfile.company_address || '', postal_code: userProfile.company_postal_code || '', city: userProfile.company_city || '', phone: userProfile.company_phone || '', email: userProfile.company_email || '', contacts });
                      }
                  } else {
                      // Inspecteur / Admin → bedrijf opslaan als inspectiebedrijf in form_options
                      const companyData = { address: userProfile.company_address || '', postalCode: userProfile.company_postal_code || '', city: userProfile.company_city || '', phone: userProfile.company_phone || '', email: userProfile.company_email || '' };
                      const existing = dbCompanies.find(c => c.label.toLowerCase() === companyName.toLowerCase());
                      if (existing) {
                          await supabase.from('form_options').update({ label: companyName, data: companyData }).eq('id', existing.id);
                          setDbCompanies(prev => prev.map(c => c.id === existing.id ? { ...c, label: companyName, data: companyData } : c));
                      } else {
                          const { data: inserted } = await supabase.from('form_options').insert({
                              category: 'iv_company',
                              label: companyName,
                              data: companyData,
                          }).select().single();
                          if (inserted) setDbCompanies(prev => [...prev, inserted]);
                      }
                  }
              }
              alert("✅ Profiel succesvol opgeslagen!");
          }
      }
      setIsGenerating(false);
  };

  const saveProfileSignature = () => { if (profileSigPad.current) setUserProfile({ ...userProfile, signature_url: profileSigPad.current.getCanvas().toDataURL('image/png') }); };
  const clearProfileSignature = () => { profileSigPad.current?.clear(); setUserProfile({ ...userProfile, signature_url: '' }); };

  const handleBagSearch = async () => { 
    if (!meta.projectPostalCode || !meta.projectAddress) { alert("Vul adres in."); return; } 
    setIsSearchingBag(true); 
    try { 
      const q = `${meta.projectPostalCode} ${(meta.projectAddress.match(/\d+/) || [''])[0]}`.trim(); 
      const res = await fetch(`https://api.pdok.nl/bzk/locatieserver/search/v3_1/free?q=${encodeURIComponent(q)}&rows=1`); 
      const d = await res.json(); 
      if (d.response.docs[0]) { setMeta({ idBagviewer: d.response.docs[0].adresseerbaarobject_id || d.response.docs[0].id, projectCity: d.response.docs[0].woonplaatsnaam || meta.projectCity }); } 
    } catch { alert("Fout."); } finally { setIsSearchingBag(false); } 
  };
  
  const handleLocationPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.[0]) {
          setIsUploading(true);
          const compressed = await compressImage(e.target.files[0], 'cover');
          const url = await uploadPhotoToCloud(compressed);
          setIsUploading(false);
          if (url) setMeta({ locationPhotoUrl: url });
      }
  };
  
  const onDefectPhoto = async (e: React.ChangeEvent<HTMLInputElement>, num: 1 | 2) => {
      if (e.target.files?.[0]) {
          setIsUploading(true);
          const compressed = await compressImage(e.target.files[0], 'defect');
          const url = await uploadPhotoToCloud(compressed);
          setIsUploading(false);
          if (url) { if (num === 1) setDefectPhoto1(url); else setDefectPhoto2(url); }
      }
  };
  
  const handleBackupDownload = () => {
    const data = JSON.stringify({ meta, measurements, defects }, null, 2); 
    const blob = new Blob([data], { type: 'application/json' }); 
    const url = URL.createObjectURL(blob); 
    const a = document.createElement('a'); a.href = url; 
    a.download = `${meta.clientName || 'Inspectie'}_Backup.json`; 
    a.click(); URL.revokeObjectURL(url); 
  };

  const handleShareFindings = async () => {
    const data = JSON.stringify({ meta, measurements, defects }, null, 2); 
    const blob = new Blob([data], { type: 'application/json' }); 
    const file = new File([blob], 'findings.json', { type: 'application/json' }); 
    if (navigator.canShare && navigator.canShare({ files: [file] })) { 
      try { await navigator.share({ files: [file], title: 'Inspectie', text: 'Bevindingen.' }); } catch { handleBackupDownload(); } 
    } else { handleBackupDownload(); } 
  };

  const handleImportClick = () => { if (window.confirm('Overschrijven?')) fileInputRef.current?.click(); };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { 
    const f = e.target.files?.[0]; if (!f) return; 
    const r = new FileReader(); r.onload = (ev) => { try { importState(JSON.parse(ev.target?.result as string)); } catch { alert('Fout'); } }; 
    r.readAsText(f); 
  };

  const handleReset = () => { if (window.confirm('Alles wissen?')) { resetState(); if (sigPad.current) sigPad.current.clear(); window.scrollTo(0, 0); } };
  const saveSignature = () => { if (sigPad.current) setMeta({ signatureUrl: sigPad.current.getCanvas().toDataURL('image/png') }); };
  const clearSignature = () => { sigPad.current?.clear(); setMeta({ signatureUrl: '' }); };
  const sampleSize = calculateSample(meta.totalComponents);
  
  const usageOptionsLeft: {key: keyof UsageFunctions, label: string}[] = [{ key: 'woonfunctie', label: 'Woonfunctie' }, { key: 'bijeenkomstfunctie', label: 'Bijeenkomstfunctie' }, { key: 'celfunctie', label: 'Celfunctie' }, { key: 'gezondheidszorgfunctie', label: 'Gezondheidszorgfunctie' }, { key: 'industriefunctie', label: 'Industriefunctie' }, { key: 'kantoorfunctie', label: 'Kantoorfunctie' }];
  const usageOptionsRight: {key: keyof UsageFunctions, label: string}[] = [{ key: 'logiesfunctie', label: 'Logiesfunctie' }, { key: 'onderwijsfunctie', label: 'Onderwijsfunctie' }, { key: 'sportfunctie', label: 'Sportfunctie' }, { key: 'winkelfunctie', label: 'Winkelfunctie' }, { key: 'overigeGebruiksfunctie', label: 'Overige gebruiksfunctie' }, { key: 'bouwwerkGeenGebouw', label: 'Bouwwerk geen gebouw zijnde' }];

  // --- BIJGEWERKT: Werkvoorraad Filteren & Sorteren ---
  const processedWork = availableWork
    .filter(job => {
        const term = workSearch.toLowerCase();
        const client = (job.client_name || '').toLowerCase();
        const meta = job.report_data?.meta || {};
        const project = (meta.projectLocation || '').toLowerCase();
        const city = (meta.projectCity || '').toLowerCase();
        const date = (meta.date || '').toLowerCase();
        const id = (job.inspection_number || '').toLowerCase();
        
        // Check of het aan de zoekterm voldoet
        const matchesSearch = client.includes(term) || project.includes(term) || city.includes(term) || date.includes(term) || id.includes(term);
        
        // Check of het "Vandaag" filter aan staat
        if (filterToday) {
            const today = new Date().toISOString().split('T')[0];
            return matchesSearch && date === today;
        }

        return matchesSearch;
    })
    .sort((a, b) => {
        let valA = '';
        let valB = '';

        if (workSort.key === 'client') {
            valA = a.client_name || '';
            valB = b.client_name || '';
        } else if (workSort.key === 'project') {
            valA = a.report_data?.meta?.projectLocation || '';
            valB = b.report_data?.meta?.projectLocation || '';
        } else if (workSort.key === 'city') {
            valA = a.report_data?.meta?.projectCity || '';
            valB = b.report_data?.meta?.projectCity || '';
        } else {
            // Default: Date
            valA = a.report_data?.meta?.date || '';
            valB = b.report_data?.meta?.date || '';
        }

        return workSort.dir === 'asc' 
            ? valA.localeCompare(valB) 
            : valB.localeCompare(valA);
    });

  const handleSortClick = (key: 'date' | 'client' | 'city' | 'project') => {
      setWorkSort(curr => ({
          key,
          dir: curr.key === key && curr.dir === 'asc' ? 'desc' : 'asc'
      }));
  };


  const handleDownloadPDF = async () => { 
    if (!meta.signatureUrl) return alert("Teken eerst."); 
    setIsGenerating(true); 
    const baseFileName = `${meta.date || 'Datum'}_${meta.clientName || 'Klant'}_${meta.projectLocation || 'Project'}_${meta.projectCity || 'Plaats'}`;

    try { 
      const jsonData = JSON.stringify({ meta, measurements, defects }, null, 2); 
      const jsonBlob = new Blob([jsonData], { type: 'application/json' }); 
      const jsonUrl = URL.createObjectURL(jsonBlob); 
      const jsonLink = document.createElement('a'); 
      jsonLink.href = jsonUrl; 
      jsonLink.download = `${baseFileName}.json`; 
      document.body.appendChild(jsonLink); 
      jsonLink.click(); 
      document.body.removeChild(jsonLink); 
      URL.revokeObjectURL(jsonUrl);

      await new Promise(resolve => setTimeout(resolve, 500));

      const pdfBlob = await pdf(<PDFReport meta={meta} defects={defects} measurements={measurements} />).toBlob(); 
      const pdfUrl = URL.createObjectURL(pdfBlob); 
      const pdfLink = document.createElement('a'); 
      pdfLink.href = pdfUrl; 
      pdfLink.download = `${baseFileName}.pdf`; 
      document.body.appendChild(pdfLink); 
      pdfLink.click(); 
      document.body.removeChild(pdfLink); 
      URL.revokeObjectURL(pdfUrl);
      
    } catch (e) { 
      console.error(e); 
      alert("Fout bij genereren."); 
    } finally { 
      setIsGenerating(false); 
    } 
  };

  return (
    <div className="min-h-screen font-sans text-gray-800 pb-20 bg-gray-50">
      <div className="max-w-2xl mx-auto bg-white shadow-xl min-h-screen md:min-h-0 md:rounded-lg md:my-8 overflow-hidden flex flex-col">
        {/* HEADER */}
        <div className="bg-emerald-700 p-4 text-white flex justify-between items-center shadow-md">
            <h1 className="font-bold text-xl">SCIOS Scope 10</h1>
            <div className="flex items-center gap-2">
                <div className="items-center gap-1 text-[10px] bg-emerald-800/50 px-2 py-1 rounded text-emerald-100 hidden md:flex animate-pulse"><RefreshCw size={10} /> Autosave</div>
                <div className="text-xs font-mono bg-emerald-900/50 px-3 py-1 rounded hidden md:block">{meta.date}</div>
                <button onClick={() => setShowProfile(true)} className="flex items-center gap-2 bg-emerald-800 hover:bg-emerald-900 px-3 py-2 rounded text-sm font-bold transition-colors shadow-sm border border-emerald-600">
                    <UserCircle size={18} /> <span className="hidden md:inline">Mijn Profiel</span>
                </button>
                {userRole === 'admin' && onOpenAdmin && (
                    <button onClick={onOpenAdmin} title="Beheerder" className="flex items-center gap-1 bg-emerald-800 hover:bg-emerald-900 px-3 py-2 rounded text-sm font-bold transition-colors shadow-sm border border-emerald-600">
                        <Settings size={18} /> <span className="hidden md:inline">Beheer</span>
                    </button>
                )}
                {onLogout && (
                    <button onClick={onLogout} title="Uitloggen" className="flex items-center gap-1 bg-emerald-800 hover:bg-emerald-900 px-3 py-2 rounded text-sm font-bold transition-colors shadow-sm border border-emerald-600">
                        <LogOut size={18} /> <span className="hidden md:inline">Uitloggen</span>
                    </button>
                )}
            </div>
        </div>

        <div className="flex border-b overflow-x-auto bg-white">{STEPS.map((tab, i) => (<button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 p-3 text-xs md:text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${activeTab === tab ? 'text-emerald-700 border-b-4 border-emerald-700 bg-emerald-50' : 'text-gray-400 hover:text-gray-600'}`}>{i + 1}. {tab === 'setup' ? 'Basis' : tab === 'measure' ? 'Metingen' : tab === 'inspect' ? 'Gebreken' : 'Export'}</button>))}</div>

        <div className="p-6 flex-grow">
          {activeTab === 'setup' && (
            <div className="space-y-6">
               <div className="flex gap-2 mb-4">
                 <button onClick={handleImportClick} className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded flex items-center justify-center gap-2 font-bold shadow text-xs md:text-sm"><Upload size={16} /><span className="hidden md:inline">Laden</span></button>
                 <button onClick={fetchWorkOrders} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-2 rounded flex items-center justify-center gap-2 font-bold shadow text-xs md:text-sm"><CloudDownload size={16} /><span className="hidden md:inline">Werkvoorraad</span></button>
                 <button onClick={handleReset} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded flex items-center justify-center gap-2 font-bold shadow text-xs md:text-sm"><RotateCcw size={16} /><span className="hidden md:inline">Leegmaken</span></button>
                 <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json,application/json" className="hidden" />
               </div>

               {/* VERNIEUWDE WERKVOORRAAD MODAL */}
        {showWorkModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
                    
                    {/* Header */}
                    <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                        <h3 className="font-bold text-lg flex items-center gap-2 text-blue-800">
                            <Cloud size={20}/> Beschikbare Opdrachten
                        </h3>
                        <button onClick={() => setShowWorkModal(false)}>
                            <X className="text-gray-400 hover:text-gray-600"/>
                        </button>
                    </div>

                    {/* --- BIJGEWERKT: Zoek & Sorteer Balk --- */}
                    <div className="p-4 bg-gray-100 border-b space-y-3">
                        {/* Zoekveld en Vandaag Filter */}
                        <div className="flex gap-2 items-center">
                            <div className="relative flex-grow">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <input 
                                    type="text" 
                                    placeholder="Zoek op naam, project, plaats..." 
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={workSearch}
                                    onChange={(e) => setWorkSearch(e.target.value)}
                                />
                            </div>
                            <label className="flex items-center gap-2 bg-white px-3 py-2 border rounded-lg cursor-pointer hover:bg-blue-50 transition-colors shrink-0">
                                <input 
                                    type="checkbox" 
                                    className="w-4 h-4 text-blue-600 rounded" 
                                    checked={filterToday}
                                    onChange={(e) => setFilterToday(e.target.checked)}
                                />
                                <span className="text-xs font-bold text-gray-700">Vandaag</span>
                            </label>
                        </div>
                        
                        {/* Sorteer Knoppen */}
                        <div className="grid grid-cols-4 gap-2 text-[10px] md:text-xs">
                            <button onClick={() => handleSortClick('date')} className={`py-1.5 rounded border flex items-center justify-center gap-1 font-bold ${workSort.key === 'date' ? 'bg-blue-100 text-blue-700 border-blue-300' : 'bg-white text-gray-600'}`}>
                                Datum {workSort.key === 'date' && (workSort.dir === 'asc' ? <ArrowUp size={12}/> : <ArrowDown size={12}/>)}
                            </button>
                            <button onClick={() => handleSortClick('client')} className={`py-1.5 rounded border flex items-center justify-center gap-1 font-bold ${workSort.key === 'client' ? 'bg-blue-100 text-blue-700 border-blue-300' : 'bg-white text-gray-600'}`}>
                                Klant {workSort.key === 'client' && (workSort.dir === 'asc' ? <ArrowUp size={12}/> : <ArrowDown size={12}/>)}
                            </button>
                            <button onClick={() => handleSortClick('project')} className={`py-1.5 rounded border flex items-center justify-center gap-1 font-bold ${workSort.key === 'project' ? 'bg-blue-100 text-blue-700 border-blue-300' : 'bg-white text-gray-600'}`}>
                                Project {workSort.key === 'project' && (workSort.dir === 'asc' ? <ArrowUp size={12}/> : <ArrowDown size={12}/>)}
                            </button>
                            <button onClick={() => handleSortClick('city')} className={`py-1.5 rounded border flex items-center justify-center gap-1 font-bold ${workSort.key === 'city' ? 'bg-blue-100 text-blue-700 border-blue-300' : 'bg-white text-gray-600'}`}>
                                Plaats {workSort.key === 'city' && (workSort.dir === 'asc' ? <ArrowUp size={12}/> : <ArrowDown size={12}/>)}
                            </button>
                        </div>
                    </div>

                    {/* De Lijst (Bijgewerkt met Projectnaam) */}
                    <div className="p-0 overflow-y-auto flex-grow bg-gray-50">
                        {isLoadingWork ? (
                            <div className="p-8 text-center text-gray-500 flex flex-col items-center gap-2">
                                <RefreshCw className="animate-spin text-blue-600" size={24}/>
                                <span>Opdrachten ophalen...</span>
                            </div>
                        ) : processedWork.length === 0 ? (
                            <div className="p-8 text-center text-gray-400 italic">
                                Geen opdrachten gevonden.
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200 bg-white">
                                {processedWork.map(job => (
                                    <button 
                                        key={job.id} 
                                        onClick={() => loadWorkOrder(job)} 
                                        className="w-full text-left p-4 hover:bg-blue-50 transition flex justify-between items-center group"
                                    >
                                        <div className="flex-grow min-w-0 pr-4">
                                            <div className="flex justify-between items-start">
                                                <div className="font-bold text-gray-800 truncate">
                                                    {job.client_name}
                                                    <span className="block text-xs font-normal text-blue-600 italic truncate">
                                                        {job.report_data?.meta?.projectLocation || 'Geen projectnaam'}
                                                    </span>
                                                </div>
                                                {job.inspection_number && <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded border text-gray-500 font-mono ml-2 shrink-0">{job.inspection_number}</span>}
                                            </div>
                                            <div className="text-[11px] text-gray-500 flex items-center gap-3 mt-1">
                                                <span className="flex items-center gap-1"><Calendar size={12}/> {job.report_data?.meta?.date || 'N.t.b.'}</span>
                                                <span className="flex items-center gap-1 truncate"><MapPin size={12}/> {job.report_data?.meta?.projectCity || 'Onbekend'}</span>
                                            </div>
                                        </div>
                                        <div className="text-blue-600 opacity-0 group-hover:opacity-100 font-bold text-xs whitespace-nowrap bg-blue-50 px-2 py-1 rounded">
                                            Starten →
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    <div className="p-3 bg-gray-100 text-xs text-center text-gray-400 border-t">
                        Totaal: {processedWork.length} opdracht(en)
                    </div>
                </div>
            </div>
        )}

               <div className={`bg-gray-50 p-4 rounded border ${meta.isContributionMode ? 'opacity-70 pointer-events-none' : ''}`}>
                 <h2 className="text-sm font-bold text-emerald-700 uppercase border-b border-emerald-200 pb-2 mb-3">Opdrachtgever</h2>
                 {/* Google Places zoeker */}
                 {!meta.isContributionMode && (
                   <div className="relative mb-3">
                     <div className="flex gap-1.5">
                       <input type="text" placeholder="Zoek opdrachtgever via Google..." className="flex-1 border rounded p-2 text-sm bg-white"
                         value={clientPlacesQuery} onChange={e => setClientPlacesQuery(e.target.value)}
                         onKeyDown={e => e.key === 'Enter' && searchClientPlaces(clientPlacesQuery)} />
                       <button onClick={() => searchClientPlaces(clientPlacesQuery)} disabled={clientIsSearchingPlaces}
                         className="px-3 bg-blue-600 text-white rounded text-sm font-bold hover:bg-blue-700 disabled:opacity-50 shrink-0">
                         {clientIsSearchingPlaces ? <RefreshCw size={14} className="animate-spin"/> : <Search size={14}/>}
                       </button>
                     </div>
                     {clientPlacesResults.length > 0 && (
                       <div className="absolute z-50 left-0 right-0 top-full mt-0.5 bg-white border rounded shadow-lg max-h-48 overflow-y-auto">
                         {clientPlacesResults.map((p, i) => {
                           const parsed = parsePlaceResult(p);
                           return (
                             <button key={i} className="w-full text-left px-3 py-2 hover:bg-blue-50 text-sm border-b last:border-0"
                               onClick={() => {
                                 setMeta({ clientName: parsed.name, clientAddress: parsed.address, clientPostalCode: parsed.postalCode, clientCity: parsed.city, clientPhone: parsed.phone });
                                 setClientPlacesResults([]); setClientPlacesQuery('');
                               }}>
                               <div className="font-bold text-gray-800">{parsed.name}</div>
                               <div className="text-xs text-gray-500">{p.formattedAddress}</div>
                             </button>
                           );
                         })}
                         <button className="w-full text-center text-xs text-gray-400 py-1 hover:bg-gray-50" onClick={() => setClientPlacesResults([])}>Sluiten</button>
                       </div>
                     )}
                   </div>
                 )}
                 <div className="grid grid-cols-1 gap-3">
                   <div className="relative">
                     <input className="border rounded p-2 w-full" list="inspector-client-suggestions" placeholder="Naam (kies of typ)" value={meta.clientName}
                       onChange={(e) => {
                         const val = e.target.value;
                         const match = appClients.find(c => c.name === val);
                         if (match) {
                           setMeta({ clientName: val, clientAddress: match.address || '', clientPostalCode: match.postal_code || '', clientCity: match.city || '', clientPhone: match.phone || '', clientEmail: match.email || '' });
                         } else {
                           setMeta({ clientName: val });
                         }
                       }} />
                     <datalist id="inspector-client-suggestions">
                       {clientSuggestions.map((s, i) => <option key={i} value={s.name} />)}
                     </datalist>
                   </div>
                   <input className="border rounded p-2" placeholder="Adres" value={meta.clientAddress} onChange={(e) => setMeta({ clientAddress: e.target.value })} />
                   <div className="flex gap-2"><input className="border rounded p-2 w-1/3" placeholder="Postcode" value={meta.clientPostalCode} onChange={(e) => setMeta({ clientPostalCode: e.target.value })} /><input className="border rounded p-2 w-2/3" placeholder="Plaats" value={meta.clientCity} onChange={(e) => setMeta({ clientCity: e.target.value })} /></div>
                   <input className="border rounded p-2" placeholder="Contactpersoon" value={meta.clientContactPerson} onChange={(e) => setMeta({ clientContactPerson: e.target.value })} />
                   <input className="border rounded p-2" placeholder="Telefoon" value={meta.clientPhone} onChange={(e) => setMeta({ clientPhone: e.target.value })} />
                   <input className="border rounded p-2" placeholder="Email" value={meta.clientEmail} onChange={(e) => setMeta({ clientEmail: e.target.value })} />
                 </div>
               </div>
               
               <div className={`bg-gray-50 p-4 rounded border ${meta.isContributionMode ? 'opacity-70 pointer-events-none' : ''}`}>
                   <h2 className="text-sm font-bold text-emerald-700 uppercase border-b border-emerald-200 pb-2 mb-3">Projectgegevens</h2>
                   {/* Google Places zoeker */}
                   {!meta.isContributionMode && (
                     <div className="relative mb-3">
                       <div className="flex gap-1.5">
                         <input type="text" placeholder="Zoek locatie via Google..." className="flex-1 border rounded p-2 text-sm bg-white"
                           value={projectPlacesQuery} onChange={e => setProjectPlacesQuery(e.target.value)}
                           onKeyDown={e => e.key === 'Enter' && searchProjectPlaces(projectPlacesQuery)} />
                         <button onClick={() => searchProjectPlaces(projectPlacesQuery)} disabled={projectIsSearchingPlaces}
                           className="px-3 bg-blue-600 text-white rounded text-sm font-bold hover:bg-blue-700 disabled:opacity-50 shrink-0">
                           {projectIsSearchingPlaces ? <RefreshCw size={14} className="animate-spin"/> : <Search size={14}/>}
                         </button>
                       </div>
                       {projectPlacesResults.length > 0 && (
                         <div className="absolute z-50 left-0 right-0 top-full mt-0.5 bg-white border rounded shadow-lg max-h-48 overflow-y-auto">
                           {projectPlacesResults.map((p, i) => {
                             const parsed = parsePlaceResult(p);
                             return (
                               <button key={i} className="w-full text-left px-3 py-2 hover:bg-blue-50 text-sm border-b last:border-0"
                                 onClick={() => {
                                   setMeta({ projectLocation: parsed.name, projectAddress: parsed.address, projectPostalCode: parsed.postalCode, projectCity: parsed.city, projectPhone: parsed.phone });
                                   setProjectPlacesResults([]); setProjectPlacesQuery('');
                                 }}>
                                 <div className="font-bold text-gray-800">{parsed.name}</div>
                                 <div className="text-xs text-gray-500">{p.formattedAddress}</div>
                               </button>
                             );
                           })}
                           <button className="w-full text-center text-xs text-gray-400 py-1 hover:bg-gray-50" onClick={() => setProjectPlacesResults([])}>Sluiten</button>
                         </div>
                       )}
                     </div>
                   )}
                   <div className="grid grid-cols-1 gap-3">
                       <input className="border rounded p-2" placeholder="Locatie" value={meta.projectLocation} onChange={(e) => setMeta({ projectLocation: e.target.value })} />
                       <input className="border rounded p-2" placeholder="Adres" value={meta.projectAddress} onChange={(e) => setMeta({ projectAddress: e.target.value })} />
                       <div className="flex gap-2"><input className="border rounded p-2 w-1/3" placeholder="Postcode" value={meta.projectPostalCode} onChange={(e) => setMeta({ projectPostalCode: e.target.value })} /><input className="border rounded p-2 w-2/3" placeholder="Plaats" value={meta.projectCity} onChange={(e) => setMeta({ projectCity: e.target.value })} /></div>
                       <input className="border rounded p-2" placeholder="Contactpersoon" value={meta.projectContactPerson} onChange={(e) => setMeta({ projectContactPerson: e.target.value })} />
                       <input className="border rounded p-2" placeholder="Telefoon" value={meta.projectPhone} onChange={(e) => setMeta({ projectPhone: e.target.value })} />
                       <input className="border rounded p-2" placeholder="Email" value={meta.projectEmail} onChange={(e) => setMeta({ projectEmail: e.target.value })} />
                       <input className="border rounded p-2" placeholder="Installatieverantwoordelijke (IV'er)" value={meta.installationResponsible} onChange={(e) => setMeta({ installationResponsible: e.target.value })} />
                       
                       <div className="flex gap-2 items-center"><input className="border rounded p-2 flex-grow" placeholder="ID Bagviewer" value={meta.idBagviewer} onChange={(e) => setMeta({ idBagviewer: e.target.value })} /><button onClick={handleBagSearch} disabled={isSearchingBag} className="bg-emerald-600 text-white p-2 rounded hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-1 text-sm font-bold whitespace-nowrap">{isSearchingBag ? '...' : <><Search size={16} /> Zoek ID</>}</button></div>
                       <div className="mt-4 border-t border-emerald-200 pt-4">
                           <label className="block text-xs font-bold text-emerald-800 uppercase mb-2">Foto voorblad rapport</label>
                           <div className="flex gap-4 items-center">
                               <label className="bg-emerald-600 text-white px-4 py-2 rounded cursor-pointer flex items-center gap-2 text-sm font-bold hover:bg-emerald-700 transition shadow-sm">
                                   {isUploading ? <RefreshCw className="animate-spin" size={18}/> : <Camera size={18} />}
                                   <span>{isUploading ? 'Uploaden...' : 'Foto maken/kiezen'}</span>
                                   <input type="file" accept="image/*" className="hidden" onChange={handleLocationPhoto} disabled={isUploading} />
                               </label>
                               {meta.locationPhotoUrl && <img src={meta.locationPhotoUrl} className="h-20 w-20 object-cover rounded-lg border-2 border-emerald-500" alt="Voorblad" />}
                           </div>
                       </div>
                   </div>
               </div>

               <div className={`bg-gray-50 p-4 rounded border ${meta.isContributionMode ? 'opacity-70 pointer-events-none' : ''}`}><h2 className="text-sm font-bold text-emerald-700 uppercase border-b border-emerald-200 pb-2 mb-3">Gebruiksfunctie</h2><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="space-y-2">{usageOptionsLeft.map(opt => (<label key={opt.key} className="flex items-center space-x-2 cursor-pointer p-1 hover:bg-emerald-50 rounded"><input type="checkbox" checked={meta.usageFunctions[opt.key]} onChange={(e) => setUsageFunction(opt.key, e.target.checked)} className="h-4 w-4 text-emerald-600 rounded" /><span className="text-sm text-gray-700">{opt.label}</span></label>))}</div><div className="space-y-2">{usageOptionsRight.map(opt => (<label key={opt.key} className="flex items-center space-x-2 cursor-pointer p-1 hover:bg-emerald-50 rounded"><input type="checkbox" checked={meta.usageFunctions[opt.key]} onChange={(e) => setUsageFunction(opt.key, e.target.checked)} className="h-4 w-4 text-emerald-600 rounded" /><span className="text-sm text-gray-700">{opt.label}</span></label>))}</div></div></div>
               
               <div className="bg-gray-50 p-4 rounded border">
                   <h2 className="text-sm font-bold text-emerald-700 uppercase border-b border-emerald-200 pb-2 mb-3">Inspectiebedrijf</h2>
                   {/* Google Places zoeking */}
                   {!meta.isContributionMode && (
                     <div className="relative mb-3">
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
                               <button key={i} className="w-full text-left px-3 py-2 hover:bg-blue-50 text-sm border-b last:border-0"
                                 onClick={() => {
                                   setMeta({ inspectionCompany: parsed.name, inspectionCompanyAddress: parsed.address, inspectionCompanyPostalCode: parsed.postalCode, inspectionCompanyCity: parsed.city, inspectionCompanyPhone: parsed.phone, inspectionCompanyEmail: '' });
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
                   )}
                   <div className="grid grid-cols-1 gap-3">
                       <ClearableInput
                           list="companies-list" 
                           className={`border rounded p-2 w-full ${meta.isContributionMode ? 'bg-gray-100' : ''}`} 
                           disabled={meta.isContributionMode} 
                           placeholder="Bedrijfsnaam (Kies of Typ)" 
                           value={meta.inspectionCompany} 
                           onChange={(e: any) => {
                               const val = e.target.value;
                               setMeta({ inspectionCompany: val });
                               const dbMatch = dbCompanies.find(c => c.label === val);
                               if (dbMatch && dbMatch.data) {
                                   setMeta({
                                       inspectionCompany: val,
                                       inspectionCompanyAddress: dbMatch.data.address || '',
                                       inspectionCompanyPostalCode: dbMatch.data.postalCode || '',
                                       inspectionCompanyCity: dbMatch.data.city || '',
                                       inspectionCompanyPhone: dbMatch.data.phone || '',
                                       inspectionCompanyEmail: dbMatch.data.email || ''
                                   });
                                   return;
                               }
                               const c = COMPANIES.find(x => x.name === val);
                               if (c) setMeta({ inspectionCompany: c.name, inspectionCompanyAddress: c.address, inspectionCompanyPostalCode: c.postalCode, inspectionCompanyCity: c.city, inspectionCompanyPhone: c.phone, inspectionCompanyEmail: c.email });
                           }} 
                       />
                       <datalist id="companies-list">
                           {[...dbCompanies.map(c => c.label), ...COMPANIES.map(c => c.name)].map((name, i) => <option key={i} value={name} />)}
                       </datalist>

                       <input className="border rounded p-2" placeholder="Adres" value={meta.inspectionCompanyAddress} onChange={(e) => setMeta({ inspectionCompanyAddress: e.target.value })} />
                       <div className="flex gap-2"><input className="border rounded p-2 w-1/3" placeholder="Postcode" value={meta.inspectionCompanyPostalCode} onChange={(e) => setMeta({ inspectionCompanyPostalCode: e.target.value })} /><input className="border rounded p-2 w-2/3" placeholder="Plaats" value={meta.inspectionCompanyCity} onChange={(e) => setMeta({ inspectionCompanyCity: e.target.value })} /></div>
                       <input className="border rounded p-2" placeholder="Tel" value={meta.inspectionCompanyPhone} onChange={(e) => setMeta({ inspectionCompanyPhone: e.target.value })} />
                       <input className="border rounded p-2" placeholder="Email" value={meta.inspectionCompanyEmail} onChange={(e) => setMeta({ inspectionCompanyEmail: e.target.value })} />
                   </div>

                   <div className="mt-4 pt-4 border-t border-emerald-200">
                       <h2 className="text-sm font-bold text-emerald-700 uppercase mb-2">Inspecteur</h2>
                       <div className="grid grid-cols-1 gap-3">
                           <ClearableInput
                               list="inspectors-list"
                               className="border rounded p-2 w-full"
                               placeholder="Naam Inspecteur"
                               value={meta.inspectorName}
                               onChange={(e: any) => {
                                   const val = e.target.value;
                                   setMeta({ inspectorName: val });
                                   const profileMatch = inspectorProfiles.find(p => p.full_name === val);
                                   if (profileMatch) {
                                       setMeta({ inspectorName: val, sciosRegistrationNumber: profileMatch.scios_nr || '' });
                                   }
                               }}
                           />
                           <datalist id="inspectors-list">
                               {inspectorProfiles.map((p, i) => <option key={i} value={p.full_name} />)}
                           </datalist>

                           <input className="border rounded p-2" placeholder="SCIOS Nr" value={meta.sciosRegistrationNumber} onChange={(e) => setMeta({ sciosRegistrationNumber: e.target.value })} />
                           <input className="border rounded p-2" type="date" value={meta.date} onChange={(e) => setMeta({ date: e.target.value })} />
                       </div>
                   </div>
               </div>
               {/* TOTAAL AANTAL COMPONENTEN (MOET NOG BINNEN DE SETUP TAB) */}
               <div className="bg-blue-50 p-4 rounded border border-blue-100">
                   <label className="text-xs font-bold text-blue-800 uppercase">Totaal aantal componenten</label>
                   <input 
                       type="number" 
                       className="border rounded p-3 w-full mt-1 bg-white" 
                       value={meta.totalComponents || ''} 
                       onChange={(e) => setMeta({ totalComponents: parseInt(e.target.value) || 0 })} 
                       placeholder="0"
                   />
                   {meta.totalComponents > 0 && (
                       <p className="text-xs text-blue-600 mt-2 font-bold">
                           Steekproef: inspecteer {sampleSize} items.
                       </p>
                   )}
               </div>
            </div>
          )}
          
          {activeTab === 'measure' && (
            <div className="space-y-4">
                <h2 className="text-lg font-bold text-gray-700 border-b pb-2">Metingen & Beproevingen</h2>
                
                <div className="bg-blue-50 p-4 rounded border border-blue-100 mb-4">
                <label className="block text-xs font-bold text-blue-800 uppercase mb-2">Gebruikte Meetinstrumenten</label>
                <div className="flex gap-2 mb-3">
                    <select className="border rounded p-2 w-full bg-white" value={selectedInstrumentId} onChange={(e) => {
                        const id = e.target.value;
                        const inst = [...tier1, ...tier2, ...tier3].find(i => i.id === id);
                        if (inst) { addInstrument(inst); incrementUsage(inst.id); setSelectedInstrumentId(''); }
                    }}>
                        <option value="" disabled>-- Selecteer Meetinstrument --</option>
                        {tier1.length > 0 && <optgroup label="⭐ Mijn Koffer">{tier1.map(i => <option key={i.id} value={i.id}>{i.name} (SN: {i.serialNumber || 'Onbekend'})</option>)}</optgroup>}
                        {tier2.length > 0 && <optgroup label="🕐 Eerder Gebruikt">{tier2.map(i => <option key={i.id} value={i.id}>{i.name} (SN: {i.serialNumber || 'Onbekend'})</option>)}</optgroup>}
                        {tier3.length > 0 && <optgroup label="Alle Instrumenten">{tier3.map(i => <option key={i.id} value={i.id}>{i.name} (SN: {i.serialNumber || 'Onbekend'})</option>)}</optgroup>}
                    </select>
                    <button onClick={() => { setShowNewInstrumentForm(true); setNewInstSearchQuery(''); setShowCreatePhase(false); setNewInstName(''); setNewInstSn(''); setNewInstDate(''); }} className="bg-blue-600 text-white p-2 rounded whitespace-nowrap flex items-center gap-1 text-sm font-bold"><PlusCircle size={16} /> Nieuw</button>
                </div>
            {showNewInstrumentForm && (
                <div className="bg-white p-3 rounded border border-blue-200 mb-3 animate-fadeIn">
                    <h3 className="text-[10px] font-bold text-blue-800 uppercase mb-2">Instrument toevoegen</h3>
                    {/* Fase 1: Zoeken */}
                    <input className="border p-2 rounded text-sm w-full mb-2" placeholder="Zoek bestaand instrument op naam of serienummer..." value={newInstSearchQuery} onChange={e => { setNewInstSearchQuery(e.target.value); setShowCreatePhase(false); }} autoFocus />
                    {newInstSearchQuery.trim().length > 0 && (() => {
                        const q = newInstSearchQuery.trim().toLowerCase();
                        const matches = allInstruments.filter(i => i.name.toLowerCase().includes(q) || i.serialNumber.toLowerCase().includes(q));
                        return (
                            <div className="mb-2">
                                {matches.length > 0 ? (
                                    <div className="border rounded divide-y max-h-40 overflow-y-auto mb-2">
                                        {matches.map(i => (
                                            <button key={i.id} onClick={() => { addInstrument(i); linkInstrument(Number(i.id)); incrementUsage(i.id); setShowNewInstrumentForm(false); setNewInstSearchQuery(''); }} className="w-full text-left px-3 py-2 hover:bg-blue-50 transition-colors">
                                                <span className="font-medium text-sm">{i.name}</span> <span className="text-xs text-gray-500">(SN: {i.serialNumber || 'Onbekend'})</span>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-500 italic mb-2">Geen bestaand instrument gevonden.</p>
                                )}
                                {!showCreatePhase && (
                                    <button onClick={() => { setShowCreatePhase(true); setNewInstName(newInstSearchQuery.trim()); }} className="text-xs text-blue-600 underline hover:text-blue-800">Niets gevonden? Nieuw instrument aanmaken →</button>
                                )}
                            </div>
                        );
                    })()}
                    {/* Fase 2: Aanmaken (alleen na expliciete klik) */}
                    {showCreatePhase && (
                        <div className="border-t pt-3 mt-1 animate-fadeIn">
                            <p className="text-[10px] font-bold text-blue-700 uppercase mb-2">Nieuw instrument aanmaken in database</p>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
                                <input className="border p-2 rounded text-sm w-full md:col-span-1" placeholder="Naam" value={newInstName} onChange={e => setNewInstName(e.target.value)} />
                                <input className="border p-2 rounded text-sm w-full md:col-span-1" placeholder="Serienummer" value={newInstSn} onChange={e => setNewInstSn(e.target.value)} />
                                <div className="flex gap-1 w-full md:col-span-2">
                                    <input className="border p-2 rounded text-sm bg-white flex-grow min-w-0" type={(newInstDate === 'Indicatief' || newInstDate === 'n.v.t.') ? 'text' : 'date'} placeholder="Kalibratie-/ controledatum" value={newInstDate} max="2100-12-31" onChange={e => { const val = e.target.value; if (val.length <= 10) setNewInstDate(val); }} onBlur={e => { if (e.target.value.startsWith('000')) setNewInstDate(''); }} disabled={newInstDate === 'Indicatief' || newInstDate === 'n.v.t.'} title="Kalibratie-/ controledatum" />
                                    <select className="border p-2 rounded text-sm bg-white cursor-pointer shrink-0" onChange={e => { if (e.target.value === 'date') setNewInstDate(''); else setNewInstDate(e.target.value); }} value={(newInstDate === 'Indicatief' || newInstDate === 'n.v.t.') ? newInstDate : 'date'}>
                                        <option value="date">Datum</option>
                                        <option value="Indicatief">Indicatief</option>
                                        <option value="n.v.t.">n.v.t.</option>
                                    </select>
                                </div>
                            </div>
                            <button onClick={() => handleCreateInstrumentFromMetingen()} className="w-full bg-green-600 text-white py-2 rounded text-xs font-bold hover:bg-green-700 shadow-sm transition-colors">Aanmaken in database &amp; toevoegen aan meting</button>
                        </div>
                    )}
                    <button onClick={() => { setShowNewInstrumentForm(false); setNewInstSearchQuery(''); setShowCreatePhase(false); setNewInstName(''); setNewInstSn(''); setNewInstDate(''); }} className="mt-2 w-full bg-gray-100 text-gray-600 py-2 rounded text-xs font-bold hover:bg-gray-200 transition-colors">Annuleren</button>
                </div>
            )}

                <div className="space-y-2 mt-2">
                    {measurements.selectedInstruments.map(inst => {
                        const status = getCalibrationStatus(inst.calibrationDate);
                        return (
                            <div key={inst.id} className={`flex justify-between items-center p-3 rounded border shadow-sm transition-colors ${status === 'expired' ? 'bg-red-50 border-red-200' : status === 'warning' ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-200'}`}>
                                <div className="flex items-center gap-3">
                                    <CheckSquare size={18} className={status === 'expired' ? 'text-red-600' : 'text-emerald-600'} />
                                    <div>
                                        <div className="font-bold text-sm text-gray-800">{inst.name}</div>
                                        <div className="text-xs text-gray-500 italic">
                                            SN: {inst.serialNumber || 'Onbekend'} | Kalibratie-/ controledatum: <span className={status === 'expired' ? 'text-red-600 font-bold' : status === 'warning' ? 'text-orange-600 font-bold' : 'text-gray-700'}>{inst.calibrationDate || 'Onbekend'}</span>
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => removeInstrument(inst.id)} 
                                    className="text-red-400 hover:text-red-600 p-2 transition-colors"
                                    title="Instrument verwijderen"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        );
                    })}
                </div>
                
                </div>

                <div className={`grid grid-cols-2 gap-4 p-4 rounded border ${meta.isContributionMode ? 'bg-gray-50 border-gray-200' : 'bg-white border-emerald-100'}`}>
                    <div className="col-span-2">
                        <h3 className="text-xs font-bold text-emerald-700 uppercase mb-2">Algemene Installatiegegevens</h3>
                    </div>
                    
                    {/* STROOMSTELSEL */}
                    <div>
                        <label className="block text-xs text-gray-500 italic mb-1">Stroomstelsel</label>
                        <div className="relative w-full">
                            <select 
                                disabled={meta.isContributionMode} 
                                className="border rounded px-3 w-full bg-white h-11 focus:outline-none focus:ring-2 focus:ring-emerald-500" 
                                value={measurements.installationType} 
                                onChange={(e) => setMeasurements({installationType: e.target.value})}
                            >
                                <option value="TT">TT-Stelsel</option>
                                <option value="TN-S">TN-S</option>
                                <option value="TN-C-S">TN-C-S</option>
                            </select>
                        </div>
                    </div>

                    {/* VOORBEVEILIGING */}
                    <div>
                        <label className="block text-xs text-gray-500 italic mb-1">Voorbeveiliging</label>
                        <ClearableInput 
                            list="fuses-list"
                            // HIER OOK h-11 TOEGEVOEGD VOOR GELIJKE HOOGTE
                            className="border rounded px-3 w-full bg-white h-11 focus:outline-none focus:ring-2 focus:ring-emerald-500" 
                            disabled={meta.isContributionMode} 
                            value={measurements.mainFuse} 
                            onChange={(e: any) => setMeasurements({mainFuse: e.target.value})} 
                            placeholder="Kies of typ..." 
                        />
                        <datalist id="fuses-list">
                            {FUSE_OPTIONS.map(f => <option key={f} value={f} />)}
                        </datalist>
                    </div>
                </div>

                <div className="space-y-4 pt-4">
                <div className="flex justify-between items-center border-b border-emerald-200 pb-2">
                    <h3 className="font-bold text-emerald-800">Metingen per Verdeelinrichting</h3>
                    <button onClick={() => addBoard({ id: generateId(), name: '', switchboardTemp: '20', insulationResistance: '999', impedance: '0.35' })} className="bg-emerald-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 hover:bg-emerald-700 transition shadow-sm">
                      <PlusCircle size={14} /> Verdeler Toevoegen
                    </button>
                </div>

                {measurements.boards.map((board, index) => (
                    <div key={board.id} className="bg-white border border-emerald-200 rounded-lg shadow-sm overflow-hidden animate-fadeIn">
                    <div className="bg-emerald-50 px-4 py-2 border-b border-emerald-100 flex justify-between items-center">
                        <span className="text-xs font-bold text-emerald-700 uppercase">Verdeelinrichting #{index + 1}</span>
                        {measurements.boards.length > 1 && (
                          <button onClick={() => { if(window.confirm("Verwijder deze meting?")) removeBoard(board.id); }} className="text-red-400 hover:text-red-600"><Trash2 size={16}/></button>
                        )}
                    </div>
                    <div className="p-4 space-y-3">
                        <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Naam / Locatie Kast</label>
                        <input className="w-full border-b border-gray-200 p-1 focus:border-emerald-500 outline-none font-bold" placeholder="Bijv. HVK Begane Grond" value={board.name} onChange={(e) => updateBoard(board.id, { ...board, name: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                        <div><label className="text-[10px] font-bold text-gray-400 uppercase block">Temp (°C)</label><input type="number" className="w-full border rounded p-2 text-sm bg-gray-50" value={board.switchboardTemp} onChange={(e) => updateBoard(board.id, { ...board, switchboardTemp: e.target.value })} onWheel={(e) => (e.target as HTMLInputElement).blur()} /></div>
                        <div><label className="text-[10px] font-bold text-gray-400 uppercase block">Riso (MΩ)</label><input type="number" className="w-full border rounded p-2 text-sm bg-gray-50" value={board.insulationResistance} onChange={(e) => updateBoard(board.id, { ...board, insulationResistance: e.target.value })} onWheel={(e) => (e.target as HTMLInputElement).blur()} /></div>
                        <div><label className="text-[10px] font-bold text-gray-400 uppercase block">Zi (Ω)</label><input type="number" step="0.01" className="w-full border rounded p-2 text-sm bg-gray-50" value={board.impedance} onChange={(e) => updateBoard(board.id, { ...board, impedance: e.target.value })} onWheel={(e) => (e.target as HTMLInputElement).blur()} /></div>
                        </div>
                    </div>
                    </div>
                ))}
                </div>
            </div>
            )}

          {activeTab === 'inspect' && (
            <div className="space-y-6">
              <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-5">
                <h3 className="font-bold text-gray-800 mb-4">{editingId ? 'Gebrek Bewerken' : 'Nieuw Gebrek Melden'}</h3>
                <div className="space-y-4">
                  <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Locatie</label><input className="w-full border rounded p-2" placeholder="Bijv. Meterkast" value={location} onChange={(e) => setLocation(e.target.value)}/></div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">1. Hoofdcategorie</label>
                    {isCreatingCategory ? (
                      <div className="flex gap-2 animate-fadeIn">
                        <input className="w-full border rounded p-2 border-emerald-500 bg-emerald-50" placeholder="Nieuwe categorie..." value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} autoFocus />
                        <button onClick={() => {setIsCreatingCategory(false); setSelectedMainCategory('');}} className="p-2 text-gray-500 hover:text-red-500 border rounded hover:bg-gray-100"><X size={20}/></button>
                      </div>
                    ) : (
                      <select className="w-full border rounded p-2 bg-gray-50" value={selectedMainCategory} onChange={(e) => handleMainCategoryChange(e.target.value)}>
                        <option value="">-- Kies Hoofdcategorie --</option>
                        {mainCategories.map(c => <option key={c} value={c}>{c}</option>)}
                        <option value="NEW" className="font-bold text-emerald-600">+ Nieuwe Categorie...</option>
                      </select>
                    )}
                  </div>

                  {!isCreatingCategory && selectedMainCategory && (<div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">2. Subcategorie</label><select className="w-full border rounded p-2" value={selectedSubCategory} onChange={(e) => handleSubCategoryChange(e.target.value)}><option value="">-- Kies Subcategorie --</option>{subCategories.map(s => <option key={s} value={s}>{s}</option>)}</select></div>)}
                  {!isCreatingCategory && selectedSubCategory && (<div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">3. Soort Gebrek</label><select className="w-full border rounded p-2" value={isCustomDefect ? 'CUSTOM' : selectedLibId} onChange={(e) => handleDefectChange(e.target.value)}><option value="" disabled>-- Kies Gebrek --</option><option value="CUSTOM" className="font-bold text-blue-600">--- Maatwerk ---</option>{filteredDefects.map(d => <option key={d.id} value={d.id}>{d.shortName}</option>)}</select></div>)}

                  {(selectedLibId || isCustomDefect) && (
                    <div className="space-y-4 animate-fadeIn pt-2">
                        {!isCustomDefect && staticDescription && (<div className="w-full border rounded p-3 bg-gray-100 text-gray-700 text-sm whitespace-pre-wrap">{staticDescription}</div>)}
                        <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">{isCustomDefect ? 'Omschrijving Gebrek' : 'Aanvullende Toelichting'}</label><textarea className={`w-full border rounded p-2 h-24 ${isCustomDefect ? 'border-blue-300 bg-blue-50' : ''}`} placeholder="Details..." value={customComment} onChange={(e) => setCustomComment(e.target.value)} /></div>
                        {isCustomDefect && (<div className="bg-blue-50 p-4 rounded border border-blue-100 space-y-4"><div><label className="block text-xs font-bold text-gray-500 uppercase mb-2">Classificatie</label><div className="flex gap-2">{(['Red', 'Orange', 'Yellow', 'Blue'] as Classification[]).map(c => (<button key={c} onClick={() => setCustomClassification(c)} className={`flex-1 py-2 rounded text-xs font-bold border transition-all ${customClassification === c ? (c === 'Red' ? 'bg-red-600 text-white' : 'bg-white') : 'bg-white'}`}>{c}</button>))}</div></div></div>)}
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <label className="flex-1 bg-gray-100 p-3 rounded cursor-pointer flex justify-center border hover:bg-gray-200"><Camera size={20} /><input type="file" accept="image/*" className="hidden" onChange={(e) => onDefectPhoto(e, 1)}/></label>
                    {defectPhoto1 && <img src={defectPhoto1} className="w-12 h-12 object-cover rounded border" />}
                    <label className="flex-1 bg-gray-100 p-3 rounded cursor-pointer flex justify-center border hover:bg-gray-200"><Camera size={20} /><input type="file" accept="image/*" className="hidden" onChange={(e) => onDefectPhoto(e, 2)}/></label>
                    {defectPhoto2 && <img src={defectPhoto2} className="w-12 h-12 object-cover rounded border" />}
                  </div>

                  <div className="flex gap-2 pt-2">
                    {editingId && (<button onClick={() => setEditingId(null)} className="flex-1 bg-gray-400 text-white py-3 rounded font-bold">Annuleren</button>)}
                    <button onClick={handleSaveDefect} disabled={!location || isUploading} className="flex-1 bg-emerald-600 text-white py-3 rounded font-bold">{isUploading ? 'Wacht...' : 'Opslaan'}</button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {defects.map((d, i) => {
                  const borderColor = d.classification === 'Red' ? '#ef4444' : d.classification === 'Orange' || d.classification === 'Amber' ? '#f97316' : d.classification === 'Blue' ? '#3b82f6' : '#eab308';
                  return (
                    <div
                      key={d.id}
                      draggable
                      onDragStart={() => setDefectDragIdx(i)}
                      onDragOver={e => { e.preventDefault(); setDefectDragOverIdx(i); }}
                      onDragEnd={() => { setDefectDragIdx(null); setDefectDragOverIdx(null); }}
                      onDrop={() => {
                        if (defectDragIdx === null || defectDragIdx === i) return;
                        const next = [...defects];
                        const [moved] = next.splice(defectDragIdx, 1);
                        next.splice(i, 0, moved);
                        reorderDefects(next);
                        setDefectDragIdx(null); setDefectDragOverIdx(null);
                      }}
                      className={`bg-white border-l-4 shadow-sm p-3 rounded flex items-start gap-2 group select-none transition-all ${defectDragOverIdx === i && defectDragIdx !== i ? 'ring-2 ring-emerald-400 ring-offset-1' : ''}`}
                      style={{ borderColor, cursor: 'grab', opacity: defectDragIdx === i ? 0.5 : 1 }}
                    >
                      <GripVertical size={16} className="text-gray-300 mt-1 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-gray-800 text-sm">{i + 1}. {d.location}</div>
                        <p className="text-xs text-gray-500 whitespace-pre-wrap mt-0.5 line-clamp-2">{d.description}</p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 shrink-0">
                        <button onClick={() => handleStartEdit(d)} className="p-1.5 text-gray-400 hover:text-blue-600"><Pencil size={15} /></button>
                        <button onClick={() => removeDefect(d.id)} className="p-1.5 text-gray-400 hover:text-red-600"><Trash2 size={15} /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'report' && (
            <div className="text-center py-6 space-y-6">
              {!meta.isContributionMode && (
                <div className="bg-indigo-50 p-4 rounded border border-indigo-100 text-left">
                  <h3 className="font-bold text-indigo-800 border-b border-indigo-200 pb-2 mb-3 flex items-center gap-2"><Calendar size={18}/> Advies Inspectiefrequentie</h3>
                  <div className="space-y-4">
                    <div><label className="block text-sm font-bold text-gray-700 mb-1">Interval:</label><div className="flex gap-4"><label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="interval" checked={meta.inspectionInterval === 3} onChange={() => setMeta({ inspectionInterval: 3 })} /> 3 Jaar</label><label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="interval" checked={meta.inspectionInterval === 5} onChange={() => setMeta({ inspectionInterval: 5 })} /> 5 Jaar</label></div></div>
                    <div className="bg-white p-2 rounded border"><span className="text-xs text-gray-500 block">Volgende inspectie uiterlijk:</span><span className="font-bold text-indigo-600">{meta.nextInspectionDate}</span></div>
                  </div>
                </div>
              )}
              
              <div className="bg-white p-4 rounded shadow-sm border">
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Handtekening Inspecteur</h3>
                {!meta.signatureUrl ? (
                  <div className="border border-gray-300 rounded bg-gray-50">
                    <SignatureCanvas ref={sigPad} canvasProps={{width: 300, height: 150, className: 'mx-auto cursor-crosshair'}} />
                    <div className="border-t flex justify-end p-2 gap-2"><button onClick={clearSignature} className="text-xs text-red-500 font-bold">Wissen</button><button onClick={saveSignature} className="text-xs bg-emerald-600 text-white px-3 py-1 rounded font-bold">Opslaan</button></div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center"><img src={meta.signatureUrl} className="border h-24 mb-2" /><button onClick={() => setMeta({signatureUrl: ''})} className="text-xs text-red-500 underline">Opnieuw tekenen</button></div>
                )}
              </div>
              
              {meta.supabaseId ? (
                  <div className="bg-green-50 p-4 rounded border border-green-200 mb-6 w-full text-left">
                      <h3 className="font-bold text-green-800 mb-2 flex items-center gap-2"><CloudCheck size={20}/> Klaar met inspecteren?</h3>
                      <button onClick={handleFinalSync} disabled={isGenerating} className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-lg font-bold shadow flex items-center justify-center gap-3 text-lg disabled:bg-gray-400">
                          {isGenerating ? <RefreshCw className="animate-spin" size={24} /> : (meta.isContributionMode ? 'Bijdrage Uploaden' : 'Inleveren bij Kantoor')}
                      </button>
                  </div>
              ) : (
                  <div className="bg-blue-50 p-4 rounded border border-blue-200 mb-6 w-full text-left">
                      <h3 className="font-bold text-blue-800 mb-2 flex items-center gap-2"><Upload size={20}/> Cloud Koppeling</h3>
                      <p className="text-sm text-blue-600 mb-3">Nog niet in het online dashboard.</p>
                      <button onClick={handleUploadAsNew} disabled={isGenerating} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-lg font-bold shadow flex items-center justify-center gap-3 text-lg">{isGenerating ? 'Bezig...' : (meta.isContributionMode ? 'Bijdrage Uploaden' : 'Uploaden als Nieuwe Opdracht')}</button>
                  </div>
              )}

              {!meta.isContributionMode && (
                <button onClick={handleCloudMerge} className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded font-bold shadow flex items-center justify-center gap-2 text-sm w-full mb-6"><CloudDownload size={16} /> Zoek Cloud Bijdragen</button>
              )}

              <div className="bg-orange-50 p-4 rounded border border-orange-200 mb-6 text-left">
                  <h3 className="font-bold text-orange-800 mb-3 flex items-center gap-2 uppercase text-sm"><Download size={18}/> Data & Backup</h3>
                  <div className="grid grid-cols-2 gap-4">
                      <button onClick={handleBackupDownload} className="bg-orange-600 hover:bg-orange-700 text-white py-3 rounded font-bold shadow flex items-center justify-center gap-2 text-sm"><Download size={16} /> Backup Opslaan</button>
                      <button onClick={handleMergeClick} className="bg-purple-600 hover:bg-purple-700 text-white py-3 rounded font-bold shadow flex items-center justify-center gap-2 text-sm"><PlusCircle size={16} /> Samenvoegen (Lokaal)</button>
                  </div>
                  <input type="file" ref={mergeInputRef} onChange={handleMergeFile} accept=".json,application/json" className="hidden" />
              </div>

              {!meta.isContributionMode && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    <button onClick={handleShareFindings} className="bg-purple-600 text-white px-6 py-4 rounded-lg font-bold shadow hover:bg-purple-700 flex items-center justify-center gap-3"><Share2 size={20} /><span>Bevindingen Delen</span></button>
                    <button onClick={handleDownloadPDF} disabled={isGenerating || !meta.signatureUrl} className="bg-blue-600 text-white px-6 py-4 rounded-lg font-bold shadow hover:bg-blue-700 flex items-center justify-center gap-3 disabled:bg-gray-400">
                        {isGenerating ? <RefreshCw className="animate-spin" size={20} /> : <Download size={20} />}<span>Rapport (PDF)</span>
                    </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white border-t p-4 flex justify-between items-center sticky bottom-0 shadow-inner">
          <button onClick={goPrev} disabled={currentStepIndex === 0} className="flex items-center gap-2 px-4 py-2 rounded font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 disabled:opacity-30 transition-colors"><ChevronLeft size={18} /> Vorige</button>
          {currentStepIndex < STEPS.length - 1 ? (<button onClick={goNext} className="flex items-center gap-2 px-6 py-2 rounded font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm">Volgende <ChevronRight size={18} /></button>) : (<span className="text-sm font-bold text-emerald-700 flex items-center gap-2">Klaar om te exporteren</span>)}
        </div>
      </div>
      {/* MODAL: MIJN PROFIEL */}
        {showProfile && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                    <div className="p-4 border-b bg-emerald-50 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-emerald-800 flex items-center gap-2"><UserCircle size={20}/> Persoonlijke Instellingen</h2>
                        <button onClick={() => setShowProfile(false)} className="text-gray-400 hover:text-gray-600"><X size={24}/></button>
                    </div>
                    
                    <div className="flex border-b bg-gray-100 overflow-x-auto">
                        <button onClick={() => setProfileTab('persoonlijk')} className={`flex-1 px-2 whitespace-nowrap py-3.5 text-xs md:text-sm font-bold transition-colors ${profileTab === 'persoonlijk' ? 'bg-white text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}>Persoonlijk</button>
                        <button onClick={() => setProfileTab('bedrijf')} className={`flex-1 px-2 whitespace-nowrap py-3.5 text-xs md:text-sm font-bold transition-colors ${profileTab === 'bedrijf' ? 'bg-white text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}>Mijn Bedrijf</button>
                        <button onClick={() => setProfileTab('handtekening')} className={`flex-1 px-2 whitespace-nowrap py-3.5 text-xs md:text-sm font-bold transition-colors ${profileTab === 'handtekening' ? 'bg-white text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}>Handtekening</button>
                        <button onClick={() => setProfileTab('instrumenten')} className={`flex-1 px-2 whitespace-nowrap py-3.5 text-xs md:text-sm font-bold transition-colors ${profileTab === 'instrumenten' ? 'bg-white text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}>De Koffer</button>
                    </div>

                    <div className="p-4 md:p-6 overflow-y-auto flex-grow bg-white">
                        {profileTab === 'persoonlijk' && (
                            <div className="space-y-4">
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4 text-sm text-blue-800">Vul hier je gegevens in. We kunnen deze straks automatisch invullen bij elke nieuwe inspectie!</div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Volledige Naam</label>
                                        <input className="w-full border rounded p-3" value={userProfile.full_name || ''} onChange={e => setUserProfile({...userProfile, full_name: e.target.value})} placeholder="Bijv. Jan de Vries" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Inlog E-mailadres</label>
                                        <input className="w-full border rounded p-3 bg-gray-100 text-gray-500 cursor-not-allowed" value={loginEmail} readOnly title="Het inlog e-mailadres kan niet zelfstandig gewijzigd worden." />
                                    </div>
                                </div>
                                <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">SCIOS Registratienummer</label><input className="w-full border rounded p-3" value={userProfile.scios_nr || ''} onChange={e => setUserProfile({...userProfile, scios_nr: e.target.value})} placeholder="Bijv. R 12345" /></div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Telefoonnummer</label><input className="w-full border rounded p-3" value={userProfile.phone || ''} onChange={e => setUserProfile({...userProfile, phone: e.target.value})} placeholder="Bijv. 06 12345678" /></div>
                                    <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Contact E-mailadres</label><input className="w-full border rounded p-3" value={userProfile.contact_email || ''} onChange={e => setUserProfile({...userProfile, contact_email: e.target.value})} placeholder={loginEmail || "Bijv. info@bedrijf.nl"} title="Laat leeg om je inlog e-mailadres te gebruiken" /></div>
                                </div>
                                <div className="border-t pt-4 mt-2">
                                    <p className="text-xs font-bold text-gray-500 uppercase mb-3">Thuisadres <span className="text-gray-400 font-normal normal-case">(startpunt rijroute)</span></p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Straat + Huisnummer</label>
                                            <input className="w-full border rounded p-3" value={userProfile.home_address || ''} onChange={e => setUserProfile({...userProfile, home_address: e.target.value})} placeholder="Bijv. Dorpsstraat 12" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Postcode</label>
                                            <input className="w-full border rounded p-3" value={userProfile.home_postal_code || ''} onChange={e => setUserProfile({...userProfile, home_postal_code: e.target.value})} placeholder="Bijv. 1234 AB" />
                                        </div>
                                    </div>
                                    <div className="mt-3">
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Woonplaats</label>
                                        <div className="relative">
                                            <input className="w-full border rounded p-3 pr-10" value={userProfile.home_city || ''} onChange={e => setUserProfile({...userProfile, home_city: e.target.value})} placeholder="Bijv. Amsterdam" />
                                            <button title="Woonplaats opzoeken via postcode (PDOK)" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600"
                                                onClick={async () => {
                                                    const r = await lookupAddressBAG(userProfile.home_postal_code || '', userProfile.home_address || '');
                                                    if (r) setUserProfile({ ...userProfile, home_city: r.city });
                                                    else alert('Adres niet gevonden. Controleer postcode en huisnummer.');
                                                }}>
                                                <MapPin size={16}/>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}                        {profileTab === 'bedrijf' && (
                            <div className="space-y-4">
                                {/* Google Places zoeking */}
                                <div className="relative">
                                  <div className="flex gap-1.5">
                                    <input type="text" placeholder="Zoek bedrijf..." className="flex-1 border rounded p-2.5 text-sm"
                                      value={placesQuery} onChange={e => setPlacesQuery(e.target.value)}
                                      onKeyDown={e => e.key === 'Enter' && searchPlaces(placesQuery)} />
                                    <button onClick={() => searchPlaces(placesQuery)} disabled={isSearchingPlaces}
                                      className="px-3 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 disabled:opacity-50 shrink-0">
                                      {isSearchingPlaces ? <RefreshCw size={16} className="animate-spin"/> : <Search size={16}/>}
                                    </button>
                                  </div>
                                  {placesResults.length > 0 && (
                                    <div className="absolute z-50 left-0 right-0 top-full mt-0.5 bg-white border rounded shadow-lg max-h-48 overflow-y-auto">
                                      {placesResults.map((p, i) => {
                                        const parsed = parsePlaceResult(p);
                                        return (
                                          <button key={i} className="w-full text-left px-3 py-2 hover:bg-blue-50 text-sm border-b last:border-0"
                                            onClick={() => {
                                              setUserProfile({ ...userProfile, company_name: parsed.name, company_address: parsed.address, company_postal_code: parsed.postalCode, company_city: parsed.city, company_phone: parsed.phone });
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
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Bedrijfsnaam</label>
                                    <ClearableInput
                                        list="profile-companies-list"
                                        className="w-full border rounded p-3 font-bold"
                                        value={userProfile.company_name}
                                        placeholder="Kies of typ een nieuw bedrijf..."
                                        onChange={(e: any) => {
                                            const val = e.target.value;
                                            const match = dbCompanies.find(c => c.label === val);
                                            if (match?.data) {
                                                setUserProfile({
                                                    ...userProfile,
                                                    company_name: val,
                                                    company_address: match.data.address || '',
                                                    company_postal_code: match.data.postalCode || '',
                                                    company_city: match.data.city || '',
                                                    company_phone: match.data.phone || '',
                                                    company_email: match.data.email || '',
                                                });
                                            } else {
                                                setUserProfile({...userProfile, company_name: val});
                                            }
                                        }}
                                    />
                                    <datalist id="profile-companies-list">
                                        {dbCompanies.map((c, i) => <option key={i} value={c.label} />)}
                                    </datalist>
                                </div>
                                <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Adres</label><input className="w-full border rounded p-3" value={userProfile.company_address} onChange={e => setUserProfile({...userProfile, company_address: e.target.value})} /></div>
                                <div className="flex gap-3">
                                  <div className="w-1/3"><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Postcode</label><input className="w-full border rounded p-3" value={userProfile.company_postal_code} onChange={e => setUserProfile({...userProfile, company_postal_code: e.target.value})} /></div>
                                  <div className="w-2/3"><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Plaats</label>
                                    <div className="relative">
                                      <input className="w-full border rounded p-3 pr-10" value={userProfile.company_city} onChange={e => setUserProfile({...userProfile, company_city: e.target.value})} />
                                      <button title="Adres opzoeken via postcode (PDOK)" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600"
                                        onClick={async () => {
                                          const r = await lookupAddressBAG(userProfile.company_postal_code || '', userProfile.company_address || '');
                                          if (r) setUserProfile({ ...userProfile, company_city: r.city });
                                          else alert('Adres niet gevonden. Controleer postcode en huisnummer.');
                                        }}>
                                        <MapPin size={16}/>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Telefoon</label><input className="w-full border rounded p-3" value={userProfile.company_phone} onChange={e => setUserProfile({...userProfile, company_phone: e.target.value})} /></div><div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">E-mail</label><input className="w-full border rounded p-3" value={userProfile.company_email} onChange={e => setUserProfile({...userProfile, company_email: e.target.value})} /></div></div>
                            </div>
                        )}
                        {profileTab === 'handtekening' && (
                            <div className="space-y-4 text-center">
                                <p className="text-sm text-gray-600 mb-4">Sla één keer je handtekening op, zodat je deze straks met één druk op de knop onder rapporten kunt plaatsen.</p>
                                {!userProfile.signature_url ? (
                                  <div className="border-2 border-dashed border-gray-300 rounded bg-gray-50 p-2 w-full">
                                    <SignatureCanvas ref={profileSigPad} canvasProps={{width: 340, height: 180, className: 'cursor-crosshair bg-white rounded shadow-inner border border-gray-100 w-full'}} />
                                    <div className="border-t flex justify-between p-2 gap-2 mt-2">
                                      <button onClick={clearProfileSignature} className="text-sm text-red-500 font-bold px-4 py-2.5 border border-red-200 rounded-lg hover:bg-red-50">Wissen</button>
                                      <button onClick={saveProfileSignature} className="text-sm bg-emerald-600 text-white px-4 py-2.5 rounded-lg font-bold hover:bg-emerald-700 shadow-sm">Bevestig Handtekening</button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex flex-col items-center gap-3"><img src={userProfile.signature_url} className="border-2 border-emerald-200 rounded-lg h-32 bg-white p-2 shadow-sm max-w-full" alt="Opgeslagen handtekening" /><button onClick={() => setUserProfile({...userProfile, signature_url: ''})} className="text-sm text-red-500 font-bold px-4 py-2.5 border border-red-200 rounded-lg hover:bg-red-50">Nieuwe handtekening tekenen</button></div>
                                )}
                            </div>
                        )}
                        {profileTab === 'instrumenten' && (() => {
                            const linkedSet = new Set((userProfile.linked_instruments ?? []).map(String));
                            const filteredInsts = allInstruments.filter(i =>
                                kofferSearch === '' ||
                                i.name.toLowerCase().includes(kofferSearch.toLowerCase()) ||
                                i.serialNumber.toLowerCase().includes(kofferSearch.toLowerCase())
                            );
                            const sortedInsts = [...filteredInsts].sort((a, b) => {
                                const aL = linkedSet.has(a.id), bL = linkedSet.has(b.id);
                                if (aL !== bL) return aL ? -1 : 1;
                                return a.name.localeCompare(b.name, 'nl');
                            });
                            return (
                            <div className="space-y-3">
                                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-sm text-blue-800">
                                    Vink instrumenten aan om ze aan je koffer toe te voegen. Gekoppelde instrumenten (⭐) staan bovenaan in je keuzelijst tijdens een inspectie.
                                </div>

                                {/* Zoekbalk */}
                                <input type="text" className="w-full border rounded p-2.5 text-sm" placeholder="Zoek op naam of serienummer..." value={kofferSearch} onChange={e => setKofferSearch(e.target.value)} />

                                {/* Nieuw instrument aanmaken */}
                                <div>
                                    <button onClick={() => { setShowKofferNewForm(f => !f); setNewProfInst({ name: '', serialNumber: '', calibrationDate: '' }); }} className="text-sm text-blue-600 font-bold underline hover:text-blue-800">
                                        {showKofferNewForm ? '▲ Annuleren' : '+ Nieuw instrument aanmaken in database'}
                                    </button>
                                    {showKofferNewForm && (
                                        <div className="mt-2 p-3 border rounded bg-gray-50 animate-fadeIn">
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
                                                <input className="border p-2 rounded text-sm w-full md:col-span-1" placeholder="Naam" value={newProfInst.name} onChange={e => setNewProfInst({...newProfInst, name: e.target.value})} />
                                                <input className="border p-2 rounded text-sm w-full md:col-span-1" placeholder="Serienummer" value={newProfInst.serialNumber} onChange={e => setNewProfInst({...newProfInst, serialNumber: e.target.value})} />
                                                <div className="flex gap-1 w-full md:col-span-2">
                                                    <input className="border p-2 rounded text-sm bg-white flex-grow min-w-0" type={(newProfInst.calibrationDate === 'Indicatief' || newProfInst.calibrationDate === 'n.v.t.') ? 'text' : 'date'} placeholder="Kalibratie-/ controledatum" value={newProfInst.calibrationDate} max="2100-12-31" onChange={e => { const v = e.target.value; if (v.length <= 10) setNewProfInst({...newProfInst, calibrationDate: v}); }} onBlur={e => { if (e.target.value.startsWith('000')) setNewProfInst({...newProfInst, calibrationDate: ''}); }} disabled={newProfInst.calibrationDate === 'Indicatief' || newProfInst.calibrationDate === 'n.v.t.'} />
                                                    <select className="border p-2 rounded text-sm bg-white cursor-pointer shrink-0" onChange={e => { if (e.target.value === 'date') setNewProfInst({...newProfInst, calibrationDate: ''}); else setNewProfInst({...newProfInst, calibrationDate: e.target.value}); }} value={(newProfInst.calibrationDate === 'Indicatief' || newProfInst.calibrationDate === 'n.v.t.') ? newProfInst.calibrationDate : 'date'}>
                                                        <option value="date">Datum</option>
                                                        <option value="Indicatief">Indicatief</option>
                                                        <option value="n.v.t.">n.v.t.</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <button onClick={async () => {
                                                if (!newProfInst.name.trim()) return;
                                                const dup = allInstruments.find(i => i.name.trim().toLowerCase() === newProfInst.name.trim().toLowerCase() && i.serialNumber.trim().toLowerCase() === newProfInst.serialNumber.trim().toLowerCase());
                                                if (dup) { alert(`"${dup.name} (SN: ${dup.serialNumber})" bestaat al. Vink het aan in de lijst.`); return; }
                                                const { data: ins, error } = await supabase.from('form_options').insert({ category: 'instrument', label: newProfInst.name.trim(), data: { serialNumber: newProfInst.serialNumber.trim(), calibrationDate: newProfInst.calibrationDate || 'n.v.t.' } }).select().single();
                                                if (error) { alert('Fout: ' + error.message); return; }
                                                setDbInstruments((prev: any[]) => [...prev, ins]);
                                                await linkInstrument(ins.id);
                                                setShowKofferNewForm(false);
                                                setNewProfInst({ name: '', serialNumber: '', calibrationDate: '' });
                                            }} className="w-full bg-emerald-600 text-white py-2 rounded text-sm font-bold hover:bg-emerald-700">Aanmaken &amp; toevoegen aan koffer</button>
                                        </div>
                                    )}
                                </div>

                                {/* Instrumentenlijst */}
                                <div className="space-y-1 max-h-[50vh] overflow-y-auto pr-1">
                                    {sortedInsts.length === 0 && <p className="text-sm text-gray-400 italic text-center py-6">Geen instrumenten gevonden.</p>}
                                    {sortedInsts.map(inst => {
                                        const isLinked = linkedSet.has(inst.id);
                                        const status = getCalibrationStatus(inst.calibrationDate);
                                        const isEditingThis = editingKofferInstId === inst.id;
                                        return (
                                            <div key={inst.id} className={`rounded border p-3 transition-colors ${isLinked ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-gray-200'} ${status === 'expired' ? 'border-red-300' : ''}`}>
                                                {isEditingThis ? (
                                                    <div className="space-y-2">
                                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                                                            <input className="border p-2 rounded text-sm w-full md:col-span-1" value={kofferEditFields.name} onChange={e => setKofferEditFields(f => ({...f, name: e.target.value}))} placeholder="Naam" />
                                                            <input className="border p-2 rounded text-sm w-full md:col-span-1" value={kofferEditFields.serialNumber} onChange={e => setKofferEditFields(f => ({...f, serialNumber: e.target.value}))} placeholder="Serienummer" />
                                                            <div className="flex gap-1 w-full md:col-span-2">
                                                                <input className="border p-2 rounded text-sm bg-white flex-grow min-w-0" type={(kofferEditFields.calibrationDate === 'Indicatief' || kofferEditFields.calibrationDate === 'n.v.t.') ? 'text' : 'date'} value={kofferEditFields.calibrationDate} max="2100-12-31" onChange={e => { const v = e.target.value; if (v.length <= 10) setKofferEditFields(f => ({...f, calibrationDate: v})); }} onBlur={e => { if (e.target.value.startsWith('000')) setKofferEditFields(f => ({...f, calibrationDate: ''})); }} disabled={kofferEditFields.calibrationDate === 'Indicatief' || kofferEditFields.calibrationDate === 'n.v.t.'} />
                                                                <select className="border p-2 rounded text-sm bg-white cursor-pointer shrink-0" onChange={e => { if (e.target.value === 'date') setKofferEditFields(f => ({...f, calibrationDate: ''})); else setKofferEditFields(f => ({...f, calibrationDate: e.target.value})); }} value={(kofferEditFields.calibrationDate === 'Indicatief' || kofferEditFields.calibrationDate === 'n.v.t.') ? kofferEditFields.calibrationDate : 'date'}>
                                                                    <option value="date">Datum</option>
                                                                    <option value="Indicatief">Indicatief</option>
                                                                    <option value="n.v.t.">n.v.t.</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button onClick={() => setEditingKofferInstId(null)} className="flex-1 bg-gray-200 text-gray-700 py-1.5 rounded text-xs font-bold">Annuleren</button>
                                                            <button onClick={async () => { await updateInstrumentInDb(Number(inst.id), kofferEditFields); setEditingKofferInstId(null); }} className="flex-[2] bg-blue-600 text-white py-1.5 rounded text-xs font-bold hover:bg-blue-700">Wijziging opslaan (gedeeld)</button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-3">
                                                        <input type="checkbox" checked={isLinked} onChange={() => isLinked ? unlinkInstrument(Number(inst.id)) : linkInstrument(Number(inst.id))} className="h-5 w-5 text-emerald-600 rounded cursor-pointer shrink-0" />
                                                        <div className="flex-1 min-w-0">
                                                            <div className="font-bold text-sm text-gray-800 flex items-center gap-1">
                                                                {isLinked && <span className="text-emerald-500">⭐</span>}
                                                                {inst.name}
                                                            </div>
                                                            <div className="text-xs text-gray-500">SN: {inst.serialNumber || 'Onbekend'} | Kalibratie: <span className={status === 'expired' ? 'text-red-600 font-bold' : status === 'warning' ? 'text-orange-500 font-bold' : ''}>{inst.calibrationDate || 'Onbekend'}</span></div>
                                                        </div>
                                                        {isLinked && (
                                                            <button onClick={() => { setEditingKofferInstId(inst.id); setKofferEditFields({ name: inst.name, serialNumber: inst.serialNumber, calibrationDate: inst.calibrationDate }); }} className="text-blue-400 hover:text-blue-600 p-1.5 shrink-0" title="Bewerken (wijziging is gedeeld)"><Pencil size={16}/></button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            );
                        })()}
                    </div>
                    
                    <div className="p-4 border-t bg-gray-50 flex gap-3">
                        <button onClick={() => setShowProfile(false)} className="flex-1 bg-white border border-gray-300 text-gray-700 py-3 rounded font-bold hover:bg-gray-100 transition-colors">Sluiten</button>
                        <button onClick={handleSaveProfile} disabled={isGenerating} className="flex-1 bg-emerald-600 text-white py-3 rounded font-bold hover:bg-emerald-700 transition-colors flex justify-center items-center gap-2 shadow"><Save size={18}/> {isGenerating ? 'Opslaan...' : 'Profiel Opslaan in Cloud'}</button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
}