import React, { useState, useRef, useEffect } from 'react';
import { useInspectionStore } from './store';
import { DEFECT_LIBRARY, calculateSample, INSTRUMENTS, COMPANIES, INSPECTORS } from './constants';
import { pdf } from '@react-pdf/renderer';
import { PDFReport } from './components/PDFReport';
import { compressImage, uploadPhotoToCloud } from './utils';
import SignatureCanvas from 'react-signature-canvas';
import { Camera, Trash2, ChevronLeft, ChevronRight, PlusCircle, X, CheckSquare, Pencil, Upload, RotateCcw, Calendar, Download, Search, MapPin, FileText, RefreshCw, Share2, CloudDownload, Cloud, CloudCheck, ArrowUp, ArrowDown} from 'lucide-react';
import { UsageFunctions, Defect, Classification, LibraryDefect, Instrument, InspectionMeta, BoardMeasurement } from './types';
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

const parseCSV = (text: string): string[][] => {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentCell += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    }
    else if (char === ';' && !inQuotes) {
      currentRow.push(currentCell.trim());
      currentCell = '';
    }
    else if ((char === '\n' || (char === '\r' && nextChar === '\n')) && !inQuotes) {
      currentRow.push(currentCell.trim());
      if (currentRow.length > 1 || (currentRow.length === 1 && currentRow[0] !== '')) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentCell = '';
      if (char === '\r') i++;
    }
    else {
      if (char !== '\r') currentCell += char;
    }
  }
  if (currentCell || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    rows.push(currentRow);
  }
  return rows;
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

export default function InspectorApp() {
  const { 
    meta, defects, measurements, customInstruments, customLibrary, 
    setMeta, setUsageFunction, setMeasurements, addDefect, updateDefect, 
    removeDefect, addInstrument, removeInstrument, addCustomInstrument, 
    importState, mergeState, resetState, setCustomLibrary,
    addBoard, updateBoard, removeBoard
  } = useInspectionStore();

  const [activeTab, setActiveTab] = useState<typeof STEPS[number]>('setup');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [dbInspectors, setDbInspectors] = useState<any[]>([]);
  const [dbCompanies, setDbCompanies] = useState<any[]>([]);
  const [dbInstruments, setDbInstruments] = useState<any[]>([]);

  const ACTIVE_LIBRARY = customLibrary && customLibrary.length > 0 ? customLibrary : DEFECT_LIBRARY;

  const mappedDbInstruments: Instrument[] = dbInstruments.map(item => ({
      id: `db_${item.id}`,
      name: item.label,
      serialNumber: item.data?.serialNumber || 'Onbekend',
      calibrationDate: item.data?.calibrationDate || 'Onbekend'
  }));
  
  const ALL_INSTRUMENTS_OPTIONS = [...mappedDbInstruments, ...INSTRUMENTS, ...customInstruments];

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
  const [customAction, setCustomAction] = useState('');

  const [showNewInstrumentForm, setShowNewInstrumentForm] = useState(false);
  const [newInstName, setNewInstName] = useState('');
  const [newInstSn, setNewInstSn] = useState('');
  const [newInstDate, setNewInstDate] = useState('');
  const [isSearchingBag, setIsSearchingBag] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const sigPad = useRef<SignatureCanvas>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const mergeInputRef = useRef<HTMLInputElement>(null);

  const currentStepIndex = STEPS.indexOf(activeTab);

  useEffect(() => {
      const fetchOptions = async () => {
          const { data } = await supabase.from('form_options').select('*');
          if (data) {
              setDbInspectors(data.filter(x => x.category === 'inspector'));
              setDbCompanies(data.filter(x => x.category === 'iv_company'));
              setDbInstruments(data.filter(x => x.category === 'instrument'));
          }
      };
      fetchOptions();
  }, []);

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
    const finalReportData = { meta, measurements, customInstruments, defects };

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
    
    // We gebruiken hier expliciet 'finalInspectorName' om zeker te zijn dat de update mee gaat
    const reportData = { 
        meta: { ...meta, inspectorName: finalInspectorName }, 
        measurements, 
        defects, 
        customInstruments 
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
        
        if (isContrib) {
            alert(`✅ Bijdrage verzonden!\nJe unieke nummer is: ${data.inspection_number}`);
        } else {
            alert(`✅ Opgeslagen in de cloud.\nProject nummer: ${data.inspection_number}`);
        }
    }
  };

  const handleCsvImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const rows = parseCSV(text);
      const newLib: LibraryDefect[] = [];
      let idCounter = 1;
      for (let i = 1; i < rows.length; i++) {
        const cols = rows[i];
        if (cols.length >= 4) { 
            const cl = (cols[4] || 'Yellow') as Classification; 
            newLib.push({ 
              id: `cust_${idCounter++}`, 
              category: cols[0], 
              subcategory: cols[1] || 'Algemeen', 
              shortName: cols[2] || cols[3].substring(0, 20) + '...', 
              description: cols[3], 
              classification: ['Red', 'Orange', 'Yellow', 'Blue', 'Amber'].includes(cl) ? cl : 'Yellow', 
              action: cols[5] || 'Herstellen' 
            });
        }
      }
      if (newLib.length > 0) { setCustomLibrary(newLib); alert(`Succes! ${newLib.length} items geïmporteerd.`); }
    };
    reader.readAsText(file);
  };

  const resetLibrary = () => { if (window.confirm("Standaard bibliotheek herstellen?")) setCustomLibrary(null); };
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
    if (val === 'CUSTOM') { setIsCustomDefect(true); setSelectedLibId(''); setStaticDescription(''); setCustomComment(''); setCustomAction(''); setCustomClassification('Yellow'); } 
    else { 
      setIsCustomDefect(false); setSelectedLibId(val); 
      const libItem = ACTIVE_LIBRARY.find(d => d.id === val); 
      if (libItem) { setStaticDescription(libItem.description); setCustomClassification(libItem.classification); setCustomAction(libItem.action); } 
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
      setCustomAction(libItem.action); setCustomComment(d.description.replace(libItem.description, '').trim()); 
    } else { 
      setIsCustomDefect(true); setSelectedMainCategory(''); setSelectedSubCategory(''); 
      setStaticDescription(''); setCustomComment(d.description); setCustomClassification(d.classification); setCustomAction(d.action); 
    } 
    setEditingId(d.id); window.scrollTo({ top: 0, behavior: 'smooth' }); 
  };

  const handleSaveDefect = () => {
    if (!location) return;
    let finalDescription = '', finalClassification: Classification = 'Yellow', finalAction = '', finalLibId: string | undefined = undefined;

    if (isCustomDefect) {
      finalDescription = customComment; finalClassification = customClassification; finalAction = customAction;
    } else {
      const libItem = ACTIVE_LIBRARY.find(d => d.id === selectedLibId);
      if (!libItem) return;
      finalDescription = customComment ? `${libItem.description}\n\n${customComment}` : libItem.description;
      finalClassification = libItem.classification; finalAction = libItem.action; finalLibId = libItem.id;
    }

    const defectData: Defect = {
      id: editingId || generateId(), libraryId: finalLibId, location, description: finalDescription,
      classification: finalClassification, action: finalAction, photoUrl: defectPhoto1 || undefined,
      photoUrl2: defectPhoto2 || undefined, category: selectedMainCategory || undefined, subcategory: selectedSubCategory || undefined
    };

    if (editingId) { updateDefect(editingId, defectData); setEditingId(null); } 
    else { addDefect(defectData); }

    setLocation(''); setCustomComment(''); setStaticDescription(''); setSelectedMainCategory('');
    setSelectedSubCategory(''); setSelectedLibId(''); setDefectPhoto1(null); setDefectPhoto2(null);
    setIsCustomDefect(false); setCustomAction(''); setCustomClassification('Yellow');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
    const data = JSON.stringify({ meta, measurements, defects, customInstruments }, null, 2); 
    const blob = new Blob([data], { type: 'application/json' }); 
    const url = URL.createObjectURL(blob); 
    const a = document.createElement('a'); a.href = url; 
    a.download = `${meta.clientName || 'Inspectie'}_Backup.json`; 
    a.click(); URL.revokeObjectURL(url); 
  };

  const handleShareFindings = async () => { 
    const data = JSON.stringify({ meta, measurements, defects, customInstruments }, null, 2); 
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
      const jsonData = JSON.stringify({ meta, measurements, defects, customInstruments }, null, 2); 
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
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-[10px] bg-emerald-800/50 px-2 py-1 rounded text-emerald-100 animate-pulse"><RefreshCw size={10} /> Autosave aan</div>
                <div className="text-xs font-mono bg-emerald-900/50 px-3 py-1 rounded">{meta.date}</div>
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
                 <div className="grid grid-cols-1 gap-3">
                   <input className="border rounded p-2" placeholder="Naam" value={meta.clientName} onChange={(e) => setMeta({ clientName: e.target.value })} />
                   <input className="border rounded p-2" placeholder="Adres" value={meta.clientAddress} onChange={(e) => setMeta({ clientAddress: e.target.value })} />
                   <div className="flex gap-2"><input className="border rounded p-2 w-1/3" placeholder="Postcode" value={meta.clientPostalCode} onChange={(e) => setMeta({ clientPostalCode: e.target.value })} /><input className="border rounded p-2 w-2/3" placeholder="Plaats" value={meta.clientCity} onChange={(e) => setMeta({ clientCity: e.target.value })} /></div>
                   <input className="border rounded p-2" placeholder="Contactpersoon" value={meta.clientContactPerson} onChange={(e) => setMeta({ clientContactPerson: e.target.value })} />
                   <input className="border rounded p-2" placeholder="Telefoon" value={meta.clientPhone} onChange={(e) => setMeta({ clientPhone: e.target.value })} />
                   <input className="border rounded p-2" placeholder="Email" value={meta.clientEmail} onChange={(e) => setMeta({ clientEmail: e.target.value })} />
                 </div>
               </div>
               
               <div className={`bg-gray-50 p-4 rounded border ${meta.isContributionMode ? 'opacity-70 pointer-events-none' : ''}`}>
                   <h2 className="text-sm font-bold text-emerald-700 uppercase border-b border-emerald-200 pb-2 mb-3">Projectgegevens</h2>
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
                                   const dbMatch = dbInspectors.find(i => i.label === val);
                                   if(dbMatch && dbMatch.data?.sciosNr) {
                                       setMeta({ inspectorName: val, sciosRegistrationNumber: dbMatch.data.sciosNr });
                                       return;
                                   }
                                   const i = INSPECTORS.find(x => x.name === val);
                                   if (i) setMeta({ inspectorName: i.name, sciosRegistrationNumber: i.sciosNr });
                               }} 
                           />
                           <datalist id="inspectors-list">
                               {[...dbInspectors.map(i => i.label), ...INSPECTORS.map(i => i.name)].map((name, i) => <option key={i} value={name} />)}
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
                    <select className="border rounded p-2 w-full bg-white" onChange={(e) => { const inst = ALL_INSTRUMENTS_OPTIONS.find(i => i.id === e.target.value); if (inst) { addInstrument(inst); e.target.value = ""; } }} defaultValue="">
                        <option value="" disabled>-- Selecteer Meetinstrument --</option>
                        {ALL_INSTRUMENTS_OPTIONS.map(i => (<option key={i.id} value={i.id}>{i.name} {i.serialNumber !== 'Onbekend' ? `(SN: ${i.serialNumber})` : ''}</option>))}
                    </select>
                    <button onClick={() => setShowNewInstrumentForm(true)} className="bg-blue-600 text-white p-2 rounded whitespace-nowrap flex items-center gap-1 text-sm font-bold"><PlusCircle size={16} /> Nieuw</button>
                </div>
            {showNewInstrumentForm && (
                    <div className="bg-white p-3 rounded border border-blue-200 mb-3">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                            <input 
                                className="border p-1 rounded text-sm" 
                                placeholder="Naam" 
                                value={newInstName} 
                                onChange={e => setNewInstName(e.target.value)} 
                            />
                            <input 
                                className="border p-1 rounded text-sm" 
                                placeholder="Serienummer" 
                                value={newInstSn} 
                                onChange={e => setNewInstSn(e.target.value)} 
                            />
                            <input 
                                className="border p-1 rounded text-sm" 
                                placeholder="Datum" 
                                value={newInstDate} 
                                onChange={e => setNewInstDate(e.target.value)} 
                            />
                        </div>
                        <button 
                            onClick={() => { 
                                if (!newInstName) return; 
                                const newInst = { 
                                    id: generateId(), 
                                    name: newInstName, 
                                    serialNumber: newInstSn || 'N.v.t.', 
                                    calibrationDate: newInstDate || 'N.v.t.' 
                                }; 
                                addCustomInstrument(newInst); 
                                addInstrument(newInst); 
                                setNewInstName(''); 
                                setNewInstSn(''); 
                                setNewInstDate(''); 
                                setShowNewInstrumentForm(false); 
                            }} 
                            className="bg-green-600 text-white px-3 py-1 rounded text-xs font-bold w-full"
                        >
                            Toevoegen en Opslaan
                        </button>
                    </div>
                )}

                <div className="space-y-1">
                    {measurements.selectedInstruments.map(inst => (
                    <div key={inst.id} className="flex justify-between items-center bg-white p-2 rounded border border-blue-200 shadow-sm">
                        <div className="flex items-center gap-2"><CheckSquare size={16} className="text-emerald-600" /><div><div className="font-bold text-sm">{inst.name}</div><div className="text-xs text-gray-500">Sn: {inst.serialNumber}</div></div></div>
                        <button onClick={() => removeInstrument(inst.id)} className="text-red-400"><X size={18} /></button>
                    </div>))}
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
                        <div><label className="text-[10px] font-bold text-gray-400 uppercase block">Temp (°C)</label><input type="number" className="w-full border rounded p-2 text-sm bg-gray-50" value={board.switchboardTemp} onChange={(e) => updateBoard(board.id, { ...board, switchboardTemp: e.target.value })} /></div>
                        <div><label className="text-[10px] font-bold text-gray-400 uppercase block">Riso (MΩ)</label><input type="number" className="w-full border rounded p-2 text-sm bg-gray-50" value={board.insulationResistance} onChange={(e) => updateBoard(board.id, { ...board, insulationResistance: e.target.value })} /></div>
                        <div><label className="text-[10px] font-bold text-gray-400 uppercase block">Zi (Ω)</label><input type="number" step="0.01" className="w-full border rounded p-2 text-sm bg-gray-50" value={board.impedance} onChange={(e) => updateBoard(board.id, { ...board, impedance: e.target.value })} /></div>
                        </div>
                    </div>
                    </div>
                ))}
                </div>
            </div>
            )}

          {activeTab === 'inspect' && (
            <div className="space-y-6">
              <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
                 <h2 className="text-sm font-bold text-yellow-800 uppercase border-b border-yellow-300 pb-2 mb-3 flex items-center gap-2"><FileText size={16}/> Bibliotheek Beheer</h2>
                 <div className="flex gap-2 items-center">
                    <button onClick={() => csvInputRef.current?.click()} className="bg-yellow-600 text-white px-3 py-2 rounded text-xs font-bold hover:bg-yellow-700 flex items-center gap-2"><Upload size={14}/> CSV Importeren</button>
                    <input type="file" ref={csvInputRef} onChange={handleCsvImport} accept=".csv" className="hidden" />
                    {customLibrary && (<button onClick={resetLibrary} className="text-red-500 text-xs font-bold underline hover:text-red-700 flex items-center gap-1"><RefreshCw size={12}/> Herstel Standaard</button>)}
                 </div>
               </div>

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

              <div className="space-y-3">
                {defects.map(d => (
                  <div key={d.id} className="bg-white border-l-4 shadow-sm p-4 rounded flex justify-between items-start group" style={{ borderColor: d.classification === 'Red' ? '#ef4444' : '#facc15' }}>
                    <div>
                        <div className="font-bold text-gray-800">{d.location}</div>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap">{d.description}</p>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100">
                      <button onClick={() => handleStartEdit(d)} className="p-2 text-gray-400 hover:text-blue-600"><Pencil size={18} /></button>
                      <button onClick={() => removeDefect(d.id)} className="p-2 text-gray-400 hover:text-red-600"><Trash2 size={18} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'report' && (
            <div className="text-center py-6 space-y-6">
              <div className="bg-indigo-50 p-4 rounded border border-indigo-100 text-left">
                <h3 className="font-bold text-indigo-800 border-b border-indigo-200 pb-2 mb-3 flex items-center gap-2"><Calendar size={18}/> Advies Inspectiefrequentie</h3>
                <div className="space-y-4">
                  <div><label className="block text-sm font-bold text-gray-700 mb-1">Interval:</label><div className="flex gap-4"><label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="interval" checked={meta.inspectionInterval === 3} onChange={() => setMeta({ inspectionInterval: 3 })} /> 3 Jaar</label><label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="interval" checked={meta.inspectionInterval === 5} onChange={() => setMeta({ inspectionInterval: 5 })} /> 5 Jaar</label></div></div>
                  <div className="bg-white p-2 rounded border"><span className="text-xs text-gray-500 block">Volgende inspectie uiterlijk:</span><span className="font-bold text-indigo-600">{meta.nextInspectionDate}</span></div>
                </div>
              </div>
              
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
                      <button onClick={handleUploadAsNew} disabled={isGenerating} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-lg font-bold shadow flex items-center justify-center gap-3 text-lg">{isGenerating ? 'Bezig...' : 'Uploaden als Nieuwe Opdracht'}</button>
                  </div>
              )}

              <div className="bg-orange-50 p-4 rounded border border-orange-200 mb-6 text-left">
                  <h3 className="font-bold text-orange-800 mb-3 flex items-center gap-2 uppercase text-sm"><Download size={18}/> Data & Backup</h3>
                  <div className="grid grid-cols-2 gap-4">
                      <button onClick={handleBackupDownload} className="bg-orange-600 hover:bg-orange-700 text-white py-3 rounded font-bold shadow flex items-center justify-center gap-2 text-sm"><Download size={16} /> Backup Opslaan</button>
                      <button onClick={handleMergeClick} className="bg-purple-600 hover:bg-purple-700 text-white py-3 rounded font-bold shadow flex items-center justify-center gap-2 text-sm"><PlusCircle size={16} /> Samenvoegen (Lokaal)</button>
                  </div>
                  {!meta.isContributionMode && (
                    <button onClick={handleCloudMerge} className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded font-bold shadow flex items-center justify-center gap-2 text-sm w-full mt-2"><CloudDownload size={16} /> Zoek Cloud Bijdragen</button>
                  )}
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
    </div>
  );
}